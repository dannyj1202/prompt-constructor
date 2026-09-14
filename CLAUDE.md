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
```

## Key Files

| File | Purpose |
|------|---------|
| `src/types/prompt.ts` | Data model: `Prompt` = `BuiltInPrompt \| UserPrompt`, `CategoryId` |
| `src/data/categories.ts` | The 8 categories (ids, names, descriptions) |
| `src/data/prompts.ts` | Built-in prompts (currently placeholders) |
| `src/lib/filterPrompts.ts` | Search/category/tag filtering and counts (pure functions) |
| `src/App.tsx` | Filter state and page layout |

## Project Structure

```
src/
├── types/          # Shared TypeScript types
├── data/           # Built-in categories and prompts (static)
├── lib/            # Pure utilities (filtering, cn)
├── hooks/          # React hooks (clipboard)
└── components/
    ├── layout/     # Header
    ├── prompts/    # Card, grid, sidebar, search, detail dialog, copy button
    └── ui/         # Generic primitives (icons)
```

## Data Model

- Every prompt has `id`, `title`, `description`, `category`, `tags`, and `body` (the copied text).
- `origin: 'builtin'` prompts **must** have a `source` citing the repo file or convention they come from.
- `origin: 'user'` prompts (from the upcoming save flow) have an optional `source` plus `createdAt`, and live in `localStorage`.
- Built-in ids use the form `<category-id>/<slug>` and must stay stable.

## Code Patterns

- **Files:** `kebab-case.tsx` for components, `camelCase.ts` for utilities and hooks
- **Components:** named exports, `PascalCase`, props typed with an `interface`
- **Styling:** Tailwind utilities, mobile-first (`sm:`, `lg:`), `dark:` variants for every color; use `cn()` from `src/lib/cn.ts` for conditional classes
- **Filtering:** keep logic in `src/lib/filterPrompts.ts` so built-in and user prompts go through the same path
- Code style follows the Vite template: single quotes, no semicolons

## Status

1. **Browse and copy** (done): data model, card grid, category and tag filters, search, copy, detail dialog
2. **Save my own prompt** (not started): form with title, description, labels, saved to `localStorage`, merged into `ALL_PROMPTS` in `App.tsx`

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
