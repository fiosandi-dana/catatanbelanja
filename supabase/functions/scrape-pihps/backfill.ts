// =============================================================================
// backfill.ts — one-shot local Deno script to backfill PIHPS price_snapshots.
//
// Why a script (not an Edge Function)?
//   The daily scrape-pihps Function fits comfortably in Supabase's 60s wall-time
//   cap (16 HTTP calls). A full historical backfill is ~168 days * 16 cities =
//   ~2,688 HTTP calls (~11 minutes with politeness sleep), so it must run
//   locally where there is no wall-time limit.
//
// What it does:
//   For each WIB calendar date in [--from, --to], for each active city, it asks
//   pihps-client (verbatim — no parsing duplication) for every active SKU and
//   upserts one row per (sku, city, date) into price_snapshots with
//   ON CONFLICT DO NOTHING. Same idempotence guarantee as the daily Function.
//
// Run:
//   deno run -A supabase/functions/scrape-pihps/backfill.ts \
//     --from=2026-01-01 --to=2026-06-17
//
// Scrape-now, push-later (no Supabase project yet):
//   deno run -A supabase/functions/scrape-pihps/backfill.ts \
//     --from=2026-01-01 --to=2026-06-17 --output=pihps-backfill.sql
//   # later:
//   psql "$DATABASE_URL" -f pihps-backfill.sql
//
// See README.md "Backfill" section for env-var setup and resume semantics.
// =============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { _resetCache, fetchPihpsPrice } from "./pihps-client.ts";

// -----------------------------------------------------------------------------
// CLI parsing — tiny hand-rolled --key=value parser. We avoid std/flags to
// keep this single-file with no extra import surface.
// -----------------------------------------------------------------------------
interface CliArgs {
  from: string;
  to: string;
  city?: string;
  output?: string;
  dryRun: boolean;
  force: boolean;
  allowOld: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const out: Partial<CliArgs> & { dryRun: boolean; force: boolean; allowOld: boolean } = {
    dryRun: false,
    force: false,
    allowOld: false,
  };
  for (const raw of argv) {
    if (raw === "--dry-run") { out.dryRun = true; continue; }
    if (raw === "--force") { out.force = true; continue; }
    if (raw === "--allow-old") { out.allowOld = true; continue; }
    const m = raw.match(/^--([a-zA-Z-]+)=(.+)$/);
    if (!m) {
      console.error(`[backfill] unrecognised arg: ${raw}`);
      Deno.exit(2);
    }
    const [, key, val] = m;
    switch (key) {
      case "from":   out.from = val; break;
      case "to":     out.to = val; break;
      case "city":   out.city = val; break;
      case "output": out.output = val; break;
      default:
        console.error(`[backfill] unknown flag --${key}`);
        Deno.exit(2);
    }
  }
  if (!out.from || !out.to) {
    console.error(
      "[backfill] usage: deno run -A backfill.ts --from=YYYY-MM-DD --to=YYYY-MM-DD " +
      "[--city=<id>] [--dry-run] [--force] [--allow-old] [--output=<path>.sql]",
    );
    Deno.exit(2);
  }
  if (out.dryRun && out.output) {
    console.error("[backfill] --dry-run and --output are mutually exclusive");
    Deno.exit(2);
  }
  return out as CliArgs;
}

// -----------------------------------------------------------------------------
// Date helpers — all dates are WIB calendar days, materialised as UTC Date
// objects at 00:00Z on that day (matches what pihps-client expects; see
// pihps-client.ts → formatStartEnd, which reads UTC parts).
// -----------------------------------------------------------------------------
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function parseIsoDate(s: string): Date {
  if (!ISO_DATE_RE.test(s)) {
    console.error(`[backfill] invalid date "${s}" — expected YYYY-MM-DD`);
    Deno.exit(2);
  }
  const d = new Date(`${s}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) {
    console.error(`[backfill] invalid date "${s}"`);
    Deno.exit(2);
  }
  return d;
}

function isoDateOf(d: Date): string {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function* dateRange(from: Date, to: Date): Generator<Date> {
  const cur = new Date(from.getTime());
  while (cur.getTime() <= to.getTime()) {
    yield new Date(cur.getTime());
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (24 * 60 * 60 * 1000));
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// -----------------------------------------------------------------------------
// SQL output helpers — used in --output mode. We hand-build INSERT statements
// rather than pulling in a sql-builder dep to keep the script single-file.
// SKU/city ids are safe slugs ([a-z0-9_]+) and the source column is the literal
// 'pihps', so the apostrophe-escape is defence-in-depth, not a real risk.
// -----------------------------------------------------------------------------
function sqlString(s: string): string {
  return `'${s.replace(/'/g, "''")}'`;
}

