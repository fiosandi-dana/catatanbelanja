# FIAT 2.5 MD — DANA Design System v2.5 Library, Tokens & UX Guideline

> Purpose: This document is made to be readable by designers, developers, GPT, Codex, Claude, and other agentic AI tools so UI output stays consistent with DANA/FIAT component language.
>
> Source inspected: Figma file `📕 Design System — v2.5`, connected team library `📕 Design System: v2.5`, plus uploaded JSON token exports: `🎨 Color`, `⌨️ Typography`, and `📐 Appearance`.
>
> Important note: Token spelling follows the exported JSON exactly. The source uses `Pallete` instead of `Palette`; keep `Pallete` when referencing exact token paths.


---

# 0. AI Rendering Contract — How GPT/Codex/Claude Must Read This Guideline

This section exists because AI often reads a design-system guideline as **generic inspiration** instead of a **visual contract**. For DANA FIAT 2.5 output, the AI must follow this document in this order:

1. **Reference screens first** — match the DANA visual soul from the embedded screenshots.
2. **Pattern recipe second** — use the screen formulas below before inventing layouts.
3. **Foundation tokens third** — use exact colors, radius, spacing, typography, and semantic tokens.
4. **Component rules last** — choose components only after hierarchy and layout are correct.

## 0.1 Hard Rule for AI Output

Do not generate a modern generic fintech/mobile-bank UI. DANA FIAT 2.5 has a specific visual DNA:

- Big **DANA blue header area** as the top brand container.
- White rounded cards overlap or sit close under the blue header.
- Page background is light gray, not pure white.
- Section titles are large, dark, and direct.
- Components are chunky, readable, and optimized for Indonesian mass-market mobile users.
- Icons are colorful and functional, not thin monochrome line icons.
- Information is grouped into cards; cards carry meaning, not decoration.
- Blue is functional: navigation, CTA, active state, link, selected state.


## 0.3 Why Generic AI Output Usually Fails

| Wrong AI Behavior | Why It Fails DANA FIAT 2.5 | Required Fix |
|---|---|---|
| Creates clean white iOS-style fintech screens | Too generic, too premium-bank, not DANA mass-market | Use blue header + gray background + white card modules |
| Uses thin icons and subtle text everywhere | DANA uses clear colorful icons and strong readable labels | Use bold labels, high contrast, icon-first menu behavior |
| Makes every card small and low-emphasis | DANA cards are large containers that define content groups | Use large rounded cards with 12–16px padding |
| Uses too many small labels and metadata | DANA prioritizes instant comprehension | Use short Indonesian copy; one dominant task per section |
| Uses blue only for CTA | DANA blue also creates the top brand space and active states | Keep 30% brand presence but do not flood content cards |
| Designs screens from feature logic only | Output ignores visual soul | Start from the reference composition, then adapt the feature |

## 0.4 DANA FIAT 2.5 Screen Formula

Use this formula for most FIAT mobile screens unless the flow requires a special canvas.

```yaml
screen_formula:
  canvas:
    baseline: 375x812
    background: Background/Base/Primary #F5F5F5
    density: compact-readable
  header:
    color: Background/Brand/Primary #108EE9
    status_bar_area: included
    appbar_height: 88-120px depending on safe area
    total_blue_area: 160-190px for landing pages
    title_alignment: center
    title_style: white, 18-20px, semibold/bold
    left_icon: back or product icon, white, 24px
    right_icon: help/utility, white, 24px
  first_card:
    placement: overlaps blue header or starts immediately below it
    x_margin: 16px
    radius: 12px preferred for large containers, 8px allowed for small cards
    background: #FFFFFF
    padding: 16px default, 12px low-end
    shadow: low / very soft; avoid heavy floating shadow
  content:
    section_title: 24-28px bold, Text/Base/Strong
    card_gap: 12px default, 8px low-end
    intra_card_gap: 12-16px
    page_side_padding: 16px default, 12px low-end
  cta:
    primary: #108EE9
    disabled: blue with lower opacity or semantic disabled token
    label: 1-2 words where possible
```

## 0.5 Composition Pattern — Home

Home screen must feel more energetic than transaction forms.

```yaml
home_pattern:
  top_area:
    background: DANA blue gradient/solid area
    contains: balance, quick action row, campaign/banner
    mood: energetic, promotional, colorful
  quick_action_row:
    icons: large, white/light blue, 4 columns
    labels: short, 14-16px, white
  service_card:
    background: white
    radius: 12px
    columns: 4
    rows: 2 visible preferred
    icons: colorful, 36-48px
    labels: dark, centered, 14-16px
  feed_card:
    compact social/transaction activity
    white card on gray background
  bottom_nav:
    center PAY action dominant
    other nav items neutral dark/gray
```

Do:
- Keep the blue area visually dominant at the top.
- Put high-frequency actions above feed/content.
- Use colorful service icons.

Do not:
- Make the home screen mostly white.
- Replace colorful DANA service icons with generic outline icons.
- Hide PAY dominance in bottom navigation.

## 0.6 Composition Pattern — Kirim Uang / Send Money

```yaml
send_money_landing_pattern:
  header:
    title: Kirim Uang
    blue_area: large, 160-190px
  first_card:
    title: Kirim Cepat
    title_size: 24-28px bold
    search_input:
      height: 44-48px
      border: #D1D1D1 or Outline/Base/Secondary
      radius: 6-8px
      placeholder: gray, 16px
    quick_send_grid:
      columns: 4
      visible_rows: 2
      avatar_size: 48-56px
      favorite_badge: orange, small, top-left overlap
      label: 14-16px, semibold, max 2 lines
    see_all:
      centered blue text + down chevron
  menu_card:
    columns: 3
    icon_size: 44-56px
    label: 16-18px bold, centered
    spacing: generous but compact
```

Do:
- Preserve the big `Kirim Cepat` card as the main object.
- Use cards for grouping quick send and menu categories.
- Use strong text labels for menu items.

Do not:
- Turn quick send into tiny horizontal chips.
- Use generic bank app list cards as the primary landing style.
- Use too many hairline dividers.

## 0.7 Composition Pattern — Minta Uang / Request Money

```yaml
request_money_landing_pattern:
  header:
    title: Minta Uang
    blue_area: large, 160-190px
  first_card:
    title: Minta Cepat
    search_input: full-width, 44-48px
    contact_grid:
      columns: 4
      rows: 2
      avatar_size: 48-56px
      label: 14-16px, max one/two lines with ellipsis
  method_card:
    title: Metode lainnya
    actions: Link and QRIS
    action_button_height: 44-48px
    layout: two equal buttons
  active_request_card:
    title: Permintaan Aktif
    right_action: RIWAYAT outlined blue button
```

Do:
- Use `Minta Cepat` as the first meaningful card.
- Keep `Metode lainnya` as secondary, below quick request.
- Use `Permintaan Aktif` as a status/entry card, not a heavy section.

Do not:
- Make request methods more dominant than Minta Cepat.
- Use long explanatory copy before user chooses an action.
- Use random decorative illustrations unless the state is empty/error.

## 0.8 Visual DNA Checklist Before Output

Every generated screen must pass this checklist:

- [ ] Top area uses DANA blue when the screen is a FIAT landing or major money flow entry.
- [ ] Content background is light gray, not full white.
- [ ] Main content is grouped inside white rounded cards.
- [ ] First card is visually dominant and easy to understand before reading details.
- [ ] Section title is large and dark.
- [ ] Icons are colorful/filled enough to match DANA service style.
- [ ] Text is compact Indonesian, not long product explanation.
- [ ] Brand blue usage feels around 30% on landing screens, not 5% and not 80%.
- [ ] Layout density feels similar to the reference screenshots, not generic iOS banking.
- [ ] CTA/action states are obvious and financially safe.

## 0.9 Prompt Block for GPT / Codex / Claude

Copy this block when asking AI to generate UI from this MD:

```markdown
Read `FIAT 2.5 MD` as a strict visual contract, not inspiration.
Before generating UI, identify which reference pattern applies: Home, Kirim Uang, Minta Uang, or Financial Form.
Use the embedded UI references and the textual screen formulas as source of truth.
The output must look like DANA FIAT 2.5: blue header, light gray page background, white rounded cards, large section title, compact Indonesian copy, colorful functional icons, and card-based hierarchy.
Do not create generic fintech/iOS/banking UI.
Do not use thin monochrome icon sets unless the source component uses them.
Do not invent a new style, palette, radius, spacing, or typography.
After generating, self-review against the Visual DNA Checklist and revise until it passes.
```

## 0.10 AI Self-Review Rubric

Score each output from 0–100 before accepting it.

| Criteria | Weight | Pass Standard |
|---|---:|---|
| DANA visual soul | 30 | Looks close to reference screenshots, not generic fintech |
| Hierarchy | 20 | One obvious main task and clear first card |
| Token usage | 15 | Uses DANA blue, gray background, white cards, correct text colors |
| Component fit | 15 | Uses correct cards, search, menu, appbar, CTA, status patterns |
| Copy clarity | 10 | Short Indonesian wording, no over-explaining |
| Safety states | 10 | Error/disabled/confirmation states are clear |

Minimum acceptable score: **85/100**. If below 85, regenerate or revise.

---

## 1. Design Language Principle

DANA UI must feel **clean, readable, fast, and trustworthy**. Clean does not mean empty. Clean means users understand the page hierarchy quickly without needing to read every word.

### Core UI Goal

A user should understand:

1. **Where they are**
2. **What they can do**
3. **What information matters most**
4. **What happens after tapping the main action**

### Design Language Rules

| Principle | Rule |
|---|---|
| Clarity first | Every screen must have one dominant task and one dominant CTA. |
| Less wording | Use short copy. Prefer direct nouns and verbs. Avoid explaining everything at once. |
| Visual hierarchy | Use size, spacing, grouping, color, and component weight before adding more text. |
| Card-based readability | Use white cards on light neutral surfaces for modular content. |
| Brand discipline | Use DANA blue as a functional brand/action color, not decoration everywhere. |
| Mobile-first | Baseline 375 × 812. All spacing must survive low-end and small devices. |
| Trust | Avoid surprising actions, unclear fees, hidden status, or destructive actions without confirmation. |

