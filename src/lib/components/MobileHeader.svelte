<script lang="ts">
	import { browser } from '$app/environment';
	import { tick, untrack } from 'svelte';
	import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
	import { useLocale } from '$lib/i18n/locale.svelte';
	import { preferredScrollBehavior } from '$lib/utils/motion';

	interface NavItem {
		id: string;
		label: string;
	}

	let {
		navItems = []
	}: {
		navItems?: NavItem[];
	} = $props();

	const i18n = useLocale();

	let isDrawerOpen = $state(false);
	let activeId = $state('');
	let toggleButton = $state<HTMLButtonElement | null>(null);
	let closeButton = $state<HTMLButtonElement | null>(null);

	$effect(() => {
		if (!browser || navItems.length === 0) {
			return;
		}

		// Only pick a default; reading `activeId` here must not re-create the observer.
		untrack(() => {
			if (!activeId && navItems[0]) {
				activeId = navItems[0].id;
			}
		});

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
		if (!browser || !isDrawerOpen) {
			return;
		}

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
			// `instant` bypasses the page-wide `scroll-behavior: smooth`, which would
			// otherwise animate the page back down from the top.
			window.scrollTo({ top: scrollY, behavior: 'instant' });
		};
	});

	$effect(() => {
		if (!browser || !isDrawerOpen) {
			return;
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				event.preventDefault();
				closeDrawer({ restoreFocus: true });
			}
		};

		window.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	});

	async function openDrawer() {
		isDrawerOpen = true;
		await tick();
		closeButton?.focus();
	}

	function closeDrawer({ restoreFocus = false } = {}) {
		isDrawerOpen = false;
		if (restoreFocus) {
			toggleButton?.focus();
		}
	}

	function toggleDrawer() {
		if (isDrawerOpen) {
			closeDrawer();
		} else {
			void openDrawer();
		}
	}

	function navigateToSection(id: string) {
		closeDrawer();

		// Wait until the scroll lock has been released and the position restored.
		requestAnimationFrame(() => {
			const target = document.getElementById(id);
			if (!target) {
				return;
			}

			if (window.location.hash === `#${id}`) {
				target.scrollIntoView({ behavior: preferredScrollBehavior(), block: 'start' });
			} else {
				window.location.hash = id;
			}
		});
	}
</script>

<header
	class="fixed inset-x-0 top-0 z-30 flex h-14 items-center border-b border-slate-200 bg-white px-4 lg:hidden"
>
	<div class="ml-auto flex items-center gap-3">
		<LanguageSwitcher />
		<button
			bind:this={toggleButton}
			type="button"
			class="flex h-9 w-9 items-center justify-center rounded-md text-slate-600 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500"
			onclick={toggleDrawer}
			aria-label={isDrawerOpen ? i18n.t('navClose') : i18n.t('navOpen')}
			aria-expanded={isDrawerOpen}
			aria-controls="mobile-navigation"
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

{#if isDrawerOpen}
	<button
		type="button"
		class="fixed inset-0 z-40 bg-slate-900/20 lg:hidden"
		onclick={() => closeDrawer()}
		aria-label={i18n.t('navClose')}
		tabindex="-1"
	></button>
{/if}

<!-- `inert` keeps the off-screen drawer out of the tab order and the accessibility tree. -->
<nav
	id="mobile-navigation"
	class="fixed top-0 right-0 z-50 flex h-full w-[75vw] max-w-xs flex-col border-l border-slate-200 bg-white transition-transform duration-200 lg:hidden"
	class:translate-x-0={isDrawerOpen}
	class:translate-x-full={!isDrawerOpen}
	aria-label={i18n.t('navSections')}
	inert={!isDrawerOpen}
>
	<div class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
		<p class="text-xs tracking-wide text-slate-500 uppercase">{i18n.t('navSections')}</p>
		<button
			bind:this={closeButton}
			type="button"
			class="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors duration-150 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500"
			onclick={() => closeDrawer({ restoreFocus: true })}
			aria-label={i18n.t('navClose')}
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
					aria-current={activeId === item.id ? 'location' : undefined}
					class={`w-full rounded-md px-3 py-3 text-left text-sm transition-colors duration-150 ${
						activeId === item.id
							? 'bg-purple-50 font-medium text-purple-700'
							: 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
					}`}
					onclick={() => navigateToSection(item.id)}
				>
					{item.label}
				</button>
			</li>
		{/each}
	</ul>
</nav>
