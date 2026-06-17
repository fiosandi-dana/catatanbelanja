-- =============================================================================
-- Pasar DANA — expand SKU registry to ~100 household-essential items
-- =============================================================================
-- Background: PIHPS publishes daily prices for ~21 commodities. Households buy
-- many more items each month. This migration registers ~100 SKUs across 12
-- categories matching common Indonesian household shopping. Items already in
-- PIHPS keep their existing sku_id; the ~80 non-PIHPS items have price_idr=null
-- until either (a) the user fills it manually via CatatSheet or (b) we add
-- ground-truth capture in Phase 2.
--
-- Idempotent: ON CONFLICT (sku_id) DO UPDATE — re-running is safe.
-- =============================================================================

-- Update existing 25 SKUs to the new 12-category taxonomy first
update skus set category = 'karbohidrat'  where sku_id in ('beras_premium','beras_medium','tepung_terigu','jagung_pipilan','indomie');
update skus set category = 'minyak_pemanis' where sku_id in ('minyak_goreng_curah','minyak_goreng_kemasan','gula_pasir');
update skus set category = 'protein_hewani' where sku_id in ('telur_ayam_ras','daging_ayam_ras','daging_sapi','ikan_tongkol','ikan_kembung');
update skus set category = 'protein_nabati' where sku_id in ('kacang_tanah','kedelai_impor');
update skus set category = 'susu'         where sku_id in ('susu_bubuk','susu_uht');
update skus set category = 'bumbu'        where sku_id in ('bawang_merah','bawang_putih','cabai_merah_keriting','cabai_merah_besar','cabai_rawit_merah','garam_halus');
update skus set category = 'energi'       where sku_id in ('gas_lpg');
update skus set category = 'minuman'      where sku_id in ('galon_air');

-- Rename / harmonize a couple of legacy slugs to the new naming
update skus set name_id = 'Garam Beryodium' where sku_id = 'garam_halus';

