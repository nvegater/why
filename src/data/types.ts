export type SourceKind =
  | "adr"
  | "pr"
  | "commit"
  | "slack"
  | "email"
  | "notion"
  | "doc";

export interface SlackMessage {
  author: string;
  handle?: string;
  time: string;
  text: string;
  decisive?: boolean;
}

export interface EmailQuote {
  text: string;
  decisive?: boolean;
}

export interface PullRequestComment {
  author: string;
  handle?: string;
  body: string;
  decisive?: boolean;
}

/**
 * Source-specific rich content rendered inside the in-widget source layer.
 * Discriminated on `type` (decoupled from SourceKind so adr/doc/notion can
 * share the "document" shape; the source's `kind` still drives icon + label).
 * Lives view-only: it is split into the tool's `_meta` and never reaches the
 * model, so prose can't restate it. See store.ts:collectSourceDetails.
 */
export type SourceDetail =
  | {
      type: "slack";
      channel: string;
      messages: SlackMessage[];
    }
  | {
      type: "email";
      from: string;
      to: string[];
      date: string;
      subject: string;
      quotes: EmailQuote[];
    }
  | {
      type: "pr";
      repo: string;
      number: number;
      state: "merged" | "open" | "closed";
      title: string;
      author: string;
      summary: string;
      comments: PullRequestComment[];
    }
  | {
      type: "commit";
      repo: string;
      sha: string;
      message: string;
      author: string;
      date: string;
      files?: string[];
    }
  | {
      type: "document";
      title: string;
      status?: string;
      section?: string;
      body: string;
      decisiveLines?: string[];
    };

export interface Source {
  /** Stable id joining the model-facing source to its view-only detail. */
  id: string;
  kind: SourceKind;
  label: string;
  url?: string;
  excerpt?: string;
  /** Rich, source-specific content; stripped from structuredContent into _meta. */
  detail?: SourceDetail;
}

export interface Argument {
  claim: string;
  /** ISO local date or date-time for the decision-making moment behind this claim. */
  decidedAt?: string;
  sources: Source[];
}

export interface InformationGap {
  label: string;
  detail: string;
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
  gaps?: InformationGap[];
  keywords: string[];
}

export type DecisionCard = Omit<Decision, "keywords" | "timeline"> & {
  laterEventCount: number;
  gaps: InformationGap[];
};
