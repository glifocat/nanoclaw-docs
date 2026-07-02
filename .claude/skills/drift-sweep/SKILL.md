---
name: drift-sweep
description: Use when the docs have fallen behind upstream nanoclaw (a multi-version gap, a new release, or the weekly audit flags drift) and need a rigorous re-verification sweep — classify every page clean/dirty, verify in parallel, ship stacked PRs, reconstruct the changelog, and bump verified-against SHAs honestly. This is the thorough operator-run version of the auto sync-upstream-changes workflow.
---

# Drift Sweep

Bring the whole docs site current with upstream `nanocoai/nanoclaw` after it has moved — especially across several versions, where the lightweight auto `sync-upstream-changes` workflow under-performs. Produces a prioritized set of stacked PRs, each verified against source and confirmed live.

## When to use

- Docs are several versions behind upstream (the weekly audit flags "N versions behind").
- A big upstream release landed and you want a rigorous pass, not just the per-push reconciler.
- `verified-against` anchors across the site are stale and need re-verification + bumping.

For triaging *open automated PRs* instead, use `/triage-docs-prs`. For a single-page fix, just edit it.

## Before you start

Read this repo's `CLAUDE.md` — the **NanoClaw Architecture Context**, **Drift Detection**, **Sidebar Tags**, and **PR Workflow** sections are the source of truth and list the confirmed upstream-doc traps. **Code is the only source of truth** — verify every claim against `src/`, `container/`, `setup/`, `.claude/skills/`, never against upstream markdown prose. Shell is zsh and macOS (see CLAUDE.md gotchas: `grep -oE` not `-oP`; unquoted `$var` doesn't word-split; git flags before the `<rev>..<rev>` range).

Upstream checkout lives at the path in CLAUDE.md's "Upstream PRs" section; `upstream` remote = `nanocoai/nanoclaw`.

## Workflow

### Phase 1 — Scope the gap

```bash
UP=<upstream-checkout>          # from CLAUDE.md
git -C "$UP" fetch upstream --quiet
git -C "$UP" log upstream/main -1 --format='%h %ci %s'
git -C "$UP" show upstream/main:package.json | grep '"version"'   # current version
git -C "$UP" show upstream/main:repo-tokens/badge.svg | grep -oE '[0-9]+k' | head -1   # token count (only valid source)

# Docs anchors in play (most pages share one or two SHAs)
grep -rhoE 'verified-against:.*@ [0-9a-f]{7,}' --include='*.mdx' . | grep -oE '[0-9a-f]{7,}' | sort | uniq -c | sort -rn

# Delta size
git -C "$UP" rev-list --count <docs-anchor>..upstream/main
```

Registry branches can be **force-pushed** — fetch into explicit refs and diff with three dots:

```bash
git -C "$UP" fetch upstream 'refs/heads/channels:refs/remotes/upstream/channels' 'refs/heads/providers:refs/remotes/upstream/providers' --quiet
git -C "$UP" merge-base --is-ancestor <providers-anchor> upstream/providers && echo "fast-forward" || echo "force-pushed → use 3-dot"
git -C "$UP" diff <providers-anchor>...upstream/providers --name-only   # 3-dot is force-push-safe
```

### Phase 2 — Classify every page (clean vs dirty)

For each page, intersect its `verified-against` cited files with the changed-file set (`git diff <anchor>..upstream/main --name-only`, plus the registry-branch diffs).

- **Clean** — no cited file changed → safe to bump the SHA, no content work.
- **Dirty** — at least one cited file changed → needs verification.

Do NOT trust a quick regex intersection: citations use brace globs with internal commas (`{a,b,c}.ts`) that naive comma-splitting mangles, silently under-reporting drift. Use the parallel verification in Phase 3 as the authority.

### Phase 3 — Verify in parallel (read-only subagents)

Fan out one read-only subagent per page-area (channels / concepts / operate / guides+extend / get-started+reference). Each agent, for its pages:

