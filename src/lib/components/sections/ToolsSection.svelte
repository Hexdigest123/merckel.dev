<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import ToolCard from '$lib/components/ToolCard.svelte';
	import type { WebToolWithUsage } from '$lib/types/content';

	let { tools = [] }: { tools: WebToolWithUsage[] } = $props();
</script>

<Section id="tools" title="Werkzeuge" description="Kostenlose Web-Tools - einfach ausprobieren.">
	<div
		class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5"
		data-testid="tools-grid"
	>
		{#each tools as tool (tool.id)}
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

	{#if tools.length > 0}
		<div class="mt-6 text-center">
			<a
				href="/tools"
				data-sveltekit-preload-data
				class="inline-flex items-center gap-1 rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-300 transition-colors hover:border-purple-400 hover:text-purple-300"
			>
				Alle Werkzeuge ansehen →
			</a>
		</div>
	{/if}
</Section>
