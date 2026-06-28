# Repository Guidelines

## Project structure & module organization

This repository contains the Mintlify documentation site for NanoClaw. Site configuration, navigation, redirects, branding, and search settings live in `docs.json`. Pages are MDX files at the root and in topic directories:

- `channels/`, `operate/`, `guides/`, `extend/`, `concepts/`, and `reference/` contain public docs pages.
- `changelog/` contains product and documentation update logs.
- `images/` contains static assets.
- `docs/superpowers/` contains internal planning/spec files and is not part of the public docs navigation.

Root pages such as `introduction.mdx`, `quickstart.mdx`, and `installation.mdx` form the getting-started flow.

## Build, test, and development commands

Install the Mintlify CLI once:

```bash
npm i -g mint
```

Use these commands from the repository root:

```bash
mint dev
mint validate
mint broken-links
mint a11y
mint rename old-path.mdx new-path.mdx
```

`mint dev` starts a local preview at `http://localhost:3000`. `mint validate` checks the site build and should pass before a PR. `mint broken-links` is required when changing links. `mint a11y` checks content accessibility. `mint rename` moves pages while updating references.

## Coding style & naming conventions

Write docs in MDX. Every public page needs YAML frontmatter with at least `title` and `description`. Use kebab-case file names such as `scheduled-tasks.mdx`. Use sentence case headings, active voice, second person, and concise examples.

Internal links must be root-relative and omit extensions, for example `/guides/first-agent`. Store images in `images/`, reference them as `/images/name.svg`, and include descriptive alt text. Prefer Mintlify components such as `<Note>`, `<Warning>`, `<Steps>`, `<Tabs>`, and `<Card>`.

## Testing guidelines

There is no unit test suite in this docs repo. Validation is Mintlify-based. Run `mint validate` for content or config changes. Run `mint broken-links` when touching navigation, redirects, anchors, or page links. For major visual or structural changes, run `mint dev` and inspect affected pages locally.

## Commit & pull request guidelines

Recent history uses concise Conventional Commit-style messages, especially `docs:` and scoped variants such as `docs(changelog): add portal refactor entry`. Keep commits focused on one documentation concern.

Pull requests should describe what changed, why it changed, and which pages were affected. Link related issues when applicable. Include screenshots for layout, navigation, or component changes. Before review, confirm `mint validate` passed and note whether `mint broken-links` was run.

## Agent-specific instructions

Read `CLAUDE.md` before larger edits. It contains architecture notes, source-of-truth rules, drift traps, and PR workflow details. When documenting product behavior, verify claims against the upstream NanoClaw source instead of older prose.
