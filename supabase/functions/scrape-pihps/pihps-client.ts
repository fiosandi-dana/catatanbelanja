// =============================================================================
// pihps-client.ts — talks to bi.go.id/hargapangan and parses the daily price grid
// =============================================================================
//
// PIHPS ENDPOINT CONTRACT (discovered 2026-06-17)
// -----------------------------------------------
//   GET https://www.bi.go.id/hargapangan/WebSite/TabelHarga/GetGridDataDaerah
//        ?price_type_id=1              // 1=Pasar Tradisional (the one we use),
//                                      //   2=Modern, 3=Pedagang Besar, 4=Produsen.
//                                      //   Phase 1 only scrapes (1) — household
//                                      //   sembako prices for the catat flow.
//        &comcat_id=                    // empty → all commodities; can be a CSV
//                                      //   of category/commodity ids if narrowing.
//        &province_id=<prov_id>         // numeric. From GetRefProvince.
//        &regency_id=<reg_id>           // numeric. From GetRefRegency. The seed
//                                      //   stores both as "<prov>:<reg>" in
//                                      //   cities.pihps_code.
//        &market_id=                    // empty → city-level average (what we want).
//                                      //   Per PRD AD1, no per-pasar fan-out in
//                                      //   Phase 1, so we never set this.
//        &tipe_laporan=1                // 1=Harian (daily). 2/3/4 are weekly/
//                                      //   monthly aggregates — not used.
//        &start_date=YYYY-MM-DDT00:00:00 // ISO local; same value for start+end.
//        &end_date=YYYY-MM-DDT00:00:00
//        &skip=0&take=200               // DevExtreme AspNet pagination. 200 >>
//                                      //   the ~21 commodities returned.
//
// Required-ish request headers (returns 200 either way but matches browser):
//   Accept: application/json
//   X-Requested-With: XMLHttpRequest
//   Referer: https://www.bi.go.id/hargapangan/TabelHarga/PasarTradisionalDaerah
//   User-Agent: <a normal browser UA — bi.go.id sometimes 403s default curl/UA>
//
// RESPONSE SHAPE
//   { "data": [
//       { "no": "I",  "name": "Beras",                  "level": 1, "DD/MM/YYYY": "15,150" },
//       { "no": 1,    "name": "Beras Kualitas Medium I","level": 2, "DD/MM/YYYY": "15,150" },
//       ...
//   ] }
//   - level=1 rows are category aggregates ("Beras", "Cabai Merah"). IGNORE.
//   - level=2 rows are the actual commodities. USE.
//   - The price key is the date in "DD/MM/YYYY" format with thousands ",".
//     Strip the comma → parseInt. Always IDR per kg/L (per PIHPS convention,
//     com_denomination from /WebSite/Home/UpdateChartData).
//
// QUIRKS / FAILURE MODES
//   - Libur nasional (e.g. 16-17 Jun 2026, Idul Adha): response is {"data":[]}.
//     We return null per (sku, city) → caller SKIPs. Frontend then shows
//     "Harga PIHPS · N hari lalu" badge per PRD §5.8.
//   - Some commodities (kacang_tanah, kedelai_impor, ikan_*, susu_bubuk,
//     garam_halus, jagung_pipilan, tepung_terigu) are NOT in price_type_id=1.
//     They show up under price_type_id=3 (Pedagang Besar) or =4 (Produsen)
//     but those aren't household retail prices — out of scope for Phase 1.
//     Their (sku, city) pairs will silently skip every day. Manual seeding
//     is the intended path for these (per PRD §5.2.B).
//   - PIHPS commodity names have inconsistent whitespace ("Cabai Merah
//     Keriting " has a trailing space). We trim before matching.
//   - cities.pihps_code uses "<prov_id>:<reg_id>" (e.g. "12:30" for Bekasi).
//     Splitting here keeps the caller from doing string surgery.
// =============================================================================

