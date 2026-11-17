<script lang="ts">
	import { resolve } from '$app/paths';
	import Section from '$lib/components/Section.svelte';
	import { useLocale } from '$lib/i18n/locale.svelte';
	import type { PentestingEntry } from '$lib/types/content';

	const i18n = useLocale();
	let { entries = [] }: { entries: PentestingEntry[] } = $props();
</script>

{#if entries.length > 0}
	<Section id="pentests" title={i18n.t('navPentests')}>
		<div class="space-y-8">
			{#each entries as entry (entry.slug)}
				<a href={resolve('/pentesting/[slug]', { slug: entry.slug })} class="group block">
					<h3
						lang={entry.lang}
						class="font-sans text-lg font-semibold text-slate-900 group-hover:text-purple-600"
					>
						{entry.title}
					</h3>

					<p lang={entry.lang} class="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
						{entry.description}
					</p>
				</a>
			{/each}
		</div>
	</Section>
{/if}
