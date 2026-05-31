import { Button } from "@alpic-ai/ui/components/button";
import { MessageCircleQuestion } from "lucide-react";
import type { RelatedRef } from "@/data/types.js";

/**
 * Related-decision pills. Clicking fetches the decision in place via the parent
 * (Approach B: a direct tool call, no new model turn) and swaps the card. The
 * clicked pill carries the loading state so the feedback stays on the action.
 */
export default function RelatedChips({
  related,
  onOpen,
  pendingId,
}: {
  related: RelatedRef[];
  onOpen: (id: string) => void;
  pendingId: string | null;
}) {
  const busy = pendingId !== null;

  return (
    <div
      className="flex flex-wrap gap-2"
      data-llm={`Related decisions the user can open next, in place: ${related
        .map((ref) => `${ref.title} (${ref.id})`)
        .join(", ")}.`}
    >
      {related.map((ref) => (
        <Button
          key={ref.id}
          variant="secondary"
          size="pill"
          loading={pendingId === ref.id}
          disabled={busy && pendingId !== ref.id}
          icon={<MessageCircleQuestion className="size-3.5" aria-hidden />}
          className="max-w-full min-w-0 justify-start"
          onClick={() => onOpen(ref.id)}
          aria-label={`Open related decision: ${ref.title}`}
        >
          <span className="min-w-0 truncate">{ref.title}</span>
        </Button>
      ))}
    </div>
  );
}
