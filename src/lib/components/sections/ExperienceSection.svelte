<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import { experience } from '$lib/data/experience';
	import { localizeExperience } from '$lib/i18n/content';
	import { useLocale } from '$lib/i18n/locale.svelte';

	const i18n = useLocale();
	let localizedExperience = $derived(experience.map((entry) => localizeExperience(i18n, entry)));

	function formatPeriod(startDate: string, endDate?: string) {
		const [startYear] = startDate.split('-');
		const [endYear] = endDate?.split('-') ?? [];
		return `${startYear} — ${endYear ?? i18n.t('present')}`;
	}
</script>

<Section id="experience" title={i18n.t('navExperience')}>
	<ol class="space-y-8" data-testid="experience-timeline">
		{#each localizedExperience as entry (entry.id)}
			<li>
				<article class="sm:grid sm:grid-cols-8 sm:gap-6">
					<p class="mb-1 font-mono text-xs tracking-wide text-slate-500 sm:col-span-2 sm:mb-0">
						{formatPeriod(entry.startDate, entry.endDate)}
					</p>
					<div class="space-y-2 sm:col-span-6">
						<h3 class="font-sans text-lg font-semibold text-slate-900">{entry.role}</h3>
						{#if entry.companyUrl}
							<a
								href={entry.companyUrl}
								target="_blank"
								rel="noreferrer"
								class="text-sm text-purple-600 hover:text-purple-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500"
							>
								{entry.company}
							</a>
						{:else}
							<p class="text-sm text-slate-600">{entry.company}</p>
						{/if}
						<p class="text-sm leading-6 text-slate-600 sm:text-base">{entry.description}</p>
						<ul class="flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-500">
							{#each entry.tags as tag (tag)}
								<li>{tag}</li>
							{/each}
						</ul>
					</div>
				</article>
			</li>
		{/each}
	</ol>
</Section>
