import type { BuiltInPrompt } from '../types/prompt'

export const BUILT_IN_PROMPTS: BuiltInPrompt[] = [
  // ==========================================
  // Category: Onboarding & Setup
  // ==========================================
  {
    id: 'onboarding-setup/local-environment',
    origin: 'builtin',
    title: 'Set up the local dev environment',
    description:
      'Turn the setup docs into an ordered checklist from a fresh clone to a first successful run.',
    category: 'onboarding-setup',
    tags: ['setup', 'env', 'getting-started'],
    source: 'AGENTS.md § Environment Setup',
    body: `Read this repository's setup documentation (README.md, AGENTS.md, .env.example, and scripts in package.json) and produce an ordered, step-by-step checklist to get the project running locally from a clean clone.

For each step include:
1. Exact terminal command to run
2. Expected output or what success looks like
3. The most common failure mode, root cause, and recovery command
4. Any required API credentials, secrets, or internal VPN permissions that must be requested

Verify node engine compatibility and package manager constraints before recommending commands.`,
  },
  {
    id: 'onboarding-setup/first-pr-walkthrough',
    origin: 'builtin',
    title: 'First pull request walkthrough checklist',
    description:
      'A structured guide for a new engineer to prepare, verify, and submit their first contribution.',
    category: 'onboarding-setup',
    tags: ['onboarding', 'git', 'pr', 'first-pr'],
    source: 'AGENTS.md § Contributor Onboarding',
    body: `Guide me through submitting my first pull request in this repository.

Review my current branch and check:
1. Are branch naming conventions followed (e.g. feat/TICKET-short-desc)?
2. Do all automated checks pass locally (typecheck, linter, tests, build)?
3. Are all new interactive elements tagged with \`data-testid\`?
4. Are hard-coded strings avoided in favor of the i18n translation system?
5. Provide a ready-to-use PR title and summary matching the repository's PR template.`,
  },
  {
    id: 'onboarding-setup/troubleshoot-node-pnpm-mismatch',
    origin: 'builtin',
    title: 'Troubleshoot environment & dependency mismatches',
    description:
      'Diagnose Node/pnpm/npm engine version mismatches, native module compile errors, and lockfile drift.',
    category: 'onboarding-setup',
    tags: ['troubleshooting', 'node', 'lockfile', 'setup'],
    source: 'AGENTS.md § Toolchain Configuration',
    body: `I am encountering environment setup errors when running install or dev:
\`\`\`
{{ERROR_OUTPUT}}
\`\`\`

Investigate the failure:
1. Check \`package.json\` engines field and lockfile format.
2. Verify node version manager compatibility (.nvmrc or .node-version).
3. Identify if any native binaries need node-gyp, python, or Xcode tools.
4. Give me the minimal sequence of clean-up and reinstall commands to get unblocked without destroying uncommitted work.`,
  },

  // ==========================================
  // Category: Git & PR Workflow
  // ==========================================
  {
    id: 'git-pr-workflow/pr-description',
    origin: 'builtin',
    title: 'Write a production PR description',
    description: 'Draft a pull request description for the current branch using the team template.',
    category: 'git-pr-workflow',
    tags: ['pr', 'git', 'review', 'template'],
    source: 'AGENTS.md § Git & PR Workflow',
    body: `Write a pull request description for the changes on my current branch against \`main\`.

Follow the repository's PR template and commit conventions:
- **Title:** Conventional commit style (\`<type>(<scope>): <summary>\`)
- **Ticket Reference:** {{TICKET_ID}}
- **Summary:** 2-3 sentences explaining what problem this solves and the technical approach taken.
- **Key Changes:** Bulleted list of non-obvious architecture or design decisions.
- **Verification Plan:**
  - Automated commands executed (\`npm run typecheck\`, \`npm run lint\`, test commands)
  - Step-by-step manual reproduction flow to test the feature
- **Screenshots / Recordings:** Note whether UI was modified and where visual proof is required.

Only describe changes that are actually in the diff.`,
  },
  {
    id: 'git-pr-workflow/conventional-commit-formatter',
    origin: 'builtin',
    title: 'Conventional commit message formatter',
    description: 'Inspect staged changes and generate atomic conventional commit messages.',
    category: 'git-pr-workflow',
    tags: ['git', 'commits', 'conventional-commits'],
    source: 'AGENTS.md § Commit Guidelines',
    body: `Inspect the staged git diff and craft an atomic conventional commit message:
\`\`\`
<type>(<scope>): <subject in imperative, lowercase, no period>

[optional body explaining motivation and contrasting with previous behavior]

[optional footer: Fixes #123 or Refs TICKET-456]
\`\`\`

Allowed types: feat, fix, docs, style, refactor, perf, test, build, ci, chore.
Keep the first line under 72 characters. If changes span unrelated components, recommend how to split them into separate atomic commits.`,
  },
  {
    id: 'git-pr-workflow/rebase-conflict-resolver',
    origin: 'builtin',
    title: 'Resolve git rebase merge conflicts safely',
    description:
      'Step-by-step guidance for resolving complex git rebase conflicts without losing commits.',
    category: 'git-pr-workflow',
    tags: ['git', 'rebase', 'conflicts', 'merge'],
    source: 'AGENTS.md § Git Conflict Protocols',
    body: `I am rebasing my feature branch on \`origin/main\` and hit merge conflicts in:
\`\`\`
{{CONFLICTING_FILES}}
\`\`\`

Help me resolve these safely:
1. Explain what changed on main vs what changed on my feature branch for these specific files.
2. Show the correct merged code preserving both upstream fixes and feature functionality.
3. Provide the exact commands to stage, continue the rebase (\`git rebase --continue\`), or abort if needed (\`git rebase --abort\`).
4. Remind me of verification steps before force-pushing with lease (\`--force-with-lease\`).`,
  },

  // ==========================================
  // Category: Release & Dependencies
  // ==========================================
  {
    id: 'release-dependencies/release-checklist',
    origin: 'builtin',
    title: 'Prepare a release checklist',
    description: 'Summarize changes since the last tag and list what must be verified before release.',
    category: 'release-dependencies',
    tags: ['release', 'checklist', 'deployment'],
    source: 'AGENTS.md § Release Process',
    body: `Prepare a release checklist for version {{VERSION}}.

Compare against the previous release tag (git log <last_tag>..HEAD) and:
1. **Changelog Breakdown:** Group merged PRs by Features, Bug Fixes, Performance, and Chores.
2. **Breaking Changes & Migrations:** Highlight any breaking API changes, database migrations, or environment variable additions.
3. **Dependency Bumps:** Flag major version upgrades that need extra scrutiny.
4. **Pre-flight Sanity Checks:** List the automated CI steps and manual smoke tests across primary user funnels that must pass before tagging.`,
  },
  {
    id: 'release-dependencies/dependency-audit-upgrade',
    origin: 'builtin',
    title: 'Audit and safely upgrade dependencies',
    description: 'Scan package.json for vulnerabilities, deprecations, and major upgrade migration paths.',
    category: 'release-dependencies',
    tags: ['dependencies', 'security', 'audit', 'npm'],
    source: 'AGENTS.md § Security & Dependency Auditing',
    body: `Audit the dependencies in \`package.json\`:
1. Run vulnerability audit (\`npm audit\` or \`pnpm audit\`) and summarize findings by severity (Critical/High/Moderate).
2. Check for outdated packages with breaking changes.
3. Propose an incremental upgrade plan: update patch and minor versions first, verify tests, then address major upgrades with required code migrations.
4. Call out any peer dependency conflicts or duplicate bundled packages.`,
  },
  {
    id: 'release-dependencies/semantic-version-changelog',
    origin: 'builtin',
    title: 'Generate semantic version changelog',
    description: 'Format a Keep a Changelog compliant release entry from conventional commits.',
    category: 'release-dependencies',
    tags: ['changelog', 'semver', 'release-notes'],
    source: 'AGENTS.md § Changelog Specifications',
    body: `Generate a \`CHANGELOG.md\` entry for version \`[{{VERSION}}] - {{DATE}}\` adhering to the Keep a Changelog standard.

Extract changes from git commits since the last tag:
- **Added:** New user-facing or developer capabilities.
- **Changed:** Changes in existing functionality.
- **Deprecated:** Features soon to be removed.
- **Removed:** Now removed features.
- **Fixed:** Any bug fixes with ticket references.
- **Security:** Vulnerability fixes or dependency patches.

Include PR links and contributor handles formatted in markdown.`,
  },

  // ==========================================
  // Category: Code Scaffolding
  // ==========================================
  {
    id: 'code-scaffolding/new-module',
    origin: 'builtin',
    title: 'Scaffold a new feature module',
    description: 'Generate a new feature module by copying the structure of the closest existing one.',
    category: 'code-scaffolding',
    tags: ['scaffold', 'patterns', 'architecture'],
    source: 'AGENTS.md § Module Architecture',
    body: `Scaffold a new {{FEATURE_NAME}} module following the established architectural patterns in this codebase.

1. Inspect the codebase for the closest matching feature module to use as reference.
2. Outline the proposed folder hierarchy (types, hooks, components, storage/services, tests).
3. Define strict TypeScript interfaces for domain entities with zero \`any\`.
4. Ensure separation of concerns: presentational components vs reactive data state.
5. Provide the scaffolded files ready for review before writing.`,
  },
  {
    id: 'code-scaffolding/transport-client-generator',
    origin: 'builtin',
    title: 'Scaffold typed API transport client',
    description: 'Generate a typed API client adapter with error normalization, headers, and retries.',
    category: 'code-scaffolding',
    tags: ['api', 'sdk', 'transport', 'typescript'],
    source: 'AGENTS.md § Transport SDK Conventions',
    body: `Scaffold an API transport client for the endpoint: {{ENDPOINT_PATH}} (Method: {{HTTP_METHOD}}).

Requirements:
1. **Request & Response Interfaces:** Strongly typed payload and response data shapes.
2. **Error Normalization:** Map HTTP status codes (400, 401, 403, 404, 500) into a discriminated \`TransportError\` union.
3. **Correlation Headers:** Ensure \`X-Request-ID\` and \`Authorization\` headers are injected.
4. **Mock Fixture:** Include a sample mock response fixture for local testing without network dependency.`,
  },
  {
    id: 'code-scaffolding/unit-test-suite',
    origin: 'builtin',
    title: 'Scaffold comprehensive unit test suite',
    description: 'Create a Vitest/Testing Library test suite covering happy paths, edge cases, and errors.',
    category: 'code-scaffolding',
    tags: ['testing', 'vitest', 'unit-tests', 'scaffold'],
    source: 'AGENTS.md § Testing Standards',
    body: `Scaffold a comprehensive unit test suite for: {{TARGET_FILE_OR_COMPONENT}}

Follow testing guidelines:
1. Test behavior and user expectations, not private implementation details.
2. Cover:
   - Initial rendering / default state
   - User interactions (clicks, keyboard input, submit)
   - Async loading and error boundary states
   - Edge cases (empty lists, long strings, null values)
3. Use accessible role queries (\`getByRole\`) and \`data-testid\` attributes.
4. Clean up mocks and timers in \`beforeEach\` / \`afterEach\`.`,
  },

  // ==========================================
  // Category: UI & Design System
  // ==========================================
  {
    id: 'ui-design-system/map-to-ds-components',
    origin: 'builtin',
    title: 'Map a design to DS components',
    description: 'List which design-system component and props to use for each element of a design.',
    category: 'ui-design-system',
    tags: ['design-system', 'figma', 'components', 'tokens'],
    source: 'AGENTS.md § Design System Conventions',
    body: `Map this design specification to our design-system components:
{{FIGMA_LINK_OR_DESCRIPTION}}

For each element in the design:
1. Identify the matching design system primitive (Button, Card, Input, Modal, Badge, Tooltip).
2. Specify the exact prop values and design tokens (surface elevation, spacing, typography, colors).
3. If no existing component fits, state that explicitly and recommend how to compose it from base primitives rather than creating an un-styled div.
4. Validate color contrast ratios and dark mode surface compliance.`,
  },
  {
    id: 'ui-design-system/accessible-modal-dialog',
    origin: 'builtin',
    title: 'Implement an accessible modal dialog',
    description: 'Create a fully accessible dialog modal with focus trapping, backdrop blur, and escape handling.',
    category: 'ui-design-system',
    tags: ['accessibility', 'modal', 'a11y', 'dialog'],
    source: 'AGENTS.md § Accessibility Guidelines',
    body: `Implement an accessible modal dialog for: {{MODAL_PURPOSE}}

Requirements:
1. Use native \`<dialog>\` or ARIA dialog role with \`aria-modal="true"\` and descriptive \`aria-labelledby\` / \`aria-describedby\`.
2. Implement focus trapping so Tab and Shift+Tab cycle within the modal.
3. Automatically restore focus to the trigger button upon close.
4. Support backdrop click and Escape key dismissal.
5. Apply modern obsidian styling: backdrop blur, subtle borders, and smooth entrance animation.`,
  },
  {
    id: 'ui-design-system/responsive-data-grid',
    origin: 'builtin',
    title: 'Build a responsive data table / grid',
    description: 'Create a high-density data grid with sorting, pagination, empty states, and mobile adaptation.',
    category: 'ui-design-system',
    tags: ['table', 'grid', 'responsive', 'ui'],
    source: 'AGENTS.md § UI Component Standards',
    body: `Build a responsive data table component for displaying: {{DATA_TYPE}}

Features:
1. **Desktop:** High-density table with sticky headers, sortable columns, and tabular numerals.
2. **Mobile:** Graceful card-based breakdown or horizontal scroll indicator on narrow viewports.
3. **Empty & Loading States:** Skeleton loader during data fetch and a friendly empty state with action callout.
4. **Keyboard Navigation:** Row focus affordances and accessible table markup (\`<thead>\`, \`<th>\`, \`scope="col"\`).`,
  },

  // ==========================================
  // Category: Content & i18n
  // ==========================================
  {
    id: 'content-i18n/extract-strings',
    origin: 'builtin',
    title: 'Move hard-coded strings to i18n keys',
    description: 'Find user-facing strings in a file or folder and replace them with translation keys.',
    category: 'content-i18n',
    tags: ['i18n', 'translations', 'refactor'],
    source: 'AGENTS.md § Localization Conventions',
    body: `Scan {{FILE_OR_FOLDER}} for all hard-coded user-facing strings and extract them into the i18n translation system.

Follow conventions:
1. **Key Naming:** Use hierarchical dot notation: \`<domain>.<feature>.<section>.<element>\` (e.g. \`hotels.checkout.summary.total_price_label\`).
2. **Interpolation:** Replace concatenated strings with parameter placeholders (e.g. \`{{count}} items found\`).
3. **Locales:** Add keys to both primary locale (English \`en.json\`) and secondary locale (Arabic \`ar.json\`).
4. Return a summary table showing original string, new key name, and parameter list.`,
  },
  {
    id: 'content-i18n/arabic-rtl-audit',
    origin: 'builtin',
    title: 'Audit UI for Arabic RTL (Right-to-Left) readiness',
    description: 'Check layout mirroring, icon directions, chevron orientations, and bidirectional text.',
    category: 'content-i18n',
    tags: ['rtl', 'arabic', 'localization', 'css'],
    source: 'AGENTS.md § RTL & Bidirectional Design',
    body: `Perform an Arabic Right-to-Left (RTL) layout audit on: {{COMPONENT_OR_PAGE}}

Verify:
1. **Logical CSS Properties:** Replace physical utilities (\`ml-\`, \`mr-\`, \`pl-\`, \`pr-\`, \`left-\`, \`right-\`) with logical counterparts (\`ms-\`, \`me-\`, \`ps-\`, \`pe-\`, \`start-\`, \`end-\`).
2. **Directional Icons:** Invert directional icons (back/forward chevrons, arrows) in RTL while preserving non-directional icons (search, settings, media playback).
3. **Bidirectional Numbers & Phone Codes:** Ensure phone numbers, currency codes, and booking references are wrapped with unicode directional isolation (\`<bdi>\` or \`dir="ltr"\`).
4. Provide the exact diff needed to fix any RTL layout bugs.`,
  },
  {
    id: 'content-i18n/dynamic-pluralization-rules',
    origin: 'builtin',
    title: 'Implement ICU pluralization and formatting',
    description: 'Set up pluralization rules supporting English dual forms and Arabic six-category forms.',
    category: 'content-i18n',
    tags: ['pluralization', 'i18n', 'icu', 'formatting'],
    source: 'AGENTS.md § Internationalization Rules',
    body: `Implement robust pluralization rules for: {{PHRASE_OR_METRIC}} (e.g. "1 hotel room", "3 flights found", "0 reviews").

Ensure proper handling across:
1. **English (2 forms):** \`one\` vs \`other\`.
2. **Arabic (6 forms):** \`zero\`, \`one\`, \`two\` (dual), \`few\` (3-10), \`many\` (11-99), \`other\`.
3. Provide the JSON translation dictionary entries and the React/TS code demonstrating how to invoke the translation hook with dynamic count parameters.`,
  },

  // ==========================================
  // Category: Investigation & Debugging
  // ==========================================
  {
    id: 'investigation-debugging/investigate-bug',
    origin: 'builtin',
    title: 'Investigate a bug before fixing it',
    description: 'Trace the code path, rank hypotheses, and name the check that confirms each one.',
    category: 'investigation-debugging',
    tags: ['debugging', 'root-cause', 'investigation'],
    source: 'AGENTS.md § Investigation Guidelines',
    body: `Help me investigate this bug systematically before altering any code:

- **Symptom:** {{WHAT_HAPPENS}}
- **Expected:** {{WHAT_SHOULD_HAPPEN}}
- **Reproduction Steps:** {{REPRO_STEPS}}
- **Affected URL / Flow:** {{PAGE_OR_FLOW}}

Instructions:
1. Trace the code path from user trigger to state modification and UI render.
2. Formulate 3 ranked hypotheses explaining the defect.
3. For each hypothesis, describe the exact log statement, breakpoint, or unit test assertion that will confirm or falsify it.
4. Do not recommend premature refactorings until the root cause is isolated.`,
  },
  {
    id: 'investigation-debugging/memory-leak-profiler',
    origin: 'builtin',
    title: 'Profile React component re-renders & memory retention',
    description: 'Identify unnecessary re-render loops, detached DOM nodes, and dangling event listeners.',
    category: 'investigation-debugging',
    tags: ['performance', 'memory', 'react', 'profiling'],
    source: 'AGENTS.md § Performance Guidelines',
    body: `Investigate performance sluggishness or memory retention in: {{COMPONENT_OR_MODULE}}

Audit for:
1. **Unstable References:** Identify functions or object literals created inside component renders that invalidate downstream \`React.memo\` or dependency arrays.
2. **Dangling Event Listeners / Timers:** Check \`useEffect\` hooks to confirm every \`addEventListener\`, \`setInterval\`, or WebSocket connection has a complete teardown cleanup function.
3. **Context Thrashing:** Check if large context providers trigger whole-tree re-renders on minor field updates.
4. Provide recommendations with code snippets showing before and after optimizations.`,
  },
  {
    id: 'investigation-debugging/flaky-test-analyzer',
    origin: 'builtin',
    title: 'Diagnose and fix asynchronous flaky test',
    description: 'Isolate race conditions, unawaited promises, and clock timing issues in test suites.',
    category: 'investigation-debugging',
    tags: ['testing', 'flaky-tests', 'vitest', 'async'],
    source: 'AGENTS.md § Test Reliability Protocols',
    body: `This test occasionally fails in CI with non-deterministic behavior:
\`\`\`typescript
{{FAILING_TEST_CODE}}
\`\`\`

Diagnose the flakiness:
1. Is there an unawaited promise or missing \`waitFor\` / \`findBy\` async query?
2. Are shared module state or singleton instances leaking between tests?
3. Does the test depend on arbitrary \`setTimeout\` delays rather than observable DOM state transitions?
4. Provide a rewritten, deterministic version of the test that passes reliably under load.`,
  },

  // ==========================================
  // Category: Analytics
  // ==========================================
  {
    id: 'analytics/add-tracking-event',
    origin: 'builtin',
    title: 'Add an analytics tracking event',
    description: 'Add a tracking event that follows the existing naming convention and payload shape.',
    category: 'analytics',
    tags: ['analytics', 'tracking', 'telemetry'],
    source: 'AGENTS.md § Analytics & Tracking',
    body: `Add analytics tracking for user interaction: {{USER_ACTION}}

Follow team taxonomy:
1. **Event Name:** Format as \`[domain]_[object]_[action]\` in snake_case (e.g. \`flight_filter_price_changed\`, \`hotel_booking_step_submitted\`).
2. **Payload Schema:** List required common properties (timestamp, user_id, session_id, platform) and custom event properties with types.
3. **Verification:** Show how to inspect the dispatched event in the browser console / dataLayer in development mode.
4. Ensure no Personally Identifiable Information (PII) like raw emails, passwords, or credit card numbers are included in the payload.`,
  },
  {
    id: 'analytics/conversion-funnel-audit',
    origin: 'builtin',
    title: 'Audit conversion funnel tracking instrumentation',
    description: 'Verify sequential tracking events across multi-step checkout and onboarding flows.',
    category: 'analytics',
    tags: ['funnel', 'conversion', 'analytics', 'audit'],
    source: 'AGENTS.md § Funnel Tracking Specs',
    body: `Audit the analytics tracking across this conversion funnel: {{FUNNEL_FLOW_NAME}}

Review steps:
1. Map each screen/step to its corresponding \`step_viewed\` and \`step_completed\` events.
2. Confirm consistent session IDs and funnel transaction IDs persist across all steps.
3. Check for drop-off event instrumentation (e.g. validation errors, modal abandonment).
4. Create a verification matrix listing Step, Event Name, Required Properties, and Expected Trigger.`,
  },
  {
    id: 'analytics/gtm-datalayer-validation',
    origin: 'builtin',
    title: 'Validate Google Tag Manager dataLayer pushes',
    description: 'Ensure dataLayer.push structures conform to schema and do not wipe existing keys.',
    category: 'analytics',
    tags: ['gtm', 'datalayer', 'google-tag-manager', 'tracking'],
    source: 'AGENTS.md § Tag Management Standards',
    body: `Review or implement the Google Tag Manager \`window.dataLayer.push\` implementation for: {{FEATURE_NAME}}

Verify:
1. Correct syntax: \`window.dataLayer.push({ event: 'event_name', ...params })\`.
2. Ensure previous ecommerce objects are cleared before pushing new transaction data (\`ecommerce: null\`).
3. Type-safe wrapper: Propose a typed helper function that enforces required properties before pushing to \`window.dataLayer\`.
4. Provide a debugging snippet to log all dataLayer pushes in browser devtools.`,
  },
]
