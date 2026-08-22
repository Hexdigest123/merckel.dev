<script lang="ts">
	import ContactSection from '$lib/components/sections/ContactSection.svelte';
	import ExperienceSection from '$lib/components/sections/ExperienceSection.svelte';
	import OpenSourceSection from '$lib/components/sections/OpenSourceSection.svelte';
	import ProjectsSection from '$lib/components/sections/ProjectsSection.svelte';
	import SecurityResearchSection from '$lib/components/sections/SecurityResearchSection.svelte';
	import TestimonialsSection from '$lib/components/sections/TestimonialsSection.svelte';
	import ToolsSection from '$lib/components/sections/ToolsSection.svelte';
	import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
	import Navigation from '$lib/components/Navigation.svelte';
	import { siteConfig } from '$lib/data/site-config';
	import { useLocale } from '$lib/i18n/locale.svelte';
	import type { OpenSourceData, PentestingEntry, WebToolWithUsage } from '$lib/types/content';

	const i18n = useLocale();

	const defaultOpenSourceData: OpenSourceData = {
		source: 'fallback',
		profileLabel: i18n.t('openGithubProfile'),
		note: '',
		stats: [],
		contributions: []
	};

	let {
		data = {} as {
			openSource?: OpenSourceData;
			topTools?: WebToolWithUsage[];
			pentestingEntries?: PentestingEntry[];
		}
	}: {
		data: {
			openSource?: OpenSourceData;
			topTools?: WebToolWithUsage[];
			pentestingEntries?: PentestingEntry[];
		};
	} = $props();
	let openSourceData = $derived(data.openSource ?? defaultOpenSourceData);

	let sections = $derived([
		{ id: 'tools', title: i18n.t('navTools') },
		{ id: 'projects', title: i18n.t('navProjects') },
		{ id: 'pentests', title: i18n.t('navPentests') },
		{ id: 'experience', title: i18n.t('navExperience') },
		{ id: 'opensource', title: i18n.t('navOpenSource') },
		{ id: 'testimonials', title: i18n.t('navTestimonials') },
		{ id: 'contact', title: i18n.t('navContact') }
	]);

	let navItems = $derived(sections.map((section) => ({ id: section.id, label: section.title })));
</script>

<main id="main-content" tabindex="-1" class="min-h-screen bg-white pt-14 text-slate-800 lg:pt-0">
	<div class="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
		<header class="mb-16 space-y-6 border-b border-slate-200 pb-10" aria-label="Site identity">
			<div class="flex items-start justify-between gap-4">
				<div class="space-y-2">
					<h1 class="font-sans text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
						{siteConfig.name}
					</h1>
					<p class="text-base text-slate-600 sm:text-lg">{i18n.t('jobTitle')}</p>
				</div>
				<div class="hidden pt-1 lg:block">
					<LanguageSwitcher />
				</div>
			</div>
			<Navigation items={navItems} heading={i18n.t('navHeading')} />
		</header>

		<div class="space-y-16">
			<ToolsSection tools={data.topTools ?? []} />
			<ProjectsSection />
			<SecurityResearchSection entries={data.pentestingEntries ?? []} />
			<ExperienceSection />
			<OpenSourceSection data={openSourceData} />
			<TestimonialsSection />
			<ContactSection />
		</div>
	</div>
</main>
