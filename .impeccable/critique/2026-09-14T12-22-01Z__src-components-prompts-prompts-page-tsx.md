---
target: src/components/prompts/prompts-page.tsx
total_score: 26
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:/Users/dj/Desktop/PROJECTS/prompt-constructor/src/components/prompts/prompts-page.tsx"
target_fingerprint: "sha256:088e7c7403dcc9ea84858641206b8a9882905d58f656c748c9778c9d07b3049d"
target_path: /Users/dj/Desktop/PROJECTS/prompt-constructor/src/components/prompts/prompts-page.tsx
timestamp: 2026-09-14T12-22-01Z
slug: src-components-prompts-prompts-page-tsx
closed: true
---
Method: dual-agent (A: general-purpose design-review agent · B: general-purpose detector/browser-evidence agent)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3/4 | Keyboard-`c` copy only surfaces a generic bottom toast with no per-card confirmation of *which* card fired, unlike mouse-click copy, which morphs that button locally. |
| 2 | Match System / Real World | 4/4 | Category names, `[VARIABLE]` chips, and "Source: AGENTS.md § ..." citations speak the target engineer's own vocabulary. |
| 3 | User Control and Freedom | 3/4 | Tag-chip removal and "Clear filters" exist, but `clearFilters` navigates with `{ replace: true }`, so Back cannot undo a clear. |
| 4 | Consistency and Standards | 2/4 | Category identity color is split: sidebar uses each category's own accent, but every card's eyebrow hardcodes Signal Indigo (`prompt-eyebrow.tsx:18`) — the exact split DESIGN.md's Named Rule forbids. |
| 5 | Error Prevention | 3/4 | Delete just fires a callback here; the real confirmation guard lives in a dialog outside this file, so scored provisionally. |
| 6 | Recognition Rather Than Recall | 2/4 | Full keyboard grid-nav (arrows/j-k/Enter/c) exists with zero on-page hint; icon-only actions rely on hover-only tooltips. |
| 7 | Flexibility and Efficiency | 3/4 | Real accelerators (URL-driven filter state, live grid-nav while search has focus), capped by zero shortcut discoverability and no bulk copy. |
| 8 | Aesthetic and Minimalist Design | 2/4 | Lowered from the design-review agent's initial 3/4 after the detector's live evidence: a confirmed text-overflow defect on nearly every card's source line, plus a real sub-AA contrast failure on sidebar count badges. |
| 9 | Error Recovery | 3/4 | The empty state's "Clear filters" action is plain-language and actionable, but doesn't name which active filter (search/category/tag/starred) is actually the blocker. |
| 10 | Help and Documentation | 1/4 | The only discoverability aid anywhere is the "/" hint chip in the search box; grid-keyboard-nav, tag syntax, and `[VARIABLE]` chip meaning are undocumented in the UI. |
| **Total** | | **26/40** | **Acceptable** |

## Design Specificity Verdict

**Partially specific, undercut in the one place users scan most.** The category-color taxonomy, the Signal Indigo single-accent rule, the spotlight card, and the density-first browse layout are all genuinely present in source and confirmed live (colored icon badges per category, count pills, hairline borders, the cursor-tracking glow). But the card itself — what gets scanned 24-at-a-time — labels its category in hardcoded indigo (`prompt-eyebrow.tsx:18`) instead of that category's own accent, reusing DESIGN.md's one reserved "interactive only" color as decoration. Strip that label's color and the grid reads as a generic, could-be-any-prompt-library composition.

**Deterministic scan**: `impeccable detect` on the single target file returned 0 findings (too narrow); scanning the composed tree (`prompts/`, `ui/`, `layout/`) surfaced 5 static findings, all advisory: a recurring `text-[10px]`/`text-[11px]` micro-type habit across `prompt-card.tsx`, `prompt-eyebrow.tsx`, and `search-input.tsx` (one systemic pattern, not five isolated ones), plus one `#000` flagged in `content-card.tsx:73` inside a `WebkitMask` border-glow trick — a static-analysis false positive, since that value never renders as a visible color.

