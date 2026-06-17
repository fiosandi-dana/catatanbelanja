# 🛠️ Pasar DANA — Build Plan (Phase 0 + Phase 1)

> Engineering-ready companion to `PRD.md`. Free-tier-only stack. Read `PRD.md` first for the *what* and *why*; this doc covers the *how* and *with what*.

---

## 1. Stack (all free tier)

| Concern | Service | Free limit | Notes |
|---|---|---|---|
| Frontend (Phase 0 / H5) | **Next.js 15 (App Router) on Vercel Hobby** | 100 GB bandwidth/mo | PWA-capable; same code reusable for landing page |
| Frontend (Phase 1 / DANA) | **DANA Mini Program** (AXML/ACSS/JS) | Hosted by DANA | Port the H5 screens to AXML once merchant onboarding clears |
| Database | **Supabase Postgres (Free)** | 500 MB DB, 50k MAU | RLS-per-user enforced for `catatan_items`, `riwayat_entries` |
| Auth | **Supabase Auth (Free)** | Included above | Phone OTP for Phase 0; replaced by `my.getAuthCode` inside DANA |
| Backend / RPC | **Supabase Edge Functions** | 500k invocations/mo | `addCatat`, `confirmBelanja`, `monthlyInsight` |
| Cron (PIHPS scrape) | **Supabase `pg_cron` → Edge Function** | No minute budget | `0 1 * * *` UTC = 08:00 WIB daily |
| Source / CI | **GitHub (Free)** + GH Actions for tests only | Unlimited public repos | Repo: `avelixio/catatanbelanja` |
| Analytics | **PostHog Cloud Free** | 1M events/mo | Events: `catat_added`, `belanja_confirmed`, `city_changed`, `insight_viewed` |
| Errors | **Sentry Free** | 5k errors/mo | Optional, defer until Phase 0.5 |

**Non-free items (be explicit):**
- DANA workspace registration likely requires a registered Indonesian PT/CV (one-time ~Rp 5–10jt) — blocker for Phase 1 deployment but not Phase 0.
- Custom `.id` domain (~Rp 150k/yr) — optional; Vercel subdomain works for Phase 0.

---

## 2. Phasing

### Phase 0 — H5 validation (no DANA dependency)
Build the catat-flow as a standalone PWA at `catatanbelanja.vercel.app`. Validates the product behavior and the data pipeline without waiting on DANA merchant onboarding.

Deliverables:
- Beranda · Catatan · Riwayat · Insight (4 surfaces from PRD §5.4)
- City picker (15 Tier 1/2 cities, no GPS — per AD6)
- Supabase schema (PRD §5.5 entity model)
- PIHPS daily scrape (pg_cron + Edge Function)
- Phone-OTP auth via Supabase

### Phase 1 — DANA Mini Program port
Same backend, frontend rewritten in AXML/ACSS/JS. Auth swapped to `my.getAuthCode`. Backend domain whitelisted in DANA portal.

Blocked by: DANA workspace approval (5-day SLA after PT/CV registration).

### Phase 1.5 / 2 / 3
Per PRD §6 and §7 — out of scope here.

---

## 3. Supabase schema (Phase 0)

Maps directly to PRD §5.5. Migrations live in `supabase/migrations/`.

```sql
-- skus: long-lived catalog
create table skus (
  sku_id text primary key,            -- e.g. 'telur_ayam_ras'
  name_id text not null,              -- 'Telur Ayam Ras'
  unit text not null,                 -- 'kg' | 'L' | 'butir' | 'ikat'
  category text not null,             -- 'protein' | 'karbohidrat' | ...
  active boolean not null default true,
  created_at timestamptz default now()
);

-- cities: 15 Tier 1/2 cities, seeded
create table cities (
  city_id text primary key,           -- 'bekasi'
  name_id text not null,              -- 'Bekasi'
  pihps_code text not null,           -- PIHPS scraper key
  active boolean not null default true
);

-- price_snapshots: append-only, one row per (sku, city, date)
create table price_snapshots (
  sku_id text references skus,
  city_id text references cities,
  snapshot_date date not null,
  price_idr integer not null,
  source text not null default 'pihps',
  scraped_at timestamptz default now(),
  primary key (sku_id, city_id, snapshot_date)
);

-- catatans: one active per user
create table catatans (
  catatan_id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  city_id text references cities not null,
  state text not null check (state in ('active','archived','cancelled')),
  created_at timestamptz default now(),
  archived_at timestamptz
);
create unique index one_active_catatan_per_user
  on catatans (user_id) where state = 'active';

-- catatan_items: items in a catatan
create table catatan_items (
  item_id uuid primary key default gen_random_uuid(),
  catatan_id uuid references catatans on delete cascade,
  sku_id text references skus,
  qty numeric not null,
  price_at_add_idr integer not null,  -- snapshotted PIHPS price
  added_at timestamptz default now()
);

-- riwayat_entries: archived shopping trips
create table riwayat_entries (
  riwayat_id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  archived_catatan_id uuid references catatans,
  city_id text references cities not null,
  pasar_label text,
  confirmed_at timestamptz default now()
);

create table riwayat_items (
  riwayat_item_id uuid primary key default gen_random_uuid(),
  riwayat_id uuid references riwayat_entries on delete cascade,
  sku_id text references skus,
  qty numeric not null,
  price_pihps_idr integer not null,   -- PIHPS at confirm time
  price_actual_idr integer            -- nullable; user fills later
);

-- ground-truth: parallel stream, NOT merged in Phase 1 (per AD2)
create table ground_truth_prices (
  gt_id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  sku_id text references skus,
  city_id text references cities,
  pasar_label text,
  price_actual_idr integer not null,
  recorded_at timestamptz default now()
);
```

