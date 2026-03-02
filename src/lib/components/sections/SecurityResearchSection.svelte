<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import type { PentestingEntry } from '$lib/types/content';
	import { formatReadingTime } from '$lib/utils/reading-time';

	let { entries = [] }: { entries: PentestingEntry[] } = $props();

	let featuredEntry = $derived(entries.find((e) => e.featured) ?? entries[0] ?? null);
	let gridEntries = $derived(entries.filter((e) => e !== featuredEntry));
</script>

{#if entries.length > 0}
	<Section
		id="pentests"
		title="Pentests"
		description="Ausgewählte Pentesting-Aufträge und technische Writeups."
	>
		<div class="space-y-4">
			{#if featuredEntry}
				<a
					href="/pentesting/{featuredEntry.slug}"
					class="group block rounded-2xl border border-slate-700/60 bg-slate-800/35 p-5 transition-all duration-200 hover:border-purple-400/40 sm:p-6"
				>
					<div class="flex flex-wrap items-start justify-between gap-3">
						<h3 class="font-sans text-lg font-semibold text-slate-100 sm:text-xl">
							{featuredEntry.title}
						</h3>
						<span
							class="rounded-full border border-purple-400/50 bg-purple-500/15 px-3 py-1 font-mono text-xs tracking-wide text-purple-200 uppercase"
						>
							Highlight
						</span>
					</div>

					<p class="mt-3 text-sm leading-7 text-slate-300 sm:text-base">
						{featuredEntry.description}
					</p>

					<div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
						<span>{new Date(featuredEntry.date).getFullYear()}</span>
						<span class="text-slate-600">·</span>
						<span>{featuredEntry.client}</span>
						<span class="text-slate-600">·</span>
						<span>{featuredEntry.scope}</span>
						<span class="text-slate-600">·</span>
						<span>{formatReadingTime(featuredEntry.readTime)}</span>
					</div>

					<ul class="mt-4 flex flex-wrap gap-2">
						{#each featuredEntry.tools as tool}
							<li
								class="rounded-full border border-purple-400/45 bg-purple-500/15 px-3 py-1 text-xs text-purple-200 sm:text-sm"
							>
								{tool}
							</li>
						{/each}
					</ul>

					<div class="mt-5 text-sm">
						<span class="text-slate-400 transition-colors duration-200 group-hover:text-purple-300">
							Weiterlesen →
						</span>
					</div>
				</a>
			{/if}

			{#if gridEntries.length > 0}
				<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
					{#each gridEntries as entry (entry.slug)}
						<a
							href="/pentesting/{entry.slug}"
							class="group rounded-2xl border border-slate-700/60 bg-slate-800/35 p-5 transition-all duration-200 hover:border-purple-400/40 sm:p-6"
						>
							<h3 class="font-sans text-base font-semibold text-slate-100 sm:text-lg">
								{entry.title}
							</h3>

							<div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
								<span>{new Date(entry.date).getFullYear()}</span>
								<span class="text-slate-600">·</span>
								<span>{entry.scope}</span>
								<span class="text-slate-600">·</span>
								<span>{formatReadingTime(entry.readTime)}</span>
							</div>

							<ul class="mt-3 flex flex-wrap gap-1.5">
								{#each entry.tools.slice(0, 4) as tool}
									<li
										class="rounded-full border border-purple-400/45 bg-purple-500/15 px-2.5 py-0.5 text-xs text-purple-200"
									>
										{tool}
									</li>
								{/each}
								{#if entry.tools.length > 4}
									<li
										class="rounded-full border border-slate-600/50 px-2.5 py-0.5 text-xs text-slate-400"
									>
										+{entry.tools.length - 4}
									</li>
								{/if}
							</ul>

							<div class="mt-4 text-sm">
								<span
									class="text-slate-400 transition-colors duration-200 group-hover:text-purple-300"
								>
									Weiterlesen →
								</span>
							</div>
						</a>
					{/each}
				</div>
			{/if}
		</div>
	</Section>
{/if}
