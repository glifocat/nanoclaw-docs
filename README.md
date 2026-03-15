<div align="center">
  <h1>NanoClaw Docs</h1>
  <p>
    Documentation for <a href="https://github.com/qwibitai/nanoclaw">NanoClaw</a> — a lightweight, secure AI assistant that runs Claude agents in isolated containers and connects to your messaging platforms.
  </p>
</div>

<p align="center">
  <a href="https://github.com/qwibitai/nanoclaw/blob/main/LICENSE"><img src="https://img.shields.io/github/license/qwibitai/nanoclaw?style=flat-square" alt="License"></a>
  <a href="https://github.com/qwibitai/nanoclaw"><img src="https://img.shields.io/github/stars/qwibitai/nanoclaw?style=flat-square" alt="Stars"></a>
  <a href="https://discord.gg/VDdww8qS42"><img src="https://img.shields.io/discord/1470188214710046894?style=flat-square&label=Discord&color=5865F2" alt="Discord"></a>
  <a href="https://www.mintlify.com/oss-program"><img src="https://img.shields.io/badge/Docs_by-Mintlify-18181B?style=flat-square" alt="Mintlify"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/WhatsApp-25D366?style=flat-square&logo=whatsapp&logoColor=white" alt="WhatsApp">
  <img src="https://img.shields.io/badge/Telegram-2CA5E0?style=flat-square&logo=telegram&logoColor=white" alt="Telegram">
  <img src="https://img.shields.io/badge/Discord-5865F2?style=flat-square&logo=discord&logoColor=white" alt="Discord">
  <img src="https://img.shields.io/badge/Slack-4A154B?style=flat-square&logo=slack&logoColor=white" alt="Slack">
  <img src="https://img.shields.io/badge/Gmail-EA4335?style=flat-square&logo=gmail&logoColor=white" alt="Gmail">
  <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker">
  <img src="https://img.shields.io/badge/Claude-CC785C?style=flat-square&logo=anthropic&logoColor=white" alt="Claude">
</p>

---

## What's documented here

| Section | Topics |
|---------|--------|
| **Getting started** | Quick start, installation, and setup |
| **Core concepts** | Architecture, security model, groups, tasks, and containers |
| **Features** | Messaging, scheduled tasks, agent swarms, customization, and web access |
| **Integrations** | WhatsApp, Telegram, Discord, Slack, Gmail, and the skills system |
| **Advanced** | Security model, IPC, container runtime, Docker sandboxes, remote control |
| **API reference** | Configuration, message routing, group management, task scheduling, skills |

## Development

Install the [Mintlify CLI](https://www.npmjs.com/package/mint) to preview documentation changes locally:

```bash
npm i -g mint
mint dev
```

Preview at `http://localhost:3000`.

## AI-assisted writing

This repo includes the [Mintlify skill](https://mintlify.com/docs) pre-installed for AI coding assistants. It provides component references, configuration guides, and navigation helpers so your AI tool can write and edit documentation pages correctly.

**Supported tools:** Claude Code, Cursor, Cline, Codex, Gemini CLI, GitHub Copilot, and others.

In Claude Code, invoke it with `/mintlify` before creating or editing pages. Other tools pick it up automatically.

To update the skill to the latest version:

```bash
npx skills add https://mintlify.com/docs
```

## Publishing

Changes are deployed to production automatically after pushing to the default branch. Requires the [Mintlify GitHub app](https://dashboard.mintlify.com/settings/organization/github-app).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to the documentation.

## Troubleshooting

- Dev environment not running? Run `mint update` for the latest CLI version.
- Page loading as 404? Make sure you're in a folder with a valid `docs.json`.
- More help: [Mintlify documentation](https://mintlify.com/docs)

## Community

Questions or ideas? [Join the Discord](https://discord.gg/VDdww8qS42).

---

<p align="center">
  <a href="https://github.com/qwibitai/nanoclaw">NanoClaw</a> is MIT licensed. Docs hosted through <a href="https://www.mintlify.com/oss-program">Mintlify's OSS program</a>.
</p>
