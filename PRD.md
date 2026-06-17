# 🛒 Pasar DANA — Product-Tech Concept Alignment

> 📌 **Note on numerical targets.** All specific numbers in this document (latency targets, household counts, GMV figures, percentages, capture rates, timing thresholds) are **illustrative examples** to communicate intent, not committed SLAs or financial commitments. Exact thresholds will be defined and finalized with engineering, finance, and growth during scoping. Read numbers as "in the ballpark of X" rather than "exactly X."
> 

---

## 1. Overview

This document defines the system design for **Pasar DANA** at a level sufficient for product-tech concept alignment between Product, Engineering, Data, and Growth teams. It is intentionally **not** a development-ready specification: it does not include user stories, success criteria, telemetry specs, rollout plans, edge case enumeration, or UX wording.

It focuses on:

- **what the system is**,
- **why it must exist**,
- **what design rules govern it**, and
- **how its components behave**.

The companion `BUILD_PLAN.md` captures the engineering-ready specification (phased build, data model, deployment). This PRD is the prerequisite alignment artifact: build planning should not begin until the architectural decisions below are confirmed.

---

## 2. Problem Statement

Indonesian households spend a structurally large portion of monthly income on sembako (essential goods: rice, eggs, cooking oil, sugar, chili, chicken, beef, etc.) — yet the **price layer is invisible** at the moment of decision. Consumers do not know whether the warung or pasar tradisional they walk into today is charging Rp 28,500 or Rp 32,000 per kilogram for the same eggs that another seller 10 minutes away charges differently.

Compounding this, household financial **planning** for sembako spend is invisible. There is no bucket. Uang dapur, jajan, tagihan, transportasi — all flow from one pool. Manual tracking in a notebook is high-friction; tracking in a generic budget app is disconnected from actual purchasing. The ibu rumah tangga (the household financial officer for ~50% of Indonesian families) ends each month asking "kemana uangnya?" without a reliable answer.

This is a structural product gap, not a UI gap. The decomposition identifies **twelve distinct root issues**:

**1. Sembako price opacity at point-of-decision.** Konsumen tidak tahu harga sembako di kotanya hari ini. Yang tahu hanya yang menjualnya. Information asymmetry is structural; markup is invisible.

**2. PIHPS data exists but is consumer-unreachable.** Bank Indonesia publishes daily sembako prices via PIHPS (bi.go.id/hargapangan), but the interface is desktop-oriented, table-heavy, single-purpose, and not embedded in any consumer transaction surface. The data exists; the distribution layer doesn't.

**3. No household-level spend bucket for sembako.** DANA pocket primitives (DANA Goals, DANA Bisnis) are not designed for recurring sembako tracking. Generic budget apps (Money Lover, Wallet) are disconnected from PIHPS or transaction reality.

**4. Belanja list and price visibility are separate apps today.** Users who want both must run two apps: one to plan, one to check prices. There is no single surface that combines "what I want to buy" with "what it costs today."

**5. No persistent shopping list across DANA surfaces.** DANA today has no concept of "things I plan to buy soon." Each transaction is a one-shot event. The forward-looking intent layer is missing.

**6. Ground-truth pricing is unowned.** PIHPS publishes averages; actual prices at specific markets vary. No system captures the delta between published price and paid price, leaving real-world price intelligence unmeasured.

**7. DANA's high QRIS usage at the cashier is decoupled from pre-purchase intent.** Users tap QRIS to pay, but DANA has no record of *what they intended to buy* before payment. The transaction is observed; the intent is lost.

**8. Recurring sembako spend is not differentiated from one-off transactions.** A QRIS payment of Rp 162,000 at "Alfa Bekasi" is indistinguishable from a one-time top-up. DANA cannot segment the household's recurring sembako wallet from total spend.

**9. The Astro / HappyFresh / Segari ecosystem is fragmented for the consumer.** Users wanting to fulfill a sembako list must hop between apps, re-enter items, and re-evaluate prices. There is no router.

**10. Local pasar tradisional has no digital surface for price visibility.** ~50,000 pasar tradisional vendors in Indonesia exist outside any digital price layer. The economic activity is real (~Rp hundreds of trillions/year) but invisible to fintech.

**11. Cross-city price variance is consumer-unknown.** A user in Bekasi does not know whether Bekasi prices are systematically higher or lower than Tangerang's. There is no consumer-grade comparative price layer.

**12. No retention loop on sembako data.** Even where pricing apps exist (rare), they do not surface monthly insight ("you spent Rp 1.92jt this month, kategori X is up 18% vs last month"). The data does not return to the user as actionable signal.

