# Specification: Prompts Page Polish & Craft Floor Alignment

> **Target Surface:** `src/components/prompts/prompts-page.tsx` and related card/sidebar components.  
> **Source Inputs:** `/impeccable audit` (Score 16/20), `/impeccable critique` (Craft Floor review), and `/impeccable optimize` (Completed).  
> **Design Authority:** `PRODUCT.md` & `DESIGN.md` (The Obsidian Canvas).

---

## Status of Work Streams

| Work Stream | Status | Scope | Primary Files |
|---|---|---|---|
| **Stream 1: Accessibility & Keyboard UX** | 🟡 **Pending** | `<h1>` heading, touch targets, screen-reader parity, kbd discoverability | `prompts-page.tsx`, `prompt-card.tsx`, `button.tsx`, `useGridKeyboardNav.ts`, `search-input.tsx` |
| **Stream 2: Design Token & Craft Integrity** | 🟡 **Pending** | Category accents, citation overflow, sidebar contrast, typography floor | `prompt-eyebrow.tsx`, `content-card.tsx`, `category-sidebar.tsx`, `prompt-card.tsx` |
| **Stream 3: Performance & State Memoization** | 🟢 **Done** | Grid-nav callback stability via refs, template variable regex memoization | `prompts-page.tsx`, `prompt-card.tsx`, `useGridKeyboardNav.ts` |

---

## Stream 1: Accessibility & Keyboard UX

### Task 1.1: Add Missing `<h1>` / PageHeading to Prompts Page (P1)
- **Problem:** `prompts-page.tsx` is the app's default route (`/`, `/prompts`) but the only page rendering without an `<h1>`.
- **File:** `src/components/prompts/prompts-page.tsx`
- **Action:** Pass `heading={<PageHeading title="Prompts" description="Browse, search, and copy developer convention prompts." />}` into `<BrowseLayout>`.
- **Acceptance Criteria:** Document outlines contain an `<h1>` element on the `/` and `/prompts` route matching sibling pages.

### Task 1.2: Enforce Touch-Target Minimums (P2)
- **Problem:** Icon-only buttons (`Button size="sm"`, `StarButton`, `CopyButton`) on cards have computed hit areas around ~22px height, failing WCAG 2.5.8 (24×24px AA) and WCAG 2.5.5 (44×44px AAA).
- **Files:** `src/components/ui/button.tsx`, `src/components/ui/star-button.tsx`, `src/components/ui/copy-button.tsx`
- **Action:**
  - Increase button click area: add `min-h-[32px] min-w-[32px]` with appropriate padding, or pseudo-element hit-area expansion (`after:absolute after:-inset-1.5`).
- **Acceptance Criteria:** All interactive card action buttons have an interactive target area of at least 24×24px (and ideally 32–36px).

### Task 1.3: Expose Grid Navigation to Assistive Tech & Add Discoverability (P2)
- **Problem:** Arrow-key and `j`/`k` navigation updates visual highlighting (`highlighted` prop) with no feedback to screen readers. Users also have no visible cue that `j`/`k` or arrow navigation exists.
- **Files:** `src/components/prompts/prompts-page.tsx`, `src/components/prompts/search-input.tsx`
- **Action:**
  - In `prompts-page.tsx`, render a visually hidden live region (`aria-live="polite" className="sr-only"`) that announces the title of the active prompt when `highlighted` changes.
  - In `search-input.tsx` (or adjacent to search), add a subtle kbd hint: `<kbd className="font-mono text-xs text-zinc-400">↑↓ or j/k to navigate</kbd>`.
- **Acceptance Criteria:** Screen readers announce selected cards on arrow/j-k press; keyboard navigation hints are discoverable.

---

## Stream 2: Design Token & Craft Integrity

### Task 2.1: Respect the Single Accent Rule in Eyebrows
- **Problem:** `prompt-eyebrow.tsx` hardcodes `text-indigo-600 dark:text-indigo-400`. Per `DESIGN.md` (Single Accent Rule), Signal Indigo is reserved for interaction/action signals. Category labels must use their own assigned accent colors.
- **Files:** `src/components/prompts/prompt-eyebrow.tsx`, `src/data/categories.ts`
- **Action:** Map `prompt.category` to its specific accent token styles (emerald, violet, amber, cyan, pink, sky, rose, lime) using the category palette map, matching `category-sidebar.tsx`.
- **Acceptance Criteria:** Category labels on prompt cards display their respective category accent color instead of hardcoded indigo.

### Task 2.2: Fix Source Citation Text Overflow in Cards
- **Problem:** 23 out of 24 cards have their source citation code block overflowing 21–115px past the card boundary because inline `<code className="font-mono">` ignores parent truncation inside flex containers.
- **File:** `src/components/ui/content-card.tsx`
- **Action:** Ensure `<p className="min-w-0 flex-1 truncate text-xs text-zinc-500">` has proper flex clipping, and add `truncate inline-block max-w-full align-bottom` to the nested `<code>` tag.
- **Acceptance Criteria:** Long paths like `src/services/api/middleware/auth.ts` truncate cleanly with an ellipsis without bursting out of the card box.

### Task 2.3: Enforce the 12px Typography Floor
- **Problem:** Sub-12px styles (`text-[10px]`, `text-[11px]`) violate the craft floor typography scale (`DESIGN.md` label minimum is 12px / 0.75rem).
- **Files:** `src/components/prompts/prompt-eyebrow.tsx`, `src/components/prompts/prompt-card.tsx`
- **Action:** Upgrade `text-[10px]` and `text-[11px]` to `text-xs` (12px), adjusting padding/line-height (`py-0.5 px-2`) to maintain compact visual balance.
- **Acceptance Criteria:** No font size below 12px (`text-xs`) appears in prompt card elements.

### Task 2.4: Fix Sidebar Count-Badge Contrast (WCAG AA)
- **Problem:** Inactive category badges use `text-zinc-500` on `bg-zinc-100`, yielding a 4.4:1 contrast ratio, slightly below the 4.5:1 AA standard.
- **File:** `src/components/prompts/category-sidebar.tsx`
- **Action:** Update badge style to `text-zinc-600 dark:text-zinc-400` on `bg-zinc-200/60 dark:bg-zinc-800`.
- **Acceptance Criteria:** Contrast ratio of inactive sidebar counter badges is ≥ 4.5:1.

---

## Stream 3: Performance & State Memoization (COMPLETED)

- [x] **Task 3.1: Stabilize Grid Keyboard Navigation Listeners**: Fixed in `src/hooks/useGridKeyboardNav.ts` using ref stabilization.
- [x] **Task 3.2: Memoize Variable Extraction**: Fixed in `src/components/prompts/prompt-card.tsx` using `useMemo`.

---

## Verification Plan

1. **Automated Checks:**
   ```bash
   npm run typecheck
   npm run lint
   ```
2. **Impeccable Re-evaluations:**
   ```bash
   /impeccable audit src/components/prompts/prompts-page.tsx
   /impeccable critique src/components/prompts/prompts-page.tsx
   ```
   *Expected result: Audit score increases from 16/20 to 19+/20; all critique items resolved.*
