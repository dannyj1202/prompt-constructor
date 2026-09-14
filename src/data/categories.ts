import type { Category, CategoryId } from '../types/prompt'

export const CATEGORIES: Category[] = [
  {
    id: 'onboarding-setup',
    name: 'Onboarding & Setup',
    description: 'Environment setup, local tooling, first-week tasks.',
  },
  {
    id: 'git-pr-workflow',
    name: 'Git & PR Workflow',
    description: 'Branch naming, commit format, PR descriptions and review.',
  },
  {
    id: 'release-dependencies',
    name: 'Release & Dependencies',
    description: 'Release checklists, version bumps, dependency upgrades.',
  },
  {
    id: 'code-scaffolding',
    name: 'Code Scaffolding',
    description: 'New modules, pages, and components that follow house patterns.',
  },
  {
    id: 'ui-design-system',
    name: 'UI & Design System',
    description: 'Mapping designs to design-system components.',
  },
  {
    id: 'content-i18n',
    name: 'Content & i18n',
    description: 'Copy changes, translation keys, i18n tagging.',
  },
  {
    id: 'investigation-debugging',
    name: 'Investigation & Debugging',
    description: 'Tracing bugs and narrowing down root causes.',
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Event tracking, naming, and verification.',
  },
]

export const CATEGORY_BY_ID = Object.fromEntries(
  CATEGORIES.map((category) => [category.id, category]),
) as Record<CategoryId, Category>