insert into skus (sku_id, name_id, unit, category, active) values
  -- =====================================================================
  -- 1. Karbohidrat & Makanan Pokok
  -- =====================================================================
  ('beras_pandan',           'Beras Pandan Wangi',        'kg',  'karbohidrat',    true),
  ('jagung_manis',           'Jagung Manis',              'kg',  'karbohidrat',    true),
  ('sagu',                   'Sagu',                      'kg',  'karbohidrat',    true),
  ('singkong',               'Singkong',                  'kg',  'karbohidrat',    true),
  ('ubi_jalar',              'Ubi Jalar',                 'kg',  'karbohidrat',    true),
  ('kentang',                'Kentang',                   'kg',  'karbohidrat',    true),
  ('tepung_tapioka',         'Tepung Tapioka',            'kg',  'karbohidrat',    true),
  ('mi_instan',              'Mi Instan',                 'dus', 'karbohidrat',    true),
  ('bihun',                  'Bihun / Soun',              'pack','karbohidrat',    true),
  ('roti_tawar',             'Roti Tawar',                'pack','karbohidrat',    true),

  -- =====================================================================
  -- 2. Minyak, Lemak & Pemanis
  -- =====================================================================
  ('minyak_kelapa',          'Minyak Kelapa',             'L',   'minyak_pemanis', true),
  ('margarin',               'Margarin / Mentega',        'pack','minyak_pemanis', true),
  ('gula_merah',             'Gula Merah / Gula Jawa',    'kg',  'minyak_pemanis', true),
  ('madu',                   'Madu Alami',                'pack','minyak_pemanis', true),

  -- =====================================================================
  -- 3. Protein Hewani
  -- =====================================================================
  ('telur_bebek',            'Telur Bebek',               'butir','protein_hewani', true),
  ('telur_puyuh',            'Telur Puyuh',               'butir','protein_hewani', true),
  ('daging_ayam_kampung',    'Daging Ayam Kampung',       'kg',  'protein_hewani', true),
  ('daging_kambing',         'Daging Kambing',            'kg',  'protein_hewani', true),
  ('ikan_bandeng',           'Ikan Bandeng',              'kg',  'protein_hewani', true),
  ('ikan_teri',              'Ikan Teri Kering',          'kg',  'protein_hewani', true),
  ('udang',                  'Udang Segar',               'kg',  'protein_hewani', true),
  ('cumi',                   'Cumi-cumi Segar',           'kg',  'protein_hewani', true),
  ('sarden_kaleng',          'Sarden Kaleng',             'pack','protein_hewani', true),
  ('kornet_sapi',            'Kornet Sapi',               'pack','protein_hewani', true),
  ('sosis',                  'Sosis',                     'pack','protein_hewani', true),
  ('bakso',                  'Bakso (Frozen)',            'pack','protein_hewani', true),
  ('nugget_ayam',            'Nugget Ayam',               'pack','protein_hewani', true),

  -- =====================================================================
  -- 4. Protein Nabati & Olahannya
  -- =====================================================================
  ('tahu',                   'Tahu',                      'pack','protein_nabati', true),
  ('tempe',                  'Tempe',                     'pack','protein_nabati', true),
  ('kacang_hijau',           'Kacang Hijau',              'kg',  'protein_nabati', true),

  -- =====================================================================
  -- 5. Susu & Produk Olahan
  -- =====================================================================
  ('skm',                    'Susu Kental Manis',         'pack','susu',           true),
  ('susu_formula_bayi',      'Susu Formula Bayi',         'pack','susu',           true),
  ('keju_cheddar',           'Keju Cheddar',              'pack','susu',           true),
  ('yogurt',                 'Yogurt',                    'pack','susu',           true),

  -- =====================================================================
  -- 6. Bumbu Dapur & Rempah
  -- =====================================================================
  ('bawang_bombay',          'Bawang Bombay',             'kg',  'bumbu',          true),
  ('cabai_rawit_hijau',      'Cabai Rawit Hijau',         'kg',  'bumbu',          true),
  ('merica',                 'Merica / Lada',             'pack','bumbu',          true),
  ('ketumbar',               'Ketumbar',                  'pack','bumbu',          true),
  ('kemiri',                 'Kemiri',                    'pack','bumbu',          true),
  ('msg',                    'Penyedap Rasa / MSG',       'pack','bumbu',          true),
  ('kaldu_bubuk',            'Kaldu Bubuk',               'pack','bumbu',          true),
  ('kecap_manis',            'Kecap Manis',               'pack','bumbu',          true),
  ('kecap_asin',             'Kecap Asin',                'pack','bumbu',          true),
  ('saus_cabai',             'Saus Cabai',                'pack','bumbu',          true),
  ('saus_tomat',             'Saus Tomat',                'pack','bumbu',          true),
  ('asam_jawa',              'Asam Jawa',                 'pack','bumbu',          true),
  ('jahe',                   'Jahe',                      'kg',  'bumbu',          true),
  ('kunyit',                 'Kunyit',                    'kg',  'bumbu',          true),
  ('lengkuas',               'Lengkuas',                  'kg',  'bumbu',          true),
  ('daun_salam',             'Daun Salam',                'ikat','bumbu',          true),
  ('sereh',                  'Sereh',                     'ikat','bumbu',          true),
  ('terasi',                 'Terasi Udang',              'pack','bumbu',          true),
  ('tepung_bumbu',           'Tepung Bumbu Siap Saji',    'pack','bumbu',          true),
  ('bumbu_pasta',            'Bumbu Pasta Instan',        'pack','bumbu',          true),

  -- =====================================================================
  -- 7. Sayuran Segar
  -- =====================================================================
  ('tomat',                  'Tomat',                     'kg',  'sayuran',        true),
  ('wortel',                 'Wortel',                    'kg',  'sayuran',        true),
  ('kubis',                  'Kubis / Kol',               'kg',  'sayuran',        true),
  ('sawi_hijau',             'Sawi Hijau / Caisim',       'ikat','sayuran',        true),
  ('sawi_putih',             'Sawi Putih',                'kg',  'sayuran',        true),
  ('kangkung',               'Kangkung',                  'ikat','sayuran',        true),
  ('bayam',                  'Bayam',                     'ikat','sayuran',        true),
  ('kacang_panjang',         'Kacang Panjang',            'ikat','sayuran',        true),
  ('buncis',                 'Buncis',                    'kg',  'sayuran',        true),
  ('timun',                  'Timun',                     'kg',  'sayuran',        true),
  ('tauge',                  'Tauge / Kecambah',          'kg',  'sayuran',        true),
  ('daun_bawang',            'Daun Bawang',               'ikat','sayuran',        true),
  ('seledri',                'Seledri',                   'ikat','sayuran',        true),

  -- =====================================================================
  -- 8. Buah-Buahan Esensial
  -- =====================================================================
  ('pisang',                 'Pisang',                    'kg',  'buah',           true),
  ('jeruk',                  'Jeruk',                     'kg',  'buah',           true),
  ('pepaya',                 'Pepaya',                    'kg',  'buah',           true),
  ('semangka',               'Semangka',                  'kg',  'buah',           true),
  ('melon',                  'Melon',                     'kg',  'buah',           true),
  ('apel',                   'Apel',                      'kg',  'buah',           true),

  -- =====================================================================
  -- 9. Instan & Pengawet (mostly placed under groups 3 & 1)
  -- =====================================================================
  ('kerupuk_mentah',         'Kerupuk Mentah',            'pack','instan',         true),

  -- =====================================================================
  -- 10. Minuman & Pelengkap Sore
  -- =====================================================================
  ('amdk_botol',             'AMDK Botol',                'pack','minuman',        true),
  ('teh_celup',              'Teh Celup',                 'pack','minuman',        true),
  ('kopi_bubuk',             'Kopi Bubuk',                'pack','minuman',        true),
  ('sirup',                  'Sirup',                     'pack','minuman',        true),
  ('cokelat_bubuk',          'Cokelat Bubuk',             'pack','minuman',        true),
  ('selai',                  'Selai',                     'pack','minuman',        true),

  -- =====================================================================
  -- 11. Bahan Bakar & Energi Rumah Tangga
  -- =====================================================================
  ('gas_lpg_12kg',           'Gas LPG 12 kg / Bright Gas','pcs', 'energi',         true),
  ('minyak_tanah',           'Minyak Tanah',              'L',   'energi',         true),

  -- =====================================================================
  -- 12. Perlengkapan Sanitasi & Kebersihan Rumah
  -- =====================================================================
  ('sabun_mandi',            'Sabun Mandi',               'pcs', 'sanitasi',       true),
  ('sampo',                  'Sampo Rambut',              'pack','sanitasi',       true),
  ('pasta_gigi',             'Pasta Gigi',                'pack','sanitasi',       true),
  ('sikat_gigi',             'Sikat Gigi',                'pcs', 'sanitasi',       true),
  ('deterjen',               'Deterjen Cuci Baju',        'pack','sanitasi',       true),
  ('pewangi_pakaian',        'Pewangi & Pelembut Pakaian','pack','sanitasi',       true),
  ('sabun_cuci_piring',      'Sabun Cuci Piring',         'pack','sanitasi',       true),
  ('pembersih_lantai',       'Pembersih Lantai',          'pack','sanitasi',       true),
  ('tisu',                   'Tisu Wajah / Tisu Toilet',  'pack','sanitasi',       true),
  ('obat_nyamuk',            'Obat Nyamuk',               'pack','sanitasi',       true)
on conflict (sku_id) do update set
  name_id  = excluded.name_id,
  unit     = excluded.unit,
  category = excluded.category,
  active   = excluded.active;

-- Also rename gas_lpg → gas_lpg_3kg so both LPG sizes are clearly named
update skus set name_id = 'Gas LPG 3 kg' where sku_id = 'gas_lpg';
