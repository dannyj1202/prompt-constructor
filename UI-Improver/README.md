# UI-Improver: Modern Aesthetics & Component Architecture Plan

> **Design Goal:** Elevate **Prompt Constructor** from a standard card grid into a high-taste, tactile developer tool (inspired by Linear, Raycast, and Zed) while avoiding generic "vibecoded AI slop".

---

## 1. Core Philosophy: Why Most AI UIs Look Like "Slop" vs. What We Will Build

| "AI Slop" Trait | The Craft Standard We Are Implementing |
|---|---|
| Random purple/cyan gradient blobs with no purpose | Purposeful lighting: Dark obsidian canvas, fine 1px border highlights, ambient dot-matrix depth |
| Chopped-off raw `<pre>` walls inside cards | Structured card previews, highlighted variable pills, and dedicated code inspection windows |
| Flat, indistinguishable grey boxes (`zinc-900`/`zinc-800`) | Layered elevation: canvas (`#090a0c`), cards (`#111215`), insets (`#0c0d0f`), and category tints |
| Generic hover states with no tactile feel | Spotlight cards (mouse-following border glows), crisp micro-interactions, and instant feedback |
| Static text dump | **True "Constructor" UX:** Dynamic template variable replacement (`{{TICKET_ID}}`) before copying |

---

## 2. Component & Reference Mapping Matrix

Here is how each library and resource is mapped to specific parts of Prompt Constructor:

```
┌────────────────────────────────────────────────────────────────────────┐
│  HEADER: Liquid Metal Accent (metal-fx) + Raycast Search (Command-K)   │
├───────────────────┬────────────────────────────────────────────────────┤
│  SIDEBAR:         │  GRID / CANVAS: DotMatrix Ambient Background       │
│  Axis CRM Style   │  ┌────────────────────────┐┌─────────────────────┐ │
│  - Active pills   │  │ Skiper Spotlight Card  ││ Skiper Spotlight   │ │
│  - Category icons │  │ - Hover radial border  ││ Card               │ │
│  - Live badges    │  │ - Variable token chips ││                     │ │
│  - Keyboard hints │  │ - Watermelon Copy btn  ││                     │ │
│                   │  └────────────────────────┘└─────────────────────┘ │
└───────────────────┴────────────────────────────────────────────────────┘
│  MODAL: Cult UI Dynamic Variable Inputs & Live Prompt Assembly         │
└────────────────────────────────────────────────────────────────────────┘
```

### 1. Liquid Metal (`metal-fx` / https://metal.jakubantalik.com/)
- **Where to use:** The application logo/badge in the header, or a subtle ambient light orb behind the search hero.
- **Why:** Adds fluid, iridescent refraction that feels tactile and futuristic.
- **Guardrail:** Use as an accent shader only. Do not cover the entire viewport; pause the WebGL render loop if off-screen or in battery saver mode to keep performance at 60fps.

### 2. StyleUI Axis CRM Layout (https://www.styleui.dev/template/axis)
- **Where to use:** The overall dashboard rhythm, category sidebar, and statistics banner.
- **Why:** Axis excels at clean information density, subtle borders, high-contrast typography, and structured navigation without visual clutter.
- **Key Elements to Borrow:**
  - Segmented category tabs with micro-counters.
  - Active indicator pill with smooth layout transitions.
  - Filter summary bar showing matches and clear triggers.

