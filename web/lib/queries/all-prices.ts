import { createClient } from "@/lib/supabase/server";

export type SkuPriceRow = {
  sku_id: string;
  name_id: string;
  unit: string;
  category: string;
  price_idr: number | null; // null = no PIHPS data yet for this city
  snapshot_date: string | null;
};

export type AllPricesResult =
  | { status: "ok"; rows: SkuPriceRow[] }
  | { status: "unconfigured" }
  | { status: "error"; message: string };

/**
 * Demo-mode fallback. Mirrors the union of `supabase/seed.sql` + the expanded
 * registry in migration `0003_sku_registry_100.sql`. Keep in sync when adding
 * SKUs to either file.
 */
const FALLBACK_SKUS: Omit<SkuPriceRow, "price_idr" | "snapshot_date">[] = [
  // 1. Karbohidrat & Makanan Pokok
  { sku_id: "beras_premium", name_id: "Beras Premium", unit: "kg", category: "karbohidrat" },
  { sku_id: "beras_medium", name_id: "Beras Medium", unit: "kg", category: "karbohidrat" },
  { sku_id: "beras_pandan", name_id: "Beras Pandan Wangi", unit: "kg", category: "karbohidrat" },
  { sku_id: "jagung_pipilan", name_id: "Jagung Pipilan", unit: "kg", category: "karbohidrat" },
  { sku_id: "jagung_manis", name_id: "Jagung Manis", unit: "kg", category: "karbohidrat" },
  { sku_id: "sagu", name_id: "Sagu", unit: "kg", category: "karbohidrat" },
  { sku_id: "singkong", name_id: "Singkong", unit: "kg", category: "karbohidrat" },
  { sku_id: "ubi_jalar", name_id: "Ubi Jalar", unit: "kg", category: "karbohidrat" },
  { sku_id: "kentang", name_id: "Kentang", unit: "kg", category: "karbohidrat" },
  { sku_id: "tepung_terigu", name_id: "Tepung Terigu", unit: "kg", category: "karbohidrat" },
  { sku_id: "tepung_tapioka", name_id: "Tepung Tapioka", unit: "kg", category: "karbohidrat" },
  { sku_id: "mi_instan", name_id: "Mi Instan", unit: "dus", category: "karbohidrat" },
  { sku_id: "bihun", name_id: "Bihun / Soun", unit: "pack", category: "karbohidrat" },
  { sku_id: "roti_tawar", name_id: "Roti Tawar", unit: "pack", category: "karbohidrat" },
  { sku_id: "indomie", name_id: "Indomie Goreng", unit: "dus", category: "karbohidrat" },

  // 2. Minyak, Lemak & Pemanis
  { sku_id: "minyak_goreng_curah", name_id: "Minyak Goreng Curah", unit: "L", category: "minyak_pemanis" },
  { sku_id: "minyak_goreng_kemasan", name_id: "Minyak Goreng Kemasan", unit: "L", category: "minyak_pemanis" },
  { sku_id: "minyak_kelapa", name_id: "Minyak Kelapa", unit: "L", category: "minyak_pemanis" },
  { sku_id: "margarin", name_id: "Margarin / Mentega", unit: "pack", category: "minyak_pemanis" },
  { sku_id: "gula_pasir", name_id: "Gula Pasir", unit: "kg", category: "minyak_pemanis" },
  { sku_id: "gula_merah", name_id: "Gula Merah / Gula Jawa", unit: "kg", category: "minyak_pemanis" },
  { sku_id: "madu", name_id: "Madu Alami", unit: "pack", category: "minyak_pemanis" },

  // 3. Protein Hewani
  { sku_id: "telur_ayam_ras", name_id: "Telur Ayam Ras", unit: "kg", category: "protein_hewani" },
  { sku_id: "telur_bebek", name_id: "Telur Bebek", unit: "butir", category: "protein_hewani" },
  { sku_id: "telur_puyuh", name_id: "Telur Puyuh", unit: "butir", category: "protein_hewani" },
  { sku_id: "daging_ayam_ras", name_id: "Daging Ayam Ras", unit: "kg", category: "protein_hewani" },
  { sku_id: "daging_ayam_kampung", name_id: "Daging Ayam Kampung", unit: "kg", category: "protein_hewani" },
  { sku_id: "daging_sapi", name_id: "Daging Sapi", unit: "kg", category: "protein_hewani" },
  { sku_id: "daging_kambing", name_id: "Daging Kambing", unit: "kg", category: "protein_hewani" },
  { sku_id: "ikan_bandeng", name_id: "Ikan Bandeng", unit: "kg", category: "protein_hewani" },
  { sku_id: "ikan_kembung", name_id: "Ikan Kembung", unit: "kg", category: "protein_hewani" },
  { sku_id: "ikan_tongkol", name_id: "Ikan Tongkol", unit: "kg", category: "protein_hewani" },
  { sku_id: "ikan_teri", name_id: "Ikan Teri Kering", unit: "kg", category: "protein_hewani" },
  { sku_id: "udang", name_id: "Udang Segar", unit: "kg", category: "protein_hewani" },
  { sku_id: "cumi", name_id: "Cumi-cumi Segar", unit: "kg", category: "protein_hewani" },
  { sku_id: "sarden_kaleng", name_id: "Sarden Kaleng", unit: "pack", category: "protein_hewani" },
  { sku_id: "kornet_sapi", name_id: "Kornet Sapi", unit: "pack", category: "protein_hewani" },
  { sku_id: "sosis", name_id: "Sosis", unit: "pack", category: "protein_hewani" },
  { sku_id: "bakso", name_id: "Bakso (Frozen)", unit: "pack", category: "protein_hewani" },
  { sku_id: "nugget_ayam", name_id: "Nugget Ayam", unit: "pack", category: "protein_hewani" },

  // 4. Protein Nabati
  { sku_id: "kedelai_impor", name_id: "Kedelai Impor", unit: "kg", category: "protein_nabati" },
  { sku_id: "tahu", name_id: "Tahu", unit: "pack", category: "protein_nabati" },
  { sku_id: "tempe", name_id: "Tempe", unit: "pack", category: "protein_nabati" },
  { sku_id: "kacang_hijau", name_id: "Kacang Hijau", unit: "kg", category: "protein_nabati" },
  { sku_id: "kacang_tanah", name_id: "Kacang Tanah", unit: "kg", category: "protein_nabati" },

  // 5. Susu & Produk Olahan
  { sku_id: "skm", name_id: "Susu Kental Manis", unit: "pack", category: "susu" },
  { sku_id: "susu_bubuk", name_id: "Susu Bubuk", unit: "kg", category: "susu" },
  { sku_id: "susu_uht", name_id: "Susu UHT 1L", unit: "L", category: "susu" },
  { sku_id: "susu_formula_bayi", name_id: "Susu Formula Bayi", unit: "pack", category: "susu" },
  { sku_id: "keju_cheddar", name_id: "Keju Cheddar", unit: "pack", category: "susu" },
  { sku_id: "yogurt", name_id: "Yogurt", unit: "pack", category: "susu" },

  // 6. Bumbu Dapur & Rempah
  { sku_id: "garam_halus", name_id: "Garam Beryodium", unit: "kg", category: "bumbu" },
  { sku_id: "bawang_merah", name_id: "Bawang Merah", unit: "kg", category: "bumbu" },
  { sku_id: "bawang_putih", name_id: "Bawang Putih", unit: "kg", category: "bumbu" },
  { sku_id: "bawang_bombay", name_id: "Bawang Bombay", unit: "kg", category: "bumbu" },
  { sku_id: "cabai_merah_keriting", name_id: "Cabai Merah Keriting", unit: "kg", category: "bumbu" },
  { sku_id: "cabai_merah_besar", name_id: "Cabai Merah Besar", unit: "kg", category: "bumbu" },
  { sku_id: "cabai_rawit_merah", name_id: "Cabai Rawit Merah", unit: "kg", category: "bumbu" },
  { sku_id: "cabai_rawit_hijau", name_id: "Cabai Rawit Hijau", unit: "kg", category: "bumbu" },
  { sku_id: "merica", name_id: "Merica / Lada", unit: "pack", category: "bumbu" },
  { sku_id: "ketumbar", name_id: "Ketumbar", unit: "pack", category: "bumbu" },
  { sku_id: "kemiri", name_id: "Kemiri", unit: "pack", category: "bumbu" },
  { sku_id: "msg", name_id: "Penyedap Rasa / MSG", unit: "pack", category: "bumbu" },
  { sku_id: "kaldu_bubuk", name_id: "Kaldu Bubuk", unit: "pack", category: "bumbu" },
  { sku_id: "kecap_manis", name_id: "Kecap Manis", unit: "pack", category: "bumbu" },
  { sku_id: "kecap_asin", name_id: "Kecap Asin", unit: "pack", category: "bumbu" },
  { sku_id: "saus_cabai", name_id: "Saus Cabai", unit: "pack", category: "bumbu" },
  { sku_id: "saus_tomat", name_id: "Saus Tomat", unit: "pack", category: "bumbu" },
  { sku_id: "asam_jawa", name_id: "Asam Jawa", unit: "pack", category: "bumbu" },
  { sku_id: "jahe", name_id: "Jahe", unit: "kg", category: "bumbu" },
  { sku_id: "kunyit", name_id: "Kunyit", unit: "kg", category: "bumbu" },
  { sku_id: "lengkuas", name_id: "Lengkuas", unit: "kg", category: "bumbu" },
  { sku_id: "daun_salam", name_id: "Daun Salam", unit: "ikat", category: "bumbu" },
  { sku_id: "sereh", name_id: "Sereh", unit: "ikat", category: "bumbu" },
  { sku_id: "terasi", name_id: "Terasi Udang", unit: "pack", category: "bumbu" },
  { sku_id: "tepung_bumbu", name_id: "Tepung Bumbu Siap Saji", unit: "pack", category: "bumbu" },
  { sku_id: "bumbu_pasta", name_id: "Bumbu Pasta Instan", unit: "pack", category: "bumbu" },

  // 7. Sayuran Segar
  { sku_id: "tomat", name_id: "Tomat", unit: "kg", category: "sayuran" },
  { sku_id: "wortel", name_id: "Wortel", unit: "kg", category: "sayuran" },
  { sku_id: "kubis", name_id: "Kubis / Kol", unit: "kg", category: "sayuran" },
  { sku_id: "sawi_hijau", name_id: "Sawi Hijau / Caisim", unit: "ikat", category: "sayuran" },
  { sku_id: "sawi_putih", name_id: "Sawi Putih", unit: "kg", category: "sayuran" },
  { sku_id: "kangkung", name_id: "Kangkung", unit: "ikat", category: "sayuran" },
  { sku_id: "bayam", name_id: "Bayam", unit: "ikat", category: "sayuran" },
  { sku_id: "kacang_panjang", name_id: "Kacang Panjang", unit: "ikat", category: "sayuran" },
  { sku_id: "buncis", name_id: "Buncis", unit: "kg", category: "sayuran" },
  { sku_id: "timun", name_id: "Timun", unit: "kg", category: "sayuran" },
  { sku_id: "tauge", name_id: "Tauge / Kecambah", unit: "kg", category: "sayuran" },
  { sku_id: "daun_bawang", name_id: "Daun Bawang", unit: "ikat", category: "sayuran" },
  { sku_id: "seledri", name_id: "Seledri", unit: "ikat", category: "sayuran" },

  // 8. Buah
  { sku_id: "pisang", name_id: "Pisang", unit: "kg", category: "buah" },
  { sku_id: "jeruk", name_id: "Jeruk", unit: "kg", category: "buah" },
  { sku_id: "pepaya", name_id: "Pepaya", unit: "kg", category: "buah" },
  { sku_id: "semangka", name_id: "Semangka", unit: "kg", category: "buah" },
  { sku_id: "melon", name_id: "Melon", unit: "kg", category: "buah" },
  { sku_id: "apel", name_id: "Apel", unit: "kg", category: "buah" },

  // 9. Instan (mostly in protein_hewani + karbohidrat groups above)
  { sku_id: "kerupuk_mentah", name_id: "Kerupuk Mentah", unit: "pack", category: "instan" },

  // 10. Minuman
  { sku_id: "galon_air", name_id: "Galon Air 19L", unit: "L", category: "minuman" },
  { sku_id: "amdk_botol", name_id: "AMDK Botol", unit: "pack", category: "minuman" },
  { sku_id: "teh_celup", name_id: "Teh Celup", unit: "pack", category: "minuman" },
  { sku_id: "kopi_bubuk", name_id: "Kopi Bubuk", unit: "pack", category: "minuman" },
  { sku_id: "sirup", name_id: "Sirup", unit: "pack", category: "minuman" },
  { sku_id: "cokelat_bubuk", name_id: "Cokelat Bubuk", unit: "pack", category: "minuman" },
  { sku_id: "selai", name_id: "Selai", unit: "pack", category: "minuman" },

  // 11. Energi
  { sku_id: "gas_lpg", name_id: "Gas LPG 3 kg", unit: "kg", category: "energi" },
  { sku_id: "gas_lpg_12kg", name_id: "Gas LPG 12 kg / Bright Gas", unit: "pcs", category: "energi" },
  { sku_id: "minyak_tanah", name_id: "Minyak Tanah", unit: "L", category: "energi" },

  // 12. Sanitasi
  { sku_id: "sabun_mandi", name_id: "Sabun Mandi", unit: "pcs", category: "sanitasi" },
  { sku_id: "sampo", name_id: "Sampo Rambut", unit: "pack", category: "sanitasi" },
  { sku_id: "pasta_gigi", name_id: "Pasta Gigi", unit: "pack", category: "sanitasi" },
  { sku_id: "sikat_gigi", name_id: "Sikat Gigi", unit: "pcs", category: "sanitasi" },
  { sku_id: "deterjen", name_id: "Deterjen Cuci Baju", unit: "pack", category: "sanitasi" },
  { sku_id: "pewangi_pakaian", name_id: "Pewangi & Pelembut Pakaian", unit: "pack", category: "sanitasi" },
  { sku_id: "sabun_cuci_piring", name_id: "Sabun Cuci Piring", unit: "pack", category: "sanitasi" },
  { sku_id: "pembersih_lantai", name_id: "Pembersih Lantai", unit: "pack", category: "sanitasi" },
  { sku_id: "tisu", name_id: "Tisu Wajah / Tisu Toilet", unit: "pack", category: "sanitasi" },
  { sku_id: "obat_nyamuk", name_id: "Obat Nyamuk", unit: "pack", category: "sanitasi" },
];

