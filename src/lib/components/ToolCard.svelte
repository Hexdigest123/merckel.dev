<script lang="ts">
	type ToolCategory = 'utility' | 'developer';

	let { name, description, icon, path, usageCount, category } = $props<{
		name: string;
		description: string;
		icon: string;
		path: string;
		usageCount: number;
		category: ToolCategory;
	}>();

	const iconMap: Record<string, string> = {
		link: '🔗',
		clock: '⏰',
		diff: '📝',
		image: '🖼️',
		qrcode: '📱',
		gradient: '🎨',
		json: '{ }',
		palette: '🎛️',
		regex: '🔣',
		markdown: '📄'
	};

	let iconSymbol = $derived(iconMap[icon] ?? '🧰');
	let categoryLabel = $derived(category === 'utility' ? 'Nützlich' : 'Entwickler');
</script>

<a
	href={path}
	data-cursor="link"
	class="group block rounded-2xl border border-slate-700/60 bg-slate-800/30 p-5 transition-colors duration-200 hover:border-purple-400/35"
>
	<div class="flex items-start justify-between gap-3">
		<div
			class="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700/70 bg-slate-900/55 text-xl"
			aria-hidden="true"
		>
			{iconSymbol}
		</div>
		<div class="flex items-center gap-2">
			<span
				class="rounded-full border border-purple-400/45 bg-purple-500/15 px-2.5 py-1 font-mono text-xs tracking-wide text-purple-200 uppercase"
			>
				{categoryLabel}
			</span>
			<span
				class="rounded-full border border-slate-700 bg-slate-900/65 px-2.5 py-1 font-mono text-xs text-slate-300"
			>
				{usageCount}
			</span>
		</div>
	</div>

	<h3 class="mt-4 text-lg font-semibold text-slate-100">{name}</h3>
	<p class="mt-2 text-sm leading-6 text-slate-300">{description}</p>
</a>
