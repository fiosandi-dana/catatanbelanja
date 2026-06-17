---
name: new-screen
description: Scaffold a new Next.js route under `web/app/` preloaded with the DANA FIAT 2.5 screen formula. Usage `/new-screen <route-name> [type=home|form|detail|list]`.
---

You're scaffolding a new screen for the Phase 0 Next.js app. The user invoked `/new-screen` with arguments in `$ARGUMENTS`.

## Parse
- First arg: route name in kebab-case (e.g., `catatan`, `riwayat`, `insight`).
- Optional `type=<home|form|detail|list>`. Default `list`.

## Steps
1. Read `DESIGN_SYSTEM.md` Section 0.4 (screen formula) and the relevant Composition Pattern for `<type>`.
2. Read `web/app/layout.tsx` to confirm Tailwind theme tokens (FIAT-derived) are already configured.
3. Create `web/app/<route-name>/page.tsx` with:
   - `'use server'` or default server component (no `'use client'` unless interactivity required).
   - Header block: DANA blue `#108EE9`, white title text, optional left back icon + right utility icon.
   - First card: white, 12px radius, 16px padding, overlapping or just under header.
   - Page background: `bg-[#F5F5F5]` (or the FIAT token equivalent).
   - Indonesian placeholder copy.
4. Add a route entry to `web/app/layout.tsx` nav if it belongs in the bottom-nav (Beranda · Catatan · Riwayat).

## Output
- The new `page.tsx` file path.
- One-line FIAT compliance self-check (matching `/design-check` criteria).
- Suggested next step (e.g., "wire to Supabase via `pasar-backend`").

## Do not
- Don't invent business logic — scaffold only. The dev agent fills it in.
- Don't pick colors outside the FIAT palette.
