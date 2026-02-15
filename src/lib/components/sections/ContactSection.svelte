<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import { siteConfig } from '$lib/data/site-config';

	let hoveredSocial = $state('');
</script>

<Section id="contact" title="Kontakt" description="Kontaktmöglichkeiten und Anfragen.">
	<div class="grid gap-5">
		<aside
			class="rounded-2xl border border-slate-700/60 bg-slate-800/30 p-5 text-slate-300 sm:p-6"
			data-reveal
		>
			<h3 class="font-sans text-lg font-semibold text-slate-100">
				Lassen Sie uns etwas Nützliches bauen
			</h3>
			<p class="mt-3 text-sm leading-7 text-slate-300 sm:text-base">
				Teilen Sie mir Ihren Zeitplan, Ihre Ziele und Rahmenbedingungen mit. Ich antworte mit einem
				konkreten Plan und den nächsten Schritten.
			</p>
			<a
				data-cursor="link"
				href={`mailto:${siteConfig.email}`}
				class="mt-4 inline-flex rounded-full border border-purple-400/55 bg-purple-500/15 px-4 py-2 text-sm text-purple-200 transition-colors duration-200 hover:bg-purple-500/25"
			>
				{siteConfig.email}
			</a>

			<ul class="mt-5 space-y-2" data-testid="contact-socials" data-reveal-group>
				{#each siteConfig.socials as social (social.platform)}
					<li data-reveal-item>
						<a
							data-cursor="link"
							href={social.url}
							target="_blank"
							rel="noreferrer"
							class={`group flex items-center justify-between gap-3 rounded-xl border border-slate-700/50 bg-slate-800/40 px-3 py-2 text-sm text-slate-300 transition-all duration-200 hover:border-purple-400/40 hover:text-slate-100 sm:text-base ${
								hoveredSocial && hoveredSocial !== social.platform ? 'opacity-45' : 'opacity-100'
							}`}
							onmouseenter={() => (hoveredSocial = social.platform)}
							onmouseleave={() => (hoveredSocial = '')}
						>
							<span class="flex items-center gap-3">
								<span class="block h-1.5 w-1.5 rounded-full bg-purple-400"></span>
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
