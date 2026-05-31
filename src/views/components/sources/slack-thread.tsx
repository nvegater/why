import { Avatar, AvatarFallback } from "@alpic-ai/ui/components/avatar";
import { Separator } from "@alpic-ai/ui/components/separator";
import { MessageSquare } from "lucide-react";
import type { SourceDetail } from "@/data/types.js";
import { initials } from "@/views/components/sources/initials.js";

type SlackDetail = Extract<SourceDetail, { type: "slack" }>;

export default function SlackThread({
  channel,
  messages,
}: Omit<SlackDetail, "type">) {
  const decisiveText = messages
    .filter((message) => message.decisive)
    .map((message) => `${message.author}: ${message.text}`)
    .join(" ");

  return (
    <div
      className="space-y-3"
      data-llm={
        decisiveText
          ? `Slack thread in ${channel}. The line that supported the decision: ${decisiveText}`
          : `Slack thread in ${channel}.`
      }
    >
      <header className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="flex items-center gap-1.5">
          <MessageSquare className="size-4 text-muted-foreground" aria-hidden />
          <span className="type-text-sm font-semibold text-foreground">
            {channel}
          </span>
        </span>
        <span className="type-text-xs text-subtle-foreground">Slack thread</span>
      </header>

      <Separator />

      <ol className="space-y-3">
        {messages.map((message, index) => (
          <li key={index} className="flex gap-2.5">
            <Avatar size="sm" className="mt-0.5">
              <AvatarFallback>{initials(message.author)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="type-text-sm font-semibold text-foreground">
                  {message.author}
                </span>
                {message.handle ? (
                  <span className="type-text-xs text-subtle-foreground">
                    @{message.handle}
                  </span>
                ) : null}
                <span className="type-text-xs text-subtle-foreground">
                  {message.time}
                </span>
              </div>
              <div
                className={
                  message.decisive ? "rounded-lg bg-muted px-3 py-2" : ""
                }
              >
                <p className="type-text-sm leading-6 text-foreground">
                  {message.decisive ? (
                    <span
                      className="mr-1.5 inline-block size-1.5 -translate-y-px rounded-full bg-primary align-middle"
                      aria-hidden
                    />
                  ) : null}
                  {message.text}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
