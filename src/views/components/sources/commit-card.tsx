import { Separator } from "@alpic-ai/ui/components/separator";
import { GitCommit } from "lucide-react";
import type { SourceDetail } from "@/data/types.js";

type CommitDetail = Extract<SourceDetail, { type: "commit" }>;

export default function CommitCard({
  repo,
  sha,
  message,
  author,
  date,
  files,
}: Omit<CommitDetail, "type">) {
  const [subject, ...rest] = message.split("\n");
  const body = rest.join("\n").trim();

  return (
    <div
      className="space-y-3"
      data-llm={`Git commit ${sha.slice(0, 10)} in ${repo} by ${author}: "${subject}".`}
    >
      <header className="flex flex-wrap items-center gap-2">
        <GitCommit className="size-4 text-muted-foreground" aria-hidden />
        <span className="type-text-xs font-medium tabular-nums text-muted-foreground">
          {sha.slice(0, 10)}
        </span>
        <span className="type-text-xs text-subtle-foreground">{repo}</span>
      </header>

      <div className="space-y-1.5">
        <p className="type-text-sm font-semibold text-foreground">{subject}</p>
        {body ? (
          <p className="type-text-sm leading-6 whitespace-pre-line text-muted-foreground">
            {body}
          </p>
        ) : null}
      </div>

      <p className="type-text-xs text-subtle-foreground">
        {author} · {date}
      </p>

      {files && files.length > 0 ? (
        <>
          <Separator />
          <div className="space-y-1.5">
            <p className="type-text-xs font-semibold text-foreground">
              Files changed
            </p>
            <ul className="space-y-1">
              {files.map((file) => (
                <li
                  key={file}
                  className="type-text-xs tabular-nums text-muted-foreground"
                >
                  {file}
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : null}
    </div>
  );
}
