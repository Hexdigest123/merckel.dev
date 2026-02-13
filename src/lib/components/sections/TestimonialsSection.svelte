<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import { testimonials } from '$lib/data/testimonials';

	let hoveredTestimonialId = $state('');
</script>

<Section id="testimonials" title="Testimonials" description="Social proof and collaborator quotes.">
	<div
		class="grid gap-4 sm:grid-cols-2 lg:grid-cols-1"
		data-testid="testimonials-list"
		data-reveal-group
	>
		{#each testimonials as quote, index (quote.id)}
			<blockquote
				data-reveal-item
				class={`relative overflow-hidden rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-800/55 via-slate-800/35 to-purple-500/10 p-5 shadow-[0_10px_40px_-24px_rgba(139,92,246,0.8)] transition-all duration-200 sm:p-6 ${
					hoveredTestimonialId && hoveredTestimonialId !== quote.id ? 'opacity-45' : 'opacity-100'
				}`}
				onmouseenter={() => (hoveredTestimonialId = quote.id)}
				onmouseleave={() => (hoveredTestimonialId = '')}
			>
				<div
					class="pointer-events-none absolute -top-8 right-4 text-8xl leading-none text-purple-300/20"
				>
					"
				</div>
				<p class="text-sm leading-7 text-slate-200 sm:text-base">"{quote.quote}"</p>
				<footer class="mt-4 border-t border-slate-700/70 pt-4">
					<p class="font-semibold text-slate-100">{quote.author}</p>
					<p class="text-sm text-slate-400">{quote.role} at {quote.company}</p>
					<p class="mt-2 font-mono text-[11px] tracking-[0.2em] text-purple-300/70 uppercase">
						Client voice {index + 1}
					</p>
				</footer>
			</blockquote>
		{/each}
	</div>
</Section>
