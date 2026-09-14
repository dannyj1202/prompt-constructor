export type CategoryId =
  | 'onboarding-setup'
  | 'git-pr-workflow'
  | 'release-dependencies'
  | 'code-scaffolding'
  | 'ui-design-system'
  | 'content-i18n'
  | 'investigation-debugging'
  | 'analytics'

/** Tailwind color used for a category's sidebar icon, tint, and active state. */
export type CategoryAccent = 'emerald' | 'violet' | 'amber' | 'cyan' | 'pink' | 'sky' | 'rose' | 'lime'

export interface Category {
  id: CategoryId
  name: string
  description: string
  accent: CategoryAccent
}

interface PromptBase {
  /** Stable, URL-safe id. Built-ins use `<category>/<slug>`, saved prompts `saved/<random>`. */
  id: string
  title: string
  description: string
  tags: string[]
  /** The text copied to the clipboard. */
  body: string
}

/** Ships with the app; always cites the repo file or convention it is based on. */
export interface BuiltInPrompt extends PromptBase {
  origin: 'builtin'
  category: CategoryId
  /** e.g. `AGENTS.md - Commit format` or `.github/workflows/release.yml` */
  source: string
}

/** Saved by the user via the Create Prompt form; persisted in localStorage. */
export interface UserPrompt extends PromptBase {
  origin: 'user'
  category?: CategoryId
  source?: string
  /** ISO 8601 timestamps */
  createdAt: string
  updatedAt: string
}

export type Prompt = BuiltInPrompt | UserPrompt

/** Fields the Create/Edit Prompt form collects. */
export type UserPromptInput = Pick<UserPrompt, 'title' | 'description' | 'tags' | 'body' | 'category'>
