import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/Card";
import { Header } from "@/components/Header";
import { SectionTitle } from "@/components/SectionTitle";
import { RiwayatDetailItem } from "@/components/RiwayatDetailItem";
import { createClient } from "@/lib/supabase/server";
import { cityNameOf } from "@/lib/cities";

function formatIdr(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function formatDateLong(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const ICONS: Record<string, string> = {
  beras_premium: "🍚", beras_medium: "🍚", telur_ayam_ras: "🥚",
  daging_ayam_ras: "🍗", daging_sapi: "🥩",
  minyak_goreng_curah: "🛢️", minyak_goreng_kemasan: "🛢️",
  gula_pasir: "🍬", bawang_merah: "🧅", bawang_putih: "🧄",
  cabai_merah_keriting: "🌶️", cabai_merah_besar: "🌶️", cabai_rawit_merah: "🌶️",
};
function iconFor(skuId: string): string {
  return ICONS[skuId] ?? "🛒";
}

export default async function RiwayatDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  type EntryRow = {
    riwayat_id: string;
    pasar_label: string | null;
    city_id: string;
    confirmed_at: string;
  };
  const entryResp = await supabase
    .from("riwayat_entries")
    .select("riwayat_id, pasar_label, city_id, confirmed_at")
    .eq("riwayat_id", id)
    .eq("user_id", user.id)
    .limit(1);
  const entryRows = (entryResp.data as unknown as EntryRow[]) ?? [];
  if (entryResp.error || entryRows.length === 0) notFound();
  const entry = entryRows[0]!;

  type ItemRow = {
    riwayat_item_id: string;
    sku_id: string;
    qty: number;
    price_pihps_idr: number;
    price_actual_idr: number | null;
    notes: string | null;
  };
  type SkuMeta = { sku_id: string; name_id: string; unit: string };

  const [itemResp, skuResp] = await Promise.all([
    supabase
      .from("riwayat_items")
      .select("riwayat_item_id, sku_id, qty, price_pihps_idr, price_actual_idr, notes")
      .eq("riwayat_id", id),
    supabase.from("skus").select("sku_id, name_id, unit"),
  ]);

  const items = (itemResp.data as unknown as ItemRow[]) ?? [];
  const skuById = new Map(
    ((skuResp.data as unknown as SkuMeta[]) ?? []).map((s) => [s.sku_id, s]),
  );

  const totalPihps = items.reduce(
    (sum, it) => sum + Math.round(it.price_pihps_idr * Number(it.qty)),
    0,
  );
  const filledActuals = items.filter((it) => it.price_actual_idr != null);
  const totalActual =
    filledActuals.length === items.length && items.length > 0
      ? items.reduce(
          (sum, it) => sum + Math.round((it.price_actual_idr ?? 0) * Number(it.qty)),
          0,
        )
      : null;

  return (
    <div>
      <Header
        title="Detail Belanja"
        leftSlot={
          <Link
            href="/riwayat"
            className="inline-flex items-center gap-fiat-xs rounded-md bg-white/15 hover:bg-white/25 transition-colors px-fiat-m py-fiat-xs text-body-m font-medium text-white"
          >
            ← Kembali
          </Link>
        }
      />
      <div className="-mt-fiat-l px-fiat-l space-y-fiat-m">
        <Card>
          <p className="text-body-s text-text-subtle">
            {formatDateLong(entry.confirmed_at)}
          </p>
          <SectionTitle>
            {entry.pasar_label || `Pasar di ${cityNameOf(entry.city_id)}`}
          </SectionTitle>
          <div className="mt-fiat-m flex items-baseline justify-between">
            <span className="text-body-m text-text-medium">Total PIHPS</span>
            <span className="text-body-l font-bold text-text-strong">
              {formatIdr(totalPihps)}
            </span>
          </div>
          {totalActual != null && (
            <div className="mt-fiat-xs flex items-baseline justify-between">
              <span className="text-body-m text-text-medium">Total dibayar</span>
              <span
                className={`text-body-l font-bold ${
                  totalActual < totalPihps
                    ? "text-feedback-success"
                    : totalActual > totalPihps
                      ? "text-feedback-warning"
                      : "text-text-strong"
                }`}
              >
                {formatIdr(totalActual)}
              </span>
            </div>
          )}
        </Card>

        <Card>
          <SectionTitle>Per item</SectionTitle>
          <p className="mt-fiat-xs text-body-s text-text-subtle">
            Isi harga aktual untuk menghitung selisih dari PIHPS.
          </p>
          <ul className="mt-fiat-m divide-y divide-outline-base">
            {items.map((it) => {
              const sku = skuById.get(it.sku_id);
              const name = sku?.name_id ?? it.sku_id;
              const unit = sku?.unit ?? "pcs";
              const qty = Number(it.qty);
              return (
                <li
                  key={it.riwayat_item_id}
                  className="flex items-start gap-fiat-m py-fiat-m"
                >
                  <span className="text-[28px] leading-none w-10 text-center" aria-hidden>
                    {iconFor(it.sku_id)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-l font-semibold text-text-strong truncate">
                      {name}
                    </p>
                    <p className="text-body-s text-text-medium">
                      {qty} {unit} × PIHPS {formatIdr(it.price_pihps_idr)}
                    </p>
                    {it.notes && (
                      <p className="mt-fiat-xs text-body-s text-text-subtle italic truncate">
                        “{it.notes}”
                      </p>
                    )}
                    <div className="mt-fiat-s">
                      <RiwayatDetailItem
                        itemId={it.riwayat_item_id}
                        pihpsPrice={it.price_pihps_idr}
                        initialActual={it.price_actual_idr}
                        unit={unit}
                        qty={qty}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </div>
  );
}
