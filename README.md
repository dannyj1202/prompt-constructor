Problem. Almosafer's dev conventions — env setup, PR/commit format, release checklist, scaffolding patterns, i18n tagging, DS component mapping — are real and mostly documented, but scattered across AGENTS.md files, Cursor skills, CI YAML, and one dev's personal notes file outside the repo. New and existing devs re-derive or re-ask for the same things repeatedly (my own Week 1 setup cost 3 days for exactly this reason).

What I'll build. A personal, internal prompt library — UX modeled on prompts.chat (card grid, category filter, search, one-click copy) — pre-loaded with ~8 Almosafer-specific prompt categories sourced directly from our own repo conventions, plus a save feature: any dev can save a prompt they wrote with a title/description/label and reuse it later.

How I'll know it worked. At least 2-3 people on the team (Ali, Samvel, +1) use it on a real task in week 8 and confirm it produced a usable result faster than doing it from memory/asking around.

What I won't do. No auth/multi-user backend, no AI-generated prompts on the fly, no attempt to replace AGENTS.md/skills as source of truth — this sits on top as a fast-access layer, not a doc replacement.

Phases. Rest of this week: lock content, quick Samvel sign-off, scaffold UI. Next week: save/label/reuse feature, polish, demo, write-up.

## Development

React + Vite + TypeScript + Tailwind. No backend; data lives in `src/data/` and `localStorage`.

```bash
npm install
npm run dev        # http://localhost:5173
```

Built-in prompts go in `src/data/prompts.ts`. Each one needs a title, description, category, tags, source (the file or convention it is based on), and body.