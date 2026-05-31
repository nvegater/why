import { McpServer } from "skybridge/server";
import { z } from "zod";
import { CONNECTORS } from "./data/connectors.js";
import {
  collectSourceDetails,
  getStore,
  toCard,
  toListItem,
} from "./data/store.js";

const DATE_FILTER_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DATE_FILTER_SCHEMA = z
  .string()
  .regex(DATE_FILTER_PATTERN, "Use YYYY-MM-DD.");
const RELATIVE_RANGE_VALUES = [
  "last-7-days",
  "this-week",
  "last-week",
  "this-month",
  "last-month",
  "this-year",
  "last-year",
] as const;
type RelativeRange = (typeof RELATIVE_RANGE_VALUES)[number];
const DEFAULT_DECISION_LIST_RANGE: RelativeRange = "last-week";

const MIN_SIGNAL_TERMS = 2;
const STOP_WORDS = new Set([
  "about",
  "after",
  "since",
  "that",
  "this",
  "what",
  "when",
  "where",
  "which",
  "while",
  "why",
  "with",
  "decide",
  "decided",
  "decision",
  "choose",
  "chose",
  "pick",
  "picked",
  "because",
  "our",
  "the",
  "and",
  "for",
  "did",
]);
const SOURCE_REDIRECT_DOMAINS = [
  "https://github.com",
  "https://northwind-eng.slack.com",
  "https://www.notion.so",
  "https://docs.google.com",
];

function signalTerms(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((term) => term.length > 2 && !STOP_WORDS.has(term));
}

function parseIsoDate(value?: string): Date | null {
  if (!value || !DATE_FILTER_PATTERN.test(value)) return null;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  date.setHours(0, 0, 0, 0);
  return date;
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  next.setHours(0, 0, 0, 0);
  return next;
}

function startOfIsoWeek(date: Date): Date {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(date, diff);
}

function formatDateLabel(value: string): string {
  const date = parseIsoDate(value);
  if (!date) return value;

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function dateRangeLabel(from: string | null, to: string | null): string {
  if (from && to) return `${formatDateLabel(from)} to ${formatDateLabel(to)}`;
  if (from) return `since ${formatDateLabel(from)}`;
  if (to) return `through ${formatDateLabel(to)}`;
  return "All recorded dates";
}

function resolveRelativeRange(relativeRange: RelativeRange) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (relativeRange === "last-7-days") {
    const from = toIsoDate(addDays(today, -6));
    const to = toIsoDate(today);
    return {
      from,
      to,
      label: `Last 7 days (${dateRangeLabel(from, to)})`,
      isFiltered: true,
    };
  }

  if (relativeRange === "this-week") {
    const from = toIsoDate(startOfIsoWeek(today));
    const to = toIsoDate(today);
    return {
      from,
      to,
      label: `This week (${dateRangeLabel(from, to)})`,
      isFiltered: true,
    };
  }

  if (relativeRange === "last-week") {
    const thisWeekStart = startOfIsoWeek(today);
    const from = toIsoDate(addDays(thisWeekStart, -7));
    const to = toIsoDate(addDays(thisWeekStart, -1));
    return {
      from,
      to,
      label: `Last week (${dateRangeLabel(from, to)})`,
      isFiltered: true,
    };
  }

  if (relativeRange === "this-month") {
    const from = toIsoDate(new Date(today.getFullYear(), today.getMonth(), 1));
    const to = toIsoDate(today);
    return {
      from,
      to,
      label: `This month (${dateRangeLabel(from, to)})`,
      isFiltered: true,
    };
  }

  if (relativeRange === "last-month") {
    const from = toIsoDate(new Date(today.getFullYear(), today.getMonth() - 1, 1));
    const to = toIsoDate(new Date(today.getFullYear(), today.getMonth(), 0));
    return {
      from,
      to,
      label: `Last month (${dateRangeLabel(from, to)})`,
      isFiltered: true,
    };
  }

  if (relativeRange === "this-year") {
    const from = toIsoDate(new Date(today.getFullYear(), 0, 1));
    const to = toIsoDate(today);
    return {
      from,
      to,
      label: `This year (${dateRangeLabel(from, to)})`,
      isFiltered: true,
    };
  }

  const from = toIsoDate(new Date(today.getFullYear() - 1, 0, 1));
  const to = toIsoDate(new Date(today.getFullYear() - 1, 11, 31));
  return {
    from,
    to,
    label: `Last year (${dateRangeLabel(from, to)})`,
    isFiltered: true,
  };
}

