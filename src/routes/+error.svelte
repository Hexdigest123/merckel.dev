<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { useLocale } from '$lib/i18n/locale.svelte';

	const i18n = useLocale();
	let isNotFound = $derived(page.status === 404);
</script>

<svelte:head>
	<title>{isNotFound ? i18n.t('errorNotFound') : i18n.t('errorGeneric')} — merckel.dev</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main
	id="main-content"
	tabindex="-1"
	class="flex min-h-screen items-center justify-center bg-white px-4 text-slate-800"
>
	<div class="max-w-md text-center">
		<p class="font-mono text-7xl font-bold tracking-tight text-purple-500">
			{page.status}
		</p>

		<h1 class="mt-4 text-2xl font-semibold text-slate-900">
			{isNotFound ? i18n.t('errorNotFound') : i18n.t('errorGeneric')}
		</h1>
		<p class="mt-3 text-slate-500">
			{isNotFound ? i18n.t('errorNotFoundBody') : i18n.t('errorGenericBody')}
		</p>

		<div class="mt-8 flex items-center justify-center gap-4">
			<a
				href={resolve('/')}
				data-sveltekit-preload-data
				class="inline-flex rounded-md bg-purple-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-purple-600"
			>
				{i18n.t('errorHome')}
			</a>
			<a
				href={resolve('/tools')}
				data-sveltekit-preload-data
				class="inline-flex rounded-md border border-slate-200 px-5 py-2.5 text-sm text-slate-600 transition-colors duration-200 hover:border-purple-400 hover:text-purple-600"
			>
				{i18n.t('navTools')}
			</a>
		</div>
	</div>
</main>
