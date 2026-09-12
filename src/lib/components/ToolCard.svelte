<script lang="ts">
	let { name, description, path, usageCount } = $props<{
		name: string;
		description: string;
		icon?: string;
		path: string;
		usageCount: number;
		category?: 'utility' | 'developer';
	}>();
</script>

<a href={path} class="group block">
	<div class="flex items-baseline justify-between gap-3">
		<h3 class="text-lg font-semibold text-slate-900 group-hover:text-purple-600">{name}</h3>
		<span class="font-mono text-xs text-slate-400">{usageCount}</span>
	</div>
	<p class="mt-1 text-sm leading-6 text-slate-600">{description}</p>
</a>
