import { Button } from "@alpic-ai/ui/components/button";
import { Tag } from "@alpic-ai/ui/components/tag";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@alpic-ai/ui/components/tooltip";
import {
  ExternalLink,
  FileText,
  GitCommit,
  GitPullRequest,
  Mail,
  MessageSquare,
  NotebookPen,
  type LucideIcon,
} from "lucide-react";
import { useOpenExternal, useUser } from "skybridge/web";
import type { Source, SourceKind } from "@/data/types.js";

const SOURCE_ICONS: Record<SourceKind, LucideIcon> = {
  adr: FileText,
  pr: GitPullRequest,
  commit: GitCommit,
  slack: MessageSquare,
  email: Mail,
  notion: NotebookPen,
  doc: FileText,
};

function sourceDescription(source: Source): string {
  const destination = source.url ? ` at ${source.url}` : " without a URL";
  return `${source.kind} source ${source.label}${destination}.`;
}

export default function SourceLink({ source }: { source: Source }) {
  const openExternal = useOpenExternal();
  const { userAgent } = useUser();
  const Icon = SOURCE_ICONS[source.kind];
  const icon = <Icon className="size-3.5" aria-hidden />;
  const canShowTooltip = userAgent.capabilities.hover && Boolean(source.excerpt);

  const control = source.url ? (
    <Button
      variant="secondary"
      size="pill"
      icon={icon}
      iconTrailing={<ExternalLink className="size-3" aria-hidden />}
      className="max-w-full min-w-0 justify-start"
      onClick={() => source.url && openExternal(source.url)}
      aria-label={`Open ${source.label}`}
      data-llm={sourceDescription(source)}
    >
      <span className="min-w-0 truncate">{source.label}</span>
    </Button>
  ) : (
    <Tag
      icon={icon}
      className="max-w-full min-w-0 justify-start [&>span:last-child]:min-w-0 [&>span:last-child]:truncate"
      data-llm={sourceDescription(source)}
    >
      {source.label}
    </Tag>
  );

  if (!canShowTooltip) {
    return control;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{control}</TooltipTrigger>
      <TooltipContent className="max-w-72 text-left">
        {source.excerpt}
      </TooltipContent>
    </Tooltip>
  );
}
