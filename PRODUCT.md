# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary user: the sole developer building and using this tool day-to-day, at Almosafer. Currently personal/solo use only — the README's original goal of getting 2-3 teammates (Ali, Samvel, +1) to try it by week 8 has not yet happened; there is no active push for team adoption at this time. Should that change, this tool would be used by other Almosafer engineers (new hires and existing devs) hitting the same recurring setup/PR/release/scaffolding questions.

## Product Purpose

A fast-access, personal prompt library for Almosafer engineering conventions (env setup, PR/commit format, release checklist, scaffolding patterns, i18n tagging, DS component mapping) that are real and documented but scattered across AGENTS.md files, Cursor skills, CI YAML, and personal notes outside the repo. It exists so the user (and later, teammates) can find and copy the right prompt instead of re-deriving or re-asking for the same conventions repeatedly. Success means someone finds a prompt faster and gets a more usable result than working from memory or asking around.

## Positioning

Not a docs replacement and not a chatbot: it's a fast-access layer that sits on top of AGENTS.md/skills/CI as the source of truth, modeled on prompts.chat's browse-and-copy UX (card grid, category filter, search, one-click copy) but pre-loaded with Almosafer-specific conventions and extended with save/label/reuse, workflows (ordered prompt chains), and a local MCP server that exposes the same content to AI coding tools (Cursor, Claude, VS Code, Windsurf, Codex, Gemini CLI).

## Operating Context

Used by a developer at their desk, mid-task, needing a specific convention prompt (e.g. "how do I format this PR," "what's the release checklist," "how do I scaffold a new component") without breaking flow to search scattered docs. Also used to browse/copy Agent skills (as full `SKILL.md` files) and coding-taste conventions sourced from AGENTS.md / constitution.md. Runs entirely client-side in the browser during a local dev session (`npm run dev`); the MCP server runs locally over stdio for AI tool clients.

## Capabilities and Constraints

- Single user, browser-only, `localStorage` persistence — no backend, no auth, no multi-user sync.
- No AI-generated prompts on the fly; all content is human-authored and copied from real repo conventions.
- Built-in prompts (`origin: 'builtin'`) must cite a real source (repo file or convention); saved user prompts (`origin: 'user'`) are user-authored via the Create Prompt form.
- 8 built-in categories: Onboarding & Setup, Git & PR Workflow, Release & Dependencies, Code Scaffolding, UI & Design System, Content & i18n, Investigation & Debugging, Analytics.
- Does not attempt to replace AGENTS.md/skills as source of truth.

## Evidence on Hand

- `README.md` and `CLAUDE.md` describe the project brief, features, and category set.
- `src/data/prompts.ts`, `skills.ts`, `taste.ts`, `workflows.ts` contain the real data shape and structure, but their actual prompt/skill/taste body text is still placeholder — generic stand-in content, not yet the user's real Almosafer AGENTS.md/constitution.md/CI conventions. Future work must not treat this placeholder text as real sourced content, and must not fabricate additional sources, teammates, usage stats, or adoption claims beyond what's stated here.

## Product Principles

- Fast-access over exhaustive: optimize for "find and copy in seconds," not completeness.
- Source of truth stays in the repo docs; this tool is a pointer/copy layer, never a fork of that truth.
- No invented content: prompt bodies and sources are only ever real, user-provided text.
- Personal tool first: design and scope for solo daily use; team/multi-user needs are speculative until adoption actually happens.
- Zero backend, zero auth, by design — not a gap to eventually fill.

## Brand Commitments

Intentionally unbranded — no Almosafer logo, palette, or brand-identity assets are used or required. This is the user's own personal internal tool, not an Almosafer-branded product.