interface PriceRow {
  sku_id: string;
  city_id: string;
  snapshot_date: string;
  price_idr: number;
  source: string;
}

function buildInsertStatement(rows: PriceRow[]): string {
  // Sort for diff stability: city first (groups all of one city's prices
  // together visually) then sku_id alphabetically.
  const sorted = [...rows].sort((a, b) => {
    if (a.city_id !== b.city_id) return a.city_id < b.city_id ? -1 : 1;
    return a.sku_id < b.sku_id ? -1 : a.sku_id > b.sku_id ? 1 : 0;
  });
  const values = sorted.map((r) =>
    `  (${sqlString(r.sku_id)},${sqlString(r.city_id)},` +
    `${sqlString(r.snapshot_date)},${r.price_idr},${sqlString(r.source)})`
  ).join(",\n");
  return (
    "INSERT INTO price_snapshots (sku_id, city_id, snapshot_date, price_idr, source) VALUES\n" +
    values + "\n" +
    "ON CONFLICT (sku_id, city_id, snapshot_date) DO NOTHING;\n"
  );
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------
async function main(): Promise<void> {
  const args = parseArgs(Deno.args);

  const from = parseIsoDate(args.from);
  const to   = parseIsoDate(args.to);

  // ----- Safety checks -----------------------------------------------------
  if (from.getTime() > to.getTime()) {
    console.error(`[backfill] --from (${args.from}) is after --to (${args.to})`);
    Deno.exit(2);
  }
  const ageDays = daysBetween(from, new Date());
  if (ageDays > 365 && !args.allowOld) {
    console.error(
      `[backfill] --from is ${ageDays} days ago. PIHPS history may be limited; ` +
      "pass --allow-old to override.",
    );
    Deno.exit(2);
  }

  // ----- Env --------------------------------------------------------------
  // In --output mode we ignore Supabase env vars entirely — the user is
  // scraping locally before their project is provisioned.
  const SUPABASE_URL = args.output ? "" : (Deno.env.get("SUPABASE_URL") ?? "");
  const SUPABASE_SERVICE_ROLE_KEY = args.output
    ? ""
    : (Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

  if (!args.dryRun && !args.output) {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error(
        "[backfill] SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set " +
        "(or pass --dry-run / --output=<path>.sql). Example:\n" +
        "  export SUPABASE_URL=https://<ref>.supabase.co\n" +
        "  export SUPABASE_SERVICE_ROLE_KEY=<service-role-key>",
      );
      Deno.exit(1);
    }
  }

  // ----- Supabase client (only when writing directly to DB) ---------------
  const supabase = (!args.dryRun && !args.output)
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false },
      })
    : null;

  // ----- Load SKUs + cities -----------------------------------------------
  // In dry-run mode without DB creds, we still need the registry; if no
  // creds we fall back to the hard-coded city list below so the user can
  // smoke-test PIHPS connectivity without Supabase access.
  type SkuRow = { sku_id: string };
  type CityRow = { city_id: string; pihps_code: string };

  let skuList: SkuRow[];
  let cityList: CityRow[];

  if (supabase) {
    const [{ data: skus, error: skuErr }, { data: cities, error: cityErr }] =
      await Promise.all([
        supabase.from("skus").select("sku_id").eq("active", true),
        supabase.from("cities").select("city_id, pihps_code").eq("active", true),
      ]);
    if (skuErr) throw new Error(`skus query: ${skuErr.message}`);
    if (cityErr) throw new Error(`cities query: ${cityErr.message}`);
    skuList = (skus ?? []) as unknown as SkuRow[];
    cityList = (cities ?? []) as unknown as CityRow[];
  } else if (args.dryRun && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    // Dry-run but creds are present → still load from DB so we test the real list.
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
    const [{ data: skus }, { data: cities }] = await Promise.all([
      sb.from("skus").select("sku_id").eq("active", true),
      sb.from("cities").select("city_id, pihps_code").eq("active", true),
    ]);
    skuList = (skus ?? []) as unknown as SkuRow[];
    cityList = (cities ?? []) as unknown as CityRow[];
  } else {
    // --output mode, or dry-run without creds: hard-coded fallback so we can
    // scrape PIHPS without a live Supabase project. Mirrors supabase/seed.sql
    // at time of writing.
    const reason = args.output ? "--output mode" : "dry-run with no SUPABASE_URL/KEY";
    console.warn(
      `[backfill] ${reason} — using bundled fallback city + SKU lists. ` +
      "Counts may drift from production seed.",
    );
    cityList = [
      { city_id: "jakarta",    pihps_code: "13:34" },
      { city_id: "surabaya",   pihps_code: "16:42" },
      { city_id: "bandung",    pihps_code: "12:27" },
      { city_id: "medan",      pihps_code: "2:4"   },
      { city_id: "semarang",   pihps_code: "14:35" },
      { city_id: "makassar",   pihps_code: "26:67" },
      { city_id: "bekasi",     pihps_code: "12:30" },
      { city_id: "tangerang",  pihps_code: "11:26" },
      { city_id: "depok",      pihps_code: "12:32" },
      { city_id: "bogor",      pihps_code: "12:31" },
      { city_id: "yogyakarta", pihps_code: "15:41" },
      { city_id: "malang",     pihps_code: "16:43" },
      { city_id: "denpasar",   pihps_code: "17:50" },
      { city_id: "balikpapan", pihps_code: "23:64" },
      { city_id: "pekanbaru",  pihps_code: "4:10"  },
      { city_id: "padang",     pihps_code: "3:8"   },
    ];
    skuList = [
      { sku_id: "beras_premium" }, { sku_id: "beras_medium" },
      { sku_id: "telur_ayam_ras" }, { sku_id: "daging_ayam_ras" },
      { sku_id: "daging_sapi" },
      { sku_id: "minyak_goreng_curah" }, { sku_id: "minyak_goreng_kemasan" },
      { sku_id: "gula_pasir" },
      { sku_id: "bawang_merah" }, { sku_id: "bawang_putih" },
      { sku_id: "cabai_merah_keriting" }, { sku_id: "cabai_merah_besar" },
      { sku_id: "cabai_rawit_merah" },
    ];
  }

  // ----- Optional --city filter ------------------------------------------
  if (args.city) {
    const before = cityList.length;
    cityList = cityList.filter((c) => c.city_id === args.city);
    if (cityList.length === 0) {
      console.error(
        `[backfill] --city=${args.city} did not match any active city ` +
        `(of ${before}). Aborting.`,
      );
      Deno.exit(2);
    }
  }

  const totalDates = daysBetween(from, to) + 1;
  const modeTag = args.output
    ? `output=${args.output}`
    : args.dryRun
      ? "dry-run=true"
      : "mode=supabase-upsert";
  console.log(
    `[backfill] start range=${args.from}..${args.to} (${totalDates} days) ` +
    `skus=${skuList.length} cities=${cityList.length} ` +
    `${modeTag} force=${args.force}`,
  );

  // ----- Output file (only in --output mode) ------------------------------
  // We open once at start so a failed run still leaves a partial SQL file the
  // user can inspect. The header documents the apply path; ON CONFLICT DO
  // NOTHING in every INSERT preserves the same idempotence guarantee as the
  // Supabase upsert path.
  let outFile: Deno.FsFile | null = null;
  const encoder = new TextEncoder();
  if (args.output) {
    outFile = await Deno.open(args.output, {
      write: true,
      create: true,
      truncate: true,
    });
    const header =
      "-- Pasar DANA PIHPS backfill\n" +
      `-- Range: ${args.from}..${args.to} (${totalDates} days)\n` +
      `-- Generated: ${new Date().toISOString()}\n` +
      "-- Rows are idempotent — re-running this file is safe (ON CONFLICT DO NOTHING)\n" +
      `-- Apply with: psql "$DATABASE_URL" -f ${args.output}\n\n`;
    await outFile.write(encoder.encode(header));
  }

  // ----- Iteration --------------------------------------------------------
  let totalScraped = 0;
  let totalSkipped = 0;
  let totalFailures = 0;
  let datesWithData = 0;
  let consecutiveNetFailures = 0;
  const NET_FAILURE_HARD_LIMIT = 10;
  const POLITENESS_MS = 250;

  const wallStart = performance.now();

  for (const dateUtc of dateRange(from, to)) {
    const isoDate = isoDateOf(dateUtc);
    const dateStart = performance.now();

    // ----- Skip dates already populated (unless --force) ----------------
    if (supabase && !args.force) {
      // Count rows for this date scoped to the city set we're processing.
      // For a single-city run this is correct; for the default all-city run
      // it's still correct because we count rows where city is in our list.
      const cityIds = cityList.map((c) => c.city_id);
      const { count, error: cntErr } = await supabase
        .from("price_snapshots")
        .select("sku_id", { count: "exact", head: true })
        .eq("snapshot_date", isoDate)
        .in("city_id", cityIds);

      if (cntErr) {
        console.warn(
          `[backfill] [${isoDate}] count check failed: ${cntErr.message} — proceeding`,
        );
      } else if ((count ?? 0) > 0) {
        const elapsed = ((performance.now() - wallStart) / 1000).toFixed(1);
        console.log(
          `[${isoDate}] already populated (${count} rows) — skipping. ` +
          `cumulative=${totalScraped} elapsed=${elapsed}s`,
        );
        continue;
      }
    }

    let dateScraped = 0;
    let dateSkipped = 0;
    let dateFailures = 0;
    const rowsToInsert: PriceRow[] = [];

    // Fresh per-date cache — otherwise the gridCache grows unbounded
    // across the whole run (16 cities * 168 days = 2,688 cached promises).
    _resetCache();

    for (const city of cityList) {
      let cityHadFetchError = false;
      for (const sku of skuList) {
        let price: number | null = null;
        try {
          price = await fetchPihpsPrice(sku.sku_id, city.pihps_code, dateUtc);
        } catch (err) {
          dateFailures += 1;
          cityHadFetchError = true;
          const msg = err instanceof Error ? err.message : String(err);
          console.error(
            `[${isoDate}] fetch threw sku=${sku.sku_id} city=${city.city_id}: ${msg}`,
          );
          continue;
        }

        if (price === null) {
          dateSkipped += 1;
          continue;
        }

        rowsToInsert.push({
          sku_id: sku.sku_id,
          city_id: city.city_id,
          snapshot_date: isoDate,
          price_idr: price,
          source: "pihps",
        });
      }

      // Network-failure circuit breaker: if a whole city fetch failed AND
      // contributed zero successful prices, count it as one "net failure".
      // 10 in a row → bail out (PIHPS likely down; don't waste hours).
      if (cityHadFetchError) {
        consecutiveNetFailures += 1;
        if (consecutiveNetFailures >= NET_FAILURE_HARD_LIMIT) {
          console.error(
            `[backfill] ${NET_FAILURE_HARD_LIMIT} consecutive network failures — ` +
            "bailing out. Check bi.go.id and re-run; the script will resume " +
            "from the next un-populated date.",
          );
          Deno.exit(3);
        }
      } else {
        consecutiveNetFailures = 0;
      }

      // Politeness sleep between cities (skip after the last city of the day).
      await sleep(POLITENESS_MS);
    }

    // ----- Batch insert / emit for this date ---------------------------
    if (rowsToInsert.length > 0 && supabase && !args.dryRun && !args.output) {
      const { error: insErr } = await supabase
        .from("price_snapshots")
        .upsert(rowsToInsert, {
          onConflict: "sku_id,city_id,snapshot_date",
          ignoreDuplicates: true,
        });
      if (insErr) {
        dateFailures += rowsToInsert.length;
        console.error(
          `[${isoDate}] batch insert failed (${rowsToInsert.length} rows): ${insErr.message}`,
        );
      } else {
        dateScraped += rowsToInsert.length;
      }
    } else if (rowsToInsert.length > 0 && outFile) {
      // --output mode: emit one multi-row INSERT per date with data. Empty
      // dates are skipped so we don't pollute the file with no-op statements.
      const stmt = buildInsertStatement(rowsToInsert);
      await outFile.write(encoder.encode(stmt));
      dateScraped += rowsToInsert.length;
    } else {
      // dry-run, or zero rows: account for scraped count without writing.
      dateScraped += rowsToInsert.length;
    }

    if (rowsToInsert.length > 0) datesWithData += 1;

    totalScraped += dateScraped;
    totalSkipped += dateSkipped;
    totalFailures += dateFailures;

    const dateElapsed = ((performance.now() - dateStart) / 1000).toFixed(1);
    const cumulative = ((performance.now() - wallStart) / 1000).toFixed(1);
    const tag = args.dryRun ? " (dry-run)" : args.output ? " (sql)" : "";
    console.log(
      `[${isoDate}] scraped=${dateScraped} skipped=${dateSkipped} ` +
      `failures=${dateFailures} elapsed=${dateElapsed}s ` +
      `cumulative=${cumulative}s${tag}`,
    );
  }

  // ----- Final summary ----------------------------------------------------
  const wallSeconds = ((performance.now() - wallStart) / 1000).toFixed(1);
  console.log("");
  console.log("=== backfill summary ===");
  console.log(`range:          ${args.from} .. ${args.to} (${totalDates} days)`);
  console.log(`cities:         ${cityList.length}`);
  console.log(`skus:           ${skuList.length}`);
  console.log(`scraped:        ${totalScraped}`);
  console.log(`skipped:        ${totalSkipped}`);
  console.log(`failures:       ${totalFailures}`);
  console.log(`wall-time:      ${wallSeconds}s`);

  if (supabase && !args.dryRun) {
    const cityIds = cityList.map((c) => c.city_id);
    const { count, error: finalErr } = await supabase
      .from("price_snapshots")
      .select("sku_id", { count: "exact", head: true })
      .gte("snapshot_date", args.from)
      .lte("snapshot_date", args.to)
      .in("city_id", cityIds);
    if (finalErr) {
      console.warn(`final count check failed: ${finalErr.message}`);
    } else {
      console.log(`rows in range:  ${count ?? 0}`);
    }
  }

  // ----- Finalise SQL output file ----------------------------------------
  if (outFile && args.output) {
    const tail =
      "\n-- === SUMMARY ===\n" +
      `-- scraped: ${totalScraped}\n` +
      `-- skipped: ${totalSkipped}\n` +
      `-- failures: ${totalFailures}\n` +
      `-- dates with data: ${datesWithData} / ${totalDates}\n`;
    await outFile.write(encoder.encode(tail));

    // stat() before close so the file-size we print is the post-flush size.
    const stat = await outFile.stat();
    const sizeBytes = stat.size;

    // Append the file-size line then close. Doing it in two writes keeps the
    // value accurate (the line itself is a tiny tail comment).
    const sizeLine = `-- file size: ${sizeBytes} bytes\n`;
    await outFile.write(encoder.encode(sizeLine));
    outFile.close();

    const kb = (sizeBytes / 1024).toFixed(1);
    console.log(
      `wrote ${args.output} (${totalScraped} rows, ${kb}kb) — ` +
      `apply with: psql "$DATABASE_URL" -f ${args.output}`,
    );
  }
}

main().catch((err) => {
  const msg = err instanceof Error ? err.stack ?? err.message : String(err);
  console.error(`[backfill] fatal: ${msg}`);
  Deno.exit(1);
});
