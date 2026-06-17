import { createClient } from "@/lib/supabase/server";

/**
 * Top-6 SKU IDs shown on Beranda. The PRD defers the real ranking algorithm
 * to a separate scoring PRD (PRD §6 "Out of scope"); this is the Phase 0
 * placeholder — frequency-of-mention proxy for an ibu rumah tangga.
 */
export const TOP_SKU_IDS = [
  "telur_ayam_ras",
  "beras_medium",
  "minyak_goreng_kemasan",
  "daging_ayam_ras",
  "cabai_merah_keriting",
  "gula_pasir",
] as const;

export type LatestPriceRow = {
  sku_id: string;
  name_id: string;
  unit: string;
  category: string;
  price_idr: number;
  snapshot_date: string;
  staleness_days: number;
};

export type LatestPricesResult =
  | { status: "ok"; rows: LatestPriceRow[]; snapshot_date: string }
  | { status: "empty"; reason: "no_data" }
  | { status: "unconfigured" }
  | { status: "error"; message: string };

/**
 * Fetch the most recent PIHPS snapshot per Top-6 SKU for the given city.
 *
 * Per PRD §5.8 failure mode "PIHPS daily scrape fails", we never block — if
 * today's snapshot is missing we surface the most recent prior snapshot and
 * let the UI badge staleness. The DB index `(sku_id, city_id, snapshot_date
 * desc)` makes the per-SKU latest lookup an index-only seek.
 */
export async function getLatestPrices(
  cityId: string,
): Promise<LatestPricesResult> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return { status: "unconfigured" };
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

  type SnapshotRow = {
    sku_id: string;
    snapshot_date: string;
    price_idr: number;
  };
  type SkuMetaRow = {
    sku_id: string;
    name_id: string;
    unit: string;
    category: string;
  };

  // Fetch all snapshots for these SKUs in this city, then reduce to latest per SKU.
  // For 6 SKUs × ~119 dates this is small (<1KB). When the dataset grows, swap
  // to a Postgres `distinct on (sku_id)` view.
  const snapResp = await supabase
    .from("price_snapshots")
    .select("sku_id, snapshot_date, price_idr")
    .eq("city_id", cityId)
    .in("sku_id", TOP_SKU_IDS as unknown as string[])
    .order("snapshot_date", { ascending: false });
  const snapError = snapResp.error;
  const snapshots = snapResp.data as unknown as SnapshotRow[] | null;

  if (snapError) {
    return { status: "error", message: snapError.message };
  }
  if (!snapshots || snapshots.length === 0) {
    return { status: "empty", reason: "no_data" };
  }

  const skuResp = await supabase
    .from("skus")
    .select("sku_id, name_id, unit, category")
    .in("sku_id", TOP_SKU_IDS as unknown as string[]);
  const skuError = skuResp.error;
  const skuMeta = skuResp.data as unknown as SkuMetaRow[] | null;

  if (skuError) {
    return { status: "error", message: skuError.message };
  }
  if (!skuMeta) {
    return { status: "empty", reason: "no_data" };
  }

  const skuById = new Map(skuMeta.map((s) => [s.sku_id, s]));

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

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const rows: LatestPriceRow[] = [];
  let newestDate = "";

  for (const skuId of TOP_SKU_IDS) {
    const latest = latestBySku.get(skuId);
    const meta = skuById.get(skuId);
    if (!latest || !meta) continue;

    const snapshotDate = new Date(latest.snapshot_date + "T00:00:00Z");
    const stalenessDays = Math.max(
      0,
      Math.floor(
        (today.getTime() - snapshotDate.getTime()) / (24 * 60 * 60 * 1000),
      ),
    );

    rows.push({
      sku_id: meta.sku_id,
      name_id: meta.name_id,
      unit: meta.unit,
      category: meta.category,
      price_idr: latest.price_idr,
      snapshot_date: latest.snapshot_date,
      staleness_days: stalenessDays,
    });

    if (latest.snapshot_date > newestDate) {
      newestDate = latest.snapshot_date;
    }
  }

  if (rows.length === 0) {
    return { status: "empty", reason: "no_data" };
  }

  return { status: "ok", rows, snapshot_date: newestDate };
}