Row-Level Security on every user-scoped table: `user_id = auth.uid()`.

---

## 4. PIHPS scraper (pg_cron + Edge Function)

Source: `https://www.bi.go.id/hargapangan/` (city-level averages, ~21 commodities). Phase 1 SKU registry = 21 PIHPS + 4 manually seeded (galon, gas LPG 3kg, Indomie, susu UHT).

**File: `supabase/functions/scrape-pihps/index.ts`**
- Iterates SKU registry × city registry
- HTTP GET PIHPS endpoint, parse response
- Upsert into `price_snapshots`
- On failure: log and exit non-zero (pg_cron retry via subsequent run; PRD failure mode "fall back to last successful snapshot" is handled at read-time on the frontend)

**Cron schedule (run from Supabase SQL editor once):**
```sql
select cron.schedule(
  'scrape-pihps-daily',
  '0 1 * * *',  -- 01:00 UTC = 08:00 WIB
  $$ select net.http_post(
       url := 'https://<project>.supabase.co/functions/v1/scrape-pihps',
       headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.cron_secret'))
     ); $$
);
```

`app.cron_secret` set via Supabase dashboard. Function logs viewable in Supabase Studio → Functions.

---

## 5. Frontend (Phase 0)

- Next.js 15 App Router, TypeScript, Tailwind CSS
- **Visual contract: `DESIGN_SYSTEM.md`** (DANA FIAT 2.5). Treat it as binding, not inspiration — blue header, gray `#F5F5F5` background, white rounded cards, chunky readable type, `#108EE9` for CTA. Tailwind theme tokens must be derived from FIAT 2.5 color/spacing tables.
- Supabase JS client (`@supabase/ssr` for server components, `@supabase/supabase-js` for client)
- State: server components for reads; server actions for `addCatat` / `confirmBelanja`
- Routes:
  - `/` → Beranda (Top 6 SKUs for selected city)
  - `/catatan` → active catatan
  - `/riwayat` → archived list
  - `/riwayat/[id]` → entry detail with `harga aktual` input
  - `/insight` → monthly card
- City picker: bottom-sheet modal on first launch + via `📍 Bekasi ▾` chip
- PWA manifest + service worker so it installs to home screen

---

## 6. DANA Mini Program port (Phase 1)

When merchant onboarding is sorted:
- Install Mini Program Studio + APMP CLI
- New project under `dana-mp/` folder in this repo
- Translate each Next.js route → page directory (`pages/beranda/`, `pages/catatan/`, etc.)
- Swap `supabase.auth.signInWithOtp` → `my.getAuthCode` + server-side `applyToken`
- Swap `fetch` → `my.request`
- **Whitelist `<project>.supabase.co` in Mini Program → Configuration → Server Domain Whitelist** (else error `J002`)
- Upload via APMP CLI → submit for review

---

## 7. Repo layout (planned)

```
/
├─ PRD.md                          # alignment doc (current)
├─ BUILD_PLAN.md                   # this file
├─ DESIGN_SYSTEM.md                # DANA FIAT 2.5 — visual contract for all UI work
├─ web/                            # Phase 0 Next.js app
│  ├─ app/
│  ├─ lib/supabase/
│  └─ package.json
├─ supabase/
│  ├─ migrations/                  # SQL schema
│  ├─ functions/
│  │  └─ scrape-pihps/
│  └─ seed.sql                     # cities + SKU registry
├─ dana-mp/                        # Phase 1 Mini Program (later)
└─ .github/workflows/              # tests only; cron lives in pg_cron
```

---

## 8. Open questions (need decisions before coding)

1. **PT/CV status** — does the user already have a registered Indonesian business entity? If not, Phase 1 deployment is blocked; Phase 0 still proceeds.
2. **Custom domain** — `catatanbelanja.id` or stay on `catatanbelanja.vercel.app` for Phase 0?
3. **Auth in Phase 0** — phone OTP (costs Supabase free SMS credits, ~30/mo) or magic link email (truly unlimited)?
4. **SKU registry seed** — confirm the 21 PIHPS commodities + 4 manual SKUs match what the user wants to ship with.
