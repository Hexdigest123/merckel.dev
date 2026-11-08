<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { useLocale } from '$lib/i18n/locale.svelte';
	import type { Locale } from '$lib/i18n/messages';

	const i18n = useLocale();

	const OPTIONS: Array<{ locale: Locale; short: string; labelKey: 'languageDe' | 'languageEn' }> = [
		{ locale: 'de', short: 'DE', labelKey: 'languageDe' },
		{ locale: 'en', short: 'EN', labelKey: 'languageEn' }
	];

	async function select(locale: Locale) {
		if (i18n.current === locale) {
			return;
		}

		i18n.set(locale);
		// Server-provided page titles/descriptions are localized during load,
		// so re-run the loads with the new locale cookie.
		await invalidateAll();
	}
</script>

<div
	class="inline-flex items-center gap-1 font-mono text-xs"
	role="group"
	aria-label={i18n.t('language')}
>
	{#each OPTIONS as option, index (option.locale)}
		{#if index > 0}
			<span class="text-slate-300" aria-hidden="true">|</span>
		{/if}
		<button
			type="button"
			class={`rounded-md px-1.5 py-0.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500 ${
				i18n.current === option.locale
					? 'font-semibold text-purple-600'
					: 'text-slate-500 hover:text-slate-800'
			}`}
			aria-pressed={i18n.current === option.locale}
			aria-label={i18n.t(option.labelKey)}
			onclick={() => select(option.locale)}
		>
			{option.short}
		</button>
	{/each}
</div>
