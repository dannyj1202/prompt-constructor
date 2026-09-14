export type CategoryId =
  | 'onboarding-setup'
  | 'git-pr-workflow'
  | 'release-dependencies'
  | 'code-scaffolding'
  | 'ui-design-system'
  | 'content-i18n'
  | 'investigation-debugging'
  | 'analytics'

export interface Category {
  id: CategoryId
  name: string
  description: string
}

interface PromptBase {
  /** Stable, URL-safe id. Built-ins use `<category>/<slug>`. */
  id: string
  title: string
  description: string
  category: CategoryId
  tags: string[]
  /** The text copied to the clipboard. */
  body: string
}

/** Ships with the app; always cites the repo file or convention it is based on. */
export interface BuiltInPrompt extends PromptBase {
  origin: 'builtin'
  /** e.g. `AGENTS.md § Commit format` or `.github/workflows/release.yml` */
  source: string
}

/** Saved by the user and persisted in localStorage (save flow not built yet). */
export interface UserPrompt extends PromptBase {
  origin: 'user'
  source?: string
  /** ISO 8601 timestamp */
  createdAt: string
}

export type Prompt = BuiltInPrompt | UserPrompt