### Sharp framing

> DANA does not lack a payment rail. DANA lacks a **household financial surface for sembako** — one that combines daily PIHPS price visibility, persistent forward-looking belanja list, transaction ground-truth capture, and monthly insight. Pasar DANA is that surface.
> 

### How this PRD addresses each problem (mapping)

| Problem # | Addressed by |
| --- | --- |
| 1 | Top-X sembako home screen with PIHPS-backed pricing per city, refreshed daily |
| 2 | Embed PIHPS as the trusted anchor in a mobile-first consumer surface inside DANA |
| 3 | Catatan Belanja Mendatang as a first-class sub-wallet primitive, distinct from existing pockets |
| 4 | Catat-flow: every SKU surface has a `+ Catat` affordance; planning and price visibility share one screen |
| 5 | Persistent Catatan Belanja with state machine: draft → active → archived (after sudah belanja) |
| 6 | Ground-truth capture at "Sudah belanja" confirmation: actual paid price recorded against PIHPS snapshot |
| 7 | QRIS auto-categorize is **Phase 2**; Phase 1 establishes manual-entry catat as the data spine |
| 8 | Pocket Rumah Tangga categorizes sembako spend distinctly; visible in monthly Insight |
| 9 | Fulfillment partners (Astro · HappyFresh · pasar terdekat) registered as **Phase 2** roadmap; out of scope for Phase 1 |
| 10 | Local KYB marketplace is **Phase 3** (long-term platform bet); out of scope for Phase 1 and 2 |
| 11 | City-level price variance visible via tap on location chip (compare cities); per-pasar resolution deferred to Phase 2 |
| 12 | Monthly Insight as retention loop: delta vs prior month, category surge, savings narrative |

---

## 3. Product Principles

These principles govern all design decisions in this initiative. When ambiguity arises, defer to these. They are derived from the conflict between Indonesian household reality (informal, recurring, ibu-driven), DANA's existing rails (QRIS, pockets, e-wallet), and the strategic dual-layer ambition (payment today, platform tomorrow).

**P1 — Mencatat dulu, belanja kemudian.** The hero action is *catat*, not *beli*. Pasar DANA is a planning surface that later closes the loop with belanja confirmation. Users add intent first; fulfillment is downstream. This inverts the conventional commerce pattern (browse → add to cart → checkout) into a household-rhythm pattern (cek harga → catat → belanja di pasar → konfirmasi). Any feature that pressures the user to fulfill before catat-ing violates this principle.

**P2 — PIHPS is the anchor, ground-truth is the calibration.** Published PIHPS prices from bi.go.id/hargapangan are the canonical price reference. User-confirmed actual paid prices at "Sudah belanja" are the calibration layer. Over time, ground-truth converges PIHPS toward per-pasar resolution. Neither alone is sufficient: PIHPS without ground-truth misses local variance; ground-truth without PIHPS lacks a trusted starting point.

**P3 — Catatan Belanja Mendatang is a sub-wallet primitive, not a feature.** It has its own state machine, its own UI surface, its own persistence layer. It is reachable from a permanent bottom-nav tab with a real-time count. It is not buried inside a "more" menu. The primitive must outlast any single SKU vertical (sembako today, electronics tomorrow, anything later).

**P4 — Tier 1 & 2 cities first, not single-city, not nationwide.** v1 launches across Indonesian Tier 1 & 2 cities (Jakarta, Surabaya, Bandung, Medan, Semarang, Makassar, Bekasi, Tangerang, Depok, Bogor, Yogyakarta, Malang, Denpasar, Balikpapan, Pekanbaru, Padang) — roughly ~15 cities, ~40M households. This footprint matches DANA's existing high-penetration markets, avoids the operational fragility of single-city pilots (which can't survive a single city's distortion), and avoids the cost of nationwide where PIHPS coverage thins out.

**P5 — Location is context, not gating.** The location chip (`📍 Bekasi ▾`) shows where the user is in pricing-space. It is *not* a geolocation permission gate; it does not block the app. The user picks at first launch, can change anytime, and the app works fully without device GPS. This is a deliberate departure from earlier iterations of the design.

**P6 — Astro / HappyFresh / pasar terdekat are Phase 2 fulfillment, not Phase 1 surfaces.** In Phase 1, the user catat-s, then belanja-s in the real world (warung, supermarket, pasar tradisional, abang sayur — whatever they prefer), then konfirmasi-s in DANA. Fulfillment partners do not appear in Phase 1 UI. This protects the catat-flow from premature commercialization and lets DANA validate the planning behavior before activating fulfillment.

