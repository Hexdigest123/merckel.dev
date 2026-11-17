<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import { projects } from '$lib/data/projects';
	import { localizeProject } from '$lib/i18n/content';
	import { useLocale } from '$lib/i18n/locale.svelte';

	const i18n = useLocale();
	let localizedProjects = $derived(projects.map((project) => localizeProject(i18n, project)));

	let scroller = $state<HTMLElement | undefined>(undefined);
	let canScrollPrev = $state(false);
	let canScrollNext = $state(false);

	function updateScrollState() {
		if (!scroller) return;
		canScrollPrev = scroller.scrollLeft > 1;
		canScrollNext = scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - 1;
	}

	$effect(() => {
		updateScrollState();
		if (!scroller) return;
		const observer = new ResizeObserver(updateScrollState);
		observer.observe(scroller);
		return () => observer.disconnect();
	});

	function scrollByPage(direction: 1 | -1) {
		if (!scroller) return;
		scroller.scrollBy({ left: direction * scroller.clientWidth, behavior: 'smooth' });
	}
</script>

<Section id="projects" title={i18n.t('navProjects')}>
	{#if localizedProjects.length > 1}
		<div class="mb-4 flex items-center justify-end gap-2">
			<button
				type="button"
				onclick={() => scrollByPage(-1)}
				disabled={!canScrollPrev}
				aria-label={i18n.t('carouselPrevious')}
				class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors duration-200 hover:border-purple-400/60 hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-40"
			>
				<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<path
						d="M15 5l-7 7 7 7"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</button>
			<button
				type="button"
				onclick={() => scrollByPage(1)}
				disabled={!canScrollNext}
				aria-label={i18n.t('carouselNext')}
				class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors duration-200 hover:border-purple-400/60 hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-40"
			>
				<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<path
						d="M9 5l7 7-7 7"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</button>
		</div>
	{/if}

	<div
		bind:this={scroller}
		onscroll={updateScrollState}
		role="region"
		aria-label={i18n.t('navProjects')}
		data-testid="projects-carousel"
		class="flex snap-x snap-mandatory [scrollbar-width:none] gap-6 overflow-x-auto scroll-smooth pb-2 [&::-webkit-scrollbar]:hidden"
	>
		{#each localizedProjects as project (project.id)}
			<article
				class="w-full shrink-0 snap-start sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]"
			>
				<h3 class="font-sans text-lg font-semibold text-slate-900">{project.title}</h3>
				<p class="mt-2 text-sm leading-6 text-slate-600 sm:text-base">{project.description}</p>

				{#if project.image && project.url}
					<a
						href={project.url}
						target="_blank"
						rel="external noreferrer"
						tabindex="-1"
						aria-hidden="true"
						class="mt-4 block overflow-hidden rounded-lg border border-slate-200"
					>
						<img
							src={project.image}
							alt=""
							width="1280"
							height="793"
							loading="lazy"
							decoding="async"
							class="aspect-[16/10] w-full object-cover object-top"
						/>
					</a>
				{/if}

				<div class="mt-3 flex flex-wrap gap-4 text-sm">
					{#if project.url}
						<a
							href={project.url}
							target="_blank"
							rel="external noreferrer"
							aria-label={i18n.t('openPreview', { title: project.title })}
							class="text-purple-600 hover:text-purple-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500"
						>
							{i18n.t('livePreview')}
						</a>
					{/if}
					{#if project.github}
						<a
							href={project.github}
							target="_blank"
							rel="external noreferrer"
							aria-label={i18n.t('openSourceCode', { title: project.title })}
							class="text-purple-600 hover:text-purple-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500"
						>
							{i18n.t('sourceCode')}
						</a>
					{/if}
				</div>
			</article>
		{/each}
	</div>
</Section>
