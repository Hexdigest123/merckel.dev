<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import type { Component } from 'svelte';
	import type { Snippet } from 'svelte';
	import '@fontsource/space-grotesk/latin-400.css';
	import '@fontsource/space-grotesk/latin-600.css';
	import '@fontsource/space-grotesk/latin-700.css';
	import '@fontsource/jetbrains-mono/latin-400.css';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import CommandPalette from '$lib/components/CommandPalette.svelte';
	import CustomCursor from '$lib/components/CustomCursor.svelte';
	import MobileHeader from '$lib/components/MobileHeader.svelte';
	import { siteConfig } from '$lib/data/site-config';

	let { children, data }: { children: Snippet; data: { isMobile?: boolean } } = $props();
	let SceneComponent = $state<Component | null>(null);
	let hasReducedMotion = $state(false);
	let hasWebglSupport = $state(true);
	let has3DBackground = $derived(
		browser && !data.isMobile && !hasReducedMotion && hasWebglSupport && SceneComponent !== null
	);

	const siteUrl = 'https://merckel.dev';
	const homeTitle = `${siteConfig.name} — merckel.dev`;
	const siteDescription = siteConfig.bio;
	let pageTitle = $derived.by(() => {
		const t = (page.data as { title?: unknown })?.title;
		return typeof t === 'string' && t.length > 0 ? `${t} — merckel.dev` : homeTitle;
	});
	let pageDescription = $derived.by(() => {
		const d = (page.data as { description?: unknown })?.description;
		return typeof d === 'string' && d.length > 0 ? d : siteDescription;
	});
	const ogImageUrl = `${siteUrl}/og.png`;
	const jsonLdSchema = {
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: siteConfig.name,
		jobTitle: siteConfig.title,
		description: siteDescription,
		url: siteUrl,
		email: siteConfig.email,
		sameAs: siteConfig.socials.map((s) => s.url)
	};

	$effect(() => {
		if (!browser || data.isMobile || hasReducedMotion || !hasWebglSupport || SceneComponent) {
			return;
		}

		let cancelled = false;
		const loadScene = async () => {
			const module = await import('$lib/components/3d/Scene.svelte');
			if (!cancelled) {
				SceneComponent = module.default;
			}
		};

		const idleId =
			typeof window.requestIdleCallback === 'function'
				? window.requestIdleCallback(
						() => {
							void loadScene();
						},
						{ timeout: 300 }
					)
				: null;
		const timeout = idleId === null ? window.setTimeout(() => void loadScene(), 120) : null;

		return () => {
			cancelled = true;
			if (idleId !== null && typeof window.cancelIdleCallback === 'function') {
				window.cancelIdleCallback(idleId);
			}
			if (timeout !== null) {
				window.clearTimeout(timeout);
			}
		};
	});

	$effect(() => {
		if (!browser || typeof window.matchMedia !== 'function') {
			return;
		}

		hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

		const updateMotionPreference = () => {
			hasReducedMotion = mediaQuery.matches;
		};

		mediaQuery.addEventListener('change', updateMotionPreference);

		return () => {
			mediaQuery.removeEventListener('change', updateMotionPreference);
		};
	});

	$effect(() => {
		if (!browser) {
			return;
		}

		const canvas = document.createElement('canvas');
		hasWebglSupport = Boolean(
			canvas.getContext('webgl2') ||
			canvas.getContext('webgl') ||
			canvas.getContext('experimental-webgl')
		);
	});

	// --- Command palette sections (hash-navigation targets on main page) ---
	const sections = [
		{ id: 'about', title: 'Über mich' },
		{ id: 'tools', title: 'Werkzeuge' },
		{ id: 'projects', title: 'Projekte' },
		{ id: 'pentests', title: 'Pentests' },
		{ id: 'experience', title: 'Erfahrung' },
		{ id: 'opensource', title: 'Open Source' },
		{ id: 'testimonials', title: 'Referenzen' },
		{ id: 'contact', title: 'Kontakt' }
	] as const;

</script>

<svelte:head>
	<!-- Essential Meta Tags -->
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta name="theme-color" content="#0f172a" />
	<link rel="canonical" href={siteUrl} />

	<!-- Open Graph Tags -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={siteUrl} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:image" content={ogImageUrl} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />

	<!-- Twitter Card Tags -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content={siteUrl} />
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={pageDescription} />
	<meta name="twitter:image" content={ogImageUrl} />

	<!-- JSON-LD Person Schema -->
	<script type="application/ld+json">
		{JSON.stringify(jsonLdSchema)}
	</script>

	<!-- Favicon -->
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="layout-root" class:has-3d-background={has3DBackground}>
	{#if has3DBackground && SceneComponent}
		<SceneComponent />
	{/if}

	<CommandPalette {sections} />

	<div class="content-layer">
		<MobileHeader navItems={sections.map((s) => ({ id: s.id, label: s.title }))} />
		<a
			href="#main-content"
			class="sr-only z-50 rounded-md bg-slate-100 px-4 py-2 font-mono text-xs tracking-wide text-slate-900 focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
		>
			Zum Hauptinhalt springen
		</a>
		{@render children()}
	</div>
	<CustomCursor />
</div>

<style>
	.layout-root {
		position: relative;
		min-height: 100vh;
		isolation: isolate;
	}

	.content-layer {
		position: relative;
		z-index: 1;
	}

	.has-3d-background :global(main.bg-slate-900) {
		background-color: rgb(15 23 42 / 0.76);
	}

	@media (max-width: 1023px) {
		.has-3d-background :global(main.bg-slate-900) {
			background-color: #0f172a;
		}
	}
</style>
