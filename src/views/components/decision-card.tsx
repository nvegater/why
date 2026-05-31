import { Tag } from "@alpic-ai/ui/components/tag";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@alpic-ai/ui/components/tooltip";
import type { DecisionCard as DecisionCardPayload } from "@/data/types.js";
import RelatedChips from "@/views/components/related-chips.js";
import SourceCitation from "@/views/components/source-citation.js";

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

function parseDecisionMoment(value?: string): Date | null {
  if (!value) return null;

  if (DATE_ONLY.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function hasTime(value?: string): boolean {
  return Boolean(value && /\dT\d{2}:\d{2}/.test(value));
}

function formatMomentLabel(value?: string): string {
  const date = parseDecisionMoment(value);
  if (!date) return "No date";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatMomentExact(value?: string): string {
  const date = parseDecisionMoment(value);
  if (!date) return "Exact date not recorded";

  const day = new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);

  if (!hasTime(value)) return `Recorded ${day}`;

  const time = new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

  return `Recorded ${day} at ${time}`;
}

function llmSummary(decision: DecisionCardPayload): string {
  const alternatives =
    decision.alternatives.length > 0
      ? `Losing alternatives: ${decision.alternatives.join(", ")}.`
      : "No losing alternatives were recorded.";
  const argumentsSummary =
    decision.arguments.length > 0
      ? `Winning arguments timeline: ${decision.arguments
          .map((argument) => `${formatMomentExact(argument.decidedAt ?? decision.date)}: ${argument.claim}`)
          .join(" ")}`
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

function DecisionMoment({ value }: { value?: string }) {
  const exact = formatMomentExact(value);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <time
          dateTime={value}
          tabIndex={0}
          aria-label={exact}
          className="inline-flex h-6 max-w-full items-center justify-center whitespace-nowrap rounded-md border border-subtle bg-foreground/[0.03] px-2 type-text-xs font-medium leading-none tabular-nums text-muted-foreground outline-none transition-colors duration-150 ease-out hover:bg-background-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {formatMomentLabel(value)}
        </time>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[16rem] font-medium">
        {exact}
      </TooltipContent>
    </Tooltip>
  );
}

export default function DecisionCard({
  decision,
  onOpenSource,
  onOpenRelated,
  pendingRelatedId,
}: {
  decision: DecisionCardPayload;
  onOpenSource: (id: string) => void;
  onOpenRelated: (id: string) => void;
  pendingRelatedId: string | null;
}) {
  return (
    <article className="space-y-5" data-llm={llmSummary(decision)}>
      <header className="space-y-1.5 pr-9">
        <h2 className="type-display-xs font-semibold tracking-normal text-balance text-foreground">
          {decision.title}
        </h2>
        <p className="type-text-xs text-muted-foreground">
          {decision.date} &middot; {decision.owner}
        </p>
      </header>

      <section className="space-y-2.5">
        <h3 className="type-text-sm font-semibold text-foreground">Considered</h3>
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

      <section className="space-y-2.5">
        <h3 className="type-text-sm font-semibold text-foreground">Why this won</h3>
        {decision.arguments.length > 0 ? (
          <ol>
            {decision.arguments.map((argument, index) => {
              const isLast = index === decision.arguments.length - 1;
              const decidedAt = argument.decidedAt ?? decision.date;

              return (
                <li
                  key={argument.claim}
                  className="grid grid-cols-[4.25rem_0.875rem_minmax(0,1fr)] gap-x-3 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:fill-mode-both motion-safe:duration-500 motion-safe:ease-out sm:grid-cols-[5rem_0.875rem_minmax(0,1fr)]"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="flex justify-end pt-[3px]">
                    <DecisionMoment value={decidedAt} />
                  </div>

                  {/* the winning-argument thread — magenta dot nodes on a quiet rail */}
                  <div
                    className="flex w-3.5 shrink-0 flex-col items-center"
                    aria-hidden
                  >
                    <span className="mt-[9px] size-2 rounded-full bg-primary" />
                    {!isLast ? (
                      <span className="mt-1.5 w-px flex-1 bg-foreground/20" />
                    ) : null}
                  </div>

                  <div
                    className={`min-w-0 flex-1 space-y-2.5 ${isLast ? "pb-0" : "pb-5"}`}
                  >
                    <p className="type-text-sm leading-6 text-foreground">
                      {argument.claim}
                    </p>
                    <div className="flex flex-col items-start gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-2">
                      {argument.sources.length > 0 ? (
                        argument.sources.map((source) => (
                          <SourceCitation
                            key={source.id}
                            source={source}
                            onOpenSource={onOpenSource}
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
              );
            })}
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
        <section className="space-y-2.5 border-t border-subtle pt-4">
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
              <li key={gap.label} className="flex gap-3">
                <span
                  className="mt-[9px] size-1 shrink-0 rounded-full bg-muted-foreground"
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
        <section className="space-y-2.5 border-t border-subtle pt-4">
          <h3 className="type-text-sm font-semibold text-foreground">Related</h3>
          <p
            className="type-text-sm leading-6 text-muted-foreground"
            data-llm="No related decisions were recorded for this incomplete card."
          >
            No related decisions recorded.
          </p>
        </section>
      ) : null}

      {decision.related.length > 0 ? (
        <section className="space-y-2.5">
          <h3 className="type-text-sm font-semibold text-foreground">Related</h3>
          <RelatedChips
            related={decision.related}
            onOpen={onOpenRelated}
            pendingId={pendingRelatedId}
          />
        </section>
      ) : null}
    </article>
  );
}
