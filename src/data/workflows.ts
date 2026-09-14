import type { Workflow } from '../types/workflow'

// PLACEHOLDER CONTENT: example chains of the placeholder built-in prompts.
// Steps reference prompts by id, so they keep working when prompt text changes.
export const WORKFLOWS: Workflow[] = [
  {
    id: 'fix-a-bug',
    title: 'Fix a bug end to end',
    description: 'Investigate the root cause before touching code, then open a PR.',
    steps: [
      {
        promptId: 'investigation-debugging/investigate-bug',
        note: 'Fill in the symptom from the ticket or bug report.',
      },
      { promptId: 'git-pr-workflow/pr-description' },
    ],
  },
  {
    id: 'build-a-feature',
    title: 'Build a new feature',
    description: 'Scaffold the module, build the UI, wire up copy and tracking, then open a PR.',
    steps: [
      { promptId: 'code-scaffolding/new-module' },
      { promptId: 'ui-design-system/map-to-ds-components', note: 'Have the Figma link ready.' },
      { promptId: 'content-i18n/extract-strings' },
      { promptId: 'analytics/add-tracking-event' },
      { promptId: 'git-pr-workflow/pr-description' },
    ],
  },
]
