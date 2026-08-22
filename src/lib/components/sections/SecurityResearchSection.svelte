<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import { useLocale } from '$lib/i18n/locale.svelte';
	import type { PentestingEntry } from '$lib/types/content';
	import { formatReadingTime } from '$lib/utils/reading-time';

	const i18n = useLocale();
	let { entries = [] }: { entries: PentestingEntry[] } = $props();
</script>

{#if entries.length > 0}
	<Section id="pentests" title={i18n.t('navPentests')}>
		<div class="space-y-8">
			{#each entries as entry (entry.slug)}
				<a href="/pentesting/{entry.slug}" class="group block">
					<div class="flex flex-wrap items-baseline justify-between gap-2">
						<h3 class="font-sans text-lg font-semibold text-slate-900 group-hover:text-purple-600">
							{entry.title}
						</h3>
						{#if entry.featured}
							<span class="font-mono text-xs tracking-wide text-purple-600 uppercase">
								{i18n.t('featured')}
							</span>
						{/if}
					</div>

					<p class="mt-2 text-sm leading-6 text-slate-600 sm:text-base">{entry.description}</p>

					<div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
						<span>{new Date(entry.date).getFullYear()}</span>
						<span aria-hidden="true">·</span>
						<span>{entry.client}</span>
						<span aria-hidden="true">·</span>
						<span>{entry.scope}</span>
						<span aria-hidden="true">·</span>
						<span>{formatReadingTime(entry.readTime, i18n.t('readingTime'))}</span>
					</div>

					<ul class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-500">
						{#each entry.tools as tool (tool)}
							<li>{tool}</li>
						{/each}
					</ul>
				</a>
			{/each}
		</div>
	</Section>
{/if}
