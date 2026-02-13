# merckel.dev — Project Architecture & Conventions

## Project Overview

**merckel.dev** is a creative, explorable developer portfolio built with SvelteKit, featuring:

- Immersive 3D animated background (desktop only) using Threlte + Three.js
- Single-page responsive layout with 8 content sections
- Dark theme with purple accent color (#8b5cf6)
- Interactive features: custom cursor, command palette, Easter eggs
- Full TDD test suite (Vitest + Playwright)

**Tech Stack**:

- **Framework**: SvelteKit 2.50+ with Svelte 5 runes
- **Styling**: Tailwind CSS v4 (CSS-first `@theme` directive, no JS config)
- **3D**: Threlte 8 + Three.js
- **Animation**: GSAP 3.13+
- **Testing**: Vitest (unit/component) + Playwright (E2E)
- **Package Manager**: Bun (exclusively)
- **Deployment**: Node.js adapter (self-hosted VPS)

---

## Architecture

### Directory Structure

```
src/
├── routes/
│   ├── +layout.svelte          # Root layout with font imports
│   ├── layout.css              # Tailwind v4 @theme tokens
│   ├── +page.svelte            # Single-page portfolio (8 sections)
│   └── +layout.server.ts       # Server-side data (isMobile detection)
├── lib/
│   ├── components/
│   │   ├── Navigation.svelte    # Sticky sidebar nav (desktop)
│   │   ├── Section.svelte       # Section container component
│   │   ├── Hero.svelte          # Hero section
│   │   ├── About.svelte         # Who Am I section
│   │   ├── Tools.svelte         # Tools grid
│   │   ├── Projects.svelte      # Project cards
│   │   ├── Experience.svelte    # Timeline entries
│   │   ├── OpenSource.svelte    # GitHub stats
│   │   ├── Testimonials.svelte  # Quote cards
│   │   ├── Contact.svelte       # Contact form + socials
│   │   └── __tests__/           # Component tests
│   ├── components/3d/
│   │   ├── Scene.svelte         # Main 3D background
│   │   ├── FloatingShape.svelte # Individual 3D shape
│   │   └── __tests__/           # 3D component tests
│   ├── types/
│   │   └── content.ts           # TypeScript interfaces (Project, Experience, etc.)
│   ├── data/
│   │   ├── projects.ts          # Placeholder project data
│   │   ├── experience.ts        # Placeholder experience data
│   │   ├── tools.ts             # Placeholder tools data
│   │   ├── testimonials.ts      # Placeholder testimonials
│   │   └── site-config.ts       # Site-wide config (name, title, bio, socials)
│   ├── utils/
│   │   ├── cursor.ts            # Custom cursor helpers
│   │   ├── scroll.ts            # Scroll utilities
│   │   └── easter-eggs.ts       # Easter egg logic
│   ├── stores/
│   │   └── (Svelte 5 runes only — no legacy stores)
│   ├── assets/
│   │   └── favicon.svg
│   └── __tests__/
│       └── infrastructure.test.ts
├── hooks.server.ts             # Server hooks (mobile detection)
└── app.html                    # HTML shell

static/
├── og.png                      # OpenGraph image
├── sitemap.xml                 # SEO sitemap
└── robots.txt                  # Robots directive

e2e/
├── foundation.test.ts          # Foundation E2E tests
└── demo.test.ts                # Existing demo tests

.sisyphus/
├── plans/
│   └── portfolio-threejs.md    # Master plan (READ-ONLY)
└── notepads/
    └── portfolio-threejs/
        ├── learnings.md        # Patterns, conventions, successful approaches
        ├── issues.md           # Problems, blockers, gotchas
        ├── decisions.md        # Architectural choices
        └── problems.md         # Unresolved issues, technical debt
```

---

## Coding Standards

### Svelte 5 Runes (MANDATORY)

**MUST USE**:

- `$state()` for reactive variables
- `$derived()` for computed values
- `$effect()` for side effects
- `$props()` for component props

**MUST NOT USE**:

- Legacy `$:` reactive declarations
- Svelte stores (`writable`, `readable`, `derived`)
- `onMount`, `onDestroy` (use `$effect` instead)

**Example**:

```svelte
<script lang="ts">
	let { title = 'Default' } = $props();
	let count = $state(0);
	let doubled = $derived(count * 2);

	$effect(() => {
		console.log(`Count changed to ${count}`);
		return () => console.log('Cleanup');
	});
</script>
```

### TypeScript

- **Strict mode**: `tsconfig.json` enforces strict type checking
- **Interfaces**: Define all data shapes in `src/lib/types/`
- **No `any`**: Use `unknown` with type guards if needed
- **Imports**: Use `$lib` alias for all internal imports

**Example**:

```typescript
// src/lib/types/content.ts
export interface Project {
	id: string;
	title: string;
	description: string;
	tags: string[];
	featured: boolean;
}

// src/lib/data/projects.ts
import type { Project } from '$lib/types/content';
export const projects: Project[] = [
	/* ... */
];

// In components
import { projects } from '$lib/data/projects';
```

### Tailwind v4 CSS-First Theming

**MUST DO**:

- Define all design tokens in `src/routes/layout.css` using `@theme {}` block
- Use CSS custom properties (variables) for colors, fonts, spacing
- No `tailwind.config.ts` or `tailwind.config.js` file

**MUST NOT DO**:

- Do NOT create a Tailwind config file
- Do NOT use `theme()` function in CSS (use CSS variables instead)

**Example** (`src/routes/layout.css`):

```css
@import 'tailwindcss';
@plugin '@tailwindcss/forms';
@plugin '@tailwindcss/typography';

@theme {
	--color-slate-900: #0f172a;
	--color-purple-500: #8b5cf6;
	--font-sans: 'Space Grotesk', sans-serif;
	--font-mono: 'JetBrains Mono', monospace;
}
```

### Component Structure

**Single-File Components** (`.svelte`):

```svelte
<script lang="ts">
	// 1. Imports
	import type { ComponentProps } from '$lib/types';
	import { someUtil } from '$lib/utils';

	// 2. Props
	let { title, items = [] } = $props();

	// 3. State
	let isOpen = $state(false);

	// 4. Derived
	let itemCount = $derived(items.length);

	// 5. Effects
	$effect(() => {
		// Side effects here
	});

	// 6. Functions
	function handleClick() {
		isOpen = !isOpen;
	}
</script>

<!-- 7. Markup -->
<div class="component">
	<h2>{title}</h2>
	{#each items as item (item.id)}
		<p>{item.name}</p>
	{/each}
</div>

<!-- 8. Styles (scoped) -->
<style>
	.component {
		@apply rounded-lg p-4;
	}
</style>
```

### Testing

**Unit/Component Tests** (`src/lib/__tests__/*.test.ts`):

- Use Vitest + `vitest-browser-svelte`
- Test structure: `describe` → `it` → `expect`
- Mock external APIs (GitHub, contact form)

**Example**:

```typescript
import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Hero from '$lib/components/Hero.svelte';

describe('Hero', () => {
	it('renders name from props', () => {
		const { getByText } = render(Hero, { props: { name: 'John' } });
		expect(getByText('John')).toBeDefined();
	});
});
```

**E2E Tests** (`e2e/*.test.ts`):

- Use Playwright
- Test user workflows (navigation, form submission, interactions)
- Assert DOM state, screenshots, network requests

**Example**:

```typescript
import { test, expect } from '@playwright/test';

test('hero section displays correctly', async ({ page }) => {
	await page.goto('http://localhost:5173');
	const hero = page.locator('section#hero');
	await expect(hero).toBeVisible();
	await expect(hero.locator('h1')).toContainText('John Doe');
});
```

### Performance & SSR Safety

**SSR Guards**:

- Wrap browser-only code with `{#if browser}` or `import { browser } from '$app/environment'`
- Never access `window`, `document`, `localStorage` in server context

**Example**:

```svelte
<script lang="ts">
	import { browser } from '$app/environment';
	import Scene from '$lib/components/3d/Scene.svelte';
</script>

{#if browser}
	<Scene />
{/if}
```

**High-Frequency Updates** (cursor, scroll):

- Use `gsap.quickSetter()` instead of `$state` for 60fps updates
- Avoid reactive variable updates in animation loops

**Example**:

```typescript
import gsap from 'gsap';

let x = 0,
	y = 0;
const setX = gsap.quickSetter(element, 'x', 'px');
const setY = gsap.quickSetter(element, 'y', 'px');

document.addEventListener('mousemove', (e) => {
	x = e.clientX;
	y = e.clientY;
	setX(x);
	setY(y);
});
```

### Naming Conventions

| Type             | Convention       | Example                              |
| ---------------- | ---------------- | ------------------------------------ |
| Components       | PascalCase       | `Hero.svelte`, `ProjectCard.svelte`  |
| Files            | kebab-case       | `hero.svelte`, `project-card.svelte` |
| Variables        | camelCase        | `isOpen`, `projectCount`             |
| Constants        | UPPER_SNAKE_CASE | `MAX_ITEMS`, `API_TIMEOUT`           |
| CSS Classes      | kebab-case       | `hero-section`, `project-card`       |
| Types/Interfaces | PascalCase       | `Project`, `Experience`              |

### Git Workflow

- **Commits**: Atomic, descriptive messages
  - Format: `feat(scope): description` or `fix(scope): description`
  - Example: `feat(infra): add Tailwind theme and font imports`
- **Branches**: Feature branches from `main`
- **Pre-commit**: Run `bun run lint` and `bun run build`

---

## Design System

### Colors

**Palette** (defined in `src/routes/layout.css`):

- **Base**: `slate-900` (#0f172a) — dark background
- **Accent**: `purple-500` (#8b5cf6) — primary interactive color
- **Text**: `slate-200` (primary), `slate-400` (secondary), `slate-500` (tertiary)
- **Borders**: `slate-700` with transparency

**Usage**:

```css
/* In components */
<div class="bg-slate-900 text-slate-200 border border-slate-700/50">
  <button class="bg-purple-500 hover:bg-purple-600">Action</button>
</div>
```

### Typography

**Fonts**:

- **Display/Headings**: Space Grotesk (400, 600, 700 weights)
- **Body**: Space Grotesk (400)
- **Monospace/Code**: JetBrains Mono (400)

**Hierarchy**:

- `h1`: 3xl–4xl, bold (700), Space Grotesk
- `h2`: 2xl–3xl, semibold (600), Space Grotesk
- `h3`: xl–2xl, semibold (600), Space Grotesk
- `body`: base–lg, regular (400), Space Grotesk
- `code`: sm, regular (400), JetBrains Mono

### Spacing & Layout

- **Base unit**: 4px (Tailwind default)
- **Sections**: `py-16 lg:py-24` (vertical padding)
- **Content width**: `max-w-4xl` (desktop), full width (mobile)
- **Gaps**: `gap-4` (small), `gap-8` (medium), `gap-12` (large)

### Responsive Breakpoints

- **Mobile**: < 640px (default)
- **Tablet**: `sm:` 640px+
- **Desktop**: `lg:` 1024px+
- **Large Desktop**: `xl:` 1280px+

---

## Development Workflow

### Local Setup

```bash
# Install dependencies
bun install

# Start dev server
bun run dev

# Run tests
bun run test:unit -- --run
bun run test:e2e

# Build for production
bun run build

# Preview production build
bun run preview
```

### Common Tasks

**Add a new component**:

1. Create `src/lib/components/MyComponent.svelte`
2. Write test in `src/lib/components/__tests__/MyComponent.test.ts`
3. Import and use in parent component

**Add new data**:

1. Define interface in `src/lib/types/content.ts`
2. Create data file in `src/lib/data/`
3. Import in components: `import { items } from '$lib/data/items'`

**Add a utility function**:

1. Create `src/lib/utils/myUtil.ts`
2. Export function with JSDoc comments
3. Import in components: `import { myFunc } from '$lib/utils/myUtil'`

---

## Key Decisions & Rationale

### Why Tailwind v4 CSS-First?

- **No JS config overhead**: Faster builds, simpler deployment
- **Design tokens in CSS**: Easier to audit and modify
- **Plugin system**: Extensible without config files

### Why Svelte 5 Runes?

- **Modern reactivity**: Cleaner, more explicit than legacy syntax
- **Better performance**: Compiler optimizations for runes
- **Future-proof**: Svelte 5 is the standard going forward

### Why GSAP for Animations?

- **Performance**: Optimized for 60fps, uses `requestAnimationFrame`
- **Scroll integration**: `ScrollTrigger` plugin for scroll-linked animations
- **Free**: v3.13+ is 100% free (no license restrictions)

### Why Threlte for 3D?

- **Svelte-native**: Declarative `<T>` components, not imperative Three.js
- **SSR-safe**: Built-in guards for server rendering
- **Extras**: Pre-built components (bloom, postprocessing, etc.)

---

## Troubleshooting

### Build Fails with "Cannot resolve 'tailwindcss'"

- Ensure `@tailwindcss/vite` is in `devDependencies`
- Run `bun install`

### 3D Canvas Not Rendering

- Check browser console for WebGL errors
- Verify `{#if browser}` guard is in place
- Test on desktop (mobile detection may disable 3D)

### Font Not Loading

- Verify `@fontsource` imports in `src/routes/+layout.svelte`
- Check CSS `@theme` block has `--font-sans` and `--font-mono` defined
- Clear browser cache and rebuild

### Tests Fail with "Cannot find module"

- Ensure `$lib` alias is configured in `tsconfig.json` and `vite.config.ts`
- Run `bun run prepare` to sync SvelteKit

---

## Resources

- **SvelteKit**: https://kit.svelte.dev
- **Svelte 5**: https://svelte.dev
- **Tailwind v4**: https://tailwindcss.com/docs/v4
- **Threlte**: https://threlte.xyz
- **GSAP**: https://gsap.com
- **Playwright**: https://playwright.dev
- **Vitest**: https://vitest.dev

---

**Last Updated**: 2026-02-13
**Maintained By**: Development Team
