"use client";

import { useOptimistic, useState, useTransition } from "react";
import { removeCatatItem } from "@/app/actions/catat";
import { notifyCatat } from "@/lib/catat-events";
import { ConfirmBelanjaSheet } from "./ConfirmBelanjaSheet";
import type { CatatanItemRow } from "@/lib/queries/catatan";

const ICONS: Record<string, string> = {
  beras_premium: "🍚", beras_medium: "🍚", beras_pandan: "🍚",
  jagung_pipilan: "🌽", jagung_manis: "🌽",
  sagu: "🌾", singkong: "🥔", ubi_jalar: "🍠", kentang: "🥔",
  tepung_terigu: "🌾", tepung_tapioka: "🌾",
  mi_instan: "🍜", indomie: "🍜", bihun: "🍜", roti_tawar: "🍞",
  minyak_goreng_curah: "🛢️", minyak_goreng_kemasan: "🛢️", minyak_kelapa: "🥥",
  margarin: "🧈", gula_pasir: "🍬", gula_merah: "🍯", madu: "🍯",
  telur_ayam_ras: "🥚", telur_bebek: "🥚", telur_puyuh: "🥚",
  daging_ayam_ras: "🍗", daging_ayam_kampung: "🍗",
  daging_sapi: "🥩", daging_kambing: "🥩",
  ikan_bandeng: "🐟", ikan_kembung: "🐟", ikan_tongkol: "🐟", ikan_teri: "🐟",
  udang: "🦐", cumi: "🦑",
  sarden_kaleng: "🥫", kornet_sapi: "🥫", sosis: "🌭", bakso: "🍢", nugget_ayam: "🍗",
  kedelai_impor: "🫘", tahu: "🟫", tempe: "🟫", kacang_hijau: "🫘", kacang_tanah: "🥜",
  skm: "🥛", susu_bubuk: "🥛", susu_uht: "🥛", susu_formula_bayi: "🍼",
  keju_cheddar: "🧀", yogurt: "🥛",
  garam_halus: "🧂", bawang_merah: "🧅", bawang_putih: "🧄", bawang_bombay: "🧅",
  cabai_merah_keriting: "🌶️", cabai_merah_besar: "🌶️",
  cabai_rawit_merah: "🌶️", cabai_rawit_hijau: "🌶️",
  merica: "⚫", ketumbar: "🌰", kemiri: "🌰",
  msg: "🥄", kaldu_bubuk: "🥄",
  kecap_manis: "🍶", kecap_asin: "🍶", saus_cabai: "🌶️", saus_tomat: "🍅",
  asam_jawa: "🌰", jahe: "🫚", kunyit: "🟠", lengkuas: "🫚",
  daun_salam: "🌿", sereh: "🌿",
  terasi: "🦐", tepung_bumbu: "🌾", bumbu_pasta: "🥫",
  tomat: "🍅", wortel: "🥕", kubis: "🥬", sawi_hijau: "🥬", sawi_putih: "🥬",
  kangkung: "🥬", bayam: "🥬", kacang_panjang: "🫛", buncis: "🫛",
  timun: "🥒", tauge: "🌱", daun_bawang: "🌿", seledri: "🌿",
  pisang: "🍌", jeruk: "🍊", pepaya: "🥭", semangka: "🍉", melon: "🍈", apel: "🍎",
  kerupuk_mentah: "🍘",
  galon_air: "💧", amdk_botol: "🥤",
  teh_celup: "🍵", kopi_bubuk: "☕", sirup: "🥤", cokelat_bubuk: "🍫", selai: "🍯",
  gas_lpg: "🔥", gas_lpg_12kg: "🔥", minyak_tanah: "🛢️",
  sabun_mandi: "🧼", sampo: "🧴", pasta_gigi: "🪥", sikat_gigi: "🪥",
  deterjen: "🧺", pewangi_pakaian: "🌸", sabun_cuci_piring: "🧴",
  pembersih_lantai: "🧹", tisu: "🧻", obat_nyamuk: "🦟",
};

function iconFor(skuId: string): string {
  if (skuId.startsWith("custom_")) return "🛒";
  return ICONS[skuId] ?? "🛒";
}

function formatIdr(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export function CatatanList({
  items: serverItems,
  totalIdr: serverTotalIdr,
}: {
  items: CatatanItemRow[];
  totalIdr: number;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [optimisticItems, setOptimisticItems] = useOptimistic(
    serverItems,
    (current, removedId: string) =>
      current.filter((it) => it.item_id !== removedId),
  );

  const items = optimisticItems;
  const totalIdr =
    items === serverItems
      ? serverTotalIdr
      : items.reduce(
          (sum, it) => sum + Math.round(it.price_at_add_idr * it.qty),
          0,
        );

  function handleRemove(itemId: string) {
    startTransition(async () => {
      setOptimisticItems(itemId);
      notifyCatat("removed", 1);
      const result = await removeCatatItem(itemId);
      if (!result.ok) {
        notifyCatat("added", 1);
        setErrorMsg(result.error);
      }
    });
  }

  return (
    <>
      <ul className="divide-y divide-outline-base">
        {items.map((it) => {
          const lineTotal = Math.round(it.price_at_add_idr * it.qty);
          const qtyStr = Number.isInteger(it.qty) ? `${it.qty}` : `${it.qty}`;
          return (
            <li key={it.item_id} className="flex items-start gap-fiat-m py-fiat-m">
              <span className="text-[28px] leading-none w-10 text-center" aria-hidden>
                {iconFor(it.sku_id)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-body-l font-semibold text-text-strong truncate">
                  {it.name_id}
                </p>
                <p className="text-body-s text-text-medium">
                  {qtyStr} {it.unit}
                  {it.price_at_add_idr > 0 && ` × ${formatIdr(it.price_at_add_idr)}`}
                </p>
                {it.notes && (
                  <p className="mt-fiat-xs text-body-s text-text-subtle italic truncate">
                    “{it.notes}”
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-fiat-xs shrink-0">
                <span className="text-body-l font-bold text-text-strong">
                  {lineTotal > 0 ? formatIdr(lineTotal) : "—"}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(it.item_id)}
                  disabled={pending}
                  aria-label="Hapus item"
                  className="text-body-s text-text-subtle hover:text-feedback-error disabled:opacity-40"
                >
                  Hapus
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-fiat-l flex items-center justify-between p-fiat-m bg-bg-base rounded-lg">
        <span className="text-body-m text-text-medium">Total estimasi</span>
        <span className="text-section-title font-bold text-text-strong">
          {formatIdr(totalIdr)}
        </span>
      </div>

      {errorMsg && (
        <p className="mt-fiat-s text-body-s text-feedback-error">⚠️ {errorMsg}</p>
      )}

      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        disabled={pending || items.length === 0}
        className="mt-fiat-l w-full rounded-md bg-dana-blue hover:bg-dana-blue-60 active:bg-dana-blue-60 transition-colors text-white text-body-l font-semibold py-fiat-m disabled:opacity-50"
      >
        Sudah belanja ini
      </button>

      <ConfirmBelanjaSheet
        items={items}
        totalPihpsIdr={totalIdr}
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  );
}
