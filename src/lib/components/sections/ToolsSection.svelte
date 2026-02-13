<script lang="ts">
	import { browser } from '$app/environment';
	import Section from '$lib/components/Section.svelte';
	import { tools } from '$lib/data/tools';
	import type { Tool } from '$lib/types/content';
	import { revealSecret } from '$lib/utils/secrets-tracker';
	import { createHoverReveal } from '$lib/utils/hover-reveal';
	import { secretNotes } from '$lib/data/secret-notes';

	let { onSecretRevealed }: { onSecretRevealed?: (secretId: string) => void } = $props();

	const categoryOrder: Tool['category'][] = ['language', 'framework', 'tool', 'platform'];
	const categoryLabels: Record<Tool['category'], string> = {
		language: 'Languages',
		framework: 'Frameworks',
		tool: 'Tools',
		platform: 'Platforms'
	};

	let hoveredCategory = $state<Tool['category'] | ''>('');
	let revealedToolId = $state<string | null>(null);
	let groupedTools = $derived.by(() => {
		const groups = new Map<Tool['category'], Tool[]>();
		for (const category of categoryOrder) {
			groups.set(category, []);
		}

		for (const item of tools) {
			groups.get(item.category)?.push(item);
		}

		return groups;
	});

	function prettyProficiency(level: Tool['proficiency']) {
		return level.charAt(0).toUpperCase() + level.slice(1);
	}

	function setupHoverReveal(element: HTMLElement, toolId: string) {
		if (!browser) return;

		const { cleanup } = createHoverReveal(element, {
			duration: 2000,
			onRevealed: () => {
				revealedToolId = toolId;
				revealSecret('hover-tool');
				if (onSecretRevealed) {
					onSecretRevealed('hover-tool');
				}
				setTimeout(() => {
					revealedToolId = null;
				}, 2500);
			}
		});

		return { destroy: cleanup };
	}
</script>

<Section id="tools" title="Tools" description="Tech stack categories and proficiency highlights.">
	<div
		data-testid="tools-category-grid"
		class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-4"
	>
		{#each categoryOrder as category}
			{@const categoryTools = groupedTools.get(category) ?? []}
			<article
				data-reveal
				class={`relative rounded-2xl border border-slate-700/60 bg-slate-800/30 p-5 transition-all duration-200 hover:border-purple-400/35 ${
					hoveredCategory && hoveredCategory !== category ? 'opacity-45' : 'opacity-100'
				}`}
				onmouseenter={() => (hoveredCategory = category)}
				onmouseleave={() => (hoveredCategory = '')}
			>
				<h3 class="font-sans text-base font-semibold text-slate-100 sm:text-lg">
					{categoryLabels[category]}
				</h3>
				<ul class="mt-4 space-y-3" data-reveal-group>
					{#each categoryTools as item (item.id)}
						<li
							class="relative flex items-center justify-between gap-4"
							data-reveal-item
							use:setupHoverReveal={item.id}
						>
							<a
								href={item.url}
								target="_blank"
								rel="noreferrer"
								class="text-sm text-slate-200 transition-colors duration-200 hover:text-purple-200 sm:text-base"
							>
								{item.name}
							</a>
							<span
								class="rounded-full border border-purple-400/45 bg-purple-500/15 px-2.5 py-1 font-mono text-xs tracking-wide text-purple-200 uppercase"
							>
								{prettyProficiency(item.proficiency)}
							</span>
							{#if revealedToolId === item.id}
								<div
									class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-purple-500/20 to-purple-600/20 backdrop-blur-sm"
								>
									<span class="font-mono text-xs text-purple-200">✨</span>
									<span class="font-mono text-[10px] text-purple-100"
										>{secretNotes['hover-tool']}</span
									>
								</div>
							{/if}
						</li>
					{/each}
				</ul>
			</article>
		{/each}
	</div>
</Section>
