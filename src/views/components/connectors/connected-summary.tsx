import { Button } from "@alpic-ai/ui/components/button";
import { Check } from "lucide-react";
import type { Connector, ConnectorId } from "@/data/connectors.js";
import ConnectorLogo from "@/views/components/connectors/connector-logo.js";

/**
 * Final onboarding step: a quiet "all set" confirmation listing the connected
 * sources. Any source the user skipped is noted but not nagged. "Done" collapses
 * the widget back inline; "Manage sources" returns to the selection grid.
 */
export default function ConnectedSummary({
  connectors,
  connectedIds,
  onManage,
  onDone,
  onReset,
}: {
  connectors: Connector[];
  connectedIds: ConnectorId[];
  onManage: () => void;
  onDone: () => void;
  onReset: () => void;
}) {
  const connected = connectors.filter((c) => connectedIds.includes(c.id));
  const skipped = connectors.filter((c) => !connectedIds.includes(c.id));

  return (
    <section
      className="space-y-5 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-200"
      data-llm={`Connector setup complete. Connected: ${
        connected.map((c) => c.name).join(", ") || "none"
      }.${skipped.length ? ` Skipped: ${skipped.map((c) => c.name).join(", ")}.` : ""}`}
    >
      <header className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-success/10 text-success ring-1 ring-inset ring-success/20">
          <Check className="size-5" strokeWidth={2.5} aria-hidden />
        </span>
        <div className="space-y-1">
          <h2 className="type-display-xs font-semibold text-foreground">
            You&rsquo;re all set
          </h2>
          <p className="type-text-sm text-muted-foreground">
            Y can now pull decisions from your connected sources.
          </p>
        </div>
      </header>

      <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
        {connected.map((connector) => (
          <li key={connector.id} className="flex items-center gap-3 p-3">
            <ConnectorLogo id={connector.id} size="sm" />
            <span className="min-w-0 flex-1 truncate type-text-sm font-semibold text-foreground">
              {connector.name}
            </span>
            <Check className="size-4 shrink-0 text-success" strokeWidth={2.5} aria-hidden />
          </li>
        ))}
      </ul>

      {skipped.length ? (
        <p className="type-text-xs text-muted-foreground">
          Not connected: {skipped.map((c) => c.name).join(", ")}. You can add{" "}
          {skipped.length === 1 ? "it" : "them"} anytime from setup.
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row-reverse sm:items-center sm:justify-start">
        <Button
          variant="primary"
          onClick={onDone}
          className="w-full sm:w-auto"
        >
          Done
        </Button>
        <Button
          variant="tertiary"
          onClick={onManage}
          className="w-full sm:w-auto"
        >
          Manage sources
        </Button>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="type-text-xs text-subtle-foreground underline-offset-2 transition-colors hover:text-muted-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
        data-llm="Demo control: resets the saved onboarding state to first-run."
      >
        Reset demo
      </button>
    </section>
  );
}
