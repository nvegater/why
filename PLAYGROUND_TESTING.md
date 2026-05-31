# Y Playground Testing

Use this guide to test the full Y mock corpus in the Skybridge Screen and Playground.

## Prerequisites

1. Install dependencies if needed:

```bash
pnpm install
```

2. Start local dev mode:

```bash
pnpm dev
```

3. Open the Skybridge Screen at:

```text
http://localhost:3000
```

If you are using an Alpic tunnel, use the generated `*.alpic.dev` screen URL instead.

## Decision IDs

The `find-decision` tool returns the decision id in the tool output JSON under:

```text
structuredContent.decision.id
```

Use these mock ids for direct `get-decision-changes` tests:

| Decision id | Search query | Expected timeline |
|---|---|---|
| `dec-pg-primary` | `why did we pick our database` | Empty, still stands |
| `dec-search-rollback` | `elasticsearch` | 2 later events |
| `dec-usage-pricing` | `usage based pricing` | 2 later events |
| `dec-hiring-worksample` | `hiring work sample` | Empty, still stands |
| `dec-webhook-outbox` | `webhook outbox queue` | 1 later event |
| `dec-refund-manual-review` | `eu refund disputes` | Empty, still stands |

## DevTools Form Tests

These tests call tools directly from the left-hand Tools panel.

### 1. Verify Tool List

1. In the left Tools panel, confirm only these tools are listed:
   - `find-decision`
   - `get-decision-changes`
2. Confirm there is no `start` or `get-fortune-cookie` tool.

### 2. Find The Database Decision

1. Expand `find-decision`.
2. Set `query` to:

```text
why did we pick our database
```

3. Click **Run**.
4. Expected result:
   - A loading skeleton appears briefly with `Searching decision sources`.
   - Card title: `Adopt PostgreSQL as the primary datastore`
   - Alternatives: `MongoDB`, `DynamoDB`, `Stay on MySQL 5.7`
   - Three winning arguments
   - Related chips for search rollback and usage pricing

### 3. Test Source Links

1. On the rendered card, click a source pill such as `ADR-0007` or `PR #214`.
2. Expected result:
   - The source opens externally or logs an `openExternal` event in the right-hand Logs panel.
   - Email sources render as non-clickable tags.

### 4. Test Related Chips

1. Click the related chip `Roll back the Elasticsearch search service to Postgres FTS`.
2. Expected result:
   - The app sends a follow-up prompt with the related decision title and id.
   - In Playground chat, this should start a new model turn and render a fresh card.
   - In DevTools logs, you should see view state/follow-up activity.

### 5. Find The Elasticsearch Decision

1. Run `find-decision` with:

```text
elasticsearch
```

2. Expected result:
   - Card title: `Roll back the Elasticsearch search service to Postgres FTS`
   - Tool output includes `structuredContent.decision.id: dec-search-rollback`
   - `laterEventCount` is not rendered as UI text, but the model can see it through card context.

### 6. Find The Webhook Outbox Decision

1. Run `find-decision` with:

```text
webhook outbox queue
```

2. Expected result:
   - Card title: `Move webhook ingestion to an outbox-backed queue`
   - Alternatives include synchronous webhook handling, direct Kafka, and hourly batches.
   - Three winning arguments render with GitHub, commit, and Slack source pills.
   - `laterEventCount` is `1` in the tool output.

### 7. Find A Sparse Record With Information Gaps

1. Run `find-decision` with:

```text
eu refund disputes
```

2. Expected result:
   - Card title: `Keep automatic refund approvals off for EU disputes`
   - The Considered section says no alternatives were recorded.
   - One argument renders `Source not recorded`.
   - The Information gaps section lists Owner, Alternatives, and Primary source.
   - The Related section says no related decisions were recorded.

### 8. Get Non-Empty Later Changes

1. Expand `get-decision-changes`.
2. Set `decisionId` to:

```text
dec-search-rollback
```

3. Leave `query` empty.
4. Click **Run**.
5. Expected result:
   - No card renders because this tool is viewless.
   - Tool output includes two chronological events:
     - `2025-04-22` partial reversal: fuzzy carrier matching moved back to OpenSearch.
     - `2025-05-09` revisit: OpenSearch scope limited to carrier-name autocomplete.

### 9. Get Usage Pricing Later Changes

1. Run `get-decision-changes` with:

```text
dec-usage-pricing
```

2. Expected result:
   - Two chronological revisit events:
     - `2025-01-15` spend cap and alerts.
     - `2025-02-27` committed-use discount.

