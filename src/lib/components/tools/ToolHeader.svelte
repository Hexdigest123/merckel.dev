<script lang="ts">
	import { getLocalizedTool } from '$lib/i18n/content';
	import { useLocale } from '$lib/i18n/locale.svelte';

	let { toolId, intro }: { toolId: string; intro?: string } = $props();

	const i18n = useLocale();
	let tool = $derived(getLocalizedTool(i18n, toolId));
</script>

<header class="space-y-3">
	<h1 class="font-sans text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
		{tool.name}
	</h1>
	<p class="text-slate-600">{intro ?? tool.description}</p>
</header>
