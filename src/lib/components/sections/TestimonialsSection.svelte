<script lang="ts">
	import { browser } from '$app/environment';
	import Section from '$lib/components/Section.svelte';
	import { testimonials } from '$lib/data/testimonials';
	import { useLocale } from '$lib/i18n/locale.svelte';
	import { prefersReducedMotion } from '$lib/utils/motion';

	const i18n = useLocale();
	const ROTATION_MS = 5000;

	let activeIndex = $state(0);
	let isHovered = $state(false);
	let hasFocusWithin = $state(false);
	let activeQuote = $derived(testimonials[activeIndex] ?? testimonials[0]);

	$effect(() => {
		// Auto-rotation pauses while the reader hovers or keyboard-focuses the carousel.
		if (!browser || testimonials.length < 2 || isHovered || hasFocusWithin) {
			return;
		}

		if (prefersReducedMotion()) {
			return;
		}

		const intervalId = window.setInterval(() => {
			activeIndex = (activeIndex + 1) % testimonials.length;
		}, ROTATION_MS);

		return () => {
			window.clearInterval(intervalId);
		};
	});

	function goTo(index: number) {
		activeIndex = index;
	}
</script>

<Section id="testimonials" title={i18n.t('navTestimonials')}>
	<div
		class="space-y-4"
		data-testid="testimonials-list"
		role="group"
		aria-roledescription="carousel"
		aria-label={i18n.t('navTestimonials')}
		onmouseenter={() => (isHovered = true)}
		onmouseleave={() => (isHovered = false)}
		onfocusin={() => (hasFocusWithin = true)}
		onfocusout={(event) => {
			if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
				hasFocusWithin = false;
			}
		}}
	>
		{#if activeQuote}
			<blockquote lang="de">
				<p class="text-sm leading-7 text-slate-700 sm:text-base">"{activeQuote.quote}"</p>
				<footer class="mt-3 text-sm">
					<p class="font-semibold text-slate-900">{activeQuote.author}</p>
					<p class="text-slate-500">{activeQuote.role}, {activeQuote.company}</p>
				</footer>
			</blockquote>
		{/if}

		{#if testimonials.length > 1}
			<div class="flex items-center gap-2">
				{#each testimonials as quote, index (quote.id)}
					<button
						type="button"
						aria-current={index === activeIndex ? 'true' : undefined}
						aria-label={i18n.t('testimonialLabel', {
							current: index + 1,
							total: testimonials.length
						})}
						class={`h-2 rounded-full transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500 ${
							index === activeIndex ? 'w-6 bg-purple-500' : 'w-2 bg-slate-300 hover:bg-slate-400'
						}`}
						onclick={() => goTo(index)}
					></button>
				{/each}
			</div>
		{/if}
	</div>
</Section>
