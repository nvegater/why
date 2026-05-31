import type { ConnectorId } from "@/data/connectors.js";

/**
 * Demo persistence for "has the user finished connector onboarding".
 *
 * Skybridge's own `useViewState` is localStorage-backed, but keyed per view
 * instance (`viewUUID`), so it can't gate a *fresh* invocation of the tool. This
 * is a single global key you can inspect or clear from the view iframe's devtools
 * console to re-run the demo:
 *
 *   localStorage.getItem("y:onboarding")
 *   localStorage.removeItem("y:onboarding")   // → back to first run
 *
 * Every access is guarded: a stricter host sandbox can make `localStorage` throw,
 * in which case we fall back to an in-memory window global (per-session only, so
 * it won't survive a refresh — but it won't crash the view either).
 */

const KEY = "y:onboarding";

export interface OnboardingRecord {
  done: boolean;
  connectedIds: ConnectorId[];
}

const EMPTY: OnboardingRecord = { done: false, connectedIds: [] };

type WindowWithFallback = Window & { __yOnboarding?: OnboardingRecord };

export function getOnboarding(): OnboardingRecord {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...EMPTY, ...(JSON.parse(raw) as OnboardingRecord) };
  } catch {
    const fallback = (window as WindowWithFallback).__yOnboarding;
    if (fallback) return fallback;
  }
  return EMPTY;
}

export function setOnboarding(record: OnboardingRecord): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(record));
  } catch {
    (window as WindowWithFallback).__yOnboarding = record;
  }
}

export function resetOnboarding(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    delete (window as WindowWithFallback).__yOnboarding;
  }
}
