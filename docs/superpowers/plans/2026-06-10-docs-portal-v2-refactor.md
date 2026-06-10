# NanoClaw Docs Portal v2 Refactor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild nanoclaw.dev as an audience-oriented, v2-only, code-verified docs site per the approved spec at `docs/superpowers/specs/2026-06-10-docs-portal-v2-refactor-design.md`.

**Architecture:** Job-based journey IA — one "Documentation" tab (Get started → Channels → Operate → Build with agents → Extend → Understand) plus a "Reference" tab derived from code. Nine sequential PRs: skeleton + redirects first, then one nav group per PR, finishing with meta (CLAUDE.md, workflows). Every page is verified against NanoClaw source at a pinned upstream SHA, never against upstream markdown.

**Tech Stack:** Mintlify (docs.json, MDX), `mint` CLI, `gh` CLI, git worktrees for upstream source.

---

## Context for the engineer (read first)

**Repos and paths:**
- Docs repo (this repo): `/Users/ethanmunoz/Projects/nanoco/nanoclaw-docs`, GitHub `glifocat/nanoclaw-docs`, deploys to nanoclaw.dev automatically on merge to `main` via the Mintlify GitHub app.
- Upstream source: `nanocoai/nanoclaw` (canonical; `qwibitai` URLs redirect). Local clone with `upstream` remote: `/Users/ethanmunoz/Projects/clients/qwibit/nanoclaw-glifocat`.
- Upstream source worktree for verification: `/tmp/nanoclaw-v2`.

**The code-first rule (non-negotiable):** Upstream's `docs/`, `README.md`, and `CLAUDE.md` are drifted and MUST NOT be treated as sources of truth. Every factual claim in a docs page must be verified against actual code: `src/`, `container/`, `setup/`, `.claude/skills/*/SKILL.md` (skills ARE their SKILL.md), `nanoclaw.sh`, `migrate-v2.sh`, `package.json`. Upstream markdown may inform narrative framing only after the facts are code-confirmed. Known traps already caught: upstream docs claim Apple Container support (false — `src/container-runtime.ts:12` hardcodes `docker`), `docs/skills-as-branches.md` describes a model v2 never implemented, and a prior exploration invented a LinkedIn adapter.

**Verified-against comments:** Every rewritten or new page gets an MDX comment immediately after the frontmatter:

```mdx
{/* verified-against: src/config.ts, src/cli/resources/groups.ts @ <UPSTREAM_SHA> */}
```

List the actual files used to verify that page. `<UPSTREAM_SHA>` is the short SHA pinned at the start of the page's PR (see per-PR setup task).

