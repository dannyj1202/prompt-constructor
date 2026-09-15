# CLAUDE.md

> Quick reference for Claude Code when working on Prompt Constructor

## Project Overview

**Prompt Constructor** is a personal, internal prompt library for Almosafer dev conventions (env setup, PR/commit format, release checklist, scaffolding, i18n, DS component mapping). The UX is modeled on [prompts.chat](https://prompts.chat/prompts): card grid, category sidebar, search, and one-click copy. We borrow its layout ideas only, not its code.

- **Stack:** React 19 + Vite + TypeScript, Tailwind CSS v4 (via `@tailwindcss/vite`)
- **Persistence:** `localStorage` only. Single user, no backend, no auth.
- **Scope and success criteria:** see [README.md](README.md)

## Quick Commands

```bash
npm run dev         # Dev server at localhost:5173
npm run build       # Typecheck + production build
npm run typecheck   # tsc -b (no emit)
npm run lint        # oxlint
npm run mcp         # Local MCP server over stdio (Node 22.18+)
```

## Key Files

| File | Purpose |
|------|---------|
| `src/types/*.ts` | Data model: `Prompt` (`BuiltInPrompt \| UserPrompt`), `Skill`, `TasteEntry`, `Workflow` |
| `src/data/*.ts` | Built-in content (categories, prompts, skills, taste, workflows; mostly placeholders) and MCP client configs |
| `src/lib/router.ts` | Hash router; filter state (`q`, `category`, `tag`) lives in the URL |
| `src/lib/savedPromptsStorage.ts` | localStorage store for saved prompts (key `prompt-constructor:saved-prompts:v1`) |
| `src/lib/filterPrompts.ts`, `src/lib/search.ts` | Search/category/tag filtering and counts (pure functions) |
| `src/App.tsx` | Routes, saved-prompt state, and app-wide dialogs |
| `mcp/server.ts` | Local stdio MCP server; Node runs the TypeScript directly. Serves built-ins plus the API's SQLite database (read-only) |
| `server/dbPath.ts` | SQLite file location, shared by the API (`server/db.ts`) and the MCP server |
| `UI-Improver/README.md` | UI/UX redesign guide, reference component mappings, and liquid metal specs |

## Project Structure

```
src/
├── types/          # Shared TypeScript types
├── data/           # Built-in content (static)
├── lib/            # Pure utilities (router, filtering, storage, formatting)
├── hooks/          # React hooks (clipboard, saved prompts)
└── components/
    ├── layout/     # Header, nav, page/browse layouts, sidebar sections
    ├── prompts/    # Prompts + Saved pages, card, form, detail/delete dialogs
    ├── workflows/  # Workflow list and detail pages
    ├── skills/     # Skills page
    ├── taste/      # Taste page
    ├── tags/       # Tags page
    ├── mcp/        # MCP config dialog
    └── ui/         # Generic primitives (button, modal, content card, tag list/input, icons)
mcp/                # Local MCP server
```

## Data Model

- Every prompt has `id`, `title`, `description`, `category`, `tags`, and `body` (the copied text).
- `origin: 'builtin'` prompts **must** have a `source` citing the repo file or convention they come from.
- `origin: 'user'` prompts come from the Create Prompt form, have optional `category`/`source` plus `createdAt`/`updatedAt`, and live in `localStorage`.
- Built-in ids use the form `<category-id>/<slug>` and must stay stable: workflow steps reference prompts by id.
- Skills are copied as full `SKILL.md` files (frontmatter + body) via `formatSkillMarkdown()`.

## Code Patterns

- **Files:** `kebab-case.tsx` for components, `camelCase.ts` for utilities and hooks
- **Components:** named exports, `PascalCase`, props typed with an `interface`
- **Styling:** Tailwind utilities, mobile-first (`sm:`, `lg:`), `dark:` variants for every color; use `cn()` from `src/lib/cn.ts` for conditional classes
- **Filtering:** keep logic in `src/lib/filterPrompts.ts` so built-in and user prompts go through the same path
- Code style follows the Vite template: single quotes, no semicolons
- **Routing:** hash routes in `App.tsx` `renderPage()`; read filters from `route.params`, write with `updateParams()`
- **Dialogs:** build on `ui/modal.tsx`; mount only while open; use `data-autofocus` (not `autoFocus`) for initial focus
- **Shared with `mcp/server.ts`:** `src/data/*`, `src/lib/formatContent.ts`, `src/lib/search.ts`, `src/lib/userPromptGuard.ts` run under Node type stripping, so use only `import type` there (no runtime imports)
- **Effects:** always use a block body; `useEffect(() => window.scrollTo(0, 0))` returns a Promise in newer browsers and crashes React

## Status

1. **Browse and copy** (done): data model, card grid, category and tag filters, search, copy, detail dialog
2. **Saved prompts** (done): create/edit/delete, Saved page, Saved badge in the main library
3. **Workflows, Skills, Taste, Tags, MCP** (done): pages, data structures, local MCP server
4. **Content** (pending): real prompt/skill/taste text and sources from the user replace the placeholders

## Boundaries

### Always Do
- Run `npm run typecheck` and `npm run lint` before committing
- Push only to `origin` = https://github.com/dannyj1202/prompt-constructor

### Ask First
- Adding new dependencies
- Changing the `Prompt` shape in `src/types/prompt.ts`, since saved user prompts depend on it

### Never Do
- Invent prompt content or source citations. Real prompt text and sources come from the user.
- Add a backend, auth, or AI-generated prompts (out of scope per README)
- Copy code from prompts.chat; it is a UX reference only
