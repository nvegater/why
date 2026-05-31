import type { Decision } from "@/data/types.js";

export const DECISIONS: Decision[] = [
  {
    id: "dec-pg-primary",
    title: "Adopt PostgreSQL as the primary datastore",
    date: "2024-02-12",
    owner: "Priya Nadkarni (Staff Eng)",
    reviewers: ["Marcus Lindqvist (CTO)", "Dana Okafor (Eng Lead)"],
    audience: "technical",
    sourceSystem: "github",
    alternatives: ["MongoDB", "DynamoDB", "Stay on MySQL 5.7"],
    arguments: [
      {
        claim:
          "Shipment and route data is highly relational; JSONB covers our few webhook blobs without a second store.",
        sources: [
          {
            id: "dec-pg-primary-a1-adr",
            kind: "adr",
            label: "ADR-0007",
            url: "https://github.com/northwind-logistics/platform/blob/main/docs/adr/0007-primary-datastore.md",
            excerpt:
              "The core shipment, route, stop, carrier, and customer entities are relational; JSONB is sufficient for webhook payloads.",
            detail: {
              type: "document",
              title: "ADR-0007: Primary datastore",
              status: "Accepted",
              section: "Decision",
              body: "We will use a single managed PostgreSQL instance as the system of record. The core shipment, route, stop, carrier, and customer entities are strongly relational and are queried across joins on every shipment lookup. A document store would push those joins into application code. The only non-relational data we hold today is sparse webhook payloads, which JSONB columns handle without operating a second datastore.",
              decisiveLines: [
                "The core shipment, route, stop, carrier, and customer entities are strongly relational and are queried across joins on every shipment lookup.",
                "JSONB columns handle webhook payloads without operating a second datastore.",
              ],
            },
          },
          {
            id: "dec-pg-primary-a1-slack",
            kind: "slack",
            label: "#eng-architecture",
            url: "https://northwind-eng.slack.com/archives/C06ARCH/p1707753120000000",
            excerpt:
              "The architecture thread settled on relational modeling first and JSONB only for sparse webhook blobs.",
            detail: {
              type: "slack",
              channel: "#eng-architecture",
              messages: [
                {
                  author: "Priya Nadkarni",
                  handle: "priya",
                  time: "Feb 12, 09:32",
                  text: "Before we pick a datastore: how relational is the core model really? Routes, stops, carriers, customers all join on every shipment read.",
                },
                {
                  author: "Dana Okafor",
                  handle: "dana",
                  time: "Feb 12, 09:41",
                  text: "Very. The only thing that isn't is the raw webhook payloads we keep for replay.",
                },
                {
                  author: "Priya Nadkarni",
                  handle: "priya",
                  time: "Feb 12, 09:44",
                  text: "Then relational first, and JSONB for the webhook blobs. A second document store buys us nothing but a sync problem.",
                  decisive: true,
                },
                {
                  author: "Marcus Lindqvist",
                  handle: "marcus",
                  time: "Feb 12, 10:02",
                  text: "Agreed. Let's not run two datastores for one sparse blob column.",
                },
              ],
            },
          },
        ],
      },
      {
        claim:
          "Managed RDS gives PITR and read replicas out of the box; ops stays low.",
        sources: [
          {
            id: "dec-pg-primary-a2-doc",
            kind: "doc",
            label: "Datastore eval",
            url: "https://docs.google.com/document/d/1nw-datastore-eval-2024/edit",
            excerpt:
              "The evaluation scored managed Postgres highest on recovery, replicas, and operator familiarity.",
            detail: {
              type: "document",
              title: "Datastore evaluation 2024",
              section: "Scorecard summary",
              body: "Candidates were scored on recovery, horizontal read scaling, operator familiarity, and cost. Managed Postgres on RDS scored highest overall: point-in-time recovery and read replicas are configuration, not engineering, and every engineer on the team already operates Postgres. DynamoDB led on raw write scale but lost on recovery ergonomics and the relational access pattern.",
              decisiveLines: [
                "Point-in-time recovery and read replicas are configuration, not engineering.",
                "Managed Postgres on RDS scored highest overall.",
              ],
            },
          },
          {
            id: "dec-pg-primary-a2-pr",
            kind: "pr",
            label: "PR #214",
            url: "https://github.com/northwind-logistics/platform/pull/214",
            excerpt:
              "This PR adds the RDS Postgres module and backup defaults for production.",
            detail: {
              type: "pr",
              repo: "northwind-logistics/platform",
              number: 214,
              state: "merged",
              title: "infra: add managed RDS Postgres module + backup defaults",
              author: "Tomas Rivera",
              summary:
                "Adds the Terraform module for a managed Postgres instance with point-in-time recovery on, a 7-day backup window, and one read replica wired for analytics reads.",
              comments: [
                {
                  author: "Tomas Rivera",
                  handle: "tomas",
                  body: "PITR is on by default and the replica is provisioned but not yet routed. Backups land in the prod backup bucket.",
                },
                {
                  author: "Priya Nadkarni",
                  handle: "priya",
                  body: "This is exactly the low-ops story from the eval: recovery and replicas are just module flags, no bespoke tooling.",
                  decisive: true,
                },
                {
                  author: "Dana Okafor",
                  handle: "dana",
                  body: "Approving. Let's route analytics reads to the replica in a follow-up.",
                },
              ],
            },
          },
        ],
      },
      {
        claim: "Team already knows SQL; migrating off MySQL is mechanical.",
        sources: [
          {
            id: "dec-pg-primary-a3-email",
            kind: "email",
            label:
              'From Marcus Lindqvist - "Datastore decision - approved" - 2024-02-12',
            excerpt:
              "Marcus approved the move on the basis that the schema migration was mechanical and the team already had SQL depth.",
            detail: {
              type: "email",
              from: "Marcus Lindqvist <marcus@northwind.example>",
              to: ["eng-leads@northwind.example", "Priya Nadkarni"],
              date: "2024-02-12",
              subject: "Datastore decision - approved",
              quotes: [
                {
                  text: "I'm approving Postgres on RDS as our system of record.",
                },
                {
                  text: "The schema migration off MySQL 5.7 is mechanical, and the team already has deep SQL fluency, so I see no ramp cost here.",
                  decisive: true,
                },
                {
                  text: "Let's keep the JSONB use narrow to webhook payloads as the ADR says.",
                },
              ],
            },
          },
        ],
      },
    ],
    related: [
      {
        id: "dec-search-rollback",
        title: "Roll back the Elasticsearch search service to Postgres FTS",
      },
      {
        id: "dec-usage-pricing",
        title: "Switch to usage-based pricing for the API tier",
      },
    ],
    timeline: [],
    keywords: [
      "database",
      "datastore",
      "postgres",
      "postgresql",
      "mongodb",
      "dynamodb",
      "mysql",
      "rds",
      "storage",
    ],
  },
  {
    id: "dec-search-rollback",
    title: "Roll back the Elasticsearch search service to Postgres FTS",
    date: "2025-03-04",
    owner: "Dana Okafor",
    reviewers: ["Priya Nadkarni", "Tomas Rivera (SRE Lead)"],
    audience: "technical",
    sourceSystem: "github",
    alternatives: ["Keep Elasticsearch + caching", "Managed OpenSearch", "Typesense"],
    arguments: [
      {
        claim: "Search is less than 3% of queries but about 40% of data-infra spend.",
        sources: [
          {
            id: "dec-search-rollback-a1-adr",
            kind: "adr",
            label: "ADR-0019",
            url: "https://github.com/northwind-logistics/platform/blob/main/docs/adr/0019-retire-elasticsearch.md",
            excerpt:
              "The ADR records the low query share and high infrastructure spend for Elasticsearch.",
            detail: {
              type: "document",
              title: "ADR-0019: Retire Elasticsearch",
              status: "Accepted",
              section: "Context",
              body: "Search accounts for under 3% of total query volume, but the Elasticsearch cluster is roughly 40% of monthly data-infrastructure spend once nodes, snapshots, and the dual-write pipeline are counted. Postgres full-text search covers our shipment and address lookups with acceptable latency, so the cluster's cost is no longer justified by its traffic.",
              decisiveLines: [
                "Search is under 3% of total query volume but roughly 40% of monthly data-infrastructure spend.",
                "Postgres full-text search covers shipment and address lookups with acceptable latency.",
              ],
            },
          },
          {
            id: "dec-search-rollback-a1-doc",
            kind: "doc",
            label: "Search cost doc",
            url: "https://docs.google.com/document/d/1nw-search-cost-2025/edit",
            excerpt:
              "Monthly data-infra allocation put Elasticsearch near 40% of spend despite low traffic share.",
            detail: {
              type: "document",
              title: "Search cost breakdown (Q1 2025)",
              section: "Allocation",
              body: "Itemized monthly data-infrastructure cost. Elasticsearch nodes, snapshot storage, and the dual-write workers together land at 38-41% of the line depending on the month. Traffic attribution shows search at 2.6% of queries over the same window.",
              decisiveLines: [
                "Elasticsearch is 38-41% of monthly data-infra cost; search is 2.6% of queries.",
              ],
            },
          },
        ],
      },
      {
        claim: "Dual-write to ES was the top source of data-sync incidents.",
        sources: [
          {
            id: "dec-search-rollback-a2-slack",
            kind: "slack",
            label: "#incidents",
            url: "https://northwind-eng.slack.com/archives/C07INCIDENTS/p1741040160000000",
            excerpt:
              "Incident review pointed to ES dual-write lag as the recurring cause of stale shipment search results.",
            detail: {
              type: "slack",
              channel: "#incidents",
              messages: [
                {
                  author: "Tomas Rivera",
                  handle: "tomas",
                  time: "Mar 03, 16:08",
                  text: "Q1 incident review: 6 of 9 search-correctness pages trace back to the same cause.",
                },
                {
                  author: "Dana Okafor",
                  handle: "dana",
                  time: "Mar 03, 16:11",
                  text: "Which is?",
                },
                {
                  author: "Tomas Rivera",
                  handle: "tomas",
                  time: "Mar 03, 16:12",
                  text: "ES dual-write lag. Shipment updates commit in Postgres, the ES write trails or fails, and search returns stale rows until the reindex catches up.",
                  decisive: true,
                },
                {
                  author: "Priya Nadkarni",
                  handle: "priya",
                  time: "Mar 03, 16:20",
                  text: "So the dual-write is the bug surface. FTS on the source rows removes the window entirely.",
                },
              ],
            },
          },
          {
            id: "dec-search-rollback-a2-pr",
            kind: "pr",
            label: "PR #482",
            url: "https://github.com/northwind-logistics/platform/pull/482",
            excerpt:
              "The removal PR deletes ES dual-write paths from shipment and address updates.",
            detail: {
              type: "pr",
              repo: "northwind-logistics/platform",
              number: 482,
              state: "merged",
              title: "search: remove Elasticsearch dual-write from shipment + address writes",
              author: "Dana Okafor",
              summary:
                "Deletes the dual-write hooks that mirrored shipment and address updates into Elasticsearch. Search now reads Postgres FTS indexes built on the source tables, so there is no second copy to fall out of sync.",
              comments: [
                {
                  author: "Dana Okafor",
                  handle: "dana",
                  body: "This rips out the indexer hooks on shipment.update and address.update. No more mirror writes.",
                  decisive: true,
                },
                {
                  author: "Tomas Rivera",
                  handle: "tomas",
                  body: "This is the path that caused most of the Q1 search pages. Glad to see it go.",
                },
              ],
            },
          },
        ],
      },
      {
        claim:
          "Postgres FTS keeps search transactional with source rows, so there is no eventual-consistency window.",
        sources: [
          {
            id: "dec-search-rollback-a3-commit",
            kind: "commit",
            label: "a1f9c3e",
            url: "https://github.com/northwind-logistics/platform/commit/a1f9c3e8d4b2",
            excerpt:
              "The commit wires shipment search to transactional Postgres full-text indexes.",
            detail: {
              type: "commit",
              repo: "northwind-logistics/platform",
              sha: "a1f9c3e8d4b2",
              message:
                "search: back shipment + address search with transactional Postgres FTS indexes\n\nGENERATED tsvector columns updated in the same transaction as the row, so a committed shipment is immediately searchable. Removes the eventual-consistency window the ES mirror introduced.",
              author: "Dana Okafor",
              date: "2025-03-04",
              files: [
                "db/migrations/0061_shipment_fts.sql",
                "db/migrations/0062_address_fts.sql",
                "internal/search/postgres_fts.go",
              ],
            },
          },
        ],
      },
    ],
    related: [
      {
        id: "dec-pg-primary",
        title: "Adopt PostgreSQL as the primary datastore",
      },
      {
        id: "dec-usage-pricing",
        title: "Switch to usage-based pricing for the API tier",
      },
    ],
    timeline: [
      {
        date: "2025-04-22",
        title: "Fuzzy carrier matching moved back to OpenSearch",
        summary:
          "Fuzzy carrier-name matching moved back to a small OpenSearch index after FTS trigram recall complaints.",
        kind: "partial-reversal",
        source: {
          id: "dec-search-rollback-t1-pr",
          kind: "pr",
          label: "PR #547",
          url: "https://github.com/northwind-logistics/platform/pull/547",
          excerpt:
            "This PR restores a narrow OpenSearch index for carrier-name autocomplete only.",
        },
      },
      {
        date: "2025-05-09",
        title: "OpenSearch scope clarified",
        summary:
          "Scope clarified: OpenSearch is limited to carrier-name autocomplete; all shipment and address search stays on Postgres FTS.",
        kind: "revisit",
        source: {
          id: "dec-search-rollback-t2-slack",
          kind: "slack",
          label: "#eng-architecture",
          url: "https://northwind-eng.slack.com/archives/C06ARCH/p1746783840000000",
          excerpt:
            "The thread confirms OpenSearch is not coming back for general shipment or address search.",
        },
      },
    ],
    keywords: [
      "search",
      "elasticsearch",
      "opensearch",
      "full text",
      "fts",
      "rollback",
      "infra cost",
    ],
  },
  {
    id: "dec-usage-pricing",
    title: "Switch to usage-based pricing for the API tier",
    date: "2024-09-18",
    owner: "Lena Whitfield (VP Product)",
    reviewers: [
      "Marcus Lindqvist",
      "Raj Patel (Finance)",
      "Sofia Greco (Sales)",
    ],
    audience: "non-technical",
    sourceSystem: "workspace",
    alternatives: [
      "Keep flat per-seat",
      "Tiered bundles (S/M/L)",
      "Per-shipment pricing",
    ],
    arguments: [
      {
        claim:
          "Top 10% of accounts drove 60% of API calls on flat plans, so we subsidized heavy users.",
        sources: [
          {
            id: "dec-usage-pricing-a1-notion",
            kind: "notion",
            label: "Pricing model rework",
            url: "https://www.notion.so/northwind/Pricing-model-rework-9f72a6c2d88d41a7b6ac0de13baf4521",
            excerpt:
              "The memo shows heavy API consumers were underpriced relative to infrastructure and support cost.",
            detail: {
              type: "document",
              title: "Pricing model rework",
              section: "Problem",
              body: "On flat per-seat plans, the top 10% of accounts generate roughly 60% of API calls. Their infrastructure and support cost outpaces their revenue, so lighter accounts effectively subsidize them. Usage-based pricing aligns what an account pays with what it consumes and lets revenue grow with API volume.",
              decisiveLines: [
                "The top 10% of accounts generate ~60% of API calls on flat plans.",
                "Lighter accounts effectively subsidize the heavy ones.",
              ],
            },
          },
          {
            id: "dec-usage-pricing-a1-doc",
            kind: "doc",
            label: "API metering revenue",
            url: "https://docs.google.com/document/d/1nw-api-metering-revenue/edit",
            excerpt:
              "Revenue modeling found usage-based pricing aligned API volume with expansion revenue.",
            detail: {
              type: "document",
              title: "API metering revenue model",
              section: "Findings",
              body: "Modeling three pricing shapes against 18 months of usage. Usage-based pricing produced the tightest correlation between API volume and expansion revenue, and the smallest gap between cost-to-serve and price across the account base.",
              decisiveLines: [
                "Usage-based pricing produced the tightest correlation between API volume and expansion revenue.",
              ],
            },
          },
        ],
      },
      {
        claim: "Metered entry price removes the number one SMB sales objection.",
        sources: [
          {
            id: "dec-usage-pricing-a2-slack",
            kind: "slack",
            label: "#gtm-pricing",
            url: "https://northwind-eng.slack.com/archives/C09GTMPRICE/p1726599180000000",
            excerpt:
              "Sales notes show small teams objected to paying for unused seats before API traffic ramped.",
            detail: {
              type: "slack",
              channel: "#gtm-pricing",
              messages: [
                {
                  author: "Sofia Greco",
                  handle: "sofia",
                  time: "Sep 17, 11:20",
                  text: "Every SMB demo this month stalled at the same line: 'we don't want to pay per seat before we've sent any volume.'",
                  decisive: true,
                },
                {
                  author: "Lena Whitfield",
                  handle: "lena",
                  time: "Sep 17, 11:28",
                  text: "So a metered entry price removes the seat commitment entirely. They pay as traffic ramps.",
                },
                {
                  author: "Sofia Greco",
                  handle: "sofia",
                  time: "Sep 17, 11:31",
                  text: "Right. That kills the top objection in the SMB funnel.",
                },
              ],
            },
          },
          {
            id: "dec-usage-pricing-a2-email",
            kind: "email",
            label:
              'From Raj Patel - "Pricing change - finance sign-off" - 2024-09-17',
            excerpt:
              "Finance signed off after the floor price and margin guardrail were added.",
            detail: {
              type: "email",
              from: "Raj Patel <raj@northwind.example>",
              to: ["Lena Whitfield", "pricing-team@northwind.example"],
              date: "2024-09-17",
              subject: "Pricing change - finance sign-off",
              quotes: [
                {
                  text: "Finance signs off on usage-based pricing for the API tier.",
                  decisive: true,
                },
                {
                  text: "Conditions: a non-zero floor price per account and a margin guardrail so a runaway-cheap account can't go underwater.",
                },
              ],
            },
          },
        ],
      },
      {
        claim:
          "Metering infra already exists from rate-limiting; billing reads the same counters.",
        sources: [
          {
            id: "dec-usage-pricing-a3-pr",
            kind: "pr",
            label: "PR #321",
            url: "https://github.com/northwind-logistics/platform/pull/321",
            excerpt:
              "The PR exposes rate-limit counters to billing export without a separate metering pipeline.",
            detail: {
              type: "pr",
              repo: "northwind-logistics/platform",
              number: 321,
              state: "merged",
              title: "billing: export existing rate-limit counters for metering",
              author: "Priya Nadkarni",
              summary:
                "Exposes the per-account request counters already maintained for rate-limiting as a billing export. No new metering pipeline: billing reads the same counters the limiter writes.",
              comments: [
                {
                  author: "Priya Nadkarni",
                  handle: "priya",
                  body: "The limiter already counts every request per account. This just snapshots those counters hourly for billing.",
                  decisive: true,
                },
                {
                  author: "Raj Patel",
                  handle: "raj",
                  body: "Good - means metered billing has no new infra to stand up or reconcile.",
                },
              ],
            },
          },
        ],
      },
    ],
    related: [
      {
        id: "dec-hiring-worksample",
        title: "Replace live coding with a paid take-home work sample",
      },
      {
        id: "dec-pg-primary",
        title: "Adopt PostgreSQL as the primary datastore",
      },
    ],
    timeline: [
      {
        date: "2025-01-15",
        title: "Spend cap and alerts added",
        summary:
          "Added a monthly spend cap and overage alerts after enterprise accounts flagged unpredictable bills.",
        kind: "revisit",
        source: {
          id: "dec-usage-pricing-t1-notion",
          kind: "notion",
          label: "Usage pricing - guardrails",
          url: "https://www.notion.so/northwind/Usage-pricing-guardrails-5e189af31c954f2fb451ed3db51b2d5a",
          excerpt:
            "The guardrails memo adds caps, email alerts, and admin-visible forecast warnings.",
        },
      },
      {
        date: "2025-02-27",
        title: "Committed-use discount introduced",
        summary:
          "Introduced a committed-use discount tier; pay-as-you-go was retained for SMB.",
        kind: "revisit",
        source: {
          id: "dec-usage-pricing-t2-email",
          kind: "email",
          label:
            'From Lena Whitfield - "Pricing v2 - committed-use tier live" - 2025-02-27',
          excerpt:
            "Lena announced the committed-use tier after enterprise procurement requested predictability.",
        },
      },
    ],
    keywords: [
      "pricing",
      "usage based",
      "metered",
      "billing",
      "discount",
      "plans",
      "per seat",
      "revenue",
    ],
  },
  {
    id: "dec-hiring-worksample",
    title: "Replace live coding with a paid take-home work sample",
    date: "2024-05-08",
    owner: "Aisha Bello (Head of People)",
    reviewers: ["Marcus Lindqvist (CTO)", "Dana Okafor"],
    audience: "non-technical",
    sourceSystem: "workspace",
    alternatives: [
      "Keep live whiteboard coding",
      "Pair-programming interview",
      "No technical screen",
    ],
    arguments: [
      {
        claim:
          "Take-homes give a stronger, lower-bias signal than whiteboard panic.",
        sources: [
          {
            id: "dec-hiring-worksample-a1-email",
            kind: "email",
            label:
              'From Aisha Bello - "Interview process change - take-home work sample" - 2024-05-08',
            excerpt:
              "Aisha summarized candidate feedback and scorecard variance from the whiteboard process.",
            detail: {
              type: "email",
              from: "Aisha Bello <aisha@northwind.example>",
              to: ["hiring-managers@northwind.example", "Marcus Lindqvist"],
              date: "2024-05-08",
              subject: "Interview process change - take-home work sample",
              quotes: [
                {
                  text: "We're replacing the live whiteboard round with a paid take-home work sample, effective next cycle.",
                },
                {
                  text: "Scorecard variance on the whiteboard round was high and tracked with candidate nerves more than with later on-the-job performance.",
                  decisive: true,
                },
                {
                  text: "The take-home is scoped to two hours and reviewed blind by two engineers.",
                },
              ],
            },
          },
        ],
      },
      {
        claim: "Candidates report a better experience and fewer drop-offs.",
        sources: [
          {
            id: "dec-hiring-worksample-a2-doc",
            kind: "doc",
            label: "Interview rubric v2",
            url: "https://docs.google.com/document/d/1nw-interview-rubric-v2/edit",
            excerpt:
              "The updated rubric compares pass-through rates and candidate comments across interview formats.",
            detail: {
              type: "document",
              title: "Interview rubric v2",
              section: "Format comparison",
              body: "Comparison of the whiteboard round and a piloted take-home across two quarters. The take-home cohort showed higher stage pass-through and noticeably fewer mid-process drop-offs; candidate comments shifted from 'stressful' to 'fair' and 'representative of the work.'",
              decisiveLines: [
                "The take-home cohort showed higher pass-through and fewer mid-process drop-offs.",
              ],
            },
          },
        ],
      },
      {
        claim:
          "We pay for candidates' time to keep the bar fair and respect their effort.",
        sources: [
          {
            id: "dec-hiring-worksample-a3-doc",
            kind: "doc",
            label: "Hiring principles",
            url: "https://docs.google.com/document/d/1nw-hiring-principles/edit",
            excerpt:
              "The principles document says work samples should be compensated when they require meaningful candidate time.",
            detail: {
              type: "document",
              title: "Hiring principles",
              section: "Respect candidate time",
              body: "When an evaluation asks for more than a short exercise, we compensate the candidate for it. A work sample that takes real hours is real work, and paying for it keeps the bar fair to people who can't donate unpaid evenings.",
              decisiveLines: [
                "A work sample that takes real hours is real work, and we compensate it.",
              ],
            },
          },
        ],
      },
    ],
    related: [
      {
        id: "dec-usage-pricing",
        title: "Switch to usage-based pricing for the API tier",
      },
      {
        id: "dec-search-rollback",
        title: "Roll back the Elasticsearch search service to Postgres FTS",
      },
    ],
    timeline: [],
    keywords: [
      "hiring",
      "interview",
      "take home",
      "work sample",
      "whiteboard",
      "recruiting",
      "candidate",
      "people",
    ],
  },
  {
    id: "dec-webhook-outbox",
    title: "Move webhook ingestion to an outbox-backed queue",
    date: "2025-06-11",
    owner: "Tomas Rivera (SRE Lead)",
    reviewers: ["Priya Nadkarni", "Dana Okafor", "Mina Chen (Support Ops)"],
    audience: "technical",
    sourceSystem: "github",
    alternatives: [
      "Keep synchronous webhook handling",
      "Send directly to Kafka",
      "Batch webhooks hourly",
    ],
    arguments: [
      {
        claim:
          "The outbox makes partner callbacks retryable without holding customer-facing writes open.",
        sources: [
          {
            id: "dec-webhook-outbox-a1-adr",
            kind: "adr",
            label: "ADR-0024",
            url: "https://github.com/northwind-logistics/platform/blob/main/docs/adr/0024-webhook-outbox.md",
            excerpt:
              "The ADR chooses the outbox because it keeps writes short while preserving durable callback attempts.",
            detail: {
              type: "document",
              title: "ADR-0024: Webhook outbox",
              status: "Accepted",
              section: "Decision",
              body: "Outbound webhooks will be written to an outbox table inside the same transaction as the shipment change, then drained by background workers. This keeps the customer-facing write short (no waiting on a partner's endpoint) while making each callback durable and retryable. Sending synchronously couples our write latency to partner uptime; sending straight to Kafka loses the transactional guarantee with the source row.",
              decisiveLines: [
                "The customer-facing write stays short and never waits on a partner endpoint.",
                "Each callback becomes durable and retryable via the outbox.",
              ],
            },
          },
          {
            id: "dec-webhook-outbox-a1-pr",
            kind: "pr",
            label: "PR #688",
            url: "https://github.com/northwind-logistics/platform/pull/688",
            excerpt:
              "This PR writes webhook jobs inside the shipment transaction and lets workers drain them after commit.",
            detail: {
              type: "pr",
              repo: "northwind-logistics/platform",
              number: 688,
              state: "merged",
              title: "webhooks: write delivery jobs to outbox inside shipment txn",
              author: "Tomas Rivera",
              summary:
                "Webhook delivery jobs are now inserted into the outbox table within the shipment transaction. A pool of workers drains the outbox after commit and handles retries with backoff, so customer writes no longer block on partner endpoints.",
              comments: [
                {
                  author: "Tomas Rivera",
                  handle: "tomas",
                  body: "Job insert shares the shipment txn, so a job exists if and only if the shipment committed. Workers take it from there.",
                  decisive: true,
                },
                {
                  author: "Priya Nadkarni",
                  handle: "priya",
                  body: "And the write returns as soon as the row commits - no partner round-trip on the hot path. Nice.",
                },
              ],
            },
          },
        ],
      },
      {
        claim:
          "Idempotency keys are stored with each queued event, so duplicate partner retries collapse to one delivery.",
        sources: [
          {
            id: "dec-webhook-outbox-a2-commit",
            kind: "commit",
            label: "7c42b91",
            url: "https://github.com/northwind-logistics/platform/commit/7c42b91c1440",
            excerpt:
              "The commit adds an idempotency key unique index on outbound webhook deliveries.",
            detail: {
              type: "commit",
              repo: "northwind-logistics/platform",
              sha: "7c42b91c1440",
              message:
                "webhooks: add idempotency key unique index on outbound deliveries\n\nEach queued event carries a deterministic idempotency key. A unique index collapses duplicate partner retries to a single stored delivery, so a partner replaying the same callback can't double-fire downstream.",
              author: "Tomas Rivera",
              date: "2025-06-11",
              files: [
                "db/migrations/0078_webhook_idempotency.sql",
                "internal/webhooks/outbox.go",
              ],
            },
          },
        ],
      },
      {
        claim:
          "Support can inspect stuck deliveries in one table instead of correlating app logs and partner tickets.",
        sources: [
          {
            id: "dec-webhook-outbox-a3-slack",
            kind: "slack",
            label: "#support-ops",
            url: "https://northwind-eng.slack.com/archives/C08SUPPORT/p1749562200000000",
            excerpt:
              "Support asked for a single searchable delivery record because partner tickets rarely included request ids.",
            detail: {
              type: "slack",
              channel: "#support-ops",
              messages: [
                {
                  author: "Mina Chen",
                  handle: "mina",
                  time: "Jun 10, 14:02",
                  text: "When a partner says 'we never got the webhook', I'm grepping app logs across three services and they almost never have a request id.",
                  decisive: true,
                },
                {
                  author: "Tomas Rivera",
                  handle: "tomas",
                  time: "Jun 10, 14:09",
                  text: "The outbox fixes that - every delivery is one row with status, attempts, and last error. You'll search one table by shipment id.",
                },
                {
                  author: "Mina Chen",
                  handle: "mina",
                  time: "Jun 10, 14:11",
                  text: "That alone would cut our partner-ticket time in half.",
                },
              ],
            },
          },
        ],
      },
    ],
    related: [
      {
        id: "dec-pg-primary",
        title: "Adopt PostgreSQL as the primary datastore",
      },
      {
        id: "dec-search-rollback",
        title: "Roll back the Elasticsearch search service to Postgres FTS",
      },
    ],
    timeline: [
      {
        date: "2025-08-19",
        title: "Dead-letter review added",
        summary:
          "SRE added a weekly review for webhooks that exceeded the retry budget after two partners changed auth headers without notice.",
        kind: "revisit",
        source: {
          id: "dec-webhook-outbox-t1-pr",
          kind: "pr",
          label: "PR #731",
          url: "https://github.com/northwind-logistics/platform/pull/731",
          excerpt:
            "The job exports dead-lettered webhook deliveries to the support queue every Monday.",
        },
      },
    ],
    keywords: [
      "webhook",
      "webhooks",
      "outbox",
      "queue",
      "retry",
      "idempotency",
      "partners",
      "callbacks",
      "dead letter",
    ],
  },
  {
    id: "dec-refund-manual-review",
    title: "Keep automatic refund approvals off for EU disputes",
    date: "2025-10-02",
    owner: "Owner not recorded",
    reviewers: [],
    audience: "non-technical",
    sourceSystem: "workspace",
    alternatives: [],
    arguments: [
      {
        claim:
          "The team paused auto-approval after support saw duplicate refunds in two EU pilot accounts.",
        sources: [],
      },
      {
        claim:
          "Manual review stays in place until billing can reconcile dispute webhooks within one business day.",
        sources: [
          {
            id: "dec-refund-manual-review-a2-email",
            kind: "email",
            label:
              'From Mina Chen - "EU refund pilot follow-up" - 2025-10-02',
            excerpt:
              "Mina noted that support would keep EU disputes in manual review until webhook reconciliation stopped creating duplicates.",
            detail: {
              type: "email",
              from: "Mina Chen <mina@northwind.example>",
              to: ["billing-ops@northwind.example"],
              date: "2025-10-02",
              subject: "EU refund pilot follow-up",
              quotes: [
                {
                  text: "Support will keep EU disputes in manual review for now.",
                },
                {
                  text: "We saw duplicate refunds in two pilot accounts when dispute webhooks arrived out of order, so auto-approval stays off until billing can reconcile them within one business day.",
                  decisive: true,
                },
              ],
            },
          },
        ],
      },
    ],
    related: [],
    timeline: [],
    gaps: [
      {
        label: "Owner",
        detail:
          "The corpus has the support follow-up, but not the approving owner or meeting notes.",
      },
      {
        label: "Alternatives",
        detail:
          "No rejected options were captured with the email thread, so the card cannot say what else was considered.",
      },
      {
        label: "Primary source",
        detail:
          "The final approval appears to have happened in a private billing channel that is not in the mock corpus.",
      },
    ],
    keywords: [
      "refund",
      "refunds",
      "dispute",
      "disputes",
      "eu",
      "billing",
      "manual review",
      "automatic approval",
      "missing source",
      "sparse record",
    ],
  },
];
