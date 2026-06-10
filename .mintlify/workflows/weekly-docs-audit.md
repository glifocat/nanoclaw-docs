---
name: Weekly docs health audit
on:
  cron: "0 9 * * 1"
context:
  - repo: nanocoai/nanoclaw
automerge: false
---

Run a weekly health check on the documentation, comparing it against the current upstream codebase (`nanocoai/nanoclaw`).

Read this repo's `CLAUDE.md` (NanoClaw Architecture Context section) first — it is the source of truth for the v2 model and lists confirmed upstream-doc traps. Verify all claims against code (`src/`, `setup/`, `container/`, `.claude/skills/`), never against upstream markdown prose.

## Instructions

### 1. Check for broken internal links

Scan all `.mdx` files for internal links (e.g., `[text](/path/to/page)`, `[text](./relative.mdx)`) and verify the target pages exist. Watch for links to the pre-refactor tree (`integrations/`, `features/`, `advanced/`, `api/`) — those directories are gone; the current tree is `channels/`, `operate/`, `guides/`, `extend/`, `concepts/`, `reference/`. Report any broken links.

### 2. Flag stale verified-against comments

Every page carries `{/* verified-against: <files> @ <sha> */}` after the frontmatter. For each page:

1. Run `git diff <page-sha>..HEAD --name-only` in the upstream context repo.
2. Intersect the changed files with the paths cited in the comment.
3. Flag pages whose SHA is behind upstream `main` AND whose cited files changed in that range — these need re-verification.

Pages whose cited files did not change are fine even if their SHA is old.

### 3. Check for stale code references

Compare code snippets and function references in the docs against the actual upstream source code in the `nanocoai/nanoclaw` context repo. Flag any that no longer match, specifically:

- Function names that no longer exist
- Database paths or table names that changed (central DB is `data/v2.db`)
- Configuration option names or defaults that changed
- File paths referenced in docs that no longer exist
- Import paths or module structures that changed

### 4. Check for missing documentation

Review recent upstream changes (last 7 days of commits on `nanocoai/nanoclaw` `main`, plus the `channels` registry branch for new adapters) and identify any new features, configuration options, skills, or behavioral changes that aren't documented yet. Route new-skill docs per the table in the new-skill-docs workflow (channel skills → `channels/` + `reference/skills-catalog.mdx`; tool skills → `extend/tools.mdx` + catalog; provider skills → `extend/providers.mdx` + catalog; operational skills → catalog + relevant `operate/` page).

### 5. Check frontmatter quality

Verify all `.mdx` files have:
- A `title` field
- A `description` field with at least 50 characters

### 6. Clean up stale sidebar tags

Check all `.mdx` files for `tag` frontmatter fields. Remove tags that are no longer relevant:
- Remove `tag: "NEW"` from pages that were created more than 2 weeks ago (check git log for the file's first commit date)
- Remove `tag: "UPDATED"` from pages that were last modified more than 2 weeks ago (check git log for the file's last commit date)
- Leave other tags (e.g., `BETA`, `DEPRECATED`) untouched — these are intentional and long-lived

### 7. Report and fix

- For broken links and stale references: fix them directly
- For stale verified-against pages: re-verify against code, fix any drift, and bump the comment's SHA
- For missing documentation: add stub sections with TODO markers
- For frontmatter issues: add missing fields
- For stale tags: remove them
- If everything is healthy, do not open a PR
