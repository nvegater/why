# ChatGPT Connector Testing

How to exercise the full **Why** mock corpus inside **ChatGPT**, through the live Alpic tunnel — i.e. the connected app, not the Skybridge Playground.

For deterministic, form-level testing (junk queries, too-broad states, exact tool output), use [`PLAYGROUND_TESTING.md`](./PLAYGROUND_TESTING.md) instead. This doc is for the model-facing, end-to-end ChatGPT experience.

## Setup

1. Run the dev server and keep the tunnel open:

   ```bash
   pnpm dev:tunnel
   # or, if the tunnel is already open separately:
   pnpm dev          # serves :3000; the existing `alpic tunnel --port 3000` forwards to it
   ```

2. The connector points at the stable subdomain `https://dark-snakes-win-060.alpic.dev`. The tunnel is a pure passthrough to `localhost:3000`, so whatever the dev server has loaded is what ChatGPT sees.

3. After changing tool **names / descriptions / input schemas**, refresh the connector in ChatGPT so it re-reads `tools/list`. Implementation/view-only changes need only a fresh message.

## The prompt pattern that triggers the app

In ChatGPT the model decides whether to call the app and what `query` string to send. Lead with an explicit nudge so the `find-decision` tool actually fires. The verified working prompt:

```text
Use the why app, it pulls the context needed. Why did we pick our database?
```

Reuse the prefix `Use the why app, it pulls the context needed.` in front of any question below if the model answers from its own memory instead of calling the app.

## Decision test queries

Six decisions live in the mock corpus. Each row has a natural-language prompt and the decision it should resolve to. Matching is keyword-based (title + keywords score highest), so the **bolded** terms are what drive the match.

| # | Prompt (after the "Use the why app…" prefix) | Resolves to | Decision id |
|---|---|---|---|
| 1 | Why did we pick our **database**? | Adopt PostgreSQL as the primary datastore | `dec-pg-primary` |
| 2 | Why did we roll back **Elasticsearch**? | Roll back the Elasticsearch search service to Postgres FTS | `dec-search-rollback` |
| 3 | Why did we switch to **usage-based pricing**? | Switch to usage-based pricing for the API tier | `dec-usage-pricing` |
| 4 | Why did we replace live coding with a **take-home work sample**? | Replace live coding with a paid take-home work sample | `dec-hiring-worksample` |
| 5 | Why did we move **webhooks** to an **outbox queue**? | Move webhook ingestion to an outbox-backed queue | `dec-webhook-outbox` |
| 6 | Why are **EU refunds** still **manual**? | Keep automatic refund approvals off for EU disputes | `dec-refund-manual-review` |

### Alternate phrasings (all should hit the same decision)

- **`dec-pg-primary`** — "Why are we on **Postgres** instead of **MongoDB**?" · "Why didn't we use **DynamoDB**?" · "Why did we migrate off **MySQL**?"
- **`dec-search-rollback`** — "Why did we drop our **search cluster**?" · "Why are we using **Postgres full-text search**?" · "Why did we kill **Elasticsearch** for cost?"
- **`dec-usage-pricing`** — "Why did we change our **API pricing**?" · "Why did we drop **per-seat** pricing?" · "Why is the API tier **metered**?"
- **`dec-hiring-worksample`** — "Why did we drop **whiteboard interviews**?" · "Why do we pay candidates for the **work sample**?" · "Why did we change our **hiring** process?"
- **`dec-webhook-outbox`** — "Why do we use an **outbox** for partner **callbacks**?" · "Why are **webhooks retryable** now?" · "Why don't webhooks block customer writes?"
- **`dec-refund-manual-review`** — "Why is **auto-approval off** for **EU disputes**?" · "Why does support **manually review** EU **refunds**?"

## What each card should show

- **`dec-pg-primary`** — alternatives `MongoDB`, `DynamoDB`, `Stay on MySQL 5.7`; three winning arguments with ADR / Slack / PR / email source pills; related chips for search rollback and usage pricing.
- **`dec-search-rollback`** — three arguments (cost share, dual-write incidents, transactional FTS); ADR / doc / Slack / PR / commit sources.
- **`dec-usage-pricing`** — non-technical framing; three arguments; Notion / doc / Slack / email sources.
- **`dec-hiring-worksample`** — email source renders as a **non-clickable** provenance tag (not a link).
- **`dec-webhook-outbox`** — alternatives include synchronous handling, direct Kafka, hourly batches; GitHub / commit / Slack sources.
- **`dec-refund-manual-review`** — the **sparse record**: "no alternatives recorded," one argument with "Source not recorded," and an Information gaps section listing Owner, Alternatives, and Primary source. The model should name the gaps, not invent missing details.

## Follow-up: "What changed since?"

After any card is shown, ask:

```text
What changed since?
```

This calls `get-decision-changes` for the decision already on screen. Expected per decision:

| Decision | Later events |
|---|---|
| `dec-pg-primary` | None — model says it **still stands** |
| `dec-search-rollback` | **2 events** — 2025-04-22 partial reversal (fuzzy carrier matching back to OpenSearch), 2025-05-09 revisit (OpenSearch limited to carrier-name autocomplete) |
| `dec-usage-pricing` | **2 events** — 2025-01-15 spend cap + alerts, 2025-02-27 committed-use discount tier |
| `dec-hiring-worksample` | None — **still stands** |
| `dec-webhook-outbox` | **1 event** — 2025-08-19 weekly dead-letter review added |
| `dec-refund-manual-review` | None — **still stands** |

`get-decision-changes` is viewless: it renders no card, just prose. Empty timelines should be narrated as "the decision still stands in this corpus."

## In-card interactions

- **Source pills** (e.g. `ADR-0007`, `PR #214`, `#eng-architecture`) open the underlying source externally. Email sources are intentionally **not clickable**.
- **Related chips** (e.g. "Roll back the Elasticsearch search service to Postgres FTS") send a follow-up message containing the related title + id, which kicks off a new turn and renders a fresh card.

## Edge cases

- **No match** — "Use the why app. Why did we choose the office paint color?" → empty state; the model should ask a clarifying question rather than invent a decision.
- **Ambiguity note** — `billing` is a keyword on *both* `dec-usage-pricing` and `dec-refund-manual-review`. A bare "Why did we change billing?" may surface a "another decision also matched" nudge; add `pricing`, `EU`, or `refund` to disambiguate.
- **Too-broad / junk states** are hard to trigger deterministically in ChatGPT because the model rewrites the query before sending it. Use `PLAYGROUND_TESTING.md` (sections 11–12) to test those directly.

## Pass criteria (ChatGPT)

- The prefixed prompts cause ChatGPT to **call `find-decision`** and narrate around the rendered card rather than answering from memory.
- All six decisions resolve to the correct card with the expected alternatives, arguments, and sources.
- Email sources are non-clickable; other source pills open externally.
- The sparse refund record shows gaps and the model does not fill them in.
- "What changed since?" calls `get-decision-changes` and matches the timeline table above, including the three "still stands" cases.
