import { Button } from "@alpic-ai/ui/components/button";
import { MessageCircleQuestion } from "lucide-react";
import { useSendFollowUpMessage } from "skybridge/web";
import type { RelatedRef } from "@/data/types.js";

export default function RelatedChips({
  related,
}: {
  related: RelatedRef[];
}) {
  const sendMessage = useSendFollowUpMessage();

  return (
    <div
      className="flex flex-wrap gap-2"
      data-llm={`Related decisions the user can ask about next: ${related
        .map((ref) => `${ref.title} (${ref.id})`)
        .join(", ")}.`}
    >
      {related.map((ref) => (
        <Button
          key={ref.id}
          variant="secondary"
          size="pill"
          icon={<MessageCircleQuestion className="size-3.5" aria-hidden />}
          className="max-w-full min-w-0 justify-start"
          onClick={() =>
            void sendMessage(
              `Why did we decide "${ref.title}"? (decision ${ref.id})`,
              { scrollToBottom: true },
            )
          }
        >
          <span className="min-w-0 truncate">{ref.title}</span>
        </Button>
      ))}
    </div>
  );
}
