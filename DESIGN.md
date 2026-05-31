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
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    border: "none"
    edgeFade: "mask-image linear-gradient, ~36px at scrollable edges"
  tag:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.secondary-ink}"
    rounded: "{rounded.sm}"
    padding: "2px 9px"
  source-citation:
    tileBackground: "color-mix(foreground 6%)"
    tileSize: "32px"
    tileRounded: "7px"
    kindLabelColor: "{colors.secondary-ink}"
    identifierColor: "{colors.ink}"
  related-chip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.secondary-ink}"
    rounded: "{rounded.pill}"
  argument-thread:
    nodeColor: "{colors.signal-magenta}"
    nodeSize: "8px"
    railColor: "color-mix(foreground 20%)"
    railWidth: "1px"
  tooltip:
    backgroundColor: "{colors.inverted}"
    textColor: "{colors.inverted-ink}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
---

# Design System: Y

## 1. Overview

**Creative North Star: "The Citation"**

Y is a decision-history card that reads like a sourced brief. Every claim it makes is footnoted; the design's whole job is to make the evidence legible and then get out of the way. The card narrates a settled "why" — what was considered, why one option won, what it relates to — and hangs a typed citation under each claim the way a paper hangs a citation under a sentence. The aesthetic is the evidence itself: crisp type, generous whitespace between sourced statements, and no frame at all — the content sits directly on the host canvas. When the design is working, you notice the argument and the sources, not the chrome.

Y does not own its canvas. It renders inside ChatGPT and Claude, so it inherits each host's theme, type rendering, and density, and it never competes with the surrounding conversation. Its identity is a *balanced signature*: one accent color used on exactly one element, a fixed reading rhythm (title → considered → why this won → related), and a consistent citation pattern. The signature lives in structure, not decoration.

The card is deliberately minimal: it holds only the decision's title, its date and owner, the alternatives considered, the two or three winning arguments with their source links, and the related-decision chips. Nothing else — no filing metadata, no status chrome. If plain text wouldn't meaningfully degrade a piece of it, it doesn't belong on the card.

This system explicitly rejects the cluttered SaaS dashboard (no KPI tiles, no multi-panel admin chrome), heavy branded chrome (no logos, no gradients, no marketing flourish that fights the host), anything playful or gamified (no mascots, badges, confetti, emoji tone), and the generic AI-app card (no gradient-accent, glassy, over-rounded "template" look). It is a system of record, not a feature tour.

**Key Characteristics:**
- One focused card, never a panel grid.
- One accent (Signal Magenta) on one element; everything else is teal-tinted neutral.
- A single typeface (Inter) doing all the work through weight and scale.
- Frameless by default: no border, fill, or shadow; content floats on the host canvas and an edge fade carries the boundary.
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

No frame at all. The card has no border, no fill, and no shadow: its content sits directly on the host canvas (the iframe body is transparent), so the type, citations, and thread read as part of the conversation rather than as a transplanted, bordered box. The earlier bordered-card-with-shadow treatment double-framed the widget — a card inside a box inside the chat — which is exactly the "embedded legacy widget" look this retires. Depth comes from hierarchy, whitespace, and the edge fade, never from a stroke or a stacked surface.

When the content is taller than the host's `maxHeight`, the scroll container fades at the live edges via a `mask-image` gradient: a bottom fade whenever there is more below, a top fade once scrolled. The fade signals "this is a viewport into more," not a sealed object slamming into a hard floor. When everything fits, both fades collapse to zero and nothing is masked.

The inline card is a focused summary, not the whole app: a quiet expand control (top-right) requests `fullscreen` via `useDisplayMode()` for the reader who wants room, and requests `inline` to collapse back.

Nothing lifts above the conversation. The source layer is rendered **in place** — it replaces the card's content within the same area (see Source Viewer), so there is no floating panel and no modal over the chat.

