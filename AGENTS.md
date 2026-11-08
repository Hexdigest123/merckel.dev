# merckel.dev — Project Architecture & Conventions

## Project Overview

**merckel.dev** is a bilingual (English/German) developer portfolio built with SvelteKit, featuring:

- Single-page portfolio with 7 sections (tools, projects, pentests, experience, open source, references, contact)
- Light theme with purple accent color (#8b5cf6)
- Ten browser-based developer tools under `/tools` (URL shortener with click stats, QR codes, cron, diff, JSON, regex, Markdown, CSS gradients, colors, image conversion)
- Pentest writeups rendered from Markdown in `src/content/pentesting/`
- Command palette (Ctrl/Cmd+K), contact form widget, language switcher
- PostgreSQL (Drizzle ORM) for short links, tool usage counters and the GitHub API cache

**Tech Stack**:

- **Framework**: SvelteKit 2 with Svelte 5 runes
- **Styling**: Tailwind CSS v4 (CSS-first `@theme` directive, no JS config)
- **Database**: PostgreSQL + Drizzle ORM (`postgres.js` driver)
- **Testing**: Vitest (server tests in Node, component tests in jsdom)
- **Package Manager**: Bun (exclusively)
- **Deployment**: Node.js adapter in Docker (self-hosted VPS)

> `src/lib/components/3d/`, `CustomCursor.svelte`, `AnimateOnScroll.svelte`, `sections/AboutSection.svelte`
> and `src/lib/utils/gsap.ts` belong to an earlier dark, 3D design and are currently not used by any route.

---

## Architecture

### Directory Structure

```
src/
├── routes/
│   ├── +layout.svelte            # Root layout: <head>/SEO, locale store, command palette, contact widget
│   ├── +layout.server.ts         # Locale from cookie / Accept-Language
│   ├── layout.css                # Tailwind v4 @theme tokens
│   ├── +page.svelte              # Home page (sections)
│   ├── +page.server.ts           # GitHub data (memory + DB cache), top tools, writeups
│   ├── +error.svelte             # Localized error page
│   ├── sitemap.xml/+server.ts    # Generated sitemap
│   ├── api/                      # contact, health, tools/shorten, tools/usage
│   ├── s/[code]/+server.ts       # Short-link redirect
│   ├── pentesting/               # Writeup list + [slug] detail pages
│   └── tools/                    # Tools index + one folder per tool (+page.ts provides title/description)
├── lib/
│   ├── components/               # Shared components (Navigation, Section, CommandPalette, ...)
│   │   ├── sections/             # Home page sections
│   │   ├── tools/                # ToolHeader, LinkStats
│   │   └── __tests__/            # Component tests
│   ├── data/                     # Static content (projects, experience, web-tools, sections, site-config)
│   ├── i18n/                     # messages.ts, locale helpers, LocaleStore (locale.svelte.ts)
│   ├── server/                   # db/, services/ (rate limit, url shortener, usage, contact), content/
│   ├── types/content.ts          # TypeScript interfaces
│   └── utils/                    # Pure helpers (markdown, json highlight, diff, dates, clipboard, ...)
├── content/pentesting/           # Markdown writeups (frontmatter: title, date, published, lang, ...)
├── hooks.server.ts               # Locale detection + security headers
└── app.html                      # HTML shell

static/                           # og.png, robots.txt, project screenshots
drizzle/                          # SQL migrations (run on container start)
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
export const projects: Project[] = [/* ... */];

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

- `bun run test` runs Vitest once; `bun run test:unit` starts watch mode.
- `*.test.ts` / `*.spec.ts` run in Node (server project); `*.svelte.test.ts` / `*.svelte.spec.ts`
  run in jsdom (client project) and mount components with Svelte's `mount()`.
- Mock external APIs (GitHub, SMTP, database) with `vi.mock` / `vi.stubGlobal`.
- Components that call `useLocale()` need a locale context; see
  `src/lib/components/__tests__/CommandPaletteLocaleWrapper.svelte`.

**Example**:

```typescript
import { describe, it, expect } from 'vitest';
import { render } from 'svelte/server';
import Section from '$lib/components/Section.svelte';

describe('Section', () => {
	it('renders the title', () => {
		const { body } = render(Section, { props: { id: 'tools', title: 'Tools' } });
		expect(body).toContain('id="tools-heading"');
	});
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

- **Base**: white background
- **Accent**: `purple-500` (#8b5cf6) for buttons, `purple-600`/`purple-700` for text and links
- **Text**: `slate-900` (headings), `slate-600`/`slate-700` (body), `slate-500` (secondary)
- **Borders**: `slate-200`
- Body text must keep at least 4.5:1 contrast on white, so avoid `slate-400` and the light
  `*-200`/`*-300` shades for anything people need to read.

**Usage**:

```html
<div class="border border-slate-200 bg-white text-slate-700">
	<button class="bg-purple-500 text-white hover:bg-purple-600">Action</button>
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

## Project Conventions & Gotchas

- **i18n**: shared strings live in `src/lib/i18n/messages.ts` (both locales must have the same keys).
  Tool pages keep their own `{ de, en }` dictionary and pick it with `COPY[i18n.current]`.
  Server/universal loads localize with `createTranslator(locale)`.
- **Links**: wrap internal hrefs in `resolve()` from `$app/paths`; external links get
  `rel="external noreferrer"` (required by `svelte/no-navigation-without-resolve`).
- **CSP**: `kit.csp` in `svelte.config.js` uses nonces, so inline `<script>`s and `on*=""`
  attributes do not run. Inline `style` attributes are allowed.
- **Tailwind v4 arbitrary values**: separate grid tracks with `_`, not `,`
  (`grid-cols-[minmax(0,14rem)_1fr]`); commas are emitted verbatim and make the rule invalid.
- **Tools**: record usage with `trackToolUsage(id)` (once per session) and copy with
  `CopyFeedback` from `$lib/utils/clipboard.svelte`.
- **Rate limiting** identifies clients via `X-Forwarded-For` using `XFF_DEPTH` trusted proxies.
- **postgres.js `backoff`** must return seconds, not milliseconds.

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
- **Vitest**: https://vitest.dev

---

**Last Updated**: 2026-11-08
**Maintained By**: Development Team
