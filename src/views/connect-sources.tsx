import "@/index.css";

import { Button } from "@alpic-ai/ui/components/button";
import { Maximize2, Minimize2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useDisplayMode,
  useLayout,
  useOpenExternal,
  useViewState,
} from "skybridge/web";
import { type ConnectorId, CONNECTORS } from "@/data/connectors.js";
import AuthorizeList from "@/views/components/connectors/authorize-list.js";
import ConnectedSummary from "@/views/components/connectors/connected-summary.js";
import ConnectorGrid from "@/views/components/connectors/connector-grid.js";
import {
  getOnboarding,
  resetOnboarding,
  setOnboarding,
} from "@/views/lib/onboarding-store.js";
import { withViewTransition } from "@/views/lib/view-transition.js";

type Step = "select" | "authorize" | "done";

type OnboardingState = {
  step: Step;
  selectedIds: ConnectorId[];
  connectedIds: ConnectorId[];
};

const FADE = "36px";
const CONNECTOR_ID_SET = new Set<string>(CONNECTORS.map((c) => c.id));

/** Extra breathing room below the host's fullscreen header bar. */
const FULLSCREEN_TOP_INSET = 32;

/** How long the simulated OAuth round-trip "takes" before a row flips connected. */
const AUTHORIZE_DELAY = 1500;

function isStep(value: unknown): value is Step {
  return value === "select" || value === "authorize" || value === "done";
}

function normalizeConnectorIds(
  ids: unknown,
  fallback: ConnectorId[] = [],
): ConnectorId[] {
  if (!Array.isArray(ids)) return fallback;

  const seen = new Set<ConnectorId>();
  for (const id of ids) {
    if (typeof id === "string" && CONNECTOR_ID_SET.has(id)) {
      seen.add(id as ConnectorId);
    }
  }

  return [...seen];
}

function initialOnboardingState(): OnboardingState {
  const saved = getOnboarding();
  const connectedIds = normalizeConnectorIds(saved.connectedIds);

  return {
    step: saved.done ? "done" : "select",
    selectedIds: saved.done ? connectedIds : [],
    connectedIds: saved.done ? connectedIds : [],
  };
}

function normalizeOnboardingState(
  state: Partial<OnboardingState> | null | undefined,
  fallback: OnboardingState,
): OnboardingState {
  return {
    step: isStep(state?.step) ? state.step : fallback.step,
    selectedIds: normalizeConnectorIds(state?.selectedIds, fallback.selectedIds),
    connectedIds: normalizeConnectorIds(
      state?.connectedIds,
      fallback.connectedIds,
    ),
  };
}

