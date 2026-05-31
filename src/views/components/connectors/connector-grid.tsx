import { Button } from "@alpic-ai/ui/components/button";
import { Check, ChevronRight } from "lucide-react";
import type { Connector } from "@/data/connectors.js";
import ConnectorLogo from "@/views/components/connectors/connector-logo.js";

/**
 * First onboarding step: a multi-select grid of the sources Y can read. Logos
 * anchor each tile, the corner circle reads as a checkbox, and "Select all"
 * flips the whole set. Continue carries the running count and is disabled until
 * at least one source is picked.
 */
export default function ConnectorGrid({
  connectors,
  selectedIds,
  onToggle,
  onToggleAll,
  onContinue,
}: {
  connectors: Connector[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  onContinue: () => void;
}) {
  const count = selectedIds.length;
  const allSelected = count === connectors.length;

  return (
    <section
      className="space-y-5 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-200"
      data-llm={`Connector setup — source selection step. ${count} of ${connectors.length} sources selected: ${
        selectedIds.length ? selectedIds.join(", ") : "none yet"
      }.`}
    >
      <header className="space-y-1">
        <h2 className="type-display-xs font-semibold text-foreground">
          Connect your sources
        </h2>
        <p className="type-text-sm text-muted-foreground">
          Choose where Y should look for decisions. You can change this anytime.
        </p>
      </header>

      <div className="flex items-center justify-between">
        <span className="type-text-xs font-medium text-subtle-foreground">
          {count} of {connectors.length} selected
        </span>
        <button
          type="button"
          onClick={onToggleAll}
          className="type-text-xs font-semibold text-primary transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
        >
          {allSelected ? "Clear all" : "Select all"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {connectors.map((connector) => {
          const selected = selectedIds.includes(connector.id);
          return (
            <button
              key={connector.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onToggle(connector.id)}
              data-llm={`${connector.name} — ${selected ? "selected" : "not selected"}.`}
              className={`group relative flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-[background-color,border-color,transform] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] ${
                selected
                  ? "border-primary/40 bg-primary/[0.04]"
                  : "border-border hover:border-border-secondary hover:bg-background-hover"
              }`}
            >
              <span className="absolute right-3 top-3">
                {selected ? (
                  <span className="grid size-5 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3.5" strokeWidth={3} aria-hidden />
                  </span>
                ) : (
                  <span className="block size-5 rounded-full border border-border transition-colors group-hover:border-subtle-foreground" />
                )}
              </span>

              <ConnectorLogo id={connector.id} size="md" />

              <span className="min-w-0">
                <span className="block type-text-sm font-semibold text-foreground">
                  {connector.name}
                </span>
                <span className="block type-text-xs text-muted-foreground">
                  {connector.blurb}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <Button
        variant="primary"
        onClick={onContinue}
        disabled={count === 0}
        iconTrailing={<ChevronRight className="size-4" aria-hidden />}
        className="w-full sm:w-auto"
      >
        {count === 0
          ? "Continue"
          : `Continue with ${count} source${count === 1 ? "" : "s"}`}
      </Button>
    </section>
  );
}
