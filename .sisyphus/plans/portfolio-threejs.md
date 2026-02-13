# Creative Three.js Portfolio — merckel.dev

## TL;DR

> **Quick Summary**: Build a creative, explorable developer portfolio with a persistent 3D animated background (floating purple geometric shapes with bloom) on desktop, a clean responsive Tailwind fallback on mobile, and interactive features (command palette, custom cursor, Easter eggs) that reward curiosity — all while maintaining business professionalism.
>
> **Deliverables**:
>
> - 8-section single-page portfolio (Hero, Who Am I, Tools, Projects, Experience, Open Source, Testimonials, Contact)
> - Threlte 8 Three.js background layer (desktop only) with floating abstract geometry + bloom
> - Mobile-first responsive Tailwind layout (no 3D)
> - Command palette (Cmd+K) with hidden terminal commands
> - Custom animated cursor (desktop)
> - 4 Easter eggs (Konami code, terminal secrets, hover reveals, click tracker)
> - Contact form with backend API route
> - Live GitHub API integration
> - Full TDD test suite (Vitest + Playwright)
>
> **Estimated Effort**: XL (3 phases, ~20 tasks)
> **Parallel Execution**: YES — 3 waves per phase
> **Critical Path**: Foundation → Visual Layer → Interactive Polish

---

## Context

### Original Request

Build a creative, disruptive portfolio using Three.js for desktop (normal page on mobile). Inspired by dvlpr.pro (dark theme, 3D floating shapes, immersive) and brittanychiang.com (split-panel, clean, professional). Must have sections: Tools, Projects, Who Am I. Should make visitors want to explore more while remaining business professional.

### Interview Summary

**Key Discussions**:

