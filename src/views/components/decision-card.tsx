import { Tag } from "@alpic-ai/ui/components/tag";
import { TooltipProvider } from "@alpic-ai/ui/components/tooltip";
import { GitBranch, Users } from "lucide-react";
import type { DecisionCard as DecisionCardPayload } from "@/data/types.js";
import RelatedChips from "@/views/components/related-chips.js";
import SourceLink from "@/views/components/source-link.js";

function sourceSystemLabel(sourceSystem: DecisionCardPayload["sourceSystem"]): string {
  return sourceSystem === "github" ? "GitHub" : "Workspace";
}

function reviewedBy(reviewers: string[]): string {
  const visible = reviewers.slice(0, 2).join(", ");
  const remaining = reviewers.length - 2;

  return remaining > 0 ? `${visible} +${remaining}` : visible;
}

function llmSummary(decision: DecisionCardPayload): string {
  return [
    `Decision: ${decision.title}.`,
    `Made on ${decision.date} by ${decision.owner}.`,
    `Reviewed by ${decision.reviewers.join(", ")}.`,
    `Losing alternatives: ${decision.alternatives.join(", ")}.`,
    `Winning arguments: ${decision.arguments.map((argument) => argument.claim).join(" ")}`,
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
        <header className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Tag
              icon={<GitBranch className="size-3.5" aria-hidden />}
              className="shrink-0"
            >
              {sourceSystemLabel(decision.sourceSystem)}
            </Tag>
            <span className="type-text-xs text-muted-foreground">
              {decision.date} - {decision.owner}
            </span>
          </div>
          <div className="space-y-1">
            <h2 className="type-display-xs font-semibold tracking-normal text-foreground">
              {decision.title}
            </h2>
            <p className="flex items-center gap-1.5 type-text-sm text-muted-foreground">
              <Users className="size-3.5 shrink-0" aria-hidden />
              <span>Reviewed by {reviewedBy(decision.reviewers)}</span>
            </p>
          </div>
        </header>

        <section className="space-y-2">
          <h3 className="type-text-sm font-semibold text-foreground">
            Considered
          </h3>
          <div className="flex flex-wrap gap-2">
            {decision.alternatives.map((alternative) => (
              <Tag key={alternative}>{alternative}</Tag>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="type-text-sm font-semibold text-foreground">
            Why this won
          </h3>
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
                    {argument.sources.map((source) => (
                      <SourceLink
                        key={`${source.kind}-${source.label}`}
                        source={source}
                      />
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

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
