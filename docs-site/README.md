# NanoClaw docs portal (staged v2 MVP)

This directory is a self-contained [Mintlify](https://mintlify.com) project that holds the **staged v2 documentation portal** for NanoClaw. It is deliberately scoped to an MVP foundation while the v2 docs catch up — it does not replace the existing docs at the repository root.

## Scope (PR 1)

- Mintlify shell and config (`docs.json`)
- MVP foundation pages only:
  - `introduction.mdx`
  - `quickstart.mdx`
  - `migration-from-v1.mdx`
  - `architecture.mdx` — architecture overview
  - `database-and-sessions.mdx` — database and session model
  - `changelog.mdx` — changelog and versioning

Detailed channel and provider guides are intentionally deferred to later stages.

## Source of truth

Content is tied to NanoClaw v2 source discovery from `qwibitai/nanoclaw`:

- Release tag: `v2.0.54`
- Commit: `a33b1ae`
- Package version: `2.0.54`
- Discovery date: `2026-05-10`

Primary sources used: the v2 `README.md`, `CLAUDE.md`, `CHANGELOG.md`, `docs/db.md` (and the linked `docs/db-central.md` / `docs/db-session.md`), `docs/v1-to-v2-changes.md`, `docs/migration-dev.md`, `docs/architecture.md`, `docs/isolation-model.md`, `docs/build-and-runtime.md`, `migrate-v2.sh`, `nanoclaw.sh`, `package.json`, `src/db/schema.ts`, `src/db/migrations/014-container-configs.ts`, `src/db/migrations/015-cli-scope.ts`, `src/container-config.ts`, and `src/cli/`.

Pages that make version-sensitive claims carry a **Source status** callout near the top with the release tag, commit, package version, date, and the specific source files checked. When the upstream tag or version moves, re-verify those pages and update the callouts.

Avoid reintroducing stale v1 claims here — the only place v1 behavior appears is in explicit migration warnings on `migration-from-v1.mdx` and `changelog.mdx`.

## Local development

Install the Mintlify CLI once (`npm i -g mint`), then from this directory:

```bash
mint dev              # local preview at http://localhost:3000
mint validate         # strict build validation
mint broken-links     # check internal links
```

`mint validate` and `mint broken-links` must be run from the directory that contains `docs.json` — that is, this `docs-site/` directory, not the repository root.

## Relationship to the root docs

The existing production docs site lives at the repository root (`../docs.json` and the content directories beside it). This `docs-site/` portal is staged separately so it can be reviewed and iterated without disturbing what is currently deployed. Promotion/merge strategy is out of scope for PR 1.