// -----------------------------------------------------------------------------
// SKU NAME MAPPING — our sku_id → list of PIHPS commodity names that count
// as a price source. First match wins. Multiple aliases handle slight name
// variants and let us pick a sensible canonical "medium" tier when PIHPS
// reports multiple qualities.
// -----------------------------------------------------------------------------
const SKU_TO_PIHPS_NAMES: Record<string, string[]> = {
  // Beras: PIHPS splits into Bawah/Medium/Super × I/II. We pick a canonical
  // "premium = Super I, medium = Medium I" mapping. Bawah is excluded.
  beras_premium: ["Beras Kualitas Super I"],
  beras_medium: ["Beras Kualitas Medium I"],

  telur_ayam_ras: ["Telur Ayam Ras Segar"],
  daging_ayam_ras: ["Daging Ayam Ras Segar"],
  daging_sapi: ["Daging Sapi Kualitas 1", "Daging Sapi Kualitas 2"],

  minyak_goreng_curah: ["Minyak Goreng Curah"],
  // PIHPS lists "Bermerk 1" and "Bermerk 2"; pick the first available.
  minyak_goreng_kemasan: [
    "Minyak Goreng Kemasan Bermerk 1",
    "Minyak Goreng Kemasan Bermerk 2",
  ],

  // PIHPS splits gula into Premium / Lokal. Use Lokal — it matches what most
  // household shoppers buy. (Premium tracks branded/imported.)
  gula_pasir: ["Gula Pasir Lokal", "Gula Pasir Kualitas Premium"],

  bawang_merah: ["Bawang Merah Ukuran Sedang"],
  bawang_putih: ["Bawang Putih Ukuran Sedang"],
  cabai_merah_keriting: ["Cabai Merah Keriting"], // trim handles trailing space
  cabai_merah_besar: ["Cabai Merah Besar"],
  cabai_rawit_merah: ["Cabai Rawit Merah"],

  // The SKUs below are in our registry but NOT served by PIHPS price_type_id=1.
  // Listed here for transparency; mapping resolves to no match and the scraper
  // skips them daily — the seed/manual flow is expected to fill these in.
  tepung_terigu: [],
  kacang_tanah: [],
  kedelai_impor: [],
  ikan_tongkol: [],
  ikan_kembung: [],
  susu_bubuk: [],
  garam_halus: [],
  jagung_pipilan: [],

  // Phase 1 manually-seeded SKUs (per PRD §5.2.B): no PIHPS source ever.
  galon_air_19l: [],
  gas_lpg_3kg: [],
  indomie_goreng: [],
  susu_uht_1l: [],
};

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------
const PIHPS_BASE =
  "https://www.bi.go.id/hargapangan/WebSite/TabelHarga/GetGridDataDaerah";
const PIHPS_REFERER =
  "https://www.bi.go.id/hargapangan/TabelHarga/PasarTradisionalDaerah";
const USER_AGENT =
  "Mozilla/5.0 (compatible; PasarDANA-Scraper/1.0; +https://catatanbelanja.vercel.app)";
const FETCH_TIMEOUT_MS = 15_000;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
interface PihpsGridRow {
  no: string | number;
  name: string;
  level: 1 | 2;
  // Plus one key like "16/06/2026": "15,150" (or value=null on missing).
  [dateKey: string]: string | number | null;
}

interface PihpsGridResponse {
  data: PihpsGridRow[];
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
function formatStartEnd(date: Date): string {
  // PIHPS wants local-Jakarta date, no TZ suffix. We format YYYY-MM-DDT00:00:00
  // using UTC parts since the caller passes a UTC `Date` representing a WIB day.
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T00:00:00`;
}

function formatDateKey(date: Date): string {
  // PIHPS response key is DD/MM/YYYY (no leading-zero coercion needed since
  // the source always pads; we pad too for safety).
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy}`;
}

function parsePrice(raw: unknown): number | null {
  if (raw === null || raw === undefined) return null;
  const s = String(raw).trim();
  if (!s || s === "-" || s === "0") return null;
  // Strip thousands separator. PIHPS uses "," as thousands; never decimals
  // because IDR is integer.
  const n = parseInt(s.replace(/[,.]/g, ""), 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

// -----------------------------------------------------------------------------
// One-shot: fetch the entire daily grid for a city, return name→price map.
// We do this per-city (not per-sku) because PIHPS returns all ~21 commodities
// in a single call — issuing 21 separate requests per city would be wasteful
// and rude to bi.go.id.
// -----------------------------------------------------------------------------
async function fetchCityGrid(
  cityPihpsCode: string,
  date: Date,
): Promise<Map<string, number> | null> {
  const [provId, regId] = cityPihpsCode.split(":");
  if (!provId || !regId) {
    console.error(
      `[pihps-client] malformed pihps_code "${cityPihpsCode}", expected "<prov>:<reg>"`,
    );
    return null;
  }

  const startEnd = formatStartEnd(date);
  const url =
    `${PIHPS_BASE}` +
    `?price_type_id=1` +
    `&comcat_id=` +
    `&province_id=${encodeURIComponent(provId)}` +
    `&regency_id=${encodeURIComponent(regId)}` +
    `&market_id=` +
    `&tipe_laporan=1` +
    `&start_date=${encodeURIComponent(startEnd)}` +
    `&end_date=${encodeURIComponent(startEnd)}` +
    `&skip=0&take=200`;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "X-Requested-With": "XMLHttpRequest",
        "Referer": PIHPS_REFERER,
        "User-Agent": USER_AGENT,
      },
      signal: ctrl.signal,
    });

