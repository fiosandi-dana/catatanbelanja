import { createClient } from "@/lib/supabase/server";

export type MonthlyTotals = {
  monthKey: string; // YYYY-MM
  label: string; // "Juni 2026"
  totalPihps: number;
  totalActual: number; // 0 if nothing filled
  totalEffective: number; // actual when filled, else pihps
  tripCount: number;
  itemCount: number;
};

export type CategoryBreakdown = {
  category: string;
  label: string;
  total: number;
  share: number; // 0..1
};

export type TopSkuRow = {
  sku_id: string;
  name_id: string;
  qty: number;
  total: number;
};

export type TopPasarRow = {
  pasar_label: string;
  trip_count: number;
  total: number;
};

export type InsightResult =
  | {
      status: "ok";
      currentMonthKey: string;
      months: MonthlyTotals[];
      current: MonthlyTotals;
      previous: MonthlyTotals | null;
      categories: CategoryBreakdown[];
      topSkus: TopSkuRow[];
      topPasar: TopPasarRow[];
    }
  | { status: "unconfigured" }
  | { status: "empty" }
  | { status: "error"; message: string };

const CATEGORY_LABELS: Record<string, string> = {
  karbohidrat: "Karbohidrat",
  minyak_pemanis: "Minyak & Pemanis",
  protein_hewani: "Protein Hewani",
  protein_nabati: "Protein Nabati",
  susu: "Susu",
  bumbu: "Bumbu & Rempah",
  sayuran: "Sayuran",
  buah: "Buah",
  instan: "Instan & Pengawet",
  minuman: "Minuman",
  energi: "Energi Rumah",
  sanitasi: "Sanitasi",
  lainnya: "Lainnya",
  custom: "Lainnya",
};