### 10. Test Empty Timeline: Still Stands

1. Run `get-decision-changes` with:

```text
dec-hiring-worksample
```

2. Expected result:
   - `events` is an empty array.
   - Tool text tells the model to say the decision still stands in this corpus.

3. Repeat with:

```text
dec-pg-primary
```

4. Expected result:
   - `events` is an empty array.
   - The Postgres decision still stands.

### 11. Test Junk Query Empty State

1. Run `find-decision` with:

```text
zzzz nonexistent
```

2. Expected result:
   - Card shows: `No decision found for that question.`
   - Tool output has `structuredContent.decision: null`.
   - Model should ask a clarifying question.

### 12. Test Too-Broad Empty State

1. Run `find-decision` with:

```text
why
```

2. Expected result:
   - Card shows: `Need a more specific decision.`
   - The empty state suggests concrete systems or policy areas.
   - Tool output has `structuredContent.decision: null`.

## Playground Chat Tests

Use the **Playground** button in the Skybridge Screen to test the model-facing behavior. These prompts should cause the model to call the right tool and narrate around the output.

### 1. Decision Card + Prose

Prompt:

```text
Why did we pick our database?
```

Expected:
- Model calls `find-decision`.
- Tool output includes `decision.id: dec-pg-primary`.
- Model explains the Postgres decision in prose using the winning arguments.

### 2. Follow-Up Timeline That Still Stands

Prompt after the database card:

```text
What changed since?
```

Expected:
- Model calls `get-decision-changes` with `decisionId: dec-pg-primary`.
- Model says there are no later events and the decision still stands.

### 3. Partial Reversal Timeline

Prompt:

```text
Why did we roll back Elasticsearch?
```

Expected:
- Model calls `find-decision`.
- Tool output includes `decision.id: dec-search-rollback`.
- Model should offer to explain what changed since.

Then prompt:

```text
What changed since?
```

Expected:
- Model calls `get-decision-changes` with `decisionId: dec-search-rollback`.
- Model narrates the two-event timeline oldest first.
- The first event should be a partial reversal for carrier-name matching.
- The second event should clarify OpenSearch is limited to carrier-name autocomplete.

### 4. Non-Technical Workspace Decision

Prompt:

```text
Why did we switch API pricing?
```

Expected:
- Model calls `find-decision`.
- Tool output includes `decision.id: dec-usage-pricing`.
- Model explains the pricing decision and can follow with the two pricing timeline events.

### 5. Hiring Decision With Email Provenance

Prompt:

```text
Why did we replace live coding?
```

Expected:
- Model calls `find-decision`.
- Tool output includes `decision.id: dec-hiring-worksample`.
- Email source appears as a non-clickable provenance tag.

Then prompt:

```text
What changed since?
```

Expected:
- Model calls `get-decision-changes` with `decisionId: dec-hiring-worksample`.
- Model says no later events were found and the decision still stands.

### 6. Technical Queue Decision

Prompt:

```text
Why did we move webhooks to an outbox?
```

Expected:
- Model calls `find-decision`.
- Tool output includes `decision.id: dec-webhook-outbox`.
- Model explains the queue choice and offers to answer what changed since.

### 7. Sparse Record With Gaps

Prompt:

```text
Why are EU refunds still manual?
```

Expected:
- Model calls `find-decision`.
- Tool output includes `decision.id: dec-refund-manual-review`.
- Model names the known gaps instead of filling in the missing owner or alternatives.

### 8. Related Chip Walk

1. Ask:

```text
Why did we pick our database?
```

2. Click the related chip:

```text
Roll back the Elasticsearch search service to Postgres FTS
```

Expected:
- The chip sends a follow-up message that includes both the title and `dec-search-rollback`.
- The model starts a new turn, calls `find-decision`, and renders the Elasticsearch card.

### 9. Not Found

Prompt:

```text
Why did we choose the office paint color?
```

Expected:
- Model calls `find-decision`.
- Card shows the empty state.
- Model asks a clarifying question instead of inventing a decision.

## Pass Criteria

The build is acceptable when:

- The loading skeleton appears briefly before found and empty states.
- Source links open externally or produce `openExternal` logs.
- Email sources are not clickable.
- Sparse records show missing alternatives, missing source links, and information gaps.
- Related chips send a follow-up prompt rather than silently replacing iframe pixels.
- `get-decision-changes` renders no card.
- Empty timelines are handled as "still stands."
- Junk and too-broad queries return `decision: null` and factual empty cards.
