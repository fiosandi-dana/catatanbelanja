"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSelectedCity } from "@/app/actions/select-city";
import { isValidCityId } from "@/lib/cities";

type AddCatatInput = {
  skuId: string;
  skuName: string;
  unit: string;
  qty: number;
  priceIdr: number | null;
  notes?: string;
};

type AddCatatResult =
  | { ok: true; itemId: string; catatanId: string }
  | { ok: false; error: string };

/**
 * Add an item to the current user's active catatan. Creates the catatan if
 * none exists. Registers the SKU first if it's a custom item from the "+
 * Tambah" flow on Beranda search.
 */
export async function addCatat(input: AddCatatInput): Promise<AddCatatResult> {
  const supabase = await createClient();
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    return { ok: false, error: "Tidak ada sesi. Coba refresh." };
  }

  const cityIdRaw = await getSelectedCity();
  const cityId = isValidCityId(cityIdRaw) ? cityIdRaw : "bekasi";

  // 1. Make sure the SKU exists in the registry (custom items don't yet).
  const skuPayload = {
    sku_id: input.skuId,
    name_id: input.skuName,
    unit: input.unit,
    category: input.skuId.startsWith("custom_") ? "custom" : "lainnya",
    source: input.skuId.startsWith("custom_") ? "custom" : "manual",
    active: true,
  };
  const upResp = await supabase
    .from("skus")
    .upsert(skuPayload as never, { onConflict: "sku_id", ignoreDuplicates: true });
  if (upResp.error) {
    return { ok: false, error: `Gagal mendaftarkan SKU: ${upResp.error.message}` };
  }

  // 2. Find or create active catatan.
  type CatatanRow = { catatan_id: string };
  const findResp = await supabase
    .from("catatans")
    .select("catatan_id")
    .eq("user_id", user.id)
    .eq("state", "active")
    .limit(1);
  if (findResp.error) {
    return { ok: false, error: `Cari catatan: ${findResp.error.message}` };
  }
  let catatanId = ((findResp.data as unknown as CatatanRow[]) ?? [])[0]?.catatan_id;

  if (!catatanId) {
    const catPayload = { user_id: user.id, city_id: cityId, state: "active" };
    const insResp = await supabase
      .from("catatans")
      .insert(catPayload as never)
      .select("catatan_id")
      .single();
    if (insResp.error) {
      return { ok: false, error: `Buat catatan: ${insResp.error.message}` };
    }
    catatanId = (insResp.data as unknown as CatatanRow).catatan_id;
  }

  // 3. Insert the item. Price defaults to 0 when user didn't provide one.
  type InsertedItem = { item_id: string };
  const itemPayload = {
    catatan_id: catatanId,
    sku_id: input.skuId,
    qty: input.qty,
    price_at_add_idr: input.priceIdr ?? 0,
    notes: input.notes ?? null,
  };
  const itemResp = await supabase
    .from("catatan_items")
    .insert(itemPayload as never)
    .select("item_id")
    .single();
  if (itemResp.error) {
    return { ok: false, error: `Tambah item: ${itemResp.error.message}` };
  }
  const itemId = (itemResp.data as unknown as InsertedItem).item_id;

  revalidatePath("/", "layout");
  return { ok: true, itemId, catatanId };
}

type RemoveCatatItemResult = { ok: true } | { ok: false; error: string };

export async function removeCatatItem(itemId: string): Promise<RemoveCatatItemResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tidak ada sesi" };

  const { error } = await supabase
    .from("catatan_items")
    .delete()
    .eq("item_id", itemId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/", "layout");
  return { ok: true };
}

type ConfirmBelanjaInput = { pasarLabel?: string };

type ConfirmBelanjaResult =
  | { ok: true; riwayatId: string }
  | { ok: false; error: string };

/**
 * Archive the active catatan into a riwayat entry. Copies items, snapshots
 * today's PIHPS price as price_pihps_idr. Per PRD §5.6, this happens in a
 * single logical step; we approximate it with sequential idempotent writes.
 */
export async function confirmBelanja(input: ConfirmBelanjaInput): Promise<ConfirmBelanjaResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tidak ada sesi" };

  type CatatanRow = { catatan_id: string; city_id: string };
  const catResp = await supabase
    .from("catatans")
    .select("catatan_id, city_id")
    .eq("user_id", user.id)
    .eq("state", "active")
    .limit(1);
  const cat = ((catResp.data as unknown as CatatanRow[]) ?? [])[0];
  if (!cat) return { ok: false, error: "Tidak ada catatan aktif" };

  // Pull current items + their PIHPS-price-at-add (used as the snapshot)
  type ItemRow = {
    sku_id: string;
    qty: number;
    price_at_add_idr: number;
    notes: string | null;
  };
  const itemResp = await supabase
    .from("catatan_items")
    .select("sku_id, qty, price_at_add_idr, notes")
    .eq("catatan_id", cat.catatan_id);
  if (itemResp.error) return { ok: false, error: itemResp.error.message };
  const items = (itemResp.data as unknown as ItemRow[]) ?? [];
  if (items.length === 0) return { ok: false, error: "Catatan kosong" };

  // 1. Create the riwayat entry
  type RiwayatRow = { riwayat_id: string };
  const entryPayload = {
    user_id: user.id,
    archived_catatan_id: cat.catatan_id,
    city_id: cat.city_id,
    pasar_label: input.pasarLabel?.trim() || null,
  };
  const entryResp = await supabase
    .from("riwayat_entries")
    .insert(entryPayload as never)
    .select("riwayat_id")
    .single();
  if (entryResp.error) return { ok: false, error: entryResp.error.message };
  const riwayatId = (entryResp.data as unknown as RiwayatRow).riwayat_id;

  // 2. Copy items
  const itemRows = items.map((it) => ({
    riwayat_id: riwayatId,
    sku_id: it.sku_id,
    qty: it.qty,
    price_pihps_idr: it.price_at_add_idr,
    notes: it.notes,
  }));
  const copyResp = await supabase
    .from("riwayat_items")
    .insert(itemRows as never);
  if (copyResp.error) return { ok: false, error: copyResp.error.message };

  // 3. Archive the catatan
  const archPayload = { state: "archived", archived_at: new Date().toISOString() };
  const archResp = await supabase
    .from("catatans")
    .update(archPayload as never)
    .eq("catatan_id", cat.catatan_id);
  if (archResp.error) return { ok: false, error: archResp.error.message };

  revalidatePath("/", "layout");
  return { ok: true, riwayatId };
}

export async function updateActualPrice(
  itemId: string,
  priceIdr: number | null,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tidak ada sesi" };

  const updatePayload = { price_actual_idr: priceIdr };
  const { error } = await supabase
    .from("riwayat_items")
    .update(updatePayload as never)
    .eq("riwayat_item_id", itemId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/riwayat", "layout");
  return { ok: true };
}