---

## 2. Foundation Inventory

Extracted foundation collections from the library and uploaded JSON:

| Foundation Name | Description | JSON Status |
|---|---|---|
| `🎨 Color` | Palette and semantic color tokens for background, text, outline, overlay, feedback, shadow, and brand. | Added from JSON: 153 tokens |
| `⌨️ Typography` | Text size, line-height, weight, and letter-spacing tokens. | Added from JSON: 38 tokens |
| `🎦 Effect & Animation` | Motion and effect foundation. | Extracted from Figma library metadata; values not included in uploaded JSON |
| `📐 Appearance` | Radius, spacing, card, and bottomsheet appearance tokens. | Added from JSON: 27 tokens |
| `📝 Copywriting` | Reusable copy tokens such as error feedback text. | Extracted from Figma library metadata |

---

# 3. Color Foundation

## 3.1 Color Language Summary

| Role | Token | Resolved Value | Design Language |
|---|---|---|---|
| Page background | `Background/Base/Primary` | `#F5F5F5` | Use for full screen canvas. |
| Card surface | `Background/Base/Secondary` | `#FFFFFF` | Use for cards and raised containers. |
| Input surface | `Background/Base/Tertiary` | `#F5F8FD` | Use for text input or soft editable surface. |
| DANA brand / primary action | `Background/Brand/Primary`, `Text/Brand/Primary`, `Outline/Brand/Primary` | `#108EE9` | Use for primary CTA, selected state, brand action. |
| DANA Merchant / KYB brand | `Background/Brand/Secondary`, `Text/Brand/Secondary`, `Outline/Brand/Secondary` | `#0F479D` | Use for merchant/KYB context. |
| Strong text | `Text/Base/Strong` | `#313131` | Use for title, amount, selected/important value. |
| Medium text | `Text/Base/Medium` | `#727272` | Use for description, secondary metadata. |
| Subtle text | `Text/Base/Subtle` | `#A4A4A4` | Use for helper text, placeholder, timestamp. |
| Disabled text | `Text/Base/Disabled` | `#D1D1D1` | Use only when unavailable or inactive. |
| Error | `Background/Feedback/Bold/Error`, `Text/Feedback/Error Dark` | `#FF5D55`, `#D14C46` | Use for failed/destructive/urgent state. |
| Success | `Background/Feedback/Bold/Success`, `Text/Feedback/Success Dark` | `#00A952`, `#008440` | Use for completed/claimed/successful state. |
| Warning | `Background/Feedback/Bold/Warning`, `Text/Feedback/Warning Dark` | `#E0A800`, `#A87400` | Use for pending/caution/price-change state. |

## 3.2 60 / 30 / 10 Color Rule

| Ratio | Purpose | Recommended Tokens | Usage Rule |
|---:|---|---|---|
| 60% | Base surface / readable canvas | `Background/Base/Primary`, `Background/Base/Secondary`, `Gray 10`, `Slate 10/20`, white card | Use for page background, cards, input surfaces, neutral containers. |
| 30% | Brand or section identity | `Blue 50 #108EE9` for DANA, `Ink 50 #0F479D` for DANA Merchant / KYB | Use for main CTA, selected state, brand header, active icon. Do not flood the entire page with brand color. |
| 10% | Accent / status / urgency | Green, Red, Orange, Yellow, small highlights | Use only for feedback, alert, badge, promo marker, or status emphasis. |

### Brand Primary and Secondary

| Brand Role | Token | Resolved Color | Use |
|---|---|---:|---|
| DANA Primary | `Background/Brand/Primary`, `Text/Brand/Primary`, `Outline/Brand/Primary` | `#108EE9` | Main DANA action, selected navigation, active brand surface. |
| DANA Merchant / KYB Secondary | `Background/Brand/Secondary`, `Text/Brand/Secondary`, `Outline/Brand/Secondary` | `#0F479D` | Merchant/KYB business identity, merchant dashboard, business CTA context. |

### Strong / Medium / Subtle Definition

| Level | Token | Resolved Color | Meaning | Use |
|---|---|---:|---|---|
| Strong | `Text/Base/Strong` | `#313131` | Highest readable emphasis | Main title, amount, account name, selected value, critical copy. |
| Medium | `Text/Base/Medium` | `#727272` | Supporting emphasis | Description, metadata, secondary label. |
| Subtle | `Text/Base/Subtle` | `#A4A4A4` | Lowest readable emphasis | Helper text, timestamp, optional note. |
| Disabled | `Text/Base/Disabled` | `#D1D1D1` | Not currently actionable | Disabled CTA, inactive field, unavailable option. |

### DANA Color Usage Rule

Do:

- Use `Blue 50 #108EE9` for primary CTA, selected navigation, active state, and brand header.
- Use `Ink 50 #0F479D` for DANA Merchant / KYB flows only.
- Use blue in a controlled 30% proportion per screen.
- Use white cards and neutral background to make blue feel clear and premium.
- Use semantic tokens first, raw palette tokens only for illustration, chart, or special campaign needs.

Don’t:

- Do not use multiple strong colors in one screen unless they represent different statuses.
- Do not use brand blue for every icon, label, border, and CTA at the same time.
- Do not use red for non-destructive actions.
- Do not put blue text on strong blue background unless contrast is guaranteed.
- Do not use raw palette tokens when a semantic token already exists for the role.

## 3.3 Semantic Color Tokens from JSON

| Semantic Token | Alias / Raw Value | Resolved Value | Source Description |
|---|---|---|---|
| `Background/Base/Primary` | `{Pallete.Gray.Gray 10}` | `#F5F5F5` | Usage for page |
| `Background/Base/Secondary` | `{Pallete.Alpha.Light.Full Light}` | `#FFFFFF` | Usage: Card |
| `Background/Base/Tertiary` | `{Pallete.Slate.Slate 20}` | `#F5F8FD` | Usage: Text Input |
| `Background/Brand/Primary` | `{Pallete.Blue.Blue 50}` | `#108EE9` | Brand for DANA |
| `Background/Brand/Secondary` | `{Pallete.Ink.Ink 50}` | `#0F479D` | Brand for KYB |
| `Background/Feedback/Bold/Error` | `{Pallete.Red.Red 50}` | `#FF5D55` | Use it for error or urgent information to user |
| `Background/Feedback/Bold/Info` | `{Pallete.Blue.Blue 50}` | `#108EE9` | Use it for error or urgent information to user |
| `Background/Feedback/Bold/Success` | `{Pallete.Green.Green 60}` | `#00A952` |  |
| `Background/Feedback/Bold/Warning` | `{Pallete.Yellow.Yellow 60}` | `#E0A800` | Use it for error or urgent information to user |
| `Background/Feedback/Light/Error` | `{Pallete.Red.Red 10}` | `#FFEAE9` | Use it for error or urgent information to user |
| `Background/Feedback/Light/Info` | `{Pallete.Blue.Blue 10}` | `#E9F5FE` | Use it for error or urgent information to user |
| `Background/Feedback/Light/Success` | `{Pallete.Green.Green 10}` | `#DEF9EB` | Use it for warning information to user |
| `Background/Feedback/Light/Warning` | `{Pallete.Orange.Orange 10}` | `#FEF0DE` | Use it for warning information to user |
| `Background/Overlay/Dark Low` | `{Pallete.Alpha.Dark.Dark 16}` | `#000000 / 16%` | Usage for overlay container light |
| `Background/Overlay/Dark Medium` | `{Pallete.Alpha.Dark.Dark 32}` | `#000000 / 32%` | Usage for overlay container light |
| `Background/Overlay/Dark Strong` | `{Pallete.Alpha.Dark.Dark 48}` | `#000000 / 48%` | Usage for overlay container light |
| `Background/Overlay/Light Low` | `{Pallete.Alpha.Light.Light 16}` | `#FFFFFF / 16%` | Usage for overlay container light |
| `Background/Overlay/Light Medium` | `{Pallete.Alpha.Light.Light 32}` | `#FFFFFF / 32%` | Usage for overlay container light |
| `Background/Overlay/Light Strong` | `{Pallete.Alpha.Light.Light 48}` | `#FFFFFF / 48%` | Usage for overlay container dark |
| `Background/Overlay/Transparent` | `{Pallete.Alpha.Light.No Light}` | `#FFFFFF / 0%` |  |
| `Outline/Base/Primary` | `{Pallete.Gray.Gray 20}` | `#EBEBEB` |  |
| `Outline/Base/Secondary` | `{Pallete.Alpha.Light.Full Light}` | `#FFFFFF` |  |
| `Outline/Base/Tertiary` | `{Pallete.Slate.Slate 30}` | `#E8EDF5` |  |
| `Outline/Brand/Primary` | `{Pallete.Blue.Blue 50}` | `#108EE9` |  |
| `Outline/Brand/Secondary` | `{Pallete.Ink.Ink 50}` | `#0F479D` |  |
| `Outline/Feedback/Error` | `{Pallete.Red.Red 20}` | `#FFCDCA` |  |
| `Outline/Feedback/Info` | `{Pallete.Blue.Blue 20}` | `#BADFFA` |  |
| `Outline/Feedback/Success` | `{Pallete.Green.Green 20}` | `#B8F1D4` |  |
| `Outline/Feedback/Warning` | `{Pallete.Orange.Orange 20}` | `#FEDBB0` |  |
| `Outline/Overlay/Dark` | `{Pallete.Alpha.Dark.Dark 48}` | `#000000 / 48%` |  |
| `Outline/Overlay/Light` | `{Pallete.Alpha.Light.Light 48}` | `#FFFFFF / 48%` |  |
| `Shadow/High/Dark` | `#041221 / 16%` | `#041221 / 16%` |  |
| `Shadow/High/Light` | `#FFFFFF / 16%` | `#FFFFFF / 16%` |  |
| `Shadow/Low/Dark` | `#041221 / 12%` | `#041221 / 12%` |  |
| `Shadow/Low/Light` | `#FFFFFF / 12%` | `#FFFFFF / 12%` |  |
| `Text/Base/Disabled` | `{Pallete.Gray.Gray 30}` | `#D1D1D1` |  |
| `Text/Base/Medium` | `{Pallete.Gray.Gray 70}` | `#727272` | Low emphasis text |
| `Text/Base/Neutral` | `{Pallete.Alpha.Light.Full Light}` | `#FFFFFF` |  |
| `Text/Base/Strong` | `{Pallete.Gray.Gray 90}` | `#313131` | Highlighted Text |
| `Text/Base/Subtle` | `{Pallete.Gray.Gray 50}` | `#A4A4A4` | Lowest emphasis text |
| `Text/Brand/Primary` | `{Pallete.Blue.Blue 50}` | `#108EE9` | CTA or Highlited Text |
| `Text/Brand/Secondary` | `{Pallete.Ink.Ink 50}` | `#0F479D` | CTA or Highlited Text |
| `Text/Feedback/Error Dark` | `{Pallete.Red.Red 60}` | `#D14C46` |  |
| `Text/Feedback/Success Dark` | `{Pallete.Green.Green 70}` | `#008440` |  |
| `Text/Feedback/Warning Dark` | `{Pallete.Yellow.Yellow 70}` | `#A87400` |  |
| `Text/Overlay/Dark High` | `{Pallete.Alpha.Dark.Dark 48}` | `#000000 / 48%` | CTA or Highlited Text |
| `Text/Overlay/Dark Low` | `{Pallete.Alpha.Dark.Dark 16}` | `#000000 / 16%` | CTA or Highlited Text |
| `Text/Overlay/Light High` | `{Pallete.Alpha.Light.Light 56}` | `#FFFFFF / 56%` | CTA or Highlited Text |
| `Text/Overlay/Light Low` | `{Pallete.Alpha.Light.Light 24}` | `#FFFFFF / 24%` | CTA or Highlited Text |

