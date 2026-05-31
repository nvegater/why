import { McpServer } from "skybridge/server";
import { z } from "zod";
import { CONNECTORS } from "./data/connectors.js";
import { collectSourceDetails, getStore, toCard } from "./data/store.js";

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

function signalTerms(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((term) => term.length > 2 && !STOP_WORDS.has(term));
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
          redirectDomains: [
            "https://github.com",
            "https://northwind-eng.slack.com",
            "https://www.notion.so",
            "https://docs.google.com",
          ],
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
