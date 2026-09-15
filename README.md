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
- **Local-First Persistence:** Everything you create is written to `localStorage` immediately, then mirrored to a local SQLite-backed API. The UI keeps working if the API is down.
- **Saved Prompts:** Create, edit, and delete your own prompts (title, description, labels, optional category). They appear in the main library with a Saved badge and on their own Saved page.
- **Workflows, Skills & Taste:** Create your own alongside the built-ins. Workflows are ordered prompt chains with per-step notes; skills copy as complete `SKILL.md` files; taste entries capture coding conventions from AGENTS.md / constitution.md.
- **Favorites:** Star prompts to pin them in your personal library.
- **Edit History & Rollback:** Every edit (including to built-ins) is versioned; view past revisions and revert to any of them.
- **Personal Library Hub:** Your saved, starred, and recently edited items in one place.
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
- **API:** [Hono](https://hono.dev/) on `@hono/node-server`, port `3001`
- **Database:** SQLite via Node's built-in [`node:sqlite`](https://nodejs.org/api/sqlite.html) (no native dependency)
- **MCP:** [`@modelcontextprotocol/sdk`](https://github.com/modelcontextprotocol/typescript-sdk) (local stdio server)

---

## Getting Started

### Prerequisites

Node.js **22.18+** and npm. The API server and MCP server both rely on Node running TypeScript directly (type stripping), and the API uses the built-in `node:sqlite` module.

### Installation

Clone the repository and install dependencies:

```bash
cd prompt-constructor
npm install
```

### Development Server

Start the frontend and API together:

```bash
npm run dev
```

This runs two processes via `concurrently`, with prefixed logs:

- `[vite]`: the app at [http://localhost:5173](http://localhost:5173), which proxies `/api/*` to the API
- `[api]`: the Hono API at [http://127.0.0.1:3001](http://127.0.0.1:3001) (check it at `/api/health`)

The SQLite database is created automatically at `server/data/prompt-constructor.db` on first start. It's gitignored, since it holds your personal data.

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts Vite and the API server together, both in watch mode |
| `npm run server` | Starts only the API server in watch mode (set `PORT` to override `3001`) |
| `npm run build` | Runs TypeScript check (`tsc -b`) and builds production bundle in `dist/` |
| `npm run preview` | Locally previews the production build |
| `npm run typecheck` | Runs TypeScript compiler checks without emitting files |
| `npm run lint` | Runs `oxlint` for fast static code analysis |
| `npm test` | Runs the API, security, and merge tests in `tests/` (in-process, against a throwaway database) |
| `npm run mcp` | Starts the local MCP server over stdio (for testing; clients launch it themselves) |

---

## Project Structure

```
prompt-constructor/
├── mcp/
│   ├── server.ts         # Local MCP server (stdio)
│   └── vite-plugin.ts    # Dev endpoint mirroring saved prompts to mcp/.data/
├── server/
│   ├── index.ts          # Hono app: CORS, /api/health, route mounting
│   ├── db.ts             # SQLite connection + schema (CREATE TABLE IF NOT EXISTS)
│   ├── guard.ts          # Refuses requests that don't come from this machine's own app
│   ├── routes/           # prompts, workflows, skills, taste, favorites, history, sync
│   └── data/             # prompt-constructor.db (created at runtime)
├── src/
│   ├── components/
│   │   ├── layout/       # Header, nav, search, page layouts
│   │   ├── prompts/      # Prompts + Saved pages, cards, form, dialogs
│   │   ├── workflows/    # Workflow list, detail, and form
│   │   ├── skills/       # Skills page and form
│   │   ├── taste/        # Taste page and form
│   │   ├── tags/         # Tags page
│   │   ├── personal/     # Personal library hub (saved, starred, recently edited)
│   │   ├── history/      # Version history dialog and badge
│   │   ├── mcp/          # MCP config dialog
│   │   └── ui/           # Shared UI primitives (button, modal, card, tags, icons)
│   ├── data/
│   │   ├── categories.ts # Category definitions and metadata
│   │   ├── prompts.ts    # Seed built-in prompts
│   │   ├── skills.ts     # Skills from .cursor/skills/
│   │   ├── taste.ts      # Conventions from AGENTS.md / constitution.md
│   │   ├── workflows.ts  # Ordered prompt chains
│   │   └── mcpClients.ts # MCP config snippets per client
│   ├── hooks/            # Custom hooks (saved entities, favorites, history, clipboard, grid nav)
│   ├── lib/              # Router, filtering, localStorage stores, API client (api.ts), backend sync (syncManager.ts)
│   ├── types/            # TypeScript types (Prompt, Skill, TasteEntry, Workflow)
│   ├── App.tsx           # Routes, saved-prompt state, app-wide dialogs
│   ├── main.tsx          # Application entry point
│   └── index.css         # Tailwind base styles and dark-mode defaults
├── tests/                # npm test: API, security, and merge tests
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

## Backend & Persistence

The app is **local-first**, and the **client owns every record**:

- **Writes.** Each hook in `src/hooks/useSaved*.ts` and `useStarredPrompts.ts` writes to its `localStorage` store synchronously, so the UI updates instantly. It then sends the full record it just saved, including the client-generated id and timestamps, via `src/lib/api.ts`. Edit history works the same way: `src/lib/entityHistoryStorage.ts` builds each revision and sends the whole record. A failed request only logs a warning.
- **Server.** Every write is an upsert with **last write wins by `updatedAt`**. A copy older than the stored one is ignored, so stale or repeated requests are harmless.
- **Startup sync.** `initializeBackendSync()` (`src/lib/syncManager.ts`, called from `main.tsx`) fetches everything from the API. It merges that with `localStorage` by key using `mergeByUpdatedAt()` (`src/lib/merge.ts`): items on only one side are kept, and the newer `updatedAt` wins. It saves the result locally and pushes it back via `POST /api/sync`. Anything created or edited while the API was down reaches the database on the next load. If the API is unreachable, `localStorage` is left untouched.
- **Deletes.** Every delete asks for confirmation. It also removes the item's edit history and, for a prompt, its star. It records a tombstone (a deleted-at marker, `src/lib/deletions.ts`) on both sides. The startup merge and every server write skip anything deleted after its last edit, so a delete made while the API was down sticks. An item edited after its deletion counts as re-created and is kept.

Built-in content (`src/data/*`) is never stored in the database, only user-created items, favorites, and edit history.

### Security

Single-user, no auth, so the API only answers this machine's own app (`server/guard.ts`):

- It listens on `127.0.0.1` only, so other machines can't reach it.
- A request with a foreign `Origin` gets `403`, whether it's a read, a write, or a bodyless POST. That stops websites you visit from calling the API through your browser; CORS alone only hides responses, it doesn't stop the request. Any `localhost`/`127.0.0.1` port is allowed (Vite moves to 5174 if 5173 is busy). Tools that send no `Origin`, like curl, still work.
- A `Host` other than `localhost`/`127.0.0.1` gets `403`, which blocks DNS rebinding.
- `POST`/`PUT` without `Content-Type: application/json` gets `415`. A JSON body can't be sent cross-site without a CORS preflight, and that preflight is refused.
- Timestamps (`createdAt`, `updatedAt`, `deletedAt`) must be ISO 8601 and at most 5 minutes in the future. Otherwise a record could win every last-write-wins comparison, or a tombstone could block re-creation forever.

### Database

One SQLite file, one table per entity: `prompts`, `workflows`, `skills` (keyed by `name`), `taste`, `favorites`, and `entity_history`, plus `deletions` for tombstones. Arrays and objects (`tags`, `steps`, snapshots, `revisions`) are stored as JSON text. History rows are keyed `"<entityType>:<entityId>"`. Set `DB_PATH` to use a different file (e.g. a throwaway one for testing).

### API

All routes are under `/api`. Ids are URL-encoded (saved prompt ids contain `/`). Request bodies are validated: a missing required field, or a malformed or future timestamp, returns `400`. See Security for the `403`/`415` rules.

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Liveness check |
| `GET` `POST` | `/prompts` | List (newest first) / create |
| `GET` `PUT` `DELETE` | `/prompts/:id` | Read / replace or create (if newer) / delete |
| `GET` `POST` | `/workflows` | List / create |
| `GET` `PUT` `DELETE` | `/workflows/:id` | Read / replace or create (if newer) / delete |
| `GET` `POST` | `/skills` | List / create |
| `GET` `PUT` `DELETE` | `/skills/:name` | Read / replace or create (if newer); a different `name` in the body renames / delete |
| `GET` `POST` | `/taste` | List / create |
| `GET` `PUT` `DELETE` | `/taste/:id` | Read / replace or create (if newer) / delete |
| `GET` | `/favorites` | List starred prompt ids |
| `POST` `DELETE` | `/favorites/:promptId` | Star / unstar |
| `GET` | `/history` | All edit-history records |
| `GET` `PUT` `DELETE` | `/history/:type/:id` | Read / store the full record (if newer) / delete |
| `GET` | `/deletions` | All tombstones |
| `POST` | `/sync` | Bulk apply of tombstones, then upsert of each record (only if newer and not deleted since). Invalid items are skipped; returns counts written |

`DELETE` on `/prompts/:id`, `/workflows/:id`, `/skills/:name`, and `/taste/:id` takes an optional `?deletedAt=<ISO timestamp>` (the client's delete time; defaults to now). It also removes the item's edit history and a prompt's favorite, and records a tombstone.

### Backend status (work in progress)

Known gaps:

- **Unstarring while the API is down gets undone** on the next load. Favorites have no timestamps, so they merge as a union. Deleting a prompt does remove its star.
- **Renaming a skill while the API is down** leaves the old name on the server, and the merge brings it back as a second skill. Online renames are fine.

## MCP Server

`mcp/server.ts` is a local stdio MCP server. It exposes built-in and saved prompts, skills, and taste entries as both MCP **prompts** (with `{{VARIABLES}}` as optional arguments) and **resources**. Click **MCP** in the app header for a ready-to-paste config for each client.

- Requires Node 22.18+ (Node runs the TypeScript directly).
- Saved prompts live in browser `localStorage`, which the server can't read. While `npm run dev` is running, the app mirrors them to `mcp/.data/saved-prompts.json` (gitignored), and the server picks up changes automatically.