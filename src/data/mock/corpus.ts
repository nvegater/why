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
            kind: "adr",
            label: "ADR-0007",
            url: "https://github.com/northwind-logistics/platform/blob/main/docs/adr/0007-primary-datastore.md",
            excerpt:
              "The core shipment, route, stop, carrier, and customer entities are relational; JSONB is sufficient for webhook payloads.",
          },
          {
            kind: "slack",
            label: "#eng-architecture",
            url: "https://northwind-eng.slack.com/archives/C06ARCH/p1707753120000000",
            excerpt:
              "The architecture thread settled on relational modeling first and JSONB only for sparse webhook blobs.",
          },
        ],
      },
      {
        claim:
          "Managed RDS gives PITR and read replicas out of the box; ops stays low.",
        sources: [
          {
            kind: "doc",
            label: "Datastore eval",
            url: "https://docs.google.com/document/d/1nw-datastore-eval-2024/edit",
            excerpt:
              "The evaluation scored managed Postgres highest on recovery, replicas, and operator familiarity.",
          },
          {
            kind: "pr",
            label: "PR #214",
            url: "https://github.com/northwind-logistics/platform/pull/214",
            excerpt:
              "This PR adds the RDS Postgres module and backup defaults for production.",
          },
        ],
      },
      {
        claim: "Team already knows SQL; migrating off MySQL is mechanical.",
        sources: [
          {
            kind: "email",
            label:
              'From Marcus Lindqvist - "Datastore decision - approved" - 2024-02-12',
            excerpt:
              "Marcus approved the move on the basis that the schema migration was mechanical and the team already had SQL depth.",
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
            kind: "adr",
            label: "ADR-0019",
            url: "https://github.com/northwind-logistics/platform/blob/main/docs/adr/0019-retire-elasticsearch.md",
            excerpt:
              "The ADR records the low query share and high infrastructure spend for Elasticsearch.",
          },
          {
            kind: "doc",
            label: "Search cost doc",
            url: "https://docs.google.com/document/d/1nw-search-cost-2025/edit",
            excerpt:
              "Monthly data-infra allocation put Elasticsearch near 40% of spend despite low traffic share.",
          },
        ],
      },
      {
        claim: "Dual-write to ES was the top source of data-sync incidents.",
        sources: [
          {
            kind: "slack",
            label: "#incidents",
            url: "https://northwind-eng.slack.com/archives/C07INCIDENTS/p1741040160000000",
            excerpt:
              "Incident review pointed to ES dual-write lag as the recurring cause of stale shipment search results.",
          },
          {
            kind: "pr",
            label: "PR #482",
            url: "https://github.com/northwind-logistics/platform/pull/482",
            excerpt:
              "The removal PR deletes ES dual-write paths from shipment and address updates.",
          },
        ],
      },
      {
        claim:
          "Postgres FTS keeps search transactional with source rows, so there is no eventual-consistency window.",
        sources: [
          {
            kind: "commit",
            label: "a1f9c3e",
            url: "https://github.com/northwind-logistics/platform/commit/a1f9c3e8d4b2",
            excerpt:
              "The commit wires shipment search to transactional Postgres full-text indexes.",
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
            kind: "notion",
            label: "Pricing model rework",
            url: "https://www.notion.so/northwind/Pricing-model-rework-9f72a6c2d88d41a7b6ac0de13baf4521",
            excerpt:
              "The memo shows heavy API consumers were underpriced relative to infrastructure and support cost.",
          },
          {
            kind: "doc",
            label: "API metering revenue",
            url: "https://docs.google.com/document/d/1nw-api-metering-revenue/edit",
            excerpt:
              "Revenue modeling found usage-based pricing aligned API volume with expansion revenue.",
          },
        ],
      },
      {
        claim: "Metered entry price removes the number one SMB sales objection.",
        sources: [
          {
            kind: "slack",
            label: "#gtm-pricing",
            url: "https://northwind-eng.slack.com/archives/C09GTMPRICE/p1726599180000000",
            excerpt:
              "Sales notes show small teams objected to paying for unused seats before API traffic ramped.",
          },
          {
            kind: "email",
            label:
              'From Raj Patel - "Pricing change - finance sign-off" - 2024-09-17',
            excerpt:
              "Finance signed off after the floor price and margin guardrail were added.",
          },
        ],
      },
      {
        claim:
          "Metering infra already exists from rate-limiting; billing reads the same counters.",
        sources: [
          {
            kind: "pr",
            label: "PR #321",
            url: "https://github.com/northwind-logistics/platform/pull/321",
            excerpt:
              "The PR exposes rate-limit counters to billing export without a separate metering pipeline.",
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
            kind: "email",
            label:
              'From Aisha Bello - "Interview process change - take-home work sample" - 2024-05-08',
            excerpt:
              "Aisha summarized candidate feedback and scorecard variance from the whiteboard process.",
          },
        ],
      },
      {
        claim: "Candidates report a better experience and fewer drop-offs.",
        sources: [
          {
            kind: "doc",
            label: "Interview rubric v2",
            url: "https://docs.google.com/document/d/1nw-interview-rubric-v2/edit",
            excerpt:
              "The updated rubric compares pass-through rates and candidate comments across interview formats.",
          },
        ],
      },
      {
        claim:
          "We pay for candidates' time to keep the bar fair and respect their effort.",
        sources: [
          {
            kind: "doc",
            label: "Hiring principles",
            url: "https://docs.google.com/document/d/1nw-hiring-principles/edit",
            excerpt:
              "The principles document says work samples should be compensated when they require meaningful candidate time.",
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
];
