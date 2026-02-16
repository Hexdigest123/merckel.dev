<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import type { OpenSourceData } from '$lib/types/content';

	let { data }: { data: OpenSourceData } = $props();

	let hoveredContributionId = $state('');
</script>

<Section
	id="opensource"
	title="Open Source"
	description="Community-Projekte und öffentliche Aktivität."
>
	<div class="grid gap-4 lg:grid-cols-[1fr,1.2fr] lg:gap-5">
		<div class="rounded-2xl border border-slate-700/60 bg-slate-800/30 p-5 sm:p-6" data-reveal>
			<div class="flex flex-wrap items-center justify-between gap-3">
				<h3 class="font-sans text-lg font-semibold text-slate-100">Community-Überblick</h3>
				<span
					class={`rounded-full border px-2.5 py-1 font-mono text-[0.7rem] tracking-wider uppercase ${
						data.source === 'github'
							? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
							: 'border-slate-600/80 bg-slate-700/35 text-slate-300'
					}`}
				>
					{data.source === 'github' ? 'Live-Daten' : 'Lokale Daten'}
				</span>
			</div>
			<ul class="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
				{#each data.stats as stat}
					<li class="rounded-xl border border-slate-700/70 bg-slate-900/65 p-3">
						<p class="font-mono text-xs tracking-wide text-slate-500 uppercase">{stat.label}</p>
						<p class="mt-2 text-xl font-semibold text-slate-100">{stat.value}</p>
					</li>
				{/each}
			</ul>
			<p class="mt-4 text-sm text-slate-400">{data.note}</p>
			{#if data.profileUrl}
				<a
					href={data.profileUrl}
					target="_blank"
					rel="noreferrer"
					class="mt-5 inline-flex rounded-full border border-slate-600 px-3.5 py-1.5 text-sm text-slate-200 transition-colors duration-200 hover:border-purple-400 hover:text-purple-300"
				>
					{data.profileLabel}
				</a>
			{/if}
		</div>

		<div class="space-y-3" data-testid="opensource-contributions" data-reveal-group>
			{#if data.contributions.length > 0}
				{#each data.contributions as contribution (contribution.id)}
					<article
						data-reveal-item
						class={`rounded-2xl border border-slate-700/60 bg-slate-800/30 p-5 transition-opacity duration-200 ${
							hoveredContributionId && hoveredContributionId !== contribution.id
								? 'opacity-45'
								: 'opacity-100'
						}`}
						onmouseenter={() => (hoveredContributionId = contribution.id)}
						onmouseleave={() => (hoveredContributionId = '')}
					>
						{#if contribution.url}
							<a
								href={contribution.url}
								target="_blank"
								rel="noreferrer"
								class="font-sans text-base font-semibold text-slate-100 transition-colors duration-200 hover:text-purple-300 sm:text-lg"
							>
								{contribution.title}
							</a>
						{:else}
							<p class="font-sans text-base font-semibold text-slate-100 sm:text-lg">
								{contribution.title}
							</p>
						{/if}
						<p class="mt-2 text-sm text-slate-300">{contribution.description}</p>
						<div class="mt-3 flex flex-wrap gap-2">
							{#each contribution.tags.length > 0 ? contribution.tags : ['community'] as tag}
								<span
									class="rounded-full border border-purple-400/45 bg-purple-500/15 px-3 py-1 text-xs text-purple-200 sm:text-sm"
								>
									{tag}
								</span>
							{/each}
						</div>
					</article>
				{/each}
			{:else}
				<article
					data-reveal-item
					class="rounded-2xl border border-slate-700/60 bg-slate-800/30 p-5"
				>
					<p class="font-sans text-base font-semibold text-slate-100 sm:text-lg">
						Open-Source-Aktivität wird hier angezeigt
					</p>
					<p class="mt-2 text-sm text-slate-300">
						GitHub-Benutzername und Token hinzufügen, um Live-Repository-Einblicke freizuschalten.
					</p>
				</article>
			{/if}
		</div>
	</div>
</Section>
