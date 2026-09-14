import type { TasteEntry } from '../types/taste'

export const TASTE_ENTRIES: TasteEntry[] = [
  {
    id: 'typescript-strict-patterns',
    title: 'TypeScript Strict Patterns',
    description: 'Rules for type safety: discriminated unions over enums, no any, and explicit type guards.',
    tags: ['typescript', 'typing', 'safety'],
    source: 'AGENTS.md § TypeScript Standards',
    body: `### TypeScript Strict Patterns

1. **Discriminated Unions over Enums:**
   Prefer string literal unions or discriminated unions for state and status models:
   \`\`\`typescript
   type Status = 'idle' | 'loading' | 'success' | 'error'
   
   type AsyncResult<T> =
     | { status: 'idle' }
     | { status: 'loading' }
     | { status: 'success'; data: T }
     | { status: 'error'; error: Error }
   \`\`\`

2. **Never use \`any\`:**
   Use \`unknown\` when dealing with external payloads, and narrow with explicit type guards before access.

3. **Immutable Operations:**
   Avoid mutating arguments. Use spread operators, \`map\`, \`filter\`, or \`toSorted\` to produce new arrays and objects.

4. **Explicit Return Types for Public APIs:**
   Exported library functions and custom hooks should explicitly declare return types to avoid unintended breaking changes.
`,
  },
  {
    id: 'react-19-standards',
    title: 'React 19 Architecture Standards',
    description: 'Component structuring, pure functions, state lifting, and avoiding useEffect for derived state.',
    tags: ['react', 'components', 'hooks'],
    source: 'AGENTS.md § React Conventions',
    body: `### React 19 Architecture Standards

1. **Calculate Derived State During Render:**
   Never sync props to state or compute filtered lists inside \`useEffect\`. Compute derived values directly with \`useMemo\` or inline:
   \`\`\`typescript
   // Correct
   const visibleItems = useMemo(() => filterItems(items, query), [items, query])
   \`\`\`

2. **Single Responsibility Components:**
   - Keep page containers responsible for data retrieval and routing.
   - Keep UI components presentational, accepting typed props and callbacks.

3. **External Store Subscriptions:**
   When integrating with browser \`localStorage\` or custom pub/sub stores, use \`useSyncExternalStore\` rather than ad-hoc listeners in \`useEffect\`.

4. **Dialogs & Overlays:**
   Use the native HTML \`<dialog>\` element with \`showModal()\` for accessible focus trapping and Escape key management.
`,
  },
  {
    id: 'tailwind-v4-styling',
    title: 'Tailwind CSS v4 & Surface Elevation',
    description: 'Layered obsidian dark mode, CSS custom property tokens, and mobile-first responsive utilities.',
    tags: ['tailwind', 'css', 'design-system'],
    source: 'AGENTS.md § Styling Conventions',
    body: `### Tailwind CSS v4 & Surface Elevation

1. **Layered Dark Mode Surfaces:**
   Do not use generic flat grey boxes. Follow the layered surface depth model:
   - **Canvas Canvas:** \`dark:bg-canvas\` (\`#090a0c\`)
   - **Elevated Cards:** \`dark:bg-canvas-card\` (\`#111215\`) with subtle border \`dark:border-white/8\`
   - **Inset Code/Preview:** \`dark:bg-canvas-inset\` (\`#0c0d0f\`)

2. **Tactile Interactive States:**
   - Always pair \`hover:\` with smooth transition classes (\`transition-colors duration-150\`).
   - Give buttons physical press feedback: \`active:translate-y-px\`.
   - Never remove outline rings without providing visible \`focus-visible:\` styles.

3. **Class Merging:**
   Always use the \`cn()\` helper (\`clsx\` + \`tailwind-merge\`) when combining dynamic and conditional classes to prevent conflict resolution bugs.
`,
  },
  {
    id: 'git-and-pr-conventions',
    title: 'Git Commit & PR Conventions',
    description: 'Commit message formatting, branch naming strategies, and pull request description templates.',
    tags: ['git', 'workflow', 'review'],
    source: 'AGENTS.md § Git & PR Workflow',
    body: `### Git Commit & PR Conventions

1. **Conventional Commit Format:**
   Follow \`<type>(<scope>): <short imperative description>\`:
   - \`feat(ui): add spotlight card hover effect\`
   - \`fix(storage): resolve localStorage serialization error\`
   - \`refactor(router): streamline query parameter serialization\`
   - \`docs(readme): update getting started instructions\`

2. **Branch Naming:**
   - Feature: \`feat/<ticket-id>-<short-slug>\`
   - Fix: \`fix/<ticket-id>-<short-slug>\`
   - Chore/Refactor: \`chore/<short-slug>\`

3. **PR Description Requirements:**
   - **Summary:** 2-3 sentences outlining the problem and technical approach.
   - **Testing Verification:** Steps taken to verify (automated command + manual flows).
   - **Screenshots / Recordings:** Required for any visible user interface change.
`,
  },
  {
    id: 'api-design-and-error-handling',
    title: 'API Design & Error Handling',
    description: 'REST/GraphQL schema standards, unified response envelopes, idempotency, and status codes.',
    tags: ['api', 'rest', 'backend', 'architecture'],
    source: 'AGENTS.md § API Conventions',
    body: `### API Design & Error Handling

1. **Unified Response Envelope:**
   All HTTP API endpoints must return a consistent top-level JSON structure:
   \`\`\`json
   {
     "data": { ... },
     "meta": { "page": 1, "total": 42 },
     "error": null
   }
   \`\`\`
   On failure:
   \`\`\`json
   {
     "data": null,
     "error": {
       "code": "RESOURCE_NOT_FOUND",
       "message": "Hotel room rate could not be located.",
       "details": []
     }
   }
   \`\`\`

2. **Idempotency Keys for Mutations:**
   Any state-mutating request (POST/PATCH for payments, booking creations, order placements) must accept an \`Idempotency-Key\` header to protect against accidental retries on flaky networks.

3. **Status Code Semantics:**
   - \`200 OK\`: Successful retrieval or mutation with return payload.
   - \`201 Created\`: Resource successfully created (with \`Location\` header).
   - \`400 Bad Request\`: Client validation error (invalid parameters).
   - \`401 Unauthorized\`: Missing or invalid authentication token.
   - \`403 Forbidden\`: Authenticated user lacks permission.
   - \`404 Not Found\`: Resource does not exist.
   - \`422 Unprocessable Entity\`: Domain rule violation (e.g. room no longer available).
   - \`500 Internal Error\`: Unexpected server-side fault (never leak stack traces).
`,
  },
  {
    id: 'testing-and-mock-hygiene',
    title: 'Testing Standards & Mock Hygiene',
    description: 'Guidelines for Vitest, React Testing Library, query priority, and test isolation.',
    tags: ['testing', 'vitest', 'mocking', 'qa'],
    source: 'AGENTS.md § Testing Guidelines',
    body: `### Testing Standards & Mock Hygiene

1. **Test Behavior, Not Implementation Details:**
   Avoid inspecting internal component state or private methods. Assert what the user sees, clicks, or what external contracts receive.

2. **Query Priority (React Testing Library):**
   - 1st: Accessible roles (\`getByRole('button', { name: /save/i })\`)
   - 2nd: Form label text (\`getByLabelText(/email/i)\`)
   - 3rd: Explicit test IDs (\`getByTestId('flight-search-submit-btn')\`)
   - Avoid: Direct class name queries or fragile DOM traversal (\`container.firstChild\`).

3. **Strict Mock Hygiene:**
   - Always clear and reset mocks between tests (\`beforeEach(() => vi.clearAllMocks())\`).
   - Mock at the boundary (e.g., mock the HTTP client or network layer with MSW), not every intermediate internal helper.
   - Every mock should reflect realistic failure modes (timeouts, 500 errors, schema deviations).
`,
  },
]
