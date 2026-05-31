import {
  ChevronRight,
  FileText,
  GitCommitHorizontal,
  GitPullRequest,
  Hash,
  Mail,
  NotebookPen,
  type LucideIcon,
} from "lucide-react";
import type { Source, SourceKind } from "@/data/types.js";
import { SOURCE_BRAND } from "@/views/components/brand-marks.js";

/**
 * A typed source citation — the card's evidence entry point. The tile carries
 * the provider's brand mark (GitHub / Slack / Google Docs …) over a brand-tinted
 * background, so it's obvious where the evidence lives; the small kind glyph +
 * label below say what *kind* of artifact it is (PR vs commit vs ADR). Clicking
 * opens the in-place Source Viewer (the external link is demoted to the final
 * action inside that layer); it never redirects out.
 */

const SOURCE_ICONS: Record<SourceKind, LucideIcon> = {
  adr: FileText,
  pr: GitPullRequest,
  commit: GitCommitHorizontal,
  slack: Hash,
  email: Mail,
  notion: NotebookPen,
  doc: FileText,
};

const KIND_LABEL: Record<SourceKind, string> = {
  adr: "ADR",
  pr: "Pull request",
  commit: "Commit",
  slack: "Slack",
  email: "Email",
  notion: "Notion",
  doc: "Document",
};

export default function SourceCitation({
  source,
  onOpenSource,
}: {
  source: Source;
  onOpenSource: (id: string) => void;
}) {
  const Icon = SOURCE_ICONS[source.kind];
  const { Logo, accent } = SOURCE_BRAND[source.kind];
  const mono = source.kind === "commit";

  return (
    <button
      type="button"
      onClick={() => onOpenSource(source.id)}
      aria-label={`Open ${KIND_LABEL[source.kind]}: ${source.label}`}
      data-llm={`${source.kind} source ${source.label}; opens an in-app view of the underlying evidence.`}
      className="group flex min-w-0 max-w-full items-center gap-2.5 rounded-lg py-1 pr-2 pl-1 text-left transition-[background-color,transform] duration-150 ease-out hover:bg-background-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]"
    >
      <span
        className={`grid size-8 shrink-0 place-items-center rounded-[7px] transition-colors duration-150 ease-out ${
          accent
            ? ""
            : "bg-foreground/[0.06] text-foreground ring-1 ring-inset ring-foreground/[0.06] group-hover:bg-foreground/10"
        }`}
        style={
          accent
            ? {
                backgroundColor: `color-mix(in oklab, ${accent} 14%, transparent)`,
                boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${accent} 30%, transparent)`,
              }
            : undefined
        }
        aria-hidden
      >
        <Logo className="size-[18px]" />
      </span>

      <span className="flex min-w-0 flex-col">
        <span className="flex items-center gap-1 type-text-xs leading-tight text-muted-foreground">
          <Icon className="size-3 shrink-0" strokeWidth={1.75} aria-hidden />
          {KIND_LABEL[source.kind]}
        </span>
        <span
          className={`type-text-sm truncate font-medium leading-tight text-foreground ${
            mono ? "tabular-nums tracking-tight" : ""
          }`}
        >
          {source.label}
        </span>
      </span>

      <ChevronRight
        className="size-4 shrink-0 -translate-x-1 text-subtle-foreground opacity-0 transition-[opacity,transform] duration-150 ease-out group-hover:translate-x-0 group-hover:opacity-100"
        aria-hidden
      />
    </button>
  );
}