**P7 — Every catat creates a data point. Every konfirmasi calibrates the system.** The data spine is the chain `catat → belanja (real world) → konfirmasi`. Every step writes to a record. Even users who never konfirmasi still produce useful catat signal (intent without conversion is itself information). The system must extract value from each step independently — not require the full chain for any single step to be useful.

**P8 — Insight is a retention loop, not a vanity dashboard.** Monthly Insight (per-pasar comparison, category surge, savings delta) is the mechanism that brings the ibu back to the app on the 1st of each month. It must be specific (concrete numbers, named pasar, named SKUs), actionable (where to save), and short (one screen, scannable in 15 seconds). A multi-tab analytics dashboard violates this principle.

**P9 — Failure modes are first-class states, not edge cases.** PIHPS daily fetch fails sometimes. User adds a SKU then deletes it. User catat-s but never konfirmasi-s. The actual paid price differs wildly from PIHPS. The user changes city mid-month. Each of these has a defined state and a graceful path; none of them produce error screens. The system is designed for the messy reality of Indonesian household behavior, not for the happy path.

---

## 4. Architectural Decisions

These are the load-bearing decisions that shape the system design. They are presented as **proposed positions** for alignment. If any decision is overridden, the affected sections in Section 5 must be revisited.

**AD1 — Per-pasar resolution is out of scope for Phase 1.** Phase 1 surfaces prices at **city level** (e.g., "PIHPS Bekasi · Rp 28.500/kg") because PIHPS publishes city-level averages, not per-pasar. The "Pasar di HP kamu" insight still holds because users perceive sembako pricing at the city/area level, not pasar-by-pasar, in their daily experience. Per-pasar refinement (using accumulated ground-truth from Riwayat) is **Phase 2**.

*Acknowledged consequence:* Phase 1 cannot answer "is Pasar Kranji cheaper than Pasar Pondok Gede today?" — it can only answer "what is the Bekasi average today?" The product copy must not promise per-pasar resolution in v1.

**AD2 — Hybrid data source: PIHPS as anchor, user-submitted as ground-truth.** PIHPS is scraped daily via the Bank Indonesia public website (`bi.go.id/hargapangan`). User-submitted actual paid prices at "Sudah belanja" confirmation are stored alongside PIHPS as a parallel data stream. The two are **not merged** in Phase 1; PIHPS is shown as the canonical price, ground-truth is shown as the user's own data. Phase 2 reconciles them into a per-pasar best-estimate.

**AD3 — Catat is a state machine, not a CRUD list.** The Catatan Belanja Mendatang has explicit states (`active`, `archived`, `cancelled`) and explicit transitions (`add item`, `edit qty`, `remove item`, `sudah belanja → confirm`, `discard`). The state machine is enforced at the data layer, not the UI layer — to ensure consistency across surfaces (Catatan tab, sudah-belanja modal, Riwayat detail). State transitions are auditable.

**AD4 — Phase 1 is catat-only. No fulfillment integration.** Astro, HappyFresh, Segari, and pasar tradisional integrations are explicitly **out of scope for Phase 1**. They do not appear in any user-facing surface. They are not in the data model. They are not in API contracts with partners. The roadmap (slide 11 of the deck) references them as Phase 2 plans, but Phase 1 ships without them. This protects the catat-flow from premature commercial entanglement.

**AD5 — Tier 1 & 2 cities is the v1 launch footprint, not the v1 MVP scope.** A common mistake is to confuse footprint (where the product is available) with scope (what the product does). The v1 MVP scope is "catat-flow + PIHPS + Riwayat + Insight." That scope is the same in 1 city or 15 cities. We launch in 15 cities because city-level PIHPS data is uniform across them, the marginal cost is low, and single-city pilots distort signal. Footprint expansion to Tier 3+ is a separate (later) decision.

**AD6 — Location is a soft selector, not a geolocation gate.** No device-GPS permission prompt at install. No geolocation API calls in Phase 1. User picks city from a list at first launch (and can change anytime via the `📍 Bekasi ▾` chip). This removes a significant onboarding-friction failure mode (geolocation denial rates of 30-50% on Android in Indonesian Tier A/B segment) and removes a class of regulatory complexity (BPJS / OJK data residency questions around device location).