    if (!res.ok) {
      console.warn(
        `[pihps-client] HTTP ${res.status} for ${cityPihpsCode} ${formatDateKey(date)}`,
      );
      return null;
    }

    const json = (await res.json()) as PihpsGridResponse;
    const rows = json?.data ?? [];
    if (rows.length === 0) {
      // Holiday / no-data day. Caller logs and moves on.
      return new Map();
    }

    const dateKey = formatDateKey(date);
    const out = new Map<string, number>();
    for (const row of rows) {
      if (row.level !== 2) continue; // skip category aggregates
      const price = parsePrice(row[dateKey]);
      if (price === null) continue;
      out.set(row.name.trim(), price);
    }
    return out;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(
      `[pihps-client] fetch failed for ${cityPihpsCode} ${formatDateKey(date)}: ${msg}`,
    );
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// -----------------------------------------------------------------------------
// Cache: one grid fetch per (city, date) is reused across all SKUs in the run.
// The cache lives for the lifetime of the Edge Function invocation — Deno
// isolate is recycled between cron runs, so no stale-data risk.
// -----------------------------------------------------------------------------
const gridCache = new Map<string, Promise<Map<string, number> | null>>();

function cacheKey(cityPihpsCode: string, date: Date): string {
  return `${cityPihpsCode}|${formatDateKey(date)}`;
}

// -----------------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------------

/**
 * Fetch the PIHPS daily price (IDR) for one (sku, city, date) tuple.
 *
 * @param skuId         our local sku_id (e.g. "telur_ayam_ras"). Drives the
 *                      mapping in SKU_TO_PIHPS_NAMES.
 * @param cityPihpsCode "<prov_id>:<reg_id>" from cities.pihps_code (e.g. "12:30"
 *                      for Bekasi).
 * @param date          the target date (UTC Date representing a WIB day).
 * @returns             integer IDR price, or null if PIHPS has no data for
 *                      this tuple. Never throws on expected failures — the
 *                      caller treats null as "skip this row".
 */
export async function fetchPihpsPrice(
  skuId: string,
  cityPihpsCode: string,
  date: Date,
): Promise<number | null> {
  const pihpsNames = SKU_TO_PIHPS_NAMES[skuId];
  if (!pihpsNames || pihpsNames.length === 0) {
    // SKU not served by PIHPS price_type_id=1; expected for manual-seed SKUs.
    return null;
  }

  const key = cacheKey(cityPihpsCode, date);
  let pending = gridCache.get(key);
  if (!pending) {
    pending = fetchCityGrid(cityPihpsCode, date);
    gridCache.set(key, pending);
  }
  const grid = await pending;
  if (!grid || grid.size === 0) return null;

  for (const name of pihpsNames) {
    const price = grid.get(name.trim());
    if (price !== undefined) return price;
  }
  return null;
}

/**
 * Clears the per-invocation grid cache. Exposed for tests; the Edge Function
 * entry point does NOT need to call this (isolate recycle handles it).
 */
export function _resetCache(): void {
  gridCache.clear();
}