## 3.4 Raw Palette Tokens from JSON

### Blue Palette

| Token | Value |
|---|---|
| `Pallete/Blue/Blue 10` | `#E9F5FE` |
| `Pallete/Blue/Blue 20` | `#BADFFA` |
| `Pallete/Blue/Blue 30` | `#7AC2F6` |
| `Pallete/Blue/Blue 40` | `#4AACF3` |
| `Pallete/Blue/Blue 50` | `#108EE9` |
| `Pallete/Blue/Blue 60` | `#0E79C6` |
| `Pallete/Blue/Blue 70` | `#084A7A` |
| `Pallete/Blue/Blue 80` | `#052D4A` |
| `Pallete/Blue/Blue 90` | `#031A2A` |

### Ink Palette

| Token | Value |
|---|---|
| `Pallete/Ink/Ink 10` | `#D6E0F2` |
| `Pallete/Ink/Ink 20` | `#ADC1E5` |
| `Pallete/Ink/Ink 30` | `#84A2D9` |
| `Pallete/Ink/Ink 40` | `#5A83CC` |
| `Pallete/Ink/Ink 50` | `#0F479D` |
| `Pallete/Ink/Ink 60` | `#0D3A7E` |
| `Pallete/Ink/Ink 70` | `#0B2D60` |
| `Pallete/Ink/Ink 80` | `#082041` |
| `Pallete/Ink/Ink 90` | `#041221` |

### Gray Palette

| Token | Value |
|---|---|
| `Pallete/Gray/Gray 10` | `#F5F5F5` |
| `Pallete/Gray/Gray 20` | `#EBEBEB` |
| `Pallete/Gray/Gray 30` | `#D1D1D1` |
| `Pallete/Gray/Gray 40` | `#BFBFBF` |
| `Pallete/Gray/Gray 50` | `#A4A4A4` |
| `Pallete/Gray/Gray 60` | `#939393` |
| `Pallete/Gray/Gray 70` | `#727272` |
| `Pallete/Gray/Gray 80` | `#525252` |
| `Pallete/Gray/Gray 90` | `#313131` |

### Slate Palette

| Token | Value |
|---|---|
| `Pallete/Slate/Slate 10` | `#FCFDFE` |
| `Pallete/Slate/Slate 20` | `#F5F8FD` |
| `Pallete/Slate/Slate 30` | `#E8EDF5` |
| `Pallete/Slate/Slate 40` | `#D4DCE8` |
| `Pallete/Slate/Slate 50` | `#BCC6D6` |
| `Pallete/Slate/Slate 60` | `#9EADC3` |
| `Pallete/Slate/Slate 70` | `#7D8CA7` |
| `Pallete/Slate/Slate 80` | `#5C6D88` |
| `Pallete/Slate/Slate 90` | `#3F4D63` |

### Green Palette

| Token | Value |
|---|---|
| `Pallete/Green/Green 10` | `#DEF9EB` |
| `Pallete/Green/Green 20` | `#B8F1D4` |
| `Pallete/Green/Green 30` | `#8AE8B8` |
| `Pallete/Green/Green 40` | `#54DE97` |
| `Pallete/Green/Green 50` | `#00CE64` |
| `Pallete/Green/Green 60` | `#00A952` |
| `Pallete/Green/Green 70` | `#008440` |
| `Pallete/Green/Green 80` | `#005F2E` |
| `Pallete/Green/Green 90` | `#002D16` |

### Yellow Palette

| Token | Value |
|---|---|
| `Pallete/Yellow/Yellow 10` | `#FFFBEA` |
| `Pallete/Yellow/Yellow 20` | `#FFF8D4` |
| `Pallete/Yellow/Yellow 30` | `#FFF1A3` |
| `Pallete/Yellow/Yellow 40` | `#FFE470` |
| `Pallete/Yellow/Yellow 50` | `#FFCC3B` |
| `Pallete/Yellow/Yellow 60` | `#E0A800` |
| `Pallete/Yellow/Yellow 70` | `#A87400` |
| `Pallete/Yellow/Yellow 80` | `#755100` |
| `Pallete/Yellow/Yellow 90` | `#2E1C00` |

### Orange Palette

| Token | Value |
|---|---|
| `Pallete/Orange/Orange 10` | `#FEF0DE` |
| `Pallete/Orange/Orange 20` | `#FEDBB0` |
| `Pallete/Orange/Orange 30` | `#FDBC6C` |
| `Pallete/Orange/Orange 40` | `#FCA73E` |
| `Pallete/Orange/Orange 50` | `#FB8B01` |
| `Pallete/Orange/Orange 60` | `#CC6F00` |
| `Pallete/Orange/Orange 70` | `#A66200` |
| `Pallete/Orange/Orange 80` | `#7A4200` |
| `Pallete/Orange/Orange 90` | `#2C1600` |

### Red Palette

| Token | Value |
|---|---|
| `Pallete/Red/Red 10` | `#FFEAE9` |
| `Pallete/Red/Red 20` | `#FFCDCA` |
| `Pallete/Red/Red 30` | `#FFA19C` |
| `Pallete/Red/Red 40` | `#FF847E` |
| `Pallete/Red/Red 50` | `#FF5D55` |
| `Pallete/Red/Red 60` | `#D14C46` |
| `Pallete/Red/Red 70` | `#A33C36` |
| `Pallete/Red/Red 80` | `#6E2825` |
| `Pallete/Red/Red 90` | `#381413` |

### Alpha Palette

| Token | Value |
|---|---|
| `Pallete/Alpha/Dark/Dark 8` | `#000000 / 8%` |
| `Pallete/Alpha/Dark/Dark 16` | `#000000 / 16%` |
| `Pallete/Alpha/Dark/Dark 24` | `#000000 / 24%` |
| `Pallete/Alpha/Dark/Dark 32` | `#000000 / 32%` |
| `Pallete/Alpha/Dark/Dark 40` | `#000000 / 40%` |
| `Pallete/Alpha/Dark/Dark 48` | `#000000 / 48%` |
| `Pallete/Alpha/Dark/Dark 56` | `#000000 / 56%` |
| `Pallete/Alpha/Dark/Dark 64` | `#000000 / 64%` |
| `Pallete/Alpha/Dark/Dark 72` | `#000000 / 72%` |
| `Pallete/Alpha/Dark/Dark 80` | `#000000 / 80%` |
| `Pallete/Alpha/Dark/Full Dark` | `#000000` |
| `Pallete/Alpha/Dark/No Dark` | `#000000 / 0%` |
| `Pallete/Alpha/Light/Full Light` | `#FFFFFF` |
| `Pallete/Alpha/Light/Light 8` | `#FFFFFF / 8%` |
| `Pallete/Alpha/Light/Light 16` | `#FFFFFF / 16%` |
| `Pallete/Alpha/Light/Light 24` | `#FFFFFF / 24%` |
| `Pallete/Alpha/Light/Light 32` | `#FFFFFF / 32%` |
| `Pallete/Alpha/Light/Light 40` | `#FFFFFF / 40%` |
| `Pallete/Alpha/Light/Light 48` | `#FFFFFF / 48%` |
| `Pallete/Alpha/Light/Light 56` | `#FFFFFF / 56%` |
| `Pallete/Alpha/Light/Light 64` | `#FFFFFF / 64%` |
| `Pallete/Alpha/Light/Light 72` | `#FFFFFF / 72%` |
| `Pallete/Alpha/Light/Light 80` | `#FFFFFF / 80%` |
| `Pallete/Alpha/Light/No Light` | `#FFFFFF / 0%` |

### Other Palette

| Token | Value |
|---|---|
| `Pallete/Other/Blue Soft` | `#1AC1FF` |
| `Pallete/Other/Candy Pink` | `#FF399C` |
| `Pallete/Other/Gray Soft` | `#F1F1F1` |
| `Pallete/Other/Indigo` | `#246DF5` |
| `Pallete/Other/Pink` | `#FF64AE` |
| `Pallete/Other/Purple` | `#7C4DEF` |
| `Pallete/Other/Turqoise` | `#45DDD9` |
| `Pallete/Other/Verdigris` | `#58B7A5` |

---

# 4. Spacing, Gap, Padding & Appearance Foundation

## 4.1 Extracted Appearance Tokens from JSON

