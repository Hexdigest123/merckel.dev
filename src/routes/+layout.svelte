<script lang="ts">
	import { page } from '$app/state';
	import { untrack } from 'svelte';
	import '@fontsource/space-grotesk/latin-400.css';
	import '@fontsource/space-grotesk/latin-600.css';
	import '@fontsource/space-grotesk/latin-700.css';
	import '@fontsource/jetbrains-mono/latin-400.css';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import CommandPalette from '$lib/components/CommandPalette.svelte';
	import ContactWidget from '$lib/components/ContactWidget.svelte';
	import MobileHeader from '$lib/components/MobileHeader.svelte';
	import { HOME_SECTIONS } from '$lib/data/sections';
	import { siteConfig } from '$lib/data/site-config';
	import { createLocaleStore, parseLocale } from '$lib/i18n/locale.svelte';
	import { jsonLdScript } from '$lib/utils/json-ld';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();

	// The store is created once; switching languages updates it directly and then
	// re-runs the load functions, so `data.locale` never needs to be re-read here.
	const i18n = createLocaleStore(untrack(() => parseLocale(data.locale)));

	const homeTitle = `${siteConfig.name} — merckel.dev`;
	const ogImageUrl = `${siteConfig.url}/og.png`;

	let siteDescription = $derived(i18n.t('jobTitle'));
	let pageTitle = $derived(page.data.title ? `${page.data.title} — merckel.dev` : homeTitle);
	let pageDescription = $derived(page.data.description || siteDescription);
	let canonicalUrl = $derived(new URL(page.url.pathname, siteConfig.url).href);
	let ogType = $derived(page.data.ogType ?? 'website');
	let jsonLd = $derived(
		jsonLdScript({
			'@context': 'https://schema.org',
			'@type': 'Person',
			name: siteConfig.name,
			jobTitle: i18n.t('jobTitle'),
			description: siteDescription,
			url: siteConfig.url,
			email: siteConfig.email,
			sameAs: siteConfig.socials.filter((s) => s.icon !== 'email').map((s) => s.url)
		})
	);

	let sections = $derived(
		HOME_SECTIONS.map(({ id, titleKey }) => ({ id, title: i18n.t(titleKey) }))
	);

	let isHome = $derived(page.url.pathname === '/');
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
	<meta name="theme-color" content="#ffffff" />
	<link rel="canonical" href={canonicalUrl} />

	<meta property="og:type" content={ogType} />
	<meta property="og:site_name" content="merckel.dev" />
	<meta property="og:locale" content={i18n.current === 'de' ? 'de_DE' : 'en_US'} />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:image" content={ogImageUrl} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	{#if ogType === 'article' && page.data.publishedTime}
		<meta property="article:published_time" content={page.data.publishedTime} />
	{/if}

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content={canonicalUrl} />
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={pageDescription} />
	<meta name="twitter:image" content={ogImageUrl} />

	<!-- eslint-disable-next-line svelte/no-at-html-tags -- jsonLdScript escapes "<" in the data -->
	{@html jsonLd}

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
