import type { Decision } from "@/data/types.js";
import type { DecisionMatch, DecisionStore } from "@/data/store.js";
import { DECISIONS } from "@/data/mock/corpus.js";

const DEFAULT_SEARCH_LATENCY_MS = 650;

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

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function tokenize(query: string): string[] {
  return normalize(query)
    .split(/\s+/)
    .filter((term) => term.length > 2 && !STOP_WORDS.has(term));
}

function fieldIncludes(field: string, term: string): boolean {
  return ` ${field} `.includes(` ${term} `) || field.includes(term);
}

function scoreDecision(decision: Decision, query: string, terms: string[]): number {
  const normalizedQuery = normalize(query);
  const normalizedId = normalize(decision.id);
  let score = normalizedQuery.includes(normalizedId) ? 12 : 0;

  const titleText = normalize(decision.title);
  const primaryText = normalize([decision.title, ...decision.keywords].join(" "));
  const evidenceText = normalize([
    ...decision.alternatives,
    ...decision.arguments.map((argument) => argument.claim),
  ].join(" "));

  if (titleText && normalizedQuery.includes(titleText)) {
    score += 4;
  }

  for (const term of terms) {
    if (fieldIncludes(primaryText, term)) {
      score += 2;
    }

    if (fieldIncludes(evidenceText, term)) {
      score += 1;
    }
  }

  return score;
}

async function wait(ms: number): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export class MockDecisionStore implements DecisionStore {
  constructor(private readonly searchLatencyMs = DEFAULT_SEARCH_LATENCY_MS) {}

  async search(query: string): Promise<DecisionMatch[]> {
    await wait(this.searchLatencyMs);

    const terms = tokenize(query);

    return DECISIONS.map((decision) => ({
      decision,
      score: scoreDecision(decision, query, terms),
    }))
      .filter((match) => match.score >= 2)
      .sort((a, b) => b.score - a.score || a.decision.date.localeCompare(b.decision.date));
  }

  async getById(id: string): Promise<Decision | null> {
    return DECISIONS.find((decision) => decision.id === id) ?? null;
  }
}
