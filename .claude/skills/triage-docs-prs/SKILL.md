---
name: triage-docs-prs
description: Use when reviewing open PRs on glifocat/nanoclaw-docs, triaging automated Mintlify PRs, or planning which docs PRs to merge/close/consolidate against upstream nanoclaw changes
---

# Triage Docs PRs

Review all open PRs on the nanoclaw-docs repo, validate them against upstream, and produce an executable action plan.

## When to use

- Periodic docs PR triage (weekly or after upstream releases)
- After a batch of automated `mintlify/*` PRs arrives
- Before a docs release to clean up the PR queue

## Workflow

**Phases:** 1. Fetch & inventory → 2. Validate against upstream → 3. Build validation → 4. Action plan → 5. Execute (with user approval)

Follow each phase sequentially. Do NOT skip build validation.

### Phase 1 — Fetch and inventory

```bash
# All open PRs with metadata
gh pr list --state open --json number,title,author,createdAt,headRefName,labels,additions,deletions,changedFiles --limit 50

# Current upstream version
gh api repos/qwibitai/nanoclaw/contents/package.json --jq '.content' | base64 -d | jq -r '.version'

# Upstream token badge (use -oE for macOS compatibility)
gh api repos/qwibitai/nanoclaw/contents/repo-tokens/badge.svg --jq '.content' | base64 -d | grep -oE '[0-9.]+k'

# Scan for orphan mintlify/* branches with no open PR
git fetch --prune origin
git branch -r | grep 'origin/mintlify/' | sed 's|origin/||' | while read b; do
  gh pr list --head "$b" --state open --json number --jq 'length' | grep -q '^0$' && echo "ORPHAN: $b"
done
```

For each PR, fetch the diff and body:
```bash
gh pr view NUMBER --json body,files
gh pr diff NUMBER
```

Build an **inventory table**:

| PR | Title | Files touched | Created | Automated? |
|----|-------|---------------|---------|------------|

### Phase 2 — Validate against upstream

Verify every factual assertion in the PR body and every code snippet in the diff against upstream source. For prose-only changes (wording, formatting), verify the facts stated but don't require line-by-line source matching.

**Quick triage for duplicate clusters:** When 3+ PRs cover the same feature, identify the most comprehensive one first, deeply validate only that candidate, then diff the others against it to find unique content worth cherry-picking. Don't fully validate PRs you'll close.

