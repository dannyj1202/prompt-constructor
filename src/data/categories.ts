import type { Category, CategoryAccent, CategoryId } from '../types/prompt'

export const CATEGORIES: Category[] = [
  {
    id: 'onboarding-setup',
    name: 'Onboarding & Setup',
    description: 'Environment setup, local tooling, first-week tasks.',
    accent: 'emerald',
  },
  {
    id: 'git-pr-workflow',
    name: 'Git & PR Workflow',
    description: 'Branch naming, commit format, PR descriptions and review.',
    accent: 'violet',
  },
  {
    id: 'release-dependencies',
    name: 'Release & Dependencies',
    description: 'Release checklists, version bumps, dependency upgrades.',
    accent: 'amber',
  },
  {
    id: 'code-scaffolding',
    name: 'Code Scaffolding',
    description: 'New modules, pages, and components that follow house patterns.',
    accent: 'cyan',
  },
  {
    id: 'ui-design-system',
    name: 'UI & Design System',
    description: 'Mapping designs to design-system components.',
    accent: 'pink',
  },
  {
    id: 'content-i18n',
    name: 'Content & i18n',
    description: 'Copy changes, translation keys, i18n tagging.',
    accent: 'sky',
  },
  {
    id: 'investigation-debugging',
    name: 'Investigation & Debugging',
    description: 'Tracing bugs and narrowing down root causes.',
    accent: 'rose',
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Event tracking, naming, and verification.',
    accent: 'lime',
  },
]

export const CATEGORY_BY_ID = Object.fromEntries(
  CATEGORIES.map((category) => [category.id, category]),
) as Record<CategoryId, Category>

/**
 * Per-category accent text color, shared by the sidebar's icon badges and the
 * card eyebrow label. Literal class strings so Tailwind's build-time scanner
 * can find them.
 */
export const CATEGORY_ACCENT_TEXT: Record<CategoryAccent, string> = {
  emerald: 'text-emerald-600 dark:text-emerald-400',
  violet: 'text-violet-600 dark:text-violet-400',
  amber: 'text-amber-600 dark:text-amber-400',
  cyan: 'text-cyan-600 dark:text-cyan-400',
  pink: 'text-pink-600 dark:text-pink-400',
  sky: 'text-sky-600 dark:text-sky-400',
  rose: 'text-rose-600 dark:text-rose-400',
  lime: 'text-lime-600 dark:text-lime-400',
}

/** Validates untrusted input such as a `?category=` URL param. */
export function isCategoryId(value: string | null | undefined): value is CategoryId {
  return !!value && Object.hasOwn(CATEGORY_BY_ID, value)
}