function resolveDateRange({
  from,
  to,
  relativeRange,
}: {
  from?: string;
  to?: string;
  relativeRange?: RelativeRange;
}) {
  if (from || to) {
    let normalizedFrom = from && parseIsoDate(from) ? from : null;
    let normalizedTo = to && parseIsoDate(to) ? to : null;

    if (normalizedFrom && normalizedTo && normalizedFrom > normalizedTo) {
      [normalizedFrom, normalizedTo] = [normalizedTo, normalizedFrom];
    }

    return {
      from: normalizedFrom,
      to: normalizedTo,
      label: dateRangeLabel(normalizedFrom, normalizedTo),
      isFiltered: Boolean(normalizedFrom || normalizedTo),
    };
  }

  if (relativeRange) {
    return resolveRelativeRange(relativeRange);
  }

  return resolveRelativeRange(DEFAULT_DECISION_LIST_RANGE);
}

const server = new McpServer(
  {
    name: "why",
    version: "0.0.1",
  },
  { capabilities: {} },
)
  .registerTool(
    {
      name: "list-decisions",
      description:
        "List the recorded decisions in the corpus, filtered by decision date. Use when the user asks to show, list, browse, or see available decisions, including date-scoped requests like 'show me decisions from last week'. Defaults to last-week when no date filter is supplied.",
      inputSchema: {
        from: DATE_FILTER_SCHEMA.optional().describe(
          "Inclusive start date in YYYY-MM-DD. Prefer explicit dates when the user's time filter can be resolved.",
        ),
        to: DATE_FILTER_SCHEMA.optional().describe(
          "Inclusive end date in YYYY-MM-DD. Prefer explicit dates when the user's time filter can be resolved.",
        ),
        relativeRange: z
          .enum(RELATIVE_RANGE_VALUES)
          .default(DEFAULT_DECISION_LIST_RANGE)
          .describe(
            "Use only when explicit dates are unavailable. Defaults to 'last-week', meaning the previous ISO calendar week, Monday through Sunday.",
          ),
      },
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
      view: {
        component: "list-decisions",
        description: "Decision list",
        csp: {
          redirectDomains: SOURCE_REDIRECT_DOMAINS,
        },
      },
    },
    async ({ from, to, relativeRange }) => {
      const range = resolveDateRange({ from, to, relativeRange });
      const decisions = (await getStore().list())
        .filter((decision) => {
          if (range.from && decision.date < range.from) return false;
          if (range.to && decision.date > range.to) return false;
          return true;
        })
        .sort((a, b) => b.date.localeCompare(a.date));
      const items = decisions.map(toListItem);
      const rangeText = range.isFiltered ? ` in ${range.label}` : "";

      return {
        structuredContent: { decisions: items, range },
        content: [
          {
            type: "text",
            text:
              items.length > 0
                ? `Found ${items.length} recorded decision${items.length === 1 ? "" : "s"}${rangeText}. Show the list as the primary answer. The view includes only minimal source availability for each decision; call find-decision if the user asks to inspect one decision's reasoning.`
                : `No recorded decisions were found${rangeText}. Tell the user the date filter matched no decisions in this corpus, and offer to show all recorded decisions.`,
          },
        ],
        isError: false,
      };
    },
  )
  .registerTool(
    {
      name: "find-decision",
      description:
        "Look up a past engineering or org decision and return a Decision Card: who decided, when, which alternatives lost, and the 2-3 reasons that won, each linked to its source. Use when the user asks why a decision was made.",
      inputSchema: {
        query: z
          .string()
          .min(1)
          .describe(
            "Natural-language description of the decision, e.g. 'why did we choose our database' or 'our refund policy'.",
          ),
      },
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
      view: {
        component: "find-decision",
        description: "Decision Card",
        csp: {
          redirectDomains: SOURCE_REDIRECT_DOMAINS,
        },
      },
    },
    async ({ query }) => {
      const matches = await getStore().search(query);
      const top = matches[0]?.decision ?? null;

      if (!top) {
        const isTooBroad = signalTerms(query).length < MIN_SIGNAL_TERMS;

        return {
          structuredContent: { decision: null, query },
          content: [
            {
              type: "text",
              text: isTooBroad
                ? `The query "${query}" is too broad for the mock corpus. Ask for a more specific product area, system, policy, owner, or source term before trying again.`
                : `No matching decision was found for "${query}". Ask a clarifying question before trying again.`,
            },
          ],
          isError: false,
        };
      }

      const decision = toCard(top);
      const sourceDetails = collectSourceDetails(top);
      const maybeAlsoMatched =
        matches[1] && matches[1].score >= matches[0].score - 1
          ? ` Another decision also matched: ${matches[1].decision.title}. Ask a clarifying question if the user's intent is ambiguous.`
          : "";
      const timelineGuidance =
        decision.laterEventCount > 0
          ? ` Offer to answer "What changed since?" and, if the user asks, call get-decision-changes with decisionId ${decision.id}.`
          : ` This decision has no later events in the corpus; if the user asks what changed since, call get-decision-changes with decisionId ${decision.id} and say it still stands.`;
      const gapGuidance =
        decision.gaps.length > 0
          ? ` This card has known information gaps: ${decision.gaps.map((gap) => `${gap.label}: ${gap.detail}`).join(" ")} Do not infer missing details.`
          : "";

      return {
        structuredContent: { decision, query },
        content: [
          {
            type: "text",
            text: `Found decision "${decision.title}" from ${decision.date}, owned by ${decision.owner}. Explain the decision in prose around the card, citing the winning arguments shown in the card. Each source on the card is an openable widget that holds the underlying Slack thread, email, or PR discussion; that evidence is not in your context, so do not invent or restate it — point the user to open a source to see it.${timelineGuidance}${gapGuidance}${maybeAlsoMatched}`,
          },
        ],
        isError: false,
        _meta: { sourceDetails },
      };
    },
  )
  .registerTool(
    {
      name: "get-decision-changes",
      description:
        "Return the chronological later events that revisited, reversed, or partially reversed a past decision. An empty timeline is a valid answer because the decision still stands.",
      inputSchema: {
        decisionId: z
          .string()
          .optional()
          .describe("Prefer this when following up on a decision already shown."),
        query: z
          .string()
          .optional()
          .describe("Use when no decision has been shown yet; resolves by keyword search."),
      },
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
    },
    async ({ decisionId, query }) => {
      const store = getStore();
      const byId = decisionId ? await store.getById(decisionId) : null;
      const byQuery =
        !byId && query ? (await store.search(query))[0]?.decision ?? null : null;
      const decision = byId ?? byQuery;

      if (!decision) {
        return {
          structuredContent: {
            decisionId: decisionId ?? null,
            decisionTitle: null,
            events: [],
          },
          content: [
            {
              type: "text",
              text: "Could not resolve a decision. Ask which decision the user means, then call get-decision-changes with a decisionId or clearer query.",
            },
          ],
          isError: false,
        };
      }

      const events = [...decision.timeline].sort((a, b) =>
        a.date.localeCompare(b.date),
      );
      const eventLines = events.map((event) => {
        const source = event.source?.url
          ? ` [${event.source.label}](${event.source.url})`
          : event.source
            ? ` ${event.source.label}`
            : "";

        return `- ${event.date}: ${event.title} (${event.kind}). ${event.summary}${source}`;
      });

      return {
        structuredContent: {
          decisionId: decision.id,
          decisionTitle: decision.title,
          events,
        },
        content: [
          {
            type: "text",
            text:
              events.length === 0
                ? `No later events were found for "${decision.title}". Tell the user the decision still stands in this corpus.`
                : `Later events for "${decision.title}" are below. Render them as a chronological prose timeline, oldest first, and include each source as a markdown link when a URL is present.\n${eventLines.join("\n")}`,
          },
        ],
        isError: false,
      };
    },
  )
  .registerTool(
    {
      name: "connect-sources",
      description:
        "Open the source-setup screen so the user can pick which data sources (Slack, Gmail, Notion, GitHub) Y should read, then authorize them one by one. Use on first run before answering decision questions, or whenever the user wants to connect or manage their sources.",
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
      view: {
        component: "connect-sources",
        description: "Connect sources",
        csp: {
          redirectDomains: [
            "https://slack.com",
            "https://accounts.google.com",
            "https://www.notion.so",
            "https://github.com",
          ],
        },
      },
    },
    async () => {
      const connectors = CONNECTORS.map(({ id, name, blurb }) => ({
        id,
        name,
        blurb,
      }));

      return {
        structuredContent: { connectors },
        content: [
          {
            type: "text",
            text: `Opened the connector setup screen. Available sources: ${connectors
              .map((c) => c.name)
              .join(
                ", ",
              )}. The user picks sources in a grid, then authorizes each one (the provider's sign-in tab opens and the connection is confirmed in-app). Let the user drive the selection and authorization; do not assume a source is connected until they complete it. Once setup is done, answer decision questions against the connected sources.`,
          },
        ],
        isError: false,
      };
    },
  );

if (process.env.NODE_ENV === "production") {
  const { default: manifest } = await import("./vite-manifest.js");
  server.setViteManifest(manifest);
}

export default await server.run();

export type AppType = typeof server;
