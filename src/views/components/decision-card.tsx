import { Tag } from "@alpic-ai/ui/components/tag";
import { TooltipProvider } from "@alpic-ai/ui/components/tooltip";
import type { DecisionCard as DecisionCardPayload } from "@/data/types.js";
import RelatedChips from "@/views/components/related-chips.js";
import SourceLink from "@/views/components/source-link.js";

function llmSummary(decision: DecisionCardPayload): string {
  const alternatives =
    decision.alternatives.length > 0
      ? `Losing alternatives: ${decision.alternatives.join(", ")}.`
      : "No losing alternatives were recorded.";
  const argumentsSummary =
    decision.arguments.length > 0
      ? `Winning arguments: ${decision.arguments.map((argument) => argument.claim).join(" ")}`
      : "No winning arguments were recorded.";
  const gaps =
    decision.gaps.length > 0
      ? `Known information gaps: ${decision.gaps.map((gap) => `${gap.label}: ${gap.detail}`).join(" ")}`
      : "No known information gaps.";

  return [
    `Decision: ${decision.title}.`,
    `Made on ${decision.date} by ${decision.owner}.`,
    alternatives,
    argumentsSummary,
    gaps,
    `There are ${decision.laterEventCount} later events that may have revised this.`,
  ].join(" ");
}

export default function DecisionCard({
  decision,
}: {
  decision: DecisionCardPayload;
}) {
  return (
    <TooltipProvider>
      <article className="space-y-4" data-llm={llmSummary(decision)}>
        <header className="space-y-1">
          <h2 className="type-display-xs font-semibold tracking-normal text-foreground">
            {decision.title}
          </h2>
          <p className="type-text-xs text-muted-foreground">
            {decision.date} - {decision.owner}
          </p>
        </header>

        <section className="space-y-2">
          <h3 className="type-text-sm font-semibold text-foreground">
            Considered
          </h3>
          {decision.alternatives.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {decision.alternatives.map((alternative) => (
                <Tag key={alternative}>{alternative}</Tag>
              ))}
            </div>
          ) : (
            <p
              className="type-text-sm leading-6 text-muted-foreground"
              data-llm="No losing alternatives were recorded for this decision."
            >
              No alternatives recorded in this corpus.
            </p>
          )}
        </section>

        <section className="space-y-2">
          <h3 className="type-text-sm font-semibold text-foreground">
            Why this won
          </h3>
          {decision.arguments.length > 0 ? (
            <ol className="space-y-3">
              {decision.arguments.map((argument) => (
                <li
                  key={argument.claim}
                  className="grid grid-cols-[0.75rem_1fr] gap-2"
                >
                  <span
                    className="mt-2 size-1.5 rounded-full bg-primary"
                    aria-hidden
                  />
                  <div className="min-w-0 space-y-2">
                    <p className="type-text-sm leading-6 text-foreground">
                      {argument.claim}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {argument.sources.length > 0 ? (
                        argument.sources.map((source) => (
                          <SourceLink
                            key={`${source.kind}-${source.label}`}
                            source={source}
                          />
                        ))
                      ) : (
                        <Tag data-llm="No source was recorded for this argument.">
                          Source not recorded
                        </Tag>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p
              className="type-text-sm leading-6 text-muted-foreground"
              data-llm="No winning arguments were recorded for this decision."
            >
              No winning arguments recorded in this corpus.
            </p>
          )}
        </section>

        {decision.gaps.length > 0 ? (
          <section className="space-y-2 border-t border-border pt-3">
            <h3 className="type-text-sm font-semibold text-foreground">
              Information gaps
            </h3>
            <ul
              className="space-y-2"
              data-llm={`Known information gaps: ${decision.gaps
                .map((gap) => `${gap.label}: ${gap.detail}`)
                .join(" ")}`}
            >
              {decision.gaps.map((gap) => (
                <li
                  key={gap.label}
                  className="grid grid-cols-[0.75rem_1fr] gap-2"
                >
                  <span
                    className="mt-2 size-1 rounded-full bg-muted-foreground"
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <p className="type-text-sm font-semibold text-foreground">
                      {gap.label}
                    </p>
                    <p className="type-text-sm leading-6 text-muted-foreground">
                      {gap.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {decision.related.length === 0 && decision.gaps.length > 0 ? (
          <section className="space-y-2 border-t border-border pt-3">
            <h3 className="type-text-sm font-semibold text-foreground">
              Related
            </h3>
            <p
              className="type-text-sm leading-6 text-muted-foreground"
              data-llm="No related decisions were recorded for this incomplete card."
            >
              No related decisions recorded.
            </p>
          </section>
        ) : null}

        {decision.related.length > 0 ? (
          <section className="space-y-2">
            <h3 className="type-text-sm font-semibold text-foreground">
              Related
            </h3>
            <RelatedChips related={decision.related} />
          </section>
        ) : null}
      </article>
    </TooltipProvider>
  );
}
