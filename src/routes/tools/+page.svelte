<script lang="ts">
	import ToolCard from '$lib/components/ToolCard.svelte';
	import { localizeTool } from '$lib/i18n/content';
	import { useLocale } from '$lib/i18n/locale.svelte';
	import type { WebToolWithUsage } from '$lib/types/content';

	const i18n = useLocale();
	let { data }: { data: { tools: WebToolWithUsage[] } } = $props();

	let search = $state('');

	let localizedTools = $derived(data.tools.map((tool) => localizeTool(i18n, tool)));
	let filteredTools = $derived.by(() => {
		const q = search.trim().toLowerCase();
		if (!q) return localizedTools;
		return localizedTools.filter(
			(tool) =>
				tool.name.toLowerCase().includes(q) ||
				tool.description.toLowerCase().includes(q) ||
				tool.category.toLowerCase().includes(q)
		);
	});
</script>

<section>
	<header class="mb-8 space-y-2">
		<h1 class="font-sans text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
			{i18n.t('navTools')}
		</h1>
	</header>

	<div class="mb-6">
		<input
			type="text"
			placeholder={i18n.t('searchTools')}
			bind:value={search}
			class="w-full max-w-sm rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 focus:outline-none"
		/>
	</div>

	{#if filteredTools.length === 0}
		<p class="py-12 text-center text-sm text-slate-500">{i18n.t('noTools', { query: search })}</p>
	{:else}
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" data-testid="tools-grid">
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
