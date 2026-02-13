<script lang="ts">
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
			errorMessage = 'Enter a URL to shorten.';
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
				errorMessage = body?.error ?? 'Unable to shorten this URL right now.';
				return;
			}

			shortUrl = `${globalThis.location.origin}/s/${body.shortCode}`;
		} catch {
			errorMessage = 'Network issue detected. Please try again.';
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
			errorMessage = 'Clipboard access failed. Copy the link manually.';
		}
	}
</script>

<section class="mx-auto w-full max-w-2xl">
	<section class="rounded-2xl border border-slate-700/60 bg-slate-800/30 p-6 sm:p-8">
		<h1 class="text-3xl font-bold text-slate-100">{data.title}</h1>
		<p class="mt-2 text-base text-slate-300">Shorten long URLs into clean, shareable links.</p>

		<form class="mt-6 space-y-4" onsubmit={handleSubmit} novalidate>
			<label class="block space-y-2 text-sm text-slate-300" for="url-input">
				<span>Long URL</span>
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
					class="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:border-purple-400/80 focus:outline-none"
				/>
			</label>

			<div class="flex items-center gap-3">
				<button
					data-cursor="link"
					type="submit"
					disabled={!canSubmit}
					class="inline-flex items-center gap-2 rounded-full bg-purple-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors duration-200 hover:bg-purple-400 disabled:cursor-not-allowed disabled:bg-purple-400/50"
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
						<span>Shortening...</span>
					{:else}
						<span>Shorten</span>
					{/if}
				</button>
			</div>

			{#if errorMessage}
				<p role="alert" class="text-sm text-rose-300">{errorMessage}</p>
			{/if}
		</form>

		{#if shortUrl}
			<div class="mt-6 rounded-xl border border-slate-700 bg-slate-900/55 p-4">
				<p class="text-xs tracking-wide text-slate-400 uppercase">Short URL</p>
				<div class="mt-2 flex flex-wrap items-center gap-3">
					<a
						href={shortUrl}
						target="_blank"
						rel="noreferrer"
						data-cursor="link"
						class="font-mono text-sm text-purple-200 underline decoration-purple-400/50 underline-offset-4 hover:text-purple-100"
					>
						{shortUrl}
					</a>
					<button
						type="button"
						onclick={handleCopy}
						data-cursor="link"
						class="rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors duration-200 hover:border-purple-400/60 hover:text-purple-200"
					>
						{isCopied ? 'Copied!' : 'Copy'}
					</button>
				</div>
			</div>
		{/if}
	</section>
</section>