- **3D Concept**: Persistent animated 3D background with floating abstract geometric shapes (polyhedra with bloom/glow), 2D content overlaid. Desktop only.
- **Sections**: 8 total — Hero, Who Am I, Tools, Projects, Experience/Timeline, Open Source/GitHub, Testimonials, Contact (form + social links)
- **Color/Mood**: Dark theme (slate-900 base) + Purple/Violet accent (#8b5cf6)
- **Typography**: Space Grotesk (headings/body) + JetBrains Mono (code/monospace)
- **Interactive Features**: Custom animated cursor, GSAP page transitions, Command palette (Cmd+K), Easter eggs (all 4 types)
- **Test Strategy**: TDD (RED → GREEN → REFACTOR)
- **Content**: Placeholder with TypeScript schemas — user fills in later
- **Deployment**: Self-hosted VPS with existing adapter-node
- **GitHub**: Live API data (server-side fetching with cache)

**Research Findings**:

- **Threlte 8**: Production-ready for Svelte 5. Uses `<T>` declarative components, `useTask` for frame loops, `useScroll` for scroll linking. SSR-safe with `{#if browser}` guards.
- **GSAP**: Now 100% free (v3.13+). Canonical Svelte 5 pattern: `$effect(() => { let ctx = gsap.context(...); return () => ctx.revert(); })`. Must call `ScrollTrigger.refresh()` in `afterNavigate`.
- **Custom Cursor**: Must use `gsap.quickSetter` (NOT `$state`) — reactivity at 60fps kills performance.
- **Tailwind v4**: Uses CSS `@theme {}` directive for design tokens, NOT a JS config file.
- **Brittany Chiang patterns**: Split-panel layout, hover opacity cascade, tech tags, nav indicators, spotlight cursor.
- **dvlpr.pro patterns**: Floating 3D shapes, section indicators, dark immersive feel, scroll prompt.

### Metis Review

**Identified Gaps** (addressed):

- **Scope phasing**: Plan must phase into Foundation → Visual → Polish to prevent scope explosion. ✅ Implemented.
- **SSR safety**: All 3D components must be guarded with `{#if browser}`. ✅ Added to every relevant task.
- **Custom cursor perf**: Use `gsap.quickSetter`, not `$state`. ✅ Added as guardrail.
- **Tailwind v4 syntax**: No JS config — use `@theme {}` CSS directive. ✅ Reflected in all styling tasks.
- **SEO/meta**: OG tags, sitemap, JSON-LD needed. ✅ Added as task.
- **Loading states**: 3D init + GitHub fetch need skeleton/loading UX. ✅ Added to relevant tasks.
- **Error boundaries**: WebGL failure, API failure need graceful degradation. ✅ Added.
- **Font loading**: Self-host via `@fontsource` (no GDPR issues). ✅ Added.
- **Package manager**: Must use `bun` (not npm). ✅ All commands use bun.
- **Performance budget**: Lighthouse ≥90 on mobile (no 3D). ✅ Added to success criteria.

---

## Work Objectives

### Core Objective

Build a premium, explorable developer portfolio that combines immersive 3D visuals (desktop) with clean professional content, rewarding curiosity through hidden features and micro-interactions.

### Concrete Deliverables

- Single-page SvelteKit portfolio at merckel.dev
- 8 content sections with TypeScript-typed placeholder data
- Threlte 8 3D background (floating purple geometry + bloom)
- GSAP scroll-triggered section animations
- Custom animated cursor (desktop)
- Command palette with hidden terminal commands
- 4 Easter eggs
- Contact form API route
- Live GitHub stats integration
- Full TDD test suite

### Definition of Done

- [x] `bun run build` succeeds without errors (SSR safe)
- [x] `bun run test:unit -- --run` — all tests pass
- [x] `bun run test:e2e` — all Playwright tests pass
- [x] Desktop (1280x800): 3D canvas renders, all sections visible, interactions work
- [x] Mobile (375x812): No canvas element, all sections visible, responsive layout
- [x] Lighthouse Performance ≥90 (mobile, without 3D)
- [x] Zero critical accessibility violations (axe-core)

### Must Have

- All 8 sections with placeholder content
- 3D background on desktop, no 3D on mobile
- Dark theme with purple accent
- Space Grotesk + JetBrains Mono typography
- Command palette (Cmd+K)
- Contact form (functional)
- GitHub live stats
- Custom cursor (desktop)
- At least basic Easter egg implementation
- OG meta tags for social sharing
- `prefers-reduced-motion` support
- SSR-safe rendering

### Must NOT Have (Guardrails)

- ❌ Blog/Writing section (explicitly excluded)
- ❌ Resume/CV download (explicitly excluded)
- ❌ Sound design (explicitly excluded)
- ❌ Spotlight cursor effect (explicitly excluded)
- ❌ Interactive/clickable 3D objects — background only, subtle scroll-reactive
- ❌ `$state` for high-frequency DOM updates (cursor, parallax, scroll position) — use `gsap.quickSetter`
- ❌ Client-side GitHub API calls (exposes token) — server-side `load()` with TTL cache only
- ❌ Custom command palette from scratch — use `cmdk-sv` or minimal dialog+search
- ❌ Over-engineered Easter eggs (each ≤50 lines of code)
- ❌ Database or complex backend — static content + API routes only
- ❌ Legacy Svelte syntax (`$:`, stores) — Svelte 5 runes only (`$state`, `$derived`, `$effect`, `$props`)
- ❌ Tailwind JS config file — use Tailwind v4 CSS `@theme {}` directive
- ❌ npm/pnpm commands — use `bun` exclusively

---

## Verification Strategy

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks are verifiable WITHOUT any human action.
> ALL verification is executed by the agent using tools (Playwright, Bash, curl, etc.).

### Test Decision

- **Infrastructure exists**: YES (Vitest + Playwright already configured)
- **Automated tests**: TDD (RED → GREEN → REFACTOR)
- **Framework**: Vitest (unit/component) + Playwright (E2E)
- **Test command**: `bun run test:unit -- --run` and `bun run test:e2e`

### TDD Workflow Per Task

1. **RED**: Write failing test first → `bun run test:unit -- --run` → FAIL
2. **GREEN**: Implement minimum code to pass → `bun run test:unit -- --run` → PASS
3. **REFACTOR**: Clean up while keeping green → `bun run test:unit -- --run` → PASS

### Agent-Executed QA Scenarios (MANDATORY — ALL tasks)

Every task includes Playwright or Bash verification scenarios. No human testing.

**Verification Tool by Type:**
| Type | Tool | How Agent Verifies |
|------|------|-------------------|
| **Section UI** | Playwright | Navigate, assert DOM elements, screenshot |
| **3D Background** | Playwright | Desktop viewport: assert `<canvas>` present, screenshot |
| **Mobile Fallback** | Playwright | Mobile viewport: assert NO `<canvas>`, layout correct |
| **API Routes** | Bash (curl) | POST/GET requests, assert status + response shape |
| **Interactions** | Playwright | Keyboard shortcuts, click sequences, assert DOM changes |
| **Build/SSR** | Bash | `bun run build` succeeds, `bun run preview` starts |

---

## Execution Strategy

### Parallel Execution Waves

```
═══════════════════════════════════════════════
PHASE 1: FOUNDATION (Tasks 1-6)
═══════════════════════════════════════════════

Wave 1 (Start Immediately):
├── Task 1: Project infrastructure (AGENTS.md, deps, fonts, Tailwind theme)
└── Task 2: TypeScript content schemas + placeholder data

Wave 2 (After Wave 1):
├── Task 3: Single-page layout shell + section anchors + nav
├── Task 4: Mobile-first responsive section templates (all 8)
└── Task 5: SEO meta tags + OG images + sitemap

Wave 3 (After Wave 2):
└── Task 6: SSR verification + basic E2E test suite

═══════════════════════════════════════════════
PHASE 2: VISUAL LAYER (Tasks 7-13)
═══════════════════════════════════════════════

Wave 4 (After Phase 1):
├── Task 7: Threlte 3D background (floating geometry + bloom)
├── Task 8: Hero section implementation
└── Task 9: Who Am I + Tools sections

Wave 5 (After Wave 4):
├── Task 10: Projects section (cards, tech tags, hover effects)
├── Task 11: Experience/Timeline section
└── Task 12: Open Source section (GitHub API integration)

Wave 6 (After Wave 5):
├── Task 13: Testimonials + Contact sections (form + API route)
└── Task 14: GSAP scroll-triggered section reveal animations

═══════════════════════════════════════════════
PHASE 3: INTERACTIVE POLISH (Tasks 15-20)
═══════════════════════════════════════════════

Wave 7 (After Phase 2):
├── Task 15: Custom animated cursor
├── Task 16: Command palette (Cmd+K) + hidden terminal commands
└── Task 17: Easter eggs (Konami, hover reveals, click tracker)

Wave 8 (After Wave 7):
├── Task 18: Accessibility audit + prefers-reduced-motion
├── Task 19: Performance optimization (bundle, 3D, images)
└── Task 20: Final E2E test suite + Lighthouse verification
```

### Dependency Matrix

| Task | Depends On | Blocks       | Can Parallelize With |
| ---- | ---------- | ------------ | -------------------- |
| 1    | None       | 3,4,5,7,8-17 | 2                    |
| 2    | None       | 4,8-13       | 1                    |
| 3    | 1          | 4,6,7,8-14   | 4,5                  |
| 4    | 1,2,3      | 6,8-14       | 5                    |
| 5    | 1          | 6            | 3,4                  |
| 6    | 3,4,5      | Phase 2      | None (final Phase 1) |
| 7    | 1,3        | 14,19        | 8,9                  |
| 8    | 1,2,3      | 14           | 7,9                  |
| 9    | 1,2,3      | 14           | 7,8                  |
| 10   | 1,2,3      | 14           | 11,12                |
| 11   | 1,2,3      | 14           | 10,12                |
| 12   | 1,2,3      | 14           | 10,11                |
| 13   | 1,2,3      | 14           | 10,11,12             |
| 14   | 7-13       | Phase 3      | None (final Phase 2) |
| 15   | 3          | 18,20        | 16,17                |
| 16   | 3          | 17,20        | 15,17                |
| 17   | 16         | 20           | 15                   |
| 18   | 14,15      | 20           | 19                   |
| 19   | 7,14       | 20           | 18                   |
| 20   | 18,19      | None (final) | None                 |

### Agent Dispatch Summary

| Wave | Tasks      | Recommended Dispatch                                                            |
| ---- | ---------- | ------------------------------------------------------------------------------- |
| 1    | 1, 2       | Parallel: 2x `category="quick"`                                                 |
| 2    | 3, 4, 5    | Parallel: `visual-engineering`, `visual-engineering`, `quick`                   |
| 3    | 6          | Sequential: `unspecified-low`                                                   |
| 4    | 7, 8, 9    | Parallel: `visual-engineering` (3D), `visual-engineering`, `visual-engineering` |
| 5    | 10, 11, 12 | Parallel: 3x `visual-engineering`                                               |
| 6    | 13, 14     | Parallel: `visual-engineering`, `visual-engineering`                            |
| 7    | 15, 16, 17 | Parallel: `visual-engineering`, `visual-engineering`, `quick`                   |
| 8    | 18, 19, 20 | Sequential: `deep`, `deep`, `deep`                                              |

---

## TODOs

### ═══ PHASE 1: FOUNDATION ═══

- [x] 1. Project Infrastructure Setup

  **What to do**:
  - Create `AGENTS.md` at project root with project conventions, architecture overview, and coding standards
  - Install dependencies: `bun add three @threlte/core @threlte/extras gsap @fontsource/space-grotesk @fontsource/jetbrains-mono` and `bun add -d @types/three`
  - Configure Tailwind v4 design tokens in `src/routes/layout.css` using `@theme {}` directive:
    - Colors: slate-900 base, purple-500 (#8b5cf6) accent, slate-200/400/500 text hierarchy
    - Fonts: `--font-sans: 'Space Grotesk', sans-serif;` and `--font-mono: 'JetBrains Mono', monospace;`
  - Import fonts in root layout: `import '@fontsource/space-grotesk/400.css'`, etc.
  - Update `src/app.html` to set `<html class="scroll-smooth" lang="en">` and dark background
  - Create project directory structure:
    ```
    src/lib/
    ├── components/     (UI components)
    ├── components/3d/  (Threlte 3D components)
    ├── types/          (TypeScript interfaces)
    ├── data/           (placeholder content)
    ├── utils/          (helpers)
    └── stores/         (shared state if needed)
    ```
  - Write test: Verify fonts load, Tailwind theme tokens resolve, build succeeds

  **Must NOT do**:
  - Do NOT create a `tailwind.config.ts` or `tailwind.config.js` — Tailwind v4 uses CSS only
  - Do NOT use npm or pnpm — use `bun` exclusively
  - Do NOT use Svelte stores — use Svelte 5 runes (`$state`, `$derived`, `$effect`)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Infrastructure setup, file creation, dependency installation — straightforward tasks
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Tailwind theme configuration and font setup require design awareness

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Tasks 3, 4, 5, 7-17
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `src/routes/layout.css:1-3` — Current Tailwind CSS setup (minimal — `@import 'tailwindcss'`, `@plugin` directives). Extend this file with `@theme {}` block.
  - `src/routes/+layout.svelte:1-9` — Current root layout. Add font imports here.
  - `src/app.html:1-12` — HTML shell. Update `<html>` attributes here.
  - `package.json:1-48` — Current dependencies. All new deps go here via `bun add`.

  **Documentation References**:
  - Tailwind v4 theming: `@theme {}` CSS directive replaces `tailwind.config.ts` entirely. Custom colors, fonts, spacing all go in CSS.
  - Fontsource: Import individual weights `@fontsource/space-grotesk/400.css`, `/600.css`, `/700.css`.
  - Threlte 8 setup: `@threlte/core` provides `<Canvas>` and `<T>`, `@threlte/extras` provides helpers.

  **Acceptance Criteria**:

  **TDD:**
  - [ ] Test: `src/lib/__tests__/infrastructure.test.ts` — verify font CSS imports exist, Tailwind theme tokens resolve
  - [ ] `bun run test:unit -- --run` → PASS

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Build succeeds with all new dependencies
    Tool: Bash
    Preconditions: Dependencies installed
    Steps:
      1. Run: bun run build
      2. Assert: Exit code 0
      3. Assert: No "Cannot resolve" errors in output
    Expected Result: Clean build with zero errors
    Evidence: Build output captured

  Scenario: Dev server starts and renders with custom fonts
    Tool: Playwright
    Preconditions: Dev server running on localhost:5173
    Steps:
      1. Navigate to: http://localhost:5173
      2. Assert: Page loads (status 200)
      3. Assert: computed font-family of body contains "Space Grotesk"
      4. Screenshot: .sisyphus/evidence/task-1-fonts.png
    Expected Result: Page renders with Space Grotesk font
    Evidence: .sisyphus/evidence/task-1-fonts.png

  Scenario: Directory structure created correctly
    Tool: Bash
    Steps:
      1. ls src/lib/components/ && ls src/lib/components/3d/ && ls src/lib/types/ && ls src/lib/data/ && ls src/lib/utils/
      2. Assert: All directories exist (exit code 0)
      3. cat AGENTS.md | head -5
      4. Assert: AGENTS.md exists and has content
    Expected Result: All directories and AGENTS.md exist
    Evidence: Terminal output captured
  ```

  **Commit**: YES
  - Message: `feat(infra): add project infrastructure, dependencies, Tailwind theme, and fonts`
  - Files: `AGENTS.md`, `package.json`, `bun.lock`, `src/routes/layout.css`, `src/routes/+layout.svelte`, `src/app.html`, `src/lib/` dirs
  - Pre-commit: `bun run build`

---

- [x] 2. TypeScript Content Schemas + Placeholder Data

  **What to do**:
  - Define TypeScript interfaces in `src/lib/types/content.ts`:
    ```typescript
    interface Project {
    	id: string;
    	title: string;
    	description: string;
    	image?: string;
    	tags: string[];
    	url?: string;
    	github?: string;
    	featured: boolean;
    }
    interface Experience {
    	id: string;
    	role: string;
    	company: string;
    	companyUrl?: string;
    	startDate: string;
    	endDate?: string;
    	description: string;
    	tags: string[];
    }
    interface Tool {
    	id: string;
    	name: string;
    	icon: string;
    	category: 'language' | 'framework' | 'tool' | 'platform';
    	proficiency: 'expert' | 'proficient' | 'familiar';
    	url?: string;
    }
    interface Testimonial {
    	id: string;
    	quote: string;
    	author: string;
    	role: string;
    	company: string;
    	avatar?: string;
    }
    interface SocialLink {
    	platform: string;
    	url: string;
    	icon: string;
    }
    interface SiteConfig {
    	name: string;
    	title: string;
    	subtitle: string;
    	bio: string;
    	email: string;
    	socials: SocialLink[];
    }
    ```
  - Create placeholder data files in `src/lib/data/`:
    - `projects.ts` — 4 featured placeholder projects with realistic data
    - `experience.ts` — 3 placeholder experience entries
    - `tools.ts` — 12-15 placeholder tools across categories
    - `testimonials.ts` — 3 placeholder testimonials
    - `site-config.ts` — site-wide config (name, title, subtitle, bio, email, socials)
  - All data files must be typed and export typed constants
  - Write tests for type validation (ensure placeholder data matches interfaces)

  **Must NOT do**:
  - Do NOT use a CMS or database — plain TypeScript files
  - Do NOT hardcode content in components — always import from `$lib/data/`
  - Do NOT add real personal data — use clearly labeled placeholders ("Your Name", "Project Title")

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: TypeScript interface definitions and data file creation — well-defined, no ambiguity
  - **Skills**: []
    - No special skills needed — pure TypeScript work

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Tasks 4, 8-13
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `src/lib/index.ts:1` — Empty library index. Export types and data from here for clean imports.

  **Documentation References**:
  - SvelteKit `$lib` alias: Files in `src/lib/` are importable as `$lib/types/content`, `$lib/data/projects`, etc.

  **Acceptance Criteria**:

  **TDD:**
  - [ ] Test: `src/lib/__tests__/content-schemas.test.ts` — verify all placeholder data satisfies TypeScript interfaces
  - [ ] Test: Verify all data arrays are non-empty and have required fields
  - [ ] `bun run test:unit -- --run` → PASS

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: TypeScript compilation passes with all schemas
    Tool: Bash
    Steps:
      1. Run: bun run check
      2. Assert: Exit code 0, no type errors
    Expected Result: All types compile cleanly
    Evidence: Check output captured

  Scenario: All data files are importable and non-empty
    Tool: Bash
    Steps:
      1. Run: bun run build
      2. Assert: No "Cannot find module" errors
      3. Assert: Build succeeds
    Expected Result: All imports resolve correctly
    Evidence: Build output captured
  ```

  **Commit**: YES
  - Message: `feat(content): add TypeScript content schemas and placeholder data`
  - Files: `src/lib/types/content.ts`, `src/lib/data/*.ts`, `src/lib/index.ts`
  - Pre-commit: `bun run check`

---

- [x] 3. Single-Page Layout Shell + Section Anchors + Navigation

  **What to do**:
  - Rebuild `src/routes/+page.svelte` as a single-page scroll layout with 8 section anchors
  - Create `src/lib/components/Navigation.svelte` — sticky sidebar navigation (desktop) inspired by Brittany Chiang:
    - Left side: name, title, brief tagline, nav links (About, Tools, Projects, Experience, Open Source, Testimonials, Contact)
    - Nav indicators: horizontal lines that expand on hover (like Brittany Chiang's `.nav-indicator`)
    - Active state tracking via IntersectionObserver (highlight current section)
    - Mobile: hamburger menu or hidden nav (sections have sticky headers instead)
  - Create section container component `src/lib/components/Section.svelte` with:
    - `id` prop for anchor linking
    - `scroll-mt-16` for anchor offset
    - Mobile sticky header (visible on mobile, `sr-only` on desktop — like Brittany Chiang)
    - Slot for section content
  - Implement smooth scroll behavior (already have `scroll-smooth` on html)
  - Layout structure (desktop): sticky left sidebar (~40%) + scrollable right content (~60%)
  - Layout structure (mobile): full-width stacked sections

  **Must NOT do**:
  - Do NOT use SvelteKit file-based routing for sections — single page with anchors
  - Do NOT add 3D canvas yet — that's Task 7
  - Do NOT add GSAP animations yet — that's Task 14

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Layout architecture, responsive design, navigation component — core frontend work
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Split-panel layout, sticky nav, responsive breakpoints require strong UI/UX sense

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5)
  - **Blocks**: Tasks 4, 6, 7, 8-14
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - Brittany Chiang HTML structure (from research): Split-panel `lg:flex lg:justify-between lg:gap-4` with `header.lg:sticky.lg:top-0.lg:max-h-screen.lg:w-[48%]` and `main.lg:w-[52%]`
  - Brittany Chiang nav pattern: `<nav class="nav hidden lg:block">` with `<ul class="mt-16 w-max">` and `.nav-indicator` spans that expand `w-8 → w-16` on hover
  - Brittany Chiang section headers: Mobile sticky `<div class="sticky top-0 z-20 bg-slate-900/75 backdrop-blur lg:sr-only">`
  - Brittany Chiang hover cascade: `lg:group-hover/list:opacity-50` on sibling items

  **Documentation References**:
  - Svelte 5 `$props()`: Use for component props (Section `id`, `title`)
  - IntersectionObserver API: For tracking which section is visible and updating active nav state
  - Tailwind v4 responsive: `lg:` breakpoint for desktop split layout

  **Acceptance Criteria**:

  **TDD:**
  - [ ] Test: `src/lib/components/__tests__/Navigation.test.ts` — renders nav links, active state changes
  - [ ] Test: `src/lib/components/__tests__/Section.test.ts` — renders with id, title, slot content
  - [ ] `bun run test:unit -- --run` → PASS

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Desktop layout renders split-panel with sticky nav
    Tool: Playwright
    Preconditions: Dev server running on localhost:5173
    Steps:
      1. Set viewport: 1280x800
      2. Navigate to: http://localhost:5173
      3. Assert: nav element is visible and sticky (position: sticky)
      4. Assert: nav contains links for all 8 sections
      5. Assert: main content area is scrollable
      6. Scroll to: #projects
      7. Assert: "Projects" nav link has active state
      8. Screenshot: .sisyphus/evidence/task-3-desktop-layout.png
    Expected Result: Split-panel layout with working navigation
    Evidence: .sisyphus/evidence/task-3-desktop-layout.png

  Scenario: Mobile layout renders stacked with sticky section headers
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Set viewport: 375x812
      2. Navigate to: http://localhost:5173
      3. Assert: No side navigation visible
      4. Assert: Sections stack vertically, full width
      5. Scroll to second section
      6. Assert: Section header is sticky at top with backdrop-blur
      7. Screenshot: .sisyphus/evidence/task-3-mobile-layout.png
    Expected Result: Stacked mobile layout with sticky headers
    Evidence: .sisyphus/evidence/task-3-mobile-layout.png

  Scenario: Anchor navigation works for all 8 sections
    Tool: Playwright
    Steps:
      1. Navigate to: http://localhost:5173#contact
      2. Assert: Contact section is scrolled into view
      3. Assert: URL hash is #contact
    Expected Result: Hash navigation scrolls to correct section
    Evidence: Screenshot captured
  ```

  **Commit**: YES
  - Message: `feat(layout): add single-page layout shell with split-panel nav and 8 section anchors`
  - Files: `src/routes/+page.svelte`, `src/lib/components/Navigation.svelte`, `src/lib/components/Section.svelte`
  - Pre-commit: `bun run test:unit -- --run`

---

- [x] 4. Mobile-First Responsive Section Templates (All 8)

  **What to do**:
  - Implement the content structure for all 8 sections using placeholder data from Task 2:
    - **Hero**: Name, title, subtitle, CTA button ("Explore my work" → scrolls to Projects)
    - **Who Am I**: Bio paragraphs, personal touch (interests, approach), optional photo placeholder
    - **Tools**: Grid of tool icons/names organized by category (languages, frameworks, tools, platforms), with proficiency indicators
    - **Projects**: Featured project cards with image placeholder, title, description, tech tags (like Brittany Chiang's layout: image left, content right on desktop)
    - **Experience**: Timeline entries with date range, role, company, description, tech tags (like Brittany Chiang's grid layout)
    - **Open Source**: GitHub stats section (placeholder for now — live data in Task 12), featured repos list
    - **Testimonials**: Quote cards with author, role, company
    - **Contact**: Form (name, email, message fields + submit button) + social links row
  - Each section uses the `<Section>` component from Task 3
  - All sections must be responsive (mobile-first, breakpoints at `sm:`, `md:`, `lg:`)
  - Implement Brittany Chiang's hover patterns: `group-hover/list:opacity-50` for list items
  - Tech tags as rounded pills: `bg-purple-400/10 text-purple-300 rounded-full px-3 py-1 text-xs`

  **Must NOT do**:
  - Do NOT add 3D elements — Task 7
  - Do NOT add GSAP animations — Task 14
  - Do NOT add the contact form backend — Task 13
  - Do NOT fetch GitHub API — Task 12
  - Do NOT hardcode content — import from `$lib/data/`

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 8 section UI implementations with responsive design, hover effects, and visual polish
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Each section needs thoughtful layout, spacing, typography, hover states

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 5) — though depends on Task 3 for Section component
  - **Blocks**: Tasks 6, 8-14
  - **Blocked By**: Tasks 1, 2, 3

  **References**:

  **Pattern References**:
  - Brittany Chiang experience entries: `sm:grid-cols-8` grid — date in `col-span-2`, content in `col-span-6`, absolute hover background
  - Brittany Chiang project cards: image `sm:order-1 sm:col-span-2`, content `sm:order-2 sm:col-span-6`
  - Brittany Chiang tech tags: `rounded-full bg-teal-400/10 px-3 py-1 text-xs font-medium text-teal-300`
  - Brittany Chiang hover opacity cascade: `lg:hover:!opacity-100 lg:group-hover/list:opacity-50`
  - `src/lib/types/content.ts` — TypeScript interfaces for all content types (from Task 2)
  - `src/lib/data/*.ts` — Placeholder data files (from Task 2)

  **Acceptance Criteria**:

  **TDD:**
  - [ ] Test per section component (8 tests): renders placeholder content, has correct structure
  - [ ] Test: Tech tags render correctly with proper styling classes
  - [ ] Test: Experience entries display date ranges and roles
  - [ ] `bun run test:unit -- --run` → PASS (all 8+ tests)

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: All 8 sections render with placeholder content on desktop
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Set viewport: 1280x800
      2. Navigate to: http://localhost:5173
      3. Assert: section#hero exists and contains heading text
      4. Assert: section#about exists and contains bio text
      5. Assert: section#tools exists and contains tool items
      6. Assert: section#projects exists and contains project cards
      7. Assert: section#experience exists and contains timeline entries
      8. Assert: section#opensource exists
      9. Assert: section#testimonials exists and contains quotes
      10. Assert: section#contact exists and contains form elements
      11. Screenshot full page: .sisyphus/evidence/task-4-all-sections-desktop.png
    Expected Result: All 8 sections visible with placeholder content
    Evidence: .sisyphus/evidence/task-4-all-sections-desktop.png

  Scenario: All 8 sections render correctly on mobile
    Tool: Playwright
    Steps:
      1. Set viewport: 375x812
      2. Navigate to: http://localhost:5173
      3. Scroll through all sections
      4. Assert: No horizontal overflow
      5. Assert: All sections stack vertically
      6. Screenshot: .sisyphus/evidence/task-4-all-sections-mobile.png
    Expected Result: Clean mobile layout, no overflow
    Evidence: .sisyphus/evidence/task-4-all-sections-mobile.png

  Scenario: Hover effects work on project and experience cards
    Tool: Playwright
    Steps:
      1. Set viewport: 1280x800
      2. Navigate to: http://localhost:5173#projects
      3. Hover over first project card
      4. Assert: Other project cards have reduced opacity
      5. Assert: Hovered card has full opacity + background highlight
      6. Screenshot: .sisyphus/evidence/task-4-hover-effect.png
    Expected Result: Opacity cascade on hover
    Evidence: .sisyphus/evidence/task-4-hover-effect.png
  ```

  **Commit**: YES
  - Message: `feat(sections): implement all 8 content sections with placeholder data and responsive layout`
  - Files: `src/routes/+page.svelte`, `src/lib/components/sections/*.svelte`
  - Pre-commit: `bun run test:unit -- --run`

---

- [x] 5. SEO Meta Tags + OG Images + Sitemap

  **What to do**:
  - Add `<svelte:head>` in `src/routes/+layout.svelte` with:
    - `<title>`, `<meta name="description">`, canonical URL
    - OpenGraph tags: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`
    - Twitter card tags: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
    - Theme color: `<meta name="theme-color" content="#0f172a">` (slate-900)
  - Create OG image placeholder in `static/og.png` (1200x630, can be a simple branded placeholder)
  - Add `static/sitemap.xml` with the single page URL
  - Add structured data (JSON-LD) for Person schema in the layout head
  - Update `static/robots.txt` to reference sitemap

  **Must NOT do**:
  - Do NOT add Google Analytics or any tracking (not requested)
  - Do NOT over-engineer the OG image — a simple branded placeholder is fine

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Straightforward meta tags, file creation — well-defined scope
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 4)
  - **Blocks**: Task 6
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - Brittany Chiang meta tags: `<title>Brittany Chiang</title>`, `og:image` at `/og.png`, Twitter `summary_large_image`
  - `src/routes/+layout.svelte:1-9` — Current root layout to add `<svelte:head>` block
  - `static/robots.txt:1` — Currently exists, update with sitemap reference

  **Acceptance Criteria**:

  **TDD:**
  - [ ] Test: E2E — page has `<title>`, `<meta name="description">`, `<meta property="og:image">`
  - [ ] `bun run test:unit -- --run` → PASS

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Meta tags are present in rendered HTML
    Tool: Bash
    Steps:
      1. Run: bun run build && bun run preview &
      2. curl -s http://localhost:4173 | grep -o '<meta property="og:image"[^>]*>'
      3. Assert: OG image meta tag found
      4. curl -s http://localhost:4173 | grep -o '<title>[^<]*</title>'
      5. Assert: Title tag found with content
    Expected Result: All meta tags present in SSR output
    Evidence: curl output captured

  Scenario: Sitemap and robots.txt are accessible
    Tool: Bash
    Steps:
      1. curl -s http://localhost:4173/sitemap.xml
      2. Assert: Valid XML with <url> entries
      3. curl -s http://localhost:4173/robots.txt
      4. Assert: Contains "Sitemap:" reference
    Expected Result: Both files accessible and valid
    Evidence: Response bodies captured
  ```

  **Commit**: YES
  - Message: `feat(seo): add meta tags, OG image, sitemap, and structured data`
  - Files: `src/routes/+layout.svelte`, `static/og.png`, `static/sitemap.xml`, `static/robots.txt`
  - Pre-commit: `bun run build`

---

- [x] 6. SSR Verification + Foundation E2E Test Suite

  **What to do**:
  - Verify the entire foundation builds and renders correctly with SSR:
    - `bun run build` succeeds
    - `bun run preview` serves the page
    - All 8 sections are present in SSR HTML output (not just client-rendered)
  - Create foundational E2E test file `e2e/foundation.test.ts`:
    - Test: All 8 section landmarks exist
    - Test: Navigation links work (click nav link → section scrolls into view)
    - Test: Responsive layout (desktop split-panel, mobile stacked)
    - Test: No JavaScript errors in console
    - Test: Page loads in <3s
  - Fix any SSR issues discovered during verification

  **Must NOT do**:
  - Do NOT add 3D-specific tests yet — that's Task 20
  - Do NOT test interactions (cursor, palette) — that's Task 20

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Verification and test writing, not creative work
  - **Skills**: [`playwright`]
    - `playwright`: E2E test authoring with Playwright assertions

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (sequential — final Phase 1 gate)
  - **Blocks**: Phase 2 (all tasks 7-14)
  - **Blocked By**: Tasks 3, 4, 5

  **References**:

  **Pattern References**:
  - `e2e/demo.test.ts` — Existing E2E test file pattern (Playwright config already set up)
  - `playwright.config.ts` — Existing Playwright configuration

  **Acceptance Criteria**:

  **TDD:**
  - [ ] `bun run build` → exit code 0
  - [ ] `bun run test:e2e` → all foundation tests pass
  - [ ] SSR HTML contains all 8 section IDs (not client-rendered empty shells)

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: SSR build succeeds and serves all sections
    Tool: Bash
    Steps:
      1. Run: bun run build
      2. Assert: exit code 0
      3. Run: bun run preview &
      4. Wait 3s
      5. curl -s http://localhost:4173 | grep -c 'id="hero"\|id="about"\|id="tools"\|id="projects"\|id="experience"\|id="opensource"\|id="testimonials"\|id="contact"'
      6. Assert: Count equals 8
    Expected Result: All 8 sections present in SSR HTML
    Evidence: Section count output

  Scenario: E2E foundation tests all pass
    Tool: Bash
    Steps:
      1. Run: bun run test:e2e
      2. Assert: All tests pass, exit code 0
    Expected Result: Green test suite
    Evidence: Test output captured
  ```

  **Commit**: YES
  - Message: `test(e2e): add foundation E2E test suite and verify SSR`
  - Files: `e2e/foundation.test.ts`
  - Pre-commit: `bun run build && bun run test:e2e`

---

### ═══ PHASE 2: VISUAL LAYER ═══

- [x] 7. Threlte 3D Background (Floating Geometry + Bloom)

  **What to do**:
  - Create `src/lib/components/3d/Scene.svelte` — the main 3D background component:
    - Threlte `<Canvas>` with transparent background, positioned fixed behind all content
    - `{#if browser}` guard around the entire Canvas (SSR safety)
    - `<T.PerspectiveCamera>` with subtle parallax based on mouse position
    - 5-8 floating polyhedra (icosahedrons, octahedrons, dodecahedrons) at various sizes
    - Use `<InstancedMesh>` from `@threlte/extras` for performance
    - Purple/violet materials with emissive glow matching accent color (#8b5cf6)
    - Subtle rotation animation via `useTask` (each shape at different speed/axis)
    - Scroll-reactive: shapes gently shift position/rotation as user scrolls (using scroll offset)
  - Add post-processing: `@threlte/extras` postprocessing (or Three.js EffectComposer):
    - `UnrealBloomPass` with selective bloom on geometry (not content)
    - Subtle noise/grain overlay
    - Optional vignette
  - Create `src/lib/components/3d/FloatingShape.svelte` — individual shape component
  - Performance safeguards:
    - FPS monitor: if drops below 30fps for 2+ seconds, reduce quality (disable bloom, reduce shape count)
    - `<InstancedMesh>` for all similar shapes
    - Lazy load the 3D scene (only after page content is interactive)
  - Device detection: in `src/hooks.server.ts`, detect mobile via User-Agent → pass `isMobile` to layout → conditionally render 3D scene
  - Create `src/routes/+layout.server.ts` to pass `isMobile` from hooks

  **Must NOT do**:
  - Do NOT make 3D objects interactive/clickable — background only
  - Do NOT use `$state` for scroll/mouse position — use direct Three.js/GSAP updates
  - Do NOT render canvas on mobile (check `isMobile` from server + `matchMedia` client-side)
  - Do NOT block page interactivity while 3D loads — use `Suspense`/lazy loading

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 3D scene creation with Threlte, post-processing, performance optimization
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Visual quality of 3D scene (colors, bloom intensity, animation timing)

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 8, 9)
  - **Blocks**: Tasks 14, 19
  - **Blocked By**: Tasks 1, 3

  **References**:

  **Pattern References**:
  - dvlpr.pro: Floating purple diamond/octahedron with glow — this is the reference aesthetic
  - Threlte 8 `<T>` component pattern (from research): `<T.Mesh>`, `<T.IcosahedronGeometry>`, `<T.MeshStandardMaterial>`
  - Threlte 8 `useTask` for animation loops (from research): replaces `onFrame`
  - SSR handling (from research): `import { browser } from '$app/environment'` + `{#if browser}`
  - Performance: `<InstancedMesh>` from `@threlte/extras` for batching similar shapes

  **Documentation References**:
  - Threlte docs: Canvas setup, `<T>` usage, `useTask`, postprocessing integration
  - Three.js `UnrealBloomPass`: selective bloom with `layers` system
  - Three.js `InstancedMesh`: batch rendering for multiple identical geometries

  **Acceptance Criteria**:

  **TDD:**
  - [ ] Test: `src/lib/components/3d/__tests__/Scene.test.ts` — component renders without SSR crash, respects `isMobile` prop
  - [ ] `bun run test:unit -- --run` → PASS
  - [ ] `bun run build` → exit code 0 (SSR safe)

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 3D canvas renders on desktop viewport
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Set viewport: 1280x800
      2. Navigate to: http://localhost:5173
      3. Wait for: canvas element visible (timeout: 10s)
      4. Assert: canvas element exists in DOM
      5. Assert: canvas has non-zero width and height
      6. Wait 2s (let animation start)
      7. Screenshot: .sisyphus/evidence/task-7-3d-desktop.png
    Expected Result: 3D canvas renders with floating geometry
    Evidence: .sisyphus/evidence/task-7-3d-desktop.png

  Scenario: No 3D canvas on mobile viewport
    Tool: Playwright
    Steps:
      1. Set viewport: 375x812
      2. Navigate to: http://localhost:5173
      3. Wait 3s
      4. Assert: NO canvas element in DOM
      5. Screenshot: .sisyphus/evidence/task-7-no-3d-mobile.png
    Expected Result: No canvas on mobile
    Evidence: .sisyphus/evidence/task-7-no-3d-mobile.png

  Scenario: SSR build succeeds with 3D components
    Tool: Bash
    Steps:
      1. Run: bun run build
      2. Assert: Exit code 0
      3. Assert: No "window is not defined" or "document is not defined" errors
    Expected Result: Clean SSR build
    Evidence: Build output captured
  ```

  **Commit**: YES
  - Message: `feat(3d): add Threlte 3D background with floating geometry and bloom effects`
  - Files: `src/lib/components/3d/Scene.svelte`, `src/lib/components/3d/FloatingShape.svelte`, `src/hooks.server.ts`, `src/routes/+layout.server.ts`, `src/routes/+layout.svelte`
  - Pre-commit: `bun run build`

---

- [x] 8. Hero Section Implementation

  **What to do**:
  - Enhance the Hero section in `src/routes/+page.svelte` (or its component):
    - Large name/title with Space Grotesk bold
    - Subtitle/tagline
    - CTA button: "Explore my work →" (scrolls to Projects section)
    - Subtle "Scroll Down" indicator at bottom (like dvlpr.pro)
    - Section indicators on right edge (like dvlpr.pro's 00-04 vertical rail) — show current section number
  - Style: text overlaid on 3D background, high z-index, enough contrast for readability
  - Animation-ready classes (GSAP will animate these in Task 14, but structure needs to be there)

  **Must NOT do**:
  - Do NOT add GSAP entrance animations — Task 14
  - Do NOT duplicate 3D elements here — background is global from Task 7

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Hero section is the first impression — needs precise typography and visual hierarchy
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 7, 9)
  - **Blocks**: Task 14
  - **Blocked By**: Tasks 1, 2, 3

  **References**:

  **Pattern References**:
  - dvlpr.pro hero: Large "Senior Front-End Software Engineer" text, left-aligned, with "Crafting modern, accessible..." subtitle
  - dvlpr.pro section indicators: Right side vertical rail with "00", "01", "02" etc.
  - dvlpr.pro scroll prompt: "Scroll Down ↓" at bottom-right
  - `src/lib/data/site-config.ts` — Name, title, subtitle data (from Task 2)

  **Acceptance Criteria**:

  **TDD:**
  - [ ] Test: Hero renders name, title, subtitle from site config data
  - [ ] Test: CTA button links to #projects
  - [ ] `bun run test:unit -- --run` → PASS

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Hero section displays correctly on desktop
    Tool: Playwright
    Steps:
      1. Set viewport: 1280x800
      2. Navigate to: http://localhost:5173
      3. Assert: h1 with name text is visible
      4. Assert: Subtitle text is visible
      5. Assert: CTA button "Explore my work" is visible
      6. Click: CTA button
      7. Assert: Page scrolls to #projects section
      8. Screenshot: .sisyphus/evidence/task-8-hero-desktop.png
    Expected Result: Hero displays with all elements, CTA works
    Evidence: .sisyphus/evidence/task-8-hero-desktop.png
  ```

  **Commit**: YES (groups with Task 9)
  - Message: `feat(hero): implement hero section with name, title, CTA, and section indicators`
  - Pre-commit: `bun run test:unit -- --run`

---

- [x] 9. Who Am I + Tools Sections Implementation

  **What to do**:
  - **Who Am I** section:
    - Bio paragraphs from placeholder data
    - Personal interests/approach
    - Photo placeholder (optional — can use a gradient or abstract shape placeholder)
    - Clean typography, good readability
  - **Tools** section:
    - Grid layout organized by category (Languages, Frameworks, Tools, Platforms)
    - Each tool: icon + name + proficiency indicator
    - Icons: use simple SVG icons or text-based representation
    - Hover effect: scale up slightly, show full name if truncated
    - Responsive: 2 cols mobile, 3-4 cols tablet, 4-6 cols desktop
  - Both sections use `<Section>` container and import from `$lib/data/`

  **Must NOT do**:
  - Do NOT fetch tool icons from external CDN — use inline SVGs or a local icon set
  - Do NOT add animations — Task 14

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Grid layout, icon management, responsive breakpoints
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 7, 8)
  - **Blocks**: Task 14
  - **Blocked By**: Tasks 1, 2, 3

  **References**:

  **Pattern References**:
  - Brittany Chiang About section: paragraphs with `mb-4`, linked company names
  - `src/lib/data/tools.ts` — Tool data with categories and proficiency (from Task 2)
  - `src/lib/data/site-config.ts` — Bio text (from Task 2)

  **Acceptance Criteria**:

  **TDD:**
  - [ ] Test: Who Am I renders bio text from data
  - [ ] Test: Tools renders correct number of tools grouped by category
  - [ ] Test: Tools grid is responsive (cols change at breakpoints)
  - [ ] `bun run test:unit -- --run` → PASS

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Tools grid displays all placeholder tools by category
    Tool: Playwright
    Steps:
      1. Set viewport: 1280x800
      2. Navigate to: http://localhost:5173#tools
      3. Assert: Category headings visible (Languages, Frameworks, etc.)
      4. Assert: Tool count matches placeholder data length
      5. Hover: first tool item
      6. Assert: Hover effect applied (scale or highlight)
      7. Screenshot: .sisyphus/evidence/task-9-tools.png
    Expected Result: Tools grid with categories and hover
    Evidence: .sisyphus/evidence/task-9-tools.png
  ```

  **Commit**: YES (groups with Task 8)
  - Message: `feat(sections): implement Who Am I bio and Tools grid sections`
  - Pre-commit: `bun run test:unit -- --run`

---

- [x] 10. Projects Section (Cards, Tech Tags, Hover Effects)

  **What to do**:
  - Featured project cards following Brittany Chiang's pattern:
    - Grid layout: image thumbnail (left, col-span-2) + content (right, col-span-6)
    - Title with external link arrow icon
    - Description paragraph
    - Tech tags as rounded purple pills
    - Hover: opacity cascade on sibling cards, background highlight, border brightening
  - Image placeholders: gradient or abstract pattern (no broken image icons)
  - "View All Projects" link at bottom (optional, can link to GitHub)
  - Absolute clickable area for better UX (like Brittany Chiang's `<span class="absolute -inset-x-4 -inset-y-2.5">`)

  **Must NOT do**:
  - Do NOT add GSAP entrance animations — Task 14

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Card layout with complex hover interactions, visual polish
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 11, 12)
  - **Blocks**: Task 14
  - **Blocked By**: Tasks 1, 2, 3

  **References**:

  **Pattern References**:
  - Brittany Chiang project cards: `sm:grid-cols-8`, image `sm:order-1 sm:col-span-2`, content `sm:order-2 sm:col-span-6`
  - Brittany Chiang hover: `lg:hover:!opacity-100 lg:group-hover/list:opacity-50`, `lg:group-hover:bg-slate-800/50`
  - Brittany Chiang tech tags: `rounded-full bg-teal-400/10 px-3 py-1 text-xs font-medium text-teal-300` → adapt to purple
  - `src/lib/data/projects.ts` — Project placeholder data (from Task 2)

  **Acceptance Criteria**:

  **TDD:**
  - [ ] Test: Renders correct number of featured projects
  - [ ] Test: Each project card has title, description, tags
  - [ ] Test: Tech tags render as pill elements
  - [ ] `bun run test:unit -- --run` → PASS

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Project cards render with hover opacity cascade
    Tool: Playwright
    Steps:
      1. Set viewport: 1280x800
      2. Navigate to: http://localhost:5173#projects
      3. Assert: 4 project cards visible (matching placeholder data)
      4. Hover: first project card
      5. Assert: Other cards have reduced opacity (opacity < 1)
      6. Assert: Hovered card has background highlight
      7. Screenshot: .sisyphus/evidence/task-10-projects-hover.png
    Expected Result: Opacity cascade on hover
    Evidence: .sisyphus/evidence/task-10-projects-hover.png
  ```

  **Commit**: YES
  - Message: `feat(projects): implement project cards with tech tags and hover effects`
  - Pre-commit: `bun run test:unit -- --run`

---

- [x] 11. Experience / Timeline Section

  **What to do**:
  - Timeline-style experience entries following Brittany Chiang's pattern:
    - Grid: date range (col-span-2) + content (col-span-6)
    - Each entry: role title, company name (linked), description, tech tags
    - Date format: "2024 — Present" style
    - Same hover patterns as Projects (opacity cascade, background highlight)
  - Optional: subtle vertical line connecting entries for timeline feel
  - "View Full Résumé" link at bottom (links to LinkedIn or downloads PDF — but since Resume was excluded, link to LinkedIn)

  **Must NOT do**:
  - Do NOT add a resume/CV download feature (excluded)
  - Do NOT add animations — Task 14

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Timeline layout with grid and hover interactions
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 10, 12)
  - **Blocks**: Task 14
  - **Blocked By**: Tasks 1, 2, 3

  **References**:

  **Pattern References**:
  - Brittany Chiang experience: grid `sm:grid-cols-8`, date in `col-span-2` header, content in `col-span-6`
  - `src/lib/data/experience.ts` — Experience placeholder data (from Task 2)

  **Acceptance Criteria**:

  **TDD:**
  - [ ] Test: Renders correct number of experience entries
  - [ ] Test: Each entry has role, company, date range
  - [ ] `bun run test:unit -- --run` → PASS

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Experience timeline renders with all entries
    Tool: Playwright
    Steps:
      1. Navigate to: http://localhost:5173#experience
      2. Assert: 3 experience entries visible (matching placeholder data)
      3. Assert: Each entry has date range, role title, company name
      4. Assert: Tech tags present on entries
      5. Screenshot: .sisyphus/evidence/task-11-experience.png
    Expected Result: Timeline with 3 entries
    Evidence: .sisyphus/evidence/task-11-experience.png
  ```

  **Commit**: YES
  - Message: `feat(experience): implement experience timeline section`
  - Pre-commit: `bun run test:unit -- --run`

---

- [x] 12. Open Source Section (GitHub API Integration)

  **What to do**:
  - Create `src/routes/+page.server.ts` with a `load` function that fetches GitHub data:
    - User profile (avatar, bio, public repo count, followers)
    - Pinned/featured repositories (name, description, stars, forks, language)
    - Contribution stats (total contributions this year — from GraphQL API)
  - GitHub API token stored in environment variable `GITHUB_TOKEN`
  - Server-side only — never expose token to client
  - TTL cache: cache GitHub data for 1 hour (avoid rate limits)
  - Error handling: graceful degradation if API fails (show placeholder data)
  - Loading state: skeleton UI while data loads (for edge cases)
  - UI: stats cards (repos, stars, followers) + featured repo list with stars/forks badges

  **Must NOT do**:
  - Do NOT call GitHub API from client-side (exposes token)
  - Do NOT fetch on every page load — implement TTL cache
  - Do NOT crash if GitHub API is unreachable — show fallback content

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: API integration + UI rendering with loading/error states
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Stats cards and repo list need visual polish

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 10, 11)
  - **Blocks**: Task 14
  - **Blocked By**: Tasks 1, 2, 3

  **References**:

  **Documentation References**:
  - GitHub REST API: `GET /users/{username}/repos?sort=stars&per_page=6`
  - GitHub GraphQL API: `contributionsCollection { contributionCalendar { totalContributions } }`
  - SvelteKit server load: `export async function load({ fetch })` in `+page.server.ts`
  - SvelteKit env: `import { GITHUB_TOKEN } from '$env/static/private'`

  **Acceptance Criteria**:

  **TDD:**
  - [ ] Test: GitHub fetch function returns expected data shape (mock API)
  - [ ] Test: Graceful fallback when API fails
  - [ ] Test: Cache returns stale data within TTL window
  - [ ] `bun run test:unit -- --run` → PASS

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Open Source section renders with GitHub data (or fallback)
    Tool: Playwright
    Preconditions: Dev server running (with or without GITHUB_TOKEN)
    Steps:
      1. Navigate to: http://localhost:5173#opensource
      2. Assert: Section exists and has content (either live data or fallback)
      3. Assert: No error messages visible to user
      4. Screenshot: .sisyphus/evidence/task-12-opensource.png
    Expected Result: Section renders cleanly regardless of API availability
    Evidence: .sisyphus/evidence/task-12-opensource.png

  Scenario: GitHub API route returns valid data shape
    Tool: Bash
    Preconditions: Dev server running with GITHUB_TOKEN env var
    Steps:
      1. curl -s http://localhost:5173 | grep -o 'data-github-loaded="true"'
      2. Assert: Attribute found (or check for repo names in HTML)
    Expected Result: Server-rendered GitHub data present
    Evidence: Response captured
  ```

  **Commit**: YES
  - Message: `feat(github): add live GitHub API integration with server-side caching`
  - Files: `src/routes/+page.server.ts`, open source section component
  - Pre-commit: `bun run build`

---

- [x] 13. Testimonials + Contact Sections (Form + API Route)

  **What to do**:
  - **Testimonials**:
    - Quote cards with large quotation marks, author name, role, company
    - Clean card layout (1 col mobile, 2-3 cols desktop)
    - Subtle background differentiation per card
  - **Contact Form**:
    - Create `src/lib/components/ContactForm.svelte` with fields: name, email, message
    - Client-side validation (required fields, email format)
    - Submit button with loading state
    - Success/error feedback messages
    - Create `src/routes/api/contact/+server.ts` — POST endpoint:
      - Validate input server-side
      - Send email via Resend API (or stub with console.log for now)
      - Return JSON response
    - Resend API key in `RESEND_API_KEY` env variable
    - Rate limiting: basic in-memory throttle (1 submission per minute per IP)
  - **Social Links**: Row of icon links below the form (GitHub, LinkedIn, Twitter/X, Email)
  - Use Tailwind Forms plugin for form styling

  **Must NOT do**:
  - Do NOT add a database for contact submissions — email only
  - Do NOT skip server-side validation — don't trust client

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Form UX, validation states, API route, card layout
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 6 (with Task 14)
  - **Blocks**: Task 14 (content must exist for animation)
  - **Blocked By**: Tasks 1, 2, 3

  **References**:

  **Pattern References**:
  - `src/lib/data/testimonials.ts` — Testimonial placeholder data (from Task 2)
  - `src/lib/data/site-config.ts` — Social links (from Task 2)
  - Tailwind Forms plugin: Already installed (`@tailwindcss/forms`)

  **Documentation References**:
  - SvelteKit form actions or API routes: `+server.ts` with `POST` handler
  - Resend API: `POST https://api.resend.com/emails` with API key
  - Svelte 5 form handling: `$state` for form values, `$derived` for validation

  **Acceptance Criteria**:

  **TDD:**
  - [ ] Test: Contact form validates required fields
  - [ ] Test: Contact form shows error for invalid email
  - [ ] Test: API route returns 200 on valid submission
  - [ ] Test: API route returns 400 on invalid data
  - [ ] Test: Rate limiter blocks rapid submissions
  - [ ] Test: Testimonial cards render from placeholder data
  - [ ] `bun run test:unit -- --run` → PASS

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Contact form submits successfully
    Tool: Playwright
    Steps:
      1. Navigate to: http://localhost:5173#contact
      2. Fill: input[name="name"] → "Test User"
      3. Fill: input[name="email"] → "test@example.com"
      4. Fill: textarea[name="message"] → "Hello, this is a test message."
      5. Click: button[type="submit"]
      6. Wait for: success message visible (timeout: 5s)
      7. Assert: Success message contains "sent" or "received"
      8. Screenshot: .sisyphus/evidence/task-13-contact-success.png
    Expected Result: Form submits, success message shown
    Evidence: .sisyphus/evidence/task-13-contact-success.png

  Scenario: Contact form validates required fields
    Tool: Playwright
    Steps:
      1. Navigate to: http://localhost:5173#contact
      2. Click: button[type="submit"] (without filling fields)
      3. Assert: Validation errors visible for required fields
      4. Screenshot: .sisyphus/evidence/task-13-contact-validation.png
    Expected Result: Required field errors shown
    Evidence: .sisyphus/evidence/task-13-contact-validation.png

  Scenario: Contact API handles invalid data
    Tool: Bash
    Steps:
      1. curl -s -w "\n%{http_code}" -X POST http://localhost:5173/api/contact -H "Content-Type: application/json" -d '{"name":"","email":"invalid"}'
      2. Assert: HTTP status 400
      3. Assert: response contains validation errors
    Expected Result: 400 with error details
    Evidence: Response captured
  ```

  **Commit**: YES
  - Message: `feat(contact): add testimonials cards and contact form with API route`
  - Files: `src/lib/components/ContactForm.svelte`, `src/routes/api/contact/+server.ts`, testimonials component
  - Pre-commit: `bun run test:unit -- --run`

---

- [x] 14. GSAP Scroll-Triggered Section Reveal Animations

  **What to do**:
  - Install and configure GSAP with ScrollTrigger for Svelte 5:
    - Register plugin in a shared utility: `gsap.registerPlugin(ScrollTrigger)`
    - Create `src/lib/utils/gsap.ts` — shared GSAP initialization and helper functions
  - Add scroll-triggered entrance animations to all sections:
    - Fade-in + slide-up for section content as it enters viewport
    - Staggered reveal for list items (projects, tools, experience entries)
    - Hero elements: staggered entrance on initial page load (title → subtitle → CTA)
    - Section indicators: animate in sync with scroll position
  - Canonical Svelte 5 pattern: `$effect(() => { let ctx = gsap.context(() => { /* animations */ }, element); return () => ctx.revert(); })`
  - Call `ScrollTrigger.refresh()` in `afterNavigate` callback (SvelteKit navigation)
  - Create `src/lib/components/AnimateOnScroll.svelte` — reusable wrapper component
  - `prefers-reduced-motion`: disable all animations when user has this preference

  **Must NOT do**:
  - Do NOT use `$state` for scroll position — use GSAP's internal tracking
  - Do NOT animate on mobile if `prefers-reduced-motion` is set
  - Do NOT create jarring animations — subtle and professional

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Animation timing, scroll physics, visual refinement
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Animation timing and feel require strong UX sense

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 6 (with Task 13 — but depends on sections 7-13 being complete)
  - **Blocks**: Phase 3
  - **Blocked By**: Tasks 7-13

  **References**:

  **Pattern References**:
  - GSAP + Svelte 5 pattern (from research): `$effect(() => { let ctx = gsap.context(...); return () => ctx.revert(); })`
  - ScrollTrigger refresh (from Metis): Must call `ScrollTrigger.refresh()` in `afterNavigate`
  - `prefers-reduced-motion`: `window.matchMedia('(prefers-reduced-motion: reduce)')` check

  **Documentation References**:
  - GSAP ScrollTrigger: trigger, start, end, scrub, stagger
  - GSAP context: scoped animation cleanup

  **Acceptance Criteria**:

  **TDD:**
  - [ ] Test: AnimateOnScroll component renders children
  - [ ] Test: Animations are disabled when `prefers-reduced-motion` is set
  - [ ] `bun run test:unit -- --run` → PASS

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Sections animate in on scroll
    Tool: Playwright
    Steps:
      1. Set viewport: 1280x800
      2. Navigate to: http://localhost:5173
      3. Assert: Hero elements are visible (initial animation)
      4. Scroll to: #projects
      5. Wait 1s (for animation to complete)
      6. Assert: Project cards are visible (not opacity: 0)
      7. Screenshot: .sisyphus/evidence/task-14-scroll-animation.png
    Expected Result: Content animates in as user scrolls
    Evidence: .sisyphus/evidence/task-14-scroll-animation.png

  Scenario: Animations respect prefers-reduced-motion
    Tool: Playwright
    Steps:
      1. Emulate: prefers-reduced-motion: reduce
      2. Navigate to: http://localhost:5173
      3. Assert: All sections immediately visible (no animation delay)
      4. Assert: No transform or opacity animations in progress
    Expected Result: Content visible immediately, no motion
    Evidence: Screenshot captured
  ```

  **Commit**: YES
  - Message: `feat(animation): add GSAP scroll-triggered section reveal animations`
  - Files: `src/lib/utils/gsap.ts`, `src/lib/components/AnimateOnScroll.svelte`, section updates
  - Pre-commit: `bun run build`

