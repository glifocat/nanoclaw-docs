---
name: Sync upstream code changes
on:
  push:
    - repo: nanocoai/nanoclaw
      branch: main
context:
  - repo: nanocoai/nanoclaw
automerge: false
---

A push was made to the NanoClaw source repository. Review the changes and update the documentation to reflect any modifications.

Read this repo's `CLAUDE.md` (NanoClaw Architecture Context section) first — it is the source of truth for the v2 model and lists confirmed upstream-doc traps. **Code is the ONLY source of truth.** Never trust upstream `docs/`, README.md, CLAUDE.md, or SKILL.md prose over what `src/`, `setup/`, and `container/` actually do.

## Instructions

### 1. Find affected pages via verified-against comments

Every docs page carries a verification comment right after the frontmatter:

```text
{/* verified-against: <upstream file paths> @ <upstream sha> */}
```

Use it to scope the work:

1. For each page, take its cited SHA and run a diff against upstream HEAD in the context repo: `git diff <sha>..HEAD --name-only`.
2. Intersect the changed files with the paths cited in the page's comment.
3. Only pages whose cited files actually changed need re-verification. Skip the rest.

### 2. Re-verify and update affected pages

For each affected page:

- Read the changed upstream files and compare against the page's claims, code snippets, env vars, defaults, and table/column names.
- Update the page where the code diverged. If nothing in the page is affected by the diff, still bump the comment.
- **Always update the verified-against comment's SHA** to the upstream HEAD you verified against (adjust the cited file list if the page now depends on different files).

### 3. Key page mappings

When changes don't map cleanly through verified-against comments (e.g., brand-new upstream files), use these mappings:

- Container lifecycle, runtime, mounts → `concepts/container-lifecycle.mdx`, `reference/container-config.mdx`
- Security, egress lockdown, mount security → `concepts/security.mdx`, `concepts/isolation-levels.mdx`, `operate/hardening.mdx`
- Architecture, routing, sessions → `concepts/architecture.mdx`, `concepts/entity-model.mdx`
- Configuration, env vars → `operate/configuration.mdx`, `reference/environment-variables.mdx`
- Credentials (Agent Vault) → `operate/credentials.mdx`
- `ncl` CLI → `operate/ncl-cli.mdx`, `reference/ncl-cli.mdx`
- Channel adapters, webhook server → `channels/` pages, `reference/adapter-interface.mdx`
- Skills (`.claude/skills/`, `container/skills/`) → `extend/` pages, `reference/skills-catalog.mdx` (new skills: follow the routing table in the new-skill-docs workflow)
- MCP tools, agent-runner → `reference/mcp-tools.mdx`
- DB schema → `reference/db-schema.mdx`
- Scheduled tasks → `guides/scheduled-tasks.mdx`
- Setup, upgrade flow → `installation.mdx`, `operate/upgrading.mdx`
- Version bumps, breaking changes (`package.json`, `CHANGELOG.md`) → `changelog/index.mdx`

### 4. Verification rules

- **Verify against code, not prose.** Upstream markdown (including SKILL.md) drifts from reality — the docs repo's `CLAUDE.md` lists confirmed traps (Apple Container support, tini as PID 1, skills-as-branches, `MAX_CONCURRENT_CONTAINERS`, and more). Treat SKILL.md as the executable spec for a skill's behavior only, never as facts about core code.
- Code snippets in docs must match actual source — docs prose uses product names (e.g., "Agent Vault") but quoted code must match `src/` verbatim (which says "gateway").
- Do NOT use line number references (e.g., `src/file.ts:123`) — these drift constantly. Use descriptive references instead.

### 5. Housekeeping

- If a change doesn't affect documentation, skip it.
- Keep documentation concise. Match the existing style of each page.
- For every page where you make a **content change** (corrected facts, new sections, changed behavior), add or keep `tag: "UPDATED"` in the frontmatter. Do NOT add the tag for cosmetic-only changes (formatting, component swaps, whitespace, or a SHA-only bump of the verified-against comment). If the page already has a different tag (e.g., `NEW`), replace it with `UPDATED`. Example:
  ```yaml
  ---
  title: "Container lifecycle"
  description: "..."
  tag: "UPDATED"
  ---
  ```
