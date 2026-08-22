<script lang="ts">
	import type { Snippet } from 'svelte';
	import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
	import { useLocale } from '$lib/i18n/locale.svelte';

	const i18n = useLocale();
	let { children }: { children: Snippet } = $props();
</script>

<main id="main-content" tabindex="-1" class="min-h-screen bg-white pt-6 text-slate-800 lg:pt-0">
	<div class="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
		<nav class="mb-8 flex items-center justify-between gap-4">
			<div class="flex items-center gap-4">
				<a
					href="/"
					data-sveltekit-preload-data
					class="text-sm text-slate-500 transition-colors hover:text-purple-600"
				>
					← {i18n.t('home')}
				</a>
				<span class="text-slate-300">/</span>
				<a
					href="/tools"
					data-sveltekit-preload-data
					class="text-sm text-slate-500 transition-colors hover:text-purple-600"
				>
					{i18n.t('navTools')}
				</a>
			</div>
			<LanguageSwitcher />
		</nav>
		{@render children()}
	</div>
</main>
