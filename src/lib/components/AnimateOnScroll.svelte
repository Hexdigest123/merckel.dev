<script lang="ts">
	import { browser } from '$app/environment';
	import type { Snippet } from 'svelte';
	import { createRevealContext, type RevealOptions } from '$lib/utils/gsap';

	let {
		mode = 'section',
		triggerStart = 'top 84%',
		triggerEnd = 'bottom 34%',
		y = 20,
		duration = 0.62,
		stagger = 0.08,
		ease = 'power2.out',
		once = true,
		children
	}: RevealOptions & { children?: Snippet } = $props();

	let element = $state<HTMLElement | null>(null);

	$effect(() => {
		if (!browser || !element) {
			return;
		}

		const context = createRevealContext(element, {
			mode,
			triggerStart,
			triggerEnd,
			y,
			duration,
			stagger,
			ease,
			once
		});

		return () => {
			context?.revert();
		};
	});
</script>

<div bind:this={element} data-animate-on-scroll>
	{@render children?.()}
</div>
