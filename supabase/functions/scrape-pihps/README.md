# scrape-pihps

Daily Edge Function that scrapes Indonesian sembako prices from
`bi.go.id/hargapangan` and writes one row per `(sku, city, date)` into
`price_snapshots`. Triggered by `pg_cron` at `0 1 * * *` UTC (08:00 WIB).
See `supabase/migrations/0002_pihps_cron.sql`.

## Env vars (set in Supabase Dashboard → Functions → scrape-pihps → Secrets)

| Name | Purpose |
| --- | --- |
| `CRON_SECRET` | Bearer token required on every request. Generate via `openssl rand -hex 32`. |
| `SUPABASE_URL` | Auto-provided by Supabase. |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-provided. Never logged. |

After setting `CRON_SECRET` in the Functions panel, also mirror it into Postgres
so `pg_cron` can read it from `current_setting('app.cron_secret')`. See the
commented-out setup SQL at the bottom of `0002_pihps_cron.sql`.

## Local testing

```bash
# 1. Make sure supabase CLI is installed and you're logged in.
supabase functions serve scrape-pihps --env-file ./.env.local

# 2. .env.local should contain:
# CRON_SECRET=local-test-secret
# SUPABASE_URL=http://127.0.0.1:54321
# SUPABASE_SERVICE_ROLE_KEY=<local service role key from `supabase status`>

# 3. Trigger it:
curl -X POST http://127.0.0.1:54321/functions/v1/scrape-pihps \
  -H "Authorization: Bearer local-test-secret"
```

Expected 200 response:

```json
{ "ok": true, "snapshot_date": "2026-06-17", "scraped": 192,
  "skipped": 208, "failures": 0, "duration_ms": 4231 }
```

(Skipped is high because ~9 of our 25 SKUs are manually-seeded — not served
by PIHPS — plus any holiday no-data cities.)

## Type-check

```bash
cd supabase/functions/scrape-pihps
deno task check
```

## Backfill (one-shot, local)

`backfill.ts` populates historical `price_snapshots` for a date range. Use it
once at launch to seed pre-Phase-0 history, or after recovering from an outage.
It is a **local Deno script**, not an Edge Function — Supabase's 60s wall-time
cap can't fit ~2,688 PIHPS calls (168 days × 16 cities).

It reuses `pihps-client.ts` verbatim and shares the daily Function's idempotence
guarantee (`onConflict: sku_id,city_id,snapshot_date`, `ignoreDuplicates`). Dates
already populated are skipped, so re-running after Ctrl-C resumes seamlessly.

### Env

```bash
export SUPABASE_URL="https://<ref>.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"   # NOT the anon key
```

### Run

```bash
# Full launch backfill (Jan 1 → today):
deno run -A supabase/functions/scrape-pihps/backfill.ts \
  --from=2026-01-01 --to=2026-06-17

# Single-city repair or smoke test:
deno run -A supabase/functions/scrape-pihps/backfill.ts \
  --from=2026-06-15 --to=2026-06-17 --city=bekasi --dry-run
```

Flags: `--from`/`--to` (required ISO dates), `--city` (single city),
`--dry-run` (no writes), `--force` (re-process already-populated dates,
Supabase mode only), `--allow-old` (override the 365-day sanity check),
`--output=<path>.sql` (emit SQL `INSERT`s to file instead of writing to
Supabase; mutually exclusive with `--dry-run`).

### Scrape-now, push-later (no Supabase project yet)

If you want to backfill history *before* the Supabase project is provisioned,
use `--output` to dump idempotent `INSERT` statements to a `.sql` file. No env
vars required — the script reads SKUs/cities from a bundled fallback list.

```bash
# 1. Scrape now → write SQL file (no Supabase connection needed):
deno run -A supabase/functions/scrape-pihps/backfill.ts \
  --from=2026-01-01 --to=2026-06-17 --output=pihps-backfill.sql

# 2. Later, once Supabase is up and the schema is migrated:
psql "$DATABASE_URL" -f pihps-backfill.sql
```

Every `INSERT` ends with `ON CONFLICT (sku_id, city_id, snapshot_date) DO
NOTHING`, so re-applying the file is safe.

### Runtime estimate

168 days × 16 cities × ~250ms politeness sleep + grid fetch ≈ **11 minutes**
wall-time for the full 2026-01-01 → 2026-06-17 backfill. Weekends and libur
nasional return empty grids quickly and contribute mostly skip rows.

### Resume after interruption

Just re-run the same command. The script skips dates that already have rows in
`price_snapshots` (scoped to the cities in scope). Use `--force` only if you
need to re-fetch a date that was partially written.

## Refreshing city pihps_code values

PIHPS regency IDs are stable but not guaranteed. To re-discover them:

```bash
curl -s -H 'X-Requested-With: XMLHttpRequest' \
  -H 'Referer: https://www.bi.go.id/hargapangan/TabelHarga/PasarTradisionalDaerah' \
  'https://www.bi.go.id/hargapangan/WebSite/TabelHarga/GetRefRegency?price_type_id=1&ref_prov_id=12'
```

Then update `cities.pihps_code` (format `"<prov>:<reg>"`) in `supabase/seed.sql`.
