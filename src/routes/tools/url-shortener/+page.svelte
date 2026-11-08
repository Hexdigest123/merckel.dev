<script lang="ts">
	import LinkStats from '$lib/components/tools/LinkStats.svelte';
	import { getLocalizedTool } from '$lib/i18n/content';
	import { useLocale } from '$lib/i18n/locale.svelte';
	import { CopyFeedback } from '$lib/utils/clipboard.svelte';

	const de = {
		longUrl: 'Lange URL',
		placeholder: 'https://example.com/ein/sehr/langer/pfad',
		shorten: 'Kürzen',
		shortening: 'Wird gekürzt...',
		emptyUrl: 'Geben Sie eine URL zum Kürzen ein.',
		failed: 'Diese URL kann derzeit nicht gekürzt werden.',
		rateLimited: 'Zu viele Anfragen. Bitte warten Sie kurz und versuchen Sie es erneut.',
		shortUrl: 'Kurze URL'
	};

	const en: typeof de = {
		longUrl: 'Long URL',
		placeholder: 'https://example.com/some/really/long/path',
		shorten: 'Shorten',
		shortening: 'Shortening...',
		emptyUrl: 'Enter a URL to shorten.',
		failed: 'This URL cannot be shortened right now.',
		rateLimited: 'Too many requests. Please wait a moment and try again.',
		shortUrl: 'Short URL'
	};

	const COPY = { de, en };

	const i18n = useLocale();
	const clipboard = new CopyFeedback();

	let t = $derived(COPY[i18n.current]);
	let tool = $derived(getLocalizedTool(i18n, 'url-shortener'));

	let url = $state('');
	let errorMessage = $state('');
	let shortUrl = $state('');
	let isSubmitting = $state(false);

	let trimmedUrl = $derived(url.trim());
	let canSubmit = $derived(trimmedUrl.length > 0 && !isSubmitting);

	$effect(() => () => clipboard.dispose());

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		errorMessage = '';
		shortUrl = '';
		clipboard.reset();

		if (!trimmedUrl) {
			errorMessage = t.emptyUrl;
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

			if (response.status === 429) {
				errorMessage = t.rateLimited;
				return;
			}

			if (!response.ok || !body?.success || !body.shortCode) {
				// Validation messages from the API are only available in English.
				errorMessage = body?.error ?? t.failed;
				return;
			}

			shortUrl = `${window.location.origin}/s/${body.shortCode}`;
		} catch {
			errorMessage = i18n.t('networkError');
		} finally {
			isSubmitting = false;
		}
	}

	async function handleCopy() {
		if (!shortUrl) return;
		if (!(await clipboard.copy(shortUrl))) {
			errorMessage = i18n.t('clipboardFailed');
		}
	}
</script>

<section class="mx-auto w-full max-w-2xl">
	<section class="rounded-lg border border-slate-200 bg-white p-6 sm:p-8">
		<h1 class="text-3xl font-bold text-slate-900">{tool.name}</h1>
		<p class="mt-2 text-base text-slate-600">{tool.description}</p>

		<form class="mt-6 space-y-4" onsubmit={handleSubmit} novalidate>
			<label class="block space-y-2 text-sm text-slate-600" for="url-input">
				<span>{t.longUrl}</span>
				<input
					id="url-input"
					type="url"
					name="url"
					placeholder={t.placeholder}
					bind:value={url}
					autocomplete="url"
					required
					aria-invalid={errorMessage ? 'true' : 'false'}
					aria-describedby={errorMessage ? 'url-error' : undefined}
					class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-purple-400/80 focus:outline-none"
				/>
			</label>

			<div class="flex items-center gap-3">
				<button
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
						<span>{t.shortening}</span>
					{:else}
						<span>{t.shorten}</span>
					{/if}
				</button>
			</div>

			{#if errorMessage}
				<p id="url-error" role="alert" class="text-sm text-rose-600">{errorMessage}</p>
			{/if}
		</form>

		{#if shortUrl}
			<div class="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4" role="status">
				<p class="text-xs tracking-wide text-slate-500 uppercase">{t.shortUrl}</p>
				<div class="mt-2 flex flex-wrap items-center gap-3">
					<a
						href={shortUrl}
						target="_blank"
						rel="external noreferrer"
						class="font-mono text-sm text-purple-600 underline decoration-purple-400/50 underline-offset-4 hover:text-purple-700"
					>
						{shortUrl}
					</a>
					<button
						type="button"
						onclick={handleCopy}
						class="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors duration-200 hover:border-purple-400/60 hover:text-purple-700"
					>
						{clipboard.isCopied() ? i18n.t('copied') : i18n.t('copy')}
					</button>
				</div>
			</div>
		{/if}
	</section>

	<div class="mt-6">
		<LinkStats />
	</div>
</section>
