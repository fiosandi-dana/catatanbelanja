// =============================================================================
// scrape-pihps — Supabase Edge Function (Deno + TypeScript)
//
// Triggered daily by pg_cron (see supabase/migrations/0002_pihps_cron.sql).
// Fetches city × SKU sembako prices from bi.go.id/hargapangan and writes
// them into the `price_snapshots` table. Idempotent via the table's PK
// (sku_id, city_id, snapshot_date) + ON CONFLICT DO NOTHING.
//
// Contract (per BUILD_PLAN.md §4 and .claude/agents/pasar-pihps-scraper.md):
//   POST /functions/v1/scrape-pihps
//   Header: Authorization: Bearer <CRON_SECRET>
//   Body:   none (any body is ignored)
//   200:    { ok: true, snapshot_date, scraped, skipped, failures, duration_ms }
//   401:    { ok: false, error: "unauthorized" }
//   500:    { ok: false, error: <message> }     // pg_cron will retry next day
// =============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { fetchPihpsPrice } from "./pihps-client.ts";

// -----------------------------------------------------------------------------
// Env (read once at boot; Edge Function isolate caches them across requests)
// -----------------------------------------------------------------------------
const CRON_SECRET = Deno.env.get("CRON_SECRET") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

if (!CRON_SECRET) console.warn("[scrape-pihps] CRON_SECRET not set");
if (!SUPABASE_URL) console.warn("[scrape-pihps] SUPABASE_URL not set");
if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.warn("[scrape-pihps] SUPABASE_SERVICE_ROLE_KEY not set");
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

/**
 * Today in WIB (UTC+7). pg_cron fires at 01:00 UTC = 08:00 WIB, so this
 * always corresponds to the calendar day in Indonesia.
 *
 * Returns:
 *   - dateUtc: Date object whose UTC YYYY-MM-DD == today in WIB
 *   - isoDate: 'YYYY-MM-DD' string for INSERT into snapshot_date
 */
function todayInWib(): { dateUtc: Date; isoDate: string } {
  const nowUtc = new Date();
  // shift +7h, then read UTC parts — gives us the WIB calendar date.
  const wibMs = nowUtc.getTime() + 7 * 60 * 60 * 1000;
  const wib = new Date(wibMs);
  const yyyy = wib.getUTCFullYear();
  const mm = String(wib.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(wib.getUTCDate()).padStart(2, "0");
  const isoDate = `${yyyy}-${mm}-${dd}`;
  // Build a Date at exactly 00:00 UTC on that WIB calendar day; pihps-client
  // reads UTC parts to derive its query date.
  const dateUtc = new Date(`${isoDate}T00:00:00Z`);
  return { dateUtc, isoDate };
}

// -----------------------------------------------------------------------------
// Main handler
// -----------------------------------------------------------------------------
Deno.serve(async (req: Request): Promise<Response> => {
  const t0 = performance.now();

  if (req.method !== "POST") {
    return jsonResponse(405, { ok: false, error: "method_not_allowed" });
  }

  // Auth — constant-ish check; we don't time-equal because Deno doesn't ship
  // a stable timing-safe equal, and the secret is high-entropy + sent over TLS.
  const auth = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${CRON_SECRET}`;
  if (!CRON_SECRET || auth !== expected) {
    return jsonResponse(401, { ok: false, error: "unauthorized" });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // ----- Load active SKUs and cities -----------------------------------
    type SkuRow = { sku_id: string };
    type CityRow = { city_id: string; pihps_code: string };

    const [{ data: skus, error: skuErr }, { data: cities, error: cityErr }] =
      await Promise.all([
        supabase.from("skus")
          .select<SkuRow>("sku_id")
          .eq("active", true),
        supabase.from("cities")
          .select<CityRow>("city_id, pihps_code")
          .eq("active", true),
      ]);

    if (skuErr) throw new Error(`skus query: ${skuErr.message}`);
    if (cityErr) throw new Error(`cities query: ${cityErr.message}`);

    const skuList: SkuRow[] = skus ?? [];
    const cityList: CityRow[] = cities ?? [];
    const { dateUtc, isoDate } = todayInWib();

    console.log(
      `[scrape-pihps] start snapshot_date=${isoDate} skus=${skuList.length} cities=${cityList.length}`,
    );

    let scraped = 0;
    let skipped = 0;
    let failures = 0;

    // ----- For each (sku, city), fetch + insert --------------------------
    // We iterate city-outer / sku-inner so pihps-client's per-city grid cache
    // is fully utilised: only one HTTP call per city per run.
    for (const city of cityList) {
      for (const sku of skuList) {
        let price: number | null = null;
        try {
          price = await fetchPihpsPrice(sku.sku_id, city.pihps_code, dateUtc);
        } catch (err) {
          // pihps-client already swallows expected failures; if we land
          // here, treat as a per-pair failure but keep iterating.
          failures += 1;
          const msg = err instanceof Error ? err.message : String(err);
          console.error(
            `[scrape-pihps] fetch threw sku=${sku.sku_id} city=${city.city_id}: ${msg}`,
          );
          continue;
        }

        if (price === null) {
          skipped += 1;
          // Logged at debug-volume — would be ~25 skus × 16 cities = 400 lines/day
          // at the loudest. Acceptable for Phase 1; Supabase Studio truncates.
          console.log(
            `[scrape-pihps] skip sku=${sku.sku_id} city=${city.city_id} (no data)`,
          );
          continue;
        }

        const { error: insErr } = await supabase
          .from("price_snapshots")
          .upsert(
            {
              sku_id: sku.sku_id,
              city_id: city.city_id,
              snapshot_date: isoDate,
              price_idr: price,
              source: "pihps",
            },
            {
              onConflict: "sku_id,city_id,snapshot_date",
              ignoreDuplicates: true, // → INSERT ... ON CONFLICT DO NOTHING
            },
          );

        if (insErr) {
          failures += 1;
          console.error(
            `[scrape-pihps] insert failed sku=${sku.sku_id} city=${city.city_id}: ${insErr.message}`,
          );
          continue;
        }

        scraped += 1;
        console.log(
          `[scrape-pihps] ok sku=${sku.sku_id} city=${city.city_id} price=${price}`,
        );
      }
    }

    const duration_ms = Math.round(performance.now() - t0);
    console.log(
      `[scrape-pihps] done snapshot_date=${isoDate} scraped=${scraped} skipped=${skipped} failures=${failures} duration_ms=${duration_ms}`,
    );

    return jsonResponse(200, {
      ok: true,
      snapshot_date: isoDate,
      scraped,
      skipped,
      failures,
      duration_ms,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const duration_ms = Math.round(performance.now() - t0);
    console.error(`[scrape-pihps] fatal: ${msg} duration_ms=${duration_ms}`);
    return jsonResponse(500, { ok: false, error: msg });
  }
});
