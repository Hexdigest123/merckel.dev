<script lang="ts">
	import LinkStats from '$lib/components/tools/LinkStats.svelte';

	let { data }: { data: { title: string } } = $props();

	let url = $state('');
	let errorMessage = $state('');
	let shortUrl = $state('');
	let isSubmitting = $state(false);
	let isCopied = $state(false);
	let copyTimeoutId = $state<number | null>(null);

	let trimmedUrl = $derived(url.trim());
	let canSubmit = $derived(trimmedUrl.length > 0 && !isSubmitting);

	$effect(() => {
		return () => {
			if (copyTimeoutId !== null) {
				clearTimeout(copyTimeoutId);
			}
		};
	});

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		errorMessage = '';
		shortUrl = '';

		if (!trimmedUrl) {
			errorMessage = 'Geben Sie eine URL zum Kürzen ein.';
			return;
		}

		isSubmitting = true;

		try {
			const response = await fetch('/api/tools/shorten', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ url: trimmedUrl })
			});

			const body = (await response.json().catch(() => null)) as {
				success?: boolean;
				shortCode?: string;
				error?: string;
			} | null;

			if (!response.ok || !body?.success || !body.shortCode) {
				errorMessage = body?.error ?? 'Diese URL kann derzeit nicht gekürzt werden.';
				return;
			}

			shortUrl = `${globalThis.location.origin}/s/${body.shortCode}`;
		} catch {
			errorMessage = 'Netzwerkproblem erkannt. Bitte versuchen Sie es erneut.';
		} finally {
			isSubmitting = false;
		}
	}

	async function handleCopy() {
		if (!shortUrl) return;

		try {
			await navigator.clipboard.writeText(shortUrl);
			isCopied = true;
			if (copyTimeoutId !== null) {
				clearTimeout(copyTimeoutId);
			}
			copyTimeoutId = window.setTimeout(() => {
				isCopied = false;
				copyTimeoutId = null;
			}, 2000);
		} catch {
			errorMessage = 'Zwischenablage-Zugriff fehlgeschlagen. Kopieren Sie den Link manuell.';
		}
	}
</script>

<section class="mx-auto w-full max-w-2xl">
	<section class="rounded-lg border border-slate-200 bg-white p-6 sm:p-8">
		<h1 class="text-3xl font-bold text-slate-900">{data.title}</h1>
		<p class="mt-2 text-base text-slate-600">Lange URLs in kurze, teilbare Links umwandeln.</p>

		<form class="mt-6 space-y-4" onsubmit={handleSubmit} novalidate>
			<label class="block space-y-2 text-sm text-slate-600" for="url-input">
				<span>Lange URL</span>
				<input
					id="url-input"
					data-cursor="input"
					type="url"
					name="url"
					placeholder="https://example.com/some/really/long/path"
					bind:value={url}
					autocomplete="url"
					required
					aria-invalid={errorMessage ? 'true' : 'false'}
					class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-purple-400/80 focus:outline-none"
				/>
			</label>

			<div class="flex items-center gap-3">
				<button
					data-cursor="link"
					type="submit"
					disabled={!canSubmit}
					class="inline-flex items-center gap-2 rounded-md bg-purple-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-purple-600 disabled:cursor-not-allowed disabled:bg-purple-400/50"
				>
					{#if isSubmitting}
						<svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
							<circle
								class="opacity-30"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="3"
								fill="none"
							></circle>
							<path
								class="opacity-100"
								fill="currentColor"
								d="M12 2a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7z"
							></path>
						</svg>
						<span>Wird gekürzt...</span>
					{:else}
						<span>Kürzen</span>
					{/if}
				</button>
			</div>

			{#if errorMessage}
				<p role="alert" class="text-sm text-rose-600">{errorMessage}</p>
			{/if}
		</form>

		{#if shortUrl}
			<div class="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
				<p class="text-xs tracking-wide text-slate-400 uppercase">Kurze URL</p>
				<div class="mt-2 flex flex-wrap items-center gap-3">
					<a
						href={shortUrl}
						target="_blank"
						rel="noreferrer"
						data-cursor="link"
						class="font-mono text-sm text-purple-600 underline decoration-purple-400/50 underline-offset-4 hover:text-purple-700"
					>
						{shortUrl}
					</a>
					<button
						type="button"
						onclick={handleCopy}
						data-cursor="link"
						class="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors duration-200 hover:border-purple-400/60 hover:text-purple-700"
					>
						{isCopied ? 'Kopiert!' : 'Kopieren'}
					</button>
				</div>
			</div>
		{/if}
	</section>

	<div class="mt-6">
		<LinkStats />
	</div>
</section>