**AD7 — QRIS auto-categorize is out of scope for Phase 1.** A natural extension is to auto-detect sembako QRIS transactions and prompt "Tambah ke Catatan?" — but this requires merchant-categorization logic (MCC + merchant name parsing + ML), which is heavy. Phase 1 is **manual catat**. Phase 1.5 adds QRIS auto-categorize as a friction-reducer. Architecting Phase 1 in a way that pre-builds QRIS hooks is acceptable; building the hooks is not.

**AD8 — Pasar DANA is a layer in DANA, not a standalone app.** The product lives inside the DANA app, reachable via a feature card on Beranda, a deep link from QRIS receipts, and (eventually) a permanent slot in the DANA navigation. It is not a separate APK. It is not a separate brand. The DANA blue palette, DANA component library, and DANA auth flow are reused verbatim.

**AD9 — Name "Pasar DANA" is provisional pending legal review.** PT Pasar Dana Pinjaman (Sinar Mas group, OJK-licensed P2P lender, operates Danamas) is a registered Indonesian entity in the same vertical and same regulator. The name may need to change before public launch. Internal alignment can proceed under the working name; public-facing artifacts (DANA app card, landing page, partner contracts) require legal clearance.

---

## 5. Solution Design

### 5.1 System Overview

Pasar DANA is built as a **four-layer surface** inside the DANA app. Each layer has one job. Each layer reads from the one below it and writes to the one above it.

**The four layers:**

1. **Data Foundation** — PIHPS scraper, city/SKU registry, ground-truth ledger
2. **Catat State Machine** — Catatan Belanja Mendatang as a stateful primitive
3. **Surface Layer** — Beranda, Catatan, Riwayat, Insight (4 user-facing surfaces)
4. **DANA Integration** — auth, deep links, QRIS hooks (Phase 2), pocket integration

```
┌─────────────────────────────────────────────────────────────┐
│                    DANA APP (HOST)                          │
└─────────────────────────────────────────────────────────────┘
                              ↑
┌─────────────────────────────────────────────────────────────┐
│                    PASAR DANA                               │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Layer 4: DANA Integration                             │  │
│  │  (auth, deep links, pocket linkage)                   │  │
│  └───────────────────────────────────────────────────────┘  │
│                          ↑                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Layer 3: Surface Layer                                │  │
│  │  Beranda · Catatan · Riwayat · Insight                │  │
│  └───────────────────────────────────────────────────────┘  │
│                          ↑                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Layer 2: Catat State Machine                          │  │
│  │  (Catatan Belanja Mendatang as primitive)             │  │
│  └───────────────────────────────────────────────────────┘  │
│                          ↑                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Layer 1: Data Foundation                              │  │
│  │  PIHPS scraper · SKU registry · ground-truth ledger   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
       ↑                          ↑                ↑
       │                          │                │
       ▼                          ▼                ▼
┌─────────────┐         ┌──────────────────┐  ┌──────────────┐
│  PIHPS      │         │ User-submitted   │  │ City / SKU   │
│  (bi.go.id/ │         │ ground-truth     │  │ seed lists   │
│  hargapangan)│         │ (Riwayat ledger) │  │              │
└─────────────┘         └──────────────────┘  └──────────────┘
```

The four layers interact on every screen: Layer 1 supplies the price data → Layer 2 holds the user's intent → Layer 3 renders → Layer 4 connects to DANA-wide capabilities.

### 5.2 Data Foundation (Layer 1)

The data foundation owns three concerns:

**A. PIHPS daily price snapshot.** A scheduled job fetches sembako prices from `bi.go.id/hargapangan` once per day. The job extracts prices per SKU per city, normalizes them to a canonical SKU registry, and writes one row per (SKU, city, date) into the `price_snapshots` table.

PIHPS resolution caveat: PIHPS publishes city-level averages (Kota Bekasi, Kota Bandung, etc.) for ~21 commodities. The scraper writes city-level data; per-pasar fan-out is **not** attempted in Phase 1.

**B. SKU registry.** A static + curated list of ~25 sembako SKUs that PIHPS reports on. Includes canonical name, unit (kg, L, butir, ikat), category (protein, karbohidrat, minyak, bumbu, etc.), and an `active` flag. Phase 1 launches with all ~21 PIHPS SKUs plus 4 manually-seeded high-frequency SKUs (galon air, gas LPG 3kg, Indomie, susu UHT) whose prices are seeded from manual sources.

**C. Ground-truth ledger.** Every time a user konfirmasi-s a Riwayat entry and fills in "harga aktual" for an SKU, that record writes to the `ground_truth_prices` table — *not* the `price_snapshots` table. The two streams are kept separate in Phase 1. Phase 2 will reconcile.

