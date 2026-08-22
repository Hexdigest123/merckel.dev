<script lang="ts">
	let { siteOrigin = '' }: { siteOrigin?: string } = $props();

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

	let inputValue = $state('');
	let isLoading = $state(false);
	let errorMessage = $state('');
	let stats = $state<LinkStatsResult | null>(null);
	let lastCode = $state('');

	let normalizedOrigin = $derived(siteOrigin.trim().replace(/\/+$/, ''));
	let displayShortUrl = $derived.by(() => {
		if (!stats?.shortCode) return '';
		const path = `/s/${stats.shortCode}`;
		return normalizedOrigin ? `${normalizedOrigin}${path}` : path;
	});
	let createdAtLabel = $derived.by(() => {
		if (!stats?.createdAt) return '-';
		const parsed = new Date(stats.createdAt);
		if (Number.isNaN(parsed.getTime())) return '-';
		return parsed.toLocaleString();
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

	async function lookupStats() {
		if (isLoading) return;

		const code = extractCode(inputValue);
		if (!code) {
			errorMessage = 'Geben Sie einen Kurzcode oder eine Kurz-URL ein.';
			stats = null;
			return;
		}

		isLoading = true;
		errorMessage = '';

		try {
			const response = await fetch(`/api/tools/shorten/${encodeURIComponent(code)}/stats`);
			const body = (await response.json().catch(() => null)) as StatsResponse | null;

			if (!response.ok || !body?.success || !body.shortCode || !body.originalUrl) {
				errorMessage =
					body?.error ?? 'Statistiken für diesen Kurzcode konnten nicht geladen werden.';
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
			errorMessage = 'Netzwerkproblem erkannt. Bitte versuchen Sie es erneut.';
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

<div class="rounded-lg border border-slate-200 bg-white p-5">
	<p class="font-mono text-xs tracking-wide text-slate-500 uppercase">Link-Statistiken</p>

	<div class="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
		<input
			type="text"
			bind:value={inputValue}
			placeholder="Kurzcode oder URL einfügen"
			class="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:outline-none"
		/>
		<button
			type="button"
			onclick={lookupStats}
			disabled={isLoading}
			class="inline-flex shrink-0 items-center justify-center rounded-md bg-purple-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-purple-600 disabled:cursor-not-allowed disabled:bg-purple-400"
		>
			{isLoading ? 'Wird gesucht...' : 'Nachschlagen'}
		</button>
	</div>

	{#if errorMessage}
		<p role="alert" class="mt-3 text-sm text-rose-600">{errorMessage}</p>
	{/if}

	{#if stats}
		<div class="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
			<div class="grid gap-4 sm:grid-cols-2">
				<div class="space-y-1">
					<p class="text-xs text-slate-500 uppercase">Original-URL</p>
					<a
						href={stats.originalUrl}
						target="_blank"
						rel="noreferrer"
						class="font-mono text-sm break-all text-slate-900 underline decoration-slate-300 underline-offset-4 hover:text-purple-600"
					>
						{stats.originalUrl}
					</a>
				</div>

				<div class="space-y-1">
					<p class="text-xs text-slate-500 uppercase">Kurz-URL</p>
					<a
						href={displayShortUrl}
						target="_blank"
						rel="noreferrer"
						class="font-mono text-sm break-all text-slate-900 underline decoration-slate-300 underline-offset-4 hover:text-purple-600"
					>
						{displayShortUrl}
					</a>
				</div>

				<div class="space-y-1">
					<p class="text-xs text-slate-500 uppercase">Klicks</p>
					<p class="text-2xl font-semibold text-purple-600">{stats.clicks}</p>
				</div>

				<div class="space-y-1">
					<p class="text-xs text-slate-500 uppercase">Erstellt</p>
					<p class="text-sm text-slate-900">{createdAtLabel}</p>
				</div>
			</div>

			<div class="mt-4">
				<button
					type="button"
					onclick={refreshStats}
					disabled={isLoading}
					class="inline-flex items-center rounded-md border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 transition-colors duration-200 hover:border-purple-400 hover:text-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
				>
					Aktualisieren
				</button>
			</div>
		</div>
	{/if}
</div>
