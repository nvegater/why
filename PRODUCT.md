# Product

## Register

product

## Users

Two audiences, one shape. **Technical** users (engineers) recover decisions whose source of truth is a **GitHub repo** — ADRs, commit history, PR descriptions, spanning the repository over time. **Non-technical** users (PMs, ops, leadership) recover decisions whose source of truth is **Slack, email, and Notion** — threads, memos, policy docs. Y treats both identically: a decision, made by people, for reasons, lookupable later.

In both cases the question arrives mid-task, often with incomplete phrasing ("why did we roll back search?", "why did pricing change?"), and the user does not know, or does not want to hunt for, where the source lives.

The job to be done: get the settled answer to "why did we decide X?" — the owner, the date, the losing alternatives, and the two or three arguments that won — with each claim traceable to its source, without leaving the chat.

## Product Purpose

Y is a read-only MCP app for decision-history retrieval. The "why" behind engineering and operations decisions is scattered across systems and decays over time, so teams re-litigate settled choices because the reasoning is buried. Y projects that history into a single, walkable Decision Card inside the chat the user is already in.

Success looks like this: a user asks a vague "why" question and, in one turn, sees the right decision with its winning arguments and can click straight through to the evidence, or walk to a related decision, without searching any source system. A secondary, viewless flow narrates what changed after a decision as a chronological prose timeline; an empty timeline means the decision still stands.

## Brand Personality

Editorial narrative. Y speaks in the voice of a well-edited brief: clear, concise, and sourced. The Decision Card tells the "why" as a short story — what was considered, why this option won, what is related — with sources presented as citations rather than decoration. The tone is calm, precise, and trustworthy; confident without being loud.

Three words: editorial, evidence-first, unobtrusive. The emotional goal is the relief of a settled answer you can trust and verify.

"Editorial narrative" is a matter of structure and restraint, not embellishment. The card reads like a well-edited, sourced brief; the model's surrounding prose stays direct and factual — no chattiness, no filler, no invented voice. The voice lives in the clarity of the record, not in personality laid on top of it.

Identity stance is a balanced signature. Y lives inside both ChatGPT and Claude, so it inherits each host's theme, type, and spacing. On top of that it keeps a small, consistent signature: one accent role for the winning-argument thread, a recognizable card rhythm (title → considered → why this won → related), and a consistent source-link and citation pattern. The signature lives in structure and rhythm, not in chrome.

## Anti-references

- **Cluttered SaaS dashboard.** No KPI tiles, dense multi-panel layouts, or chart-heavy admin chrome. Y is one focused card, not a control panel.
- **Heavy branded chrome.** No logos, gradients, or marketing flourishes that fight the surrounding host chat UI.
- **Playful or gamified.** No mascots, confetti, badges, or emoji-driven tone. Y is a decision system of record.
- **Generic AI-app card.** Avoid the default gradient-accent, glassy, over-rounded "AI template" look that signals slop.

Also off the table, per craft standards: gradient text, side-stripe accent borders, glassmorphism as a default, and the hero-metric template.

## Design Principles

1. **Evidence over assertion.** Every claim earns its place by linking to a source; the card is only as trustworthy as its citations. Never state a "why" the user cannot verify.
2. **One settled answer, not a results page.** Surface the single best-matching decision clearly. Ambiguity is the model's job to resolve in prose, not the card's job to enumerate.
3. **Guest in someone else's house.** Y lives inside ChatGPT and Claude. It adapts to the host's theme and density and never competes with the surrounding conversation. The signature is in structure, not chrome.
4. **Prose carries the framing; widgets stay thin.** The model narrates and interprets in prose; the card exists only where structure or tappability is essential (sourced arguments, related-decision chips). If plain text wouldn't meaningfully degrade it, it shouldn't be a widget. Depth — source excerpts, related decisions — is reachable but never forced into view.
5. **Read like a brief.** The "why" is a short, edited narrative (considered → won → related), not a data dump. Hierarchy and pacing carry the story.
6. **One question, at most one follow-up.** Each job completes in a single question plus, at most, one follow-up ("what changed since?"). No multi-step flows, no wizards, no bouncing the user elsewhere.

## Accessibility & Inclusion

Y defers accessibility to the host environment. It commits to not breaking what ChatGPT and Claude already provide rather than asserting an independent WCAG level:

- Respect the host theme, contrast, locale, display mode, and safe-area insets via `useLayout()` (already wired); do not override host focus or keyboard behavior.
- Maintain the `data-llm` semantic layer so the model can describe the card in natural language to users who cannot see it — a built-in assistive affordance unique to this surface.
- Keep source links and chips labeled with standalone, descriptive text (`aria-label`) so their meaning survives out of context.

If a future requirement raises this to an explicit target (e.g. WCAG 2.2 AA on both themes), revisit this section.
