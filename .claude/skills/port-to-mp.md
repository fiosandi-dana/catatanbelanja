---
name: port-to-mp
description: Port a finished Next.js page (under `web/`) to DANA Mini Program format (AXML/ACSS/JS under `dana-mp/`). Usage `/port-to-mp <route-name>`. Delegates to `pasar-dana-mp-porter`.
---

You're porting a Phase 0 web page to DANA Mini Program format. The user invoked `/port-to-mp` with a route name in `$ARGUMENTS`.

## Pre-flight checks (do these before delegating)
1. Confirm `web/app/<route-name>/page.tsx` exists. If not, stop and tell the user.
2. Confirm `dana-mp/` directory exists (created at first port). If not, scaffold the required base files: `app.json`, `app.js`, `app.acss`.
3. Confirm there is a corresponding Phase 0 route — do NOT port a screen that hasn't shipped to web yet.
4. Warn the user if DANA workspace credentials are not set up — the port can be written but cannot be tested in the real container without merchant onboarding.

## Delegate
Spawn the `pasar-dana-mp-porter` agent with this prompt:

> Port `web/app/<route-name>/page.tsx` to DANA Mini Program format under `dana-mp/pages/<route-name>/`.
>
> Follow the porting checklist in your agent definition. Read the source file, translate JSX→AXML, Tailwind→ACSS (with `rpx`), React state→`Page({})`, `fetch`→`my.request`, and Supabase auth→`my.getAuthCode`.
>
> Preserve the FIAT 2.5 visual contract exactly. Add any new backend domains to `dana-mp/WHITELIST.md`.
>
> Report: ported files, whitelist additions, JSAPI gaps (anything the web version uses that has no `my.*` equivalent).

## Post-port
- Read the porter's report.
- If it flagged JSAPI gaps, surface them to the user and ask whether to (a) drop the feature for MP, (b) move it server-side, or (c) escalate to `pasar-product`.
- Remind the user to add new domains to the DANA portal Server Domain Whitelist.