**What this layer deliberately does NOT do in Phase 1:**

- ❌ Per-pasar price scraping (per AD1)
- ❌ Cross-city price comparison logic (deferred to Phase 1.5)
- ❌ Predictive pricing or trend forecasting (deferred to Phase 3)
- ❌ Real-time price updates (daily snapshot is sufficient for v1)

### 5.3 Catat State Machine (Layer 2)

Catatan Belanja Mendatang is a stateful primitive. Each user has zero or one *active* catatan at any time. Adding the first item creates a new active catatan; konfirmasi-ing the catatan archives it and creates the next-empty active one.

**State machine:**

```
                  ┌──────────────────────┐
                  │      (no catatan)    │
                  └──────────────────────┘
                          │
              user adds first SKU (+ Catat)
                          ▼
                  ┌──────────────────────┐
            ┌────▶│    ACTIVE catatan    │◀───────┐
            │     │  (has items)         │        │
            │     └──────────────────────┘        │
            │           │              │          │
            │  add item │     edit qty │          │
            └───────────┘     remove   │          │
                                       │          │
                              user taps "Sudah belanja ini"
                                       ▼          │
                              ┌──────────────────┐│
                              │  CONFIRMATION    ││
                              │      MODAL       ││
                              └──────────────────┘│
                                  │           │   │
                          confirm │     cancel│   │
                                  ▼           └───┘
                          ┌──────────────────┐
                          │ ARCHIVED catatan │
                          │  (now in Riwayat)│
                          └──────────────────┘
                                  │
                          auto-creates next
                                  ▼
                          ┌──────────────────┐
                          │ EMPTY catatan    │
                          │  (next "active") │
                          └──────────────────┘
```

**Invariants enforced at the data layer:**

1. Exactly one `active` catatan per user at any time.
2. Once `archived`, a catatan is immutable. Edits to a confirmed belanja go into the linked Riwayat record's `harga aktual` field, not the original catatan.
3. Items in an active catatan snapshot their PIHPS price at add-time (`price_at_add`). If PIHPS price changes before konfirmasi, the snapshot does not auto-update; the user sees the original price unless they manually refresh.
4. `harga aktual` (user-submitted at Riwayat) is optional. Phase 1 does not require it. ~30-40% submission rate is expected; the design accommodates the rest.

### 5.4 Surface Layer (Layer 3)

Four user-facing surfaces, all reachable from a persistent bottom navigation:

**Surface A — Beranda.** Top 6 sembako SKUs for the user's selected city, with PIHPS price + week-on-week delta + `+ Catat` action per row. Location chip top-left (`📍 Bekasi ▾`). Tapping chip opens city picker. Tapping `+ Catat` opens the bottom-sheet quick-add modal.

**Surface B — Catatan Belanja.** The active catatan's items, grouped by add-date (or by user-applied custom grouping in Phase 1.5). Each item shows name, qty, snapshotted PIHPS price, line total. Summary row at bottom: total estimasi. Primary CTA: "Sudah belanja ini." Secondary tap on item: edit (qty/remove) bottom sheet.

**Surface C — Riwayat Belanja.** Reverse-chronological list of archived catatans. Each entry shows date, optional pasar tag, item count, total estimasi (and total aktual if konfirmasi-d). Tap entry → detail view with per-SKU PIHPS price + user-input "Bayar:" field + delta highlight (green if cheaper than PIHPS, orange if more expensive).

**Surface D — Insight (Bulanan).** Monthly summary card surfaced ~1st of each month: total sembako spend, delta vs last month, top-saving category, top-overspend category, named pasar comparison (Phase 1.5: city comparison; Phase 2: per-pasar).

**Bottom Navigation:** Three tabs persistent across all surfaces:

- `Beranda` (Surface A)
- `Catatan (n)` — n is the live count of active catatan items (Surface B). Tab label updates real-time as user catat-s.
- `Riwayat` (Surface C). Insight (Surface D) is reachable via a card on Riwayat tab.

### 5.5 Canonical Entity Model

Every record in Pasar DANA conforms to one of four entity types:

| Entity | Identifying fields | Lifecycle |
| --- | --- | --- |
| `SKU` | `sku_id`, `name_id`, `unit`, `category` | Long-lived; rarely updated |
| `PriceSnapshot` | `sku_id`, `city_id`, `snapshot_date`, `price_idr` | Append-only; daily new rows |
| `CatatanItem` | `catatan_id`, `sku_id`, `qty`, `price_at_add_idr`, `state` | Mutable while catatan active; frozen on archive |
| `RiwayatEntry` | `riwayat_id`, `user_id`, `archived_catatan_id`, `pasar_label`, `confirmed_at`, `items[]` | Immutable after creation; `items[].price_actual_idr` editable until X days |

