# Y

## Value Proposition

Y answers "why did we decide X?" from inside a ChatGPT or Skybridge conversation. It targets engineering and operations teams that need decision history without searching ADR folders, pull requests, Slack threads, Notion pages, docs, or email.

The app only reads records. It surfaces one past decision with the owner, date, losing alternatives, and the 2-3 arguments that won, with each claim linked back to source evidence when the corpus has it.

Core actions:
- List recorded decisions with a decision-date filter, defaulting to last week.
- Find the decision behind a technical or non-technical choice.
- Ask what changed after a shown decision.

## Why LLM

Conversational lookup is the win: users can ask with incomplete phrasing such as "why did we roll back search?" or "why did pricing change?" instead of knowing where the source lives.

The LLM contributes intent matching, prose explanation, clarification when matches are ambiguous, and a timeline narrative for later changes.

The LLM lacks the private source systems and the structured decision projection. Y supplies those through tools and keeps the visual surface small enough for inline chat.

## UI Overview

The decision list view for `list-decisions` shows the available recorded decisions scoped to a date range. If the caller provides no range, the tool defaults to last week. Each row is about the decision made: title first, then date and owner. Source availability appears as small, recessed source stamps so the user can tell which evidence types exist without the row becoming a source browser. Selecting a row opens the existing Decision Card in place.

The first view is a thin Decision Card for `find-decision`. It shows the decision title, date, owner, losing alternatives, a dated winning-argument timeline, source pills, known information gaps, and related-decision chips. Each timeline marker shows a compact date and exposes the exact recorded date or time in a tooltip on hover or focus.

Source pills open the original GitHub, Slack, Notion, or Google Doc source when a URL exists. Email sources render as non-tappable provenance tags.

Incomplete records are valid in the mock corpus. The card renders missing alternatives, missing source links, and known information gaps explicitly instead of implying the evidence exists.

Related-decision chips start a new ChatGPT turn with a follow-up prompt, so the model can call `find-decision` again and explain the next card in prose.

The "what changed since?" flow is viewless. The model calls `get-decision-changes` and narrates later events as a chronological prose timeline. Empty timelines mean the decision still stands.

## Product Context

- Product: Y, an MCP app for decision-history retrieval.
- Framework: Skybridge starter template.
- Sources: mock GitHub and workspace corpus now; future GitHub, Slack, Notion, email, and docs connectors later.
- Auth: none in the mock build.
- Storage: read-only; Y does not write or persist records.
- Constraints: no test runner is configured in this repo; verification is build plus local MCP smoke checks.
- Mock behavior: `find-decision` includes a small artificial search delay so the loading skeleton is visible in sandbox testing.

## UX Flows

List decisions:
1. User asks to show available decisions, optionally with a date filter.
2. Model calls `list-decisions` with explicit `from` / `to` dates, a supported relative range, or no filter.
3. Tool returns matching decision list rows, newest first.
4. View renders the list with minimal source availability stamps.
5. User can select a row to open the existing Decision Card in place.

Find a decision:
1. User asks why a decision was made.
2. Model calls `find-decision` with a natural-language query.
3. Tool searches the decision store and returns the best match plus the original query.
4. ChatGPT explains the result in prose around the Decision Card.
5. User can open source links or ask about a related decision through chips.

Get later changes:
1. User asks what changed since a shown decision.
2. Model calls `get-decision-changes`, preferably with the shown decision id.
3. Tool returns later events oldest first.
4. ChatGPT renders a prose timeline, or says the decision still stands when there are no events.

## Tools and Views

**View tool: `list-decisions`**
- Input: `{ from?: string, to?: string, relativeRange?: "last-7-days" | "this-week" | "last-week" | "this-month" | "last-month" | "this-year" | "last-year" }`
- Output: `{ decisions: DecisionListItem[], range: { from: string | null, to: string | null, label: string, isFiltered: boolean } }`
- View: `list-decisions`
- Behavior: returns recorded decisions sorted newest first, filtered inclusively by decision date. When no date filter is supplied, it defaults to `relativeRange: "last-week"`. Rows include title, date, owner, later-event count, and source availability counts by source kind.

**View tool: `find-decision`**
- Input: `{ query: string }`
- Output: `{ decision: DecisionCard | null, query: string }`, where `DecisionCard` may include `gaps` and each winning argument may include `decidedAt` for its timeline marker.
- View: `find-decision`
- Behavior: returns the best matching decision card payload after a realistic mock delay. If no match exists, the view renders either a too-broad or no-match empty state and the model asks a clarifying question.

**Tool: `get-decision-changes`**
- Input: `{ decisionId?: string, query?: string }`
- Output: `{ decisionId: string | null, decisionTitle: string | null, events: TimelineEvent[] }`
- View: none
- Behavior: resolves by decision id first, otherwise by query. Empty events are a valid "still stands" answer.

## Mock Corpus And Store Seam

The tools import only `getStore()` and types from `src/data/store.ts`. The mock corpus is isolated under `src/data/mock/`, and a real connector can replace `MockDecisionStore` by changing `getStore()`.

The mock corpus contains six Northwind Logistics decisions:
- `dec-pg-primary`: Adopt PostgreSQL as the primary datastore.
- `dec-search-rollback`: Roll back Elasticsearch search to Postgres FTS.
- `dec-usage-pricing`: Switch to usage-based pricing for the API tier.
- `dec-hiring-worksample`: Replace live coding with a paid take-home work sample. Dated inside the default last-week window so the list view has a richer example row.
- `dec-webhook-outbox`: Move webhook ingestion to an outbox-backed queue.
- `dec-refund-manual-review`: Keep automatic refund approvals off for EU disputes. This is intentionally sparse, dated inside the default last-week window, and exercises missing alternatives, missing source links, no related decisions, and explicit information gaps.
