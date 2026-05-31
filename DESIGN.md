---
name: Y
description: Decision-history cards that read like a sourced brief, rendered inside ChatGPT and Claude.
colors:
  signal-magenta: "#e90060"
  signal-magenta-hover: "#c70054"
  ink: "#121e1e"
  secondary-ink: "#3a4848"
  tertiary-ink: "#536262"
  paper: "#ffffff"
  surface-subtle: "#f8fafa"
  surface-muted: "#f1f5f5"
  border: "#acb8b8"
  border-subtle: "#e3eaea"
  focus-ring: "#f22b79"
  inverted: "#071718"
  inverted-ink: "#ffffff"
  dark-paper: "#071718"
  dark-surface: "#0c1c1c"
  dark-ink: "#ffffff"
  dark-secondary-ink: "#90a4a4"
  dark-border: "#213535"
typography:
  display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: "32px"
    letterSpacing: "0px"
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: "20px"
    letterSpacing: "0px"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "24px"
    letterSpacing: "0px"
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "18px"
    letterSpacing: "0px"
rounded:
  xs: "4px"
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "12px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
components:
  surface:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "0px"
    padding: "16px"
  tag:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.secondary-ink}"
    rounded: "{rounded.sm}"
    padding: "2px 9px"
  source-pill:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.secondary-ink}"
    rounded: "{rounded.pill}"
    height: "28px"
    padding: "0 12px"
  accent-dot:
    backgroundColor: "{colors.signal-magenta}"
    rounded: "{rounded.pill}"
    size: "6px"
  tooltip:
    backgroundColor: "{colors.inverted}"
    textColor: "{colors.inverted-ink}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
---

# Design System: Y

## 1. Overview

**Creative North Star: "The Citation"**

Y is a decision-history card that reads like a sourced brief. Every claim it makes is footnoted; the design's whole job is to make the evidence legible and then get out of the way. The card narrates a settled "why" — what was considered, why one option won, what it relates to — and hangs a source link under each claim the way a paper hangs a citation under a sentence. The aesthetic is the evidence itself: crisp type, a hairline border, generous whitespace between sourced statements. When the design is working, you notice the argument and the sources, not the chrome.

Y does not own its canvas. It renders inside ChatGPT and Claude, so it inherits each host's theme, type rendering, and density, and it never competes with the surrounding conversation. Its identity is a *balanced signature*: one accent color used on exactly one element, a fixed reading rhythm (title → considered → why this won → related), and a consistent citation pattern. The signature lives in structure, not decoration.

The card is deliberately minimal: it holds only the decision's title, its date and owner, the alternatives considered, the two or three winning arguments with their source links, and the related-decision chips. Nothing else — no filing metadata, no status chrome. If plain text wouldn't meaningfully degrade a piece of it, it doesn't belong on the card.

This system explicitly rejects the cluttered SaaS dashboard (no KPI tiles, no multi-panel admin chrome), heavy branded chrome (no logos, no gradients, no marketing flourish that fights the host), anything playful or gamified (no mascots, badges, confetti, emoji tone), and the generic AI-app card (no gradient-accent, glassy, over-rounded "template" look). It is a system of record, not a feature tour.

**Key Characteristics:**
- One focused card, never a panel grid.
- One accent (Signal Magenta) on one element; everything else is teal-tinted neutral.
- A single typeface (Inter) doing all the work through weight and scale.
- Flat by default: a hairline border and crisp corners carry the surface, not shadow.
- Theme-adaptive: legible and on-rhythm in both the host's light and dark modes.

## 2. Colors

A teal-tinted neutral foundation with a single vivid magenta accent. The neutrals are never pure gray — every "gray" carries a slight teal cast, which is what keeps the surface from reading as a generic admin tool.

### Primary
- **Signal Magenta** (`#e90060`, hover `#c70054`): The one signature mark. Reserved for the winning-argument bullet — the single place the eye is told "this is why." Inherited from the Alpic brand. Its scarcity is the entire point; spreading it across links, borders, or headings destroys the signal.

