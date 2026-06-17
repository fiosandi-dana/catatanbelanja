import { createClient } from "@/lib/supabase/server";

export type RiwayatItemRow = {
  riwayat_item_id: string;
  sku_id: string;
  name_id: string;
  unit: string;
  qty: number;
  price_pihps_idr: number;
  price_actual_idr: number | null;
  notes: string | null;
};

export type RiwayatEntryRow = {
  riwayat_id: string;
  pasar_label: string | null;
  city_id: string;
  confirmed_at: string;
  total_pihps_idr: number;
  total_actual_idr: number | null;
  item_count: number;
};

export type RiwayatListResult =
  | { status: "ok"; entries: RiwayatEntryRow[] }
  | { status: "unconfigured" }
  | { status: "empty" }
  | { status: "error"; message: string };

export async function getRiwayatList(): Promise<RiwayatListResult> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return { status: "unconfigured" };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { status: "empty" };

  type EntryBase = {
    riwayat_id: string;
    pasar_label: string | null;
    city_id: string;
    confirmed_at: string;
  };

  const entryResp = await supabase
    .from("riwayat_entries")
    .select("riwayat_id, pasar_label, city_id, confirmed_at")
    .eq("user_id", user.id)
    .order("confirmed_at", { ascending: false })
    .limit(50);
  if (entryResp.error) return { status: "error", message: entryResp.error.message };
  const entries = (entryResp.data as unknown as EntryBase[]) ?? [];
  if (entries.length === 0) return { status: "empty" };

  const ids = entries.map((e) => e.riwayat_id);

  type ItemAgg = {
    riwayat_id: string;
    qty: number;
    price_pihps_idr: number;
    price_actual_idr: number | null;
  };
  const itemResp = await supabase
    .from("riwayat_items")
    .select("riwayat_id, qty, price_pihps_idr, price_actual_idr")
    .in("riwayat_id", ids);
  if (itemResp.error) return { status: "error", message: itemResp.error.message };
  const items = (itemResp.data as unknown as ItemAgg[]) ?? [];

  const byEntry = new Map<
    string,
    { totalPihps: number; totalActual: number | null; count: number; anyActualMissing: boolean }
  >();
  for (const it of items) {
    const cur =
      byEntry.get(it.riwayat_id) ??
      { totalPihps: 0, totalActual: 0, count: 0, anyActualMissing: false };
    cur.totalPihps += Math.round(it.price_pihps_idr * Number(it.qty));
    if (it.price_actual_idr != null) {
      cur.totalActual = (cur.totalActual ?? 0) + Math.round(it.price_actual_idr * Number(it.qty));
    } else {
      cur.anyActualMissing = true;
    }
    cur.count += 1;
    byEntry.set(it.riwayat_id, cur);
  }

  const enriched: RiwayatEntryRow[] = entries.map((e) => {
    const agg = byEntry.get(e.riwayat_id);
    return {
      riwayat_id: e.riwayat_id,
      pasar_label: e.pasar_label,
      city_id: e.city_id,
      confirmed_at: e.confirmed_at,
      total_pihps_idr: agg?.totalPihps ?? 0,
      total_actual_idr: agg && !agg.anyActualMissing ? agg.totalActual : null,
      item_count: agg?.count ?? 0,
    };
  });

  return { status: "ok", entries: enriched };
}