/**
 * Fetch all active SKUs + their latest snapshot for the given city. Used by
 * the Beranda search input so the user can find any sembako (not just Top 6).
 *
 * When Supabase isn't configured, falls back to the bundled 25-SKU registry
 * with `price_idr = null` so the search still works in demo mode.
 */
export async function getAllPricesForCity(
  cityId: string,
): Promise<AllPricesResult> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return {
      status: "ok",
      rows: FALLBACK_SKUS.map((s) => ({
        ...s,
        price_idr: null,
        snapshot_date: null,
      })),
    };
  }

  let supabase;
  try {
    supabase = await createClient();
  } catch (e) {
    return {
      status: "error",
      message: e instanceof Error ? e.message : String(e),
    };
  }

  type SkuMetaRow = {
    sku_id: string;
    name_id: string;
    unit: string;
    category: string;
  };
  type SnapshotRow = {
    sku_id: string;
    snapshot_date: string;
    price_idr: number;
  };

  const skuResp = await supabase
    .from("skus")
    .select("sku_id, name_id, unit, category")
    .eq("active", true);
  if (skuResp.error) {
    return { status: "error", message: skuResp.error.message };
  }
  const skus = (skuResp.data as unknown as SkuMetaRow[]) ?? [];

  const snapResp = await supabase
    .from("price_snapshots")
    .select("sku_id, snapshot_date, price_idr")
    .eq("city_id", cityId)
    .order("snapshot_date", { ascending: false });
  if (snapResp.error) {
    return { status: "error", message: snapResp.error.message };
  }
  const snapshots = (snapResp.data as unknown as SnapshotRow[]) ?? [];

  const latestBySku = new Map<
    string,
    { snapshot_date: string; price_idr: number }
  >();
  for (const row of snapshots) {
    if (!latestBySku.has(row.sku_id)) {
      latestBySku.set(row.sku_id, {
        snapshot_date: row.snapshot_date,
        price_idr: row.price_idr,
      });
    }
  }

  const rows: SkuPriceRow[] = skus.map((s) => {
    const snap = latestBySku.get(s.sku_id);
    return {
      sku_id: s.sku_id,
      name_id: s.name_id,
      unit: s.unit,
      category: s.category,
      price_idr: snap?.price_idr ?? null,
      snapshot_date: snap?.snapshot_date ?? null,
    };
  });

  return { status: "ok", rows };
}