---

### ═══ PHASE 3: INTERACTIVE POLISH ═══

- [x] 15. Custom Animated Cursor

  **What to do**:
  - Create `src/lib/components/CustomCursor.svelte`:
    - Replace default cursor on desktop (CSS `cursor: none` on body)
    - Custom cursor element: small dot/ring that follows mouse position
    - Use `gsap.quickSetter` for smooth 60fps tracking (NOT `$state`)
    - Hover states: cursor grows/changes when hovering interactive elements:
      - Links/buttons: cursor expands, maybe shows "Click" or becomes a ring
      - Project cards: cursor shows "View" text
      - Contact form inputs: cursor becomes a text cursor indicator
    - Smooth interpolation (slight lag behind mouse for "floaty" feel)
  - Desktop only: don't render on mobile/touch devices
  - Add `data-cursor="..."` attributes to interactive elements for cursor state changes
  - `prefers-reduced-motion`: reduce or disable cursor animations

  **Must NOT do**:
  - Do NOT use `$state` or Svelte reactivity for cursor position — `gsap.quickSetter` only
  - Do NOT render on touch devices
  - Do NOT block pointer events — cursor element must be `pointer-events: none`

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: High-frequency DOM updates, GSAP quickSetter, CSS tricks
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 7 (with Tasks 16, 17)
  - **Blocks**: Tasks 18, 20
  - **Blocked By**: Task 3

  **References**:

  **Pattern References**:
  - Metis directive: Use `gsap.quickSetter` for cursor — NOT `$state` reactivity at 60fps
  - `data-cursor` attribute pattern for hover state changes

  **Documentation References**:
  - GSAP `quickSetter`: Fastest way to set CSS properties repeatedly
  - CSS `cursor: none`: Hide default cursor

  **Acceptance Criteria**:

  **TDD:**
  - [ ] Test: CustomCursor renders on desktop (non-touch)
  - [ ] Test: CustomCursor does NOT render on mobile viewport
  - [ ] `bun run test:unit -- --run` → PASS

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Custom cursor follows mouse on desktop
    Tool: Playwright
    Steps:
      1. Set viewport: 1280x800
      2. Navigate to: http://localhost:5173
      3. Move mouse to: center of page
      4. Assert: Custom cursor element visible near mouse position
      5. Move mouse to: a link element
      6. Assert: Cursor element has changed state (expanded/different class)
      7. Screenshot: .sisyphus/evidence/task-15-cursor.png
    Expected Result: Custom cursor follows mouse with hover state changes
    Evidence: .sisyphus/evidence/task-15-cursor.png
  ```

  **Commit**: YES
  - Message: `feat(cursor): add custom animated cursor with hover state reactions`
  - Pre-commit: `bun run test:unit -- --run`

---

- [x] 16. Command Palette (Cmd+K) + Hidden Terminal Commands

  **What to do**:
  - Install `cmdk-sv` (Svelte port of cmdk) or build minimal dialog+fuzzy search
  - Create `src/lib/components/CommandPalette.svelte`:
    - Open with `Cmd+K` (Mac) / `Ctrl+K` (Windows)
    - Visual: centered modal with search input, blurred backdrop
    - Default commands: Navigate to each section (About, Tools, Projects, etc.)
    - Utility commands: Toggle reduced motion, Copy email, Open GitHub
    - **Hidden terminal commands** (Easter egg):
      - Type `help` → show list of secret commands
      - Type `secret` → reveal a hidden message or fun animation
      - Type `matrix` → brief Matrix-style text rain on the 3D background
      - Type `sudo hire me` → display a fun "Access granted" message
    - Keyboard navigation: arrow keys, enter to select, escape to close
    - Fuzzy search filtering on all commands
  - Register global keyboard listener for Cmd+K/Ctrl+K
  - Style: dark translucent backdrop, purple accent on selection, Space Grotesk + JetBrains Mono

  **Must NOT do**:
  - Do NOT build a command palette from scratch if `cmdk-sv` works — save time
  - Do NOT make it complex — each secret command ≤50 lines
  - Do NOT block regular browser shortcuts (Cmd+C, Cmd+V, etc.)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Modal component, keyboard handling, animation, fuzzy search
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 7 (with Tasks 15, 17)
  - **Blocks**: Task 17 (Easter egg terminal commands live here), Task 20
  - **Blocked By**: Task 3

  **References**:

  **Documentation References**:
  - cmdk-sv: Svelte port of cmdk (command menu component)
  - Svelte 5 keyboard events: `onkeydown` with `$effect` for global listener
  - Dialog element: `<dialog>` for modal with built-in accessibility

  **Acceptance Criteria**:

  **TDD:**
  - [ ] Test: Cmd+K opens command palette
  - [ ] Test: Escape closes command palette
  - [ ] Test: Typing filters commands via fuzzy search
  - [ ] Test: Arrow keys navigate, Enter selects
  - [ ] Test: Navigating to section via command closes palette and scrolls
  - [ ] `bun run test:unit -- --run` → PASS

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Command palette opens, searches, and navigates
    Tool: Playwright
    Steps:
      1. Set viewport: 1280x800
      2. Navigate to: http://localhost:5173
      3. Press: Meta+K (Cmd+K)
      4. Assert: Command palette dialog is visible
      5. Type: "proj"
      6. Assert: "Projects" command is visible in results
      7. Press: Enter
      8. Assert: Palette closes, page scrolled to #projects
      9. Screenshot: .sisyphus/evidence/task-16-palette.png
    Expected Result: Palette opens, searches, navigates
    Evidence: .sisyphus/evidence/task-16-palette.png

  Scenario: Hidden terminal command works
    Tool: Playwright
    Steps:
      1. Press: Meta+K
      2. Type: "help"
      3. Assert: Secret commands list appears
      4. Screenshot: .sisyphus/evidence/task-16-terminal-secret.png
    Expected Result: Hidden commands revealed
    Evidence: .sisyphus/evidence/task-16-terminal-secret.png
  ```

  **Commit**: YES
  - Message: `feat(palette): add command palette with navigation and hidden terminal commands`
  - Pre-commit: `bun run test:unit -- --run`

