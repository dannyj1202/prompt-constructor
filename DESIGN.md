---
name: Prompt Constructor
description: A fast-access, personal prompt library for Almosafer engineering conventions.
colors:
  signal-indigo: "#4f46e5"
  signal-indigo-hover: "#6366f1"
  canvas: "#090a0c"
  canvas-card: "#111215"
  canvas-inset: "#0c0d0f"
  neutral-bg: "#f4f4f5"
  neutral-text: "#18181b"
  neutral-text-dark: "#f4f4f5"
  emerald: "#10b981"
  violet: "#8b5cf6"
  amber: "#f59e0b"
  cyan: "#06b6d4"
  pink: "#ec4899"
  sky: "#0ea5e9"
  rose: "#f43f5e"
  lime: "#84cc16"
  danger-red: "#dc2626"
typography:
  heading:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    letterSpacing: "0.02em"
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "24px"
  3xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.signal-indigo}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "6px 12px"
  button-primary-hover:
    backgroundColor: "{colors.signal-indigo-hover}"
  button-secondary:
    backgroundColor: "#ffffff"
    textColor: "#3f3f46"
    rounded: "{rounded.md}"
    padding: "6px 12px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "#71717a"
    rounded: "{rounded.md}"
    padding: "6px 12px"
  tag-pill:
    backgroundColor: "transparent"
    textColor: "#52525b"
    rounded: "{rounded.sm}"
    padding: "2px 6px"
  tag-pill-active:
    backgroundColor: "{colors.signal-indigo}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "2px 6px"
  card:
    backgroundColor: "#ffffff"
    rounded: "{rounded.lg}"
    padding: "{spacing.xl}"
---

# Design System: Prompt Constructor

## Overview

**Creative North Star: "The Obsidian Canvas"**

Quiet and confident: a dark, layered workspace for engineers who want to find a prompt and copy it, not admire the chrome. The canvas is genuinely dark (`#090a0c`), not a tinted grey, with a faint dot-matrix texture underneath so it reads as a precision surface rather than a flat void. Depth comes from stacking three surface tones — canvas, card, inset — and 1px border highlights, not from decorative shadows or gradient blobs. Color is spent deliberately: Signal Indigo carries every primary action and active state, category accents (emerald, violet, amber, cyan, pink, sky, rose, lime) each own exactly one category's identity, and everything else stays neutral zinc. The one moment of overt craft is the cursor-tracking spotlight glow on cards and the liquid-metal header badge — both purposeful accents on an otherwise restrained surface, not a running motif.

**Key Characteristics:**
- Dark-first obsidian canvas with light-mode as a first-class mirror, not an afterthought
- Tonal layering (three surface depths + hairline borders) instead of shadows in dark mode
- One accent color for interaction (Signal Indigo), category color reserved strictly for category identity
- Tactile, mechanical feedback on every press: translate, glow, or state-morph, never a static hover
- Density over decoration: this is a browse-and-copy tool, not a marketing surface

## Colors

The palette is restrained: one interactive accent, eight category identity colors, and a dark-first neutral scale that mirrors cleanly to light.

### Primary
- **Signal Indigo** (`#4f46e5` / `indigo-600`): The system's only interactive accent. Used for primary buttons, active nav/category/tag states, focus-visible outlines and rings, links, and the cursor-tracking spotlight glow on cards. Hover state lightens to `#6366f1` (`indigo-500`).

### Secondary (category identity — one color per category, never reused elsewhere)
- **Emerald** (`#10b981`): Onboarding & Setup
- **Violet** (`#8b5cf6`): Git & PR Workflow
- **Amber** (`#f59e0b`): Release & Dependencies — also the system's semantic "favorite / history" color (starred prompts, edit-history badges), independent of the category use
- **Cyan** (`#06b6d4`): Code Scaffolding
- **Pink** (`#ec4899`): UI & Design System
- **Sky** (`#0ea5e9`): Content & i18n
- **Rose** (`#f43f5e`): Investigation & Debugging
- **Lime** (`#84cc16`): Analytics

