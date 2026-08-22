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
	class="scroll-mt-20 lg:scroll-mt-8"
>
	<header
		data-testid={`section-header-${id}`}
		class={mobileSticky ? 'sticky top-14 z-20 bg-white py-3 lg:static lg:py-0' : ''}
	>
		<h2
			id={`${id}-heading`}
			class="font-sans text-xl font-semibold tracking-tight text-slate-900 lg:text-2xl"
		>
			{title}
		</h2>
		{#if description}
			<p class="mt-2 max-w-2xl text-sm text-slate-500 lg:text-base">{description}</p>
		{/if}
	</header>

	<div class="mt-6 space-y-4 text-slate-700">
		{@render children?.()}
	</div>
</section>
