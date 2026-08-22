<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import ToolCard from '$lib/components/ToolCard.svelte';
	import { localizeTool } from '$lib/i18n/content';
	import { useLocale } from '$lib/i18n/locale.svelte';
	import type { WebToolWithUsage } from '$lib/types/content';

	const i18n = useLocale();
	let { tools = [] }: { tools: WebToolWithUsage[] } = $props();
	let localizedTools = $derived(tools.map((tool) => localizeTool(i18n, tool)));
</script>

<Section id="tools" title={i18n.t('navTools')}>
	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2" data-testid="tools-grid">
		{#each localizedTools as tool (tool.id)}
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
		<p class="mt-6">
			<a
				href="/tools"
				data-sveltekit-preload-data
				class="text-sm text-purple-600 hover:text-purple-700"
			>
				{i18n.t('allTools')}
			</a>
		</p>
	{/if}
</Section>
