# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mintlify-powered documentation site for **NanoClaw** — a lightweight, secure AI assistant that runs Claude agents in isolated Docker containers with multi-messenger support. The main NanoClaw repo is at https://github.com/qwibitai/nanoclaw; this repo is the docs site deployed to https://nanoclaw.dev.

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

## NanoClaw Architecture Context

When editing docs, keep these architectural facts current:
- **Multi-channel:** NanoClaw supports WhatsApp, Telegram, Discord, Slack, and Gmail as equal channels. No channel is the "default" — avoid WhatsApp-centric language in non-WhatsApp pages.
- **Skills as git branches:** Skills are `skill/*` branches merged via `git merge`, not a custom engine. No manifest.yaml, no .nanoclaw/state.yaml, no apply-skill.ts. See `integrations/skills-system.mdx` as source of truth.
- **Removing a skill:** `git revert -m 1 <merge-commit>`, not manual file deletion.
- **Source of truth for NanoClaw code:** https://github.com/qwibitai/nanoclaw

## PR Workflow

- Always run `mint validate` before creating PRs
- Run `mint broken-links` when adding or changing internal links
- GitHub labels in `.github/labels.yml` may not exist on remote — don't use `--label` with `gh pr create` unless verified

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

**Navigation:** When adding or moving pages, update the `navigation` array in `docs.json`. The site has two tabs: "Documentation" (5 groups) and "API Reference" (2 groups). New pages not added to `docs.json` won't appear in the sidebar.

**File naming:** Use kebab-case (e.g., `agent-swarms.mdx`). Match existing patterns in the directory.

**Internal links:** Use root-relative paths without file extensions: `/getting-started/quickstart` (not `../page` or `/page.mdx`).

**Images:** Store in `images/`, reference with root-relative paths, always include descriptive alt text.

**Components available:** `<Note>`, `<Info>`, `<Tip>`, `<Warning>`, `<Check>`, `<Danger>`, `<Steps>/<Step>`, `<Tabs>/<Tab>`, `<CodeGroup>`, `<Columns>`, `<Card>`, `<AccordionGroup>/<Accordion>`, Mermaid diagrams, and more (see `/mintlify` skill for full list).

## Writing Standards

- Second-person voice ("you"), active voice, direct language
- Sentence case for headings ("Getting started", not "Getting Started")
- One idea per sentence, lead with the goal
- All code blocks must have language tags
- All images must have descriptive alt text
- No marketing language, filler phrases, or emoji
- Include code examples and link to related pages
- Always preview locally with `mint dev` before submitting PRs