---

- [x] 17. Easter Eggs (Konami, Hover Reveals, Click Tracker)

  **What to do**:
  - **Konami Code** (`src/lib/utils/konami.ts`):
    - Listen for ↑↑↓↓←→←→BA sequence
    - On trigger: 3D shapes go wild (spin fast, change colors, bloom intensifies) for 3-5 seconds, then return to normal
    - Show brief "🎮 Nice!" toast notification
  - **Long Hover Reveals**:
    - Add `data-reveal` attributes to select elements across sections
    - After 2+ second hover: show hidden tooltip with "behind the scenes" note
    - Examples: Tool items show "why I love this tool", project cards show "fun fact about this project"
    - Content stored in placeholder data alongside main content
  - **Click/Interaction Tracker**:
    - `src/lib/utils/secrets-tracker.ts` — track discovered secrets in `localStorage`
    - Small, subtle indicator in footer or nav: "X/Y secrets found"
    - Secrets: finding all Konami, all hover reveals, all terminal commands, clicking hidden elements
    - Completing all secrets shows a congratulatory message
  - Each Easter egg ≤50 lines of code

  **Must NOT do**:
  - Do NOT make Easter eggs intrusive or block normal usage
  - Do NOT store tracking data server-side — localStorage only
  - Do NOT make the portfolio depend on Easter eggs — they're bonus features

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Small, self-contained features — each ≤50 lines
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 7 (with Tasks 15, 16) — though Konami depends on 3D (Task 7)
  - **Blocks**: Task 20
  - **Blocked By**: Task 16 (terminal commands registered there)

  **References**:

  **Pattern References**:
  - Konami code sequence: `['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']`
  - localStorage API for secret tracking

  **Acceptance Criteria**:

  **TDD:**
  - [ ] Test: Konami code detection triggers callback after correct sequence
  - [ ] Test: Incorrect sequence does NOT trigger
  - [ ] Test: Secrets tracker correctly counts discovered secrets
  - [ ] Test: Secrets persist in localStorage
  - [ ] `bun run test:unit -- --run` → PASS

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Konami code triggers visual effect
    Tool: Playwright
    Steps:
      1. Navigate to: http://localhost:5173
      2. Press keys in sequence: ArrowUp, ArrowUp, ArrowDown, ArrowDown, ArrowLeft, ArrowRight, ArrowLeft, ArrowRight, b, a
      3. Wait 1s
      4. Assert: Visual change occurred (toast notification visible or 3D effect)
      5. Screenshot: .sisyphus/evidence/task-17-konami.png
    Expected Result: Konami code activates Easter egg
    Evidence: .sisyphus/evidence/task-17-konami.png

  Scenario: Secrets tracker updates on discovery
    Tool: Playwright
    Steps:
      1. Navigate to: http://localhost:5173
      2. Assert: Secrets counter shows "0/X"
      3. Trigger Konami code
      4. Assert: Secrets counter increments
    Expected Result: Tracker counts discovered secrets
    Evidence: Screenshot captured
  ```

  **Commit**: YES
  - Message: `feat(easter-eggs): add Konami code, hover reveals, and secrets tracker`
  - Pre-commit: `bun run test:unit -- --run`

---

- [x] 18. Accessibility Audit + prefers-reduced-motion

  **What to do**:
  - Install `@axe-core/playwright` for automated accessibility testing
  - Full accessibility audit:
    - All images have alt text (even placeholders)
    - All interactive elements are keyboard-focusable
    - Focus visible styles (`:focus-visible`) with purple accent ring
    - Skip-to-content link (hidden until focused)
    - ARIA labels on all sections, navigation, lists
    - Color contrast: ensure all text passes WCAG AA against dark background
    - Semantic HTML: proper heading hierarchy (h1 → h2 → h3)
    - Form labels and error announcements (aria-live)
  - `prefers-reduced-motion` comprehensive handling:
    - Disable all GSAP animations
    - Reduce or disable 3D scene animations (slow rotation only, no bloom pulse)
    - Disable custom cursor animations (use default cursor)
    - Disable scroll-triggered transitions (show content immediately)
  - Tab order verification across all sections
  - Screen reader testing focus

  **Must NOT do**:
  - Do NOT break visual design for accessibility — find solutions that work for both
  - Do NOT skip form accessibility (labels, error states, aria-live regions)

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Comprehensive audit requires deep understanding of WCAG, ARIA patterns
  - **Skills**: [`frontend-ui-ux`, `playwright`]
    - `frontend-ui-ux`: Accessible design that doesn't compromise aesthetics
    - `playwright`: Automated accessibility testing with axe-core

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 8 (with Task 19)
  - **Blocks**: Task 20
  - **Blocked By**: Tasks 14, 15

  **References**:

  **Pattern References**:
  - Brittany Chiang accessibility: skip link, ARIA labels on nav/sections, sr-only text, focus-visible styles
  - `prefers-reduced-motion`: `window.matchMedia('(prefers-reduced-motion: reduce)')` or CSS `@media (prefers-reduced-motion: reduce)`

  **Documentation References**:
  - @axe-core/playwright: `import AxeBuilder from '@axe-core/playwright'`
  - WCAG 2.1 AA: Contrast ratio 4.5:1 for normal text, 3:1 for large text
  - ARIA landmarks: section, navigation, main, complementary

  **Acceptance Criteria**:

  **TDD:**
  - [ ] E2E test: `e2e/accessibility.test.ts` — axe-core scan returns zero critical/serious violations
  - [ ] E2E test: All sections keyboard-navigable
  - [ ] E2E test: Skip-to-content link works
  - [ ] `bun run test:e2e` → PASS

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Zero critical accessibility violations
    Tool: Playwright
    Steps:
      1. Navigate to: http://localhost:5173
      2. Run: AxeBuilder(page).analyze()
      3. Assert: results.violations filtered for 'critical' and 'serious' = empty array
      4. Save: violation report to .sisyphus/evidence/task-18-a11y-report.json
    Expected Result: Zero critical/serious violations
    Evidence: .sisyphus/evidence/task-18-a11y-report.json

  Scenario: Keyboard navigation works through all sections
    Tool: Playwright
    Steps:
      1. Navigate to: http://localhost:5173
      2. Press Tab repeatedly
      3. Assert: Focus moves through skip link → nav items → section content → form fields
      4. Assert: Focus visible ring appears on each focused element
    Expected Result: Complete keyboard navigability
    Evidence: Screenshot of focus states
  ```

  **Commit**: YES
  - Message: `fix(a11y): comprehensive accessibility audit, prefers-reduced-motion, and focus management`
  - Pre-commit: `bun run test:e2e`

