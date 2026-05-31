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

function signalTermCount(query?: string): number {
  if (!query) {
    return 0;
  }

  return query
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((term) => term.length > 2 && !STOP_WORDS.has(term)).length;
}

export default function DecisionEmpty({ query }: { query?: string }) {
  const isTooBroad = signalTermCount(query) < 2;
  const title = isTooBroad
    ? "Need a more specific decision."
    : "No decision found for that question.";
  const description = isTooBroad
    ? "The corpus needs at least one concrete product area, system, policy, owner, or source term."
    : "Y did not find a matching record in the decision corpus.";

  return (
    <div
      className="space-y-3"
      data-llm={
        isTooBroad
          ? `The query${query ? ` "${query}"` : ""} is too broad. Ask for a more specific decision before trying again.`
          : `No decision was found for the query "${query}". Ask a clarifying question before trying again.`
      }
    >
      <h2 className="type-text-lg font-semibold text-foreground">
        {title}
      </h2>
      <p className="type-text-sm text-muted-foreground">
        {description}
      </p>
      <ul className="space-y-1 type-text-sm leading-6 text-muted-foreground">
        <li>Try a system name, such as Postgres, Elasticsearch, or webhooks.</li>
        <li>Try a policy area, such as pricing, hiring, or refunds.</li>
      </ul>
    </div>
  );
}