export default function ConnectSources() {
  const { theme, maxHeight, safeArea } = useLayout();
  const { top, right, bottom, left } = safeArea.insets;
  const [displayMode, requestDisplayMode] = useDisplayMode();
  const openExternal = useOpenExternal();

  // Seed the first screen from the persisted demo flag: a fresh user starts at
  // selection; one who already onboarded reopens straight to the summary. Read
  // once — useViewState only applies the default on first mount (and otherwise
  // restores its own per-view localStorage snapshot).
  const initialState = useMemo(() => initialOnboardingState(), []);
  const [storedState, setStoredState] =
    useViewState<Partial<OnboardingState>>(initialState);
  const { step, selectedIds, connectedIds } = normalizeOnboardingState(
    storedState,
    initialState,
  );
  const setState = useCallback(
    (next: OnboardingState | ((prev: OnboardingState) => OnboardingState)) =>
      setStoredState((prev) => {
        const previous = normalizeOnboardingState(prev, initialState);
        const resolved =
          typeof next === "function" ? next(previous) : next;

        return normalizeOnboardingState(resolved, initialState);
      }),
    [initialState, setStoredState],
  );
  const [authorizingId, setAuthorizingId] = useState<ConnectorId | null>(null);
  const [fade, setFade] = useState({ top: false, bottom: false });
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isFullscreen = displayMode === "fullscreen";
  const selectedConnectors = CONNECTORS.filter((c) =>
    selectedIds.includes(c.id),
  );

  // Drop any pending simulated-auth timer if the view unmounts (e.g. HMR).
  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const recomputeFade = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const next = {
      top: el.scrollTop > 1,
      bottom: el.scrollTop + el.clientHeight < el.scrollHeight - 1,
    };
    setFade((prev) =>
      prev.top === next.top && prev.bottom === next.bottom ? prev : next,
    );
  }, []);

  useEffect(() => {
    recomputeFade();
  }, [recomputeFade, step, connectedIds, authorizingId, maxHeight]);

  const toScroll = () => scrollRef.current?.scrollTo({ top: 0 });

  const toggle = useCallback(
    (id: ConnectorId) =>
      setState((prev) => ({
        ...prev,
        selectedIds: prev.selectedIds.includes(id)
          ? prev.selectedIds.filter((s) => s !== id)
          : [...prev.selectedIds, id],
      })),
    [setState],
  );

  const toggleAll = useCallback(
    () =>
      setState((prev) => ({
        ...prev,
        selectedIds:
          prev.selectedIds.length === CONNECTORS.length
            ? []
            : CONNECTORS.map((c) => c.id),
      })),
    [setState],
  );

  const goToAuthorize = useCallback(() => {
    withViewTransition(() => setState((prev) => ({ ...prev, step: "authorize" })));
    toScroll();
  }, [setState]);

  const backToSelect = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setAuthorizingId(null);
    withViewTransition(() => setState((prev) => ({ ...prev, step: "select" })));
    toScroll();
  }, [setState]);

  const authorize = useCallback(
    (id: ConnectorId) => {
      if (authorizingId || connectedIds.includes(id)) return;
      const connector = CONNECTORS.find((c) => c.id === id);
      if (!connector) return;

      // Real provider sign-in tab; the success callback is simulated below.
      openExternal(connector.authUrl);
      setAuthorizingId(id);
      timerRef.current = setTimeout(() => {
        setState((prev) => ({
          ...prev,
          connectedIds: prev.connectedIds.includes(id)
            ? prev.connectedIds
            : [...prev.connectedIds, id],
        }));
        setAuthorizingId(null);
        timerRef.current = null;
      }, AUTHORIZE_DELAY);
    },
    [authorizingId, connectedIds, openExternal, setState],
  );

  const finish = useCallback(() => {
    // Persist the global "onboarded" flag so a later invocation (and a refresh)
    // reopens to the summary instead of the first-run grid.
    setOnboarding({ done: true, connectedIds: connectedIds as ConnectorId[] });
    withViewTransition(() => setState((prev) => ({ ...prev, step: "done" })));
    toScroll();
  }, [connectedIds, setState]);

  const done = useCallback(
    () => requestDisplayMode("inline"),
    [requestDisplayMode],
  );

  // Demo-only: clear the persisted flag and return to first-run. Equivalent to
  // running `localStorage.removeItem("y:onboarding")` in the iframe console.
  const resetDemo = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setAuthorizingId(null);
    resetOnboarding();
    withViewTransition(() =>
      setState({ step: "select", selectedIds: [], connectedIds: [] }),
    );
    toScroll();
  }, [setState]);

  let content;
  if (step === "select") {
    content = (
      <ConnectorGrid
        connectors={CONNECTORS}
        selectedIds={selectedIds}
        onToggle={toggle}
        onToggleAll={toggleAll}
        onContinue={goToAuthorize}
      />
    );
  } else if (step === "authorize") {
    content = (
      <AuthorizeList
        connectors={selectedConnectors}
        connectedIds={connectedIds}
        authorizingId={authorizingId}
        onAuthorize={authorize}
        onBack={backToSelect}
        onFinish={finish}
      />
    );
  } else {
    content = (
      <ConnectedSummary
        connectors={selectedConnectors}
        connectedIds={connectedIds}
        onManage={backToSelect}
        onDone={done}
        onReset={resetDemo}
      />
    );
  }

  const topMask = fade.top ? FADE : "0px";
  const bottomMask = fade.bottom ? FADE : "0px";
  const mask = `linear-gradient(to bottom, transparent, #000 ${topMask}, #000 calc(100% - ${bottomMask}), transparent)`;
  const topInset = isFullscreen ? FULLSCREEN_TOP_INSET : 0;

  return (
    <div
      className={`${theme === "dark" ? "dark" : ""} text-foreground`}
      style={{
        paddingTop: top + topInset,
        paddingRight: right,
        paddingBottom: bottom,
        paddingLeft: left,
      }}
    >
      <div className="relative mx-auto w-full max-w-2xl">
        <Button
          variant="tertiary"
          size="icon"
          onClick={() => requestDisplayMode(isFullscreen ? "inline" : "fullscreen")}
          aria-label={isFullscreen ? "Collapse to inline" : "Expand to full screen"}
          className="absolute right-0 top-0 z-10 text-muted-foreground"
        >
          {isFullscreen ? (
            <Minimize2 className="size-4" aria-hidden />
          ) : (
            <Maximize2 className="size-4" aria-hidden />
          )}
        </Button>

        <div
          ref={scrollRef}
          onScroll={recomputeFade}
          className="overflow-y-auto px-1 pt-1"
          style={{
            maxHeight: maxHeight ? maxHeight - topInset : undefined,
            WebkitMaskImage: mask,
            maskImage: mask,
          }}
        >
          {content}
        </div>
      </div>
    </div>
  );
}
