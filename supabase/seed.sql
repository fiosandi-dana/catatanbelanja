-- =============================================================================
-- Pasar DANA — seed data (cities + SKU registry)
-- Idempotent: every INSERT uses ON CONFLICT DO UPDATE so re-running is safe.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Cities — 16 Tier 1/2 Indonesian cities.
-- `pihps_code` is the PIHPS regency id (string form) used by the scraper to
-- query bi.go.id/hargapangan. Source: GET /hargapangan/WebSite/TabelHarga/
-- GetRefRegency?price_type_id=1&ref_prov_id=<province>. Format is "<prov>:<reg>"
-- so the scraper can pass both query parameters without a second lookup.
-- -----------------------------------------------------------------------------
insert into cities (city_id, name_id, pihps_code, active) values
  ('jakarta',    'Jakarta',    '13:34',  true),  -- DKI Jakarta : Kota Jakarta Pusat
  ('surabaya',   'Surabaya',   '16:42',  true),  -- Jawa Timur  : Kota Surabaya
  ('bandung',    'Bandung',    '12:27',  true),  -- Jawa Barat  : Kota Bandung
  ('medan',      'Medan',      '2:4',    true),  -- Sumatera Utara : Kota Medan
  ('semarang',   'Semarang',   '14:35',  true),  -- Jawa Tengah : Kota Semarang
  ('makassar',   'Makassar',   '26:67',  true),  -- Sulawesi Selatan : Kota Makassar
  ('bekasi',     'Bekasi',     '12:30',  true),  -- Jawa Barat  : Kota Bekasi
  ('tangerang',  'Tangerang',  '11:26',  true),  -- Banten      : Kota Tangerang
  ('depok',      'Depok',      '12:32',  true),  -- Jawa Barat  : Kota Depok
  ('bogor',      'Bogor',      '12:31',  true),  -- Jawa Barat  : Kota Bogor
  ('yogyakarta', 'Yogyakarta', '15:41',  true),  -- DI Yogyakarta : Kota Yogyakarta
  ('malang',     'Malang',     '16:43',  true),  -- Jawa Timur  : Kota Malang
  ('denpasar',   'Denpasar',   '17:50',  true),  -- Bali        : Kota Denpasar
  ('balikpapan', 'Balikpapan', '23:64',  true),  -- Kalimantan Timur : Kota Balikpapan
  ('pekanbaru',  'Pekanbaru',  '4:10',   true),  -- Riau        : Kota Pekanbaru
  ('padang',     'Padang',     '3:8',    true)   -- Sumatera Barat : Kota Padang
on conflict (city_id) do update set
  name_id    = excluded.name_id,
  pihps_code = excluded.pihps_code,
  active     = excluded.active;

-- Note on pihps_code values: the numeric IDs above are best-effort defaults
-- derived from inspecting /hargapangan/WebSite/TabelHarga/GetRefRegency on
-- 2026-06-17. If PIHPS reorganises its ID space, re-run the discovery script
-- in supabase/functions/scrape-pihps/README.md to refresh these.

-- -----------------------------------------------------------------------------
-- SKUs — 21 PIHPS commodities + 4 manually seeded items (Phase 0 registry).
-- Categories: karbohidrat | protein | minyak | bumbu | lainnya.
-- -----------------------------------------------------------------------------
insert into skus (sku_id, name_id, unit, category, active) values
  -- PIHPS (21) --------------------------------------------------------------
  ('beras_premium',         'Beras Premium',         'kg',    'karbohidrat', true),
  ('beras_medium',          'Beras Medium',          'kg',    'karbohidrat', true),
  ('telur_ayam_ras',        'Telur Ayam Ras',        'kg',    'protein',     true),
  ('daging_ayam_ras',       'Daging Ayam Ras',       'kg',    'protein',     true),
  ('daging_sapi',           'Daging Sapi',           'kg',    'protein',     true),
  ('minyak_goreng_curah',   'Minyak Goreng Curah',   'L',     'minyak',      true),
  ('minyak_goreng_kemasan', 'Minyak Goreng Kemasan', 'L',     'minyak',      true),
  ('gula_pasir',            'Gula Pasir',            'kg',    'lainnya',     true),
  ('tepung_terigu',         'Tepung Terigu',         'kg',    'karbohidrat', true),
  ('bawang_merah',          'Bawang Merah',          'kg',    'bumbu',       true),
  ('bawang_putih',          'Bawang Putih',          'kg',    'bumbu',       true),
  ('cabai_merah_keriting',  'Cabai Merah Keriting',  'kg',    'bumbu',       true),
  ('cabai_merah_besar',     'Cabai Merah Besar',     'kg',    'bumbu',       true),
  ('cabai_rawit_merah',     'Cabai Rawit Merah',     'kg',    'bumbu',       true),
  ('kacang_tanah',          'Kacang Tanah',          'kg',    'protein',     true),
  ('kedelai_impor',         'Kedelai Impor',         'kg',    'protein',     true),
  ('ikan_tongkol',          'Ikan Tongkol',          'kg',    'protein',     true),
  ('ikan_kembung',          'Ikan Kembung',          'kg',    'protein',     true),
  ('susu_bubuk',            'Susu Bubuk',            'kg',    'protein',     true),
  ('garam_halus',           'Garam Halus',           'kg',    'bumbu',       true),
  ('jagung_pipilan',        'Jagung Pipilan',        'kg',    'karbohidrat', true),
  -- Manual (4) --------------------------------------------------------------
  ('galon_air_19l',         'Galon Air 19L',         'L',     'lainnya',     true),
  ('gas_lpg_3kg',           'Gas LPG 3kg',           'kg',    'lainnya',     true),
  ('indomie_goreng',        'Indomie Goreng',        'dus',   'karbohidrat', true),
  ('susu_uht_1l',           'Susu UHT 1L',           'L',     'protein',     true)
on conflict (sku_id) do update set
  name_id  = excluded.name_id,
  unit     = excluded.unit,
  category = excluded.category,
  active   = excluded.active;
