# NanoClaw docs portal v2 refactor — design

**Date:** 2026-06-10
**Status:** Approved pending final review
**Repo:** glifocat/nanoclaw-docs (Mintlify site at nanoclaw.dev)
**Upstream:** nanocoai/nanoclaw (canonical; `qwibitai` URLs redirect)
**Upstream ref verified against:** `820cd8e` (main, 2026-06)

## Problem

The docs portal drifted badly from the v2.0.0 ground-up rewrite of NanoClaw. Beyond stale pages, structural fictions persist: an "API Reference" tab for an HTTP API that does not exist, pages for v1 fork-skills that were removed, and a skills-as-git-branches model that v2 never implemented. The docs repo's own `CLAUDE.md` still teaches the v1 architecture to every Claude session, perpetuating the drift. Upstream's `docs/`, `README.md`, and `CLAUDE.md` have drifted too, so they cannot be trusted as sources.

## Decisions (made with Ethan, 2026-06-10)

| Decision | Choice |
|---|---|
| Audiences | All four: self-hosters/operators, skill builders, evaluators, core contributors |
| Primary audience | Self-hosters/operators — landing page, quickstart, and default tab optimize for them |
| v1 content | Dropped entirely. v2-only docs; v1 readable from git history. A migration page covers the v1→v2 path |
| Scope | Structure + full content rewrite in one effort, shipped as phased PRs |
| Net-new content | Yes — each audience gets at least one guided path (tutorials) |
| IA pattern | Job-based journey in one Documentation tab + a Reference tab. No audience tabs, no strict Diátaxis tabs |
| Source of truth | Code only: `src/`, `container/`, `setup/`, `.claude/skills/`, shell scripts, `package.json`. Upstream markdown is narrative input only after facts are code-confirmed |

## Code-verified facts the new IA is built on

Verified directly against source at upstream `820cd8e`:

- **No HTTP/REST API.** HTTP surface is: webhook server for Chat SDK adapters (`src/webhook-server.ts`, `/webhook/{adapterName}`, port `WEBHOOK_PORT` default 3000), an ephemeral localhost OAuth helper (`src/channels/chat-sdk-bridge.ts`), and Unix sockets for the `ncl` CLI (`src/cli/socket-server.ts`).
- **No channel adapters ship on main.** `src/channels/` holds infrastructure only: `adapter.ts`, `channel-registry.ts`, `chat-sdk-bridge.ts`, plus a built-in CLI channel (`src/channels/cli.ts`). All platform adapters live on the `channels` branch and are installed by `/add-<channel>` skills that copy files out.
- **Skills are not git branches.** 45 skills exist in `.claude/skills/` as SKILL.md instruction workflows in four categories: channel installs (`add-discord`, `add-telegram`, ...), provider installs (`add-opencode`, `add-ollama-provider`, `add-codex`), MCP tool installs (`add-gmail-tool`, `add-gcal-tool`, `add-atomic-chat-tool`, `add-ollama-tool`), and operational (`setup`, `debug`, `customize`, `manage-channels`, `manage-mounts`, `init-onecli`, `init-first-agent`, `update-nanoclaw`, `migrate-from-v1`, `migrate-from-openclaw`, ...). Plus container skills mounted into every agent session (`container/skills/`: agent-browser, onecli-gateway, self-customize, welcome, formatting skills).
- **Gmail is not a channel.** It is an MCP tool via `/add-gmail-tool` with OneCLI-managed OAuth (stub credentials in container, gateway injects real tokens in flight).
- **Setup wizards exist for 7 channels** (`setup/channels/`): discord, imessage, signal, slack, teams, telegram, whatsapp.
- **`ncl` CLI has 11 resources** (`src/cli/resources/`): groups, messaging-groups, wirings, users, roles, members, destinations, sessions, user-dms, dropped-messages, approvals.
- **Env vars** (from `src/config.ts` and `grep process.env` across `src/`): ASSISTANT_NAME, ASSISTANT_HAS_OWN_NUMBER, ONECLI_URL, ONECLI_API_KEY, TZ, CONTAINER_IMAGE, CONTAINER_IMAGE_BASE, CONTAINER_TIMEOUT, CONTAINER_MAX_OUTPUT_SIZE, MAX_MESSAGES_PER_PROMPT, IDLE_TIMEOUT, MAX_CONCURRENT_CONTAINERS, WEBHOOK_PORT, LOG_LEVEL, NANOCLAW_EGRESS_LOCKDOWN, NANOCLAW_EGRESS_NETWORK, ONECLI_GATEWAY_CONTAINER.
- **Egress lockdown** (`src/egress-lockdown.ts`) is an undocumented security feature.
- **Entity model:** agent_groups ↔ messaging_groups (many-to-many via wirings), sessions pair them, users/roles/members gate access, three isolation levels (separate agents / shared agent separate sessions / shared session).
- **Container runtime:** Docker default, Apple Container opt-in; agent-runner runs on Bun inside the container, host on Node; per-group container config (provider, model, mounts, packages, MCP servers) lives in the central DB, not files; mount allowlist at `~/.config/nanoclaw/mount-allowlist.json`.
- **Migration:** `migrate-v2.sh` automates v1→v2 (env merge, DB seed, group folders, session continuity, channel auth state, container build, service switchover), handing off to the `/migrate-from-v1` skill. `migrate-v2-reset.sh` is the reset path. `/migrate-from-openclaw` also exists.
- **v1 ghosts with zero presence in v2 code:** X/Twitter integration, Parallel AI integration, image-vision / voice-transcription / pdf-reader fork-skills, remote-control.