**Cross-cutting metadata:**

- All entities carry `created_at`, `updated_at`.
- All user-scoped entities carry `user_id`.
- All Catatan/Riwayat entries carry `city_id` (the city the user was in when catat-ing).

### 5.6 Data Flow on Every User Action

**Action: User taps `+ Catat` on a SKU from Beranda.**

```
User taps "+ Catat" on Telur Ayam Ras
         │
         ▼
[Layer 3] Surface opens bottom-sheet quick-add modal
         │
         ▼
User confirms qty (default 1 kg, editable via stepper)
         │
         ▼
[Layer 3] Calls Layer 2: catatan.addItem(sku_id, qty, price_at_add)
         │
         ▼
[Layer 2] If no active catatan: create new active catatan
         If active catatan exists: append item to it
         Snapshot current PIHPS price into item.price_at_add_idr
         │
         ▼
[Layer 2] Update active catatan item count (Layer 3 bottom-nav badge re-renders)
         │
         ▼
[Layer 3] Show success toast: "Telur Ayam Ras tercatat · 2 kg"
         Render "Baru dicatat" section on Beranda
         │
         ▼
[Layer 4] Optional: log analytics event {action: "catat_added", sku, city}
```

**Action: User taps "Sudah belanja ini" from Catatan.**

```
User taps "Sudah belanja ini"
         │
         ▼
[Layer 3] Open confirmation modal with current catatan summary
         │
         ▼
User optionally picks pasar_label (free text or dropdown of recent), then confirms
         │
         ▼
[Layer 3] Calls Layer 2: catatan.confirm(catatan_id, pasar_label)
         │
         ▼
[Layer 2] Begin transaction:
            - Mark current catatan: state = archived, archived_at = now
            - Copy items into new RiwayatEntry
            - For each item: snapshot today's PIHPS price as price_pihps_idr
            - Leave price_actual_idr NULL (user fills later, optional)
            - Create new empty active catatan for user
         End transaction
         │
         ▼
[Layer 3] Navigate to Riwayat tab; show new entry at top
         │
         ▼
[Layer 4] Optional: log analytics event {action: "belanja_confirmed", item_count, total_idr, city, pasar_label}
```

### 5.7 Concrete Example

User: Ibu Sri, 38, Bekasi, ibu rumah tangga. First time opening Pasar DANA.

| Step | What Ibu Sri does | What system does | What she sees |
| --- | --- | --- | --- |
| 1 | Taps Pasar DANA feature card from DANA Beranda | App loads, no prior state, prompts city pick | "Pilih kotamu" screen with 15 city tiles |
| 2 | Taps "Bekasi" | Persists `selected_city = bekasi` for this user | Slide to Beranda |
| 3 | Sees Beranda: 6 SKUs with PIHPS Bekasi prices | Layer 1 served latest PIHPS snapshot (date = today, city = Bekasi) | "Harga sembako hari ini · Data PIHPS Bank Indonesia" + Telur Ayam Ras Rp 28.500, etc. |
| 4 | Taps `+ Catat` on Telur Ayam Ras | Bottom sheet opens; default qty 1 kg | Quick-add modal |
| 5 | Steps qty to 2 kg, taps "Catat ke daftar belanja" | Layer 2 creates active catatan, adds item with `price_at_add = 28500`, qty 2 | Success toast; bottom-nav "Catatan" tab now shows "(1)" |
| 6 | Returns to Beranda, scrolls, taps `+ Catat` on Beras and Minyak Goreng (1 each) | Two more items added to existing active catatan | Bottom-nav "Catatan (3)" |
| 7 | Taps "Catatan (3)" bottom-nav tab | Layer 3 renders Catatan surface from Layer 2 active catatan | List of 3 items, total estimasi Rp 162.000, "Sudah belanja ini" CTA |
| 8 | Goes to Pasar Kranji in the real world, buys her items, comes back to DANA | (Out-of-app; system idle) | (N/A) |
| 9 | Taps "Sudah belanja ini" in Catatan | Confirmation modal opens; defaults `pasar_label` to most-recent or blank | "Sudah belanja? · Pasar tempat belanja: [pick]" |
| 10 | Types "Pasar Kranji", taps Konfirmasi | Layer 2 archives catatan, creates Riwayat entry, snapshots PIHPS prices, creates next empty active catatan | Navigated to Riwayat; new entry at top: "Hari ini · Pasar Kranji · Rp 162.000 · 3 item" |
| 11 | Taps the Hari ini entry | Riwayat detail loads | Per-SKU breakdown with PIHPS price + empty "Bayar:" fields |
| 12 | Taps "Bayar:" next to Telur, types "28000" | Layer 2 updates `price_actual_idr = 28000` for that item; computes delta = −500 | "Bayar: Rp 28.000 (−Rp 500)" — green |
| 13 | Closes app | (No further action) | (N/A) |
| 14 | 1st of next month, opens app | Layer 3 surfaces Insight card on Riwayat tab | "Bulan ini Rp 1.92jt · −Rp 180k vs bulan lalu · Pasar Kranji 12% lebih murah dari Pasar Pondok Gede minggu ini" |

