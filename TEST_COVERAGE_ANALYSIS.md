# Test Coverage Analysis

## Current State

This repository has **zero tests and no test infrastructure**. It is a Mintlify documentation site containing 35 MDX files across 6 sections (Get Started, Core Concepts, Features, Integrations, API Reference, Advanced).

## Proposed Test Areas

### 1. Navigation Integrity (High Priority)

**Problem:** `docs.json` references 35 page paths. If a file is renamed, moved, or deleted, the site breaks silently.

**Proposed test:** Validate that every page listed in `docs.json` navigation corresponds to an existing `.mdx` file on disk.

**What it catches:** Broken navigation entries, orphaned pages not reachable from any menu, typos in path references.

---

### 2. Internal Link Validation (High Priority)

**Problem:** MDX files contain 25+ internal links via `<Card href="...">` and markdown `[text](/path)` syntax. Broken internal links degrade user experience.

**Proposed test:** Extract all internal `href` values from every MDX file and verify the target `.mdx` file exists.

**What it catches:** Links to renamed/deleted pages, typos in link paths.

---

### 3. Frontmatter Validation (Medium Priority)

**Problem:** Mintlify requires `title` and `description` in every MDX file's YAML frontmatter. Missing fields cause build warnings or broken page metadata.

**Proposed test:** Parse frontmatter from every MDX file and assert both `title` and `description` are present and non-empty strings.

**What it catches:** Missing metadata, empty titles/descriptions, malformed frontmatter.

---

### 4. External Link Checking (Medium Priority)

**Problem:** The docs reference ~10 external URLs (GitHub repos, Discord invite, Telegram API, NVM installer, etc.). These can rot over time.

**Proposed test:** Collect all external URLs from MDX files and verify they return HTTP 2xx (run periodically in CI, not on every commit).

**What it catches:** Dead links to external resources, moved GitHub repos, expired Discord invites.

---

### 5. Code Block Syntax Validation (Medium Priority)

**Problem:** Documentation contains code blocks in 8 languages (TypeScript, bash, JSON, SQL, Python, XML, Mermaid, markdown). Invalid code examples mislead users.

**Proposed test:**
- Validate JSON code blocks parse without errors.
- Validate Mermaid diagram blocks have valid syntax.
- Optionally lint TypeScript/bash blocks for basic syntax correctness.

**What it catches:** Broken JSON examples, malformed Mermaid diagrams, syntax errors in code samples.

---

### 6. docs.json Schema Validation (Low Priority)

**Problem:** `docs.json` drives the entire site structure. A malformed config breaks the whole site.

**Proposed test:** Validate `docs.json` against the Mintlify schema (referenced via `$schema` field) or at minimum check required fields exist (`name`, `theme`, `colors`, `navigation`).

**What it catches:** Missing required config fields, structural errors in navigation definition.

---

### 7. Duplicate Content Detection (Low Priority)

**Problem:** With 35 pages across overlapping topic areas (e.g., `concepts/security` vs `advanced/security-model`), content can drift into duplication.

**Proposed test:** Flag pages with high textual similarity scores to prompt authors to consolidate or cross-reference.

**What it catches:** Near-duplicate content across pages, redundant documentation.

---

## Recommended Implementation Plan

### Phase 1 — Quick wins with a simple Node.js test runner

Add a lightweight test suite using Node.js (no heavy framework needed) that covers items 1-3:

```
tests/
  navigation.test.js    # Validates docs.json paths → files exist
  links.test.js         # Validates internal hrefs → files exist
  frontmatter.test.js   # Validates title + description in all MDX
  run.js                # Simple test runner entry point
```

Add to `package.json`:
```json
{
  "scripts": {
    "test": "node tests/run.js"
  }
}
```

### Phase 2 — CI integration

Add a GitHub Actions workflow (`.github/workflows/test.yml`) that runs tests on every PR to catch issues before merge.

### Phase 3 — Extended checks

Add external link checking (item 4) on a weekly schedule and code block validation (item 5) per-commit.

## Priority Summary

| Test Area | Priority | Effort | Value |
|---|---|---|---|
| Navigation integrity | High | Low | Prevents broken site structure |
| Internal link validation | High | Low | Prevents dead links |
| Frontmatter validation | Medium | Low | Ensures consistent metadata |
| External link checking | Medium | Medium | Catches link rot |
| Code block validation | Medium | Medium | Ensures accurate examples |
| Config schema validation | Low | Low | Prevents config breakage |
| Duplicate detection | Low | High | Improves content quality |
