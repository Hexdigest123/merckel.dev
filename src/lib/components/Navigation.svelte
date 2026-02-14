<script lang="ts">
	import { browser } from '$app/environment';

	interface NavigationItem {
		id: string;
		label: string;
	}

	const DEFAULT_ITEMS: NavigationItem[] = [
		{ id: 'about', label: 'Über mich' },
		{ id: 'tools', label: 'Werkzeuge' },
		{ id: 'projects', label: 'Projekte' },
		{ id: 'experience', label: 'Erfahrung' },
		{ id: 'opensource', label: 'Open Source' },
		{ id: 'testimonials', label: 'Referenzen' },
		{ id: 'contact', label: 'Kontakt' }
	];

	let {
		items = DEFAULT_ITEMS,
		heading = 'Navigation',
		observerRoot = null
	}: {
		items?: NavigationItem[];
		heading?: string;
		observerRoot?: Element | null;
	} = $props();

	let firstItemId = $derived(items[0]?.id ?? '');
	let activeId = $state('');
	let hoveredId = $state('');

	$effect(() => {
		if (!activeId && firstItemId) {
			activeId = firstItemId;
		}
	});

	$effect(() => {
		if (!browser || items.length === 0) {
			return;
		}

		const hashId = window.location.hash.replace('#', '');
		if (hashId && items.some((item) => item.id === hashId)) {
			activeId = hashId;
		}

		const sections = items
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
				root: observerRoot,
				rootMargin: '-35% 0px -45% 0px',
				threshold: [0.25, 0.5, 0.75]
			}
		);

		sections.forEach((section) => observer.observe(section));

		const handleHashChange = () => {
			const nextId = window.location.hash.replace('#', '');
			if (nextId && items.some((item) => item.id === nextId)) {
				activeId = nextId;
			}
		};

		window.addEventListener('hashchange', handleHashChange);

		return () => {
			observer.disconnect();
			window.removeEventListener('hashchange', handleHashChange);
		};
	});

	function handleHover(id: string) {
		hoveredId = id;
	}

	function clearHover() {
		hoveredId = '';
	}

	function handleSelect(id: string) {
		activeId = id;
	}
</script>

<nav class="hidden lg:sticky lg:top-8 lg:block" aria-label="Section navigation">
	<p class="mb-5 font-mono text-xs tracking-[0.2em] text-slate-400 uppercase">{heading}</p>
	<ul class="space-y-2">
		{#each items as item (item.id)}
			<li>
				<a
					data-cursor="link"
					href={`#${item.id}`}
					aria-current={activeId === item.id ? 'location' : undefined}
					class="group flex items-center gap-3 rounded-sm py-1.5 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-purple-300"
					onmouseenter={() => handleHover(item.id)}
					onmouseleave={clearHover}
					onfocus={() => handleHover(item.id)}
					onblur={clearHover}
					onclick={() => handleSelect(item.id)}
				>
					<span
						class={`h-px bg-purple-400 transition-all duration-200 ${activeId === item.id || hoveredId === item.id ? 'w-9 opacity-100' : 'w-3 opacity-60'}`}
					></span>
					<span
						class={`font-mono text-sm transition-colors duration-200 ${activeId === item.id ? 'text-slate-100' : 'text-slate-400 group-hover:text-slate-300 group-focus-visible:text-slate-300'}`}
					>
						{item.label}
					</span>
				</a>
			</li>
		{/each}
	</ul>
</nav>