| Appearance Token | Alias / Raw Value | Resolved px | Source Description |
|---|---|---|---|
| `Bottomsheet/Padding/Compact` | `{Pallete.Spacing.M}` | `12` | Padding Size -> 12px, Suitable for input action in bottomsheet |
| `Bottomsheet/Padding/Default` | `{Pallete.Spacing.L}` | `16` | Padding Size -> 16. Suitable for information with illustration in bottomsheet |
| `Bottomsheet/Radius/Default` | `{Pallete.Radius Corner.2XL}` | `24` |  |
| `Card/Padding/Content` | `{Pallete.Radius Corner.M}` | `12` |  |
| `Card/Radius/Container/Compact` | `{Pallete.Radius Corner.XL}` | `20` | EN<br>“Corner radius for compact surfaces, typically used in 1:1 ratio components (e.g. square cards). Uses a slightly larger radius to maintain visual softness in tighter proportions.”<br><br>ID<br>“Radius sudut untuk permukaan dengan ukuran compact, biasanya digunakan pada komponen rasio 1:1 (misalnya kartu persegi). Menggunakan radius yang sedikit lebih besar untuk menjaga kesan halus pada proporsi yang lebih rapat.” |
| `Card/Radius/Container/Default` | `{Pallete.Radius Corner.L}` | `16` | Suitable content like in dialog, or any content that using shape non 1:1 |
| `Card/Radius/Content` | `{Pallete.Radius Corner.S}` | `8` | EN<br>“Corner radius for inner surfaces within a container (e.g. card content, nested layers). Use one step smaller than the container radius to maintain visual hierarchy and depth.”<br><br>ID<br>“Radius sudut untuk permukaan bagian dalam (inner surface) di dalam container (misalnya konten kartu atau elemen bertingkat). Gunakan satu level lebih kecil dari container untuk menjaga hierarki visual dan kedalaman.” |
| `Pallete/Radius Corner/2XL` | `24` | `24` | Baseline value radius corner |
| `Pallete/Radius Corner/3XL` | `28` | `28` | Baseline value radius corner |
| `Pallete/Radius Corner/4XL` | `32` | `32` | Baseline value radius corner |
| `Pallete/Radius Corner/5XL` | `40` | `40` | Baseline value radius corner |
| `Pallete/Radius Corner/L` | `16` | `16` | Baseline value radius corner |
| `Pallete/Radius Corner/M` | `12` | `12` | Baseline value radius corner |
| `Pallete/Radius Corner/None` | `0` | `0` | Baseline value radius corner |
| `Pallete/Radius Corner/S` | `8` | `8` | Baseline value radius corner |
| `Pallete/Radius Corner/XL` | `20` | `20` | Baseline value radius corner |
| `Pallete/Radius Corner/XS` | `4` | `4` | Baseline value radius corner |
| `Pallete/Spacing/2XL` | `24` | `24` | Baseline value Spacing |
| `Pallete/Spacing/3XL` | `28` | `28` | Baseline value Spacing |
| `Pallete/Spacing/4XL` | `32` | `32` | Baseline value Spacing |
| `Pallete/Spacing/5XL` | `40` | `40` | Baseline value Spacing |
| `Pallete/Spacing/L` | `16` | `16` | Baseline value Spacing |
| `Pallete/Spacing/M` | `12` | `12` | Baseline value Spacing |
| `Pallete/Spacing/None` | `0` | `0` | Baseline value Spacing |
| `Pallete/Spacing/S` | `8` | `8` | Baseline value Spacing |
| `Pallete/Spacing/XL` | `20` | `20` | Baseline value Spacing |
| `Pallete/Spacing/XS` | `4` | `4` | Baseline value Spacing |

## 4.2 Baseline Rule

DANA/FIAT screens should use a **4px spacing grid**. The uploaded `📐 Appearance` JSON confirms the base spacing ladder: `None 0`, `XS 4`, `S 8`, `M 12`, `L 16`, `XL 20`, `2XL 24`, `3XL 28`, `4XL 32`, `5XL 40`.

| Token | px | Use |
|---|---:|---|
| `Pallete/Spacing/XS` | 4 | Tight icon/text gap, micro alignment. |
| `Pallete/Spacing/S` | 8 | Default inner gap inside compact components and dense card lists. |
| `Pallete/Spacing/M` | 12 | Compact page/card padding, low-end device spacing. |
| `Pallete/Spacing/L` | 16 | Default page/card padding, high-end device spacing. |
| `Pallete/Spacing/XL` | 20 | Large section separation. |
| `Pallete/Spacing/2XL` | 24 | Major section separation / bottom CTA safe spacing. |
| `Pallete/Spacing/4XL` | 32 | Hero spacing or empty-state breathing room. |
| `Pallete/Spacing/5XL` | 40 | Large illustration or empty-state separation. |

## 4.3 Responsive Spacing Language

| Context | Low-end / Small Device | High-end / Larger Device | Token Logic |
|---|---:|---:|---|
| Page horizontal padding | 12px | 16px | `Spacing/M` → `Spacing/L` |
| Card inner padding | 12px | 16px | Compact financial form → content-heavy card |
| Gap between cards | 8px | 12px | Dense list → premium/less dense page |
| Gap between section title and card | 8px | 12px | Keep title close to owned content |
| Gap between icon and label | 8px | 8px | Keep recognition compact and stable |
| Bottom CTA container padding | 12–16px | 16px | Keep CTA reachable and safe-area aware |
| Bottomsheet padding | 12px compact / input action | 16px default / illustration info | `Bottomsheet/Padding/Compact` or `Default` |

### Recommended Rule

- Use **8px gap between cards** when the screen is dense, transaction-heavy, or used on 360–375px width.
- Use **12px gap between cards** when the screen has fewer items or needs more premium feel.
- Use **12px padding inside cards** for compact financial forms.
- Use **16px padding inside cards** for review screens, confirmation, or content-heavy cards.
- Use **Bottomsheet Compact Padding 12px** for input/action bottomsheet.
- Use **Bottomsheet Default Padding 16px** for informational bottomsheet with illustration or longer explanation.

Do:

- Group related information inside one card.
- Keep card spacing consistent vertically.
- Use spacing to separate meaning, not just decoration.
- Give the main CTA enough bottom safe area.

Don’t:

- Do not use random 10px, 14px, 18px unless inherited from typography line-height.
- Do not create too much vertical whitespace on low-end device if it hides the CTA.
- Do not stack many cards with 16–24px gaps in a transaction screen.

---

# 5. Radius, Border & Card Language

## 5.1 Extracted Radius Tokens

| Token | px | Use |
|---|---:|---|
| `Pallete/Radius Corner/None` | 0 | Sharp edge / no radius. |
| `Pallete/Radius Corner/XS` | 4 | Small internal element, tiny badge, compact indicator. |
| `Pallete/Radius Corner/S` | 8 | Inner card content, input field, standard compact surface. |
| `Pallete/Radius Corner/M` | 12 | Medium surface, nested card, comfortable component. |
| `Pallete/Radius Corner/L` | 16 | Default card container from JSON. |
| `Pallete/Radius Corner/XL` | 20 | Compact 1:1 card or visually soft container. |
| `Pallete/Radius Corner/2XL` | 24 | Bottomsheet default top radius. |
| `Pallete/Radius Corner/3XL` | 28 | Large modal/special container. |
| `Pallete/Radius Corner/4XL` | 32 | Large illustration container / premium surface. |
| `Pallete/Radius Corner/5XL` | 40 | Hero surface or very large rounded container. |

## 5.2 Component Radius Rule

| Component | Token | px | Guideline |
|---|---|---:|---|
| Card content / inner surface | `Card/Radius/Content` → `Radius Corner/S` | 8 | Use inside container or nested layer to preserve hierarchy. |
| Card container default | `Card/Radius/Container/Default` → `Radius Corner/L` | 16 | Use for dialog-like or prominent content card. |
| Card container compact | `Card/Radius/Container/Compact` → `Radius Corner/XL` | 20 | Use for compact 1:1 or visually isolated card. |
| Bottomsheet default | `Bottomsheet/Radius/Default` → `Radius Corner/2XL` | 24 | Use top corners for bottomsheet container. |
| Pill / chip | Full radius | 999 | Use for compact selectable labels and filters. |

### Card Rule

Do:

- Use cards to group one decision, one recipient, one transaction summary, or one setting cluster.
- Keep card content scannable: title, value, supporting info, optional action.
- Use white card on `Background/Base/Primary` page surface.
- Use 8–12px vertical gap for repeated cards.

Don’t:

- Do not put too many borders inside one card.
- Do not use card background color as decoration if there is no semantic meaning.
- Do not mix many radius sizes in one screen without hierarchy.

---

# 6. Typography Foundation

## 6.1 Extracted Typography Tokens from JSON

### Typography `Size` Tokens

| Token | Value (px) | Figma Scope |
|---|---|---|
| `Size/Body/L` | `16` | FONT_SIZE |
| `Size/Body/M` | `14` | FONT_SIZE |
| `Size/Body/S` | `12` | FONT_SIZE |
| `Size/Caption/Normal` | `10` | ALL_SCOPES |
| `Size/Display/Large` | `88` | FONT_SIZE |
| `Size/Display/Medium` | `56` | FONT_SIZE |
| `Size/Display/Small` | `32` | FONT_SIZE |
| `Size/Title/Large` | `24` | FONT_SIZE |
| `Size/Title/Medium` | `20` | FONT_SIZE |
| `Size/Title/Small` | `16` | FONT_SIZE |

### Typography `Line Height` Tokens

| Token | Value (px) | Figma Scope |
|---|---|---|
| `Line Height/Body/Large` | `24` | LINE_HEIGHT |
| `Line Height/Body/Medium` | `20` | LINE_HEIGHT |
| `Line Height/Body/Small` | `18` | LINE_HEIGHT |
| `Line Height/Caption/Normal` | `16` | ALL_SCOPES |
| `Line Height/Display/Large` | `104` | LINE_HEIGHT |
| `Line Height/Display/Medium` | `68` | LINE_HEIGHT |
| `Line Height/Display/Small` | `40` | LINE_HEIGHT |
| `Line Height/Title/Large` | `32` | LINE_HEIGHT |
| `Line Height/Title/Medium` | `28` | LINE_HEIGHT |
| `Line Height/Title/Small` | `24` | LINE_HEIGHT |

