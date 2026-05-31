import "@/index.css";

import { Button } from "@alpic-ai/ui/components/button";
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
import DecisionEmpty from "@/views/components/decision-empty.js";
import DecisionSkeleton from "@/views/components/decision-skeleton.js";
import SourceViewer from "@/views/components/sources/source-viewer.js";
import { withViewTransition } from "@/views/lib/view-transition.js";

type SourceDetailMap = Record<string, SourceDetail>;
type NavState = { decision: DecisionCardType; sourceDetails?: SourceDetailMap };

const FADE = "36px";

/** Extra breathing room below the host's fullscreen header bar. */
const FULLSCREEN_TOP_INSET = 32;

export default function FindDecision() {
  const toolInfo = useToolInfo<"find-decision">();
  const { theme, maxHeight, safeArea } = useLayout();
  const { top, right, bottom, left } = safeArea.insets;
  const [displayMode, requestDisplayMode] = useDisplayMode();
  const { callToolAsync } = useCallTool("find-decision");

  const [{ openSourceId }, setOpenState] = useViewState<{
    openSourceId: string | null;
  }>({ openSourceId: null });
  const [nav, setNav] = useState<NavState | null>(null);
  const [pendingRelatedId, setPendingRelatedId] = useState<string | null>(null);
  const [fade, setFade] = useState({ top: false, bottom: false });
  const scrollRef = useRef<HTMLDivElement>(null);

  const originalDecision = toolInfo.output?.decision ?? null;
  const originalSourceDetails = (
    toolInfo.responseMetadata as { sourceDetails?: SourceDetailMap } | undefined
  )?.sourceDetails;

  const decision = nav?.decision ?? originalDecision;
  const sourceDetails = nav ? nav.sourceDetails : originalSourceDetails;
  const isFullscreen = displayMode === "fullscreen";

  const openSource: Source | null =
    openSourceId && decision
      ? (decision.arguments
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
  }, [recomputeFade, decision, openSourceId, maxHeight]);

  const openRelated = useCallback(
    async (id: string) => {
      if (pendingRelatedId) return;
      setPendingRelatedId(id);
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
            setNav({ decision: next, sourceDetails: nextDetails });
            setOpenState((prev) => ({ ...prev, openSourceId: null }));
          });
          scrollRef.current?.scrollTo({ top: 0 });
        }
      } finally {
        setPendingRelatedId(null);
      }
    },
    [callToolAsync, pendingRelatedId, setOpenState],
  );

  const backToOriginal = useCallback(() => {
    withViewTransition(() => {
      setNav(null);
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
    content = <DecisionSkeleton />;
  } else if (decision && openSource) {
    content = (
      <SourceViewer
        source={openSource}
        detail={sourceDetails?.[openSource.id]}
        onBack={closeSourceLayer}
      />
    );
  } else if (decision) {
    content = (
      <>
        {nav ? (
          <Button
            variant="tertiary"
            icon={<ChevronLeft className="size-4" aria-hidden />}
            onClick={backToOriginal}
            className="-ml-2 mb-3"
          >
            Back
          </Button>
        ) : null}
        <div
          className={
            pendingRelatedId
              ? "opacity-50 transition-opacity duration-200"
              : "transition-opacity duration-200"
          }
        >
          <DecisionCard
            decision={decision}
            onOpenSource={openSourceLayer}
            onOpenRelated={openRelated}
            pendingRelatedId={pendingRelatedId}
          />
        </div>
      </>
    );
  } else {
    content = <DecisionEmpty query={toolInfo.input?.query} />;
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
