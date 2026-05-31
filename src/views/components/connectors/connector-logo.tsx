import type { ConnectorId } from "@/data/connectors.js";
import {
  GithubMark,
  GmailMark,
  NotionMark,
  SlackMark,
  type BrandMark,
} from "@/views/components/brand-marks.js";

/**
 * Per-connector brand mark + accent. Same treatment as `SOURCE_BRAND`: accented
 * brands (Slack, Gmail) tint the tile with their hue; monochrome brands (Notion,
 * GitHub) fall back to the neutral foreground tile so they read in both themes.
 */
export const CONNECTOR_BRAND: Record<
  ConnectorId,
  { Logo: BrandMark; accent?: string }
> = {
  slack: { Logo: SlackMark, accent: "#36C5F0" },
  gmail: { Logo: GmailMark, accent: "#EA4335" },
  notion: { Logo: NotionMark },
  github: { Logo: GithubMark },
};

const SIZES = {
  sm: { tile: "size-9 rounded-[8px]", logo: "size-[18px]" },
  md: { tile: "size-11 rounded-[10px]", logo: "size-[22px]" },
  lg: { tile: "size-14 rounded-xl", logo: "size-7" },
} as const;

/**
 * The brand-tinted square that carries a connector's logo — the recurring
 * visual anchor across the grid, the authorize list, and the summary. Reuses the
 * accent-tile recipe from `source-citation.tsx`.
 */
export default function ConnectorLogo({
  id,
  size = "md",
  className = "",
}: {
  id: ConnectorId;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const { Logo, accent } = CONNECTOR_BRAND[id];
  const s = SIZES[size];

  return (
    <span
      className={`grid shrink-0 place-items-center transition-colors duration-150 ease-out ${s.tile} ${
        accent
          ? ""
          : "bg-foreground/[0.06] text-foreground ring-1 ring-inset ring-foreground/[0.06] group-hover:bg-foreground/10"
      } ${className}`}
      style={
        accent
          ? {
              backgroundColor: `color-mix(in oklab, ${accent} 14%, transparent)`,
              boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${accent} 30%, transparent)`,
            }
          : undefined
      }
      aria-hidden
    >
      <Logo className={s.logo} />
    </span>
  );
}
