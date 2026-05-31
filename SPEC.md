# Y

## Value Proposition

Y answers "why did we decide X?" from inside a ChatGPT or Skybridge conversation. It targets engineering and operations teams that need decision history without searching ADR folders, pull requests, Slack threads, Notion pages, docs, or email.

The app only reads records. It surfaces one past decision with the owner, date, losing alternatives, and the 2-3 arguments that won, with each claim linked back to source evidence.

Core actions:
- Find the decision behind a technical or non-technical choice.
- Ask what changed after a shown decision.

## Why LLM

Conversational lookup is the win: users can ask with incomplete phrasing such as "why did we roll back search?" or "why did pricing change?" instead of knowing where the source lives.

The LLM contributes intent matching, prose explanation, clarification when matches are ambiguous, and a timeline narrative for later changes.

The LLM lacks the private source systems and the structured decision projection. Y supplies those through tools and keeps the visual surface small enough for inline chat.

## UI Overview

The first view is a thin Decision Card for `find-decision`. It shows the decision title, date, owner, source system, capped reviewer line, losing alternatives, winning arguments, source pills, and related-decision chips.

Source pills open the original GitHub, Slack, Notion, or Google Doc source when a URL exists. Email sources render as non-tappable provenance tags.

Related-decision chips start a new ChatGPT turn with a follow-up prompt, so the model can call `find-decision` again and explain the next card in prose.

The "what changed since?" flow is viewless. The model calls `get-decision-changes` and narrates later events as a chronological prose timeline. Empty timelines mean the decision still stands.

## Product Context

- Product: Y, an MCP app for decision-history retrieval.
- Framework: Skybridge starter template.
- Sources: mock GitHub and workspace corpus now; future GitHub, Slack, Notion, email, and docs connectors later.
- Auth: none in the mock build.
- Storage: read-only; Y does not write or persist records.
- Constraints: no test runner is configured in this repo; verification is build plus local MCP smoke checks.

## UX Flows

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

**View tool: `find-decision`**
- Input: `{ query: string }`
- Output: `{ decision: DecisionCard | null, query: string }`
- View: `find-decision`
- Behavior: returns the best matching decision card payload. If no match exists, the view renders a factual empty state and the model asks a clarifying question.

**Tool: `get-decision-changes`**
- Input: `{ decisionId?: string, query?: string }`
- Output: `{ decisionId: string | null, decisionTitle: string | null, events: TimelineEvent[] }`
- View: none
- Behavior: resolves by decision id first, otherwise by query. Empty events are a valid "still stands" answer.

## Mock Corpus And Store Seam

The tools import only `getStore()` and types from `src/data/store.ts`. The mock corpus is isolated under `src/data/mock/`, and a real connector can replace `MockDecisionStore` by changing `getStore()`.

The mock corpus contains four Northwind Logistics decisions:
- `dec-pg-primary`: Adopt PostgreSQL as the primary datastore.
- `dec-search-rollback`: Roll back Elasticsearch search to Postgres FTS.
- `dec-usage-pricing`: Switch to usage-based pricing for the API tier.
- `dec-hiring-worksample`: Replace live coding with a paid take-home work sample.
