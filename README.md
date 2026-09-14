# Prompt Constructor

> A fast-access, personal prompt library modeled on [prompts.chat](https://prompts.chat/prompts), tailored for Almosafer engineering conventions and workflows.

---

## Project Brief

**Problem.** Almosafer's dev conventions — env setup, PR/commit format, release checklist, scaffolding patterns, i18n tagging, DS component mapping — are real and mostly documented, but scattered across AGENTS.md files, Cursor skills, CI YAML, and one dev's personal notes file outside the repo. New and existing devs re-derive or re-ask for the same things repeatedly (my own Week 1 setup cost 3 days for exactly this reason).

**What I'll build.** A personal, internal prompt library — UX modeled on prompts.chat (card grid, category filter, search, one-click copy) — pre-loaded with ~8 Almosafer-specific prompt categories sourced directly from our own repo conventions, plus a save feature: any dev can save a prompt they wrote with a title/description/label and reuse it later.

**How I'll know it worked.** At least 2-3 people on the team (Ali, Samvel, +1) use it on a real task in week 8 and confirm it produced a usable result faster than doing it from memory/asking around.

**What I won't do.** No auth/multi-user backend, no AI-generated prompts on the fly, no attempt to replace AGENTS.md/skills as source of truth — this sits on top as a fast-access layer, not a doc replacement.

**Phases.** Rest of this week: lock content, quick Samvel sign-off, scaffold UI. Next week: save/label/reuse feature, polish, demo, write-up.

---

## Features

- **8 Curated Almosafer Categories:** Pre-loaded prompt templates covering everyday engineering workflows.
- **Instant Search:** Multi-term filtering across prompt titles, descriptions, bodies, tags, and source citations.
- **Sidebar & Tag Navigation:** Live count badges showing prompt distribution and clickable tag pills.
- **Detail View & Templating:** Modal inspection showing formatted prompt text with template variables (e.g. `{{TICKET_ID}}`, `{{VERSION}}`).
- **One-Click Copy:** Fast clipboard copying with instant visual feedback.
- **Client-Side & Lightweight:** Fast, responsive, dark-mode ready, with zero backend requirement (custom prompts persist in `localStorage`).
- **Saved Prompts:** Create, edit, and delete your own prompts (title, description, labels, optional category). They appear in the main library with a Saved badge and on their own Saved page.
- **Workflows:** Ordered chains of prompts with per-step notes; expand and copy each step in turn.
- **Skills & Taste:** Agent skills (copied as complete `SKILL.md` files) and coding conventions from AGENTS.md / constitution.md.
- **Tags Page:** Every tag across prompts, skills, and taste, each linking back to a filtered view.
- **MCP Server:** A local MCP server exposes prompts, skills, and taste to Cursor, Claude, VS Code, Windsurf, Codex, and Gemini CLI.

---

## Supported Categories

| Category | Description |
|---|---|
| **Onboarding & Setup** | Environment setup, local tooling, first-week tasks. |
| **Git & PR Workflow** | Branch naming, commit format, PR descriptions, and review. |
| **Release & Dependencies** | Release checklists, version bumps, dependency upgrades. |
| **Code Scaffolding** | New modules, pages, and components following house patterns. |
| **UI & Design System** | Mapping designs to Almosafer design-system components. |
| **Content & i18n** | Copy changes, translation keys, and i18n tagging. |
| **Investigation & Debugging** | Tracing bugs and narrowing down root causes. |
| **Analytics** | Event tracking, naming conventions, and payload verification. |

---

## Tech Stack

- **Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite 8](https://vite.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) via `@tailwindcss/vite`
- **Linting:** [Oxlint](https://oxc.rs/)
- **MCP:** [`@modelcontextprotocol/sdk`](https://github.com/modelcontextprotocol/typescript-sdk) (local stdio server)

---

## Getting Started

### Prerequisites

Ensure you have Node.js (v18+ recommended) and npm installed.

### Installation

Clone the repository and install dependencies:

```bash
cd prompt-constructor
npm install
```

### Development Server

Start the local development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Vite development server with hot reloading |
| `npm run build` | Runs TypeScript check (`tsc -b`) and builds production bundle in `dist/` |
| `npm run preview` | Locally previews the production build |
| `npm run typecheck` | Runs TypeScript compiler checks without emitting files |
| `npm run lint` | Runs `oxlint` for fast static code analysis |
| `npm run mcp` | Starts the local MCP server over stdio (for testing; clients launch it themselves) |

---

## Project Structure

```
prompt-constructor/
├── mcp/
│   ├── server.ts         # Local MCP server (stdio)
│   └── vite-plugin.ts    # Dev endpoint mirroring saved prompts to mcp/.data/
├── src/
│   ├── components/
│   │   ├── layout/       # Header, nav, search, page layouts
│   │   ├── prompts/      # Prompts + Saved pages, cards, form, dialogs
│   │   ├── workflows/    # Workflow list and detail
│   │   ├── skills/       # Skills page
│   │   ├── taste/        # Taste page
│   │   ├── tags/         # Tags page
│   │   ├── mcp/          # MCP config dialog
│   │   └── ui/           # Shared UI primitives (button, modal, card, tags, icons)
│   ├── data/
│   │   ├── categories.ts # Category definitions and metadata
│   │   ├── prompts.ts    # Seed built-in prompts
│   │   ├── skills.ts     # Skills from .cursor/skills/
│   │   ├── taste.ts      # Conventions from AGENTS.md / constitution.md
│   │   ├── workflows.ts  # Ordered prompt chains
│   │   └── mcpClients.ts # MCP config snippets per client
│   ├── hooks/            # Custom hooks (clipboard, saved prompts)
│   ├── lib/              # Pure utilities (router, filtering, storage, formatting)
│   ├── types/            # TypeScript types (Prompt, Skill, TasteEntry, Workflow)
│   ├── App.tsx           # Routes, saved-prompt state, app-wide dialogs
│   ├── main.tsx          # Application entry point
│   └── index.css         # Tailwind base styles and dark-mode defaults
├── index.html
├── package.json
└── vite.config.ts
```

---

## Adding Built-in Prompts

Built-in prompts reside in [`src/data/prompts.ts`](src/data/prompts.ts). Each prompt conforms to the `BuiltInPrompt` interface:

```typescript
{
  id: 'category-id/slug',
  origin: 'builtin',
  title: 'Descriptive title',
  description: 'Short summary of what this prompt accomplishes.',
  category: 'category-id',
  tags: ['tag1', 'tag2'],
  source: 'File or convention citation (e.g., AGENTS.md - Commit format)',
  body: `The prompt template text (can use {{VARIABLE}} placeholders).`
}
```

## Adding Skills, Taste, and Workflows

- **Skills** ([`src/data/skills.ts`](src/data/skills.ts)): `name` (the `.cursor/skills/<name>/` folder), `title`, `description` (SKILL.md frontmatter), `tags`, `source`, and `body` (the markdown after the frontmatter). "Copy to codebase" copies the reassembled SKILL.md.
- **Taste** ([`src/data/taste.ts`](src/data/taste.ts)): `id`, `title`, `description`, `tags`, `source`, and a single markdown `body`.
- **Workflows** ([`src/data/workflows.ts`](src/data/workflows.ts)): `id`, `title`, `description`, and ordered `steps`, each `{ promptId, note? }` referencing a built-in or saved prompt by id.

## MCP Server

`mcp/server.ts` is a local stdio MCP server. It exposes built-in and saved prompts, skills, and taste entries as both MCP **prompts** (with `{{VARIABLES}}` as optional arguments) and **resources**. Click **MCP** in the app header for a ready-to-paste config for each client.

- Requires Node 22.18+ (Node runs the TypeScript directly).
- Saved prompts live in browser `localStorage`, which the server can't read. While `npm run dev` is running, the app mirrors them to `mcp/.data/saved-prompts.json` (gitignored), and the server picks up changes automatically.