export default function DecisionEmpty({ query }: { query?: string }) {
  return (
    <div
      className="space-y-2"
      data-llm={`No decision was found for the query${
        query ? ` "${query}"` : ""
      }. Ask a clarifying question before trying again.`}
    >
      <h2 className="type-text-lg font-semibold text-foreground">
        No decision found for that question.
      </h2>
      <p className="type-text-sm text-muted-foreground">
        Y did not find a matching record in the decision corpus.
      </p>
    </div>
  );
}
