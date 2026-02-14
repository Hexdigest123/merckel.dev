<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import { siteConfig } from '$lib/data/site-config';

	const bioParagraphs = siteConfig.bio
		.split(/\.\s+/)
		.map((sentence) => sentence.trim())
		.filter(Boolean)
		.map((sentence) => (sentence.endsWith('.') ? sentence : `${sentence}.`));
</script>

<Section id="about" title="Über mich" description="Hintergrund, Werte und persönliche Geschichte.">
	<div class="grid gap-5 lg:grid-cols-[1.3fr,1fr] lg:gap-8">
		<article
			data-reveal
			class="rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-800/55 to-slate-900/70 p-5 shadow-lg shadow-slate-950/20 sm:p-6"
		>
			<p class="font-mono text-xs tracking-[0.18em] text-purple-300 uppercase">Geschichte</p>
			<h3 class="mt-3 font-sans text-xl font-semibold text-slate-100 sm:text-2xl">Wer bin ich</h3>
			<div class="mt-4 space-y-3 text-sm leading-7 text-slate-300 sm:text-base">
				{#each bioParagraphs as paragraph}
					<p>{paragraph}</p>
				{/each}
			</div>
			<p class="mt-5 text-sm text-slate-400 sm:text-base">
				Offen für Zusammenarbeit via
				<a
					href={`mailto:${siteConfig.email}`}
					class="font-medium text-purple-300 underline decoration-purple-400/60 underline-offset-4 transition-colors duration-200 hover:text-purple-200"
				>
					{siteConfig.email}
				</a>
			</p>
		</article>

		<aside data-reveal class="rounded-2xl border border-slate-700/60 bg-slate-900/55 p-5 sm:p-6">
			<h3 class="font-sans text-lg font-semibold text-slate-100">Kontaktpunkte</h3>
			<ul class="mt-4 space-y-3" data-reveal-group>
				{#each siteConfig.socials as social (social.platform)}
					<li data-reveal-item>
						<a
							href={social.url}
							target="_blank"
							rel="noreferrer"
							class="group flex items-center justify-between gap-3 rounded-xl border border-slate-700/50 bg-slate-800/40 px-3 py-2 text-sm text-slate-300 transition-colors duration-200 hover:border-purple-400/40 hover:text-slate-100 sm:text-base"
						>
							<span class="flex items-center gap-3">
								<span class="mt-2 block h-1.5 w-1.5 rounded-full bg-purple-400"></span>
								<span>{social.platform}</span>
							</span>
							<span
								class="font-mono text-xs tracking-wider text-slate-500 transition-colors duration-200 group-hover:text-purple-200"
							>
								Besuchen
							</span>
						</a>
					</li>
				{/each}
			</ul>
		</aside>
	</div>
</Section>