### Surface Vocabulary
- **Edge fade** (`mask-image` linear gradient, ~36px, applied only at a scrollable edge): the sole framing device. Replaces the old border + shadow.
- **Recessed tints** (`bg-foreground/[0.06]` for citation stamp tiles; `bg-muted` inside the source layer): theme-adaptive recession to mark evidence and decisive blocks — recession, not elevation.

### Named Rules
**The Dissolved-Frame Rule.** The card never draws its own border, fill, or shadow against the host. Separation is carried by hierarchy, whitespace, and the edge fade. If you reach for a 1px outer border or a card background to "contain" it, you are rebuilding the box this system removed.

## 5. Components

### Surface (the dissolved frame)
- **Background:** None. The iframe body is transparent (`html, body { background-color: transparent }`) so the host canvas shows through. No Paper fill, no card.
- **Border / Shadow:** None. See **The Dissolved-Frame Rule** (Elevation).
- **Edge fade:** A `mask-image` linear gradient on the scroll container, ~36px, applied at an edge only while it is scrollable (top once scrolled, bottom while more remains). This is the only framing device.
- **Expand control:** A `tertiary` `icon` button, top-right, toggling `fullscreen` / `inline` via `useDisplayMode()`. The card header reserves right padding (`pr-9`) so a long title never runs under it.
- **Width:** Capped at `max-w-2xl` and centered — narrow enough to keep claim lines in a readable measure.
- **Vertical rhythm:** Sections separated by ~20px (`space-y-5`); items within a section by ~10px.
- **Note:** this single area hosts every state — the card, the loading skeleton, the empty state, and the in-place source layer all render in it.

### Tags
- **Style:** 1px Border, Paper background, Secondary Ink text, `6px` radius (`rounded-sm`), 12–14px type, medium weight. Square-ish, crisp.
- **Use:** Each losing alternative under "Considered." Tags are *not* used for filing metadata — no source-system label, no decision-id pill on the card.
- **State:** Static, non-interactive. Tags carry facts, not actions.

### Source Citations (typed evidence, the signature treatment)
The card's citations are **not** pills. Each is a borderless, type-aware unit that reads like its own object yet shares one structure, so the family is coherent without the generic outlined-pill look (which made every chip on the card identical and "liney").
- **Anatomy:** a filled "stamp" tile (`size-8`, `rounded-[7px]`, `bg-foreground/[0.06]` with a hairline inset ring) holding a kind-specific icon, then two stacked lines — a quiet **kind label** (`type-text-xs`, muted) over the **identifier** (`type-text-sm`, medium, ink). A trailing `ChevronRight` slides in on hover.
- **Per-kind identity:** the icon + kind label + identifier together name the type at a glance — `ADR` (FileText), `Slack` (Hash), `Pull request` (GitPullRequest), `Commit` (GitCommitHorizontal, identifier in `tabular-nums`), `Email` (Mail), `Notion` / `Document` (NotebookPen / FileText). Coherence is the shared tile-and-two-line structure; distinction is the glyph and the content.
- **Theme-adaptive tile:** the tile fill is an ink transparency (`bg-foreground/[0.06]`, hover `/10`), so the stamp stays visible on both the white and near-black host canvas — never a fixed `bg-muted` that vanishes in dark.
- **Action:** clicking opens the in-place Source Viewer (it does **not** redirect out). The external link is demoted to the final action inside the layer. URL-less sources (email) behave identically; only the "Open in…" button inside the layer is conditional on a URL.
- **Not a pill:** citations are square-tiled and borderless by design, which is what visually separates them from the two pill families below.

### Pills — Tags (Considered) and Related Chips
Pills are reserved for two roles, and only these two:
- **Considered (Tags):** 1px Border, `rounded-sm`, Secondary Ink — one per losing alternative. Static, non-interactive; they carry facts, not actions.
- **Related Chips:** secondary `pill` button with a question-mark icon. Clicking **opens the related decision in place** via a direct `useCallTool("find-decision")` call (no new model turn) and crossfades the card to it; a "Back" control returns to the first decision. The clicked chip carries its own loading spinner (`Button loading`) while the fetch is in flight, and siblings disable. (Supersedes the earlier behavior of sending a follow-up turn to the model.)

