import type { Skill } from '../types/skill'

// PLACEHOLDER CONTENT: names match `.cursor/skills/` in the source repo.
// Replace each `description` and `body` with the real SKILL.md contents.
const TODO_DESCRIPTION = 'TODO: paste the description from SKILL.md frontmatter.'
const TODO_BODY = 'TODO: paste the SKILL.md body.'

export const SKILLS: Skill[] = [
  {
    name: 'testid-standards',
    title: 'Test ID standards',
    description: TODO_DESCRIPTION,
    tags: ['testing'],
    source: '.cursor/skills/testid-standards/SKILL.md',
    body: TODO_BODY,
  },
  {
    name: 'translation-key-standards',
    title: 'Translation key standards',
    description: TODO_DESCRIPTION,
    tags: ['i18n', 'translations'],
    source: '.cursor/skills/translation-key-standards/SKILL.md',
    body: TODO_BODY,
  },
  {
    name: 'transport-sdk-implementer',
    title: 'Transport SDK implementer',
    description: TODO_DESCRIPTION,
    tags: ['transport', 'sdk'],
    source: '.cursor/skills/transport-sdk-implementer/SKILL.md',
    body: TODO_BODY,
  },
  {
    name: 'app-ui-implementer',
    title: 'App UI implementer',
    description: TODO_DESCRIPTION,
    tags: ['ui', 'design-system'],
    source: '.cursor/skills/app-ui-implementer/SKILL.md',
    body: TODO_BODY,
  },
  {
    name: 'transport-bug-root-cause',
    title: 'Transport bug root cause',
    description: TODO_DESCRIPTION,
    tags: ['transport', 'debugging'],
    source: '.cursor/skills/transport-bug-root-cause/SKILL.md',
    body: TODO_BODY,
  },
]
