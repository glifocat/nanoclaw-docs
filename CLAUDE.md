# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mintlify-powered documentation site for **NanoClaw** — a lightweight, secure AI assistant that runs Claude agents in isolated Docker containers with multi-messenger support. The main NanoClaw repo is at https://github.com/nanocoai/nanoclaw; this repo is the docs site deployed to https://docs.nanoclaw.dev (the root https://nanoclaw.dev is the separate marketing site — absolute links to it from docs navigation will 404; use relative hrefs).

**GitHub:** `glifocat/nanoclaw-docs` (not `nanocoai` — that's the upstream NanoClaw source repo)

## Mintlify CLI

Install: `npm i -g mint` (one-time). No authentication required — runs locally.

```bash
mint dev                        # Local preview at http://localhost:3000
mint validate                   # Validate build (strict mode, exits on warnings/errors)
mint broken-links               # Check for broken links across the site
mint rename <from> <to>         # Rename a file and update all internal link references
mint openapi-check <filename>   # Validate an OpenAPI spec file
mint a11y                       # Check for accessibility issues
mint upgrade                    # Migrate mint.json to docs.json (current format)
mint migrate-mdx                # Migrate MDX OpenAPI pages to x-mint extensions
mint scrape                     # Scrape documentation from external sites
mint new [directory]            # Create a new Mintlify documentation site
mint update                     # Update the CLI to the latest version
```

Deployment is automatic after merge to `main` (via Mintlify GitHub app).

**macOS gotcha**: `grep -oP` (Perl regex) is not available on macOS. Use `grep -oE` with POSIX extended regex instead (e.g., `grep -oE '[0-9.]+k'`).

**Shell is zsh**: unquoted `$var` does NOT word-split (`set -- $r` leaves later positionals empty — use `${=var}` or list args explicitly), and `git log`/`git diff` flags must come *before* the `<rev>..<rev>` range or git misreads it as a path.

## NanoClaw Architecture Context

The site was fully rewritten for v2 (PRs #296–#303) and fully re-verified to `nanocoai/nanoclaw@2afbd182` (v2.1.21); channel pages at `channels@fdbfb6a`. Keep these facts current when editing:

- **Upstream:** https://github.com/nanocoai/nanoclaw (org moved from `qwibitai`; old URLs redirect).
- **Code is the ONLY source of truth.** Upstream `docs/`, README.md, CLAUDE.md, and even SKILL.md prose all drift from reality. Verify every claim against `src/`, `container/`, `setup/`, `.claude/skills/` (treat SKILL.md as the executable spec for a skill's BEHAVIOR, but never as a source of facts about core code), and the shell scripts. Every docs page carries a `{/* verified-against: <files> @ <sha> */}` comment — update it whenever you re-verify a page.
- **Confirmed upstream-doc traps** (claims that are false in code): Apple Container support (doesn't exist; Docker is hardcoded), tini as PID 1 (image default is overridden at spawn; bun is PID 1), `groups/global/` persistence (deleted on every startup), skills-as-git-branches (never shipped in v2; upstream `docs/skills-as-branches.md` is stale), `MAX_CONCURRENT_CONTAINERS` (parsed in `src/config.ts`, never enforced), adapter SKILL.md version pins (drift from the `setup/*.sh` installer pins — prefer the `.sh`), the customize skill's persona-file claim (stale).
- **Recurring rewrite error classes**: session-mode/engage-mode enum mixups, SKILL.md version pins vs `setup/*.sh` installer pins, dead-config claims (vars parsed but unenforced), absolute claims ("no X exists") that fail edge checks, and quotes that silently elide or paraphrase source — verify each against code before writing.
- **Channels:** trunk ships infrastructure plus a CLI channel only — NO messaging channel lives on `main`. 17 adapters live on the `channels` registry branch (WhatsApp, WhatsApp Cloud, Telegram, Discord, Slack, Signal, iMessage, Teams, Google Chat, Matrix, Delta Chat, Emacs, GitHub, Linear, Resend, Webex, WeChat), installed by `/add-<channel>` skills that fetch-and-copy files — never `git merge`. 7 channels have `setup/add-*.sh` wizards (whatsapp, telegram, discord, slack, signal, imessage, teams).
- **Skills:** SKILL.md workflows in `.claude/skills/` (channel/provider/tool installers plus operational skills) and container skills in `container/skills/` mounted into every agent container. Skills are NOT git branches.
- **No HTTP API:** inbound webhook server (`/webhook/{adapterName}`) plus Unix sockets — the `ncl` admin CLI on `data/ncl.sock`, the CLI channel on `data/cli.sock`.
- **Runtime:** Docker only. Host runs Node + pnpm; the agent-runner inside the container runs Bun.
- **Entity model:** `agent_groups` ↔ `messaging_groups` connected via wirings. `engage_mode`: `pattern` | `mention` | `mention-sticky`. `session_mode`: `shared` | `per-thread` | `agent-shared` (the router forces per-thread on thread-capable group chats). Central DB is `data/v2.db`; each session gets an inbound/outbound SQLite pair — that pair IS the host↔container IPC.
- **Credentials:** OneCLI Agent Vault invariant — containers never hold raw API keys (stub key + in-flight injection). Docs prose says "Agent Vault"; code snippets must match source (which says "gateway"). `/use-native-credential-proxy` is the opt-in alternative.
- **Per-group customization:** the editable per-group surfaces are `instructions.prepend.md` (standing instructions/persona) and the `memory/` tree (durable facts, scaffolded at boot, shared by every provider). `CLAUDE.local.md` is retired — it survives only as a migration staging file. `groups/<folder>/CLAUDE.md` is composed at every spawn — never teach users to edit it.

## Drift Detection

Each page's `verified-against` SHA is the re-verification anchor. When upstream moves, re-check pages whose cited files changed:

```bash
git -C <upstream-checkout> diff <page-sha>..HEAD --name-only
```

Compare the output against the paths cited in each page's `verified-against` comment; re-verify and bump the SHA only on pages whose cited files actually changed.

- Registry branches (`channels`, `providers`) can be force-pushed — diff with three dots (`git diff <anchor>...upstream/<branch>`) and fetch into an explicit ref (`git fetch upstream <branch>:refs/remotes/upstream/<branch>`), since a plain fetch may not move the tracking ref.
- Bump a page's SHA only when you actually re-verified its cited files at that SHA. A narrow prose fix can leave the old SHA for the next full sweep — bumping it falsely claims re-verification.
- For a multi-version sweep, fan out read-only subagents (one per page-area) that diff each page's cited files and return keep/fix verdicts. A naive regex intersection mis-parses brace-comma citations (`{a,b,c}`) and silently under-reports drift.

## PR Workflow

- **Post-merge push race**: After `gh pr merge`, the Mintlify deploy bot pushes to main almost immediately. Always `git pull --rebase origin main` before pushing local follow-up commits (e.g., changelog updates). If you have unstaged changes, stash first.
- Always run `mint validate` before creating PRs
- **Validating PR branches**: `git worktree add /tmp/validate-prN origin/BRANCH && cd /tmp/validate-prN && mint validate` — validates without switching branches. Clean up with `git worktree remove /tmp/validate-prN`.
- Run `mint broken-links` when adding or changing internal links
- Available labels: `content-gap`, `new-page`, `update-existing`, `high-priority`, `medium-priority`, plus GitHub defaults
- For auto-closing issues, put each `Closes #N` on its own line in the PR body
- For multi-concern changes, split into stacked PRs (base each on the previous branch). After merging, retarget the next PR to `main` and rebase.
- **Post-merge verification**: Use the `nanoclaw-docs` MCP (`search_nano_claw`) to verify changes are live and indexed correctly after merging to `main`.
- **Live-site checks**: the docs edge returns 404 to `curl` even for valid pages — verify live URLs with a real browser (Playwright MCP), never curl alone.
- `gh pr create`/`merge` occasionally fail transiently with an auth-refresh message — retry once before debugging credentials.

## Architecture

All content is `.mdx` (Markdown + JSX components). Navigation and site config live in `docs.json`.

**Content directories:**
- `channels/` — Channel setup: overview, whatsapp, telegram, discord, slack, signal, imessage, teams, cli, more-channels (10 pages)
- `operate/` — Configuration, ncl CLI, credentials, hardening, upgrading, troubleshooting (6 pages)
- `guides/` — Agent-building tutorials: first agent, customization, scheduled tasks, multi-agent swarm (4 pages)
- `extend/` — Skills overview, tools, providers, self-modification, writing skills (5 pages)
- `concepts/` — Architecture, entity model, isolation levels, container lifecycle, security, contributing (6 pages)
- `reference/` — ncl CLI, environment variables, container config, skills catalog, adapter interface, MCP tools, DB schema (7 pages)
- `changelog/` — Product releases (`index.mdx`) and docs updates (`docs-updates.mdx`)
- Root: `introduction.mdx`, `quickstart.mdx`, `installation.mdx`, `migrate-from-v1.mdx`

Old paths (`features/`, `integrations/`, `advanced/`, `api/`) are gone — `docs.json` carries redirects for all of them.

## Mintlify Skill (`/mintlify`)

This repo has the Mintlify skill installed. Invoke `/mintlify` at the start of any Mintlify-related task to load the full reference. The skill includes detailed sub-references — read them only when needed:

| Reference file | When to read |
|---|---|
| `reference/components.md` | Adding or modifying components (callouts, cards, steps, tabs, accordions, code groups, fields, frames, icons, tooltips, badges, etc.) |
| `reference/configuration.md` | Changing `docs.json` settings (theme, colors, logo, fonts, navbar, footer, banner, redirects, SEO, integrations, snippets, hidden pages, custom CSS/JS, frontmatter fields) |
| `reference/navigation.md` | Modifying navigation structure (groups, tabs, anchors, dropdowns, products, versions, languages, OpenAPI in nav) |
| `reference/api-docs.md` | Setting up API documentation (OpenAPI, AsyncAPI, MDX manual API pages, playground config) |

## Key Conventions

**Page format:** Every `.mdx` file needs frontmatter with `title` and `description`:
```yaml
---
title: "Clear, descriptive title"
description: "Concise summary for SEO and navigation."
keywords: ["relevant", "search", "terms"]
---
```

**Common frontmatter fields:** `title` (required), `description`, `sidebarTitle`, `icon`, `tag`, `hidden`, `mode`, `keywords`, `api`, `openapi`.

**New pages**: Always add `tag: "NEW"` to frontmatter — triggers the sidebar badge (auto-clears after 2 weeks).

**Diagrams**: Use Mermaid (`` ```mermaid ``), never ASCII art in plain code blocks — box characters don't render correctly.

**`mint validate`**: Must be run from the directory containing `docs.json` — fails otherwise.

**Non-docs files**: `mint validate` and `mint broken-links` parse ALL `.md`/`.mdx` files in the repo tree, including non-docs files (plans, specs). MDX snippets in markdown code blocks cause parsing errors. Keep non-docs markdown files outside the repo, or list them in `.mintignore` (the `docs/` directory is already ignored there for this reason — it holds internal non-docs markdown).

**Multi-issue PRs**: When closing multiple issues, put each `Closes #N` on its own line AND add matching labels via `gh pr edit --add-label`.

**Navigation:** When adding or moving pages, update the `navigation` array in `docs.json`. The site has two tabs — "Documentation" (7 groups: Get started, Channels, Operate, Build with agents, Extend, Understand, Changelog) and "Reference" (2 groups: Operating, Internals) — plus a global Changelog anchor. New pages not added to `docs.json` won't appear in the sidebar.

**docs.json hrefs:** `mint validate`/`broken-links` don't check `href` values in anchors/navbar, and `mint dev` routing is laxer than prod (prod collapses `index` pages: `/changelog/index` 404s live). Use relative hrefs in navigation and verify anchors on the deployed site.

**File naming:** Use kebab-case (e.g., `agent-swarms.mdx`). Match existing patterns in the directory.

**Internal links:** Use root-relative paths without file extensions: `/getting-started/quickstart` (not `../page` or `/page.mdx`).

**Images:** Store in `images/`, reference with root-relative paths, always include descriptive alt text.

**Components available:** `<Note>`, `<Info>`, `<Tip>`, `<Warning>`, `<Check>`, `<Danger>`, `<Steps>/<Step>`, `<Tabs>/<Tab>`, `<CodeGroup>`, `<Columns>`, `<Card>`, `<AccordionGroup>/<Accordion>`, Mermaid diagrams, and more (see `/mintlify` skill for full list).

**Version-gated features**: When documenting a breaking change where older versions are still valid, use `<Tabs>` with version labels for sections with substantial content, and `<Note>` callouts for passing references. Use version placeholders (`vX.Y.Z`) when the release version isn't confirmed yet. The docs are v2-only — v1 behavior belongs in `migrate-from-v1.mdx`, not in version tabs.

**Directory trees:** Use `<Tree>` component (not ASCII art). See `reference/components.md` for syntax.

## Sidebar Tags

Mintlify workflows in `.mintlify/workflows/` auto-manage `tag` frontmatter (`.mintlify/` is gitignored but these files are tracked — new ones need `git add -f`):
- `tag: "UPDATED"` — applied by sync workflow for content changes (not cosmetic)
- `tag: "NEW"` — applied by skill-docs workflow for new pages
- The weekly audit expires `UPDATED` off the last *content* commit (SHA-only `verified-against` bumps and tag edits don't count) and caps it at ~10 pages; `NEW` only for pages under 2 weeks old. Don't let a large sweep leave dozens of badges.
- Do NOT add tags for cosmetic-only changes (formatting, component swaps)

## Automated PR Triage

Mintlify workflows generate automated PRs (`mintlify/*` branches) on upstream changes. These need manual review:
- **Always verify claims against source**: `gh search code "<term>" repo:nanocoai/nanoclaw` or fetch files directly
- **Check for overlapping PRs**: Multiple automated PRs often fix the same thing (e.g., table renames). Merge the most thorough one first, then cherry-pick unique changes from the rest.
- **Common errors in automated PRs**: fabricated commit references, incorrect renames (verify exported types), speculative feature descriptions, `allowed-tools` or other frontmatter claims that don't exist in source
- **Common fabrications found**: inventing env vars that only exist in skill SKILL.md files (not core config), repeating upstream-doc traps as fact (Apple Container, tini PID 1, skills-as-branches — see Architecture Context above), claiming runtime-based routing that doesn't exist in code, getting enum defaults wrong
- **No messaging channel is on main**: Automated PRs repeatedly claim WhatsApp/Telegram/etc. are core channels — all 17 adapters live on the `channels` registry branch. Only the CLI channel and the `/add-<channel>` installer skills exist on trunk.
- **Token counts in automated PRs are always wrong**: Every automated PR uses a hallucinated value. Only verify against `repo-tokens/badge.svg` in upstream.
- **Code snippets must match source**: Automated PRs sometimes rename terms in code snippets to match marketing (e.g., "gateway" → "Agent Vault" in logger.warn). Always compare code blocks against actual upstream files — docs prose uses product names but code must match `src/`.
- **Cascading merge conflicts**: Merging one PR invalidates others touching the same files. When triaging a batch, merge isolated-file PRs first, then tackle overlapping clusters. Close conflicting PRs and consolidate verified changes into a single new PR.
- **Bulk branch cleanup**: `gh api -X DELETE repos/OWNER/REPO/git/refs/heads/BRANCH` — use after closing automated PRs to prevent clutter
- **`gh pr list` caps at 30 results by default** — use `--limit 100` when triaging backlogs, and re-run until empty.
- **Verify upstream PRs exist**: `gh pr view NUMBER --repo nanocoai/nanoclaw --json title,state` — automated PRs cite upstream PRs that may not exist
- **Watch for destructive automated PRs**: PRs that remove legacy/deprecated content may conflict with intentional version-tabbed documentation. Verify the removal is actually desired before merging.
- **"Superseded" PRs may have unique changes**: Always diff line-by-line before closing — never rely solely on PR descriptions
- **After large manual docs PRs**: Check for and close overlapping automated `mintlify/*` PRs immediately after merge — they pile up fast on upstream releases
- **Finding the upstream version**: `gh api 'repos/nanocoai/nanoclaw/commits?path=package.json&per_page=5' --jq '.[] | "\(.sha[0:7]) \(.commit.message | split("\n")[0])"'` — version bumps show in commit messages
- **Changelog conflicts are the #1 blocker**: Automated PRs insert changelog entries relative to their base, which goes stale fast. Close conflicting PRs and recreate with correct insertion order rather than attempting conflict resolution.
- **Use `/triage-docs-prs` skill**: Project-level skill at `.claude/skills/triage-docs-prs/` — structured 5-phase workflow for batch PR triage with upstream validation, build checks, and executable action plans.
- **Chain testing gotcha**: `git merge --no-commit` after a fast-forward produces nothing to commit. Use `git merge --no-edit` for merge chain validation in worktrees.
- **Merge follow-up PRs immediately**: Cherry-pick/consolidation PRs created during triage should be merged in the same session — they get forgotten if left open.

## Changelogs

Two changelogs to maintain — update both after any docs work session:
- `changelog/index.mdx` — Product releases (newest version first, uses `<Update>` component)
- `changelog/docs-updates.mdx` — Documentation site changes (newest entry first)
- **Upstream CHANGELOG is sparse** — often skips 10+ versions. Reconstruct by mapping commits between version bumps: `gh api 'repos/nanocoai/nanoclaw/commits?per_page=100' --jq '.[] | "\(.sha[0:7]) \(.commit.message | split("\n")[0])"'` and tracing features between "bump to X" commits.
- **Pre-release CHANGELOG headers**: Upstream CHANGELOG may have headers for unreleased versions (package.json not yet bumped). Don't add changelog entries for versions that aren't in `package.json` yet.

## Upstream PRs

To PR changes to `nanocoai/nanoclaw` from Ethan's fork (`glifocat/nanoclaw-glifocat`):
- Work in `/Users/ethanmunoz/Projects/clients/qwibit/nanoclaw-glifocat`
- Remote `upstream` = `nanocoai/nanoclaw` (the remote URL may still read `qwibitai/nanoclaw` — GitHub redirects after the org move), `origin` = `glifocat/nanoclaw-glifocat`
- Branch from `upstream/main`, push to `origin`, PR with `--repo nanocoai/nanoclaw --head glifocat:<branch>`
- The fork may be on a different branch (e.g., `feat/dashboard-api`) — stash before switching

## Token Count

Source of truth: `repo-tokens/badge.svg` in upstream (auto-generated) — the ONLY valid source. Never cite a number from prose, memory, or an automated PR; read the badge first. Last seen: 199k at 2afbd182 (v2.1.21). Update pages that cite the count (e.g., `introduction.mdx`) if the badge value changes significantly.

## Writing Standards

- Second-person voice ("you"), active voice, direct language
- Sentence case for headings ("Getting started", not "Getting Started")
- One idea per sentence, lead with the goal
- All code blocks must have language tags
- All images must have descriptive alt text
- No marketing language, filler phrases, or emoji
- Include code examples and link to related pages
- Always preview locally with `mint dev` before submitting PRs
