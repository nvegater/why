import { Avatar, AvatarFallback } from "@alpic-ai/ui/components/avatar";
import { Badge } from "@alpic-ai/ui/components/badge";
import { Separator } from "@alpic-ai/ui/components/separator";
import { GitPullRequest } from "lucide-react";
import type { SourceDetail } from "@/data/types.js";
import { initials } from "@/views/components/sources/initials.js";

type PrDetail = Extract<SourceDetail, { type: "pr" }>;

export default function GithubPr({
  repo,
  number,
  state,
  title,
  author,
  summary,
  comments,
}: Omit<PrDetail, "type">) {
  const decisiveText = comments
    .filter((comment) => comment.decisive)
    .map((comment) => `${comment.author}: ${comment.body}`)
    .join(" ");

  return (
    <div
      className="space-y-3"
      data-llm={
        decisiveText
          ? `GitHub pull request ${repo} #${number} (${state}): "${title}". The comment that supported the decision: ${decisiveText}`
          : `GitHub pull request ${repo} #${number} (${state}): "${title}".`
      }
    >
      <header className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <GitPullRequest className="size-4 text-muted-foreground" aria-hidden />
          <span className="type-text-xs text-subtle-foreground">
            {repo} #{number}
          </span>
          <Badge variant="secondary" size="sm" className="capitalize">
            {state}
          </Badge>
        </div>
        <h4 className="type-text-sm font-semibold text-foreground">{title}</h4>
        <p className="type-text-xs text-subtle-foreground">opened by {author}</p>
      </header>

      <p className="type-text-sm leading-6 text-muted-foreground">{summary}</p>

      <Separator />

      <ol className="space-y-3">
        {comments.map((comment, index) => (
          <li key={index} className="flex gap-2.5">
            <Avatar size="sm" className="mt-0.5">
              <AvatarFallback>{initials(comment.author)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="type-text-sm font-semibold text-foreground">
                  {comment.author}
                </span>
                {comment.handle ? (
                  <span className="type-text-xs text-subtle-foreground">
                    @{comment.handle}
                  </span>
                ) : null}
              </div>
              <div
                className={
                  comment.decisive ? "rounded-lg bg-muted px-3 py-2" : ""
                }
              >
                <p className="type-text-sm leading-6 text-foreground">
                  {comment.decisive ? (
                    <span
                      className="mr-1.5 inline-block size-1.5 -translate-y-px rounded-full bg-primary align-middle"
                      aria-hidden
                    />
                  ) : null}
                  {comment.body}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
