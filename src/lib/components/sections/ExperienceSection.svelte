<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import { experience } from '$lib/data/experience';
	import { siteConfig } from '$lib/data/site-config';

	let hoveredExperienceId = $state<string | null>(null);
	let hasHoveredExperience = $derived(hoveredExperienceId !== null);
	let linkedInProfile = $derived(
		siteConfig.socials.find((social) => social.platform.toLowerCase() === 'linkedin')?.url ??
			'#contact'
	);

	function formatPeriod(startDate: string, endDate?: string) {
		const [startYear] = startDate.split('-');
		const [endYear] = endDate?.split('-') ?? [];
		return `${startYear} — ${endYear ?? 'Heute'}`;
	}

	function setHoveredExperience(entryId: string) {
		hoveredExperienceId = entryId;
	}

	function clearHoveredExperience() {
		hoveredExperienceId = null;
	}

	function handleEntryFocusOut(event: FocusEvent) {
		const nextTarget = event.relatedTarget;
		const currentTarget = event.currentTarget;

		if (
			currentTarget instanceof HTMLElement &&
			nextTarget instanceof Node &&
			currentTarget.contains(nextTarget)
		) {
			return;
		}

		clearHoveredExperience();
	}
</script>

<Section id="experience" title="Erfahrung" description="Zeitstrahl, Erfolge und Wirkung.">
	<ol class="relative space-y-3" data-testid="experience-timeline" data-reveal-group>
		{#each experience as entry (entry.id)}
			<li class="group relative pl-6 sm:pl-0" data-reveal-item>
				<div class="absolute top-0 bottom-0 left-[0.37rem] w-px bg-slate-700/65 sm:hidden"></div>
				<div
					class="absolute top-6 left-0 h-3 w-3 rounded-full border border-purple-400/60 bg-slate-900 sm:hidden"
				></div>
				<article
					class={`relative rounded-2xl border border-slate-700/60 bg-slate-800/30 p-5 transition-all duration-200 hover:border-purple-400/35 hover:bg-slate-800/45 sm:grid sm:grid-cols-8 sm:gap-5 sm:p-6 ${
						hasHoveredExperience && hoveredExperienceId !== entry.id ? 'opacity-45' : 'opacity-100'
					}`}
					onmouseenter={() => setHoveredExperience(entry.id)}
					onmouseleave={clearHoveredExperience}
					onfocusin={() => setHoveredExperience(entry.id)}
					onfocusout={handleEntryFocusOut}
				>
					<div class="mb-3 sm:col-span-2 sm:mb-0">
						<p class="font-mono text-xs tracking-wide text-slate-500 uppercase">
							{formatPeriod(entry.startDate, entry.endDate)}
						</p>
					</div>
					<div class="space-y-3 sm:col-span-6">
						<div>
							<h3 class="font-sans text-lg font-semibold text-slate-100 sm:text-xl">
								{entry.role}
							</h3>
							{#if entry.companyUrl}
								<a
									href={entry.companyUrl}
									target="_blank"
									rel="noreferrer"
									class="mt-1 inline-flex items-center gap-1 text-sm text-slate-300 transition-colors duration-200 hover:text-purple-300 focus-visible:text-purple-300 focus-visible:outline-none sm:text-base"
								>
									<span>{entry.company}</span>
									<span aria-hidden="true">↗</span>
								</a>
							{:else}
								<p class="mt-1 text-sm text-slate-300 sm:text-base">{entry.company}</p>
							{/if}
						</div>
						<p class="text-sm leading-7 text-slate-300 sm:text-base">{entry.description}</p>
						<ul class="flex flex-wrap gap-2">
							{#each entry.tags as tag}
								<li
									class="rounded-full border border-purple-400/45 bg-purple-500/15 px-3 py-1 text-xs text-purple-200 sm:text-sm"
								>
									{tag}
								</li>
							{/each}
						</ul>
					</div>
				</article>
			</li>
		{/each}
	</ol>
</Section>