**Visual overlays**: Live in-page detection (`window.impeccableDetect()`, 83 elements / 84 findings on `#/prompts`) corroborated the micro-type finding (23 elements below an 11px usability floor) and surfaced two real defects invisible to the static scan: a `text-overflow` cluster on 23 of 24 cards' "Source: ..." citation line (overflowing its box by 21–115px despite a `truncate` class), and a `low-contrast` cluster on the sidebar's category count badges (`#71717b` on `#f4f4f5` = 4.4:1, just under the 4.5:1 AA floor). The 24 flagged "radial-spotlight-glow" hits and the page-level "overused-font" (Inter, 92%) flag are both intentional per DESIGN.md and should be treated as false positives, not defects.

## Overall Impression

The information architecture and interaction model are genuinely good — URL-persisted filters, a keyboard grid-nav that coexists with search, sidebar counts that don't lie about other categories — but two things undercut it: a real, cross-tool-confirmed layout bug (source citations overflowing their box on almost every card) that no one caught before this pass, and a design-system rule the project wrote for itself in DESIGN.md that its own card component doesn't follow (category color). The single biggest opportunity is making the tool's own headline trait — keyboard-first, fast-access — actually discoverable; right now its best feature is invisible.

## What's Working

1. **Filter state lives entirely in the URL** (`route.params`/`updateParams`), making every filtered view bookmarkable, shareable, and refresh-safe — directly supports User Control, Flexibility, and Error Recovery at once.
2. **Sidebar counts deliberately ignore the selected category** (`matchesInAnyCategory` computed with `category: null`, with an explicit code comment explaining why) — avoids the common faceted-search trap where unselected categories collapse to misleading zero counts.
3. **Keyboard grid navigation coexists with the search box** — arrows/Enter still drive the grid while the search input has focus, a deliberate Raycast/Linear-style detail that meaningfully speeds up a power user's exact workflow, once found.

## Priority Issues