The chain `catat → belanja → konfirmasi → Riwayat → Insight` is the data spine, and Ibu Sri experiences it without ever leaving DANA's UI conventions.

### 5.8 Failure Modes

The system is designed so no single failure blocks the user.

| Failure | What happens | What user sees |
| --- | --- | --- |
| PIHPS daily scrape fails | Beranda falls back to most recent successful snapshot, badged "Harga PIHPS · 2 hari lalu" | Subtle staleness indicator; rest of app works |
| User adds item then immediately deletes everything | Active catatan returns to empty; navbar count = 0 | "Catatan" tab (no count badge) |
| User catat-s but never konfirmasi-s | Catatan remains active indefinitely; no auto-archive in Phase 1 | Catatan tab shows persistent count |
| User konfirmasi-s but never inputs `harga aktual` | Riwayat entry exists with PIHPS snapshot only | Riwayat detail shows "Bayar: —" for unfilled items |
| User changes city mid-month | Beranda + Catatan immediately reflect new city's PIHPS prices; existing active catatan items keep their original `price_at_add` snapshot | Location chip shows new city; existing list unchanged |
| User's PIHPS price differs wildly from `harga aktual` (e.g., 50%+ delta) | No system action in Phase 1; delta is silently recorded in ground-truth ledger | Riwayat shows delta in orange |
| User uninstalls app and reinstalls | All Pasar DANA state is server-side keyed on DANA user ID; restored on auth | Same Catatan, same Riwayat, same Insight |
| DANA auth fails | Pasar DANA shows DANA's standard auth retry; no Pasar-DANA-specific error | DANA-standard error |
| All backends fail (DANA + Pasar DANA) | Beranda shows last cached PIHPS snapshot from device; "+ Catat" is disabled with a banner | "Tidak bisa connect. Coba lagi nanti." |

---

## 6. Decisions This Alignment Needs

This document defines proposed positions. The purpose of the alignment meeting is to confirm or challenge these specific decisions. If any position is overridden, the affected design sections will be revisited.

| # | Decision | Proposed Position | Stakeholders Needed |
| --- | --- | --- | --- |
| D1 | Scope of Phase 1 — is catat-only (no fulfillment) the right wedge? | Accept (per AD4). Catat-flow proves household planning behavior before activating commercial fulfillment. | Product, Adri, Vince |
| D2 | PIHPS as the canonical price source — acceptable to depend on bi.go.id daily? | Accept (per AD2). Bank Indonesia is the most trusted public source; scraper resilience handled per Failure Modes. | Data, Engineering, Legal (TOS check) |
| D3 | Tier 1 & 2 cities footprint — not single-city pilot? | Accept (per P4, AD5). City-level PIHPS data is uniform across these 15 cities; cost of broader footprint is small; signal quality is better. | Product, Growth, Ops |
| D4 | Location as soft selector, no device GPS in Phase 1 | Accept (per P5, AD6). Removes a major onboarding-friction failure mode and a class of data residency / regulatory questions. | Product, Engineering, Legal |
| D5 | Catatan Belanja Mendatang as a sub-wallet primitive with bottom-nav slot | Accept (per P3). Bottom-nav placement is non-negotiable; without it, the catat-flow has no anchor. | Product, Design, DANA app team |
| D6 | Ground-truth `harga aktual` is **optional** — Phase 1 does not require user fill | Accept (per P7). Submission rate target is ~30-40%; design must work at that rate. | Product, Data |
| D7 | Astro / HappyFresh / pasar terdekat are **Phase 2**, not in Phase 1 UI | Accept (per AD4, P6). They appear in roadmap slides only. Not on screens. | Product, Partnerships |
| D8 | Working name "Pasar DANA" — alignment OK, public launch requires legal clearance | Accept (per AD9). Trademark collision with PT Pasar Dana Pinjaman (Sinar Mas, OJK) is real. Internal alignment proceeds; legal clears or renames before public launch. | Legal, Brand, Product |

