import type { Workflow } from '../types/workflow'

export const WORKFLOWS: Workflow[] = [
  {
    id: 'fix-a-bug',
    title: 'Fix a bug end to end',
    description: 'Investigate the root cause before touching code, create regression tests, then open a PR.',
    tags: ['debugging', 'bugfix', 'git'],
    origin: 'builtin',
    steps: [
      {
        promptId: 'investigation-debugging/investigate-bug',
        note: 'Fill in the symptom and reproduction steps from the bug report or ticket.',
      },
      {
        promptId: 'code-scaffolding/unit-test-suite',
        note: 'Write a failing unit test that reproduces the bug before writing the fix.',
      },
      {
        promptId: 'git-pr-workflow/pr-description',
        note: 'Summarize the root cause analysis and the verification steps taken.',
      },
    ],
  },
  {
    id: 'build-a-feature',
    title: 'Build a new feature module',
    description: 'Scaffold the module, map design-system tokens, wire up i18n and tracking, then open a PR.',
    tags: ['feature', 'scaffolding', 'ui', 'analytics'],
    origin: 'builtin',
    steps: [
      {
        promptId: 'code-scaffolding/new-module',
        note: 'Find the closest existing module in the repository to use as an architectural template.',
      },
      {
        promptId: 'ui-design-system/map-to-ds-components',
        note: 'Map Figma visual elements to existing design system tokens and components.',
      },
      {
        promptId: 'content-i18n/extract-strings',
        note: 'Ensure all user-facing copy uses translation keys across en and ar locales.',
      },
      {
        promptId: 'analytics/add-tracking-event',
        note: 'Instrument key user interactions with standardized telemetry events.',
      },
      {
        promptId: 'git-pr-workflow/pr-description',
        note: 'Draft PR description with test steps and UI screenshots.',
      },
    ],
  },
  {
    id: 'production-hotfix-pipeline',
    title: 'Production incident & emergency hotfix',
    description: 'Triage live incident, reproduce under test, format atomic patch commit, and verify release gates.',
    tags: ['incident', 'hotfix', 'release', 'production'],
    origin: 'builtin',
    steps: [
      {
        promptId: 'investigation-debugging/investigate-bug',
        note: 'Gather production logs and trace the failing code path under urgency.',
      },
      {
        promptId: 'code-scaffolding/unit-test-suite',
        note: 'Create a focused regression test proving the fix prevents future recurrence.',
      },
      {
        promptId: 'git-pr-workflow/conventional-commit-formatter',
        note: 'Generate a clean fix(...) commit referencing the urgent incident ticket.',
      },
      {
        promptId: 'release-dependencies/release-checklist',
        note: 'Complete mandatory pre-flight checks before triggering emergency deployment.',
      },
    ],
  },
  {
    id: 'design-system-and-a11y-audit',
    title: 'Design system alignment & accessibility audit',
    description: 'Align UI elements to token conventions, verify keyboard navigation, and check screen reader compliance.',
    tags: ['design-system', 'accessibility', 'a11y', 'ui'],
    origin: 'builtin',
    steps: [
      {
        promptId: 'ui-design-system/map-to-ds-components',
        note: 'Audit screen elements against standard design system library primitives.',
      },
      {
        promptId: 'ui-design-system/accessible-modal-dialog',
        note: 'Check focus traps, Escape keys, and aria roles on overlays and dialogues.',
      },
      {
        promptId: 'content-i18n/arabic-rtl-audit',
        note: 'Audit layout mirroring and directional icons in Arabic RTL mode.',
      },
      {
        promptId: 'git-pr-workflow/pr-description',
        note: 'Document accessibility improvements with before/after visual proof.',
      },
    ],
  },
  {
    id: 'i18n-localization-pass',
    title: 'Full internationalization & RTL Arabic localization',
    description: 'Extract hard-coded strings, implement ICU pluralization, and audit bidirectional layout mirroring.',
    tags: ['i18n', 'rtl', 'arabic', 'localization'],
    origin: 'builtin',
    steps: [
      {
        promptId: 'content-i18n/extract-strings',
        note: 'Extract all static labels and placeholder texts into JSON dictionaries.',
      },
      {
        promptId: 'content-i18n/dynamic-pluralization-rules',
        note: 'Set up dual (English) and six-form (Arabic) pluralization rules.',
      },
      {
        promptId: 'content-i18n/arabic-rtl-audit',
        note: 'Verify logical CSS properties (ms-, me-) and bidirectional number formatting.',
      },
      {
        promptId: 'git-pr-workflow/pr-description',
        note: 'Provide translation key diffs and testing instructions for language toggle.',
      },
    ],
  },
  {
    id: 'onboarding-to-first-pr',
    title: 'New engineer onboarding to first PR',
    description: 'From clean git clone through dependency troubleshooting to submitting a polished first pull request.',
    tags: ['onboarding', 'getting-started', 'first-pr'],
    origin: 'builtin',
    steps: [
      {
        promptId: 'onboarding-setup/local-environment',
        note: 'Follow the setup checklist to launch local dev servers.',
      },
      {
        promptId: 'onboarding-setup/troubleshoot-node-pnpm-mismatch',
        note: 'Resolve any engine version or lockfile conflicts if encountered.',
      },
      {
        promptId: 'onboarding-setup/first-pr-walkthrough',
        note: 'Run typecheck, linting, test suites, and verify data-testid tagging.',
      },
      {
        promptId: 'git-pr-workflow/pr-description',
        note: 'Submit your first PR with a well-structured summary and test plan.',
      },
    ],
  },
  {
    id: 'release-preparation-cut',
    title: 'Release candidate preparation & tag cut',
    description: 'Audit dependencies, generate Keep a Changelog notes, and verify CI deployment smoke tests.',
    tags: ['release', 'semver', 'changelog', 'deployment'],
    origin: 'builtin',
    steps: [
      {
        promptId: 'release-dependencies/dependency-audit-upgrade',
        note: 'Verify no critical CVE vulnerabilities exist in locked dependencies.',
      },
      {
        promptId: 'release-dependencies/semantic-version-changelog',
        note: 'Compile conventional commits into a clean CHANGELOG.md release section.',
      },
      {
        promptId: 'release-dependencies/release-checklist',
        note: 'Execute manual smoke test pass across core booking and search funnels.',
      },
    ],
  },
]
