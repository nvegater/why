import {
  DescriptionItem,
  DescriptionList,
  DescriptionTitle,
  DescriptionValue,
} from "@alpic-ai/ui/components/description-list";
import { Separator } from "@alpic-ai/ui/components/separator";
import { Mail } from "lucide-react";
import type { SourceDetail } from "@/data/types.js";

type EmailDetail = Extract<SourceDetail, { type: "email" }>;

export default function EmailMessage({
  from,
  to,
  date,
  subject,
  quotes,
}: Omit<EmailDetail, "type">) {
  const decisiveText = quotes
    .filter((quote) => quote.decisive)
    .map((quote) => quote.text)
    .join(" ");

  return (
    <div
      className="space-y-3"
      data-llm={
        decisiveText
          ? `Email "${subject}" from ${from}. The quote that supported the decision: ${decisiveText}`
          : `Email "${subject}" from ${from}.`
      }
    >
      <header className="flex items-center gap-2">
        <Mail className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="type-text-sm font-semibold text-foreground">
          {subject}
        </span>
      </header>

      <DescriptionList className="grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-2">
        <DescriptionItem>
          <DescriptionTitle>From</DescriptionTitle>
          <DescriptionValue className="whitespace-normal">
            {from}
          </DescriptionValue>
        </DescriptionItem>
        <DescriptionItem>
          <DescriptionTitle>Date</DescriptionTitle>
          <DescriptionValue className="whitespace-normal">
            {date}
          </DescriptionValue>
        </DescriptionItem>
        <DescriptionItem className="sm:col-span-2">
          <DescriptionTitle>To</DescriptionTitle>
          <DescriptionValue className="whitespace-normal">
            {to.join(", ")}
          </DescriptionValue>
        </DescriptionItem>
      </DescriptionList>

      <Separator />

      <div className="space-y-2">
        {quotes.map((quote, index) => (
          <div
            key={index}
            className={quote.decisive ? "rounded-lg bg-muted px-3 py-2" : "px-3"}
          >
            <p className="type-text-sm leading-6 text-foreground">
              {quote.decisive ? (
                <span
                  className="mr-1.5 inline-block size-1.5 -translate-y-px rounded-full bg-primary align-middle"
                  aria-hidden
                />
              ) : null}
              {quote.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
