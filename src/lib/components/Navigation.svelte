<script lang="ts">
	import { browser } from '$app/environment';

	interface NavigationItem {
		id: string;
		label: string;
	}

	const DEFAULT_ITEMS: NavigationItem[] = [
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

	function handleSelect(id: string) {
		activeId = id;
	}
</script>

<nav class="hidden lg:block" aria-label="Section navigation">
	<p class="sr-only">{heading}</p>
	<ul class="flex flex-wrap gap-x-5 gap-y-2">
		{#each items as item (item.id)}
			<li>
				<a
					href={`#${item.id}`}
					aria-current={activeId === item.id ? 'location' : undefined}
					class={`text-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-purple-500 ${
						activeId === item.id
							? 'font-medium text-purple-600'
							: 'text-slate-500 hover:text-slate-900'
					}`}
					onclick={() => handleSelect(item.id)}
				>
					{item.label}
				</a>
			</li>
		{/each}
	</ul>
</nav>
