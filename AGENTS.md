# AGENTS.md

Guidance for AI coding agents (Claude Code, Codex, Cursor, etc.) working in this repository. This is the source of truth — `CLAUDE.md` just points here.

**Always use the `chatgpt-app-builder` skill when planning or updating the codebase.** It carries the Skybridge-specific guidance (UX guidelines, view authoring, deploy flow) that this file does not duplicate. The skill is pinned in `skills-lock.json` from `alpic-ai/skybridge`.

## Project

**Y** — an MCP App that surfaces engineering decision history (ADRs, Slack threads, PR descriptions) inside ChatGPT and Claude. It returns interactive "Decision Cards" you can walk: who decided what, when, and the arguments that won, each claim linking back to the source.

The current codebase is the **Skybridge starter template** — the `start` (onboarding deck) and `get-fortune-cookie` tools are placeholder examples. Real Y tooling has not been built yet; treat the existing tool registrations as reference patterns, not as the product.

## Toolchain

- **Package manager**: pnpm (lockfile is `pnpm-lock.yaml`).
- **Node**: 24+ required by `package.json` (`engines.node: >=24.14.1`); Dockerfile uses `node:24-slim`.
- **Framework CLIs** (both pre-installed in `node_modules/.bin`):
  - `skybridge` (alias `sb`) — local dev + build orchestrator (oclif).
  - `alpic` — Alpic cloud lifecycle (login, link, deploy, logs, audit, publish, tunnel).
- **No test runner, linter, or formatter is configured.** Don't invent one — if tests are needed, ask first which framework (Vitest is what Skybridge itself uses internally, but it's not wired into this repo).

## Running locally

```bash
pnpm install
pnpm dev                  # MCP server at http://localhost:3000/mcp + DevTools UI at http://localhost:3000
```

`skybridge dev` flags (pass through after `pnpm dev --`):
- `-p, --port <n>` — change port (default 3000).
- `--tunnel` — opens an Alpic tunnel so remote clients (ChatGPT, Claude) can hit your local server. Equivalent to `pnpm dev:tunnel`. Tunnel mode also unlocks the Alpic playground for chatting with a real LLM against your local app.
- `--open` / `--no-open` — auto-open DevTools in the browser (default on).
- `-v, --verbose` — surface tunnel logs.

**Hot module replacement**: edits in `src/views/**` reload instantly inside the running App. Changes to `src/server.ts` (tool definitions) require refreshing the MCP client's tool list to pick up.

### Production build

```bash
pnpm build                # skybridge build — bundles views (Vite) + emits dist/server.js and dist/vite-manifest.js
pnpm start                # skybridge start (-p <port>) — runs the built server
node dist/server.js       # what the Dockerfile actually runs (no wrapper, so SIGTERM works correctly on Cloud Run/Fly/k8s)
```

### Tests

There is **no test setup in this repo right now**. No `test` script in `package.json`, no Vitest/Jest config, no test files. If you're asked to add tests, surface this first and ask which runner to wire up — don't silently scaffold one.

## Deploying with Alpic

`alpic.json` is the deploy manifest (currently just `{"$schema": "..."}`). Alpic is one cloud option — Skybridge is vendor-agnostic, so the Dockerfile is also a valid path. The Alpic CLI flow:

```bash
pnpm exec alpic login                            # OAuth via browser, stores tokens
pnpm exec alpic whoami                           # confirm identity
pnpm exec alpic link                             # link cwd to an Alpic project (creates one if needed)
pnpm deploy                                      # === alpic deploy (interactive prompts)
pnpm exec alpic deploy --non-interactive \
  --project-name y --runtime node24              # CI-friendly form
pnpm exec alpic logs --follow                    # stream runtime logs (also: --since 1h, --level ERROR, --search <regex>)
pnpm exec alpic audit                            # run a beacon audit on the deployed MCP server
pnpm exec alpic audit --url https://my-server.example.com/mcp --json   # standalone audit
pnpm exec alpic publish                          # push to the public MCP registry (needs --domain, --title, --description)
pnpm exec alpic tunnel --port 3000               # standalone tunnel (without skybridge dev)
```