### Typography `Weight` Tokens

| Token | Value (font-weight) | Figma Scope |
|---|---|---|
| `Weight/Black` | `800` | FONT_STYLE |
| `Weight/Bold` | `700` | FONT_STYLE |
| `Weight/Light` | `300` | FONT_STYLE |
| `Weight/Medium` | `500` | FONT_STYLE |
| `Weight/Normal` | `400` | FONT_STYLE |
| `Weight/Semi Bold` | `600` | FONT_STYLE |

### Typography `Letter Spacing` Tokens

| Token | Value (px) | Figma Scope |
|---|---|---|
| `Letter Spacing/Normal` | `0` | LETTER_SPACING |
| `Letter Spacing/Tight/L` | `-1.6` | LETTER_SPACING |
| `Letter Spacing/Tight/M` | `-1` | LETTER_SPACING |
| `Letter Spacing/Tight/S` | `-0.6` | LETTER_SPACING |
| `Letter Spacing/Tight/XL` | `-2` | LETTER_SPACING |
| `Letter Spacing/Tight/XM` | `-0.8` | LETTER_SPACING |
| `Letter Spacing/Tight/XS` | `-0.4` | LETTER_SPACING |
| `Letter Spacing/Tight/XXL` | `-2.8` | LETTER_SPACING |
| `Letter Spacing/Tight/XXS` | `-0.2` | LETTER_SPACING |
| `Letter Spacing/Wide/L` | `0.2` | LETTER_SPACING |
| `Letter Spacing/Wide/M` | `0.4` | LETTER_SPACING |
| `Letter Spacing/Wide/S` | `0.6` | LETTER_SPACING |

## 6.2 Recommended Mobile Type Scale

| Role | Size | Line Height | Weight | Use |
|---|---:|---:|---:|---|
| Display Large | 88 | 104 | 700–800 | Rare hero marketing only. Avoid in transaction screen. |
| Display Medium | 56 | 68 | 700 | Main amount input, balance focus, money value. |
| Display Small | 32 | 40 | 700 | Empty-state title or success amount. |
| Title Large | 24 | 32 | 600–700 | Page title or major bottomsheet title. |
| Title Medium | 20 | 28 | 600 | Important section / review amount. |
| Title Small | 16 | 24 | 600 | Card title, row title, recipient name. |
| Body Large | 16 | 24 | 400–500 | Primary readable body or row label. |
| Body Medium | 14 | 20 | 400–500 | Secondary info, phone number, caption body. |
| Body Small | 12 | 18 | 400–500 | Helper text, terms, metadata. |
| Caption | 10 | 16 | 400–500 | Tiny label only. Avoid for important finance info. |

## 6.3 Copy Density Rule

| Content Type | Max Recommendation |
|---|---:|
| Primary CTA | 1–2 words |
| Button in card | 1–2 words |
| Section title | 1–4 words |
| Error title | 2–5 words |
| Error body | 1 sentence |
| Helper text | 1 line when possible |
| Financial warning | Clear, short, no hidden implication |

Do:

- Use `16/24` for row title and important label.
- Use `14/20` for secondary information.
- Use `56/68` only for amount input or money value hero.
- Keep amount and CTA visually dominant.

Don’t:

- Do not use 10–12px for important financial amount, fee, due date, or recipient identity.
- Do not use long paragraph copy inside dense transaction screens.
- Do not make all text semibold; use weight to create hierarchy.

---

# 7. Motion, Effect & Animation Foundation

Motion must make the app feel responsive, not decorative.

## 7.1 Motion Language

| Motion Type | Duration | Use |
|---|---:|---|
| Instant feedback | 80–120ms | Tap, ripple, icon state |
| Component transition | 160–240ms | Card expand, field reveal, tab switch |
| Page / bottomsheet transition | 240–360ms | Bottomsheet, screen transition |
| Emotional animation | 360–700ms | Gift, reward, success, celebration |

Do:

- Use motion to show cause and effect.
- Keep financial confirmation motion calm.
- Use emotional animation only for gift, reward, campaign, or success moments.

Don’t:

- Do not animate every component.
- Do not delay transaction completion just for animation.
- Do not use bouncy motion for error, failed, or risky states.

---

# 8. Component Library Documentation

## 8.1 Component / Appbar

**Description**  
Top navigation component for page and bottomsheet contexts. The library description notes Appbar functions for `Bottomsheet` and `Page`.

**Specs**

- Recommended height: 48–56px.
- Left slot: back / close / contextual icon.
- Center slot: page title, max 1 line.
- Right slot: optional action, help, menu, or empty.
- Use `Background/Base/Primary` for normal page and transparent/brand background only when needed.

**UX Guideline**

Do:

- Use short page title.
- Use back for page stack, close for modal/bottomsheet dismissal.
- Keep one primary right-side action only.

Don’t:

- Do not put long explanatory copy in appbar.
- Do not show multiple competing icons unless the task needs them.

---

## 8.2 Statusbar

**Description**  
System status area component used to align screens with mobile device chrome.

**Specs**

- Follow platform safe area.
- Match statusbar content color with page background contrast.
- Use light statusbar on dark/brand header; dark statusbar on white/light surfaces.

**UX Guideline**

Do:

- Keep statusbar visually integrated with header.
- Respect safe area on iOS and Android.

Don’t:

- Do not let content overlap the statusbar.
- Do not use low-contrast icon color.

---

## 8.3 Button Text

**Description**  
Text-only action button used for lightweight actions.

**Specs**

- Text should use CTA style, 12–14px.
- Use brand color for positive/primary text action.
- Use feedback/error color only for destructive text action.
- Minimum tap target: 44–48px height.

**UX Guideline**

Do:

- Use for secondary action, inline action, or low-emphasis CTA.
- Keep label short: 1–2 words where possible.

Don’t:

- Do not use text button as the only CTA in a high-risk transaction.
- Do not place multiple text buttons close together without clear separation.

---

## 8.4 Button Group

**Description**  
Container for two or more related actions.

**Specs**

- Supports horizontal and vertical layout.
- Use full-width stacked layout for bottomsheet/dialog if actions need clarity.
- Primary action should be visually stronger than secondary action.

**UX Guideline**

Do:

- Use maximum two major actions in a decision moment.
- Put safer action first only when it matches platform pattern; otherwise primary CTA should be easiest to find.

Don’t:

- Do not place three or more strong CTAs together.
- Do not make destructive action look like positive primary action.

---

## 8.5 Button Icon

**Description**  
Icon-only button for compact interactions.

**Specs**

- Minimum tap target: 44–48px.
- Icon size: 20–24px for normal use, 28–32px for large touch component.
- Use label/tooltip if meaning is not obvious.

**UX Guideline**

Do:

- Use familiar icons only: back, close, search, more, help.
- Add accessible label for all icon-only buttons.

Don’t:

- Do not use ambiguous custom icon without text in financial flow.
- Do not make icon-only destructive actions too easy to tap accidentally.

---

## 8.6 Button Danger

**Description**  
Destructive or negative action button. The Figma description states it is used for negative/harmful actions so users do not regret the action.

**Specs**

- Use only for delete, remove, cancel irreversible action, or moving away from main action.
- Maximum label: 2 words.
- Can be full-width or hug content.
- Pair with confirmation if action is irreversible.

**UX Guideline**

Do:

- Use in confirmation dialog for delete/remove.
- Explain the impact before user confirms.
- Use error/red semantic color.

Don’t:

- Do not use danger button for harmless actions.
- Do not use danger button as positive primary CTA.
- Do not combine danger and primary brand color in the same button.

---

## 8.7 Button Slider

**Description**  
Gesture-based confirmation button for high-intent action.

**Specs**

- Use when the action requires stronger intent than a normal tap.
- Provide clear instruction label.
- Show progress/drag state and completed state.

**UX Guideline**

Do:

- Use for sensitive confirmation, payment, claim, or irreversible trigger.
- Provide fallback if gesture fails.

Don’t:

- Do not use slider for simple navigation.
- Do not hide fee or impact behind the slider.

---

## 8.8 Link Text

**Description**  
Inline or standalone link action.

**Specs**

- Use brand color for positive/neutral link.
- Use red only for negative link.
- Keep link copy specific: `Lihat Detail`, `Ubah`, `Pelajari`.

**UX Guideline**

Do:

- Use for navigation to details, terms, edit action, or learn more.
- Make link meaning clear without relying on surrounding paragraph.

Don’t:

- Do not use vague copy like `Klik di sini`.
- Do not style normal body text as link if it is not tappable.

---

## 8.9 Tab Button / State Tab Button

**Description**  
Switches between related content categories or states.

**Specs**

- Use 2–4 tabs maximum.
- Active tab uses brand color or stronger text.
- Inactive tab uses medium/subtle text.
- Keep label short: 1–2 words.

**UX Guideline**

Do:

- Use tabs when content is equal-level and frequently switched.
- Keep tab area visually light.

Don’t:

- Do not use tabs to hide mandatory steps.
- Do not use many tabs on small device if labels truncate.

---

## 8.10 Component / Checkbox

**Description**  
Multi-select or agreement control.

**Specs**

- Recommended size: 20–24px visual box with 44–48px tap target.
- Label must be tappable together with box.
- Use selected, unselected, disabled, error states.

**UX Guideline**

Do:

- Use checkbox when multiple items can be selected.
- Use for optional agreement or batch selection.

Don’t:

- Do not use checkbox for choosing one option only; use radio.
- Do not make legal agreement pre-selected.

---

## 8.11 Component / Radio Button

**Description**  
Single-choice selection control.

**Specs**

- Recommended size: 20–24px visual circle with 44–48px tap target.
- Selected state must be obvious.
- Use list row or card selection pattern for larger choices.

**UX Guideline**

Do:

- Use when user can pick only one option.
- Use clear labels and supporting descriptions if options are similar.

Don’t:

- Do not use radio for multi-select.
- Do not hide important fee or consequence only inside the description.

---

## 8.12 Component / Switch

**Description**  
Immediate on/off setting.

**Specs**

- Use for binary state.
- Label must describe the state, not the action.
- Show disabled when the setting cannot be changed.

**UX Guideline**

Do:

