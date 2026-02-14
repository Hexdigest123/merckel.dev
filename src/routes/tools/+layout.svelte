<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<main class="min-h-screen bg-slate-900 text-slate-200">
	<div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
		<nav class="mb-8 flex items-center gap-4">
			<a
				href="/"
				data-sveltekit-preload-data
				class="text-sm text-slate-400 transition-colors hover:text-purple-300"
			>
				← Startseite
			</a>
			<span class="text-slate-600">/</span>
			<a
				href="/tools"
				data-sveltekit-preload-data
				class="text-sm text-slate-400 transition-colors hover:text-purple-300"
			>
				Werkzeuge
			</a>
		</nav>
		{@render children()}
	</div>
</main>
