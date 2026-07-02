---
name: Document new skills, channel adapters, and providers
on:
  push:
    - repo: nanocoai/nanoclaw
      branch: channels
    - repo: nanocoai/nanoclaw
      branch: providers
context:
  - repo: nanocoai/nanoclaw
automerge: false
---

A push was made to a registry branch (`channels` or `providers`) on the upstream NanoClaw repository. New or updated channel adapters land on `channels`; provider adapters (Codex, OpenCode, Ollama, …) land on `providers`; new skills land in `.claude/skills/` on `main` (those are caught by the sync workflow, which routes here for documentation rules). Review what changed and create or update the documentation.

Read this repo's `CLAUDE.md` (NanoClaw Architecture Context section) first — it is the source of truth for the v2 model and lists confirmed upstream-doc traps. Key points: skills are SKILL.md workflows, NOT git branches; channel adapters are installed by `/add-<channel>` skills that fetch-and-copy files from the `channels` registry branch, never `git merge`; treat a skill's SKILL.md as the executable spec for its BEHAVIOR, but never as a source of facts about core code — verify claims against `src/`, `setup/*.sh`, and `container/`.

## Instructions

### 1. Identify what changed

- New or modified adapter directories on the `channels` registry branch (e.g., `src/channels/<adapter>/`)
- New or modified provider files on the `providers` registry branch (e.g., `container/agent-runner/src/providers/<provider>.ts`, `setup/providers/<provider>.ts`)
- New or modified `.claude/skills/<name>/SKILL.md` workflows (channel installers, tool installers, provider installers, operational skills)
- New `setup/add-*.sh` wizards
- Container skills in `container/skills/`
- `.env.example` or env-var additions tied to the skill

### 2. Route to the right docs pages

Classify the skill and update accordingly:

| Skill type | Where it's documented |
|---|---|
| Channel adapter / `/add-<channel>` skill | `channels/<channel>.mdx` (dedicated page if it has a `setup/add-*.sh` wizard; otherwise a row in `channels/more-channels.mdx`) + a row in `reference/skills-catalog.mdx` |
| Tool skill (e.g., `/add-*-tool`) | `extend/tools.mdx` + a row in `reference/skills-catalog.mdx` |
| Provider skill (e.g., `/add-codex`) | `extend/providers.mdx` + a row in `reference/skills-catalog.mdx` |
| Operational skill | Row in `reference/skills-catalog.mdx` (+ the relevant `operate/` page if it changes day-to-day operations) |

### 3. Create or update the page

For dedicated channel pages, follow the pattern of existing ones (e.g., `channels/discord.mdx`, `channels/telegram.mdx`). Each should include:

- **Title and description** in frontmatter
- **Overview** — what the channel does and which library/API it uses
- **Installation** — the `/add-<channel>` skill or `setup/add-<channel>.sh` wizard (never `git merge` instructions)
- **Setup** — environment variables, authentication steps, platform-specific configuration (verify env vars against the installer script and `src/`, not SKILL.md prose)
- **Wiring** — how to connect the messaging group to an agent group
- **Features** — what capabilities the channel supports
- **Removal** — match how existing channel pages document removal (REMOVE.md workflows where they exist)
- **Troubleshooting** — common issues (bot not responding, auth errors, missing tokens)

### 4. Add the verified-against comment

Every page carries a verification comment right after the frontmatter:

```text
{/* verified-against: <upstream files you checked> @ <upstream sha> */}
```

Add it to new pages; bump the SHA (and adjust the file list) on pages you update after re-verifying against upstream code.

### 5. Update overview and catalog

- New channel → add it to `channels/overview.mdx` and/or `channels/more-channels.mdx`
- Every new skill → add a row to `reference/skills-catalog.mdx`

### 6. Update navigation

If this is a new page, add it to the navigation in `docs.json` under the appropriate group (Channels, Extend, or Reference → Operating).

### 7. Tag new pages

Add `tag: "NEW"` in the frontmatter of any newly created page:
```yaml
---
title: "Telegram"
description: "..."
tag: "NEW"
---
```

If you are updating an existing page instead of creating one, use `tag: "UPDATED"` instead.

### 8. Style guidelines

- Match the existing tone and structure of other pages in the same directory
- Use Mintlify components (Tabs, Accordions, CodeGroups) where appropriate
- Verify every factual claim against code (`src/`, `setup/`, `container/`) — never against upstream markdown prose
