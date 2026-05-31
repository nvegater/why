export type SourceKind =
  | "adr"
  | "pr"
  | "commit"
  | "slack"
  | "email"
  | "notion"
  | "doc";

export interface Source {
  kind: SourceKind;
  label: string;
  url?: string;
  excerpt?: string;
}

export interface Argument {
  claim: string;
  sources: Source[];
}

export type TimelineEventKind =
  | "context"
  | "revisit"
  | "partial-reversal"
  | "reversal";

export interface TimelineEvent {
  date: string;
  title: string;
  summary: string;
  kind: TimelineEventKind;
  source?: Source;
}

export interface RelatedRef {
  id: string;
  title: string;
}

export interface Decision {
  id: string;
  title: string;
  date: string;
  owner: string;
  reviewers: string[];
  audience: "technical" | "non-technical";
  sourceSystem: "github" | "workspace";
  alternatives: string[];
  arguments: Argument[];
  related: RelatedRef[];
  timeline: TimelineEvent[];
  keywords: string[];
}

export type DecisionCard = Omit<Decision, "keywords" | "timeline"> & {
  laterEventCount: number;
};
