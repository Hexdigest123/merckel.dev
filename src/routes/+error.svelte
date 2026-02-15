<script lang="ts">
	import { page } from '$app/state';
</script>

<main class="flex min-h-screen items-center justify-center bg-slate-900 px-4 text-slate-200">
	<div class="max-w-md text-center">
		<p class="font-mono text-7xl font-bold tracking-tight text-purple-400">
			{page.status}
		</p>

		{#if page.status === 404}
			<h1 class="mt-4 text-2xl font-semibold text-slate-100">Seite nicht gefunden</h1>
			<p class="mt-3 text-slate-400">
				Die angeforderte Seite existiert nicht oder wurde verschoben.
			</p>
		{:else}
			<h1 class="mt-4 text-2xl font-semibold text-slate-100">Etwas ist schiefgelaufen</h1>
			<p class="mt-3 text-slate-400">
				{page.error?.message ?? 'Ein unerwarteter Fehler ist aufgetreten.'}
			</p>
		{/if}

		<div class="mt-8 flex items-center justify-center gap-4">
			<a
				href="/"
				data-sveltekit-preload-data
				class="inline-flex rounded-full bg-purple-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors duration-200 hover:bg-purple-400"
			>
				Zur Startseite
			</a>
			<a
				href="/tools"
				data-sveltekit-preload-data
				class="inline-flex rounded-full border border-slate-600 px-5 py-2.5 text-sm text-slate-300 transition-colors duration-200 hover:border-purple-400 hover:text-purple-300"
			>
				Werkzeuge
			</a>
		</div>
	</div>
</main>