- Use for preferences or settings that take effect immediately.
- Keep copy simple: `Aktifkan`, `Otomatis`, `Acak`.

Don’t:

- Do not use switch for one-time confirmation.
- Do not use switch when user must choose between more than two options.

---

## 8.13 Component / Stepper

**Description**  
Numeric increment/decrement control.

**Specs**

- Recommended for small predictable ranges.
- Button size: 32–40px with 44–48px tap target.
- Always show min/max state.
- For range above 20, combine stepper with direct input.

**UX Guideline**

Do:

- Use stepper for small quantity changes such as 1–10.
- Use direct input when range is large, e.g. 1–200.
- Use hybrid stepper + input when most users enter 10–100 but some need small adjustment.

Don’t:

- Do not force users to tap repeatedly until 200.
- Do not allow value below min or above max without clear disabled state.

---

## 8.14 Component / Numpad / Default

**Description**  
Numeric input keypad for PIN, OTP, amount, or number entry.

**Specs**

- Key tap area: minimum 48px.
- Number text: 20–24px for default keypad.
- Provide delete/backspace.
- Keep layout stable while typing.

**UX Guideline**

Do:

- Use for financial amount input and PIN-like flows.
- Show formatted number immediately while typing.

Don’t:

- Do not show keyboard and custom numpad at the same time.
- Do not move CTA unpredictably when numpad appears.

---

## 8.15 Component / Numpad / Input Amount

**Description**  
Amount-entry variant for money-related flows.

**Specs**

- Amount should be the visual anchor.
- Use large number display and smaller currency prefix.
- Format thousand separators in real time.
- CTA disabled when amount is invalid or empty.

**UX Guideline**

Do:

- Show limit, fee, or balance near amount when relevant.
- Keep helper copy short.

Don’t:

- Do not hide invalid state until user taps CTA.
- Do not make secondary options stronger than amount field.

---

## 8.16 Component / Loading

**Description**  
Loading component that can be resized to fit the page needing to be loaded.

**Specs**

- Use skeleton for content loading.
- Use spinner for short process.
- Use full-page loading only for blocking transaction or first-load state.

**UX Guideline**

Do:

- Keep loading under 2 seconds where possible.
- Show progress copy for sensitive transaction states.

Don’t:

- Do not use generic loading for long financial process without explanation.
- Do not block back action if the process can be safely cancelled.

---

## 8.17 Component / Toast

**Description**  
Short transient feedback after an action.

**Specs**

- Auto-dismiss after 2–4 seconds.
- Use one-line message where possible.
- Do not include complex action unless necessary.

**UX Guideline**

Do:

- Use for lightweight success, copied, saved, or non-blocking feedback.
- Keep copy under 60 characters where possible.

Don’t:

- Do not use toast for critical error that requires user decision.
- Do not stack multiple toasts.

---

## 8.18 Component / Snackbar

**Description**  
Feedback message that may include one action.

**Specs**

- Place above bottom navigation or CTA container.
- Use one optional action maximum.
- Keep copy concise.

**UX Guideline**

Do:

- Use when user may need undo, retry, or view details.
- Ensure snackbar does not cover main CTA permanently.

Don’t:

- Do not use snackbar as a replacement for dialog when a decision is needed.
- Do not put long explanations inside snackbar.

---

## 8.19 Component / Tooltip

**Description**  
Contextual explanation for a specific UI element.

**Specs**

- Anchored to a component.
- Short explanatory copy.
- Use only when the UI element is unfamiliar or needs first-time education.

**UX Guideline**

Do:

- Use for first-time feature hint or unclear icon.
- Dismiss after user understands or taps outside.

Don’t:

- Do not use tooltip to explain core flow that should be self-explanatory.
- Do not cover important input fields.

---

## 8.20 Dialog

**Description**  
Decision modal. The library note states dialog should always have a choice with two buttons; otherwise use feedback such as snackbar/toast.

**Specs**

- Use title, optional body, and two actions.
- Primary and secondary action must be clearly different.
- For destructive dialog, use danger action.

**UX Guideline**

Do:

- Use dialog for confirmation, destructive action, irreversible action, or important decision.
- Make consequence clear.

Don’t:

- Do not use dialog for simple success message.
- Do not put more than two major actions.
- Do not use vague CTA like `OK` if action has consequence.

---

## 8.21 Support Component / Card Dialog

**Description**  
Card container for dialog content.

**Specs**

- Radius 12–16px.
- Padding 16–24px depending content density.
- Use clear title and action area.

**UX Guideline**

Do:

- Use for blocking confirmation.
- Keep body copy concise and specific.

Don’t:

- Do not turn every info message into a dialog.

---

## 8.22 Component / Bottomsheet / Content

**Description**  
Bottomsheet content container for secondary task or contextual flow.

**Specs**

- Top radius: 16–24px.
- Header area: appbar or drag handle.
- Body padding: 16px; 12px on dense/small screens.
- Sticky CTA if action is required.

**UX Guideline**

Do:

- Use bottomsheet for contextual selection, settings, filters, or short forms.
- Keep the main screen context visible when useful.

Don’t:

- Do not use bottomsheet for long multi-step task.
- Do not place important content below the fold without scroll cue.

---

## 8.23 Pills

**Description**  
Compact selection or status chip.

**Specs**

- Full radius.
- Height 28–36px.
- Label 12–14px.
- Optional icon 16–20px.

**UX Guideline**

Do:

- Use for quick filters, category, selected state, or small status.
- Keep labels short.

Don’t:

- Do not use pills for long sentences.
- Do not create too many pill colors in one screen.

---

## 8.24 Slider / Box

**Description**  
Input control for selecting value across a range.

**Specs**

- Show min/max where useful.
- Show current value clearly.
- Use for approximate value, not precise money unless paired with input.

**UX Guideline**

Do:

- Use slider when user adjusts preference or range visually.
- Pair with numeric display for clarity.

Don’t:

- Do not use slider for exact transfer amount without direct input.

---

## 8.25 Gesture Item

**Description**  
Support component for gesture-based interaction.

**Specs**

- Must have clear affordance.
- Gesture should have visual feedback.
- Provide accessible alternative action if needed.

**UX Guideline**

Do:

- Use when gesture improves flow speed or delight.

Don’t:

- Do not require gesture for critical action without fallback.

---

## 8.26 Animation

**Description**  
Reusable animation component set.

**Specs**

- Use lightweight animation assets.
- Keep loop subtle unless loading.
- Use success/reward animation sparingly.

**UX Guideline**

Do:

- Use for empty state, success, onboarding, or reward moment.

Don’t:

- Do not use heavy animation on every screen.
- Do not distract from financial confirmation details.

---

## 8.27 DIANA Button

**Description**  
Special button likely related to DIANA assistant or internal AI feature.

**Specs**

- Should follow button icon/text button minimum tap target.
- Use only when assistant/help interaction is available.

**UX Guideline**

Do:

- Use where AI/help can reduce user confusion.

Don’t:

- Do not use if it opens unrelated help content.

---

## 8.28 Right Content

**Description**  
Support component for right-side content in rows/cards.

**Specs**

- Can contain icon, amount, chevron, badge, switch, or action.
- Keep width predictable.
- Align vertically center in list rows.

**UX Guideline**

Do:

- Use to show status or next action.
- Use chevron only when row is navigable.

Don’t:

- Do not put multiple competing elements on the right side.

---

## 8.29 Jumper

**Description**  
Navigation/support component used to jump to another page or section.

**Specs**

- Use clear label and directional icon if navigational.
- Should be visually lighter than main CTA.

**UX Guideline**

Do:

- Use for secondary navigation or shortcut.

Don’t:

- Do not make it compete with primary CTA.

---

# 9. Copywriting Foundation

## 9.1 Copy Principle

DANA copy should be short, polite, and action-oriented. Use Indonesian that feels formal enough for finance, but not stiff.

### Copy Rules

Do:

- Use user benefit first.
- Use one idea per sentence.
- Use specific object names: `saldo`, `rekening`, `eMAS`, `voucher`, `nominal`.
- Use direct CTA: `LANJUT`, `BAYAR`, `KIRIM`, `SIMPAN`, `UBAH`.

Don’t:

- Do not use harsh language for user behavior.
- Do not blame user.
- Do not over-explain system limitations.
- Do not use English if Indonesian is clearer.

## 9.2 Financial Copy Pattern

| Situation | Pattern | Example |
|---|---|---|
| Empty amount | CTA disabled + instruction | `MASUKKAN NOMINAL` |
| Amount valid | CTA enabled + action | `LANJUT` |
| Failed transaction | Cause + next action | `Transfer belum berhasil. Coba lagi.` |
| Pending | Status + reassurance | `Transfer sedang diproses.` |
| Destructive | Impact + confirm | `Data ini akan dihapus.` |

---

# 10. Agentic AI Implementation Rules

Use this section when asking GPT/Codex/Claude to generate DANA-style UI.

## 10.1 Default Screen Contract

```yaml
screen_baseline:
  width: 375
  height: 812
  platform: mobile
  language: Indonesian
  layout:
    page_padding_low_end: 12
    page_padding_default: 16
    card_radius: 8
    card_padding_low_end: 12
    card_padding_default: 16
    card_gap_low_end: 8
    card_gap_default: 12
  color:
    dana_primary: '#108EE9'
    merchant_secondary: '#0F479D'
    page_background: '#F5F5F5'
    card_background: '#FFFFFF'
    strong_text: '#041221'
    subtle_text: '#727272'
  cta:
    disabled_when_invalid: true
    primary_color: '#108EE9'
    label_max_words: 2
```

## 10.2 UI Generation Checklist

Before generating any DANA screen, check:

- Is there one clear primary action?
- Is the main object visually obvious before reading long copy?
- Are cards grouped by meaning?
- Is blue used around 30%, not everywhere?
- Are spacing and padding responsive for low-end device?
- Is CTA visible without excessive scrolling?
- Are errors shown before user gets stuck?
- Are destructive actions confirmed?

---

# 11. Component Usage Matrix

