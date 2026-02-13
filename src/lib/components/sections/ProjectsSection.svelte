<script lang="ts">
	import { browser } from '$app/environment';
	import Section from '$lib/components/Section.svelte';
	import { projects } from '$lib/data/projects';
	import { revealSecret } from '$lib/utils/secrets-tracker';
	import { createHoverReveal } from '$lib/utils/hover-reveal';
	import { secretNotes } from '$lib/data/secret-notes';

	let { onSecretRevealed }: { onSecretRevealed?: (secretId: string) => void } = $props();

	let hoveredProjectId = $state<string | null>(null);
	let hasHoveredProject = $derived(hoveredProjectId !== null);
	let revealedProjectId = $state<string | null>(null);

	function setHoveredProject(projectId: string) {
		hoveredProjectId = projectId;
	}

	function clearHoveredProject() {
		hoveredProjectId = null;
	}

	function handleProjectFocusOut(event: FocusEvent) {
		const nextTarget = event.relatedTarget;
		const currentTarget = event.currentTarget;

		if (
			currentTarget instanceof HTMLElement &&
			nextTarget instanceof Node &&
			currentTarget.contains(nextTarget)
		) {
			return;
		}

		clearHoveredProject();
	}

	function setupHoverReveal(element: HTMLElement, projectId: string) {
		if (!browser) return;

		const { cleanup } = createHoverReveal(element, {
			duration: 2000,
			onRevealed: () => {
				revealedProjectId = projectId;
				revealSecret('hover-project');
				if (onSecretRevealed) {
					onSecretRevealed('hover-project');
				}
				setTimeout(() => {
					revealedProjectId = null;
				}, 2500);
			}
		});

		return { destroy: cleanup };
	}
</script>

<Section
	id="projects"
	title="Projects"
	description="Featured work cards and implementation details."
>
	<div class="space-y-4" data-testid="projects-list" data-reveal-group>
		{#each projects as project (project.id)}
			<article
				data-reveal-item
				use:setupHoverReveal={project.id}
				class={`group relative rounded-2xl border border-slate-700/60 bg-slate-800/35 p-5 transition-all duration-200 sm:p-6 ${
					hasHoveredProject && hoveredProjectId !== project.id ? 'opacity-45' : 'opacity-100'
				}`}
				onmouseenter={() => setHoveredProject(project.id)}
				onmouseleave={clearHoveredProject}
				onfocusin={() => setHoveredProject(project.id)}
				onfocusout={handleProjectFocusOut}
			>
				{#if revealedProjectId === project.id}
					<div
						class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500/20 to-purple-600/20 backdrop-blur-sm"
					>
						<span class="font-mono text-sm text-purple-200">✨</span>
						<span class="font-mono text-xs text-purple-100">{secretNotes['hover-project']}</span>
					</div>
				{/if}
				<div class="flex flex-wrap items-start justify-between gap-3">
					<h3 class="font-sans text-lg font-semibold text-slate-100 sm:text-xl">{project.title}</h3>
					{#if project.featured}
						<span
							class="rounded-full border border-purple-400/50 bg-purple-500/15 px-3 py-1 font-mono text-xs tracking-wide text-purple-200 uppercase"
						>
							Featured
						</span>
					{/if}
				</div>
				<p class="mt-3 text-sm leading-7 text-slate-300 sm:text-base">{project.description}</p>

				<ul class="mt-4 flex flex-wrap gap-2">
					{#each project.tags as tag}
						<li
							class="rounded-full border border-purple-400/45 bg-purple-500/15 px-3 py-1 text-xs text-purple-200 sm:text-sm"
						>
							{tag}
						</li>
					{/each}
				</ul>

				<div class="mt-5 flex flex-wrap gap-3 text-sm">
					{#if project.url}
						<a
							href={project.url}
							target="_blank"
							rel="noreferrer"
							aria-label={`Open live demo for ${project.title}`}
							class="rounded-full border border-slate-600 px-3.5 py-1.5 text-slate-200 transition-colors duration-200 hover:border-purple-400 hover:text-purple-300 focus-visible:border-purple-400 focus-visible:text-purple-300 focus-visible:outline-none"
						>
							Live demo
						</a>
					{/if}
					{#if project.github}
						<a
							href={project.github}
							target="_blank"
							rel="noreferrer"
							aria-label={`Open source code for ${project.title}`}
							class="rounded-full border border-slate-600 px-3.5 py-1.5 text-slate-200 transition-colors duration-200 hover:border-purple-400 hover:text-purple-300 focus-visible:border-purple-400 focus-visible:text-purple-300 focus-visible:outline-none"
						>
							Source code
						</a>
					{/if}
				</div>
			</article>
		{/each}
	</div>
</Section>
