import "@/index.css";

import { Button } from "@alpic-ai/ui/components/button";
import { Skeleton } from "@alpic-ai/ui/components/skeleton";
import { ChevronLeft, Maximize2, Minimize2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDisplayMode, useLayout, useViewState } from "skybridge/web";
import { useCallTool, useToolInfo } from "@/helpers.js";
import type {
  DecisionCard as DecisionCardType,
  Source,
  SourceDetail,
} from "@/data/types.js";
import DecisionCard from "@/views/components/decision-card.js";
import DecisionList from "@/views/components/decision-list.js";
import SourceViewer from "@/views/components/sources/source-viewer.js";
import { withViewTransition } from "@/views/lib/view-transition.js";

type SourceDetailMap = Record<string, SourceDetail>;
type SelectedDecision = {
  decision: DecisionCardType;
  sourceDetails?: SourceDetailMap;
};

const FADE = "36px";
const FULLSCREEN_TOP_INSET = 32;
const DEFAULT_RANGE = {
  from: null,
  to: null,
  label: "All recorded dates",
  isFiltered: false,
};

function DecisionListSkeleton() {
  return (
    <div
      className="space-y-5"
      role="status"
      aria-live="polite"
      aria-label="Loading decisions"
      data-llm="Y is loading the recorded decision list."
    >
      <div className="space-y-2 pr-9">
        <Skeleton className="h-7 w-56 max-w-full" />
        <Skeleton className="h-4 w-40 max-w-full" />
      </div>

      <div>
        {[0, 1, 2, 3].map((row) => (
          <div
            key={row}
            className={`grid grid-cols-1 gap-2 px-2 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-4 ${
              row === 0 ? "" : "border-t border-subtle"
            }`}
          >
            <div className="space-y-2">
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="h-4 w-52 max-w-full" />
            </div>
            <div className="flex gap-1.5 sm:justify-end">
              <Skeleton className="h-7 w-14 rounded-md" />
              <Skeleton className="h-7 w-16 rounded-md" />
              <Skeleton className="h-7 w-12 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ListDecisions() {
  const toolInfo = useToolInfo<"list-decisions">();
  const { theme, maxHeight, safeArea } = useLayout();
  const { top, right, bottom, left } = safeArea.insets;
  const [displayMode, requestDisplayMode] = useDisplayMode();
  const { callToolAsync } = useCallTool("find-decision");

  const [{ openSourceId }, setOpenState] = useViewState<{
    openSourceId: string | null;
  }>({ openSourceId: null });
  const [selected, setSelected] = useState<SelectedDecision | null>(null);
  const [pendingDecisionId, setPendingDecisionId] = useState<string | null>(null);
  const [fade, setFade] = useState({ top: false, bottom: false });
  const scrollRef = useRef<HTMLDivElement>(null);

  const isFullscreen = displayMode === "fullscreen";
  const decisions = toolInfo.output?.decisions ?? [];
  const range = toolInfo.output?.range ?? DEFAULT_RANGE;

  const openSource: Source | null =
    openSourceId && selected
      ? (selected.decision.arguments
          .flatMap((argument) => argument.sources)
          .find((source) => source.id === openSourceId) ?? null)
      : null;

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
  }, [
    recomputeFade,
    decisions.length,
    selected?.decision.id,
    openSourceId,
    maxHeight,
  ]);

  const openDecision = useCallback(
    async (id: string) => {
      if (pendingDecisionId) return;

      setPendingDecisionId(id);
      try {
        const res = await callToolAsync({ query: id });
        const next = (
          res?.structuredContent as
            | { decision?: DecisionCardType | null }
            | undefined
        )?.decision;
        const nextDetails = (
          res as { meta?: { sourceDetails?: SourceDetailMap } } | undefined
        )?.meta?.sourceDetails;

        if (next) {
          withViewTransition(() => {
            setSelected({ decision: next, sourceDetails: nextDetails });
            setOpenState((prev) => ({ ...prev, openSourceId: null }));
          });
          scrollRef.current?.scrollTo({ top: 0 });
        }
      } finally {
        setPendingDecisionId(null);
      }
    },
    [callToolAsync, pendingDecisionId, setOpenState],
  );

  const backToList = useCallback(() => {
    withViewTransition(() => {
      setSelected(null);
      setOpenState((prev) => ({ ...prev, openSourceId: null }));
    });
    scrollRef.current?.scrollTo({ top: 0 });
  }, [setOpenState]);

  const openSourceLayer = useCallback(
    (id: string) => setOpenState((prev) => ({ ...prev, openSourceId: id })),
    [setOpenState],
  );
  const closeSourceLayer = useCallback(
    () => setOpenState((prev) => ({ ...prev, openSourceId: null })),
    [setOpenState],
  );

  let content;
  if (toolInfo.isPending) {
    content = <DecisionListSkeleton />;
  } else if (selected && openSource) {
    content = (
      <SourceViewer
        source={openSource}
        detail={selected.sourceDetails?.[openSource.id]}
        onBack={closeSourceLayer}
      />
    );
  } else if (selected) {
    content = (
      <>
        <Button
          variant="tertiary"
          icon={<ChevronLeft className="size-4" aria-hidden />}
          onClick={backToList}
          className="-ml-2 mb-3"
        >
          Back
        </Button>
        <div
          className={
            pendingDecisionId
              ? "opacity-50 transition-opacity duration-200"
              : "transition-opacity duration-200"
          }
        >
          <DecisionCard
            decision={selected.decision}
            onOpenSource={openSourceLayer}
            onOpenRelated={openDecision}
            pendingRelatedId={pendingDecisionId}
          />
        </div>
      </>
    );
  } else {
    content = (
      <DecisionList
        decisions={decisions}
        range={range}
        pendingDecisionId={pendingDecisionId}
        onOpenDecision={openDecision}
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
      <div className="relative mx-auto w-full max-w-[46rem]">
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