Runtimes available on Alpic: `node24`, `node22`, `python3.13`, `python3.14`. `alpic deploy --env-file .env` seeds env vars for new projects only; otherwise use the `alpic environment-variable` topic to manage them after the fact. Other useful topics: `alpic project`, `alpic environment`, `alpic team`, `alpic git`, `alpic playground`, `alpic deployment`.

## Architecture

### Server ↔ view contract

The whole framework is one tight loop:

1. **`src/server.ts`** builds an `McpServer` (from `skybridge/server`) and calls `.registerTool(...)`. Each tool has a `name`, `inputSchema` (Zod), an async handler that returns `{ structuredContent, content, isError }`, and optionally a `view: { component: "<name>" }` config.
2. The `component` string maps to a file at **`src/views/<name>.tsx`** by exact match — `view.component: "onboarding"` requires `src/views/onboarding.tsx`. Renaming one without the other silently breaks the view.
3. **`src/helpers.ts`** does `generateHelpers<AppType>()` where `AppType = typeof server` is re-exported from `server.ts`. This is what makes `useToolInfo<"start">()` and `useCallTool("get-fortune-cookie")` type-safe against the tool registry. Adding a tool in `server.ts` automatically types the corresponding hook calls — no manual wiring.
4. Views render inside an **iframe on the host** (ChatGPT/Claude), so all the React hooks come from `skybridge/web`, not from a DOM context you control.

### Data flow primitives (skybridge/web)

These hooks are the entire surface between the host, the view, and the model. Each onboarding step in `src/views/components/steps/` is a worked example of one:

- **`useToolInfo<"toolName">()`** — read the input/output/metadata of the tool that opened the view. See `tool-output.tsx`.
- **`useViewState<T>()`** — persist UI state on the host; the LLM also sees it. See `use-mascot.ts` + `state.tsx`.
- **`useCallTool("toolName")`** — invoke a server tool from inside the view. See `tool-call.tsx`.
- **`useLayout()`** — read host theme/display mode/locale. See `onboarding.tsx`.
- **`useOpenExternal()`** — open URLs in a new tab from inside the iframe. See `outro.tsx`.
- **`data-llm` attribute** — describe a UI element to the model in natural language so it can reason about what the user is seeing (e.g. `<span data-llm="Mascot is wearing fez">`). See `state.tsx`.

### Production server quirk

`server.ts` does `await import("./vite-manifest.js")` and calls `server.setViteManifest(manifest)` only when `NODE_ENV === "production"`. The `vite-manifest.js` is generated by `skybridge build` — don't expect it to exist in dev, and don't commit it.

### CSP for external resources

If a view loads fonts, images, redirects, etc. from outside the host, **declare the domains in the tool's `view.csp`** (`resourceDomains`, `redirectDomains`) in `server.ts`. The `start` tool whitelists Google Fonts and `docs.skybridge.tech` as an example.

### Path aliases & module conventions

- `@/*` resolves to `./src/*` (configured in both `tsconfig.json` and `vite.config.ts`).
- `tsconfig.json` extends `skybridge/tsconfig` and includes `.skybridge/**/*.d.ts` (generated types).
- ESM throughout: imports use explicit `.js` extensions even for `.ts`/`.tsx` source. This is intentional, not a typo.
- `pnpm-workspace.yaml` declares `allowBuilds: esbuild: true` to permit esbuild's postinstall.

### Styling

Tailwind v4 via `@tailwindcss/vite`. Global styles in `src/index.css`. Components come from `@alpic-ai/ui/components/*` (Button, Card, etc.) and icons from `lucide-react`. `sonner` is available for toasts, `tw-animate-css` for animation utilities.

### Repo state

This directory is **not a git repository** — `git init` first if you need version control. `.gitignore` is already set up (excludes `node_modules`, `dist`, `.env*`, `.DS_Store`, `*.tsbuildinfo`, `.skybridge/`).
