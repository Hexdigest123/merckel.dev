<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import { projects } from '$lib/data/projects';
	import { localizeProject } from '$lib/i18n/content';
	import { useLocale } from '$lib/i18n/locale.svelte';

	const i18n = useLocale();
	let localizedProjects = $derived(projects.map((project) => localizeProject(i18n, project)));
</script>

<Section id="projects" title={i18n.t('navProjects')}>
	<div class="space-y-10" data-testid="projects-list">
		{#each localizedProjects as project (project.id)}
			<article>
				<div class="flex flex-wrap items-baseline justify-between gap-2">
					<h3 class="font-sans text-lg font-semibold text-slate-900">{project.title}</h3>
					{#if project.featured}
						<span class="font-mono text-xs tracking-wide text-purple-600 uppercase">
							{i18n.t('featured')}
						</span>
					{/if}
				</div>
				<p class="mt-2 text-sm leading-6 text-slate-600 sm:text-base">{project.description}</p>

				{#if project.image && project.url}
					<a
						href={project.url}
						target="_blank"
						rel="noreferrer"
						aria-label={i18n.t('openPreview', { title: project.title })}
						class="mt-4 block overflow-hidden rounded-lg border border-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500"
					>
						<img
							src={project.image}
							alt={i18n.t('previewOf', { title: project.title })}
							class="aspect-[16/10] w-full object-cover object-top"
						/>
					</a>
				{/if}

				<ul class="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-500">
					{#each project.tags as tag (tag)}
						<li>{tag}</li>
					{/each}
				</ul>

				<div class="mt-3 flex flex-wrap gap-4 text-sm">
					{#if project.url}
						<a
							href={project.url}
							target="_blank"
							rel="noreferrer"
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
							rel="noreferrer"
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
