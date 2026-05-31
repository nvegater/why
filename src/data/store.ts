import { MockDecisionStore } from "@/data/mock/mock-store.js";
import type { Decision, DecisionCard } from "@/data/types.js";

export interface DecisionMatch {
  decision: Decision;
  score: number;
}

export interface DecisionStore {
  search(query: string): Promise<DecisionMatch[]>;
  getById(id: string): Promise<Decision | null>;
}

export function toCard(decision: Decision): DecisionCard {
  const { gaps = [], keywords, timeline, ...rest } = decision;
  void keywords;

  return {
    ...rest,
    gaps,
    laterEventCount: timeline.length,
  };
}

let instance: DecisionStore | null = null;

export function getStore(): DecisionStore {
  return (instance ??= new MockDecisionStore());
}
