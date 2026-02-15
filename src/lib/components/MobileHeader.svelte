<script lang="ts">
	import { browser } from '$app/environment';
	import { prefersReducedMotion } from '$lib/utils/gsap';

	interface NavItem {
		id: string;
		label: string;
	}

	let {
		navItems = [],
		secretsFound = 0,
		secretsTotal = 0
	}: {
		navItems?: NavItem[];
		secretsFound?: number;
		secretsTotal?: number;
	} = $props();

	let isDrawerOpen = $state(false);
	let activeId = $state('');
	let reducedMotion = $state(false);

	$effect(() => {
		if (!browser || navItems.length === 0) {
			return;
		}

		reducedMotion = prefersReducedMotion();

		if (!activeId && navItems[0]) {
			activeId = navItems[0].id;
		}

		const sections = navItems
			.map((item) => document.getElementById(item.id))
			.filter((section): section is HTMLElement => section !== null);

		if (sections.length === 0) {
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((entry) => entry.isIntersecting)
					.sort((a, b) => b.intersectionRatio - a.intersectionRatio);

				if (visible[0]) {
					activeId = visible[0].target.id;
				}
			},
			{
				root: null,
				rootMargin: '-35% 0px -45% 0px',
				threshold: [0.25, 0.5, 0.75]
			}
		);

		sections.forEach((section) => observer.observe(section));

		return () => {
			observer.disconnect();
		};
	});

	$effect(() => {
		if (!browser) {
			return;
		}

		if (isDrawerOpen) {
			const scrollY = window.scrollY;
			document.body.style.overflow = 'hidden';
			document.body.style.position = 'fixed';
			document.body.style.top = `-${scrollY}px`;
			document.body.style.left = '0';
			document.body.style.right = '0';

			return () => {
				document.body.style.overflow = '';
				document.body.style.position = '';
				document.body.style.top = '';
				document.body.style.left = '';
				document.body.style.right = '';
				window.scrollTo(0, scrollY);
			};
		}
	});

	$effect(() => {
		if (!browser || !isDrawerOpen) {
			return;
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				event.preventDefault();
				isDrawerOpen = false;
			}
		};

		window.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	});

	function toggleDrawer() {
		isDrawerOpen = !isDrawerOpen;
	}

	function navigateToSection(id: string) {
		isDrawerOpen = false;

		requestAnimationFrame(() => {
			const target = document.getElementById(id);
			if (target) {
				target.scrollIntoView({
					behavior: reducedMotion ? 'auto' : 'smooth',
					block: 'start'
				});
				window.history.replaceState(null, '', `#${id}`);
			}
		});
	}
</script>

<!-- Mobile Header Bar -->
<header
	class="fixed inset-x-0 top-0 z-30 flex h-14 items-center border-b border-slate-700/50 bg-slate-900/95 px-4 backdrop-blur-sm lg:hidden"
>
	<div class="ml-auto flex items-center gap-3">
		{#if secretsFound > 0}
			<span
				class="rounded-md border border-slate-600/50 bg-slate-800/60 px-2 py-1 font-mono text-xs text-slate-400"
				title="Geheimnisse gefunden"
			>
				🔓 {secretsFound}/{secretsTotal}
			</span>
		{/if}

		<button
			type="button"
			class="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 transition-colors duration-150 hover:bg-slate-800 hover:text-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-300"
			onclick={toggleDrawer}
			aria-label={isDrawerOpen ? 'Navigation schließen' : 'Navigation öffnen'}
			aria-expanded={isDrawerOpen}
		>
			<svg
				class="h-5 w-5"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				{#if isDrawerOpen}
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
				{:else}
					<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
				{/if}
			</svg>
		</button>
	</div>
</header>

<!-- Drawer Overlay -->
{#if isDrawerOpen}
	<button
		type="button"
		class="mobile-drawer-overlay fixed inset-0 z-40 lg:hidden"
		class:is-open={isDrawerOpen}
		class:no-motion={reducedMotion}
		onclick={() => (isDrawerOpen = false)}
		aria-label="Navigation schließen"
	></button>
{/if}

<!-- Navigation Drawer -->
<nav
	class="mobile-drawer fixed top-0 right-0 z-50 flex h-full w-[75vw] max-w-xs flex-col border-l border-slate-700/50 bg-slate-900 lg:hidden"
	class:is-open={isDrawerOpen}
	class:no-motion={reducedMotion}
	aria-label="Mobile Navigation"
	aria-hidden={!isDrawerOpen}
>
	<div class="flex items-center justify-between border-b border-slate-700/50 px-5 py-4">
		<p class="font-mono text-xs tracking-[0.2em] text-slate-400 uppercase">Sektionen</p>
		<button
			type="button"
			class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors duration-150 hover:text-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-300"
			onclick={() => (isDrawerOpen = false)}
			aria-label="Navigation schließen"
		>
			<svg
				class="h-4 w-4"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>
	</div>

	<ul class="flex-1 overflow-y-auto px-2 py-3">
		{#each navItems as item (item.id)}
			<li>
				<button
					type="button"
					class={`group flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors duration-150 ${
						activeId === item.id
							? 'bg-purple-500/10 text-slate-100'
							: 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-300'
					}`}
					onclick={() => navigateToSection(item.id)}
				>
					<span
						class={`h-px transition-all duration-200 ${
							activeId === item.id ? 'w-6 bg-purple-400 opacity-100' : 'w-3 bg-slate-600 opacity-60'
						}`}
					></span>
					<span class="font-mono text-sm">{item.label}</span>
				</button>
			</li>
		{/each}
	</ul>

	<div class="border-t border-slate-700/50 px-5 py-4">
		<p class="font-mono text-xs tracking-[0.18em] text-purple-300/70 uppercase">Portfolio Shell</p>
	</div>
</nav>

<style>
	.mobile-drawer-overlay {
		background-color: rgb(2 6 23 / 0);
		backdrop-filter: blur(0);
		transition:
			background-color 300ms ease-out,
			backdrop-filter 300ms ease-out;
	}

	.mobile-drawer-overlay.is-open {
		background-color: rgb(2 6 23 / 0.7);
		backdrop-filter: blur(4px);
	}

	.mobile-drawer-overlay.no-motion {
		transition: none;
	}

	.mobile-drawer {
		transform: translateX(100%);
		transition: transform 300ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	.mobile-drawer.is-open {
		transform: translateX(0);
	}

	.mobile-drawer.no-motion {
		transition: none;
	}
</style>
