# Contributing to NanoClaw Docs

Thanks for helping improve the [NanoClaw](https://github.com/qwibitai/nanoclaw) documentation! This repo powers the docs site built with [Mintlify](https://mintlify.com).

## Quick edits

1. Navigate to the page you want to edit on GitHub
2. Click the pencil icon ("Edit this file")
3. Make your changes and submit a pull request

## Local development

1. Fork and clone this repository
2. Install the Mintlify CLI: `npm i -g mint`
3. Create a branch: `git checkout -b my-change`
4. Run `mint dev` and preview at `http://localhost:3000`
5. Make your changes, commit, and open a pull request

## Project structure

```
├── introduction.mdx        # Landing page
├── quickstart.mdx           # Quick start guide
├── installation.mdx         # Installation instructions
├── concepts/                # Core concepts (architecture, security, groups, tasks, containers)
├── features/                # Feature docs (messaging, scheduled tasks, agent swarms, etc.)
├── integrations/            # Integration guides (WhatsApp, Telegram, Discord, Slack, Gmail)
├── advanced/                # Advanced topics (security model, IPC, container runtime, etc.)
├── api/                     # API reference and skills development
├── docs.json                # Mintlify site configuration and navigation
└── .atlas-analysis.json     # Project analysis metadata
```

## Adding a new page

1. Create an `.mdx` file in the appropriate directory
2. Add frontmatter with `title` and `description`
3. Add the page path to `docs.json` under the correct navigation group
4. Preview locally with `mint dev` to verify

## Writing guidelines

- **Use active voice**: "Run the command" not "The command should be run"
- **Address the reader directly**: Use "you" instead of "the user"
- **Keep sentences concise**: One idea per sentence
- **Lead with the goal**: Start instructions with what the user wants to accomplish
- **Use consistent terminology**: Don't alternate between synonyms for the same concept
- **Include examples**: Show, don't just tell
- **Link to related pages**: Help readers navigate between related topics

## Contributing to NanoClaw itself

This repo is only for the documentation. To contribute code to NanoClaw, see the [main repository](https://github.com/qwibitai/nanoclaw).

## Questions?

[Join the Discord](https://discord.gg/VDdww8qS42) if you have questions or want to discuss changes before opening a PR.
