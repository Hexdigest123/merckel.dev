<script lang="ts">
	import { browser } from '$app/environment';
	import AnimateOnScroll from '$lib/components/AnimateOnScroll.svelte';
	import CommandPalette from '$lib/components/CommandPalette.svelte';
	import Navigation from '$lib/components/Navigation.svelte';
	import AboutSection from '$lib/components/sections/AboutSection.svelte';
	import ContactSection from '$lib/components/sections/ContactSection.svelte';
	import ExperienceSection from '$lib/components/sections/ExperienceSection.svelte';
	import HeroSection from '$lib/components/sections/HeroSection.svelte';
	import OpenSourceSection from '$lib/components/sections/OpenSourceSection.svelte';
	import ProjectsSection from '$lib/components/sections/ProjectsSection.svelte';
	import TestimonialsSection from '$lib/components/sections/TestimonialsSection.svelte';
	import ToolsSection from '$lib/components/sections/ToolsSection.svelte';
	import { siteConfig } from '$lib/data/site-config';
	import type { WebToolWithUsage } from '$lib/types/content';
	import { ensureScrollTriggerRefreshOnNavigate } from '$lib/utils/gsap';
	import { createKonamiDetector } from '$lib/utils/konami';
	import { revealSecret, getSecretsState } from '$lib/utils/secrets-tracker';

	interface OpenSourceData {
		source: 'github' | 'fallback';
		profileUrl?: string;
		profileLabel: string;
		note: string;
		stats: Array<{ label: string; value: string }>;
		contributions: Array<{
			id: string;
			title: string;
			description: string;
			tags: string[];
			url?: string;
		}>;
	}

	const defaultOpenSourceData: OpenSourceData = {
		source: 'fallback',
		profileLabel: 'Visit GitHub profile',
		note: 'Open-source highlights are currently using local portfolio data.',
		stats: [],
		contributions: []
	};

	let {
		data = {} as { openSource?: OpenSourceData; topTools?: WebToolWithUsage[] }
	}: { data: { openSource?: OpenSourceData; topTools?: WebToolWithUsage[] } } = $props();
	let openSourceData = $derived(data.openSource ?? defaultOpenSourceData);

	const sections = [
		{
			id: 'about',
			title: 'About'
		},
		{
			id: 'tools',
			title: 'Tools'
		},
		{
			id: 'projects',
			title: 'Projects'
		},
		{
			id: 'experience',
			title: 'Experience'
		},
		{
			id: 'opensource',
			title: 'Open Source'
		},
		{
			id: 'testimonials',
			title: 'Testimonials'
		},
		{
			id: 'contact',
			title: 'Contact'
		}
	] as const;

	const navItems = sections.map((section) => ({ id: section.id, label: section.title }));

	let konamiMessage = $state('');
	let secretsState = $state(getSecretsState());

	function handleSecretRevealed(secretId: string) {
		secretsState = revealSecret(secretId);
	}

	$effect(() => {
		if (!browser) {
			return;
		}

		ensureScrollTriggerRefreshOnNavigate();

		const detector = createKonamiDetector({
			onDetected: () => {
				handleSecretRevealed('konami');
				konamiMessage = '🎮 Konami Code Activated!';
				setTimeout(() => {
					konamiMessage = '';
				}, 3000);
			}
		});

		detector.start();

		return () => {
			detector.cleanup();
		};
	});
</script>

<main id="main-content" tabindex="-1" class="min-h-screen bg-slate-900 text-slate-200">
	<CommandPalette {sections} onSecretRevealed={handleSecretRevealed} />
	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
		<div class="lg:grid lg:grid-cols-[minmax(16rem,22rem),1fr] lg:gap-14">
			<aside
				class="hidden lg:flex lg:flex-col lg:justify-between lg:py-6"
				aria-label="Site profile"
			>
				<div class="space-y-4">
					<p class="font-mono text-xs tracking-[0.24em] text-purple-300 uppercase">
						Portfolio Shell
					</p>
					<h1 class="font-sans text-4xl font-semibold tracking-tight text-slate-100">
						{siteConfig.name}
					</h1>
					<p class="max-w-xs text-slate-400">{siteConfig.subtitle}</p>
				</div>
				<Navigation items={navItems} heading="Sections" />
			</aside>

			<div class="space-y-10 pt-4 lg:pt-0">
				<AnimateOnScroll mode="hero" y={14} stagger={0.1}>
					<HeroSection />
				</AnimateOnScroll>
				<AnimateOnScroll>
					<AboutSection />
				</AnimateOnScroll>
				<AnimateOnScroll>
					<ToolsSection tools={data.topTools ?? []} />
				</AnimateOnScroll>
				<AnimateOnScroll>
					<ProjectsSection onSecretRevealed={handleSecretRevealed} />
				</AnimateOnScroll>
				<AnimateOnScroll>
					<ExperienceSection />
				</AnimateOnScroll>
				<AnimateOnScroll>
					<OpenSourceSection data={openSourceData} />
				</AnimateOnScroll>
				<AnimateOnScroll>
					<TestimonialsSection />
				</AnimateOnScroll>
				<AnimateOnScroll>
					<ContactSection />
				</AnimateOnScroll>
			</div>
		</div>
	</div>

	{#if konamiMessage}
		<div
			class="fixed bottom-4 left-4 z-50 rounded-lg border border-purple-400/50 bg-purple-900/90 px-4 py-3 font-mono text-sm text-purple-100 shadow-lg backdrop-blur-sm"
			role="status"
			aria-live="polite"
		>
			{konamiMessage}
		</div>
	{/if}

	{#if secretsState.found > 0}
		<div
			class="fixed top-4 left-4 z-30 rounded-lg border border-slate-600/50 bg-slate-900/75 px-3 py-2 font-mono text-xs text-slate-300 backdrop-blur-sm"
			title="Secrets found"
		>
			🔓 {secretsState.found}/{secretsState.total}
		</div>
	{/if}
</main>
