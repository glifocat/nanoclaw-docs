---
name: Sync upstream code changes
on:
  push:
    - repo: qwibitai/nanoclaw
      branch: main
context:
  - repo: qwibitai/nanoclaw
automerge: false
---

A push was made to the NanoClaw source repository. Review the changes and update the documentation to reflect any modifications.

## Instructions

1. Check the latest commits on the `qwibitai/nanoclaw` repo to understand what changed.
2. For each changed source file, check if there is corresponding documentation that needs updating.
3. Pay special attention to changes in:
   - `src/container-runner.ts` — container lifecycle, mounts, credential handling
   - `src/db.ts` — database schema, queries, table structure
   - `src/index.ts` — message routing, orchestration, startup sequence
   - `src/config.ts` — configuration options, defaults, environment variables
   - `src/mount-security.ts` — mount allowlist format, validation rules
   - `src/credential-proxy.ts` — authentication, credential injection
   - `src/task-scheduler.ts` — task lifecycle, scheduling behavior
   - `src/ipc.ts` — IPC commands, authorization rules
   - `container/Dockerfile` — container image contents, dependencies
   - `container/agent-runner/src/index.ts` — MCP servers, allowed tools, SDK config
   - `package.json` — version bumps, dependency changes
   - `CHANGELOG.md` — breaking changes, new features
4. Update the relevant documentation pages. Key mappings:
   - Container behavior → `concepts/containers.mdx`, `advanced/container-runtime.mdx`
   - Security model → `concepts/security.mdx`, `advanced/security-model.mdx`
   - Architecture → `concepts/architecture.mdx`
   - Configuration → `api/configuration.mdx`
   - Task scheduling → `concepts/tasks.mdx`, `features/scheduled-tasks.mdx`, `api/task-scheduling.mdx`
   - Message routing → `features/messaging.mdx`, `api/message-routing.mdx`
   - Group management → `concepts/groups.mdx`, `api/group-management.mdx`
   - Troubleshooting → `advanced/troubleshooting.mdx`
   - Skills → `integrations/skills-system.mdx`, `api/skills/`
5. If a change doesn't affect documentation, skip it.
6. Do NOT update code snippets with line number references (e.g., `src/file.ts:123`) — these drift constantly. Use descriptive references instead.
7. Keep documentation concise. Match the existing style of each page.
8. For every page you update, add or keep `tag: "UPDATED"` in the frontmatter. If the page already has a different tag (e.g., `NEW`), replace it with `UPDATED`. Example:
   ```yaml
   ---
   title: "Container runtime"
   description: "..."
   tag: "UPDATED"
   ---
   ```
