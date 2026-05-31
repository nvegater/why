import { Badge } from "@alpic-ai/ui/components/badge";
import { FileText, NotebookPen } from "lucide-react";
import type { SourceDetail, SourceKind } from "@/data/types.js";

type DocumentDetail = Extract<SourceDetail, { type: "document" }>;

export default function DocumentExcerpt({
  kind,
  title,
  status,
  section,
  body,
  decisiveLines,
}: Omit<DocumentDetail, "type"> & { kind: SourceKind }) {
  const Icon = kind === "notion" ? NotebookPen : FileText;

  return (
    <div
      className="space-y-3"
      data-llm={
        decisiveLines && decisiveLines.length > 0
          ? `Document "${title}". What settled it: ${decisiveLines.join(" ")}`
          : `Document "${title}".`
      }
    >
      <header className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <Icon className="size-4 text-muted-foreground" aria-hidden />
          <span className="type-text-sm font-semibold text-foreground">
            {title}
          </span>
          {status ? (
            <Badge variant="secondary" size="sm">
              {status}
            </Badge>
          ) : null}
        </div>
        {section ? (
          <p className="type-text-xs text-subtle-foreground">{section}</p>
        ) : null}
      </header>

      <p className="type-text-sm leading-6 text-muted-foreground">{body}</p>

      {decisiveLines && decisiveLines.length > 0 ? (
        <div className="space-y-1.5 rounded-lg bg-muted px-3 py-2.5">
          <div className="flex items-center gap-1.5">
            <span
              className="size-1.5 rounded-full bg-primary"
              aria-hidden
            />
            <span className="type-text-xs font-semibold text-foreground">
              What settled it
            </span>
          </div>
          <ul className="space-y-1">
            {decisiveLines.map((line) => (
              <li key={line} className="type-text-sm leading-6 text-foreground">
                {line}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