### 3. Skiper UI Spotlight Cards (https://skiper-ui.com/components?source=free)
- **Where to use:** [src/components/prompts/prompt-card.tsx](file:///Users/daniel.varghese/Desktop/prompt-constructor-capstone/prompt-constructor/src/components/prompts/prompt-card.tsx).
- **Why:** Cards feature a cursor-tracking radial spotlight border that lights up on mouse move, giving cards depth and physical presence without loud colors.

### 4. Watermelon UI Micro-Components (https://ui.watermelon.sh/home)
- **Where to use:** [src/components/prompts/copy-button.tsx](file:///Users/daniel.varghese/Desktop/prompt-constructor-capstone/prompt-constructor/src/components/prompts/copy-button.tsx) and interactive tag badges.
- **Why:** Tactile copy button with state transitions (idle → copying → copied checkmark) and micro-spring animations.

### 5. Cult UI Variable Constructor Inputs (https://www.cult-ui.com/docs/installation)
- **Where to use:** [src/components/prompts/prompt-detail-dialog.tsx](file:///Users/daniel.varghese/Desktop/prompt-constructor-capstone/prompt-constructor/src/components/prompts/prompt-detail-dialog.tsx).
- **Why:** In the modal, parse all `{{VARIABLE}}` placeholders and render kinetic, glowing input fields. Devs can type in values (e.g. `TICKET_ID: "PROJ-402"`) and watch the prompt update live before copying.

### 6. DotMatrix Ambient Backdrop (https://dotmatrix.zzzzshawn.cloud/)
- **Where to use:** Background overlay behind the grid and header.
- **Why:** Subtle, low-opacity dot-matrix pattern that eliminates flat canvas syndrome and gives a precision engineering aesthetic.

### 7. VoltAgent Awesome Design MD (https://github.com/VoltAgent/awesome-design-md)
- **Where to use:** Design tokens, spacing scales, and agent prompting rules.
- **Why:** Ensures AI agents follow strict typography scale, consistent border radius, and contrast standards rather than hallucinating ad-hoc utility classes.

---

## 3. Technical Compatibility Strategy (React 19 + Tailwind v4 + Vite)

> [!IMPORTANT]
> **Avoid CLI Bloat:** Do not run `bunx --bun shadcn@latest` or `pnpm dlx shadcn@latest init` directly inside this project without caution, as automated CLIs can overwrite `vite.config.ts`, break Tailwind v4 CSS imports, or conflict with React 19.

### Recommended Approach:
1. **Component Porting:** Port component code directly into `src/components/ui/` as clean, standalone TypeScript/React files.
2. **Animation Engine:** Use `motion` (the new, official lightweight package for Framer Motion with full React 19 support) or pure CSS keyframes where possible.
3. **Icons:** Use `lucide-react` for crisp developer icons.
4. **Utility helpers:** Ensure `clsx` and `tailwind-merge` are configured via [src/lib/cn.ts](file:///Users/daniel.varghese/Desktop/prompt-constructor-capstone/prompt-constructor/src/lib/cn.ts).

---

## 4. Phase-by-Phase Implementation Roadmap for Claude Code

### Phase 1: Canvas & Visual Foundation
- Add **Geist Sans** and **Geist Mono** / **JetBrains Mono** fonts.
- Implement **DotMatrix** subtle background mask in [src/index.css](file:///Users/daniel.varghese/Desktop/prompt-constructor-capstone/prompt-constructor/src/index.css) and [src/App.tsx](file:///Users/daniel.varghese/Desktop/prompt-constructor-capstone/prompt-constructor/src/App.tsx).
- Define theme surface tokens: canvas `#090a0c`, card `#111215`, border `white/8`.

### Phase 2: Category Visual Identity & Axis Sidebar
- Assign bespoke icons and subtle color accents (amber, rose, cyan, emerald, etc.) to all 8 categories in [src/data/categories.ts](file:///Users/daniel.varghese/Desktop/prompt-constructor-capstone/prompt-constructor/src/data/categories.ts).
- Refactor [src/components/prompts/category-sidebar.tsx](file:///Users/daniel.varghese/Desktop/prompt-constructor-capstone/prompt-constructor/src/components/prompts/category-sidebar.tsx) with Axis-style active pills and counter badges.

### Phase 3: Spotlight Prompt Cards (Skiper UI Style)
- Enhance [src/components/prompts/prompt-card.tsx](file:///Users/daniel.varghese/Desktop/prompt-constructor-capstone/prompt-constructor/src/components/prompts/prompt-card.tsx):
  - Mouse-tracking radial border glow.
  - Replace raw `<pre>` with a clean 2-line preview and variable chips (`[TICKET_ID]`).
  - Add quick-copy hover button with tactile state.

### Phase 4: Interactive Constructor Dialog (Cult UI Variable Replacement)
- In [src/components/prompts/prompt-detail-dialog.tsx](file:///Users/daniel.varghese/Desktop/prompt-constructor-capstone/prompt-constructor/src/components/prompts/prompt-detail-dialog.tsx):
  - Auto-parse all `{{...}}` tokens from prompt body.
  - Display an input drawer allowing users to fill variables interactively.
  - Render prompt preview with dynamic token replacement and syntax highlighting.
  - "Copy Configured Prompt" button that copies the prepared text.

### Phase 5: Liquid Metal Accent & Keyboard Navigation (Raycast / Linear Style)
- Install `metal-fx` (`npm install metal-fx`) and create a sleek interactive header logo / ambient beam in [src/components/layout/header.tsx](file:///Users/daniel.varghese/Desktop/prompt-constructor-capstone/prompt-constructor/src/components/layout/header.tsx).
- Add keyboard shortcuts: `Cmd+K` for search, arrow keys for grid selection, `Cmd+C` to quick-copy selected card.

---

## 5. Verification & Guardrails

At every step of implementation, Claude Code must run:
```bash
npm run typecheck   # tsc -b
npm run lint        # oxlint
```
Ensure that no backend, authentication, or outside API dependencies are introduced, preserving the offline-first, client-side architecture.