**Drift banners:** Some pages carry `<Warning>` banners containing the phrase "This page describes" (added by PR #264 and earlier). When you rewrite a page, delete its banner. Ghost pages with banners get deleted entirely. Find remaining banners any time with:

```bash
grep -rln "This page describes" --include="*.mdx" .
```

**Mintlify conventions for this site (from CLAUDE.md, kept by this refactor):**
- Every page: frontmatter with `title`, `description`, `keywords`. New pages add `tag: "NEW"`; rewritten pages add `tag: "UPDATED"` (auto-cleaned after 2 weeks by workflows).
- Headings in sentence case. Second person, active voice. No marketing language, no emoji. All code blocks have language tags. All images have alt text.
- Diagrams: Mermaid (```mermaid blocks), never ASCII art. Directory trees: `<Tree>` component.
- Internal links: root-relative without extension (`/channels/overview`).
- `mint validate` must run from the repo root (where `docs.json` lives).
- Code snippets in docs must match actual upstream source verbatim — prose says product names ("Agent Vault"), code blocks match `src/` (e.g., "gateway").

**Per-PR workflow (every PR in this plan):**

1. Start from fresh main: `git checkout main && git pull --rebase origin main && git checkout -b <branch>`
2. Pin upstream (rewrites only — skip for PR 1 and PR 9):
   ```bash
   cd /Users/ethanmunoz/Projects/clients/qwibit/nanoclaw-glifocat && git fetch upstream
   git worktree remove /tmp/nanoclaw-v2 --force 2>/dev/null; git worktree add /tmp/nanoclaw-v2 upstream/main
   git -C /tmp/nanoclaw-v2 rev-parse --short HEAD   # this is UPSTREAM_SHA for the PR
   cd /Users/ethanmunoz/Projects/nanoco/nanoclaw-docs
   ```
3. Before creating the PR: `mint validate` (must pass) and `mint broken-links` (no new breaks).
4. Create PR with metadata (labels listed per PR below; assignee glifocat):
   ```bash
   gh pr create --title "<title>" --body "<body>" --label <labels> --assignee glifocat
   ```
5. After merge: `git checkout main && git pull --rebase origin main` (the Mintlify deploy bot pushes to main immediately after merge — always rebase before any follow-up push).
6. After merge: check for and close overlapping automated `mintlify/*` PRs (`gh pr list --search "head:mintlify"`); fold any verified deltas into the next in-flight PR.

**Page anatomy for rewrites.** Each page task below gives: Sources (code files to read in `/tmp/nanoclaw-v2`), Must cover (facts the page must state), and an Outline. The engineer writes the prose; the facts and structure are fixed. Read every listed source before writing — do not write from this plan's summaries alone.

---

## PR 1 — Skeleton: new IA, file moves, redirects, org rename

Branch: `refactor/pr1-skeleton`. Labels: `update-existing`, `high-priority`.
No upstream pinning needed (no content rewrites). The two unpushed spec/plan commits on local main ride along in this PR.

### Task 1.1: Move files into the new tree

**Files:** moves only, no content edits.

- [ ] **Step 1: Create directories and move files with git mv**

```bash
mkdir -p channels operate guides extend
git mv integrations/overview.mdx channels/overview.mdx
git mv integrations/whatsapp.mdx channels/whatsapp.mdx
git mv integrations/telegram.mdx channels/telegram.mdx
git mv integrations/discord.mdx channels/discord.mdx
git mv integrations/slack.mdx channels/slack.mdx
git mv integrations/skills-system.mdx extend/overview.mdx
git mv integrations/ollama.mdx extend/providers.mdx
git mv integrations/gmail.mdx extend/tools.mdx
git mv features/scheduled-tasks.mdx guides/scheduled-tasks.mdx
git mv features/agent-swarms.mdx guides/multi-agent-swarm.mdx
git mv features/customization.mdx guides/customize-an-agent.mdx
git mv features/cli.mdx operate/ncl-cli.mdx
git mv advanced/troubleshooting.mdx operate/troubleshooting.mdx
git mv advanced/docker-sandboxes.mdx operate/hardening.mdx
git mv advanced/contributing.mdx concepts/contributing.mdx
git mv concepts/groups.mdx concepts/entity-model.mdx
git mv concepts/containers.mdx concepts/container-lifecycle.mdx
```

- [ ] **Step 2: Delete ghost and fold-target pages**

```bash
git rm features/messaging.mdx features/web-access.mdx \
  features/voice-transcription.mdx features/image-vision.mdx features/pdf-reader.mdx \
  integrations/x-twitter.mdx integrations/parallel-ai.mdx \
  concepts/tasks.mdx \
  advanced/security-model.mdx advanced/container-runtime.mdx \
  advanced/ipc-system.mdx advanced/remote-control.mdx
rmdir integrations features advanced 2>/dev/null || true
```

Rationale per spec: messaging/web-access fold into other pages; voice-transcription, image-vision, pdf-reader, x-twitter, parallel-ai, remote-control have zero v2 code presence; tasks/security-model/container-runtime/ipc-system merge into rewrite targets. Content is drifted v1 prose — rewrites in later PRs are code-first, so nothing worth carrying is lost (git history retains it).

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "refactor: move pages into job-based tree, delete v1 ghosts"
```

### Task 1.2: Rewrite docs.json navigation and add redirects

**Files:** Modify: `docs.json`

- [ ] **Step 1: Replace the `navigation` object**

Replace the entire `navigation` value with (later PRs append their new pages to these groups):

```json
{
  "global": {
    "anchors": [
      { "anchor": "Changelog", "icon": "clock-rotate-left", "href": "https://nanoclaw.dev/changelog/index" }
    ]
  },
  "tabs": [
    {
      "tab": "Documentation",
      "groups": [
        { "group": "Get started", "icon": "rocket",
          "pages": ["introduction", "quickstart", "installation"] },
        { "group": "Channels", "icon": "tower-broadcast",
          "pages": ["channels/overview", "channels/whatsapp", "channels/telegram", "channels/discord", "channels/slack"] },
        { "group": "Operate", "icon": "gauge",
          "pages": ["operate/ncl-cli", "operate/hardening", "operate/troubleshooting"] },
        { "group": "Build with agents", "icon": "wand-magic-sparkles",
          "pages": ["guides/scheduled-tasks", "guides/multi-agent-swarm", "guides/customize-an-agent"] },
        { "group": "Extend", "icon": "puzzle-piece",
          "pages": ["extend/overview", "extend/tools", "extend/providers"] },
        { "group": "Understand", "icon": "lightbulb",
          "pages": ["concepts/architecture", "concepts/entity-model", "concepts/container-lifecycle", "concepts/security", "concepts/contributing"] },
        { "group": "Changelog", "icon": "clock-rotate-left",
          "pages": ["changelog/index", "changelog/docs-updates"] }
      ]
    },
    {
      "tab": "Reference",
      "groups": [
        { "group": "Legacy API docs (being replaced)",
          "pages": ["api/overview", "api/configuration", "api/message-routing", "api/group-management", "api/task-scheduling", "api/skills/creating-skills", "api/skills/skill-structure", "api/skills/examples"] }
      ]
    }
  ]
}
```

Note: the `api/*` pages stay temporarily under Reference with their drift banners; PR 5 replaces them. If `mint validate` rejects the global-anchor `href` form, drop the global anchor (the Changelog group already provides access) and note it in the PR body.

- [ ] **Step 2: Add the `redirects` array to docs.json (top level, after `seo`)**

```json
"redirects": [
  { "source": "/integrations/overview", "destination": "/channels/overview" },
  { "source": "/integrations/whatsapp", "destination": "/channels/whatsapp" },
  { "source": "/integrations/telegram", "destination": "/channels/telegram" },
  { "source": "/integrations/discord", "destination": "/channels/discord" },
  { "source": "/integrations/slack", "destination": "/channels/slack" },
  { "source": "/integrations/skills-system", "destination": "/extend/overview" },
  { "source": "/integrations/ollama", "destination": "/extend/providers" },
  { "source": "/integrations/gmail", "destination": "/extend/tools" },
  { "source": "/integrations/x-twitter", "destination": "/channels/overview" },
  { "source": "/integrations/parallel-ai", "destination": "/extend/tools" },
  { "source": "/features/scheduled-tasks", "destination": "/guides/scheduled-tasks" },
  { "source": "/features/agent-swarms", "destination": "/guides/multi-agent-swarm" },
  { "source": "/features/customization", "destination": "/guides/customize-an-agent" },
  { "source": "/features/cli", "destination": "/operate/ncl-cli" },
  { "source": "/features/messaging", "destination": "/channels/overview" },
  { "source": "/features/web-access", "destination": "/extend/tools" },
  { "source": "/features/voice-transcription", "destination": "/channels/overview" },
  { "source": "/features/image-vision", "destination": "/channels/overview" },
  { "source": "/features/pdf-reader", "destination": "/channels/overview" },
  { "source": "/concepts/groups", "destination": "/concepts/entity-model" },
  { "source": "/concepts/containers", "destination": "/concepts/container-lifecycle" },
  { "source": "/concepts/tasks", "destination": "/guides/scheduled-tasks" },
  { "source": "/advanced/security-model", "destination": "/concepts/security" },
  { "source": "/advanced/container-runtime", "destination": "/concepts/container-lifecycle" },
  { "source": "/advanced/docker-sandboxes", "destination": "/operate/hardening" },
  { "source": "/advanced/ipc-system", "destination": "/concepts/architecture" },
  { "source": "/advanced/remote-control", "destination": "/operate/ncl-cli" },
  { "source": "/advanced/troubleshooting", "destination": "/operate/troubleshooting" },
  { "source": "/advanced/contributing", "destination": "/concepts/contributing" }
]
```

- [ ] **Step 3: Validate and commit**

```bash
mint validate          # expect: "build validation passed"
mint broken-links      # moved pages may reveal stale internal links — fix any that point to old paths
git add docs.json && git commit -m "refactor: job-based navigation, redirects for all moved/deleted URLs"
```

### Task 1.3: Fix internal links broken by the moves

- [ ] **Step 1: Find and fix stale internal links**

```bash
grep -rn "/integrations/\|/features/\|/advanced/\|/concepts/groups\|/concepts/containers\|/concepts/tasks" --include="*.mdx" . | grep -v "docs/superpowers"
```

Update every hit to the new path per the redirects table above (in-page links must not rely on redirects). Re-run `mint broken-links` until clean.

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "refactor: update internal links to new paths"
```

### Task 1.4: qwibitai → nanocoai sweep

- [ ] **Step 1: Replace all org references**

```bash
grep -rln "qwibitai" --include="*.mdx" --include="*.json" --include="*.md" . | grep -v docs/superpowers
```

In every hit (includes `docs.json` navbar, footer, anchors, and many pages), replace `github.com/qwibitai/nanoclaw` with `github.com/nanocoai/nanoclaw`. Leave `glifocat/nanoclaw-docs` references untouched.

- [ ] **Step 2: Validate and commit**

```bash
mint validate && git add -A && git commit -m "chore: update upstream org qwibitai -> nanocoai"
```

### Task 1.5: Create the PR

- [ ] **Step 1:**

```bash
git push -u origin refactor/pr1-skeleton
gh pr create --title "refactor: v2 IA skeleton — new navigation, redirects, org rename" \
  --label update-existing --label high-priority --assignee glifocat \
  --body "PR 1 of 9 (spec: docs/superpowers/specs/2026-06-10-docs-portal-v2-refactor-design.md).
Moves pages into the job-based tree, deletes v1 ghost pages with redirects, replaces the API Reference tab with a temporary legacy group, renames qwibitai->nanocoai. No content rewrites — drift banners stay until each group's rewrite PR."
```

- [ ] **Step 2: After merge** — pull, then immediately check `gh pr list --search "head:mintlify"` for automated PRs now in conflict; close them (`gh pr close N --comment "superseded by v2 refactor PR #<n>"`) and delete branches (`gh api -X DELETE repos/glifocat/nanoclaw-docs/git/refs/heads/<branch>`).

---

## PR 2 — Get started (rewrites + migration page)

Branch: `refactor/pr2-get-started`. Labels: `update-existing`, `new-page`, `high-priority`.
Pin upstream first (per-PR workflow step 2); use that `UPSTREAM_SHA` in all verified-against comments in this PR.

### Task 2.1: Rewrite `introduction.mdx` (the router)

**Sources:** `/tmp/nanoclaw-v2/src/index.ts`, `src/router.ts`, `src/channels/` (ls), `.claude/skills/` (ls), `repo-tokens/badge.svg` (token count — the ONLY valid source for it), `package.json` (version).
**Must cover:** What NanoClaw is (multi-agent Claude assistant; one host process on Node; one Docker container per active session; SQLite inbox/outbox); evaluator hook (container isolation, codebase size from badge, channels via `/add-*` skills); 4-card router grid: Run it → `/quickstart`, Coming from v1 or OpenClaw → `/migrate-from-v1`, Make it yours → `/extend/overview`, How it works → `/concepts/architecture`.
**Outline:** What is NanoClaw → router CardGroup → How it works in one diagram (Mermaid: channel → router → inbox → container/agent → outbox → delivery) → Who it's for (three short paragraphs: run it / extend it / study it).

- [ ] Step 1: Read all sources. Step 2: Rewrite page; frontmatter keeps `title`, `description`, `icon: "house"`, `sidebarTitle: "Introduction"`, set `tag: "UPDATED"`; add verified-against comment. Step 3: `mint validate`. Step 4: `git add introduction.mdx && git commit -m "docs: rewrite introduction as audience router (v2, code-verified)"`

### Task 2.2: Rewrite `quickstart.mdx`

**Sources:** `/tmp/nanoclaw-v2/nanoclaw.sh` (read fully), `setup/auto.ts`, `package.json` scripts, `.claude/skills/setup/SKILL.md`, `.claude/skills/init-first-agent/SKILL.md`, `scripts/init-first-agent.ts`.
**Must cover:** the actual one-command flow (`bash nanoclaw.sh`: installs Node/pnpm/Docker, runs `pnpm run setup:auto`, hands off to Claude on error); what setup:auto asks; first agent creation (`/init-first-agent`); sending the first message; where to go next (channels, operate). Remove its drift banner.
**Outline:** Prerequisites (just: a machine with bash + internet; Docker auto-installed) → `<Steps>` for run script / answer wizard / first agent / first message → What just happened (1 paragraph + links) → Next steps cards.

- [ ] Step 1: Read sources. Step 2: Rewrite; `tag: "UPDATED"`; verified-against comment; delete `<Warning>` drift banner. Step 3: `mint validate`. Step 4: commit `"docs: rewrite quickstart against v2 setup flow"`

### Task 2.3: Rewrite `installation.mdx`

**Sources:** `/tmp/nanoclaw-v2/nanoclaw.sh`, `setup/` (probe.sh, auto.ts, lib/), `container/Dockerfile`, `launchd/` (service install), `package.json` engines.
**Must cover:** platform support as probed by setup (macOS/Linux/WSL2 — verify in `setup/probe.sh`); what the installer does step by step; host runs Node + pnpm, agent container runs Bun (`container/Dockerfile:69`); Docker as the only runtime (`src/container-runtime.ts:12`); service installation (launchd on macOS — check what exists for Linux in code, document only what exists); manual install path (`pnpm install`, `pnpm run setup`, `pnpm start`).
**Outline:** Requirements table → What `nanoclaw.sh` does → Manual installation `<Steps>` → Running as a service → Where files live (`<Tree>`: groups/, data dir, mount allowlist path).

- [ ] Step 1: Read sources. Step 2: Rewrite; `tag: "UPDATED"`; verified-against comment. Step 3: `mint validate`. Step 4: commit `"docs: rewrite installation against v2 setup and runtime"`

### Task 2.4: Create `migrate-from-v1.mdx` (new page)

**Sources:** `/tmp/nanoclaw-v2/migrate-v2.sh` (read fully — phases 0–3 + handoff), `migrate-v2-reset.sh`, `.claude/skills/migrate-from-v1/SKILL.md`, `.claude/skills/migrate-from-openclaw/SKILL.md`, `docs/v1-to-v2-changes.md` (narrative hints ONLY — verify each claim in code).
**Must cover:** who needs this (v1 installs; OpenClaw users have `/migrate-from-openclaw`); what migrates (env keys, registered groups → central DB, group folders with `CLAUDE.md` → `CLAUDE.local.md`, session continuity, scheduled tasks, channel auth state); what does not migrate (v1 message history — intentional); the phase-by-phase run; the Claude handoff at the end; `migrate-v2-reset.sh` as the retry path.
**Outline:** Should you migrate → What carries over / what doesn't (two-column) → Run the migration `<Steps>` → After the handoff → Starting over (reset script) → Migrating from OpenClaw (section, not separate page).

- [ ] Step 1: Read sources. Step 2: Write page; frontmatter `title: "Migrate from v1 or OpenClaw"`, `tag: "NEW"`; verified-against comment. Step 3: Add `"migrate-from-v1"` to the Get started group in `docs.json` after `"installation"`. Step 4: `mint validate && mint broken-links`. Step 5: commit `"docs: add v1/OpenClaw migration guide"`

### Task 2.5: PR

- [ ] `gh pr create --title "docs: rewrite Get started group (v2, code-verified) + migration guide" --label update-existing --label new-page --label high-priority --assignee glifocat` with body listing pages + UPSTREAM_SHA. After merge: rebase main, close conflicting `mintlify/*` PRs.

---

## PR 3 — Channels

Branch: `refactor/pr3-channels`. Labels: `update-existing`, `new-page`, `high-priority`. Pin upstream.

**Shared sources for all channel pages:** the adapter on the channels branch (`git -C /Users/ethanmunoz/Projects/clients/qwibit/nanoclaw-glifocat show upstream/channels:src/channels/<name>.ts`), the setup wizard (`/tmp/nanoclaw-v2/setup/channels/<name>.ts` — exists for discord, imessage, signal, slack, teams, telegram, whatsapp), and the install skill (`/tmp/nanoclaw-v2/.claude/skills/add-<name>/SKILL.md`).

### Task 3.1: Rewrite `channels/overview.mdx`

**Sources:** `src/channels/adapter.ts` (the interface: setup/deliver/setTyping/teardown/isConnected), `src/channels/channel-registry.ts`, `src/channels/chat-sdk-bridge.ts`, `src/webhook-server.ts`, `.claude/skills/manage-channels/SKILL.md`, channels-branch listing.
**Must cover:** the v2 model (main ships adapter infrastructure; adapters live on the `channels` branch; `/add-<channel>` copies the adapter file, wires the barrel, installs pinned deps, builds — idempotent); the full verified catalog (17 adapters: WhatsApp, WhatsApp Cloud, Telegram, Discord, Slack, Signal, iMessage, Teams, Matrix, Webex, WeChat, GitHub, Linear, Google Chat, Resend, DeltaChat, Emacs) with which seven have guided setup wizards; webhook server (`/webhook/{adapterName}`, `WEBHOOK_PORT` default 3000) for Chat SDK adapters; wiring channels to agents (`/manage-channels`, `ncl wirings`). Remove drift banner if present.
**Outline:** How channels work in v2 (Mermaid: adapter → registry → router) → Installing a channel (generic `/add-<channel>` flow) → Channel catalog (table: channel / wizard? / notes) → Wiring channels to agents → link cards to per-channel pages.

- [ ] Step 1: Read sources. Step 2: Rewrite; `tag: "UPDATED"`; verified-against comment. Step 3: `mint validate`. Step 4: commit.

### Task 3.2–3.8: Rewrite/create the seven wizard-channel pages

One task per page, identical step pattern. Rewrites: `channels/whatsapp.mdx`, `channels/telegram.mdx`, `channels/discord.mdx`, `channels/slack.mdx` (remove their drift banners). New (`tag: "NEW"`): `channels/signal.mdx`, `channels/imessage.mdx`, `channels/teams.mdx`.

**Per page — Must cover:** what the platform integration does; prerequisites on the platform side (bot token / app creation / pairing — from the wizard source and SKILL.md, not memory); install (`/add-<name>` + what the wizard asks); platform-specific behavior found in the adapter source (e.g., Telegram markdown sanitization `src/channels/telegram-markdown-sanitize.ts` and pairing `telegram-pairing.ts`; WhatsApp's `ASSISTANT_HAS_OWN_NUMBER`; thread support where the adapter implements it — affects `per-thread` session mode); troubleshooting pointers.
**Outline per page:** What you get → Prerequisites → Install `<Steps>` → Platform notes → Troubleshooting.

- [ ] For each of the 7 pages: Step 1: Read that channel's three sources. Step 2: Write/rewrite; verified-against comment naming the adapter + wizard + skill files. Step 3: `mint validate`. Step 4: commit per page (`"docs: rewrite channels/<name> against v2 adapter"`).
- [ ] After all seven: add `"channels/signal", "channels/imessage", "channels/teams"` to the Channels group in `docs.json` (after `"channels/slack"`).

### Task 3.9: Create `channels/cli.mdx` (new)

**Sources:** `src/channels/cli.ts` (read fully), `scripts/init-cli-agent.ts`.
**Must cover:** the built-in terminal channel (Unix socket); what it's for (talking to agents without a messaging platform; testing); how to start a CLI conversation; relationship to `ncl` (different things: CLI channel = talk to agents, `ncl` = admin the install).
**Frontmatter:** `title: "CLI channel"`, `tag: "NEW"`.

- [ ] Steps: read → write → add `"channels/cli"` to nav after teams → `mint validate` → commit.

### Task 3.10: Create `channels/more-channels.mdx` (new)

**Sources:** channels-branch listing, each `add-*` SKILL.md description line (`head -5 .claude/skills/add-*/SKILL.md`).
**Must cover:** catalog of the 10 non-wizard adapters (Matrix, Webex, WeChat, GitHub, Linear, Google Chat, Resend, DeltaChat, Emacs, WhatsApp Cloud) — one short section each: what it connects, install command, source file name. State clearly these install via `/add-<name>` conversation with Claude rather than a wizard.

- [ ] Steps: read → write (`tag: "NEW"`) → add to nav → update the `/integrations/x-twitter` redirect destination in `docs.json` to `/channels/more-channels` → `mint validate && mint broken-links` → commit.

### Task 3.11: PR

- [ ] `gh pr create --title "docs: rewrite Channels group against v2 adapters" --label update-existing --label new-page --label high-priority --assignee glifocat`. After merge: rebase, close conflicting automated PRs.

---

## PR 4 — Operate

Branch: `refactor/pr4-operate`. Labels: `update-existing`, `new-page`, `high-priority`. Pin upstream.

### Task 4.1: Create `operate/configuration.mdx` (new)

**Sources:** `src/config.ts` (read fully), `grep -rn "process.env" src/ --include="*.ts"`, `src/db/container-configs.ts`, `config-examples/`.
**Must cover:** the `.env` file role; the operator-relevant env vars with verified defaults (ASSISTANT_NAME 'Andy', CONTAINER_TIMEOUT 1800000, CONTAINER_MAX_OUTPUT_SIZE 10485760, MAX_MESSAGES_PER_PROMPT 10, IDLE_TIMEOUT 1800000, MAX_CONCURRENT_CONTAINERS 5, WEBHOOK_PORT 3000, TZ, LOG_LEVEL, ONECLI_URL/ONECLI_API_KEY pointer to credentials page, egress vars pointer to hardening page); per-group container config living in the DB (`container_configs`, migration 014) and how to change it (point to ncl-cli page); link to the full table in `/reference/environment-variables` (added in PR 5 — use the path now, it will resolve by the time both merge; verify link order at PR 5 if PRs land out of order, or land PR 5 first — see PR 5 note).
**Decision:** to avoid a dangling link, this page links to `/reference/environment-variables` only AFTER PR 5 merges. Write the page without that link now; PR 5's Task 5.8 adds it.

- [ ] Steps: read → write (`tag: "NEW"`) → add `"operate/configuration"` first in the Operate group in `docs.json` → `mint validate` → commit.

### Task 4.2: Rewrite `operate/ncl-cli.mdx`

**Sources:** `src/cli/client.ts`, `src/cli/dispatch.ts`, `src/cli/socket-server.ts`, all 11 files in `src/cli/resources/` (groups, messaging-groups, wirings, users, roles, members, destinations, sessions, user-dms, dropped-messages, approvals), `bin/ncl`, `package.json` (`pnpm ncl`).
**Must cover:** what `ncl` is (admin CLI over Unix socket to the host); how to invoke; a worked example per resource verified against each resource file's actual commands/flags (e.g., `ncl groups restart --id <id> [--rebuild]`); this page is the how-to — exhaustive flag tables live in `/reference/ncl-cli` (same dangling-link rule as 4.1: PR 5 adds the cross-link).

- [ ] Steps: read → rewrite (`tag: "UPDATED"`, remove any banner) → verified-against listing all 11 resource files → `mint validate` → commit.

### Task 4.3: Create `operate/credentials.mdx` (new)

**Sources:** `src/onecli-approvals.ts`, `container/skills/onecli-gateway/SKILL.md` + `instructions.md`, `.claude/skills/init-onecli/SKILL.md`, `.claude/skills/use-native-credential-proxy/SKILL.md`, `src/config.ts` (ONECLI_URL, ONECLI_API_KEY), `src/egress-lockdown.ts` (ONECLI_GATEWAY_CONTAINER).
**Must cover:** the v2 invariant — containers never hold raw API keys; OneCLI Agent Vault as the credential path (gateway intercepts outbound calls and injects tokens in flight — describe the stub-credential pattern from the gmail-tool skill as the canonical example); setting up with `/init-onecli`; approval flow for credentialed actions (`pending approvals`, `ncl approvals`); the opt-in `/use-native-credential-proxy` alternative and when you'd use it. Prose says "Agent Vault"; any code snippet matches source (which says "gateway").

- [ ] Steps: read → write (`tag: "NEW"`) → add to nav after `"operate/ncl-cli"` → `mint validate` → commit.

### Task 4.4: Rewrite `operate/hardening.mdx`

**Sources:** `src/egress-lockdown.ts` (read fully), `src/modules/mount-security/index.ts`, `config-examples/mount-allowlist.json`, `.claude/skills/manage-mounts/SKILL.md`, schema for `pending_sender_approvals` + `unknown_sender_policy` (`src/db/schema.ts:25-58`, `src/router.ts:151`), the old docker-sandboxes content now sitting in this file (verify each claim against `docs/docker-sandboxes.md` topics IN CODE before keeping — keep only what code supports).
**Must cover:** defense-in-depth layers an operator controls: egress lockdown (`NANOCLAW_EGRESS_LOCKDOWN`, `NANOCLAW_EGRESS_NETWORK` — currently undocumented anywhere); mount allowlist (`~/.config/nanoclaw/mount-allowlist.json`, validated before any additional mount, `/manage-mounts`); unknown-sender policies (default `request_approval` on router auto-create, `strict` column default — explain the difference per the schema comment); container resource limits (timeout/output-size/concurrency from config); micro-VM sandboxing if and only if code supports it.

- [ ] Steps: read → rewrite fully (this file is currently the old docker-sandboxes page; `tag: "UPDATED"`) → `mint validate` → commit.

### Task 4.5: Create `operate/upgrading.mdx` (new)

**Sources:** `.claude/skills/update-nanoclaw/SKILL.md`, `.claude/skills/update-skills/SKILL.md`.
**Must cover:** how updates work (`/update-nanoclaw` — what it pulls, what it rebuilds, how installed channel adapters are re-applied); updating skills (`/update-skills`); what to check after an upgrade.

- [ ] Steps: read → write (`tag: "NEW"`) → add to nav after `"operate/hardening"` → `mint validate` → commit.

### Task 4.6: Rewrite `operate/troubleshooting.mdx`

**Sources:** `.claude/skills/debug/SKILL.md`, `src/host-sweep.ts` (stale detection), `src/container-runtime.ts` (the FATAL runtime banner + fixes it prints), `scripts/cleanup-sessions.sh`, `src/cli/resources/dropped-messages.ts`, `src/cli/resources/sessions.ts`.
**Must cover:** the `/debug` skill as the first move; container-won't-start (the actual error text and remedies from container-runtime.ts); message not answered (trace the path: `ncl dropped-messages`, `ncl sessions`, host-sweep behavior); container lifecycle issues (idle timeout, concurrency cap); session cleanup; where logs live (verify in `src/log.ts`).

- [ ] Steps: read → rewrite (`tag: "UPDATED"`, remove banner) → `mint validate` → commit.

### Task 4.7: Verify or delete `snippets/`

- [ ] Step 1: Read `snippets/restart-service.mdx` and `snippets/sync-env.mdx`; grep pages for usage (`grep -rn "restart-service\|sync-env" --include="*.mdx" .`). Step 2: Verify each command inside against v2 code (service name in `launchd/`, env handling in setup). Fix, or delete if unused/unfixable. Step 3: commit.

### Task 4.8: PR

- [ ] `gh pr create --title "docs: rewrite Operate group — config, ncl, credentials, hardening, upgrades" --label update-existing --label new-page --label high-priority --assignee glifocat`. After merge: rebase, close conflicting automated PRs.

---

## PR 5 — Reference

Branch: `refactor/pr5-reference`. Labels: `new-page`, `high-priority`. Pin upstream.

Create `reference/` directory. Each page is new (`tag: "NEW"`), exhaustive, table-heavy, minimal prose. Every fact from code.

### Task 5.1: `reference/ncl-cli.mdx`

**Sources:** all of `src/cli/resources/*.ts` (non-test), `src/cli/client.ts`, `src/cli/dispatch.ts`.
**Content:** one H2 per resource (11), each with a table of subcommands, flags, and arguments extracted from the resource source. Show invocation forms exactly as dispatch parses them.

### Task 5.2: `reference/environment-variables.mdx`

**Sources:** `src/config.ts`, full `grep -rn "process.env" src/ container/agent-runner/src/ --include="*.ts"`.
**Content:** one table: variable / default / effect / where read (file:line). Include host vars AND agent-runner-side vars if any. Defaults verified: see spec list.

### Task 5.3: `reference/container-config.mdx`

**Sources:** `src/db/container-configs.ts`, `src/container-config.ts` (ContainerConfig type — find via `grep -rn "ContainerConfig" src/`), `src/container-runner.ts` (how each field is consumed: mounts, env, blockedHosts, skills symlinks, provider resolution).
**Content:** every ContainerConfig field: type, default, what it does at container spawn, how to set it.

### Task 5.4: `reference/skills-catalog.mdx`

**Sources:** `ls /tmp/nanoclaw-v2/.claude/skills/` + the `description:` frontmatter line of every SKILL.md (`head -5` each).
**Content:** four tables by category (channel installs / provider installs / tool installs / operational), columns: skill, what it does (from its own description), notes. Also a section for container skills (`container/skills/`: agent-browser, onecli-gateway, self-customize, welcome, slack-formatting, whatsapp-formatting, frontend-engineer, vercel-cli) — these mount into every agent container.

### Task 5.5: `reference/adapter-interface.mdx`

**Sources:** `src/channels/adapter.ts` (read fully), `src/channels/channel-registry.ts`, one concrete adapter from the channels branch as the worked example (telegram).
**Content:** the adapter contract — every method signature verbatim from source with an explanation; registration; what the registry calls when; webhook registration for Chat SDK adapters.

### Task 5.6: `reference/mcp-tools.mdx`

**Sources:** `container/agent-runner/src/mcp-tools/{agents,core,interactive,scheduling,self-mod}.ts` + each `.instructions.md` sibling + `cli.instructions.md`, `index.ts`, `types.ts`.
**Content:** one H2 per tool module; table of tools each exposes with parameters from the source. These are the tools agents have inside the container — state that clearly up top.

### Task 5.7: `reference/db-schema.mdx`

**Sources:** `src/db/schema.ts` (read fully, including comments), `src/db/session-db.ts`, `src/db/migrations/` (the latest state, esp. migration 014 for container_configs).
**Content:** central DB tables (agent_groups, messaging_groups, messaging_group_agents/wirings with `session_mode: 'shared' | 'per-thread' | 'agent-shared'`, users, user_roles, agent_group_members, user_dms, sessions, pending_questions, pending_sender_approvals, container_configs) and session DB tables (messages_in, messages_out, delivered, destinations, session_routing, processing_ack, session_state, container_state). Columns + meaning; reproduce schema comments' intent.

### Task 5.8: Wire up navigation, redirects, and delete `api/*`

- [ ] Step 1: Replace the Reference tab's legacy group in `docs.json`:

```json
{
  "tab": "Reference",
  "groups": [
    { "group": "Operating", "pages": ["reference/ncl-cli", "reference/environment-variables", "reference/container-config", "reference/skills-catalog"] },
    { "group": "Internals", "pages": ["reference/adapter-interface", "reference/mcp-tools", "reference/db-schema"] }
  ]
}
```

- [ ] Step 2: `git rm -r api/`
- [ ] Step 3: Append to `redirects`:

```json
{ "source": "/api/overview", "destination": "/reference/ncl-cli" },
{ "source": "/api/configuration", "destination": "/reference/environment-variables" },
{ "source": "/api/message-routing", "destination": "/reference/adapter-interface" },
{ "source": "/api/group-management", "destination": "/reference/ncl-cli" },
{ "source": "/api/task-scheduling", "destination": "/reference/mcp-tools" },
{ "source": "/api/skills/creating-skills", "destination": "/extend/overview" },
{ "source": "/api/skills/skill-structure", "destination": "/extend/overview" },
{ "source": "/api/skills/examples", "destination": "/extend/overview" }
```

(PR 7 retargets the three skills redirects to `/extend/writing-skills`.)

- [ ] Step 4: Add the deferred cross-links from PR 4: in `operate/configuration.mdx` link to `/reference/environment-variables`; in `operate/ncl-cli.mdx` link to `/reference/ncl-cli`.
- [ ] Step 5: `mint validate && mint broken-links` → commit → PR: `gh pr create --title "docs: real Reference tab from code — CLI, env, config, skills, internals" --label new-page --label high-priority --assignee glifocat`. After merge: rebase, close conflicting automated PRs.

(Each of Tasks 5.1–5.7: Step 1 read sources → Step 2 write page with verified-against comment → Step 3 `mint validate` → Step 4 commit per page.)

---

## PR 6 — Understand

Branch: `refactor/pr6-understand`. Labels: `update-existing`, `new-page`, `medium-priority`. Pin upstream.

### Task 6.1: Rewrite `concepts/architecture.mdx`

**Sources:** `src/index.ts`, `src/router.ts`, `src/delivery.ts`, `src/session-manager.ts`, `src/host-sweep.ts`, `src/webhook-server.ts`, `container/agent-runner/src/poll-loop.ts`, `container/agent-runner/src/formatter.ts`. Upstream `docs/architecture.md` for narrative shape ONLY after code-checking each claim.
**Must cover:** the single driving pattern (every message is a row: inbox → agent → outbox); component walk (router, session manager, container runner, delivery, host sweep's 60s duties); the two SQLite layers (central DB vs per-session inbound/outbound DBs); webhook path for Chat SDK channels; agent-runner poll loop. Absorbs the old ipc-system page's territory — state explicitly that host↔container IPC is the mounted SQLite pair, not a socket protocol.
**Outline:** The core idea → End-to-end message flow (Mermaid sequence diagram) → The host process (components) → Inside the container → The two database layers → What runs when (host sweep).

### Task 6.2: Rewrite `concepts/entity-model.mdx`

**Sources:** `src/db/schema.ts` (tables + comments), `src/types.ts:117`, `src/modules/permissions/access.ts`, `src/router.ts` (auto-create behavior).
**Must cover:** agent groups (unit of isolation: own workspace, memory, CLAUDE.local.md, container config); messaging groups (a platform conversation; `unknown_sender_policy`); wirings (`messaging_group_agents`, surfaced as `ncl wirings`) with `session_mode` values `shared` / `per-thread` / `agent-shared`; users, roles (owner/admin), members; sessions as the agent-group×messaging-group(×thread) pairing.
**Outline:** The five entities (Mermaid ER diagram) → Agent groups → Messaging groups and sender policy → Wirings and session modes → Users, roles, and access → How a message finds its session.

### Task 6.3: Create `concepts/isolation-levels.mdx` (new)

**Sources:** `src/session-manager.ts:96-110`, `src/router.ts:411`, `src/types.ts:117`, `.claude/skills/manage-channels/SKILL.md`.
**Must cover:** choosing an isolation level: separate agent groups (full isolation — different workspace/memory); one agent, session per messaging group (`shared`); session per thread (`per-thread` — requires adapter thread support); one conversation across messaging groups (`agent-shared`). When to pick each; how to configure (wirings via `/manage-channels` or `ncl`).

### Task 6.4: Rewrite `concepts/container-lifecycle.mdx`

**Sources:** `src/container-runner.ts` (read fully), `src/container-runtime.ts`, `container/Dockerfile`, `src/config.ts` (lifecycle vars).
**Must cover:** Docker-only runtime (hardcoded bin, single-file abstraction — name the file); image build (once per install, install-slug tagging, orphan cleanup scoped to slug); spawn-on-first-message; what gets mounted (session DB pair, /workspace, skills symlinks, additional allowlisted mounts); CLAUDE.md composition at spawn (`.claude-shared.md` + `.claude-fragments/*.md` + `CLAUDE.local.md` — verify the exact mechanism in container-runner.ts); idle kill, hard timeout, concurrency cap; restart/rebuild via `ncl groups restart`. Absorbs old container-runtime + docker-sandboxes territory.

### Task 6.5: Rewrite `concepts/security.mdx`

**Sources:** `src/egress-lockdown.ts`, `src/modules/mount-security/index.ts`, `src/onecli-approvals.ts`, `src/modules/approvals/primitive.ts`, `src/db/schema.ts` (pending_sender_approvals), `src/command-gate.ts`, container/Dockerfile (what's NOT in the image).
**Must cover:** the threat model (untrusted conversation input reaching an agent with tools); the layers: container isolation, no-raw-credentials invariant (Agent Vault), mount allowlist, egress lockdown, sender policies, human approvals for privileged actions, command gate. This is the "why" page; `operate/hardening` is the "how" page — cross-link, don't duplicate. Absorbs old advanced/security-model.

### Task 6.6: Rewrite `concepts/contributing.mdx`

**Sources:** `/tmp/nanoclaw-v2/CONTRIBUTING.md` (verify any commands it gives against package.json/scripts before repeating), `package.json` (test/build/dev scripts), `vitest.config.ts`, `eslint.config.js`, `RELEASING.md`.
**Must cover:** repo layout for contributors (`<Tree>`); dev loop (`pnpm dev`, `pnpm test` — verify exact script names); test layout incl. `vitest.skills.config.ts`; how channels/providers branches relate to trunk for contributors; where to file issues; link to upstream CONTRIBUTING.md as canonical for process.

### Task 6.7: Nav + PR

- [ ] Add `"concepts/isolation-levels"` to the Understand group in `docs.json` after `"concepts/entity-model"`. `mint validate && mint broken-links`. PR: `gh pr create --title "docs: rewrite Understand group — architecture, entities, isolation, containers, security" --label update-existing --label new-page --label medium-priority --assignee glifocat`. After merge: rebase, close conflicting automated PRs.

(Each rewrite task: read → write (`tag: "UPDATED"` / `"NEW"` for 6.3, remove banners) → verified-against → `mint validate` → commit per page.)

---

## PR 7 — Extend

Branch: `refactor/pr7-extend`. Labels: `update-existing`, `new-page`, `medium-priority`. Pin upstream.

### Task 7.1: Rewrite `extend/overview.mdx`

**Sources:** `ls .claude/skills/`, three representative SKILL.md files (one per category), `container/skills/` listing.
**Must cover:** what a "skill" is in v2 (a SKILL.md instruction workflow Claude executes — NOT a git branch; explicitly correct the old model since this URL inherits `/integrations/skills-system` traffic); the four categories with examples; container skills as a distinct concept (mounted into agent containers); the catalog lives at `/reference/skills-catalog`. Remove the old drift banner.

### Task 7.2: Rewrite `extend/tools.mdx`

**Sources:** `.claude/skills/add-gmail-tool/SKILL.md` (read fully — it's the canonical pattern), `add-gcal-tool`, `add-ollama-tool`, `add-atomic-chat-tool` SKILL.md files, `container/skills/agent-browser/`.
**Must cover:** giving agents tools via MCP servers per agent group; the stub-credential + Agent Vault injection pattern (gmail as worked example, listing actual `mcp__gmail__*` tools from the skill); gcal; web access via the agent-browser container skill (absorbs old web-access page); how to add an arbitrary MCP server (container config `mcp_servers` — verify field name in `src/db/container-configs.ts`). Gmail is a tool, not a channel — say it, since `/integrations/gmail` redirects here.

### Task 7.3: Rewrite `extend/providers.mdx`

**Sources:** `.claude/skills/add-opencode/SKILL.md`, `add-codex`, `add-ollama-provider/SKILL.md`, providers branch listing (`git show upstream/providers:container/agent-runner/src/providers/` via the glifocat clone), `container/agent-runner/src/providers/factory.ts` (trunk), `src/container-runner.ts:214-231` (provider resolution order: session → container_config → 'claude').
**Must cover:** the two mechanisms — real provider implementations copied from the `providers` branch (OpenCode, Codex) vs Ollama's env-override approach (speaks Anthropic API natively; no provider code); provider resolution order from code; per-group provider setting.

### Task 7.4: Create `extend/self-modification.mdx` (new)

**Sources:** `src/modules/self-mod/`, `container/agent-runner/src/mcp-tools/self-mod.ts` + `self-mod.instructions.md`, `container/skills/self-customize/`.
**Must cover:** what agents can change about themselves (verify the actual self-mod tool surface: packages, MCP servers, CLAUDE.local.md edits — ONLY what the code exposes); the approval gates around it; how an operator reviews/reverts.

### Task 7.5: Create `extend/writing-skills.mdx` (new)

**Sources:** 2–3 well-structured existing SKILL.md files as worked examples (`add-telegram`, `manage-mounts`), `.claude/skills/update-skills/SKILL.md`.
**Must cover:** anatomy of a SKILL.md (frontmatter name/description, phases, idempotency conventions observed in real skills); where skills live; writing one for your install; sharing considerations.

### Task 7.6: Nav, redirects, PR

- [ ] Add `"extend/self-modification", "extend/writing-skills"` to the Extend group. Retarget in `docs.json`: the three `/api/skills/*` redirect destinations → `/extend/writing-skills`. `mint validate && mint broken-links`. PR: `gh pr create --title "docs: rewrite Extend group — skills model, tools, providers, self-mod" --label update-existing --label new-page --label medium-priority --assignee glifocat`. After merge: rebase, close conflicting automated PRs.

---

## PR 8 — Build with agents (tutorials)

Branch: `refactor/pr8-guides`. Labels: `update-existing`, `new-page`, `medium-priority`. Pin upstream.

Tutorial style: numbered `<Steps>`, every command copy-pasteable, expected output shown, each tutorial ends with "what you built" + next links. Tutorials assume a working install (link quickstart).

### Task 8.1: Create `guides/first-agent.mdx` (new)

**Sources:** `.claude/skills/init-first-agent/SKILL.md`, `scripts/init-first-agent.ts`, `src/cli/resources/groups.ts`, `groups/` structure in the repo.
**Content:** create an agent group, wire it to a DM, send first message, inspect what was created (`ncl groups`, the group folder, CLAUDE.local.md), restart it.

### Task 8.2: Rewrite `guides/scheduled-tasks.mdx`

**Sources:** `container/agent-runner/src/mcp-tools/scheduling.ts` + `scheduling.instructions.md`, `container/agent-runner/src/scheduling/`, `src/modules/scheduling/`, `src/host-sweep.ts` (due-message wake), `container/agent-runner/src/timezone.ts`, `src/config.ts` (TZ).
**Content:** tutorial — ask an agent to schedule a recurring job in chat; what happens mechanically (scheduling tool → messages_in row with cron + process_after → host sweep wakes it); managing schedules (in chat + `ncl`); timezone behavior. Absorbs old concepts/tasks territory.

### Task 8.3: Rewrite `guides/multi-agent-swarm.mdx`

**Sources:** `src/modules/agent-to-agent/`, `container/agent-runner/src/mcp-tools/agents.ts` + `agents.instructions.md` (TeamCreate/TeamDelete and whatever else the module actually exposes — verify exact tool names in code), `container/agent-runner/src/destinations.ts`, `src/db/schema.ts` (destinations table).
**Content:** tutorial — build the PR-review trio from the introduction (worker per thread, manager watching, supervisor DM approvals): create the three agent groups, wire one Discord channel with per-thread mode for workers, set up agent-to-agent routing, walk one PR through the flow. Remove the old v1 "Agent Swarms" banner page content entirely — this is a ground-up rewrite.

### Task 8.4: Rewrite `guides/customize-an-agent.mdx`

**Sources:** `CLAUDE.local.md` mechanism in `src/container-runner.ts` (composition at spawn), `.claude/skills/customize/SKILL.md`, `container/skills/self-customize/`, `src/db/container-configs.ts` (per-group model/effort).
**Content:** tutorial — give an agent a personality and rules (CLAUDE.local.md via `/customize` or direct edit), change its model/effort, add a package and an MCP server, restart and verify.

### Task 8.5: Nav + PR

- [ ] Add `"guides/first-agent"` first in the Build with agents group. `mint validate && mint broken-links`. PR: `gh pr create --title "docs: Build-with-agents tutorials — first agent, schedules, swarms, customization" --label update-existing --label new-page --label medium-priority --assignee glifocat`. After merge: rebase, close conflicting automated PRs.

(Each task: read → write (`tag: "NEW"` for 8.1, `"UPDATED"` rest; remove banners) → verified-against → `mint validate` → commit per page.)

---

## PR 9 — Meta: CLAUDE.md, workflows, polish

Branch: `refactor/pr9-meta`. Labels: `update-existing`, `high-priority`. No upstream pinning needed except for final fact checks.

### Task 9.1: Rewrite the docs repo `CLAUDE.md`

**Files:** Modify: `CLAUDE.md`

- [ ] Step 1: Rewrite the "NanoClaw Architecture Context" section to v2 facts. Replace the current bullets (multi-channel forks, skills-as-branches, revert-merge removal, credential tabs) with:

```markdown
## NanoClaw Architecture Context

When editing docs, keep these v2 facts current (verify against code, never upstream markdown — see below):
- **Upstream:** https://github.com/nanocoai/nanoclaw (org moved from qwibitai; old URLs redirect).
- **Code is the only source of truth.** Upstream `docs/`, `README.md`, and `CLAUDE.md` drift. Verify every claim against `src/`, `container/`, `setup/`, `.claude/skills/*/SKILL.md`, and the shell scripts. Each docs page carries a `{/* verified-against: <files> @ <sha> */}` comment — update it when re-verifying.
- **Channels:** no adapter ships on trunk; `src/channels/` is infrastructure only (+ a CLI channel). 17 adapters live on the `channels` branch, installed by `/add-<channel>` skills. 7 have setup wizards (`setup/channels/`).
- **Skills are SKILL.md instruction workflows** in `.claude/skills/` (four categories: channel installs, provider installs, tool installs, operational) — NOT git branches. Container skills (`container/skills/`) mount into every agent container.
- **No HTTP API.** HTTP surface = webhook server (`/webhook/{adapterName}`) + Unix sockets for `ncl`. The Reference tab documents CLI/config/schemas, not REST.
- **Runtime:** Docker only (`src/container-runtime.ts` hardcodes it). Host: Node + pnpm. Agent-runner in container: Bun.
- **Entities:** agent_groups ↔ messaging_groups via wirings (`session_mode: 'shared' | 'per-thread' | 'agent-shared'`); central DB + per-session inbound/outbound SQLite pair.
- **Credentials:** OneCLI Agent Vault invariant — containers never hold raw keys. `/use-native-credential-proxy` is the opt-in alternative. Prose says "Agent Vault"; code snippets match source ("gateway").
```

- [ ] Step 2: Update the "Architecture" (content directories) section to the new tree (channels/, operate/, guides/, extend/, concepts/, reference/, changelog/). Update the navigation description (two tabs: Documentation with 7 groups, Reference with 2 groups). Remove the stale token-count sentence's old numbers; point at `repo-tokens/badge.svg` as the only source.
- [ ] Step 3: Delete bullets that the refactor made obsolete (e.g., "Telegram is NOT on main" — replaced by "no channel is on main"); keep the PR-triage and changelog process sections, re-reading each bullet for v2 correctness.
- [ ] Step 4: Commit `"docs: rewrite CLAUDE.md for v2 architecture and new IA"`

### Task 9.2: Update `.mintlify/workflows/`

- [ ] Step 1: Read all three workflow files (`sync-upstream-changes.md`, `weekly-docs-audit.md`, `new-skill-docs.md`). Step 2: Update any references to old paths (integrations/, features/, advanced/, api/), the qwibitai org, and v1 architecture assumptions; point skill-docs workflow at `reference/skills-catalog` + `extend/` pages; teach the audit workflow about `verified-against` comments (flag pages whose SHA is >N versions behind). Step 3: Commit.

### Task 9.3: Final sweep and a11y

- [ ] Step 1: `grep -rln "This page describes" --include="*.mdx" .` → must return nothing (all banners gone). `grep -rn "qwibitai" --include="*.mdx" --include="*.json" .` → nothing outside docs/superpowers. Step 2: `mint a11y` — fix reported issues. Step 3: `mint broken-links && mint validate`. Step 4: Commit fixes.

### Task 9.4: Changelog entries

- [ ] Step 1: Add an entry at the top of `changelog/docs-updates.mdx` describing the refactor (new IA, v2-only, code-verified, Reference tab, redirects). Step 2: Confirm `changelog/index.mdx` needs no product entry (this is a docs change). Step 3: Commit.

### Task 9.5: PR + closeout

- [ ] PR: `gh pr create --title "docs: meta — v2 CLAUDE.md, workflow updates, final polish" --label update-existing --label high-priority --assignee glifocat`. After merge: rebase main; verify live site via the `nanoclaw-docs` MCP (`search_nano_claw` for "isolation levels", "egress lockdown", "ncl CLI" — new content should be indexed); close any remaining `mintlify/*` PRs; `git worktree remove /tmp/nanoclaw-v2 --force`.

---

## Plan-wide acceptance criteria

- Every PR merges with `mint validate` and `mint broken-links` clean.
- No page describes v1 behavior without being deleted or rewritten; zero "This page describes" banners remain after PR 9.
- Every rewritten/new page has a `verified-against` comment naming real files and the PR's pinned SHA.
- Every pre-refactor URL either still resolves or has a redirect.
- The docs repo CLAUDE.md teaches the v2 model.
