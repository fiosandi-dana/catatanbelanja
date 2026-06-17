import { createClient } from "@/lib/supabase/server";

export type CatatanItemRow = {
  item_id: string;
  sku_id: string;
  name_id: string;
  unit: string;
  qty: number;
  price_at_add_idr: number;
  added_at: string;
  notes: string | null;
};

export type ActiveCatatanResult = {
  catatan_id: string | null;
  city_id: string | null;
  items: CatatanItemRow[];
  total_idr: number;
};

/**
 * Read the current user's single active catatan + its items, joined with SKU
 * metadata for display. Returns an empty shape if there is no active catatan
 * (e.g., user has never tapped "+ Catat" or just confirmed a belanja).
 */
export async function getActiveCatatan(): Promise<ActiveCatatanResult> {
  const empty: ActiveCatatanResult = {
    catatan_id: null,
    city_id: null,
    items: [],
    total_idr: 0,
  };

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return empty;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return empty;

  type CatatanRow = { catatan_id: string; city_id: string };
  const catResp = await supabase
    .from("catatans")
    .select("catatan_id, city_id")
    .eq("user_id", user.id)
    .eq("state", "active")
    .limit(1);
  if (catResp.error) return empty;
  const catRows = (catResp.data as unknown as CatatanRow[]) ?? [];
  if (catRows.length === 0) return empty;
  const cat = catRows[0]!;

  type ItemRow = {
    item_id: string;
    sku_id: string;
    qty: number;
    price_at_add_idr: number;
    added_at: string;
    notes: string | null;
  };
  type SkuMeta = { sku_id: string; name_id: string; unit: string };

  const [itemResp, skuResp] = await Promise.all([
    supabase
      .from("catatan_items")
      .select("item_id, sku_id, qty, price_at_add_idr, added_at, notes")
      .eq("catatan_id", cat.catatan_id)
      .order("added_at", { ascending: false }),
    supabase
      .from("skus")
      .select("sku_id, name_id, unit"),
  ]);
  if (itemResp.error) return { ...empty, catatan_id: cat.catatan_id, city_id: cat.city_id };

  const items = (itemResp.data as unknown as ItemRow[]) ?? [];
  const skus = (skuResp.data as unknown as SkuMeta[]) ?? [];
  const skuById = new Map(skus.map((s) => [s.sku_id, s]));

  const enriched: CatatanItemRow[] = items.map((it) => {
    const sku = skuById.get(it.sku_id);
    return {
      item_id: it.item_id,
      sku_id: it.sku_id,
      name_id: sku?.name_id ?? it.sku_id,
      unit: sku?.unit ?? "pcs",
      qty: Number(it.qty),
      price_at_add_idr: it.price_at_add_idr,
      added_at: it.added_at,
      notes: it.notes,
    };
  });

  const total_idr = enriched.reduce(
    (sum, it) => sum + Math.round(it.price_at_add_idr * it.qty),
    0,
  );

  return {
    catatan_id: cat.catatan_id,
    city_id: cat.city_id,
    items: enriched,
    total_idr,
  };
}

export async function getActiveCatatanItemCount(): Promise<number> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return 0;
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  type CatatanRow = { catatan_id: string };
  const catResp = await supabase
    .from("catatans")
    .select("catatan_id")
    .eq("user_id", user.id)
    .eq("state", "active")
    .limit(1);
  const catRows = (catResp.data as unknown as CatatanRow[]) ?? [];
  if (catRows.length === 0) return 0;

  const { count, error } = await supabase
    .from("catatan_items")
    .select("*", { count: "exact", head: true })
    .eq("catatan_id", catRows[0]!.catatan_id);
  if (error) return 0;
  return count ?? 0;
}
