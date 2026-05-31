import { MockDecisionStore } from "./mock/mock-store.js";
import type {
  Decision,
  DecisionCard,
  DecisionListItem,
  SourceDetail,
  SourceKind,
} from "./types.js";

export interface DecisionMatch {
  decision: Decision;
  score: number;
}

export interface DecisionStore {
  search(query: string): Promise<DecisionMatch[]>;
  getById(id: string): Promise<Decision | null>;
  list(): Promise<Decision[]>;
}

const SOURCE_KIND_ORDER: SourceKind[] = [
  "adr",
  "slack",
  "pr",
  "commit",
  "doc",
  "notion",
  "email",
];

/**
 * Project a Decision into the model-facing card. Source `detail` is stripped
 * here so structuredContent stays thin — the model sees enough to narrate and
 * reference a source, but not its full thread/email/PR contents (those go to
 * `_meta` via collectSourceDetails and reach the view only).
 */
export function toCard(decision: Decision): DecisionCard {
  const { gaps = [], keywords, timeline, ...rest } = decision;
  void keywords;

  return {
    ...rest,
    arguments: rest.arguments.map((argument) => ({
      ...argument,
      sources: argument.sources.map(({ detail, ...source }) => {
        void detail;
        return source;
      }),
    })),
    gaps,
    laterEventCount: timeline.length,
  };
}

export function toListItem(decision: Decision): DecisionListItem {
  const counts = new Map<SourceKind, number>();
  const seen = new Set<string>();

  for (const argument of decision.arguments) {
    for (const source of argument.sources) {
      if (seen.has(source.id)) continue;

      seen.add(source.id);
      counts.set(source.kind, (counts.get(source.kind) ?? 0) + 1);
    }
  }

  return {
    id: decision.id,
    title: decision.title,
    date: decision.date,
    owner: decision.owner,
    sourceAvailability: SOURCE_KIND_ORDER.flatMap((kind) => {
      const count = counts.get(kind);
      return count ? [{ kind, count }] : [];
    }),
    sourceCount: seen.size,
    laterEventCount: decision.timeline.length,
  };
}

/**
 * Collect every source's rich detail keyed by source id, for the tool's
 * `_meta` payload. `_meta` is delivered to the view (as responseMetadata) and
 * never to the model, so the source widgets get full content while prose stays
 * lean. Sources without detail are omitted.
 */
export function collectSourceDetails(
  decision: Decision,
): Record<string, SourceDetail> {
  const details: Record<string, SourceDetail> = {};

  for (const argument of decision.arguments) {
    for (const source of argument.sources) {
      if (source.detail) {
        details[source.id] = source.detail;
      }
    }
  }

  return details;
}

let instance: DecisionStore | null = null;

export function getStore(): DecisionStore {
  return (instance ??= new MockDecisionStore());
}
