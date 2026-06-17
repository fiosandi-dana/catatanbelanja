-- =============================================================================
-- Pasar DANA — Row-Level Security (Phase 0)
-- Applies to all user-scoped tables. Public-read tables (skus, cities,
-- price_snapshots) stay open for SELECT; writes restricted to service_role.
--
-- Policy summary (one line each):
--   skus                    SELECT public        — catalog readable by anyone (anon/auth)
--   cities                  SELECT public        — catalog readable by anyone (anon/auth)
--   price_snapshots         SELECT public        — PIHPS prices readable by anyone (anon/auth)
--   catatans                SELECT/INSERT/UPDATE/DELETE  — owner only (user_id = auth.uid())
--   catatan_items           SELECT/INSERT/UPDATE/DELETE  — owner only, via parent catatan.user_id
--   riwayat_entries         SELECT/INSERT/UPDATE/DELETE  — owner only (user_id = auth.uid())
--   riwayat_items           SELECT/INSERT/UPDATE/DELETE  — owner only, via parent riwayat.user_id
--   ground_truth_prices     SELECT/INSERT/UPDATE/DELETE  — owner only (user_id = auth.uid())
--
-- Service role bypasses RLS automatically in Supabase (BYPASSRLS).
-- The PIHPS scraper writes price_snapshots using the service role key.
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- Public-read tables: enable RLS, then allow SELECT to anon + authenticated.
-- No INSERT/UPDATE/DELETE policies — only service_role (bypassing RLS) can write.
-- -----------------------------------------------------------------------------

alter table skus            enable row level security;
alter table cities          enable row level security;
alter table price_snapshots enable row level security;

drop policy if exists skus_public_read            on skus;
drop policy if exists cities_public_read          on cities;
drop policy if exists price_snapshots_public_read on price_snapshots;

create policy skus_public_read
  on skus
  for select
  to anon, authenticated
  using (true);

create policy cities_public_read
  on cities
  for select
  to anon, authenticated
  using (true);

create policy price_snapshots_public_read
  on price_snapshots
  for select
  to anon, authenticated
  using (true);

-- -----------------------------------------------------------------------------
-- catatans: owner-only access.
-- -----------------------------------------------------------------------------

alter table catatans enable row level security;

drop policy if exists catatans_select_own on catatans;
drop policy if exists catatans_insert_own on catatans;
drop policy if exists catatans_update_own on catatans;
drop policy if exists catatans_delete_own on catatans;

create policy catatans_select_own
  on catatans
  for select
  to authenticated
  using (user_id = auth.uid());

create policy catatans_insert_own
  on catatans
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy catatans_update_own
  on catatans
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy catatans_delete_own
  on catatans
  for delete
  to authenticated
  using (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- catatan_items: owner-only, joined via parent catatan.user_id.
-- -----------------------------------------------------------------------------

alter table catatan_items enable row level security;

drop policy if exists catatan_items_select_own on catatan_items;
drop policy if exists catatan_items_insert_own on catatan_items;
drop policy if exists catatan_items_update_own on catatan_items;
drop policy if exists catatan_items_delete_own on catatan_items;

create policy catatan_items_select_own
  on catatan_items
  for select
  to authenticated
  using (
    exists (
      select 1 from catatans c
      where c.catatan_id = catatan_items.catatan_id
        and c.user_id = auth.uid()
    )
  );

create policy catatan_items_insert_own
  on catatan_items
  for insert
  to authenticated
  with check (
    exists (
      select 1 from catatans c
      where c.catatan_id = catatan_items.catatan_id
        and c.user_id = auth.uid()
    )
  );

create policy catatan_items_update_own
  on catatan_items
  for update
  to authenticated
  using (
    exists (
      select 1 from catatans c
      where c.catatan_id = catatan_items.catatan_id
        and c.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from catatans c
      where c.catatan_id = catatan_items.catatan_id
        and c.user_id = auth.uid()
    )
  );

create policy catatan_items_delete_own
  on catatan_items
  for delete
  to authenticated
  using (
    exists (
      select 1 from catatans c
      where c.catatan_id = catatan_items.catatan_id
        and c.user_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- riwayat_entries: owner-only access.
-- -----------------------------------------------------------------------------

alter table riwayat_entries enable row level security;

drop policy if exists riwayat_entries_select_own on riwayat_entries;
drop policy if exists riwayat_entries_insert_own on riwayat_entries;
drop policy if exists riwayat_entries_update_own on riwayat_entries;
drop policy if exists riwayat_entries_delete_own on riwayat_entries;

create policy riwayat_entries_select_own
  on riwayat_entries
  for select
  to authenticated
  using (user_id = auth.uid());

create policy riwayat_entries_insert_own
  on riwayat_entries
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy riwayat_entries_update_own
  on riwayat_entries
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy riwayat_entries_delete_own
  on riwayat_entries
  for delete
  to authenticated
  using (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- riwayat_items: owner-only, joined via parent riwayat_entries.user_id.
-- -----------------------------------------------------------------------------

alter table riwayat_items enable row level security;

drop policy if exists riwayat_items_select_own on riwayat_items;
drop policy if exists riwayat_items_insert_own on riwayat_items;
drop policy if exists riwayat_items_update_own on riwayat_items;
drop policy if exists riwayat_items_delete_own on riwayat_items;

create policy riwayat_items_select_own
  on riwayat_items
  for select
  to authenticated
  using (
    exists (
      select 1 from riwayat_entries r
      where r.riwayat_id = riwayat_items.riwayat_id
        and r.user_id = auth.uid()
    )
  );

create policy riwayat_items_insert_own
  on riwayat_items
  for insert
  to authenticated
  with check (
    exists (
      select 1 from riwayat_entries r
      where r.riwayat_id = riwayat_items.riwayat_id
        and r.user_id = auth.uid()
    )
  );

create policy riwayat_items_update_own
  on riwayat_items
  for update
  to authenticated
  using (
    exists (
      select 1 from riwayat_entries r
      where r.riwayat_id = riwayat_items.riwayat_id
        and r.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from riwayat_entries r
      where r.riwayat_id = riwayat_items.riwayat_id
        and r.user_id = auth.uid()
    )
  );

create policy riwayat_items_delete_own
  on riwayat_items
  for delete
  to authenticated
  using (
    exists (
      select 1 from riwayat_entries r
      where r.riwayat_id = riwayat_items.riwayat_id
        and r.user_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- ground_truth_prices: owner-only access.
-- -----------------------------------------------------------------------------

alter table ground_truth_prices enable row level security;

drop policy if exists ground_truth_prices_select_own on ground_truth_prices;
drop policy if exists ground_truth_prices_insert_own on ground_truth_prices;
drop policy if exists ground_truth_prices_update_own on ground_truth_prices;
drop policy if exists ground_truth_prices_delete_own on ground_truth_prices;

create policy ground_truth_prices_select_own
  on ground_truth_prices
  for select
  to authenticated
  using (user_id = auth.uid());

create policy ground_truth_prices_insert_own
  on ground_truth_prices
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy ground_truth_prices_update_own
  on ground_truth_prices
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy ground_truth_prices_delete_own
  on ground_truth_prices
  for delete
  to authenticated
  using (user_id = auth.uid());

commit;
