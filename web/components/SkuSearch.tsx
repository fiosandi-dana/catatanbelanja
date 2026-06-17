"use client";

import { useMemo, useState } from "react";
import { CatatButton } from "./CatatButton";
import type { SkuPriceRow } from "@/lib/queries/all-prices";

const ICONS: Record<string, string> = {
  // Karbohidrat
  beras_premium: "🍚", beras_medium: "🍚", beras_pandan: "🍚",
  jagung_pipilan: "🌽", jagung_manis: "🌽",
  sagu: "🌾", singkong: "🥔", ubi_jalar: "🍠", kentang: "🥔",
  tepung_terigu: "🌾", tepung_tapioka: "🌾",
  mi_instan: "🍜", indomie: "🍜", bihun: "🍜", roti_tawar: "🍞",
  // Minyak & pemanis
  minyak_goreng_curah: "🛢️", minyak_goreng_kemasan: "🛢️", minyak_kelapa: "🥥",
  margarin: "🧈", gula_pasir: "🍬", gula_merah: "🍯", madu: "🍯",
  // Protein hewani
  telur_ayam_ras: "🥚", telur_bebek: "🥚", telur_puyuh: "🥚",
  daging_ayam_ras: "🍗", daging_ayam_kampung: "🍗",
  daging_sapi: "🥩", daging_kambing: "🥩",
  ikan_bandeng: "🐟", ikan_kembung: "🐟", ikan_tongkol: "🐟", ikan_teri: "🐟",
  udang: "🦐", cumi: "🦑",
  sarden_kaleng: "🥫", kornet_sapi: "🥫", sosis: "🌭", bakso: "🍢", nugget_ayam: "🍗",
  // Protein nabati
  kedelai_impor: "🫘", tahu: "🟫", tempe: "🟫", kacang_hijau: "🫘", kacang_tanah: "🥜",
  // Susu
  skm: "🥛", susu_bubuk: "🥛", susu_uht: "🥛", susu_formula_bayi: "🍼",
  keju_cheddar: "🧀", yogurt: "🥛",
  // Bumbu
  garam_halus: "🧂", bawang_merah: "🧅", bawang_putih: "🧄", bawang_bombay: "🧅",
  cabai_merah_keriting: "🌶️", cabai_merah_besar: "🌶️",
  cabai_rawit_merah: "🌶️", cabai_rawit_hijau: "🌶️",
  merica: "⚫", ketumbar: "🌰", kemiri: "🌰",
  msg: "🥄", kaldu_bubuk: "🥄",
  kecap_manis: "🍶", kecap_asin: "🍶", saus_cabai: "🌶️", saus_tomat: "🍅",
  asam_jawa: "🌰", jahe: "🫚", kunyit: "🟠", lengkuas: "🫚",
  daun_salam: "🌿", sereh: "🌿",
  terasi: "🦐", tepung_bumbu: "🌾", bumbu_pasta: "🥫",
  // Sayuran
  tomat: "🍅", wortel: "🥕", kubis: "🥬", sawi_hijau: "🥬", sawi_putih: "🥬",
  kangkung: "🥬", bayam: "🥬", kacang_panjang: "🫛", buncis: "🫛",
  timun: "🥒", tauge: "🌱", daun_bawang: "🌿", seledri: "🌿",
  // Buah
  pisang: "🍌", jeruk: "🍊", pepaya: "🥭", semangka: "🍉", melon: "🍈", apel: "🍎",
  // Instan
  kerupuk_mentah: "🍘",
  // Minuman
  galon_air: "💧", amdk_botol: "🥤",
  teh_celup: "🍵", kopi_bubuk: "☕", sirup: "🥤", cokelat_bubuk: "🍫", selai: "🍯",
  // Energi
  gas_lpg: "🔥", gas_lpg_12kg: "🔥", minyak_tanah: "🛢️",
  // Sanitasi
  sabun_mandi: "🧼", sampo: "🧴", pasta_gigi: "🪥", sikat_gigi: "🪥",
  deterjen: "🧺", pewangi_pakaian: "🌸", sabun_cuci_piring: "🧴",
  pembersih_lantai: "🧹", tisu: "🧻", obat_nyamuk: "🦟",
};

function iconFor(skuId: string): string {
  return ICONS[skuId] ?? "🛒";
}

function formatIdr(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFKD").replace(/\s+/g, " ").trim();
}

function customSkuIdFor(query: string): string {
  return (
    "custom_" +
    normalize(query)
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 40)
  );
}

export function SkuSearch({ skus }: { skus: SkuPriceRow[] }) {
  const [query, setQuery] = useState("");

  const trimmed = query.trim();
  const filtered = useMemo(() => {
    if (!trimmed) return [];
    const q = normalize(trimmed);
    return skus
      .filter((s) => normalize(s.name_id).includes(q))
      .slice(0, 12);
  }, [trimmed, skus]);

  const showAddOther = trimmed.length >= 2 && filtered.length === 0;

  return (
    <div>
      <div className="relative">
        <span
          className="absolute left-fiat-m top-1/2 -translate-y-1/2 text-text-medium"
          aria-hidden
        >
          🔍
        </span>
        <input
          type="search"
          inputMode="search"
          value={query}
          onChange={(e) => setQuery(e.target.value.slice(0, 60))}
          placeholder="Cari sembako lain… (mis. tepung, ikan, susu)"
          className="w-full rounded-full bg-bg-base focus:bg-bg-card border border-outline-base focus:border-dana-blue focus:outline-none focus:ring-2 focus:ring-dana-blue/30 pl-10 pr-4 py-fiat-s text-body-m text-text-strong placeholder:text-text-subtle"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Hapus pencarian"
            className="absolute right-fiat-s top-1/2 -translate-y-1/2 text-text-subtle hover:text-text-strong text-body-l w-7 h-7 flex items-center justify-center"
          >
            ×
          </button>
        )}
      </div>

      {trimmed && (
        <ul className="mt-fiat-m divide-y divide-outline-base">
          {filtered.map((sku) => (
            <li
              key={sku.sku_id}
              className="flex items-center gap-fiat-m py-fiat-m"
            >
              <span
                className="text-[28px] leading-none w-10 text-center"
                aria-hidden
              >
                {iconFor(sku.sku_id)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-body-l font-semibold text-text-strong truncate">
                  {sku.name_id}
                </p>
                <p className="text-body-s text-text-medium">
                  {sku.price_idr != null
                    ? `${formatIdr(sku.price_idr)} / ${sku.unit}`
                    : `Belum ada harga PIHPS · ${sku.unit}`}
                </p>
              </div>
              <CatatButton
                skuId={sku.sku_id}
                skuName={sku.name_id}
                unit={sku.unit}
                priceIdr={sku.price_idr}
                icon={iconFor(sku.sku_id)}
              />
            </li>
          ))}

          {showAddOther && (
            <li className="flex items-center gap-fiat-m py-fiat-m">
              <span
                className="text-[28px] leading-none w-10 text-center"
                aria-hidden
              >
                ➕
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-body-l font-semibold text-text-strong truncate">
                  Tambah “{trimmed}”
                </p>
                <p className="text-body-s text-text-medium">
                  Belum ada di daftar PIHPS — catat sebagai item lain.
                </p>
              </div>
              <CatatButton
                skuId={customSkuIdFor(trimmed)}
                skuName={trimmed}
                unit="kg"
                priceIdr={null}
                icon="🛒"
                isCustom
                label="Tambah"
                variant="ghost"
                onAfterConfirm={() => setQuery("")}
              />
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