Mark each claim: **VERIFIED** (confirmed in source), **FABRICATED** (contradicted by source), or **NEEDS-CHECK** (can't find, requires manual investigation).

**Verification commands:**
```bash
# Search upstream code for a term
gh search code "TERM" repo:qwibitai/nanoclaw

# Fetch a specific upstream file
gh api repos/qwibitai/nanoclaw/contents/PATH --jq '.content' | base64 -d

# Check if an upstream PR exists
gh pr view NUMBER --repo qwibitai/nanoclaw --json title,state

# Recent upstream commits (for version reconstruction)
gh api 'repos/qwibitai/nanoclaw/commits?per_page=30' --jq '.[] | "\(.sha[0:7]) \(.commit.message | split("\n")[0])"'
```

**Known automated PR pitfalls** (verify these specifically):
- Token counts — ALWAYS wrong. Only trust `repo-tokens/badge.svg`
- Fabricated commit references — verify SHAs exist
- Code snippets — must match actual `src/` files (not marketing renames)
- Telegram claims — Telegram is NOT on main, only in `nanoclaw-telegram` fork
- Env vars — may only exist in skill `SKILL.md`, not core config
- Version dates — cross-check against actual version bump commits

Produce a **validation table** per PR:

| Claim | Status | Evidence |
|-------|--------|----------|

### Phase 3 — Build validation

**Do NOT skip this phase.** The baseline failure mode is producing analysis without verifying builds.

**Skip build validation for PRs you'll recommend closing** — only validate merge candidates.

For each merge candidate, validate it builds individually:

```bash
# Validate PR branch without switching
git worktree add /tmp/validate-prN origin/BRANCH-NAME
cd /tmp/validate-prN && mint validate
# Run broken-links if PR adds/changes href, Link, or anchor references:
cd /tmp/validate-prN && mint broken-links
# Cleanup
git worktree remove /tmp/validate-prN
```

Then validate the **full merge chain** in proposed order — this catches cross-PR conflicts that per-PR validation misses:

```bash
git worktree add /tmp/chain-test main
cd /tmp/chain-test
git merge --no-commit origin/BRANCH-A
git merge --no-commit origin/BRANCH-B
# ... continue for all merge candidates in order
mint validate
# If conflict at any step: note which PRs conflict and adjust merge order
git worktree remove /tmp/chain-test
```

Record results:

| PR | mint validate | broken-links | Conflicts with |
|----|---------------|--------------|----------------|
| Full chain | | | |

### Phase 4 — Action plan

Produce a structured plan with these sections:

**4a. Overlap map** — table showing which PRs touch the same files.

**4b. Close list** — PRs to close, with reason and unique content to cherry-pick:

| PR | Action | Reason | Unique content to preserve |
|----|--------|--------|---------------------------|

When closing 3+ overlapping PRs for the same feature, recommend creating a single **consolidated PR** that cherry-picks the best content from each, rather than just noting what to preserve.

**4c. Merge order** — ordered list with dependency notes:

| Order | PR | Precondition | Rebase needed after |
|-------|-----|--------------|---------------------|

**4d. Changelog updates** — specific entries needed in:
- `changelog/index.mdx` — product version entries (use `<Update>` component, newest first)
- `changelog/docs-updates.mdx` — docs site changes (newest first)

**4e. Tag updates** — pages that need frontmatter `tag` changes:
- `tag: "UPDATED"` for substantive content changes
- `tag: "NEW"` for new pages
- Do NOT tag cosmetic-only changes (formatting, component swaps, version label corrections)

**4f. Label assignments** — PRs missing labels. Available: `content-gap`, `new-page`, `update-existing`, `high-priority`, `medium-priority`

**4g. Branch cleanup commands** — ready-to-run commands for PR branches AND orphan `mintlify/*` branches found in Phase 1:
```bash
# After closing PR #N:
gh api -X DELETE repos/glifocat/nanoclaw-docs/git/refs/heads/BRANCH-NAME
```

**4h. CLAUDE.md updates** — if token count or other referenced values changed, note what to update.

### Phase 5 — Execute (with user approval)

Present the complete action plan and **STOP**. Ask the user: "Ready to execute? Which actions should I proceed with?" Do NOT take any actions until the user confirms. They may want to modify the plan, skip certain steps, or execute only partially.

Once confirmed, execute only the approved actions:
1. Closing PRs (with comment explaining why)
2. Merging PRs (in the specified order)
3. Adding labels
4. Cleaning up branches
5. Creating follow-up PRs for cherry-picked content

After each merge, re-check subsequent PRs for conflicts introduced by the merge.

## Common mistakes

| Mistake | Prevention |
|---------|-----------|
| Trusting automated PR token counts | Always verify against `repo-tokens/badge.svg` |
| Skipping `mint validate` | Phase 3 is mandatory — no merge recommendation without it |
| Merging overlapping PRs without conflict check | Test merge order in Phase 3 |
| Adding `tag: "UPDATED"` to cosmetic changes | Only tag substantive content additions/changes |
| Closing "superseded" PRs without diffing | Always diff line-by-line — superseded PRs may have unique changes |
| Recommending code snippet changes that rename source terms | Code blocks must match actual `src/` files, not marketing language |
| Assuming Telegram is a core channel | Telegram is fork-only (`nanoclaw-telegram`); only stubs exist on main |

## Output format

Use markdown with clear headers matching the phase structure. Lead with the action plan (Phase 4), then include validation details (Phases 1-3) as appendices. The maintainer reads the plan first, drills into details only when needed.