### Neutral
- **Obsidian Canvas** (`#090a0c`): Dark-mode page background, under a faint radial dot-matrix texture (1px dots, 22px pitch, ~6% opacity).
- **Light Canvas** (`#f4f4f5` / `zinc-100`): Light-mode page background (same dots at ~5%), one step below the white cards so they separate without heavy shadows.
- **Canvas Card** (`#111215`): Dark-mode surface for cards, sidebar rows, and inset panels one step up from canvas.
- **Canvas Inset** (`#0c0d0f`): Dark-mode surface one step *recessed* — code previews, input wells.
- **Zinc scale** (Tailwind default `zinc-50` through `zinc-950`): borders, body text, muted text, and light-mode surfaces throughout.
- **Danger Red** (`#dc2626` / `red-600`): destructive actions only (delete buttons, delete-confirmation dialogs).

### Named Rules
**The Single Accent Rule.** Signal Indigo is the only color used to mean "interactive / primary / focused." Every other color on screen means something else specific: a category, a favorite/history state, or a destructive action. If a new element needs an accent and it isn't a primary action, reach for an existing category or semantic color before introducing indigo.

## Typography

**Body & UI Font:** Inter (with `ui-sans-serif, system-ui, sans-serif`)
**Mono Font:** JetBrains Mono (with `ui-monospace, SFMono-Regular, Menlo, monospace`)

**Character:** A plain, high-legibility system sans for every UI surface — no display face, no decorative pairing. Monospace is reserved for anything that is literally code or code-adjacent: prompt body previews, `{{VARIABLE}}` chips, source citations, keyboard hints, and version badges.

### Hierarchy
- **Heading** (600, 1.5rem/24px, tight tracking): Page titles only (`<h1>` via `PageHeading`). One per page.
- **Title** (600, 1.125rem/18px): Modal dialog titles.
- **Body** (400, 0.875rem/14px, 1.5 line-height): Descriptions, prose, form labels.
- **Card title** (600, 1rem/16px, snug leading, -0.01em): Content card titles, two sizes above body text so title and description read as distinct levels.
- **Label** (500, 0.75rem/12px, sentence case): Eyebrows, section headings ("Categories", "Tags"), badges. Section headings are muted `zinc-500`/`zinc-400`, not uppercase.
- **Micro** (500, 10–11px): Saved badge, tag counts, compact history badge. Use only for small pill/badge content, never body text.

### Named Rules
**The Mono-Means-Data Rule.** Monospace type signals "this is literal, copyable content" — prompt bodies, variable tokens, source paths, version numbers. Never use it for decorative or purely stylistic emphasis.

## Layout

Container: `max-w-7xl`, centered, `px-4` gutter, `py-8` vertical page padding. Browse pages use a two-column layout above `lg`: a `15rem` fixed sidebar + fluid content, `gap-8` between them. The sidebar is a **rail**: `sticky` at `top-28` (clears the 96px header + nav), capped at the viewport height with its own scroll, on a translucent surface with a hairline border (see Elevation). Below `lg`, the sidebar collapses to a horizontal scrolling chip row above the content — the same category buttons, just re-flowed, not a separate mobile component.

Content grids are `gap-4`, 1 column by default, 2 columns from `sm`, 3 from `xl` — mobile-first, never a fixed column count. Cards in a row stretch to equal height. The header is `sticky top-0`, translucent (`bg-white/75` / `bg-canvas/80`) with backdrop blur, stacked as: logo + search + actions row (`h-14`), then the main nav row directly beneath, both inside the same header element so they scroll away together. Above `lg` the top row is a `15rem | 1fr | auto` grid, the same first column as the browse sidebar, so the search field starts exactly where the card grid starts.

Spacing rhythm is tight and consistent: `gap-1.5`/`gap-2` inside controls, `gap-3`/`gap-4` between related elements, `gap-6`/`gap-8` between structural regions. Nothing uses ad-hoc pixel gaps outside the scale above.

## Elevation & Depth

Dark mode has no drop shadows for depth — depth is entirely tonal layering: three fixed surface tones (canvas → card → inset) plus 1px `white/7` borders that step up to `white/15` on hover. Between canvas and card sits the translucent **sidebar rail** (`white/60` light, `white/2%` dark, hairline border), so a browse page reads as four layers: dotted canvas → rail → solid card → recessed inset (code previews, the search well). Light mode is the one place real shadows appear: cards sit on a barely-there cast shadow at rest and lift to a soft, wide one on hover, on a plain white surface with `zinc-200/80` borders. Modals are an exception in both themes — as a floating overlay above a blurred scrim, a dialog always carries `shadow-2xl` regardless of theme, since "floating above the page" is a real depth relationship shadows correctly describe.