1. Extracts cited files (expanding brace globs; noting which branch each is on).
2. Diffs each cited file across the correct branch's `<anchor>..<head>` (trunk: `<trunk-anchor>..upstream/main`; channels: `<channels-anchor>..upstream/channels` if fast-forward, 3-dot otherwise; providers: 3-dot). The anchors come from the Phase 1 census of the pages' own `verified-against` comments — never reuse a SHA from a previous sweep, an example, or memory; a hardcoded anchor goes stale the moment a sweep merges.
3. Reads the diff of every changed cited file and judges whether the page's specific claims still hold.
4. Returns a per-page verdict: **CLEAN** (no cited file changed) | **BUMP-OK** (changed but claims accurate) | **NEEDS-EDIT** (a claim is now wrong/stale, OR a notable new behavior is missing where the page would mention it) — with the exact stale quote, the correct fact, and source evidence.

Dispatch all area-agents in one message so they run concurrently. You keep the verdicts and apply all edits/bumps yourself (no agent edits) to avoid conflicts.

### Phase 4 — Plan stacked PRs

Group findings by concern, one concern per PR (CLAUDE.md PR Workflow). Typical tiers:

- **Tier 1 — new features** (need content, not just a SHA): one PR per feature, touching its natural page set.
- **Tier 2 — re-verify + bump**: pages whose cited files changed via churn but whose claims still hold → SHA bump only.
- **Cosmetic**: token badge, tag hygiene.

Reconstruct the product changelog by mapping features to versions via the bump commits (upstream `CHANGELOG.md` parks everything under `[Unreleased]`):

```bash
git -C "$UP" log --reverse --format='%H %ci %s' <anchor>..upstream/main -- package.json | grep -i 'bump version'
# then per consecutive bump range (flags BEFORE the range):
git -C "$UP" log --format='%s' <bumpA>..<bumpB> | grep -iE '^(feat|fix)' | grep -viE 'lint|typo|chore|test:'
```

### Phase 5 — Execute (with user approval)

Per PR, in order:

1. Branch off `main`. Edit pages; **bump a page's `verified-against` SHA only where you actually re-verified its cited files** — a narrow prose fix can leave the old SHA for a later full pass.
2. `mint validate` and (if links/anchors changed) `mint broken-links` — both from the `docs.json` dir.
3. `gh pr create` + apply labels/metadata; `gh pr merge --squash` once the Mintlify Deployment check is green.
4. **Verify live in a browser** (Playwright) — the docs edge 404s to `curl`. Deploy lags ~1–2 min after merge; wait before checking.
5. `git checkout main && git pull --rebase origin main` before the next PR (post-merge deploy-bot push race).

Finish the sweep with: product + docs-updates changelogs, the token badge if it moved, and **tag hygiene** — keep `UPDATED` only on pages with real new content (cap ~10; strip stale `NEW` and SHA-only badges, per CLAUDE.md Sidebar Tags).

## Common mistakes

- Bumping a SHA on a page you didn't actually re-verify (the anchor then lies).
- Plain `git diff anchor..branch` on a force-pushed registry branch (misses dropped commits — use `...`).
- Trusting a regex clean/dirty split over the subagent verdicts (brace-comma citations break it).
- Citing a token count from memory or a PR instead of `repo-tokens/badge.svg`.
- `curl`-checking a live page (always 404) instead of a browser; checking before the deploy propagates.
- Cramming unrelated fixes into one PR, or letting a sweep leave dozens of sidebar badges.
- Diffing from an anchor that didn't come from the Phase 1 census — a SHA remembered from a previous sweep (or copied from an old example) silently under-scopes the whole classification.

## Output format

A short scope line (versions behind, commit delta, anchors), the per-page verdict map (clean / bump-ok / needs-edit), and the stacked-PR plan with each PR's page set and concern. Then execute on approval, reporting each PR merged + verified live.
