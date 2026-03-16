---
name: Document new skill branches
on:
  push:
    - repo: qwibitai/nanoclaw
      branch: skill/*
context:
  - repo: qwibitai/nanoclaw
automerge: false
---

A new skill branch was pushed or updated on the upstream NanoClaw repository. Review the skill and create or update its documentation page.

## Instructions

### 1. Identify the skill

Determine which `skill/*` branch was pushed. Check its contents:
- New source files added (e.g., `src/channels/telegram.ts`)
- Modified files (e.g., `src/index.ts`, `src/config.ts`, `package.json`)
- `.env.example` additions (new environment variables)
- Any SKILL.md file in the branch

### 2. Check if documentation already exists

Look in `integrations/` for an existing page for this skill. If it exists, update it. If not, create a new one.

### 3. Create or update the integration page

Follow the pattern of existing integration pages (e.g., `integrations/discord.mdx`, `integrations/telegram.mdx`). Each integration page should include:

- **Title and description** in frontmatter
- **Overview** — what the integration does and which library it uses
- **Installation** — `git fetch upstream skill/{name}` and `git merge upstream/skill/{name}`
- **Setup** — environment variables, authentication steps, platform-specific configuration
- **Registration** — how to register groups with the correct JID format
- **Features** — what capabilities the integration supports
- **Removing** — how to revert the merge and clean up registrations
- **Troubleshooting** — common issues (bot not responding, auth errors, missing tokens)

### 4. Update the integrations overview

If this is a new integration, add it to `integrations/overview.mdx` in the channel list.

### 5. Update navigation

If this is a new page, add it to the navigation in `docs.json` under the Integrations group.

### 6. Style guidelines

- Match the existing tone and structure of other integration pages
- Use Mintlify components (Tabs, Accordions, CodeGroups) where appropriate
- Include the JID format for group registration
- Always include a "Removing" section with `git revert` instructions
