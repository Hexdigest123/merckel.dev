<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import { localizeGithubProfileLabel, localizeOssLabel } from '$lib/i18n/content';
	import { useLocale } from '$lib/i18n/locale.svelte';
	import type { OpenSourceData } from '$lib/types/content';

	const i18n = useLocale();
	let { data }: { data: OpenSourceData } = $props();
</script>

<Section id="opensource" title={i18n.t('navOpenSource')}>
	<div class="space-y-8">
		{#if data.stats.length > 0}
			<ul class="grid gap-4 sm:grid-cols-3">
				{#each data.stats as stat (stat.label)}
					<li>
						<p class="font-mono text-xs tracking-wide text-slate-500 uppercase">
							{localizeOssLabel(i18n, stat.label)}
						</p>
						<p class="mt-1 text-xl font-semibold text-slate-900">{stat.value}</p>
					</li>
				{/each}
			</ul>
		{/if}

		<div class="space-y-6" data-testid="opensource-contributions">
			{#if data.contributions.length > 0}
				{#each data.contributions as contribution (contribution.id)}
					<article>
						{#if contribution.url}
							<a
								href={contribution.url}
								target="_blank"
								rel="noreferrer"
								class="font-sans text-base font-semibold text-slate-900 hover:text-purple-600 sm:text-lg"
							>
								{contribution.title}
							</a>
						{:else}
							<p class="font-sans text-base font-semibold text-slate-900 sm:text-lg">
								{contribution.title}
							</p>
						{/if}
						{#if contribution.description}
							<p class="mt-1 text-sm text-slate-600">{contribution.description}</p>
						{/if}
						{#if contribution.tags.length > 0}
							<ul class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-500">
								{#each contribution.tags as tag (tag)}
									<li>{tag}</li>
								{/each}
							</ul>
						{/if}
					</article>
				{/each}
			{/if}
		</div>

		{#if data.profileUrl}
			<a
				href={data.profileUrl}
				target="_blank"
				rel="noreferrer"
				class="inline-block text-sm text-purple-600 hover:text-purple-700"
			>
				{localizeGithubProfileLabel(i18n, data.profileLabel)}
			</a>
		{/if}
	</div>
</Section>
