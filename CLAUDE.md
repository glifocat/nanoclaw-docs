# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mintlify-powered documentation site for **NanoClaw** — a lightweight, secure AI assistant that runs Claude agents in isolated Docker containers with multi-messenger support. The main NanoClaw repo is at https://github.com/qwibitai/nanoclaw; this repo is the docs site deployed to https://nanoclaw.dev.

**GitHub:** `glifocat/nanoclaw-docs` (not `qwibitai` — that's the upstream NanoClaw source repo)

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

## NanoClaw Architecture Context

When editing docs, keep these architectural facts current:
- **Multi-channel:** NanoClaw supports WhatsApp, Telegram, Discord, Slack, and Gmail as equal channels. No channel is the "default" — avoid WhatsApp-centric language in non-WhatsApp pages.
- **Skills as git branches:** Skills are `skill/*` branches merged via `git merge`, not a custom engine. No manifest.yaml, no .nanoclaw/state.yaml, no apply-skill.ts. See `integrations/skills-system.mdx` as source of truth.
- **Channel forks:** Channels live in separate fork repos (`nanoclaw-whatsapp`, `nanoclaw-telegram`, etc.). Channel-specific skills (image-vision, voice-transcription, reactions, pdf-reader) live on the channel fork, not upstream.
- **Removing a skill:** `git revert -m 1 <merge-commit>`, not manual file deletion.
- **Source of truth for NanoClaw code:** https://github.com/qwibitai/nanoclaw
- **Credential management (v1.2.35+):** OneCLI Agent Vault is the sole credential system. The built-in credential proxy is available as an opt-in skill (`/use-native-credential-proxy`). Legacy tabs in docs cover both methods. Note: upstream source code still uses "gateway" in code — docs prose says "Agent Vault" but code snippets must match actual source.

## PR Workflow

- **Post-merge push race**: After `gh pr merge`, the Mintlify deploy bot pushes to main almost immediately. Always `git pull --rebase origin main` before pushing local follow-up commits (e.g., changelog updates). If you have unstaged changes, stash first.
- Always run `mint validate` before creating PRs
- **Validating PR branches**: `git worktree add /tmp/validate-prN origin/BRANCH && cd /tmp/validate-prN && mint validate` — validates without switching branches. Clean up with `git worktree remove /tmp/validate-prN`.
- Run `mint broken-links` when adding or changing internal links
- Available labels: `content-gap`, `new-page`, `update-existing`, `high-priority`, `medium-priority`, plus GitHub defaults
- For auto-closing issues, put each `Closes #N` on its own line in the PR body
- For multi-concern changes, split into stacked PRs (base each on the previous branch). After merging, retarget the next PR to `main` and rebase.
- **Post-merge verification**: Use the `nanoclaw-docs` MCP (`search_nano_claw`) to verify changes are live and indexed correctly after merging to `main`.

## Architecture

All content is `.mdx` (Markdown + JSX components). Navigation and site config live in `docs.json`.

**Content directories:**
- `concepts/` — Architecture, security model, containers, groups, tasks
- `features/` — Messaging, scheduled tasks, agent swarms, customization, web access
- `integrations/` — Channel setup (WhatsApp, Telegram, Discord, Slack, Gmail) and skills system
- `advanced/` — Deep dives: container runtime, IPC, Docker sandboxes, troubleshooting
- `api/` — Core API reference and skills development guides
- Root: `introduction.mdx`, `quickstart.mdx`, `installation.mdx`

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

**Non-docs files**: `mint validate` and `mint broken-links` parse ALL `.md`/`.mdx` files in the repo tree, including non-docs files (plans, specs). MDX snippets in markdown code blocks cause parsing errors. Keep non-docs markdown files outside the repo or delete them before validating.

**Multi-issue PRs**: When closing multiple issues, put each `Closes #N` on its own line AND add matching labels via `gh pr edit --add-label`.

**Navigation:** When adding or moving pages, update the `navigation` array in `docs.json`. The site has two tabs: "Documentation" (5 groups) and "API Reference" (2 groups). New pages not added to `docs.json` won't appear in the sidebar.

**File naming:** Use kebab-case (e.g., `agent-swarms.mdx`). Match existing patterns in the directory.

**Internal links:** Use root-relative paths without file extensions: `/getting-started/quickstart` (not `../page` or `/page.mdx`).

**Images:** Store in `images/`, reference with root-relative paths, always include descriptive alt text.

**Components available:** `<Note>`, `<Info>`, `<Tip>`, `<Warning>`, `<Check>`, `<Danger>`, `<Steps>/<Step>`, `<Tabs>/<Tab>`, `<CodeGroup>`, `<Columns>`, `<Card>`, `<AccordionGroup>/<Accordion>`, Mermaid diagrams, and more (see `/mintlify` skill for full list).

**Version-gated features**: When documenting a breaking change where older versions are still valid, use `<Tabs>` with version labels (e.g., "OneCLI Agent Vault (v1.2.22+)" / "Credential Proxy (legacy)") for sections with substantial content, and `<Note>` callouts for passing references. Use version placeholders (`vX.Y.Z`) when the release version isn't confirmed yet.

**Directory trees:** Use `<Tree>` component (not ASCII art). See `reference/components.md` for syntax.

## Sidebar Tags

Mintlify workflows in `.mintlify/workflows/` auto-manage `tag` frontmatter:
- `tag: "UPDATED"` — applied by sync workflow for content changes (not cosmetic)
- `tag: "NEW"` — applied by skill-docs workflow for new pages
- Tags are cleaned up after 2 weeks by the weekly audit workflow
- Do NOT add tags for cosmetic-only changes (formatting, component swaps)

## Automated PR Triage

Mintlify workflows generate automated PRs (`mintlify/*` branches) on upstream changes. These need manual review:
- **Always verify claims against source**: `gh search code "<term>" repo:qwibitai/nanoclaw` or fetch files directly
- **Check for overlapping PRs**: Multiple automated PRs often fix the same thing (e.g., table renames). Merge the most thorough one first, then cherry-pick unique changes from the rest.
- **Common errors in automated PRs**: fabricated commit references, incorrect renames (verify exported types), speculative feature descriptions, `allowed-tools` or other frontmatter claims that don't exist in source
- **Common fabrications found**: inventing env vars that only exist in skill SKILL.md files (not core config), inventing skill branches that don't exist, claiming runtime-based routing that doesn't exist in code, getting enum defaults wrong (e.g., `context_mode` default is `'isolated'` not `'group'`)
- **Telegram is NOT on main**: Automated PRs repeatedly claim Telegram is a core channel — it lives in `nanoclaw-telegram` fork. Only stubs and `/add-telegram` skill exist on main.
- **Token counts in automated PRs are always wrong**: Every automated PR uses a hallucinated value. Only verify against `repo-tokens/badge.svg` in upstream.
- **Code snippets must match source**: Automated PRs sometimes rename terms in code snippets to match marketing (e.g., "gateway" → "Agent Vault" in logger.warn). Always compare code blocks against actual upstream files — docs prose uses product names but code must match `src/`.
- **Cascading merge conflicts**: Merging one PR invalidates others touching the same files. When triaging a batch, merge isolated-file PRs first, then tackle overlapping clusters. Close conflicting PRs and consolidate verified changes into a single new PR.
- **Bulk branch cleanup**: `gh api -X DELETE repos/OWNER/REPO/git/refs/heads/BRANCH` — use after closing automated PRs to prevent clutter
- **Verify upstream PRs exist**: `gh pr view NUMBER --repo qwibitai/nanoclaw --json title,state` — automated PRs cite upstream PRs that may not exist
- **Watch for destructive automated PRs**: PRs that remove legacy/deprecated content may conflict with intentional version-tabbed documentation. Verify the removal is actually desired before merging.
- **"Superseded" PRs may have unique changes**: Always diff line-by-line before closing — never rely solely on PR descriptions
- **After large manual docs PRs**: Check for and close overlapping automated `mintlify/*` PRs immediately after merge — they pile up fast on upstream releases
- **Finding the upstream version**: `gh api 'repos/qwibitai/nanoclaw/commits?path=package.json&per_page=5' --jq '.[] | "\(.sha[0:7]) \(.commit.message | split("\n")[0])"'` — version bumps show in commit messages
- **Changelog conflicts are the #1 blocker**: Automated PRs insert changelog entries relative to their base, which goes stale fast. Close conflicting PRs and recreate with correct insertion order rather than attempting conflict resolution.
- **Use `/triage-docs-prs` skill**: Project-level skill at `.claude/skills/triage-docs-prs/` — structured 5-phase workflow for batch PR triage with upstream validation, build checks, and executable action plans.
- **Chain testing gotcha**: `git merge --no-commit` after a fast-forward produces nothing to commit. Use `git merge --no-edit` for merge chain validation in worktrees.

## Changelogs

Two changelogs to maintain — update both after any docs work session:
- `changelog/index.mdx` — Product releases (newest version first, uses `<Update>` component)
- `changelog/docs-updates.mdx` — Documentation site changes (newest entry first)
- **Upstream CHANGELOG is sparse** — often skips 10+ versions. Reconstruct by mapping commits between version bumps: `gh api 'repos/qwibitai/nanoclaw/commits?per_page=100' --jq '.[] | "\(.sha[0:7]) \(.commit.message | split("\n")[0])"'` and tracing features between "bump to X" commits.
- **Pre-release CHANGELOG headers**: Upstream CHANGELOG may have headers for unreleased versions (package.json not yet bumped). Don't add changelog entries for versions that aren't in `package.json` yet.

## Upstream PRs

To PR changes to `qwibitai/nanoclaw` from Ethan's fork (`glifocat/nanoclaw-glifocat`):
- Work in `/Users/ethanmunoz/Projects/clients/qwibit/nanoclaw-glifocat`
- Remote `upstream` = `qwibitai/nanoclaw`, `origin` = `glifocat/nanoclaw-glifocat`
- Branch from `upstream/main`, push to `origin`, PR with `--repo qwibitai/nanoclaw --head glifocat:<branch>`
- The fork may be on a different branch (e.g., `feat/dashboard-api`) — stash before switching

## Token Count

Source of truth: `repo-tokens/badge.svg` in upstream (auto-generated). Currently ~43.4k tokens. Update `introduction.mdx` and `integrations/skills-system.mdx` if the badge value changes significantly.

## Writing Standards

- Second-person voice ("you"), active voice, direct language
- Sentence case for headings ("Getting started", not "Getting Started")
- One idea per sentence, lead with the goal
- All code blocks must have language tags
- All images must have descriptive alt text
- No marketing language, filler phrases, or emoji
- Include code examples and link to related pages
- Always preview locally with `mint dev` before submitting PRs