**[P1] Source citations overflow their box on nearly every card**
- **Why it matters**: Confirmed live via rendered DOM inspection — the `Source: AGENTS.md § ...` line (`content-card.tsx`, the `truncate`-classed `<p>`) overflows its container by 21–115px on 23 of 24 cards. This is a real, visible layout defect at default grid scale, not a hypothetical.
- **Fix**: The `truncate` class needs a bounded width to clip against; check that `min-w-0` actually reaches this flex child (the row's other elements — `footer`/actions — may be consuming the available width first) and add an explicit `max-w` or better flex-basis handling.
- **Suggested command**: `/impeccable layout`

**[P1] Category identity color never reaches the card grid**
- **Why it matters**: `prompt-eyebrow.tsx:18` hardcodes `text-indigo-600 dark:text-indigo-400` for every category label regardless of `CATEGORY_BY_ID[prompt.category].accent`. This breaks DESIGN.md's own Named Rule (one color per category, consistent everywhere) and spends the system's one reserved interactive color as decoration, on the exact surface — the card — that users scan most.
- **Fix**: Replace the hardcoded indigo with a lookup into the sidebar's existing accent-to-text-color mapping, keyed by `prompt.category`.
- **Suggested command**: `/impeccable polish`

**[P1] Keyboard grid-nav is undiscoverable and has no assistive-tech parity**
- **Why it matters**: Arrows/j-k/Enter/c work (`useGridKeyboardNav.ts`) but nothing on the page hints they exist, and the "highlighted" card is a virtual index, never real DOM focus — a screen-reader/Tab user never lands on it. This is the single feature most aligned with the tool's own keyboard-first positioning, yet it's invisible to the exact power user it's built for, and absent for anyone using assistive tech.
- **Fix**: Add a small persistent shortcut hint near the search bar, and call `.focus()` on the highlighted element so Tab-order and arrow-highlight converge.
- **Suggested command**: `/impeccable harden`

**[P2] Systemic micro-type below a usable floor**
- **Why it matters**: Cross-verified by both the static detector (5 hits) and the live scan (23 elements): `text-[10px]`/`text-[11px]` recurs across variable-placeholder pills, the version badge, the category eyebrow, and the search shortcut hint — all off DESIGN.md's own type ramp, and several are functional/informational text, not decorative micro-labels.
- **Fix**: Raise these to the documented 12px Label size, reserving sub-12px only for genuinely decorative badge content.
- **Suggested command**: `/impeccable typeset`

**[P2] Sidebar category counts fail contrast AA**
- **Why it matters**: Live computed styles measure `#71717b` text on `#f4f4f5` background at 4.4:1 — just under the 4.5:1 AA minimum for normal text. Small, but a real WCAG failure on an element present on every browse page.
- **Fix**: Darken the inactive count-badge text a step (e.g. to `zinc-600`/`#52525b`, which the same file already uses for active-state counts) to clear 4.5:1.
- **Suggested command**: `/impeccable harden`

## Persona Red Flags

**Alex (Power User)** — primary action: find and copy a specific convention prompt via keyboard only.
- Full grid keyboard nav exists but is never surfaced anywhere in the UI — Alex has no way to learn it exists short of reading source.
- No bulk/multi-select copy: copying several related prompts means clicking each card's Copy button individually, one at a time.
- Genuine win: URL-encoded filter state means Alex can bookmark "Git & PR Workflow + #conflicts" as a saved shortcut — this already works today.

**Sam (Accessibility-Dependent)** — primary action: navigate categories and copy a prompt keyboard/screen-reader-only.
- `StarButton`'s aria-label (`star-button.tsx:20`) has no per-prompt identifier — 24 identical "Add to favorites, button" announcements with no way to disambiguate, unlike Edit/Delete which correctly interpolate the title.
- The keyboard-highlight ring is driven by a virtual index, not real focus — Tab-order and the arrow-key "highlighted" state are two disconnected systems; a screen reader never announces the highlighted card at all.
- Newly confirmed: sidebar count badges sit under the 4.5:1 AA contrast floor (4.4:1) — a real, measurable barrier, not a subjective one.
- Positive: every interactive element does carry a `focus-visible` treatment, and Edit/Delete/History icon buttons do have correct, item-specific aria-labels.

**Riley (Stress Tester)** — edge cases: zero results, very long titles, overflowing content, small viewports.
- Newly confirmed via live rendering: the source-citation line overflows its box on 23 of 24 cards — a real defect Riley would find immediately by using the app with real (non-trivial-length) content.
- `ContentCard`'s title has no truncation/clamp unlike its description sibling — an unusually long real prompt title will stretch its entire grid row taller than its neighbors.
- Zero-match empty state is generic ("No prompts match your filters") with a single escape hatch but no indication of which filter is actually excluding results.
- At 390px, the top nav row and the category-chip row both run off the right edge with no visible scroll affordance ("Tags" renders as "Ta", a category chip as "Or") — confirmed by screenshot, not just theory.

## Minor Observations

- `TagList` in the sidebar is hidden below `lg` (`className="hidden lg:block"`), so mobile users lose tag-based filtering except by typing `#tagname` into search.
- Category-select and Favorites-toggle silently reset each other with no UI explanation for why a user's category choice disappeared when they toggled Favorites.
- Per-card action density (up to 6 simultaneous affordances: open, star, copy, tags, edit, delete/history) exceeds the cognitive-load checklist's "≤4 visible options" guidance at grid scale; folding Edit/Delete/History into a single overflow control would help.
- Mouse-click copy (button morph) and keyboard-`c` copy (bottom toast) are two different confirmation modalities for the same action depending on input method — not wrong, but worth a deliberate look.
- Two detector flags are intentional, not defects: the 24 "radial-spotlight-glow" hits (the documented signature card interaction) and the page-level "overused-font" flag (Inter is meant to be the only UI face).
- A `net::ERR_ABORTED …/__mcp/saved-prompts` request observed live is a benign dev-only MCP-sync probe, not a page bug.

## Questions to Consider

1. If category color is this system's one deliberate taxonomy signal, why does the surface users scan 24-at-a-time render every category label in the same indigo instead of its own accent?
2. This tool's entire premise is "keyboard-first, fast-access" — so why does its actual keyboard system behave like a hidden feature instead of the headline one?
3. The per-card control density and today's placeholder content both look fine at ~24 cards — what does this grid look like once real Almosafer content (and presumably many more prompts) lands?
