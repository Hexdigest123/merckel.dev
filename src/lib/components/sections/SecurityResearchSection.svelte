<script lang="ts">
	import { resolve } from '$app/paths';
	import Section from '$lib/components/Section.svelte';
	import { useLocale } from '$lib/i18n/locale.svelte';
	import type { PentestingEntry } from '$lib/types/content';
	import { yearOf } from '$lib/utils/date';
	import { formatReadingTime } from '$lib/utils/reading-time';

	const i18n = useLocale();
	let { entries = [] }: { entries: PentestingEntry[] } = $props();
</script>

{#if entries.length > 0}
	<Section id="pentests" title={i18n.t('navPentests')}>
		<div class="space-y-8">
			{#each entries as entry (entry.slug)}
				<a href={resolve('/pentesting/[slug]', { slug: entry.slug })} class="group block">
					<div class="flex flex-wrap items-baseline justify-between gap-2">
						<h3
							lang={entry.lang}
							class="font-sans text-lg font-semibold text-slate-900 group-hover:text-purple-600"
						>
							{entry.title}
						</h3>
						{#if entry.featured}
							<span class="font-mono text-xs tracking-wide text-purple-600 uppercase">
								{i18n.t('featured')}
							</span>
						{/if}
					</div>

					<p lang={entry.lang} class="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
						{entry.description}
					</p>

					<div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
						<time datetime={entry.date}>{yearOf(entry.date)}</time>
						<span aria-hidden="true">·</span>
						<span>{entry.client}</span>
						<span aria-hidden="true">·</span>
						<span>{entry.scope}</span>
						<span aria-hidden="true">·</span>
						<span>{formatReadingTime(entry.readTime, i18n.t('readingTime'))}</span>
					</div>
				</a>
			{/each}
		</div>
	</Section>
{/if}