## Information architecture

Two tabs. Changelog becomes a global anchor reachable from both.

### Tab 1: Documentation

| Group | Pages |
|---|---|
| Get started | `introduction`, `quickstart`, `installation`, `migrate-from-v1` (also covers migrate-from-openclaw) |
| Channels | `channels/overview`, `channels/whatsapp`, `channels/telegram`, `channels/discord`, `channels/slack`, `channels/signal`, `channels/imessage`, `channels/teams`, `channels/cli`, `channels/more-channels` |
| Operate | `operate/configuration`, `operate/ncl-cli`, `operate/credentials`, `operate/hardening`, `operate/upgrading`, `operate/troubleshooting` |
| Build with agents | `guides/first-agent`, `guides/scheduled-tasks`, `guides/multi-agent-swarm`, `guides/customize-an-agent` |
| Extend | `extend/overview`, `extend/tools`, `extend/providers`, `extend/self-modification`, `extend/writing-skills` |
| Understand | `concepts/architecture`, `concepts/entity-model`, `concepts/isolation-levels`, `concepts/container-lifecycle`, `concepts/security`, `concepts/contributing` |
| Changelog | `changelog/index`, `changelog/docs-updates` (global anchor) |

Group intents:

- **Get started** — evaluator hook + operator funnel. `migrate-from-v1` is net-new, sourced from `migrate-v2.sh` and the `/migrate-from-v1` + `/migrate-from-openclaw` skills.
- **Channels** — overview explains the v2 model (main ships infrastructure; `/add-<channel>` copies the adapter from the `channels` branch; setup wizards guide auth). One page per wizard-supported channel; `channels/cli` documents the built-in terminal channel; `more-channels` catalogs the long tail (Matrix, Webex, WeChat, GitHub, Linear, Google Chat, Resend, DeltaChat, WhatsApp Cloud, ...).
- **Operate** — day-2 operations. `hardening` consolidates egress lockdown, mount allowlist, sender policies, and Docker sandboxes. `credentials` covers OneCLI Agent Vault, `/init-onecli`, and the opt-in `/use-native-credential-proxy` skill (exists in v2 `.claude/skills/`).
- **Build with agents** — net-new tutorials. The swarm tutorial rebuilds the PR-review worker/manager/supervisor example as a followable guide.
- **Extend** — skill-builder audience. `overview` presents the four skill categories; `writing-skills` teaches authoring a SKILL.md workflow.
- **Understand** — evaluators and contributors. Top-down mental models (what is an agent group, why three isolation levels) before implementation detail.

### Tab 2: Reference

| Page | Code source |
|---|---|
| `reference/ncl-cli` | `src/cli/resources/` (11 resources) |
| `reference/environment-variables` | `src/config.ts` + `grep process.env src/` |
| `reference/container-config` | `container_configs` schema + `src/container-runner.ts` |
| `reference/skills-catalog` | `.claude/skills/` listing (all 45) |
| `reference/adapter-interface` | `src/channels/adapter.ts` |
| `reference/mcp-tools` | `container/agent-runner/src/mcp-tools/` |
| `reference/db-schema` | `src/db/schema.ts`, `src/db/session-db.ts` |

### Page dispositions

Every moved or deleted URL gets an entry in the `docs.json` `redirects` array.

