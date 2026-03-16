---
name: Weekly docs health audit
on:
  cron: "0 9 * * 1"
context:
  - repo: qwibitai/nanoclaw
automerge: false
---

Run a weekly health check on the documentation, comparing it against the current upstream codebase.

## Instructions

### 1. Check for broken internal links

Scan all `.mdx` files for internal links (e.g., `[text](/path/to/page)`, `[text](./relative.mdx)`) and verify the target pages exist. Report any broken links.

### 2. Check for stale code references

Compare code snippets and function references in the docs against the actual upstream source code in the `qwibitai/nanoclaw` context repo. Flag any that no longer match, specifically:

- Function names that no longer exist (e.g., `readSecrets()` was removed)
- Database paths or table names that changed
- Configuration option names or defaults that changed
- File paths referenced in docs that no longer exist
- Import paths or module structures that changed

### 3. Check for missing documentation

Review recent upstream changes (last 7 days of commits on `qwibitai/nanoclaw`) and identify any new features, configuration options, or behavioral changes that aren't documented yet.

### 4. Check frontmatter quality

Verify all `.mdx` files have:
- A `title` field
- A `description` field with at least 50 characters

### 5. Report and fix

- For broken links and stale references: fix them directly
- For missing documentation: add stub sections with TODO markers
- For frontmatter issues: add missing fields
- If everything is healthy, do not open a PR