| User Need | Use Component | Avoid |
|---|---|---|
| Navigate page | Appbar | Custom header without safe area |
| Main action | Primary Button / Button Group | Multiple primary CTAs |
| Secondary action | Button Text / Link Text | Ghost CTA that looks disabled |
| Choose one | Radio Button | Checkbox |
| Choose many | Checkbox | Radio Button |
| Toggle setting | Switch | Checkbox or button |
| Input money | Numpad Input Amount | Native keyboard + custom keypad together |
| Select quantity 1–10 | Stepper | Text input only |
| Select quantity 1–200 | Input + optional stepper | Stepper-only |
| Show temporary success | Toast | Dialog |
| Show retry/undo | Snackbar | Toast with hidden action |
| Confirm destructive | Dialog + Button Danger | Snackbar/toast |
| Show contextual choice | Bottomsheet | Full page if task is short |
| Explain unfamiliar UI | Tooltip | Long paragraph |

---

# 12. Final Design Language Summary

DANA Design System should produce UI that feels:

- **Clean:** enough whitespace, short copy, obvious hierarchy.
- **Compact:** optimized for Indonesian mobile users and small screens.
- **Trustworthy:** clear fees, status, confirmation, and error recovery.
- **Brand-consistent:** DANA blue used intentionally, not excessively.
- **Readable:** strong text for main content, medium/subtle text for support.
- **Actionable:** every page guides users to the next step with minimal thinking.

When unsure, choose the pattern that reduces user confusion and prevents financial mistakes.

---

## 18. Figma Dev Inspection Update — Selection, List, Overlay, Text Field, Feedback Components

> Source update requested from Figma Dev Mode nodes:
> - Checkbox: `350:6584`
> - Divider: `3339:94`
> - List / Single Action: `10566:751`
> - List Support Components: `19534:3954`
> - List Swipe Gesture: `19534:4010`
> - List Hold Gesture: `19534:4064`
> - List UX Guideline: `19534:4105`
> - Radio Button: `350:711`
> - Overlay Specs & Animation: `16864:10746`
> - Overlay UX Guideline: `16864:10751`
> - Switch: `10642:2369`
> - Text Field: `15511:20840`
> - Snackbar: `14889:9041`
> - Toast: `14889:9034`
> - Node `828:9984` could not be inspected by tool because the Figma API call was blocked. Keep the Figma node link as source of truth for manual inspection.

### 18.1 Checkbox — `Component / Checkbox`

| Property | Value |
|---|---|
| Component size | `24 × 24` |
| Variants | `Selected`, `Partially`, `Condition` |
| Selected options | `YES`, `NO` |
| Partially options | `YES`, `NO` |
| Condition options | `Enable`, `Disabled` |
| Compose component | `FiatCheckBox` |
| Model | `FiatCheckboxModel` |
| Selection state | `ToggleableState.Off`, `ToggleableState.On`, `ToggleableState.Indeterminate` |
| Disabled handling | `isEnabled = false` |

**Available variants**

| Variant | Size | Usage |
|---|---:|---|
| `Selected=NO, Partially=NO, Condition=Enable` | `24 × 24` | Default unchecked active state |
| `Selected=NO, Partially=NO, Condition=Disabled` | `24 × 24` | Unchecked disabled state |
| `Selected=YES, Partially=NO, Condition=Enable` | `24 × 24` | Checked active state |
| `Selected=YES, Partially=NO, Condition=Disabled` | `24 × 24` | Checked disabled state |
| `Selected=YES, Partially=YES, Condition=Enable` | `24 × 24` | Indeterminate active state |
| `Selected=YES, Partially=YES, Condition=Disabled` | `24 × 24` | Indeterminate disabled state |

**UX guideline**

Do:
- Use checkbox for multi-select, terms agreement, and optional user choices.
- Use `Partially=YES` only when parent selection contains mixed child states.
- Keep disabled color visibly inactive but still readable.

Don't:
- Do not use checkbox for single-choice decision; use radio button.
- Do not make disabled checkbox look like active blue.
- Do not resize below `24 × 24`.

---

### 18.2 Radio Button — `Component / Radio Button`

| Property | Value |
|---|---|
| Component size | `24 × 24` |
| Variants | `Selected`, `Condition` |
| Selected options | `YES`, `NO` |
| Condition options | `Enable`, `Disabled` |
| Default selected color | `Blue 50 / #108EE9` |
| Compose component | `FiatRadioButton` |

**Available variants**

| Variant | Size | Usage |
|---|---:|---|
| `Selected=NO, Condition=Enable` | `24 × 24` | Active unselected state |
| `Selected=NO, Condition=Disabled` | `24 × 24` | Disabled unselected state |
| `Selected=YES, Condition=Enable` | `24 × 24` | Active selected state |
| `Selected=YES, Condition=Disabled` | `24 × 24` | Disabled selected state |

**UX guideline**

Do:
- Use radio button when user can select only one option in a group.
- Use `Blue 50` as the default active color.
- Keep radio groups vertically aligned with enough breathing space between options.

Don't:
- Do not change active selected radio to gray because it looks disabled.
- Do not use radio button for multi-select.
- Do not mix radio and checkbox in the same option group unless the interaction model is clearly different.

---

### 18.3 Switch — `Component / Switch`

| Property | Value |
|---|---|
| Component size | `56 × 32` |
| Variants | `Active=YES`, `Active=NO` |
| Compose component | `FiatSwitch` |
| On state | `checked = true` |
| Off state | `checked = false` |

**UX guideline**

Do:
- Use switch for immediate on/off settings.
- Use switch when the effect is binary and easy to reverse.
- Place switch as trailing content in a list item or settings row.

Don't:
- Do not use switch for navigation.
- Do not use switch when action needs confirmation, payment, or irreversible change.
- Do not use switch for option groups; use radio or checkbox.

---

### 18.4 Divider — `Divider`

| Property | Value |
|---|---|
| Thickness | `1px` |
| Orientation | `Horizontal`, `Vertical` |
| Type | `Full`, `Inset` |
| Stroke token | `Outline/Base/Primary` |
| Stroke value | `#EBEBEB` |
| Compose component | `FiatDivider` |

**Available variants**

| Variant | Example size | Usage |
|---|---:|---|
| `Type=Full, Orientation=Horizontal` | `47.5 × 1` | Separates full-width sections |
| `Type=Inset, Orientation=Horizontal` | `47.5 × 1` | Separates list content while respecting content indentation |
| `Type=Full, Orientation=Vertical` | `1 × 16.5` | Separates inline compact items |
| `Type=Inset, Orientation=Vertical` | `1 × 16.5` | Separates inline items inside padded content |

**UX guideline**

Do:
- Use divider only when spacing alone cannot separate content clearly.
- Prefer subtle divider color `Outline/Base/Primary`.
- Use inset divider for list rows with leading icon/avatar.

Don't:
- Do not overuse divider between every content block; DANA FIAT prefers clean card grouping.
- Do not use dark divider on light surfaces.
- Do not use divider as decoration.

---

### 18.5 List Item — `List / Single Action`

| Property | Value |
|---|---|
| Component size | `375 × 64` |
| Structure | Leading Content + Main Content + Trailing Content |
| Compose component | `FiatListItem` |
| Gesture support | Leading and trailing swipe gesture |
| Main title style | `2. Title/Small - 16` |
| Main title font | `Open Sans SemiBold 16` |
| Body style | `3. Body/iOS/Large - 16` |
| Brand token used | `Main/Blue 50 = #108EE9` |
| White token used | `other/white = #FFFFFF` |

**Structure**

| Area | Purpose | Examples |
|---|---|---|
| Leading Content | Gives object identity | Avatar, bank logo, product icon, DANA icon |
| Main Content | Primary information | Title, name, label, masked number, secondary text |
| Trailing Content | Action or status | Badge, value, arrow, switch, button, stepper |

**List support component specs**

| Support component | Size / model |
|---|---|
| Leading item `Icon Logo` | `40 × 40` |
| Leading item `Image` | `40 × 40` |
| Main item `No Support Text` | `76 × 24` |
| Main item `Bottom` | `76 × 44` |
| Main item `Top` | `76 × 44` |
| Trailing item `Navigation Icon` | `85 × 48` |
| Trailing item `Select Icon` | `77 × 48` |
| Trailing item `Action Icon` | `77 × 48` |
| Trailing item `Button` | `72 × 48` |
| Trailing item `Switch` | `57 × 48` |
| Trailing item `Stepper` | `122 × 48` |
| Trailing multiple item `Split Button Icon` | `108 × 48` |
| Trailing multiple item `Action Icon` | `68 × 48` |

**UX guideline**

Do:
- Keep list row height at `64px` for standard financial list rows.
- Use leading content to improve scanning: avatar/logo/icon before text.
- Keep trailing behavior consistent inside one list group.
- For grouped listing, use section label + rows inside a card or clean surface.

Don't:
- Do not mix single trailing action and multiple trailing actions in the same group.
- Do not put too many colored backgrounds inside list rows.
- Do not overload one row with too much text, badges, and actions.
- Do not create list rows taller than needed unless there is a specific content hierarchy reason.

---

### 18.6 List Gesture — Swipe

| Property | Value |
|---|---|
| Component | `List / Swipe Gesture` |
| Screen width | `375` |
| Row height | `64` |
| States | `Normal`, `Leading`, `Trailing` |
| Duration | `240ms` |
| Easing | `Cubic Bezier(0.2, 0.58, 0.4, 1)` |
| Start state | `Normal` |
| End state | `Swipe Item` |

**UX guideline**

Do:
- Use swipe gesture for hidden secondary actions like delete, archive, pin, edit, or shortcut.
- Keep swipe action count limited and predictable.
- Allow both leading and trailing only when both directions have clear distinct meanings.

Don't:
- Do not hide primary actions behind swipe.
- Do not use swipe action if users must discover it to complete the task.
- Do not mix swipe-enabled and non-swipe list rows in the same group without visual consistency.

---

### 18.7 List Gesture — Hold / Reorder

| Property | Value |
|---|---|
| Component | `List / Hold Gesture` |
| Screen width | `375` |
| Row height | `64` |
| States | `Normal`, `Hold` |
| Duration | `120ms` |
| Easing | `Cubic Bezier(0.2, 0.58, 0.4, 1)` |
| Pressed color transition | `Dark16 → Dark8` |
| Hold shadow | `Ink90 #041221 / 16%` |
| Shadow Y | `12` |
| Shadow blur | `32` |

