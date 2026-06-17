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
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .replace(/\s+/g, " ")
    .trim();
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

/**
 * Subsequence fuzzy match. Returns a score (higher = better) or 0 if no match.
 * - Exact equality → 1000
 * - Whole-word startsWith → 900
 * - startsWith query → 800
 * - Substring → 500–700 (closer to start = higher)
 * - Subsequence (chars in order, gaps allowed) → 100–400 (fewer gaps = higher)
 * - No match → 0
 *
 * Inspired by the Sublime/VS Code command-palette fuzzy match.
 */
function scoreMatch(name: string, query: string): number {
  const n = normalize(name);
  const q = normalize(query);
  if (!q) return 0;
  if (n === q) return 1000;
  if (n.startsWith(q + " ") || n === q) return 950;
  if (n.startsWith(q)) return 800;
  // Word-prefix match: any space-separated token starts with query
  for (const word of n.split(" ")) {
    if (word.startsWith(q)) return 700;
  }
  const idx = n.indexOf(q);
  if (idx !== -1) {
    // Earlier substring is better
    return 600 - Math.min(idx, 100);
  }
  // Subsequence with gap penalty
  let qi = 0;
  let lastMatchIdx = -1;
  let totalGap = 0;
  let consecutive = 0;
  let maxConsecutive = 0;
  for (let ni = 0; ni < n.length && qi < q.length; ni++) {
    if (n[ni] === q[qi]) {
      if (lastMatchIdx !== -1) {
        const gap = ni - lastMatchIdx - 1;
        totalGap += gap;
        if (gap === 0) consecutive++;
        else {
          maxConsecutive = Math.max(maxConsecutive, consecutive);
          consecutive = 0;
        }
      }
      lastMatchIdx = ni;
      qi++;
    }
  }
  maxConsecutive = Math.max(maxConsecutive, consecutive);
  if (qi < q.length) return 0; // didn't match all query chars
  // Score: 400 base − gap penalty + consecutive bonus
  return Math.max(50, 400 - totalGap * 8 + maxConsecutive * 12);
}

export function SkuSearch({ skus }: { skus: SkuPriceRow[] }) {
  const [query, setQuery] = useState("");

  const trimmed = query.trim();
  const filtered = useMemo(() => {
    if (!trimmed) return [];
    const scored: { sku: SkuPriceRow; score: number }[] = [];
    for (const s of skus) {
      const score = scoreMatch(s.name_id, trimmed);
      if (score > 0) scored.push({ sku: s, score });
    }
    scored.sort(
      (a, b) =>
        b.score - a.score || a.sku.name_id.localeCompare(b.sku.name_id, "id"),
    );
    return scored.slice(0, 12).map((x) => x.sku);
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
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          enterKeyHint="search"
          value={query}
          onChange={(e) => setQuery(e.target.value.slice(0, 60))}
          placeholder="Cari sembako… (mis. trgu, kacng, sabn)"
          className="w-full rounded-full bg-bg-base focus:bg-bg-card border border-outline-base focus:border-dana-blue focus:outline-none focus:ring-2 focus:ring-dana-blue/30 pl-10 pr-10 py-fiat-s text-body-m text-text-strong placeholder:text-text-subtle"
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

      {!trimmed && (
        <p className="mt-fiat-s text-body-s text-text-subtle">
          Tip: typo bisa, fuzzy search aktif — ketik <code className="text-text-medium">trgu</code> ketemu Tepung Terigu, <code className="text-text-medium">kacng</code> ketemu Kacang Hijau.
        </p>
      )}

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
