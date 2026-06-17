-- =============================================================================
-- Pasar DANA — initial schema (Phase 0)
-- Maps directly to BUILD_PLAN.md §3 and PRD.md §5.5.
-- Idempotent: safe to re-run. Uses `create table if not exists` everywhere
-- and `create unique index if not exists` for the active-catatan invariant.
-- =============================================================================

begin;

-- gen_random_uuid() lives in pgcrypto on older Postgres; on Supabase 15+
-- it is also available via pgcrypto. Enable defensively.
create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- skus: long-lived catalog of commodities tracked by the app.
-- -----------------------------------------------------------------------------
create table if not exists skus (
  sku_id     text primary key,                       -- e.g. 'telur_ayam_ras'
  name_id    text not null,                          -- 'Telur Ayam Ras'
  unit       text not null,                          -- 'kg' | 'L' | 'butir' | 'ikat' | 'dus'
  category   text not null,                          -- 'protein' | 'karbohidrat' | 'minyak' | 'bumbu' | 'lainnya'
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- cities: 15-16 Tier 1/2 Indonesian cities, seeded via supabase/seed.sql.
-- -----------------------------------------------------------------------------
create table if not exists cities (
  city_id    text primary key,                       -- 'bekasi'
  name_id    text not null,                          -- 'Bekasi'
  pihps_code text not null,                          -- key used by PIHPS scraper
  active     boolean not null default true
);

-- -----------------------------------------------------------------------------
-- price_snapshots: APPEND-ONLY. One row per (sku, city, date). The scraper
-- relies on this — never UPDATE rows; use INSERT ... ON CONFLICT DO NOTHING.
-- -----------------------------------------------------------------------------
create table if not exists price_snapshots (
  sku_id        text not null references skus    (sku_id),
  city_id       text not null references cities  (city_id),
  snapshot_date date not null,
  price_idr     integer not null,
  source        text not null default 'pihps',
  scraped_at    timestamptz not null default now(),
  primary key (sku_id, city_id, snapshot_date)
);

-- Fast "latest price for sku in city" lookup (Beranda Top 6, addCatat, etc.).
create index if not exists price_snapshots_sku_city_date_desc_idx
  on price_snapshots (sku_id, city_id, snapshot_date desc);

-- -----------------------------------------------------------------------------
-- catatans: one active per user (enforced by partial unique index below).
-- -----------------------------------------------------------------------------
create table if not exists catatans (
  catatan_id  uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id),
  city_id     text not null references cities    (city_id),
  state       text not null check (state in ('active','archived','cancelled')),
  created_at  timestamptz not null default now(),
  archived_at timestamptz
);

-- Hard invariant: at most one active catatan per user.
create unique index if not exists one_active_catatan_per_user
  on catatans (user_id)
  where state = 'active';

-- -----------------------------------------------------------------------------
-- catatan_items: items inside a (typically active) catatan.
-- Cascades on catatan deletion (rare; states are archived/cancelled in practice).
-- -----------------------------------------------------------------------------
create table if not exists catatan_items (
  item_id          uuid primary key default gen_random_uuid(),
  catatan_id       uuid not null references catatans (catatan_id) on delete cascade,
  sku_id           text not null references skus     (sku_id),
  qty              numeric not null,
  price_at_add_idr integer not null,                 -- PIHPS price snapshotted at add-time
  added_at         timestamptz not null default now()
);

create index if not exists catatan_items_catatan_id_idx
  on catatan_items (catatan_id);

-- -----------------------------------------------------------------------------
-- riwayat_entries: archived shopping trips. Created when user taps
-- "Sudah belanja ini" — see PRD §5.6 confirm flow.
-- -----------------------------------------------------------------------------
create table if not exists riwayat_entries (
  riwayat_id          uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users (id),
  archived_catatan_id uuid references catatans (catatan_id),
  city_id             text not null references cities (city_id),
  pasar_label         text,
  confirmed_at        timestamptz not null default now()
);

-- History list query: "most recent first" per user.
create index if not exists riwayat_entries_user_confirmed_desc_idx
  on riwayat_entries (user_id, confirmed_at desc);

-- -----------------------------------------------------------------------------
-- riwayat_items: line items inside an archived shopping trip.
-- Cascades on riwayat deletion.
-- -----------------------------------------------------------------------------
create table if not exists riwayat_items (
  riwayat_item_id   uuid primary key default gen_random_uuid(),
  riwayat_id        uuid not null references riwayat_entries (riwayat_id) on delete cascade,
  sku_id            text not null references skus            (sku_id),
  qty               numeric not null,
  price_pihps_idr   integer not null,                -- PIHPS at confirm time
  price_actual_idr  integer                          -- nullable; user fills later
);

create index if not exists riwayat_items_riwayat_id_idx
  on riwayat_items (riwayat_id);

-- -----------------------------------------------------------------------------
-- ground_truth_prices: parallel data stream from user "harga aktual" entries.
-- Per PRD AD2, this is NOT merged with price_snapshots in Phase 1.
-- -----------------------------------------------------------------------------
create table if not exists ground_truth_prices (
  gt_id            uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id),
  sku_id           text not null references skus       (sku_id),
  city_id          text not null references cities     (city_id),
  pasar_label      text,
  price_actual_idr integer not null,
  recorded_at      timestamptz not null default now()
);

create index if not exists ground_truth_prices_sku_city_recorded_desc_idx
  on ground_truth_prices (sku_id, city_id, recorded_at desc);

commit;
