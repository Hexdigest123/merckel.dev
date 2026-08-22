<script lang="ts">
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';
	import '@fontsource/space-grotesk/latin-400.css';
	import '@fontsource/space-grotesk/latin-600.css';
	import '@fontsource/space-grotesk/latin-700.css';
	import '@fontsource/jetbrains-mono/latin-400.css';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import CommandPalette from '$lib/components/CommandPalette.svelte';
	import ContactWidget from '$lib/components/ContactWidget.svelte';
	import MobileHeader from '$lib/components/MobileHeader.svelte';
	import { siteConfig } from '$lib/data/site-config';
	import { createLocaleStore, parseLocale } from '$lib/i18n/locale.svelte';
	import type { Locale } from '$lib/i18n/messages';

	let {
		children,
		data
	}: {
		children: Snippet;
		data: { isMobile?: boolean; locale?: Locale };
	} = $props();

	const i18n = createLocaleStore(parseLocale(data.locale));

	const siteUrl = 'https://merckel.dev';
	const homeTitle = `${siteConfig.name} — merckel.dev`;
	let siteDescription = $derived(i18n.t('jobTitle'));
	let pageTitle = $derived.by(() => {
		const title = (page.data as { title?: unknown })?.title;
		return typeof title === 'string' && title.length > 0 ? `${title} — merckel.dev` : homeTitle;
	});
	let pageDescription = $derived.by(() => {
		const description = (page.data as { description?: unknown })?.description;
		return typeof description === 'string' && description.length > 0 ? description : siteDescription;
	});
	const ogImageUrl = `${siteUrl}/og.png`;
	let jsonLdSchema = $derived({
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: siteConfig.name,
		jobTitle: i18n.t('jobTitle'),
		description: siteDescription,
		url: siteUrl,
		email: siteConfig.email,
		sameAs: siteConfig.socials.filter((s) => s.icon !== 'email').map((s) => s.url)
	});

	let sections = $derived([
		{ id: 'tools', title: i18n.t('navTools') },
		{ id: 'projects', title: i18n.t('navProjects') },
		{ id: 'pentests', title: i18n.t('navPentests') },
		{ id: 'experience', title: i18n.t('navExperience') },
		{ id: 'opensource', title: i18n.t('navOpenSource') },
		{ id: 'testimonials', title: i18n.t('navTestimonials') },
		{ id: 'contact', title: i18n.t('navContact') }
	]);

	let isHome = $derived(page.url.pathname === '/');
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta name="theme-color" content="#ffffff" />
	<link rel="canonical" href={siteUrl} />

	<meta property="og:type" content="website" />
	<meta property="og:url" content={siteUrl} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:image" content={ogImageUrl} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content={siteUrl} />
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={pageDescription} />
	<meta name="twitter:image" content={ogImageUrl} />

	<script type="application/ld+json">
		{JSON.stringify(jsonLdSchema)}
	</script>

	<link rel="icon" href={favicon} />
</svelte:head>

<CommandPalette {sections} />
<ContactWidget />

{#if isHome}
	<MobileHeader navItems={sections.map((s) => ({ id: s.id, label: s.title }))} />
{/if}

<a
	href="#main-content"
	class="sr-only z-50 rounded-md bg-slate-900 px-4 py-2 font-mono text-xs tracking-wide text-white focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
>
	{i18n.t('skipToContent')}
</a>
{@render children()}