---

- [x] 19. Performance Optimization (Bundle, 3D, Images)

  **What to do**:
  - **Bundle optimization**:
    - Analyze bundle with `vite-plugin-visualizer` or `bun run build` output
    - Code-split 3D scene (lazy load Threlte components)
    - Tree-shake unused Three.js modules
    - Ensure GSAP is tree-shaken (import specific: `gsap/ScrollTrigger`, not all)
  - **3D performance**:
    - FPS monitoring: auto-reduce quality if <30fps
    - Reduce bloom resolution on lower-end GPUs
    - Use `dispose()` properly on all Three.js resources
    - Verify `<InstancedMesh>` is working (check draw calls)
  - **Image optimization**:
    - Use WebP/AVIF for any images (project thumbnails, OG image)
    - Lazy load images below the fold
    - Set explicit `width`/`height` to prevent CLS
  - **Font optimization**:
    - Only load needed weights (400, 600, 700 for Space Grotesk; 400 for JetBrains Mono)
    - `font-display: swap` for fast initial render
  - **Target**: Lighthouse Performance ≥90 on mobile (without 3D), ≥70 on desktop (with 3D)

  **Must NOT do**:
  - Do NOT remove features for performance — optimize them
  - Do NOT skip 3D optimization — bloom and geometry are the heaviest parts

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Performance optimization requires profiling, analysis, and targeted fixes
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 8 (with Task 18)
  - **Blocks**: Task 20
  - **Blocked By**: Tasks 7, 14

  **References**:

  **Documentation References**:
  - Vite build analysis: `--report` flag or `rollup-plugin-visualizer`
  - Three.js disposal: `.dispose()` on geometries, materials, textures
  - SvelteKit image optimization: `@sveltejs/enhanced-img` or manual WebP conversion

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Lighthouse mobile score ≥90 (without 3D)
    Tool: Playwright
    Steps:
      1. Set viewport: 375x812 (mobile)
      2. Navigate to: http://localhost:4173 (preview server)
      3. Run Lighthouse via Playwright CDP (or capture key metrics)
      4. Assert: Performance score ≥90
    Expected Result: Mobile performance meets target
    Evidence: .sisyphus/evidence/task-19-lighthouse-mobile.json

  Scenario: 3D scene maintains ≥30fps on desktop
    Tool: Playwright
    Steps:
      1. Set viewport: 1280x800
      2. Navigate to: http://localhost:5173
      3. Wait 5s (let 3D settle)
      4. Measure: requestAnimationFrame timing for 60 frames
      5. Assert: Average frame time ≤33ms (≥30fps)
    Expected Result: Smooth 3D rendering
    Evidence: FPS measurements captured

  Scenario: Bundle size within budget
    Tool: Bash
    Steps:
      1. Run: bun run build
      2. Check output for bundle sizes
      3. Assert: Total JS bundle <500KB gzipped
    Expected Result: Lean bundle
    Evidence: Build output captured
  ```

  **Commit**: YES
  - Message: `perf: optimize bundle, 3D rendering, fonts, and images`
  - Pre-commit: `bun run build`

---

- [x] 20. Final E2E Test Suite + Lighthouse Verification

  **What to do**:
  - Create comprehensive E2E test suite `e2e/portfolio.test.ts`:
    - All 8 sections render correctly (desktop + mobile)
    - 3D canvas present on desktop, absent on mobile
    - Navigation works (sidebar clicks, anchor links)
    - Command palette opens/closes/navigates
    - Contact form submits successfully
    - Custom cursor appears on desktop
    - Konami code Easter egg triggers
    - Scroll animations play (content appears on scroll)
    - `prefers-reduced-motion` disables animations
    - No console errors throughout
  - Accessibility E2E (with axe-core):
    - Zero critical violations on all viewports
  - Screenshot evidence for all major states
  - Final `bun run build` + `bun run preview` verification
  - Run full test suite: `bun run test` (unit + e2e)

  **Must NOT do**:
  - Do NOT write flaky tests — use proper waits and assertions
  - Do NOT test implementation details — test user-visible behavior

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Comprehensive test suite covering all features end-to-end
  - **Skills**: [`playwright`]
    - `playwright`: Complex E2E scenarios, screenshot comparison, accessibility testing

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 8 (final task — after 18, 19)
  - **Blocks**: None (final task)
  - **Blocked By**: Tasks 18, 19

  **References**:

  **Pattern References**:
  - `e2e/demo.test.ts` — Existing E2E test pattern
  - `playwright.config.ts` — Existing Playwright configuration

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Full test suite passes
    Tool: Bash
    Steps:
      1. Run: bun run test
      2. Assert: Exit code 0
      3. Assert: All unit tests pass
      4. Assert: All E2E tests pass
    Expected Result: Green test suite across the board
    Evidence: Test output captured

  Scenario: Production build serves correctly
    Tool: Bash + Playwright
    Steps:
      1. Run: bun run build
      2. Assert: Exit code 0
      3. Run: bun run preview &
      4. Navigate to: http://localhost:4173
      5. Assert: All sections visible
      6. Assert: No console errors
      7. Full page screenshot: .sisyphus/evidence/task-20-final-desktop.png
      8. Mobile screenshot: .sisyphus/evidence/task-20-final-mobile.png
    Expected Result: Production build serves complete portfolio
    Evidence: .sisyphus/evidence/task-20-final-desktop.png, task-20-final-mobile.png
  ```

  **Commit**: YES
  - Message: `test(e2e): add comprehensive E2E test suite with accessibility and performance checks`
  - Files: `e2e/portfolio.test.ts`, `e2e/accessibility.test.ts`
  - Pre-commit: `bun run test`