**Out of scope for this alignment meeting:**

- Detailed ranking algorithm for "Top 6 sembako" (which 6, in what order — separate scoring PRD)
- QRIS auto-categorize design (Phase 1.5, separate PRD)
- Fulfillment partner contracts and integration design (Phase 2, separate PRD)
- Per-pasar resolution methodology (Phase 2, separate Data PRD)
- Insight (monthly) detailed content design — UX/copy decisions (Subsequent productization PRD)
- Trust/safety and fraud handling (Subsequent PRD)
- Specific numerical targets — illustrative only in this doc

---

## 7. Out of Scope (Phase 1)

These are intentional exclusions, not oversights.

| Item | Why Excluded | Where It Goes |
| --- | --- | --- |
| Per-pasar price resolution | Per AD1. PIHPS publishes city-level only. | Phase 2 (Data PRD) |
| Fulfillment integration (Astro / HappyFresh / pasar) | Per AD4. Protects catat-flow validation. | Phase 2 (Partnerships PRD) |
| QRIS auto-categorize | Per AD7. Heavy infra; Phase 1 ships with manual catat. | Phase 1.5 (separate PRD) |
| Device geolocation | Per AD6. Onboarding friction + regulatory complexity. | Reconsidered post-Phase 2 |
| Local KYB marketplace (warung Madura, depot air minum, pasar vendors) | The platform bet. Too early. | Phase 3 (separate Platform PRD) |
| Cross-city price comparison UX | Phase 1 shows one city at a time. Comparison is a power-user feature. | Phase 1.5 |
| Insight forecasting ("next month you'll spend...") | Predictive layer requires ≥3 months of user data. | Phase 2 |
| Shared catatan (household co-management) | Multi-user catatan editing is a different state machine. | Phase 2+ |
| Recipe → catat ("cook nasi goreng → auto-add these 7 SKUs") | Adjacent product. | Phase 3+ |
| Voice catat ("Hey DANA, tambah telur 2 kilo") | Adjacent product. | Phase 3+ |
| User-submitted SKUs (catat something not in registry) | Moderation overhead. | Phase 1.5 with rate-limit |
| Push notifications for price changes | No active use case in Phase 1. | Phase 2 |
| User stories and acceptance criteria | This is alignment PRD, not productization PRD | Subsequent PRD |
| Telemetry spec and success metrics | Same as above | Subsequent PRD |
| UX copy, brand guidelines | Same as above | Subsequent PRD |
| Rollout / phased launch plan | Same as above | Subsequent PRD |
| Edge case enumeration | Same as above | Subsequent PRD |

---

## 📌 Summary

This PRD defines the **architectural shape of Pasar DANA** for cross-team alignment before productization details are layered on.

**What Pasar DANA is:** A household financial surface inside DANA that combines daily PIHPS price visibility, persistent forward-looking Catatan Belanja Mendatang, transaction ground-truth capture at "Sudah belanja," and monthly Insight. It surfaces sembako prices for ~15 Tier 1 & 2 Indonesian cities, sourced from Bank Indonesia's bi.go.id/hargapangan.

**How catat-flow works:** User opens app → sees Top 6 sembako for their city with PIHPS prices → taps `+ Catat` on any SKU → item enters active Catatan → bottom-nav badge updates → user shops in the real world → returns to app, taps "Sudah belanja ini" → confirms pasar → Riwayat entry created → user optionally fills `harga aktual` (ground-truth) → at month-end, Insight surfaces savings narrative.

**What is not in Phase 1:** Fulfillment partners (Astro, HappyFresh, pasar terdekat) — they appear in the v2 roadmap but not in Phase 1 surfaces. Per-pasar resolution — Phase 1 is city-level only. Device GPS — Phase 1 uses soft city pick. QRIS auto-categorize — Phase 1.5.

**Three companion documents are needed:**

1. **BUILD_PLAN.md** — the engineering-ready specification (data model, phased build, deployment) — already drafted, will need rev to match this alignment.
2. **Productization PRD** — user stories, success criteria, telemetry, rollout plan, UX copy.
3. **Data Pipeline PRD** — PIHPS scraper resilience, ground-truth reconciliation logic, per-pasar Phase 2 design.

This alignment PRD is the prerequisite for all three.