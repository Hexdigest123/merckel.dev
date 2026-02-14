<script lang="ts">
	import ToolCard from '$lib/components/ToolCard.svelte';
	import type { WebToolWithUsage } from '$lib/types/content';

	let { data }: { data: { tools: WebToolWithUsage[] } } = $props();

	let search = $state('');

	let filteredTools = $derived.by(() => {
		const q = search.trim().toLowerCase();
		if (!q) return data.tools;
		return data.tools.filter(
			(tool) =>
				tool.name.toLowerCase().includes(q) ||
				tool.description.toLowerCase().includes(q) ||
				tool.category.toLowerCase().includes(q)
		);
	});
</script>

<section>
	<header class="mb-8 space-y-3">
		<h1 class="font-sans text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl">
			Werkzeuge
		</h1>
		<p class="max-w-2xl text-slate-400">
			Kostenlose Web-Tools für Entwickler und den täglichen Gebrauch.
		</p>
	</header>

	<div class="mb-6">
		<input
			type="text"
			placeholder="Werkzeuge suchen..."
			bind:value={search}
			class="w-full max-w-sm rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-purple-400/80 focus:ring-1 focus:ring-purple-400/30 focus:outline-none"
		/>
	</div>

	{#if filteredTools.length === 0}
		<p class="py-12 text-center text-sm text-slate-400">Keine Werkzeuge gefunden für "{search}"</p>
	{:else}
		<div
			class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5"
			data-testid="tools-grid"
		>
			{#each filteredTools as tool (tool.id)}
				<ToolCard
					name={tool.name}
					description={tool.description}
					icon={tool.icon}
					path={tool.path}
					usageCount={tool.usageCount}
					category={tool.category}
				/>
			{/each}
		</div>
	{/if}
</section>
