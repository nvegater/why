/**
 * The connectors a user wires up during onboarding so Y knows where to look for
 * decisions. Kept as plain, server-safe data (no JSX) so `server.ts` can return
 * the catalog in `structuredContent` without pulling React into the Node bundle.
 * The per-connector brand mark + accent live view-side in
 * `views/components/connectors/connector-logo.tsx`, mirroring how `types.ts`
 * stays separate from `brand-marks.tsx`.
 */

export type ConnectorId = "slack" | "gmail" | "notion" | "github";

export interface Connector {
  id: ConnectorId;
  /** Provider display name, e.g. "Slack". */
  name: string;
  /** One-line hint of what Y reads from this source. */
  blurb: string;
  /**
   * Provider sign-in page opened during the (mocked) authorize step. Each host
   * must be declared in the tool's `view.csp.redirectDomains` (see server.ts).
   */
  authUrl: string;
}

export const CONNECTORS: Connector[] = [
  {
    id: "slack",
    name: "Slack",
    blurb: "Channels & threads",
    authUrl: "https://slack.com/signin",
  },
  {
    id: "gmail",
    name: "Gmail",
    blurb: "Email & threads",
    authUrl: "https://accounts.google.com/signin",
  },
  {
    id: "notion",
    name: "Notion",
    blurb: "Docs & wikis",
    authUrl: "https://www.notion.so/login",
  },
  {
    id: "github",
    name: "GitHub",
    blurb: "Repos, PRs & ADRs",
    authUrl: "https://github.com/login",
  },
];