---

## Commit Strategy

| After Task | Message                                                                     | Key Files                           | Verification        |
| ---------- | --------------------------------------------------------------------------- | ----------------------------------- | ------------------- |
| 1          | `feat(infra): add project infrastructure, dependencies, and Tailwind theme` | AGENTS.md, package.json, layout.css | `bun run build`     |
| 2          | `feat(content): add TypeScript content schemas and placeholder data`        | types/, data/                       | `bun run check`     |
| 3          | `feat(layout): add single-page layout with split-panel nav`                 | +page.svelte, Navigation, Section   | `bun run test:unit` |
| 4          | `feat(sections): implement all 8 content sections`                          | sections/\*.svelte                  | `bun run test:unit` |
| 5          | `feat(seo): add meta tags, OG image, sitemap`                               | +layout.svelte, static/             | `bun run build`     |
| 6          | `test(e2e): add foundation E2E tests`                                       | e2e/foundation.test.ts              | `bun run test:e2e`  |
| 7          | `feat(3d): add Threlte 3D background with floating geometry`                | components/3d/                      | `bun run build`     |
| 8          | `feat(hero): implement hero section`                                        | hero component                      | `bun run test:unit` |
| 9          | `feat(sections): implement Who Am I and Tools sections`                     | about, tools components             | `bun run test:unit` |
| 10         | `feat(projects): implement project cards with hover effects`                | projects component                  | `bun run test:unit` |
| 11         | `feat(experience): implement experience timeline`                           | experience component                | `bun run test:unit` |
| 12         | `feat(github): add live GitHub API integration`                             | +page.server.ts                     | `bun run build`     |
| 13         | `feat(contact): add testimonials and contact form`                          | ContactForm, +server.ts             | `bun run test:unit` |
| 14         | `feat(animation): add GSAP scroll-triggered animations`                     | gsap.ts, AnimateOnScroll            | `bun run build`     |
| 15         | `feat(cursor): add custom animated cursor`                                  | CustomCursor.svelte                 | `bun run test:unit` |
| 16         | `feat(palette): add command palette with terminal commands`                 | CommandPalette.svelte               | `bun run test:unit` |
| 17         | `feat(easter-eggs): add Konami code, hover reveals, tracker`                | utils/konami.ts, secrets-tracker.ts | `bun run test:unit` |
| 18         | `fix(a11y): accessibility audit and reduced-motion support`                 | multiple                            | `bun run test:e2e`  |
| 19         | `perf: optimize bundle, 3D, fonts, and images`                              | multiple                            | `bun run build`     |
| 20         | `test(e2e): comprehensive E2E suite`                                        | e2e/portfolio.test.ts               | `bun run test`      |