### Neutral
- **Ink** (`#121e1e` light / `#ffffff` dark): Primary text — titles, claims. A near-black with a deep teal cast, not true black.
- **Secondary Ink** (`#3a4848` light / `#90a4a4` dark): Section labels, tag text, secondary metadata.
- **Tertiary Ink** (`#536262` / `#698080`): The quietest text — metadata, the date·owner line.
- **Paper** (`#ffffff` light / `#071718` dark): The card surface. Dark mode is a near-black teal, not gray.
- **Surface Subtle** (`#f8fafa` / `#0c1c1c`) and **Surface Muted** (`#f1f5f5` / `#0c1c1c`): Recessed fills for skeletons and nested chips.
- **Border** (`#acb8b8` light / `#213535` dark): The hairline that defines the card and every tag. The primary structural device.
- **Border Subtle** (`#e3eaea` / `#162828`): Dividers and the quietest separations.
- **Inverted** (`#071718`, text `#ffffff`): Tooltip surface — a dark pill that floats above the light card to surface a source excerpt.
- **Focus Ring** (`#f22b79`): A pink-magenta ring on keyboard focus, in both modes.

### Named Rules
**The One Mark Rule.** Signal Magenta appears on at most one element per card — the winning-argument bullet. It is never used for links, borders, backgrounds, section headings, or hover states. If a second magenta element appears, one of them is wrong.

**The Teal-Neutral Rule.** Neutrals carry a teal cast, never a warm one. Do not introduce warm grays, creams, or paper-beige tints; they read as a different product. The "gray" of this system is always a desaturated teal.

## 3. Typography

**Display Font:** Inter (with system-ui, sans-serif fallback)
**Body Font:** Inter (same family)
**Label Font:** Inter (same family)

**Character:** One typeface, full stop. Inter carries the entire hierarchy through weight (400/500/600) and scale, not through pairing. This is deliberate: a decision record earns its calm from restraint, and a second typeface would read as decoration. There is no serif and no distinct mono face; where a monospaced treatment is ever needed (e.g. an identifier inside prose), it's Inter via a tabular utility, not a separate family.

### Hierarchy
- **Display** (600, 24px / 32px line, tracking 0): The decision title. The largest type on the card and its single focal point. (`type-display-xs`)
- **Title** (600, 14px / 20px): Section labels — "Considered", "Why this won", "Related". Bold but small; they organize, they don't shout. (`type-text-sm` semibold)
- **Body** (400, 14px / ~24px line): Argument claims — the sentences that get read. Comfortable leading. (`type-text-sm`, `leading-6` on claims)
- **Label** (400, 12px / 18px): Metadata — the date·owner line, the quietest tier. (`type-text-xs`)

### Named Rules
**The Weight-Not-Family Rule.** Hierarchy comes from weight and scale within Inter, never from a second typeface. If something needs more emphasis, go heavier or larger; do not reach for a serif or a display face.

