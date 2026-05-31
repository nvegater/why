import { Badge } from "@alpic-ai/ui/components/badge";
import { Button } from "@alpic-ai/ui/components/button";
import {
  Check,
  ChevronLeft,
  ExternalLink,
  TriangleAlert,
} from "lucide-react";
import type { Connector, ConnectorId } from "@/data/connectors.js";
import ConnectorLogo from "@/views/components/connectors/connector-logo.js";

/**
 * Second onboarding step: authorize each selected source one by one. "Authorize"
 * opens the provider's sign-in page in a new tab and the row shows a spinner
 * until it flips to "Connected" (the success is simulated — a mock has no client
 * to receive the OAuth callback). A standing warning flags anything still
 * unconnected; the user can finish with whatever is connected, or go Back to
 * re-edit the selection.
 */
export default function AuthorizeList({
  connectors,
  connectedIds,
  authorizingId,
  onAuthorize,
  onBack,
  onFinish,
}: {
  connectors: Connector[];
  connectedIds: ConnectorId[];
  authorizingId: ConnectorId | null;
  onAuthorize: (id: ConnectorId) => void;
  onBack: () => void;
  onFinish: () => void;
}) {
  const connectedCount = connectors.filter((c) =>
    connectedIds.includes(c.id),
  ).length;
  const remaining = connectors.length - connectedCount;

  return (
    <section
      className="space-y-5 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-200"
      data-llm={`Connector setup — authorize step. ${connectedCount} of ${connectors.length} sources connected.`}
    >
      <div className="space-y-3">
        <Button
          variant="tertiary"
          icon={<ChevronLeft className="size-4" aria-hidden />}
          onClick={onBack}
          className="-ml-2"
        >
          Back
        </Button>
        <header className="space-y-1">
          <h2 className="type-display-xs font-semibold text-foreground">
            Authorize access
          </h2>
          <p className="type-text-sm text-muted-foreground">
            Sign in to each source to finish connecting. We&rsquo;ll open the
            provider in a new tab.
          </p>
        </header>
      </div>

      <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
        {connectors.map((connector) => {
          const connected = connectedIds.includes(connector.id);
          const authorizing = authorizingId === connector.id;
          const busyElsewhere = authorizingId !== null && !authorizing;

          return (
            <li
              key={connector.id}
              className="flex items-center gap-3 p-3"
              data-llm={`${connector.name} — ${
                connected
                  ? "connected"
                  : authorizing
                    ? "authorizing"
                    : "not connected"
              }.`}
            >
              <ConnectorLogo id={connector.id} size="sm" />

              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate type-text-sm font-semibold text-foreground">
                  {connector.name}
                </span>
                <span className="truncate type-text-xs text-muted-foreground">
                  {connector.blurb}
                </span>
              </span>

              {connected ? (
                <Badge variant="success" size="sm" className="gap-1">
                  <Check className="size-3" strokeWidth={2.5} aria-hidden />
                  Connected
                </Badge>
              ) : (
                <Button
                  variant="secondary"
                  size="pill"
                  loading={authorizing}
                  disabled={busyElsewhere}
                  iconTrailing={
                    authorizing ? undefined : (
                      <ExternalLink className="size-3" aria-hidden />
                    )
                  }
                  onClick={() => onAuthorize(connector.id)}
                  aria-label={`Authorize ${connector.name}`}
                >
                  {authorizing ? "Connecting…" : "Authorize"}
                </Button>
              )}
            </li>
          );
        })}
      </ul>

      {remaining > 0 ? (
        <div className="flex items-start gap-2.5 rounded-lg border border-warning/30 bg-warning/[0.06] p-3">
          <TriangleAlert
            className="mt-0.5 size-4 shrink-0 text-warning"
            aria-hidden
          />
          <p className="type-text-xs leading-5 text-foreground">
            {remaining} source{remaining === 1 ? " isn't" : "s aren't"} connected
            yet. Authorize {remaining === 1 ? "it" : "them"} now, or continue with
            the {connectedCount} you&rsquo;ve connected.
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="type-text-xs font-medium text-subtle-foreground">
          {connectedCount} of {connectors.length} connected
        </span>
        <Button
          variant="primary"
          onClick={onFinish}
          disabled={connectedCount === 0}
          className="w-full sm:w-auto"
        >
          {remaining === 0
            ? "Finish setup"
            : "Continue with connected sources"}
        </Button>
      </div>
    </section>
  );
}
