<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		id,
		title,
		description = '',
		mobileSticky = true,
		children
	}: {
		id: string;
		title: string;
		description?: string;
		mobileSticky?: boolean;
		children?: Snippet;
	} = $props();
</script>

<section
	{id}
	data-section={id}
	aria-labelledby={`${id}-heading`}
	class="scroll-mt-24 border-b border-slate-700/50 pb-12 last:border-b-0 lg:scroll-mt-10 lg:pb-16"
>
	<header
		data-reveal
		data-testid={`section-header-${id}`}
		class={`-mx-4 mb-8 border-b border-slate-700/50 bg-slate-900/90 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6 ${
			mobileSticky
				? 'sticky top-0 z-20 lg:static lg:border-b-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none'
				: ''
		}`}
	>
		<h2
			id={`${id}-heading`}
			class="font-sans text-xl font-semibold tracking-tight text-slate-100 lg:text-2xl"
		>
			{title}
		</h2>
		{#if description}
			<p class="mt-2 max-w-2xl text-sm text-slate-400 lg:text-base">{description}</p>
		{/if}
	</header>

	<div class="space-y-4 text-slate-300">
		{@render children?.()}
	</div>
</section>
