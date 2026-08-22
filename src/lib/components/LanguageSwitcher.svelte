<script lang="ts">
	import { useLocale } from '$lib/i18n/locale.svelte';

	const i18n = useLocale();
</script>

<div
	class="inline-flex items-center gap-1 font-mono text-xs"
	role="group"
	aria-label={i18n.t('language')}
>
	<button
		type="button"
		class={`rounded-md px-1.5 py-0.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500 ${
			i18n.current === 'de' ? 'font-semibold text-purple-600' : 'text-slate-400 hover:text-slate-700'
		}`}
		aria-pressed={i18n.current === 'de'}
		aria-label={i18n.t('languageDe')}
		onclick={() => i18n.set('de')}
	>
		DE
	</button>
	<span class="text-slate-300" aria-hidden="true">|</span>
	<button
		type="button"
		class={`rounded-md px-1.5 py-0.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500 ${
			i18n.current === 'en' ? 'font-semibold text-purple-600' : 'text-slate-400 hover:text-slate-700'
		}`}
		aria-pressed={i18n.current === 'en'}
		aria-label={i18n.t('languageEn')}
		onclick={() => i18n.set('en')}
	>
		EN
	</button>
</div>