**UX guideline**

Do:
- Use hold gesture for reorder/sort interaction only.
- Add visible pressed highlight before dragging.
- Use high shadow only while item is lifted/dragged.

Don't:
- Do not use long-press for hidden critical action.
- Do not trigger destructive action on hold.
- Do not apply high shadow to static list rows.

---

### 18.8 Overlay — Specs, Animation, and Focus Models

| Property | Value |
|---|---|
| Canvas size | `375 × 812` |
| Models | `High Focus`, `Low Focus`, `No Focus` |
| Animation duration | `240ms` |
| Easing | `Cubic Bezier(0.2, 0.58, 0.4, 1)` |
| Start opacity | `0` |
| End opacity | `1` |

**Overlay focus language**

| Model | Suitable for | Purpose |
|---|---|---|
| `High Focus` | Coachmark | User must pay attention to highlighted target |
| `Low Focus` | Bottomsheet | User can still perceive the page behind while acting on sheet |
| `No Focus` | Dialog | User sees context behind clearer, dialog becomes main decision surface |

**UX guideline**

Do:
- Use high focus overlay for coachmark or guided education.
- Use low focus overlay for bottomsheet.
- Use no focus overlay for dialog.
- Keep overlay color consistent with DANA FIAT tokens.

Don't:
- Do not change overlay into light/white overlay.
- Do not use strong overlay for every modal because it increases visual fatigue.
- Do not use overlay for simple inline feedback; use toast/snackbar instead.

---

### 18.9 Text Field — `Text Field`

| Property | Value |
|---|---|
| Component width | `284` |
| Size variants | `Normal`, `Large` |
| State variants | `Default`, `Active`, `Typing`, `Filled`, `Error`, `Disabled` |
| Title Context variants | `YES`, `NO` |
| Compose component | `FiatTextField` |
| Normal without title context height | `62` |
| Large without title context height | `78` |
| Normal with title context height | `80` |
| Large with title context default/active/typing height | `106` |
| Large with title context filled/error height | `178` |
| Large with title context disabled height | `156` |
| Border token | `Usage/Border • Grey 20` |
| Border value | `#E3E3E3` |
| Active cursor/token | `Blue 50 / #108EE9` |
| iOS body large | `SF Pro Regular 16` |
| Android body medium | `Roboto Regular 14` |
| Android/iOS body small | `12` |
| Counter availability | Large version only |

**State behavior**

| State | Meaning |
|---|---|
| `Default` | Empty inactive field |
| `Active` | Focused field, no typed value yet |
| `Typing` | Focused field with cursor and typed value |
| `Filled` | Field contains saved/inputted value |
| `Error` | Validation failed, red border/helper copy |
| `Disabled` | Field cannot be edited |

**UX guideline**

Do:
- Use `Normal` for single-line forms like name, phone, nominal text alternatives, and short input.
- Use `Large` for multi-line notes, address, description, or any field that needs character counter.
- Use title context when the label must remain visible after typing.
- Use helper text only when it helps completion or explains error.
- Use error state with direct recovery instruction.

Don't:
- Do not use placeholder as the only label for high-stakes financial input.
- Do not show counter on normal field.
- Do not use disabled state to represent loading.
- Do not use long error copy; keep it short and actionable.

---

### 18.10 Snackbar — `Component / Snackbar`

| Property | Value |
|---|---|
| Canvas size | `375 × 812` |
| Types | `Button`, `Icon` |
| Text style | `3. Body/iOS/Medium - 14` |
| Effect | `Elevation/Low/Dark` |
| Shadow | `0, 4, 12, 0` |
| Shadow color | `Shadow/Low/Dark` |
| Compose host | `SnackbarHost` |
| State | `rememberSnackbarState()` |

**UX guideline**

Do:
- Use snackbar for temporary feedback that may include an action.
- Use `Type=Button` when the user can undo, retry, or open detail.
- Use `Type=Icon` when the feedback needs a supporting status icon.
- Place snackbar at screen root, not inside scroll content.

Don't:
- Do not use snackbar for blocking decisions; use dialog or bottomsheet.
- Do not stack multiple snackbars.
- Do not make snackbar copy too long.

---

### 18.11 Toast — `Component / Toast`

| Property | Value |
|---|---|
| Canvas size | `375 × 812` |
| Types | `Success`, `Custom` |
| Text style | `3. Body/iOS/Medium - 14` |
| Effect | `Elevation/Low/Dark` |
| Shadow | `0, 4, 12, 0` |
| Shadow color | `Shadow/Low/Dark` |
| Compose host | `ToastHost` |
| State | `rememberToastState()` |
| Type mapping | `ToastType.Success`, `ToastType.Custom` |

**UX guideline**

Do:
- Use toast for lightweight confirmation or short feedback.
- Use `Success` for completed action.
- Use `Custom` when icon/status needs to match a specific context.
- Keep toast message short, ideally one line.

Don't:
- Do not use toast for errors that need user action.
- Do not use toast for payment confirmation detail.
- Do not use toast as replacement for screen-level success state.

---

### 18.12 Agent Rendering Contract for These Components

When an AI agent generates UI using FIAT 2.5:

1. Use the exact component name and variant naming from this section.
2. Keep selection controls at `24 × 24`.
3. Keep switch at `56 × 32`.
4. Keep standard list row at `64px` height.
5. Use list structure: leading identity, main information, trailing status/action.
6. Use overlay model based on purpose:
   - Coachmark = `High Focus`
   - Bottomsheet = `Low Focus`
   - Dialog = `No Focus`
7. Use text field state explicitly: default, active, typing, filled, error, disabled.
8. Use toast/snackbar only for temporary feedback, not as primary page state.
9. Do not invent new generic fintech components when a FIAT component exists.

## Layout Governance for AI

This section exists because AI often generates visually correct screens that fail design review due to spacing inconsistency, weak hierarchy, duplicated semantics, and non-grid aligned composition.

The rules below override generic UI generation behavior.

---

### Grid System (Highest Priority)

AI must always construct layouts using the FIAT mobile grid.

Baseline:

screen_width: 375px

columns: 4

side_margin: 16px

gutter: 12px

Column calculation:

(375 - 16 - 16 - (12 × 3)) ÷ 4

= 76.75px

Result:

column_width: 76.75px

gutter: 12px

side_margin: 16px

---

Hard Rules

Always:

- Left page padding = 16px
- Right page padding = 16px
- Card-to-card gap = 12px
- Section-to-section gap = 24px
- Content gap inside card = 12px

Never:

- 13px
- 14px
- 15px
- 17px
- 18px

Spacing must follow appearance tokens.

---

Card Alignment Rule

All cards must align to the same grid columns.

Good:

Card A
Card B
Card C

All start at X=16.

Bad:

Card A

     Card B

Card C

Cards must never drift horizontally unless the layout pattern explicitly requires it.

---

Responsive Rule

For 360–390px mobile widths:

Maintain:

- 16px side margin
- 12px gutter
- 4-column grid

Scale component width, not spacing tokens.
## Semantic Hierarchy Governance

AI frequently creates duplicated meaning across navigation, sections, and content.

This is prohibited.

---

Rule:

One layer = One meaning.

Navigation ≠ Content

Tabs ≠ Section Titles

Section Titles ≠ CTA

---

Bad Example

Tab:
Minta ke Teman

Card:
Minta ke Teman

This creates semantic duplication.

---

Good Example

Tab:
Teman

Card:
Pilih Teman

or

Tab:
Permintaan

Card:
Permintaan Aktif

---

Duplication Detection

Before generating final UI:

Compare:

- Appbar Title
- Tab Labels
- Section Titles
- Card Titles
- CTA Labels

If adjacent layers repeat the same wording:

Regenerate.

---

Meaning Ladder

Appbar:
Where am I?

Tab:
Which category?

Section:
What content exists?

Card:
What object is shown?

CTA:
What action happens?

Each layer must answer a different question.

## Copy Compression Rule

FIAT screens must be understood in under 3 seconds.

The interface should communicate through hierarchy and grouping before requiring reading.

---

Preferred Style

Short

Direct

Actionable

Financial-safe

---

Examples

Bad:

"Scan atau bagikan QR untuk menerima uang dari siapa pun"

Good:

"Terima uang via QR"

---

Bad:

"Pilih teman di DANA untuk meminta uang"

Good:

"Pilih teman"

---

Maximum Copy Length

Appbar:
1–2 words

Section Title:
1–3 words

Card Title:
1–4 words

Description:
1 sentence

CTA:
1–2 words

---

Do Not

- Explain obvious actions
- Repeat information
- Use marketing language inside transactional flows
- Add helper text when the UI is already self-explanatory

## Typography Simplification Rule

FIAT prioritizes clarity over typography variety.

Use fewer styles.

Do not create visual hierarchy by introducing many font sizes.

Create hierarchy through:

- spacing
- grouping
- contrast
- weight

before introducing another text style.

---

Recommended Usage

Title Large
24 / 32
SemiBold

Title Small
16 / 24
SemiBold

Body
14 / 20
Regular

Caption
12 / 18
Regular

---

Avoid

- excessive typography scales
- multiple caption variants
- decorative weight changes
- typography-heavy hierarchy

Target:

Clean

Compact

Financial

Fast to scan

## AI Design Review Gate

Before accepting any generated screen:

### Grid Check

Verify:

- left padding = 16
- right padding = 16
- card gap = 12
- components align to 4-column grid

If false:

Regenerate

---

### Semantic Check

Verify:

- tab label ≠ card title
- tab label ≠ section title
- section title ≠ CTA
- card title ≠ CTA

If false:

Regenerate

---

### Density Check

Ask:

Can a first-time user understand this page in 3 seconds?

If no:

- reduce copy
- reduce sections
- simplify hierarchy

---

### FIAT Review Score

Grid Compliance: 25

Semantic Hierarchy: 25

Copy Clarity: 20

Visual Hierarchy: 20

Design System Compliance: 10

Minimum Passing Score:

90 / 100

If below 90:

Revise before presenting output.