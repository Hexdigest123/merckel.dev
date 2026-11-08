<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
	import { useLocale } from '$lib/i18n/locale.svelte';

	let {
		name,
		description,
		path,
		usageCount
	}: {
		name: string;
		description: string;
		path: Pathname;
		usageCount: number;
	} = $props();

	const i18n = useLocale();
	let usageLabel = $derived(i18n.t('toolUses', { count: usageCount }));
</script>

<a href={resolve(path)} class="group block">
	<div class="flex items-baseline justify-between gap-3">
		<h3 class="text-lg font-semibold text-slate-900 group-hover:text-purple-600">{name}</h3>
		<span class="font-mono text-xs text-slate-500" title={usageLabel}>
			<span aria-hidden="true">{usageCount}</span>
			<span class="sr-only">{usageLabel}</span>
		</span>
	</div>
	<p class="mt-1 text-sm leading-6 text-slate-600">{description}</p>
</a>