| Current page | Disposition |
|---|---|
| `introduction`, `quickstart`, `installation` | Rewrite in place |
| `concepts/architecture` | Rewrite (v2 inbox/outbox, router, delivery, host-sweep) |
| `concepts/security` | Rewrite as `concepts/security` (threat model) with operational parts moving to `operate/hardening` |
| `concepts/containers` | Rewrite as `concepts/container-lifecycle` |
| `concepts/groups` | Rewrite as `concepts/entity-model` |
| `concepts/tasks` | Fold into `guides/scheduled-tasks` + `reference/mcp-tools` |
| `features/messaging` | Fold into `channels/overview` + `concepts/architecture` |
| `features/scheduled-tasks` | Rewrite as `guides/scheduled-tasks` |
| `features/agent-swarms` | Rewrite as `guides/multi-agent-swarm` |
| `features/customization` | Rewrite as `guides/customize-an-agent` + `extend/self-modification` |
| `features/cli` | Split: `channels/cli` (CLI channel) + `operate/ncl-cli` (admin CLI) |
| `features/web-access` | Fold into `extend/tools` (agent-browser container skill) |
| `features/voice-transcription`, `features/image-vision`, `features/pdf-reader` | Delete (v1 fork-skills, no v2 presence). Redirect to `channels/overview` |
| `integrations/overview` | Becomes `channels/overview` |
| `integrations/skills-system` | Rewrite as `extend/overview` (the v1 "source of truth" page is wrong) |
| `integrations/{whatsapp,telegram,discord,slack}` | Rewrite as `channels/*` |
| `integrations/gmail` | Rewrite as part of `extend/tools` (MCP tool, not channel) |
| `integrations/ollama` | Rewrite as part of `extend/providers` |
| `integrations/x-twitter`, `integrations/parallel-ai` | Delete (zero v2 code presence). Redirect to `channels/more-channels` and `extend/tools` |
| `advanced/security-model` | Merge into `concepts/security` |
| `advanced/container-runtime` | Merge into `concepts/container-lifecycle` |
| `advanced/docker-sandboxes` | Fold into `operate/hardening` |
| `advanced/ipc-system` | Fold into `concepts/architecture` (v2 model is inbox/outbox SQLite, not the v1 IPC described) |
| `advanced/remote-control` | Delete (no v2 presence). Redirect to `operate/ncl-cli` |
| `advanced/troubleshooting` | Rewrite as `operate/troubleshooting` |
| `advanced/contributing` | Rewrite as `concepts/contributing` |
| `api/*` (8 pages) | Delete tab; redirect each to the matching `reference/*` page |
| `changelog/*` | Keep |
| `snippets/*` | Re-verify; keep only if commands match v2 |

## Front door and audience routing

`introduction.mdx` becomes a router. Short evaluator hook (containers, multi-agent, codebase small enough for Claude's context — verify current token count against `repo-tokens/badge.svg`, ~185k at `820cd8e`), then a 4-card grid:

1. **Run it** → `/quickstart` (primary audience)
2. **Coming from v1 or OpenClaw** → `/migrate-from-v1`
3. **Make it yours** → `/extend/overview`
4. **How it works** → `/concepts/architecture`

Quickstart stays the first item after introduction. Operators see their full journey in sidebar order without tab switching.

## Code-first verification methodology

- Every rewritten page carries an MDX comment near the top: `{/* verified-against: <file paths> @ <upstream short-sha> */}`. Invisible to readers; gives the sync workflows and future sessions a diffable anchor for drift detection.
- Rewrite instructions (for agents and humans): read `.ts` source, `setup/`, SKILL.md files, and shell scripts. Upstream `docs/*.md`, `README.md`, and `CLAUDE.md` may inform narrative only after facts are code-confirmed. Known counterexample: upstream `docs/skills-as-branches.md` describes a model v2 does not use.
- Code snippets in docs must match actual source (existing convention; prose uses product names, code matches `src/`).

## Delivery plan

Phased PRs against `main`, each passing `mint validate` and `mint broken-links`:

1. **PR 1 — skeleton.** New `docs.json` navigation + redirects map, file moves via `mint rename`, `qwibitai` → `nanocoai` sweep, Changelog to global anchor. Existing content moves into new homes unmodified; drift banners stay on not-yet-rewritten pages.
2. **PRs 2–8 — one nav group per PR**, code-verified rewrites in priority order: Get started (incl. net-new migration page) → Channels → Operate → Reference → Understand → Extend → Build with agents. Each PR removes drift banners for its pages, adds `verified-against` comments, applies `tag: "NEW"` (net-new) or `tag: "UPDATED"` (rewrites).
3. **PR 9 — meta.** Rewrite the docs repo `CLAUDE.md` (v2 architecture facts, new IA, code-first rule), update `.mintlify/workflows/` assumptions, `mint a11y` pass, changelog entries in both changelogs.

Post-merge: verify via the `nanoclaw-docs` MCP search index; close any overlapping automated `mintlify/*` PRs immediately.

## Risks and mitigations

- **Upstream moves while we write** — pin all verification to one upstream SHA per PR (recorded in `verified-against` comments); the sync workflow catches post-refactor drift.
- **SEO/link breakage** — full redirects map in PR 1; `mint broken-links` in every PR; old URLs never 404.
- **Automated workflow conflicts** — `mintlify/*` PRs generated mid-refactor against the old structure get closed and their verified deltas folded into the in-flight group PR.
- **Spec/plan files breaking `mint validate`** — `docs/` is in `.mintignore` and stays out of the published site.

## Out of scope

- Versioned v1 docs (dropped by decision)
- Localization (Mintlify supports it later; upstream has ja/zh READMEs)
- OpenAPI/playground tooling (no HTTP API exists)
- Upstream code or upstream-docs fixes (separate effort in the nanoclaw repo)
