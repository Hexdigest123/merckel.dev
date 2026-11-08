<script lang="ts">
	import { page } from '$app/state';
	import { useLocale } from '$lib/i18n/locale.svelte';

	type LinkStatsResult = {
		originalUrl: string;
		shortCode: string;
		clicks: number;
		createdAt: string | null;
	};

	type StatsResponse = {
		success?: boolean;
		error?: string;
		originalUrl?: string;
		shortCode?: string;
		clicks?: number;
		createdAt?: string;
	};

	const de = {
		title: 'Link-Statistiken',
		inputLabel: 'Kurzcode oder Kurz-URL',
		placeholder: 'Kurzcode oder URL einfügen',
		lookup: 'Nachschlagen',
		lookingUp: 'Wird gesucht...',
		missingCode: 'Geben Sie einen Kurzcode oder eine Kurz-URL ein.',
		notFound: 'Für diesen Kurzcode wurden keine Statistiken gefunden.',
		failed: 'Statistiken für diesen Kurzcode konnten nicht geladen werden.',
		originalUrl: 'Original-URL',
		shortUrl: 'Kurz-URL',
		clicks: 'Klicks',
		created: 'Erstellt',
		refresh: 'Aktualisieren'
	};

	const en: typeof de = {
		title: 'Link statistics',
		inputLabel: 'Short code or short URL',
		placeholder: 'Paste a short code or URL',
		lookup: 'Look up',
		lookingUp: 'Looking up...',
		missingCode: 'Enter a short code or a short URL.',
		notFound: 'No statistics were found for this short code.',
		failed: 'The statistics for this short code could not be loaded.',
		originalUrl: 'Original URL',
		shortUrl: 'Short URL',
		clicks: 'Clicks',
		created: 'Created',
		refresh: 'Refresh'
	};

	const COPY = { de, en };

	const i18n = useLocale();

	let t = $derived(COPY[i18n.current]);

	let inputValue = $state('');
	let isLoading = $state(false);
	let errorMessage = $state('');
	let stats = $state<LinkStatsResult | null>(null);
	let lastCode = $state('');

	let displayShortUrl = $derived(stats?.shortCode ? `${page.url.origin}/s/${stats.shortCode}` : '');
	let createdAtLabel = $derived.by(() => {
		if (!stats?.createdAt) return '-';
		const parsed = new Date(stats.createdAt);
		if (Number.isNaN(parsed.getTime())) return '-';
		return parsed.toLocaleString(i18n.current === 'de' ? 'de-DE' : 'en-US');
	});

	function extractCode(rawValue: string): string {
		const trimmed = rawValue.trim();
		if (!trimmed) return '';

		const directMatch = trimmed.replace(/^\/+/, '').match(/^s\/([^/?#]+)/i);
		if (directMatch?.[1]) {
			return directMatch[1].trim();
		}

		try {
			const parsed = new URL(trimmed);
			const parts = parsed.pathname.split('/').filter(Boolean);
			if (!parts.length) return '';
			if (parts[0]?.toLowerCase() === 's' && parts[1]) {
				return parts[1].trim();
			}
			return (parts.at(-1) ?? '').trim();
		} catch {
			return trimmed;
		}
	}

	async function lookupStats(event?: SubmitEvent) {
		event?.preventDefault();
		if (isLoading) return;

		const code = extractCode(inputValue);
		if (!code) {
			errorMessage = t.missingCode;
			stats = null;
			return;
		}

		isLoading = true;
		errorMessage = '';

		try {
			const response = await fetch(`/api/tools/shorten/${encodeURIComponent(code)}/stats`);
			const body = (await response.json().catch(() => null)) as StatsResponse | null;

			if (!response.ok || !body?.success || !body.shortCode || !body.originalUrl) {
				errorMessage = response.status === 404 ? t.notFound : t.failed;
				stats = null;
				return;
			}

			stats = {
				originalUrl: body.originalUrl,
				shortCode: body.shortCode,
				clicks: body.clicks ?? 0,
				createdAt: body.createdAt ?? null
			};
			lastCode = body.shortCode;
			inputValue = body.shortCode;
		} catch {
			errorMessage = i18n.t('networkError');
			stats = null;
		} finally {
			isLoading = false;
		}
	}

	async function refreshStats() {
		if (!lastCode) return;
		inputValue = lastCode;
		await lookupStats();
	}
</script>

<section class="rounded-lg border border-slate-200 bg-white p-5" aria-labelledby="link-stats-title">
	<h2 id="link-stats-title" class="font-mono text-xs tracking-wide text-slate-500 uppercase">
		{t.title}
	</h2>

	<form class="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center" onsubmit={lookupStats}>
		<input
			type="text"
			bind:value={inputValue}
			placeholder={t.placeholder}
			aria-label={t.inputLabel}
			autocomplete="off"
			spellcheck="false"
			class="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:outline-none"
		/>
		<button
			type="submit"
			disabled={isLoading}
			class="inline-flex shrink-0 items-center justify-center rounded-md bg-purple-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-purple-600 disabled:cursor-not-allowed disabled:bg-purple-400"
		>
			{isLoading ? t.lookingUp : t.lookup}
		</button>
	</form>

	{#if errorMessage}
		<p role="alert" class="mt-3 text-sm text-rose-600">{errorMessage}</p>
	{/if}

	{#if stats}
		<div class="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
			<dl class="grid gap-4 sm:grid-cols-2">
				<div class="space-y-1">
					<dt class="text-xs text-slate-500 uppercase">{t.originalUrl}</dt>
					<dd>
						<a
							href={stats.originalUrl}
							target="_blank"
							rel="external noreferrer"
							class="font-mono text-sm break-all text-slate-900 underline decoration-slate-300 underline-offset-4 hover:text-purple-600"
						>
							{stats.originalUrl}
						</a>
					</dd>
				</div>

				<div class="space-y-1">
					<dt class="text-xs text-slate-500 uppercase">{t.shortUrl}</dt>
					<dd>
						<a
							href={displayShortUrl}
							target="_blank"
							rel="external noreferrer"
							class="font-mono text-sm break-all text-slate-900 underline decoration-slate-300 underline-offset-4 hover:text-purple-600"
						>
							{displayShortUrl}
						</a>
					</dd>
				</div>

				<div class="space-y-1">
					<dt class="text-xs text-slate-500 uppercase">{t.clicks}</dt>
					<dd class="text-2xl font-semibold text-purple-600">{stats.clicks}</dd>
				</div>

				<div class="space-y-1">
					<dt class="text-xs text-slate-500 uppercase">{t.created}</dt>
					<dd class="text-sm text-slate-900">{createdAtLabel}</dd>
				</div>
			</dl>

			<div class="mt-4">
				<button
					type="button"
					onclick={refreshStats}
					disabled={isLoading}
					class="inline-flex items-center rounded-md border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 transition-colors duration-200 hover:border-purple-400 hover:text-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{t.refresh}
				</button>
			</div>
		</div>
	{/if}
</section>
