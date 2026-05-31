import { flushSync } from "react-dom";

/**
 * Crossfade a state change with the View Transitions API, honoring reduced
 * motion. Falls back to a plain synchronous update when the API is unavailable
 * or the user prefers reduced motion. Shared by the views that swap their whole
 * surface in place (decision navigation, connector onboarding steps).
 */
export function withViewTransition(update: () => void) {
  const start = (
    document as Document & {
      startViewTransition?: (cb: () => void) => unknown;
    }
  ).startViewTransition?.bind(document);
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  if (!start || reduce) {
    update();
    return;
  }
  start(() => flushSync(update));
}
