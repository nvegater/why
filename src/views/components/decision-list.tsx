import { ChevronRight, LoaderCircle } from "lucide-react";
import type {
  DecisionListItem,
  SourceAvailability,
  SourceKind,
} from "@/data/types.js";
import { SOURCE_BRAND } from "@/views/components/brand-marks.js";

type RangeInfo = {
  label: string;
  isFiltered: boolean;
};

const SOURCE_LABELS: Record<SourceKind, { label: string; short: string }> = {
  adr: { label: "ADR", short: "ADR" },
  pr: { label: "Pull request", short: "PR" },
  commit: { label: "Commit", short: "Commit" },
  slack: { label: "Slack", short: "Slack" },
  email: { label: "Email", short: "Email" },
  notion: { label: "Notion", short: "Notion" },
  doc: { label: "Document", short: "Doc" },
};

function parseDate(value: string): Date | null {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function formatDecisionDate(value: string): string {
  const date = parseDate(value);
  if (!date) return value;

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatSources(sources: SourceAvailability[]): string {
  if (sources.length === 0) return "No sources recorded";

  return sources
    .map(({ kind, count }) => {
      const label = SOURCE_LABELS[kind].label;
      return count > 1 ? `${label} x${count}` : label;
    })
    .join(", ");
}

function listSummary(decisions: DecisionListItem[], range: RangeInfo): string {
  if (decisions.length === 0) {
    return `No recorded decisions matched ${range.label}.`;
  }

  return [
    `Decision list filtered to ${range.label}.`,
    ...decisions.map(
      (decision) =>
        `${decision.title}; made ${decision.date} by ${decision.owner}; sources available: ${formatSources(decision.sourceAvailability)}.`,
    ),
  ].join(" ");
}

function SourceFootprint({ sources }: { sources: SourceAvailability[] }) {
  const summary = formatSources(sources);

  return (
    <span
      className="flex flex-wrap justify-start gap-1.5 sm:max-w-[19rem] sm:justify-end"
      aria-label={`Sources available: ${summary}`}
      title={summary}
    >
      {sources.length > 0 ? (
        sources.map(({ kind, count }) => {
          const { Logo, accent } = SOURCE_BRAND[kind];
          const label = SOURCE_LABELS[kind];

          return (
            <span
              key={kind}
              className={`inline-flex h-7 items-center gap-1 rounded-md px-1.5 type-text-xs font-medium text-muted-foreground ring-1 ring-inset transition-colors duration-150 ease-out ${
                accent
                  ? ""
                  : "bg-foreground/[0.04] ring-foreground/[0.05] group-hover:bg-foreground/[0.07]"
              }`}
              style={
                accent
                  ? {
                      backgroundColor: `color-mix(in oklab, ${accent} 8%, transparent)`,
                      boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${accent} 18%, transparent)`,
                    }
                  : undefined
              }
            >
              <Logo className="size-3.5 shrink-0 opacity-80" />
              <span>{label.short}</span>
              {count > 1 ? (
                <span className="tabular-nums text-subtle-foreground">
                  {count}
                </span>
              ) : null}
            </span>
          );
        })
      ) : (
        <span className="inline-flex h-7 items-center rounded-md bg-foreground/[0.04] px-2 type-text-xs font-medium text-muted-foreground ring-1 ring-inset ring-foreground/[0.05]">
          No sources
        </span>
      )}
    </span>
  );
}

function EmptyList({ range }: { range: RangeInfo }) {
  return (
    <section
      className="space-y-2 pr-9"
      data-llm={`No recorded decisions matched ${range.label}.`}
    >
      <h2 className="type-display-xs font-semibold tracking-normal text-foreground">
        No decisions in this range.
      </h2>
      <p className="type-text-sm leading-6 text-muted-foreground">
        {range.label}
      </p>
    </section>
  );
}

export default function DecisionList({
  decisions,
  range,
  pendingDecisionId,
  onOpenDecision,
}: {
  decisions: DecisionListItem[];
  range: RangeInfo;
  pendingDecisionId: string | null;
  onOpenDecision: (id: string) => void;
}) {
  if (decisions.length === 0) {
    return <EmptyList range={range} />;
  }

  return (
    <section
      className="space-y-5"
      data-llm={listSummary(decisions, range)}
    >
      <header className="space-y-1 pr-9">
        <h2 className="type-display-xs font-semibold tracking-normal text-foreground">
          Recorded decisions
        </h2>
        <p className="type-text-xs text-muted-foreground">
          {decisions.length} decision{decisions.length === 1 ? "" : "s"} &middot;{" "}
          {range.label}
        </p>
      </header>

      <ol>
        {decisions.map((decision, index) => {
          const sourceSummary = formatSources(decision.sourceAvailability);
          const pending = pendingDecisionId === decision.id;
          const disabled = Boolean(pendingDecisionId);

          return (
            <li
              key={decision.id}
              className={index === 0 ? "" : "border-t border-subtle"}
            >
              <button
                type="button"
                onClick={() => onOpenDecision(decision.id)}
                disabled={disabled}
                aria-busy={pending}
                aria-label={`Open decision: ${decision.title}`}
                data-llm={`Decision row: ${decision.title}. Made ${decision.date} by ${decision.owner}. Sources available: ${sourceSummary}.`}
                className={`group grid w-full grid-cols-1 gap-2 rounded-lg px-2 py-4 text-left transition-[background-color,opacity,transform] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.99] sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-4 ${
                  disabled && !pending
                    ? "opacity-45"
                    : "hover:bg-foreground/[0.03]"
                }`}
              >
                <span className="min-w-0 space-y-1">
                  <span className="block type-text-sm font-semibold leading-5 text-foreground">
                    {decision.title}
                  </span>
                  <span className="block type-text-xs leading-5 text-muted-foreground">
                    <time dateTime={decision.date}>
                      {formatDecisionDate(decision.date)}
                    </time>{" "}
                    &middot; {decision.owner}
                  </span>
                </span>

                <span className="flex min-w-0 items-start gap-2 opacity-65 transition-opacity duration-150 ease-out group-hover:opacity-100 sm:justify-end">
                  <SourceFootprint sources={decision.sourceAvailability} />
                  <span className="grid size-7 shrink-0 place-items-center text-muted-foreground">
                    {pending ? (
                      <LoaderCircle
                        className="size-4 animate-spin"
                        aria-hidden
                      />
                    ) : (
                      <ChevronRight className="size-4" aria-hidden />
                    )}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