### Shadow Vocabulary
- **card-rest** (light only, `0 1px 2px rgb(24 24 27 / 0.04)`): Default card elevation in light mode.
- **card-hover** (light only, `0 10px 28px -14px rgb(24 24 27 / 0.22)`): Card elevation on hover, light mode. Wide and low-opacity, so the lift reads without a hard edge.
- **button-inset** (`inset 0 1px 0 rgba(255,255,255,0.15)`): A faint top highlight inside primary buttons, suggesting a physical bevel rather than a flat fill.
- **modal** (`shadow-2xl`, both themes): The dialog's floating-above-scrim elevation.

### Named Rules
**The Tonal-Not-Cast Rule.** In dark mode, express elevation by moving a surface to a lighter/darker layer token and brightening its border — never by adding a drop shadow. Reserve real cast shadows for light mode and for anything genuinely floating above the page (modals).

## Shapes

A small, consistent radius scale, no sharp corners anywhere: `6px` (`rounded-md`) for compact controls and icon badges, `8px` (`rounded-lg`) for buttons, inputs, and nav items, `12px` (`rounded-xl`) for cards, `16px` (`rounded-2xl`) for modals, and `9999px` (`rounded-full`) for every pill — category counts, the saved badge, the history badge. Tags are the exception: quiet `6px` text chips (see Chips). Borders are hairline throughout: `1px zinc-200` in light mode, `1px white/8` (stepping to `white/15` on hover) in dark mode. No heavy borders, no double borders, no dashed borders except the empty-state placeholder.

## Components

Buttons, cards, and inputs are sharp and mechanical: presses translate down a physical pixel, hovers step a border or surface tone rather than fading softly, and state changes (copy → copied, star toggled) morph the control's icon and color rather than just tinting it.

### Buttons
- **Shape:** `8px` radius (`rounded-lg` at the default `md` size), `6px` at the compact `sm` size (`rounded-md`).
- **Primary:** Signal Indigo fill, white text, a faint inset top highlight for bevel, `px-3 py-1.5`. Hover lightens to indigo-500; press drops the highlight and nudges the button down one pixel (`active:translate-y-px`); disabled drops to indigo at 50% opacity with no highlight.
- **Secondary:** White/`zinc-900` fill with a `zinc-200`/`zinc-700` border, same inset highlight and press behavior as primary.
- **Ghost:** No fill or border; text-only, `zinc-500`, brightens to `zinc-900`/`zinc-100` with a `zinc-100`/`zinc-800` hover fill. Used for icon-only card actions (edit, delete, history).
- **Danger:** Red-600 fill, white text; reserved for destructive confirmation actions only.
- **Card action pair (Favorite + Copy):** `StarButton` and `CopyButton` share one surface — `h-8`, `rounded-md`, `zinc-200`/`white/10` border, white/`white/3%` fill — so they sit as a matched pair in the card's meta row. State changes stay semantic: amber when starred, emerald when copied, red on copy failure.

### Chips / Tags
- **Style:** quiet text chips, not filled pills: `rounded-md`, no fill at rest, `zinc-600`/`zinc-400` text with the `#` at half opacity. A surface (`zinc-200/60` / `white/6%`) appears only on hover. A long tag list reads as a flowing index rather than a wall of grey pills.
- **Active state:** Signal Indigo fill, white text — the same active-state color as nav and category sidebar items, so "currently filtering by this" always reads the same way regardless of where the chip lives.

### Cards / Containers (Signature Component: Spotlight Card)
- **Corner Style:** `12px` (`rounded-xl`).
- **Background:** White (light) / Canvas Card `#111215` (dark).
- **Shadow Strategy:** card-rest → card-hover in light mode; border brightens `zinc-300`/`white-15` on hover in dark mode instead (see Elevation).
- **Border:** `1px zinc-200/80` / `1px white/7`.
- **Internal Padding:** `20px` (`p-5`).
- **Structure (top to bottom):** a meta row (eyebrow labels left, actions right, `h-8`), so the title gets the card's full width. Then the title (Card title type), a description with two lines reserved (so descriptions align across a row), the recessed preview well (`zinc-50`/canvas-inset with an inset hairline ring, mono, clamped to two lines with padding on the wrapper), and finally a footer separated by a hairline rule, holding the source citation and the edit/delete/history controls.
- **Signature behavior:** every browsable card (prompt, skill, taste, workflow) tracks the cursor via `--spot-x`/`--spot-y` CSS variables and renders two layered radial gradients on hover — a soft indigo flood behind the content and a 1px indigo ring masked to only the card's edge. This is the system's one recurring piece of overt polish; it is reserved for these browsable content cards and should not be copied onto unrelated surfaces (buttons, nav, modals).