---

## Success Criteria

### Verification Commands

```bash
# Build succeeds (SSR safe)
bun run build
# Expected: exit code 0, no errors

# All unit tests pass
bun run test:unit -- --run
# Expected: all tests pass

# All E2E tests pass
bun run test:e2e
# Expected: all tests pass

# Full test suite
bun run test
# Expected: exit code 0

# Type checking
bun run check
# Expected: no type errors

# Linting
bun run lint
# Expected: no lint errors
```

### Final Checklist

- [x] All 8 sections render with placeholder content
- [x] 3D background renders on desktop (1280x800)
- [x] No 3D on mobile (375x812)
- [x] Navigation works (sidebar + anchor links)
- [x] Command palette opens with Cmd+K
- [x] Custom cursor follows mouse on desktop
- [x] Konami code triggers Easter egg
- [x] Contact form submits successfully
- [x] GitHub stats display (or graceful fallback)
- [x] All animations respect prefers-reduced-motion
- [x] Zero critical accessibility violations
- [x] Lighthouse Performance ≥90 (mobile)
- [x] `bun run build` succeeds
- [x] `bun run test` passes (all unit + E2E)
- [x] Space Grotesk + JetBrains Mono fonts load correctly
- [x] Dark theme with purple accent throughout
- [x] OG meta tags render in SSR HTML
