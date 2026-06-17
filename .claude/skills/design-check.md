---
name: design-check
description: Audit a screen or component against the DANA FIAT 2.5 design system. Usage `/design-check <file or screen name>`. Reports violations and suggested fixes.
---

You're auditing UI work against `DESIGN_SYSTEM.md` (DANA FIAT 2.5). The user invoked `/design-check` with a target file or screen name in `$ARGUMENTS`.

## Steps
1. Read `DESIGN_SYSTEM.md` (focus on Section 0 — AI Rendering Contract — and the Composition Pattern matching the target screen type: Home / Form / Detail / List).
2. Read the target file(s) in `$ARGUMENTS`. If `$ARGUMENTS` names a screen ("Beranda", "Catatan"), find the route under `web/app/`.
3. Score against the **hard rules**:
   - Page background `#F5F5F5` (gray, not white)?
   - DANA blue `#108EE9` header, 88–120px, white text, white icons?
   - First card overlapping/under header, 12px radius, white bg, 16px padding?
   - Section titles 24–28px bold?
   - CTA primary `#108EE9`, 1–2 word Indonesian labels?
   - Functional colorful icons (not thin monochrome)?
   - Indonesian copy (no English leakage)?
   - Tailwind tokens derived from FIAT 2.5 (not Tailwind defaults)?

## Output format
```
## /design-check: <target>

### PASS
- <item>

### FAIL
- <item> — line <N>: <observed> → should be <expected per FIAT §X>

### Suggested fix
- <concrete diff or change>
```

Be specific. Cite the FIAT section number for each rule violation. Don't be vague — "looks off" is not a valid finding.