**The No-Shout Rule.** The card title tops out at 24px. Display sizes above that (the theme's 30–72px steps) belong to host marketing surfaces, never to a Decision Card living inline in chat.

## 4. Elevation

Flat by default. The card is defined by a single hairline border (`1px solid` Border) and crisp corners — not by a shadow. Depth in this system is communicated by hierarchy and whitespace, not by lifting surfaces. The ambient shadow token (`#0000001a` light, `#ffffff1a` dark) is whisper-quiet and applies at most a 1px `shadow-xs` to the outer card.

The one true elevation is the **tooltip**: a dark inverted pill that floats above the card to reveal a source excerpt on hover. It is the only element allowed a real shadow (`shadow-lg` in light mode; a hairline `drop-shadow` outline in dark, where a soft shadow would disappear).

### Shadow Vocabulary
- **Ambient hairline** (`box-shadow` driven by `--color-shadow`, ~`0 1px 2px`): The card's only resting shadow. Barely perceptible; it grounds the surface without lifting it.
- **Tooltip lift** (`shadow-lg` light / `drop-shadow(0 0 0.5px border)` dark): Reserved exclusively for the source-excerpt tooltip.

### Named Rules
**The Flat-Record Rule.** Surfaces are flat at rest. The only element that lifts is the tooltip, and only because it is genuinely floating above the content. No drop shadows on cards, tags, pills, or sections.

## 5. Components

### Surface (the Decision Card frame)
- **Corner Style:** Square (`0px`) — crisp, document-like corners. This is a deliberate departure from the library's rounded-xl `Card`; the record reads as a page, not a chip.
- **Background:** Paper (`#ffffff` / `#071718`).
- **Border:** 1px solid Border.
- **Shadow Strategy:** Ambient hairline only (see Elevation).
- **Internal Padding:** 16px (20px at `sm` and up). Sections separated by 16px vertical rhythm; items within a section by 8px.
- **Width:** Capped at `max-w-2xl` and centered — narrow enough to keep claim lines in a readable measure.

### Tags
- **Style:** 1px Border, Paper background, Secondary Ink text, `6px` radius (`rounded-sm`), 12–14px type, medium weight. Square-ish, crisp.
- **Use:** Each losing alternative under "Considered." Tags are *not* used for filing metadata — no source-system label, no decision-id pill on the card.
- **State:** Static, non-interactive. Tags carry facts, not actions.

### Source Pills (interactive citations)
- **Shape:** Fully rounded (`pill`, `9999px`), 28px tall — visually distinct from the square tags so "this is clickable" reads instantly.
- **Style:** Secondary button — Paper background, 1px Border, Secondary Ink text, a leading source-kind icon and a trailing external-link glyph.
- **Hover / Focus:** Background shifts to Background-Hover, text to a darker ink; `2px` Focus Ring with a 2px offset on keyboard focus.
- **No-URL variant:** Email and URL-less sources render as a non-interactive Tag instead of a pill — provenance without a false affordance.

### Related Chips
- **Style:** Same secondary pill as Source Pills, with a question-mark icon, signaling "ask about this next." Clicking sends a follow-up turn to the model.

### The Accent Dot (signature component)
- A `6px` Signal Magenta dot leading each winning argument. This is the card's entire use of brand color and its single most recognizable mark. See **The One Mark Rule.**

### Tooltip
- **Style:** Inverted dark pill, `8px` radius, `8px 12px` padding, 12px semibold text, balanced/centered, with a rotated-square arrow. Fades and zooms in (95%→100%).
- **Use:** Source excerpts, on hover, only where the device supports hover and an excerpt exists.

### Skeleton (loading)
- Surface-Muted blocks with a `motion-safe` pulse, laid out to match the real card's rhythm (title, tag row, argument lines) so the load state previews the result instead of a generic spinner.

## 6. Do's and Don'ts

### Do:
- **Do** keep the card to its essential fields: title, date, owner, losing alternatives, 2–3 winning arguments with links, related chips. If plain text wouldn't meaningfully degrade a piece, it isn't a widget.
- **Do** keep Signal Magenta on exactly one element per card (the winning-argument dot). Its rarity is the signal.
- **Do** keep the surface flat with a 1px hairline border and square corners; let hierarchy and whitespace carry depth.
- **Do** carry the full hierarchy with Inter weights and scale (400/500/600), not a second typeface.
- **Do** keep neutrals teal-tinted; the "gray" here is always a desaturated teal.
- **Do** distinguish facts from actions by shape: square tags for provenance, fully-rounded pills for clickable citations.
- **Do** adapt to the host's light and dark theme; verify text stays legible against both Paper values.
- **Do** preview the result shape in the loading skeleton, never a bare spinner.

### Don't:
- **Don't** add filing metadata to the card — source-system tags, decision-id pills, reviewer lists, status badges. The card carries the decision, not its provenance chrome.
- **Don't** build a cluttered SaaS dashboard: no KPI tiles, no multi-panel admin chrome. One card.
- **Don't** add heavy branded chrome: no logos, no gradients, no marketing flourish that fights the host.
- **Don't** go playful or gamified: no mascots, badges, confetti, or emoji-driven tone.
- **Don't** ship the generic AI-app card: no gradient-accent, glassy, or over-rounded "template" look.
- **Don't** use a `border-left`/`border-right` greater than 1px as a colored accent stripe on any card, section, or callout.
- **Don't** use gradient text (`background-clip: text` over a gradient) anywhere; emphasis is weight or size, in one solid color.
- **Don't** use glassmorphism (decorative blur/backdrop-filter) as a surface treatment.
- **Don't** spread the magenta to links, headings, borders, or hover states. If you see two magenta things, one is a bug.
- **Don't** exceed a 24px title; the card lives inline in chat, not on a landing page.
