import { Button } from "@alpic-ai/ui/components/button";
import { Separator } from "@alpic-ai/ui/components/separator";
import {
  ChevronLeft,
  ExternalLink,
  FileText,
  GitCommit,
  GitPullRequest,
  Mail,
  MessageSquare,
  NotebookPen,
  type LucideIcon,
} from "lucide-react";
import { useOpenExternal } from "skybridge/web";
import type { Source, SourceDetail, SourceKind } from "@/data/types.js";
import { SOURCE_BRAND } from "@/views/components/brand-marks.js";
import CommitCard from "@/views/components/sources/commit-card.js";
import DocumentExcerpt from "@/views/components/sources/document-excerpt.js";
import EmailMessage from "@/views/components/sources/email-message.js";
import GithubPr from "@/views/components/sources/github-pr.js";
import SlackThread from "@/views/components/sources/slack-thread.js";

const SOURCE_ICONS: Record<SourceKind, LucideIcon> = {
  adr: FileText,
  pr: GitPullRequest,
  commit: GitCommit,
  slack: MessageSquare,
  email: Mail,
  notion: NotebookPen,
  doc: FileText,
};

const KIND_LABEL: Record<SourceKind, string> = {
  adr: "ADR",
  pr: "pull request",
  commit: "commit",
  slack: "Slack thread",
  email: "email",
  notion: "Notion page",
  doc: "document",
};

function providerName(url: string): string {
  try {
    const host = new URL(url).hostname;
    if (host.includes("github")) return "GitHub";
    if (host.includes("slack")) return "Slack";
    if (host.includes("notion")) return "Notion";
    if (host.includes("docs.google")) return "Google Docs";
    return host.replace(/^www\./, "");
  } catch {
    return "the source";
  }
}

function renderDetail(detail: SourceDetail, kind: SourceKind) {
  switch (detail.type) {
    case "slack":
      return <SlackThread {...detail} />;
    case "email":
      return <EmailMessage {...detail} />;
    case "pr":
      return <GithubPr {...detail} />;
    case "commit":
      return <CommitCard {...detail} />;
    case "document":
      return <DocumentExcerpt kind={kind} {...detail} />;
  }
}

export default function SourceViewer({
  source,
  detail,
  onBack,
}: {
  source: Source;
  detail?: SourceDetail;
  onBack: () => void;
}) {
  const openExternal = useOpenExternal();
  const Icon = SOURCE_ICONS[source.kind];
  const { Logo } = SOURCE_BRAND[source.kind];

  return (
    <section
      className="space-y-4 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-200"
      data-llm={`User opened the ${KIND_LABEL[source.kind]} "${source.label}" to read the evidence behind this decision. Refer to it as "this source".`}
    >
      <Button
        variant="tertiary"
        icon={<ChevronLeft className="size-4" aria-hidden />}
        onClick={onBack}
        className="-ml-2"
      >
        Back to decision
      </Button>

      {detail ? (
        renderDetail(detail, source.kind)
      ) : (
        <div className="flex gap-2">
          <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <p className="type-text-sm leading-6 text-muted-foreground">
            {source.excerpt ?? source.label}
          </p>
        </div>
      )}

      {source.url ? (
        <>
          <Separator />
          <Button
            variant="secondary"
            icon={<Logo className="size-3.5" />}
            iconTrailing={<ExternalLink className="size-3" aria-hidden />}
            onClick={() => source.url && openExternal(source.url)}
            aria-label={`Open ${source.label} in ${providerName(source.url)}`}
            className="w-full justify-center sm:w-auto sm:justify-start"
          >
            Open in {providerName(source.url)}
          </Button>
        </>
      ) : null}
    </section>
  );
}
