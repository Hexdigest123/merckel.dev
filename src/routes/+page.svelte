<script lang="ts">
	import { browser } from '$app/environment';
	import AnimateOnScroll from '$lib/components/AnimateOnScroll.svelte';
	import Navigation from '$lib/components/Navigation.svelte';
	import AboutSection from '$lib/components/sections/AboutSection.svelte';
	import ContactSection from '$lib/components/sections/ContactSection.svelte';
	import ExperienceSection from '$lib/components/sections/ExperienceSection.svelte';
	import OpenSourceSection from '$lib/components/sections/OpenSourceSection.svelte';
	import ProjectsSection from '$lib/components/sections/ProjectsSection.svelte';
	import TestimonialsSection from '$lib/components/sections/TestimonialsSection.svelte';
	import ToolsSection from '$lib/components/sections/ToolsSection.svelte';
	import { siteConfig } from '$lib/data/site-config';
	import type { WebToolWithUsage } from '$lib/types/content';
	import { ensureScrollTriggerRefreshOnNavigate } from '$lib/utils/gsap';

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
		profileLabel: 'GitHub-Profil besuchen',
		note: 'Open-Source-Highlights verwenden derzeit lokale Portfolio-Daten.',
		stats: [],
		contributions: []
	};

	let {
		data = {} as { openSource?: OpenSourceData; topTools?: WebToolWithUsage[] }
	}: { data: { openSource?: OpenSourceData; topTools?: WebToolWithUsage[] } } = $props();
	let openSourceData = $derived(data.openSource ?? defaultOpenSourceData);

	const sections = [
		{ id: 'about', title: 'Über mich' },
		{ id: 'tools', title: 'Werkzeuge' },
		{ id: 'projects', title: 'Projekte' },
		{ id: 'experience', title: 'Erfahrung' },
		{ id: 'opensource', title: 'Open Source' },
		{ id: 'testimonials', title: 'Referenzen' },
		{ id: 'contact', title: 'Kontakt' }
	] as const;

	const navItems = sections.map((section) => ({ id: section.id, label: section.title }));

	$effect(() => {
		if (!browser) {
			return;
		}

		ensureScrollTriggerRefreshOnNavigate();
	});
</script>

<main
	id="main-content"
	tabindex="-1"
	class="min-h-screen bg-slate-900 pt-14 text-slate-200 lg:pt-0"
>
	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
		<div class="lg:grid lg:grid-cols-[minmax(16rem,22rem),1fr] lg:gap-14">
			<aside
				class="hidden lg:flex lg:flex-col lg:justify-between lg:py-6"
				aria-label="Site profile"
			>
				<div class="mb-4 space-y-4">
					<p class="font-mono text-xs tracking-[0.24em] text-purple-300 uppercase">Portfolio</p>
					<h1 class="font-sans text-4xl font-semibold tracking-tight text-slate-100">
						{siteConfig.name}
					</h1>
					<p class="max-w-xs text-slate-400">{siteConfig.subtitle}</p>
				</div>
				<Navigation items={navItems} heading="Sektionen" />
			</aside>

			<div class="space-y-10 pt-4 lg:pt-0">
				<AnimateOnScroll>
					<AboutSection />
				</AnimateOnScroll>
				<AnimateOnScroll>
					<ToolsSection tools={data.topTools ?? []} />
				</AnimateOnScroll>
				<AnimateOnScroll>
					<ProjectsSection />
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
</main>
