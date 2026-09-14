import type { BuiltInPrompt } from '../types/prompt'

// PLACEHOLDER CONTENT: one generic stand-in per category so the UI has
// something to render. Replace each `body` and `source` with the real prompt
// text and the repo file/convention it is based on.
export const BUILT_IN_PROMPTS: BuiltInPrompt[] = [
  {
    id: 'onboarding-setup/local-environment',
    origin: 'builtin',
    title: 'Set up the local dev environment',
    description:
      'Turn the setup docs into an ordered checklist from a fresh clone to a first successful run.',
    category: 'onboarding-setup',
    tags: ['setup', 'env'],
    source: 'TODO: cite source file',
    body: `Read this repository's setup documentation (README, AGENTS.md, .env.example, and the scripts in package.json) and produce an ordered checklist to get it running locally from a fresh clone.

For each step include:
- the exact command
- what success looks like
- the most likely failure and how to fix it

Flag anything that needs credentials or access I have to request from someone.`,
  },
  {
    id: 'git-pr-workflow/pr-description',
    origin: 'builtin',
    title: 'Write a PR description',
    description: 'Draft a pull request description for the current branch using the team template.',
    category: 'git-pr-workflow',
    tags: ['pr', 'git', 'review'],
    source: 'TODO: cite source file',
    body: `Write a pull request description for the changes on my current branch.

Follow the team's PR template and commit conventions. Include:
- Summary (what and why, 2-3 sentences)
- Ticket: {{TICKET_ID}}
- How to test
- Screenshots or recordings needed? (yes/no)

Only describe changes that are actually in the diff.`,
  },
  {
    id: 'release-dependencies/release-checklist',
    origin: 'builtin',
    title: 'Prepare a release checklist',
    description: 'Summarize changes since the last tag and list what must be verified before release.',
    category: 'release-dependencies',
    tags: ['release', 'checklist'],
    source: 'TODO: cite source file',
    body: `Prepare a release checklist for version {{VERSION}}.

Compare against the previous release tag and:
1. List merged changes grouped by type (feature / fix / chore).
2. Call out dependency bumps that include breaking changes.
3. List the manual verification steps that must pass before tagging.`,
  },
  {
    id: 'code-scaffolding/new-module',
    origin: 'builtin',
    title: 'Scaffold a new module',
    description: 'Generate a new feature module by copying the structure of the closest existing one.',
    category: 'code-scaffolding',
    tags: ['scaffold', 'patterns'],
    source: 'TODO: cite source file',
    body: `Scaffold a new {{FEATURE_NAME}} module following the existing patterns in this codebase.

First find the closest existing module and use it as the template for folder structure, naming, exports, and tests. Show me the file tree you plan to create before writing any files.`,
  },
  {
    id: 'ui-design-system/map-to-ds-components',
    origin: 'builtin',
    title: 'Map a design to DS components',
    description: 'List which design-system component and props to use for each element of a design.',
    category: 'ui-design-system',
    tags: ['design-system', 'figma', 'components'],
    source: 'TODO: cite source file',
    body: `Map this design to our design-system components: {{FIGMA_LINK_OR_DESCRIPTION}}

For each element, name the DS component and the props to use. Where no DS component fits, say so explicitly instead of inventing one, and suggest the closest match.`,
  },
  {
    id: 'content-i18n/extract-strings',
    origin: 'builtin',
    title: 'Move hard-coded strings to i18n keys',
    description: 'Find user-facing strings in a file or folder and replace them with translation keys.',
    category: 'content-i18n',
    tags: ['i18n', 'translations'],
    source: 'TODO: cite source file',
    body: `Find every hard-coded user-facing string in {{FILE_OR_FOLDER}} and move it to translation keys.

Follow the existing key naming convention, add an entry for every supported locale (use the English value as a placeholder where a translation is missing), and list the keys you added.`,
  },
  {
    id: 'investigation-debugging/investigate-bug',
    origin: 'builtin',
    title: 'Investigate a bug before fixing it',
    description: 'Trace the code path, rank hypotheses, and name the check that confirms each one.',
    category: 'investigation-debugging',
    tags: ['debugging', 'root-cause'],
    source: 'TODO: cite source file',
    body: `Help me investigate this bug before changing any code.

Symptom: {{WHAT_HAPPENS}}
Expected: {{WHAT_SHOULD_HAPPEN}}
Where I've seen it: {{PAGE_OR_FLOW}}

Trace the code path involved, list 2-3 hypotheses ranked by likelihood, and tell me which log line, breakpoint, or test would confirm or rule out each one.`,
  },
  {
    id: 'analytics/add-tracking-event',
    origin: 'builtin',
    title: 'Add an analytics event',
    description: 'Add a tracking event that follows the existing naming convention and payload shape.',
    category: 'analytics',
    tags: ['analytics', 'tracking'],
    source: 'TODO: cite source file',
    body: `Add analytics tracking for {{USER_ACTION}}.

Follow the existing event naming convention and payload shape. Before writing code, list the event name, its properties, and where it fires. Then show how to verify the event fires correctly in dev.`,
  },
]