### The Winning-Argument Thread (signature component)
- Each winning argument is led by a `size-2` Signal Magenta dot, and the dots are linked top-to-bottom by a quiet 1px rail (`bg-foreground/20`) — a literal thread of reasoning down the left of "Why this won." The magenta lives **only** on the dot nodes; the connecting rail is a neutral ink tint. This is the card's entire use of brand color and its single most recognizable mark. See **The One Mark Rule.**
- The arguments enter with a `motion-safe` staggered fade + slide (80ms apart), so the thread assembles itself; under `prefers-reduced-motion` they are simply present.

### Source Viewer (in-place source layer)
The depth layer behind each citation. Clicking a source citation replaces the card's content, within the same area, with a focused view of that one source. (This retires the old hover Tooltip, which only ever surfaced a one-line excerpt.)

- **Shell:** a quiet "‹ Back to decision" control (tertiary button), the source's own header, the source-specific body, and — only when a URL exists — a secondary "Open in {GitHub|Slack|Notion|Google Docs}" button at the bottom.
- **Entry motion:** `motion-safe` fade + 1px slide-up, ~200ms; nothing under `prefers-reduced-motion`.
- **One Mark, in-layer:** Signal Magenta appears exactly once per layer — the single dot that marks the decisive message, quote, or "what settled it" line. Everything else is teal-neutral, and the highlighted evidence sits in a recessed `bg-muted` block, not a colored stripe.
- **Source-specific renderers** (the value of the app — each source type shows the slice that drove the decision):
  - **Slack** — channel header, then a participant dialogue (initials avatar + name + handle + time + message); the decisive message is recessed and dot-marked.
  - **Email** — subject header, a From / To / Date description list, then quoted excerpts; the decisive quote is recessed and dot-marked.
  - **GitHub PR** — PR header (icon, repo #number, state badge, title, author), summary, then a comment thread (avatar + handle + body); the decisive comment is recessed and dot-marked.
  - **Commit** — short SHA (tabular, not a mono face) + repo, subject and body, author · date, and an optional files-changed list.
  - **Document (ADR / Doc / Notion)** — title (+ optional status badge and section), the excerpt, and a "What settled it" recessed block carrying the one magenta dot.
- **Data source:** rich source content is delivered to the view via the tool's `_meta` (as `responseMetadata`) and is **never** sent to the model, so prose can't restate it. The view joins it to the on-card source by `source.id`.

### Skeleton (loading)
- Surface-Muted blocks with a `motion-safe` pulse, laid out to match the real card's rhythm (title, tag row, argument lines) so the load state previews the result instead of a generic spinner.

## 6. Do's and Don'ts

### Do:
- **Do** keep the card to its essential fields: title, date, owner, losing alternatives, 2–3 winning arguments with links, related chips. If plain text wouldn't meaningfully degrade a piece, it isn't a widget.
- **Do** keep Signal Magenta on exactly one element per card (the winning-argument dot nodes). Its rarity is the signal; the connecting thread rail stays neutral.
- **Do** keep the frame dissolved: no border, fill, or shadow on the card. Let hierarchy, whitespace, and the edge fade carry separation against the host.
- **Do** carry the full hierarchy with Inter weights and scale (400/500/600), not a second typeface.
- **Do** keep neutrals teal-tinted; the "gray" here is always a desaturated teal. Where a surface must read in both themes, use an ink transparency (`bg-foreground/N`), not a fixed neutral.
- **Do** keep the three element families distinct: typed **citation tiles** for evidence (borderless, square stamp), **Tags** for considered alternatives (bordered, square), **pill** chips for related decisions (rounded). One role each.
- **Do** adapt to the host's light and dark theme; verify text and tiles stay legible on both the white and near-black canvas.
- **Do** preview the result shape in the loading skeleton for the initial search; for in-place related navigation, keep the loading feedback on the action (the chip's own spinner), not a spinner floating in content.

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
