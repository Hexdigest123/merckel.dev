<script lang="ts">
	import { page } from '$app/state';
	import { useLocale } from '$lib/i18n/locale.svelte';

	const i18n = useLocale();
</script>

<main class="flex min-h-screen items-center justify-center bg-white px-4 text-slate-800">
	<div class="max-w-md text-center">
		<p class="font-mono text-7xl font-bold tracking-tight text-purple-500">
			{page.status}
		</p>

		{#if page.status === 404}
			<h1 class="mt-4 text-2xl font-semibold text-slate-900">{i18n.t('errorNotFound')}</h1>
			<p class="mt-3 text-slate-500">
				{i18n.t('errorNotFoundBody')}
			</p>
		{:else}
			<h1 class="mt-4 text-2xl font-semibold text-slate-900">{i18n.t('errorGeneric')}</h1>
			<p class="mt-3 text-slate-500">
				{page.error?.message ?? i18n.t('errorGeneric')}
			</p>
		{/if}

		<div class="mt-8 flex items-center justify-center gap-4">
			<a
				href="/"
				data-sveltekit-preload-data
				class="inline-flex rounded-md bg-purple-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-purple-600"
			>
				{i18n.t('errorHome')}
			</a>
			<a
				href="/tools"
				data-sveltekit-preload-data
				class="inline-flex rounded-md border border-slate-200 px-5 py-2.5 text-sm text-slate-600 transition-colors duration-200 hover:border-purple-400 hover:text-purple-600"
			>
				{i18n.t('navTools')}
			</a>
		</div>
	</div>
</main>