const ID_MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function monthKeyOf(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function labelOf(monthKey: string): string {
  const [y, m] = monthKey.split("-").map(Number);
  return `${ID_MONTHS[(m ?? 1) - 1]} ${y}`;
}

export async function getInsight(): Promise<InsightResult> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return { status: "unconfigured" };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { status: "empty" };

  type EntryRow = {
    riwayat_id: string;
    pasar_label: string | null;
    confirmed_at: string;
  };
  const entryResp = await supabase
    .from("riwayat_entries")
    .select("riwayat_id, pasar_label, confirmed_at")
    .eq("user_id", user.id);
  if (entryResp.error) return { status: "error", message: entryResp.error.message };
  const entries = (entryResp.data as unknown as EntryRow[]) ?? [];
  if (entries.length === 0) return { status: "empty" };

  const ids = entries.map((e) => e.riwayat_id);

  type ItemRow = {
    riwayat_id: string;
    sku_id: string;
    qty: number;
    price_pihps_idr: number;
    price_actual_idr: number | null;
  };
  type SkuMeta = { sku_id: string; name_id: string; category: string };

  const [itemResp, skuResp] = await Promise.all([
    supabase
      .from("riwayat_items")
      .select("riwayat_id, sku_id, qty, price_pihps_idr, price_actual_idr")
      .in("riwayat_id", ids),
    supabase.from("skus").select("sku_id, name_id, category"),
  ]);
  if (itemResp.error) return { status: "error", message: itemResp.error.message };
  if (skuResp.error) return { status: "error", message: skuResp.error.message };

  const items = (itemResp.data as unknown as ItemRow[]) ?? [];
  const skuById = new Map(
    ((skuResp.data as unknown as SkuMeta[]) ?? []).map((s) => [s.sku_id, s]),
  );

  const entryByMonth = new Map<string, EntryRow[]>();
  for (const e of entries) {
    const k = monthKeyOf(new Date(e.confirmed_at));
    const arr = entryByMonth.get(k) ?? [];
    arr.push(e);
    entryByMonth.set(k, arr);
  }

  const entryById = new Map(entries.map((e) => [e.riwayat_id, e]));

  // Group items by month (via parent entry confirmed_at)
  type Agg = {
    totalPihps: number;
    totalActual: number;
    totalEffective: number;
    itemCount: number;
  };
  const itemAggByMonth = new Map<string, Agg>();
  for (const it of items) {
    const e = entryById.get(it.riwayat_id);
    if (!e) continue;
    const k = monthKeyOf(new Date(e.confirmed_at));
    const cur = itemAggByMonth.get(k) ?? {
      totalPihps: 0,
      totalActual: 0,
      totalEffective: 0,
      itemCount: 0,
    };
    const qty = Number(it.qty);
    const pihpsLine = Math.round(it.price_pihps_idr * qty);
    const actualLine =
      it.price_actual_idr != null
        ? Math.round(it.price_actual_idr * qty)
        : 0;
    cur.totalPihps += pihpsLine;
    cur.totalActual += actualLine;
    cur.totalEffective += it.price_actual_idr != null ? actualLine : pihpsLine;
    cur.itemCount += 1;
    itemAggByMonth.set(k, cur);
  }

  const monthKeysSorted = Array.from(
    new Set([...entryByMonth.keys(), ...itemAggByMonth.keys()]),
  ).sort((a, b) => (a < b ? 1 : -1));

  const months: MonthlyTotals[] = monthKeysSorted.slice(0, 6).map((k) => {
    const agg = itemAggByMonth.get(k);
    return {
      monthKey: k,
      label: labelOf(k),
      totalPihps: agg?.totalPihps ?? 0,
      totalActual: agg?.totalActual ?? 0,
      totalEffective: agg?.totalEffective ?? 0,
      tripCount: entryByMonth.get(k)?.length ?? 0,
      itemCount: agg?.itemCount ?? 0,
    };
  });

  const currentMonthKey = monthKeyOf(new Date());
  const current =
    months.find((m) => m.monthKey === currentMonthKey) ?? {
      monthKey: currentMonthKey,
      label: labelOf(currentMonthKey),
      totalPihps: 0,
      totalActual: 0,
      totalEffective: 0,
      tripCount: 0,
      itemCount: 0,
    };
  const previousIdx = months.findIndex((m) => m.monthKey === currentMonthKey) + 1;
  const previous = previousIdx < months.length ? months[previousIdx] ?? null : null;

  // Category breakdown for current month
  const categoryTotals = new Map<string, number>();
  for (const it of items) {
    const e = entryById.get(it.riwayat_id);
    if (!e) continue;
    const k = monthKeyOf(new Date(e.confirmed_at));
    if (k !== currentMonthKey) continue;
    const sku = skuById.get(it.sku_id);
    const cat = sku?.category ?? "lainnya";
    const qty = Number(it.qty);
    const line =
      it.price_actual_idr != null
        ? Math.round(it.price_actual_idr * qty)
        : Math.round(it.price_pihps_idr * qty);
    categoryTotals.set(cat, (categoryTotals.get(cat) ?? 0) + line);
  }
  const categoryEntries = Array.from(categoryTotals.entries()).sort(
    (a, b) => b[1] - a[1],
  );
  const catTotal = categoryEntries.reduce((sum, [, v]) => sum + v, 0);
  const categories: CategoryBreakdown[] = categoryEntries.map(([k, v]) => ({
    category: k,
    label: CATEGORY_LABELS[k] ?? k,
    total: v,
    share: catTotal > 0 ? v / catTotal : 0,
  }));

  // Top SKUs by spend (current month)
  const skuTotals = new Map<string, { qty: number; total: number }>();
  for (const it of items) {
    const e = entryById.get(it.riwayat_id);
    if (!e) continue;
    if (monthKeyOf(new Date(e.confirmed_at)) !== currentMonthKey) continue;
    const qty = Number(it.qty);
    const line =
      it.price_actual_idr != null
        ? Math.round(it.price_actual_idr * qty)
        : Math.round(it.price_pihps_idr * qty);
    const cur = skuTotals.get(it.sku_id) ?? { qty: 0, total: 0 };
    cur.qty += qty;
    cur.total += line;
    skuTotals.set(it.sku_id, cur);
  }
  const topSkus: TopSkuRow[] = Array.from(skuTotals.entries())
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5)
    .map(([sku_id, agg]) => {
      const sku = skuById.get(sku_id);
      return {
        sku_id,
        name_id: sku?.name_id ?? sku_id,
        qty: agg.qty,
        total: agg.total,
      };
    });

  // Top pasar by trip count (current month)
  const pasarAgg = new Map<string, { tripCount: number; total: number }>();
  for (const e of entries) {
    if (monthKeyOf(new Date(e.confirmed_at)) !== currentMonthKey) continue;
    const label = e.pasar_label?.trim() || "Tidak tercatat";
    const cur = pasarAgg.get(label) ?? { tripCount: 0, total: 0 };
    cur.tripCount += 1;
    pasarAgg.set(label, cur);
  }
  for (const it of items) {
    const e = entryById.get(it.riwayat_id);
    if (!e) continue;
    if (monthKeyOf(new Date(e.confirmed_at)) !== currentMonthKey) continue;
    const label = e.pasar_label?.trim() || "Tidak tercatat";
    const cur = pasarAgg.get(label) ?? { tripCount: 0, total: 0 };
    const qty = Number(it.qty);
    cur.total += it.price_actual_idr != null
      ? Math.round(it.price_actual_idr * qty)
      : Math.round(it.price_pihps_idr * qty);
    pasarAgg.set(label, cur);
  }
  const topPasar: TopPasarRow[] = Array.from(pasarAgg.entries())
    .sort((a, b) => b[1].tripCount - a[1].tripCount)
    .slice(0, 5)
    .map(([pasar_label, agg]) => ({
      pasar_label,
      trip_count: agg.tripCount,
      total: agg.total,
    }));

  return {
    status: "ok",
    currentMonthKey,
    months,
    current,
    previous,
    categories,
    topSkus,
    topPasar,
  };
}
