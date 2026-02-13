<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import { siteConfig } from '$lib/data/site-config';

	const primarySocial = siteConfig.socials[0];
	const secondarySocial = siteConfig.socials[1];
</script>

<Section
	id="hero"
	title="Hero"
	description="Landing area and quick identity snapshot."
	mobileSticky={false}
>
	<div
		class="relative overflow-hidden rounded-2xl border border-slate-600/60 bg-slate-900/60 p-5 backdrop-blur-sm sm:p-7 lg:grid lg:grid-cols-[1.55fr,1fr] lg:gap-8 lg:p-9"
	>
		<div
			class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(139,92,246,0.2),transparent_42%),radial-gradient(circle_at_88%_84%,rgba(148,163,184,0.14),transparent_38%)]"
		></div>

		<div class="relative space-y-6">
			<p data-reveal-hero class="font-mono text-xs tracking-[0.24em] text-purple-300 uppercase">
				Available for select work
			</p>
			<h3
				data-reveal-hero
				class="max-w-2xl text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl lg:text-6xl"
			>
				{siteConfig.name}
			</h3>
			<p data-reveal-hero class="text-lg font-medium text-slate-200 sm:text-xl">
				{siteConfig.title}
			</p>
			<p data-reveal-hero class="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
				{siteConfig.subtitle}
			</p>
			<div data-reveal-hero class="flex flex-wrap gap-3">
				<a
					data-cursor="link"
					href="#projects"
					class="rounded-full bg-purple-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_10px_28px_rgba(139,92,246,0.34)] transition-colors duration-200 hover:bg-purple-400"
				>
					See Projects
				</a>
				<a
					data-cursor="link"
					href="#contact"
					class="rounded-full border border-slate-500/80 bg-slate-900/60 px-5 py-2.5 text-sm font-semibold text-slate-100 transition-colors duration-200 hover:border-purple-400 hover:text-purple-300"
				>
					Start a Conversation
				</a>
			</div>
			<a
				data-cursor="link"
				data-reveal-hero
				href="#about"
				class="inline-flex items-center gap-2 text-xs tracking-[0.2em] text-slate-400 uppercase transition-colors duration-200 hover:text-purple-300"
			>
				<span class="inline-block h-px w-8 bg-slate-500/90"></span>
				Scroll Down
			</a>
		</div>

		<div
			data-reveal-hero
			class="relative mt-6 grid gap-3 self-end sm:grid-cols-2 lg:mt-0 lg:grid-cols-1"
		>
			{#if primarySocial}
				<a
					data-cursor="link"
					href={primarySocial.url}
					target="_blank"
					rel="noreferrer"
					class="rounded-xl border border-slate-700/70 bg-slate-900/75 p-4 transition-colors duration-200 hover:border-purple-400/80"
				>
					<p class="font-mono text-xs tracking-wide text-slate-500 uppercase">Primary</p>
					<p class="mt-2 text-sm font-medium text-slate-100">{primarySocial.platform}</p>
				</a>
			{/if}
			{#if secondarySocial}
				<a
					data-cursor="link"
					href={secondarySocial.url}
					target="_blank"
					rel="noreferrer"
					class="rounded-xl border border-slate-700/70 bg-slate-900/75 p-4 transition-colors duration-200 hover:border-purple-400/80"
				>
					<p class="font-mono text-xs tracking-wide text-slate-500 uppercase">Network</p>
					<p class="mt-2 text-sm font-medium text-slate-100">{secondarySocial.platform}</p>
				</a>
			{/if}
		</div>

		<nav
			aria-label="Hero section indicators"
			class="absolute top-1/2 right-4 hidden -translate-y-1/2 xl:flex xl:flex-col xl:items-end xl:gap-3"
		>
			<a
				data-cursor="link"
				href="#hero"
				class="group inline-flex items-center gap-2 text-[10px] tracking-[0.24em] text-purple-300 uppercase"
			>
				<span class="h-px w-8 bg-purple-400"></span>
				Hero
			</a>
			<a
				data-cursor="link"
				href="#about"
				class="group inline-flex items-center gap-2 text-[10px] tracking-[0.24em] text-slate-500 uppercase transition-colors duration-200 hover:text-slate-300"
			>
				<span
					class="h-1.5 w-1.5 rounded-full bg-slate-600 transition-colors duration-200 group-hover:bg-slate-300"
				></span>
				About
			</a>
			<a
				data-cursor="link"
				href="#projects"
				class="group inline-flex items-center gap-2 text-[10px] tracking-[0.24em] text-slate-500 uppercase transition-colors duration-200 hover:text-slate-300"
			>
				<span
					class="h-1.5 w-1.5 rounded-full bg-slate-600 transition-colors duration-200 group-hover:bg-slate-300"
				></span>
				Projects
			</a>
			<a
				data-cursor="link"
				href="#contact"
				class="group inline-flex items-center gap-2 text-[10px] tracking-[0.24em] text-slate-500 uppercase transition-colors duration-200 hover:text-slate-300"
			>
				<span
					class="h-1.5 w-1.5 rounded-full bg-slate-600 transition-colors duration-200 group-hover:bg-slate-300"
				></span>
				Contact
			</a>
		</nav>
	</div>
</Section>