### Inputs / Fields
- **Style:** `rounded-lg`, `1px zinc-200`/`zinc-700` border, white/`zinc-950` fill, `h-10` for the primary search field.
- **Focus:** Border shifts to Signal Indigo with a soft `indigo-500/20` focus ring — the same focus language as buttons' `focus-visible` outline, just rendered as a ring instead of an outline because inputs need the border itself to shift too.
- **Tag input:** Committed tags render as small indigo pills inside the field itself (`bg-indigo-50`/`indigo-950`), each with its own remove button — the field grows to contain them rather than truncating.

### Navigation
- **Main nav:** Underline tabs, not pills — sections should read differently from filters. Each tab is a text link; the active one gets a `2px` Signal Indigo bar sitting on the header's bottom rule (`-mb-px`), and hovering an inactive tab shows a neutral bar. Focus uses an inset outline. On narrow screens the row scrolls, with a fade at the right edge to show there's more.
- **Category sidebar:** Each row pairs a small (`24px`) icon in that category's accent color with the label and a count. At rest the icon is just the colored glyph and the count is plain muted text. The active row tints its whole background to the category's accent, and only then does the icon get its tinted tile and the count its pill. Rows with zero matches dim to 50% opacity rather than disappearing, so the category list stays a stable, complete map of the taxonomy. Tags sit below a hairline rule inside the same rail.

### Theme toggle
- **Placement:** Header actions, before MCP. Three icon buttons (Light, Dark, System) in one recessed well, the same inset surface as the search field. System is the default.
- **State:** The chosen option is a raised segment (white / `white/10`) with its icon in Signal Indigo; the others are muted icons that brighten on hover. Each button has `aria-pressed` and an inset focus outline.
- **Mechanism:** Dark styles key off a `.dark` class on `<html>` (Tailwind `@custom-variant`), not the OS media query. `src/lib/theme.ts` owns the preference (stored in localStorage, synced across tabs) and follows OS changes while on System. An inline script in `index.html` applies it before first paint, so there's no flash of the wrong theme.

### Modal
- **Shape:** Native `<dialog>` element (free focus trap, Escape-to-close, top-layer stacking), `rounded-2xl`, `shadow-2xl`, centered via `m-auto`.
- **Backdrop:** `zinc-950/50` scrim with backdrop blur, in both themes.
- **Structure:** Header (title + optional eyebrow/description + close button) — scrollable body — footer, each separated by a hairline border, never by whitespace alone.

### Badges (Saved / History)
- **Saved badge:** Micro pill (`10px`, uppercase, bold tracking), amber fill, marks any user-created prompt wherever it appears.
- **History badge:** Micro mono pill, amber outline + tinted fill, shows the current version number; becomes a button when history exists, with the same press-down feedback as other buttons.

## Do's and Don'ts

### Do:
- **Do** use Signal Indigo only for primary/interactive meaning (actions, active states, focus) — never as a decorative fill.
- **Do** express dark-mode depth by moving a surface between the three layer tokens (canvas / canvas-card / canvas-inset) plus a border-brightness step, not a shadow.
- **Do** give every interactive control a visible `focus-visible` treatment (outline or ring in Signal Indigo) — buttons, links, nav items, tags, and inputs all already do this; new controls must match.
- **Do** give pressed buttons a one-pixel downward nudge (`active:translate-y-px`) and drop any inset highlight on press, so pressing reads as physically real.
- **Do** keep one category accent color per category, applied consistently to its icon badge, active background, and count pill together — never split a category's identity across two colors.

### Don't:
- **Don't** add drop shadows for dark-mode depth; the system's entire dark elevation model is tonal layering + borders, and a shadow there will look like a mistake, not a design choice.
- **Don't** introduce a new hue outside the established set (Signal Indigo, the 8 category accents, amber-as-semantic, red-as-danger) without a specific semantic reason — this palette is deliberately closed.
- **Don't** apply the cursor-tracking spotlight glow to anything other than browsable content cards; it's a signature reserved for that one component, not a general-purpose hover effect.
- **Don't** let a hover state be the only feedback on something clickable — pair it with a `focus-visible` state and, for buttons, a press state; static hover-only interactivity breaks the "tactile and mechanical" component philosophy.
