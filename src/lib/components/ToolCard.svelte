<script lang="ts">
	import { useLocale } from '$lib/i18n/locale.svelte';

	type ToolCategory = 'utility' | 'developer';

	let { name, description, path, usageCount, category } = $props<{
		name: string;
		description: string;
		icon?: string;
		path: string;
		usageCount: number;
		category: ToolCategory;
	}>();

	const i18n = useLocale();
	let categoryLabel = $derived(
		category === 'utility' ? i18n.t('toolUtility') : i18n.t('toolDeveloper')
	);
</script>

<a href={path} class="group block">
	<div class="flex items-baseline justify-between gap-3">
		<h3 class="text-lg font-semibold text-slate-900 group-hover:text-purple-600">{name}</h3>
		<span class="font-mono text-xs text-slate-400">{usageCount}</span>
	</div>
	<p class="mt-1 text-sm leading-6 text-slate-600">{description}</p>
	<p class="mt-2 font-mono text-xs tracking-wide text-slate-400 uppercase">{categoryLabel}</p>
</a>
