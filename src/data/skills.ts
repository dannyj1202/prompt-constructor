import type { Skill } from '../types/skill'

export const SKILLS: Skill[] = [
  {
    name: 'testid-standards',
    title: 'Test ID standards',
    description: 'Guidelines and naming conventions for applying data-testid attributes to interactive and stateful UI elements.',
    tags: ['testing', 'qa', 'e2e'],
    source: '.cursor/skills/testid-standards/SKILL.md',
    body: `# Test ID Standards

Ensure every user-interactive element, stateful indicator, and primary layout container has a predictable, semantic \`data-testid\` attribute for Playwright and Cypress end-to-end testing.

## Naming Pattern
Use kebab-case formatted as: \`[domain]-[component]-[element]-[action/variant]\`

### Examples
- \`flight-search-submit-btn\`
- \`hotel-card-price-label\`
- \`booking-summary-modal-close-btn\`
- \`checkout-payment-method-radio-card\`

## Strict Rules
1. **Never use random hashes or auto-generated IDs.** IDs must remain stable across app builds.
2. **Never anchor tests on CSS classes or text content.** Always query via \`[data-testid="..."]\`.
3. **Dynamic Lists:** Suffix each item in a list with its index or unique key, e.g. \`flight-result-card-0\` or \`flight-result-card-DXB-LHR\`.
4. **Interactive States:** Add testids to loading skeletons and error banners (e.g. \`flight-search-loading-skeleton\`, \`checkout-error-banner\`).
`,
  },
  {
    name: 'translation-key-standards',
    title: 'Translation key standards',
    description: 'Conventions for structuring, nesting, and extracting internationalization (i18n) translation keys.',
    tags: ['i18n', 'translations', 'content'],
    source: '.cursor/skills/translation-key-standards/SKILL.md',
    body: `# Translation Key Standards

Follow these conventions when adding or updating i18n keys across English and Arabic locales.

## Key Hierarchy & Namespace
Keys are organized in lowercase, dot-separated segments:
\`<domain>.<feature>.<section>.<element_or_message>\`

### Examples
- \`hotels.checkout.payment_section.title\`
- \`flights.results.filter_sidebar.price_range_label\`
- \`common.actions.confirm_button\`
- \`common.errors.network_timeout\`

## Best Practices
1. **Never concatenate translated fragments.** Translating words independently breaks RTL (Arabic) grammar and pluralization. Use interpolation parameters instead:
   \`\`\`json
   "booking_confirmed_message": "Your booking {{bookingId}} is confirmed."
   \`\`\`
2. **Arabic (RTL) Readiness:** When introducing strings with bidirectional text (e.g. numbers, emails, flight codes), wrap dynamic tokens with appropriate bidirectional markers or unicode isolators.
3. **Pluralization:** Use standardized plural suffixes: \`_one\`, \`_other\`, and where applicable \`_zero\` / \`_few\` / \`_many\` for Arabic support.
`,
  },
  {
    name: 'transport-sdk-implementer',
    title: 'Transport SDK implementer',
    description: 'Patterns for implementing API client transport layers, typed responses, retry policies, and error mappers.',
    tags: ['transport', 'sdk', 'api'],
    source: '.cursor/skills/transport-sdk-implementer/SKILL.md',
    body: `# Transport SDK Implementer

Use this skill when building or refactoring API transport adapters, HTTP client wrappers, or backend service SDKs.

## Architecture
Every endpoint integration must follow a three-tier architecture:
1. **Wire Layer (Raw HTTP):** Validates HTTP status codes, deserializes JSON, handles correlation IDs (\`X-Request-ID\`).
2. **Mapper Layer:** Transforms raw backend payloads (often snake_case) into typed, camelCase frontend domain models.
3. **Client API Layer:** Exposes ergonomic async methods with typed parameters and unified error responses.

## Error Normalization
Never let raw network errors or HTTP status codes leak into UI state. Always map responses to domain errors:
\`\`\`typescript
export type TransportError =
  | { kind: 'NETWORK_TIMEOUT'; retryable: true; message: string }
  | { kind: 'UNAUTHORIZED'; retryable: false; message: string }
  | { kind: 'VALIDATION_FAILED'; fieldErrors: Record<string, string[]> }
  | { kind: 'UNEXPECTED'; raw: unknown }
\`\`\`
`,
  },
  {
    name: 'app-ui-implementer',
    title: 'App UI implementer',
    description: 'Instructions for building responsive, accessible UI components mapped to the house design system tokens.',
    tags: ['ui', 'design-system', 'components'],
    source: '.cursor/skills/app-ui-implementer/SKILL.md',
    body: `# App UI Implementer

Follow these rules when implementing UI screens, layouts, and interactive widgets to match the design system.

## Golden Rules
1. **Design System First:** Always check existing primitives (\`Button\`, \`Modal\`, \`TagList\`, \`ContentCard\`) before inventing ad-hoc UI elements.
2. **Surface Elevation Hierarchy:**
   - Canvas: \`bg-canvas\` (\`#090a0c\` in dark mode)
   - Cards / Panels: \`bg-canvas-card\` (\`#111215\`) with subtle \`border-white/8\`
   - Insets / Code / Previews: \`bg-canvas-inset\` (\`#0c0d0f\`)
3. **Interactive Affordances:**
   - Buttons must have active press physics (\`active:translate-y-px\`).
   - Focus rings must use \`focus-visible:outline-2 focus-visible:outline-indigo-500\`.
   - Modals must support backdrop blur and Escape key dismissal.
4. **Accessible Typography:** Use \`tabular-nums\` for all counters, prices, and timestamp badges.
`,
  },
  {
    name: 'transport-bug-root-cause',
    title: 'Transport bug root cause',
    description: 'Systematic workflow for diagnosing, reproducing, and fixing elusive API transport and networking bugs.',
    tags: ['transport', 'debugging', 'investigation'],
    source: '.cursor/skills/transport-bug-root-cause/SKILL.md',
    body: `# Transport Bug Root Cause Investigation

Use this playbook when encountering intermittent API failures, silent response serialization issues, or unexpected payload shapes.

## Investigation Phase
1. **Capture the Network Signature:**
   - Check headers: \`content-type\`, \`authorization\`, \`x-request-id\`.
   - Inspect status code and exact response body payload.
2. **Form 3 Ranked Hypotheses:**
   - *Hypothesis 1 (Data shape mismatch):* Did backend change property names or return null instead of empty array?
   - *Hypothesis 2 (Timing / Race condition):* Is a stale request overriding newer state?
   - *Hypothesis 3 (Auth / Session expiry):* Is bearer token expiring silently during long-lived forms?
3. **Verify with Isolation:**
   - Write a standalone test reproducing the failing payload before writing fix code.
`,
  },
  {
    name: 'pull-request-reviewer',
    title: 'Pull request reviewer',
    description: 'Automated code review instructions focusing on code safety, bundle impact, test coverage, and house conventions.',
    tags: ['review', 'git', 'quality'],
    source: '.cursor/skills/pull-request-reviewer/SKILL.md',
    body: `# Pull Request Reviewer

Conduct thorough, respectful, and high-signal code reviews adhering to team engineering guidelines.

## Review Checklist
1. **Correctness & Edge Cases:** Check nullability, empty array states, and API error states.
2. **Performance & Bundle:** Flag unexpected large dependencies, unmemoized expensive computations, or redundant re-renders.
3. **Type Safety:** Ensure no \`any\` or unverified type casts (\`as SomeType\`) were introduced.
4. **House Conventions:** Verify that new strings use i18n keys and interactive elements have \`data-testid\`.
5. **Feedback Tone:** Always explain *why* a suggestion improves the code, and cite specific alternatives.
`,
  },
  {
    name: 'release-manager',
    title: 'Release manager checklist',
    description: 'Step-by-step guidance for cutting production release tags, auditing changelogs, and verifying CI/CD deployment gates.',
    tags: ['release', 'deployment', 'ci'],
    source: '.cursor/skills/release-manager/SKILL.md',
    body: `# Release Manager Checklist

Coordinate release preparation, changelog generation, and pre-deployment sanity checks.

## Pre-Release Steps
1. Run local validation: \`npm run typecheck && npm run lint && npm run build\`.
2. Compare git history against the previous release tag: \`git log <previous_tag>..HEAD --oneline\`.
3. Check for any breaking dependency bumps in \`package.json\`.
4. Ensure all staging smoke tests pass for primary user conversion funnels.

## Tagging & Promotion
- Tag using semantic versioning (\`vX.Y.Z\`).
- Draft GitHub release notes categorizing commits into **Features**, **Bug Fixes**, and **Performance**.
`,
  },
]
