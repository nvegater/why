import "@/index.css";

import { useLayout } from "skybridge/web";
import { useToolInfo } from "@/helpers.js";
import DecisionCard from "@/views/components/decision-card.js";
import DecisionEmpty from "@/views/components/decision-empty.js";
import DecisionSkeleton from "@/views/components/decision-skeleton.js";

export default function FindDecision() {
  const toolInfo = useToolInfo<"find-decision">();
  const { theme, maxHeight, safeArea } = useLayout();
  const { top, right, bottom, left } = safeArea.insets;

  let content = <DecisionEmpty />;

  if (toolInfo.isPending) {
    content = <DecisionSkeleton />;
  } else if (toolInfo.output?.decision) {
    content = <DecisionCard decision={toolInfo.output.decision} />;
  } else {
    content = <DecisionEmpty query={toolInfo.input?.query} />;
  }

  return (
    <div
      className={`${theme === "dark" ? "dark" : ""} bg-background text-foreground`}
      style={{
        maxHeight,
        paddingTop: top,
        paddingRight: right,
        paddingBottom: bottom,
        paddingLeft: left,
      }}
    >
      <div className="mx-auto w-full max-w-2xl border border-border bg-background p-4 shadow-xs sm:p-5">
        {content}
      </div>
    </div>
  );
}
