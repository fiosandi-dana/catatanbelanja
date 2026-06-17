---
name: seed-pihps
description: Regenerate the SKU + city seed SQL for Supabase. Usage `/seed-pihps` (no args needed). Writes to `supabase/seed.sql`.
---

You're (re)generating Supabase seed data for the PIHPS SKU registry and city registry. The user invoked `/seed-pihps`.

## Source of truth
- **Cities (15)**: Jakarta, Surabaya, Bandung, Medan, Semarang, Makassar, Bekasi, Tangerang, Depok, Bogor, Yogyakarta, Malang, Denpasar, Balikpapan, Pekanbaru, Padang. (Per PRD §P4 — count includes Padang = 16 actually; recheck against PRD before generating.)
- **PIHPS SKUs (~21)**: from `https://www.bi.go.id/hargapangan/`. Examples: Beras Premium, Beras Medium, Telur Ayam Ras, Daging Ayam Ras, Daging Sapi, Minyak Goreng Curah, Minyak Goreng Kemasan, Gula Pasir, Tepung Terigu, Bawang Merah, Bawang Putih, Cabai Merah Keriting, Cabai Merah Besar, Cabai Rawit Merah, Kacang Tanah, Kedelai Impor, Ikan Tongkol, Ikan Kembung, Susu Bubuk, Garam Halus, Jagung Pipilan. Verify the current PIHPS commodity list via WebFetch if needed.
- **Manual SKUs (4)**: Galon Air 19L, Gas LPG 3kg, Indomie Goreng (per dus), Susu UHT 1L. (Per BUILD_PLAN.md §3.)

## Steps
1. Read `BUILD_PLAN.md` §3 (schema) to confirm the `cities` and `skus` table shape — fields needed: `city_id`, `name_id`, `pihps_code`, `active` / `sku_id`, `name_id`, `unit`, `category`, `active`.
2. Read `PRD.md` §P4 to confirm the city list is current.
3. Optionally WebFetch `https://www.bi.go.id/hargapangan/` to verify the live PIHPS SKU list.
4. Write `supabase/seed.sql` with:
   - `INSERT ... ON CONFLICT DO UPDATE` (idempotent — running twice is safe).
   - Inline comment per SKU citing its PIHPS source name.
   - All SKUs `active=true` by default.
5. Print a summary table: cities count, SKU count by category.

## Do not
- Don't invent prices — that's the scraper's job.
- Don't add SKUs outside the PIHPS list + the 4 manual ones without `pasar-product` approval.
