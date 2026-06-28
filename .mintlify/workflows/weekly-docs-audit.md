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

Sidebar `tag` badges are a contrast signal — they only help when they mark the *few* pages worth a second look. Keep them scarce: a badge on most of the nav reads as noise, not news.

Check all `.mdx` files for `tag` frontmatter fields and apply these rules in order:

- **`NEW`** — remove from any page whose *first* commit is more than 2 weeks old (`git log --diff-filter=A --follow --format=%cI -- <file> | tail -1`). `NEW` is only for genuinely new pages; a page that merely gained content should carry `UPDATED`, not `NEW`.
- **`UPDATED`** — date this off the page's last **content** change, NOT its last commit. A commit whose only change to the file is the `{/* verified-against … */}` comment line or the `tag:` frontmatter field is bookkeeping, not content — it must not keep a page badged. Inspect each candidate commit's diff (`git log -p --follow -- <file>`) and use the most recent commit that touches any *other* line as the freshness date; remove `UPDATED` if that date is more than 2 weeks old. (This is the key fix: SHA-only `verified-against` bumps and tag edits no longer reset the clock.)
- **Saturation cap** — after the above, if more than **10 pages** still carry `UPDATED` (~20% of the nav), keep the tag only on the 10 with the most recent content change and strip it from the rest, oldest first. This bounds the badge count no matter how many pages an upstream sync touched at once.
- Leave other tags (e.g., `BETA`, `DEPRECATED`) untouched — these are intentional and long-lived.

### 7. Report and fix

- For broken links and stale references: fix them directly
- For stale verified-against pages: re-verify against code, fix any drift, and bump the comment's SHA
- For missing documentation: add stub sections with TODO markers
- For frontmatter issues: add missing fields
- For stale tags: remove them
- If everything is healthy, do not open a PR
