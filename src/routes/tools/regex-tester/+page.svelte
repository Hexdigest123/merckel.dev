<script lang="ts">
	import { browser } from '$app/environment';

	let { data }: { data: { title: string } } = $props();

	let pattern = $state('');
	let testString = $state('');
	let flags = $state<Record<string, boolean>>({
		g: true,
		i: false,
		m: false,
		s: false,
		u: false,
		y: false
	});
	let isCopiedPattern = $state(false);
	let isCopiedMatches = $state(false);
	let hasInitializedTracking = false;

	let flagString = $derived(
		Object.entries(flags)
			.filter(([, v]) => v)
			.map(([k]) => k)
			.join('')
	);

	let regexError = $derived.by(() => {
		if (!pattern) return '';
		try {
			new RegExp(pattern, flagString);
			return '';
		} catch (e) {
			return e instanceof Error ? e.message : 'Ungültiger Ausdruck';
		}
	});

	let regex = $derived.by(() => {
		if (!pattern || regexError) return null;
		try {
			return new RegExp(pattern, flagString);
		} catch {
			return null;
		}
	});

	let matches = $derived.by(() => {
		if (!regex || !testString) return [];
		try {
			if (flags.g) {
				return [...testString.matchAll(regex)];
			} else {
				const m = testString.match(regex);
				return m ? [m] : [];
			}
		} catch {
			return [];
		}
	});

	let highlightedText = $derived.by(() => {
		if (!testString) return '';
		if (!regex || matches.length === 0) return escapeHtml(testString);

		let result = '';
		let lastIndex = 0;

		for (const match of matches) {
			if (match.index === undefined) continue;

			result += escapeHtml(testString.slice(lastIndex, match.index));

			const matchText = match[0];
			result += `<mark class="rounded bg-purple-500/30 px-0.5 text-purple-200">${escapeHtml(matchText)}</mark>`;

			lastIndex = match.index + matchText.length;
		}

		result += escapeHtml(testString.slice(lastIndex));

		return result;
	});

	$effect(() => {
		if (!browser || !pattern || !testString) return;

		if (!hasInitializedTracking) {
			hasInitializedTracking = true;
			return;
		}

		const timeout = setTimeout(() => {
			fetch('/api/tools/usage', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ toolId: 'regex-tester' })
			}).catch(() => undefined);
		}, 2000);

		return () => clearTimeout(timeout);
	});

	function escapeHtml(text: string) {
		return text
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;');
	}

	async function copyPattern() {
		if (!browser || !pattern) return;
		await navigator.clipboard.writeText(`/${pattern}/${flagString}`);
		isCopiedPattern = true;
		setTimeout(() => {
			isCopiedPattern = false;
		}, 1800);
	}

	async function copyMatches() {
		if (!browser || matches.length === 0) return;
		const text = matches.map((m) => m[0]).join('\n');
		await navigator.clipboard.writeText(text);
		isCopiedMatches = true;
		setTimeout(() => {
			isCopiedMatches = false;
		}, 1800);
	}

	function setPreset(p: string, t: string) {
		pattern = p;
		testString = t;
		flags = { ...flags, g: true };
	}

	const presets = [
		{
			name: 'E-Mail',
			pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
			test: 'kontakt@beispiel.de und info@test.com'
		},
		{
			name: 'URL',
			pattern: 'https?://[^\\s/$.?#].[^\\s]*',
			test: 'Besuche https://beispiel.de oder http://test.com/pfad'
		},
		{
			name: 'IPv4',
			pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b',
			test: 'Server: 192.168.1.1 und 10.0.0.255'
		},
		{
			name: 'Telefon',
			pattern: '\\+?\\d[\\d\\s\\-\\/]{6,}\\d',
			test: 'Ruf an: +49 170 1234567 oder 030/12345678'
		},
		{
			name: 'Datum',
			pattern: '\\b\\d{2}\\.\\d{2}\\.\\d{4}\\b',
			test: 'Geburtsdatum: 15.03.1990, Ablauf: 31.12.2025'
		},
		{
			name: 'HEX-Farbe',
			pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b',
			test: 'Farben: #8b5cf6, #fff, #1a2b3c'
		},
		{
			name: 'HTML-Tag',
			pattern: '<\\/?[a-z][a-z0-9]*[^>]*>',
			test: 'Code: <div class="box"><p>Hallo</p></div>'
		},
		{
			name: 'Leerzeichen trimmen',
			pattern: '^\\s+|\\s+$',
			test: '   Text mit Leerzeichen am Rand   '
		}
	];
</script>

<section class="mx-auto w-full max-w-2xl space-y-8">
	<header class="space-y-3">
		<h1 class="font-sans text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl">
			{data.title}
		</h1>
		<p class="text-slate-400">
			Reguläre Ausdrücke live testen mit Echtzeit-Hervorhebung und Muster-Bibliothek.
		</p>
	</header>

	<section class="rounded-2xl border border-slate-700 bg-slate-900/60 p-5 sm:p-6">
		<div class="space-y-6">
			<div class="space-y-4">
				<div class="flex flex-col gap-4 sm:flex-row sm:items-start">
					<div class="flex-1 space-y-2">
						<label for="pattern" class="text-sm font-medium text-slate-300">Muster</label>
						<div class="flex items-center gap-0">
							<span
								class="flex h-10 items-center rounded-l-lg border border-r-0 border-slate-700 bg-slate-900/60 pr-1 pl-3 font-mono text-sm text-slate-500 select-none"
								>/</span
							>
							<input
								id="pattern"
								type="text"
								bind:value={pattern}
								placeholder="z.B. \d{3}-\d{4}"
								class="h-10 min-w-0 flex-1 border-y border-slate-700 bg-slate-900/60 px-2 font-mono text-sm text-slate-200 placeholder:text-slate-500 focus:border-purple-400/80 focus:ring-1 focus:ring-purple-400/30 focus:outline-none"
							/>
							<span
								class="flex h-10 items-center rounded-r-lg border border-l-0 border-slate-700 bg-slate-900/60 pr-3 pl-1 font-mono text-sm text-slate-500 select-none"
								>/{flagString}</span
							>
						</div>
					</div>

					<div class="space-y-2">
						<span class="text-sm font-medium text-slate-300">Flags</span>
						<div class="flex flex-wrap gap-1">
							{#each Object.keys(flags) as flag}
								<button
									type="button"
									onclick={() =>
										(flags[flag as keyof typeof flags] = !flags[flag as keyof typeof flags])}
									class="h-10 w-8 rounded-lg border font-mono text-xs font-medium transition-colors {flags[
										flag as keyof typeof flags
									]
										? 'border-purple-400 bg-purple-500/20 text-purple-200'
										: 'border-slate-700 bg-slate-900/60 text-slate-200 hover:border-purple-400 hover:text-purple-200'}"
									title={flag}
								>
									{flag}
								</button>
							{/each}
						</div>
					</div>
				</div>

				{#if regexError}
					<p
						class="rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200"
					>
						{regexError}
					</p>
				{/if}
			</div>

			<div class="space-y-2">
				<label for="testString" class="text-sm font-medium text-slate-300">Testtext</label>
				<textarea
					id="testString"
					bind:value={testString}
					rows="6"
					placeholder="Testtext hier eingeben..."
					class="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-2.5 font-mono text-sm text-slate-200 placeholder:text-slate-500 focus:border-purple-400/80 focus:ring-1 focus:ring-purple-400/30 focus:outline-none"
				></textarea>
			</div>

			<div class="space-y-2">
				<div class="flex items-center justify-between">
					<span class="text-sm font-medium text-slate-300">Ergebnis</span>
					{#if matches.length > 0}
						<span
							class="rounded-full border border-purple-400/45 bg-purple-500/15 px-2.5 py-1 font-mono text-xs text-purple-200"
						>
							{matches.length} Treffer
						</span>
					{/if}
				</div>

				<div
					class="relative min-h-[10rem] w-full overflow-hidden rounded-lg border border-slate-700/80 bg-slate-950/70"
				>
					<div
						class="absolute inset-0 overflow-auto p-4 font-mono text-sm whitespace-pre-wrap text-slate-400"
					>
						{#if !testString}
							<span class="text-slate-600 italic"
								>Muster eingeben und Testtext hinzufügen, um Ergebnisse zu sehen.</span
							>
						{:else}
							{@html highlightedText}
						{/if}
					</div>
				</div>
			</div>

			{#if matches.length > 0}
				<div class="space-y-2">
					<span class="text-sm font-medium text-slate-300">Details</span>
					<div
						class="max-h-[20rem] space-y-2 overflow-y-auto rounded-lg border border-slate-700 bg-slate-900/30 p-2"
					>
						{#each matches as match, i}
							<div class="rounded border border-slate-700/50 bg-slate-900/50 p-3 text-sm">
								<div class="flex items-start justify-between gap-4">
									<div class="font-mono text-purple-200">
										<span class="mr-2 text-slate-500 select-none">#{i + 1}</span>
										{match[0]}
									</div>
									<span class="shrink-0 font-mono text-xs text-slate-500">Index: {match.index}</span
									>
								</div>
								{#if match.length > 1}
									<div class="mt-2 space-y-1 border-t border-slate-700/50 pt-2">
										<span class="text-xs font-medium text-slate-400">Gruppen:</span>
										{#each Array.from(match).slice(1) as group, groupIndex}
											<div class="flex gap-2 font-mono text-xs">
												<span class="w-6 shrink-0 text-slate-500">${groupIndex + 1}</span>
												<span class="text-slate-300">{group || '<undefined>'}</span>
											</div>
										{/each}
										{#if match.groups}
											{#each Object.entries(match.groups) as [name, content]}
												<div class="flex gap-2 font-mono text-xs">
													<span class="shrink-0 text-slate-500">?&lt;{name}&gt;</span>
													<span class="text-slate-300">{content || '<undefined>'}</span>
												</div>
											{/each}
										{/if}
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<div class="flex flex-wrap gap-3 pt-2">
				<button
					type="button"
					onclick={copyPattern}
					disabled={!pattern}
					class="rounded-lg bg-purple-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{isCopiedPattern ? 'Kopiert' : 'Muster kopieren'}
				</button>
				<button
					type="button"
					onclick={copyMatches}
					disabled={matches.length === 0}
					class="rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-purple-400 hover:text-purple-200 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{isCopiedMatches ? 'Kopiert' : 'Treffer kopieren'}
				</button>
				<button
					type="button"
					onclick={() => {
						pattern = '';
						testString = '';
					}}
					class="ml-auto rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-400 transition hover:border-rose-500/50 hover:text-rose-400"
				>
					Löschen
				</button>
			</div>
		</div>
	</section>

	<section class="space-y-4">
		<h2 class="text-xs font-bold tracking-wider text-slate-500 uppercase">Muster-Bibliothek</h2>
		<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
			{#each presets as preset}
				<button
					onclick={() => setPreset(preset.pattern, preset.test)}
					class="flex flex-col items-start gap-1 rounded-lg border border-slate-700 bg-slate-900/60 p-3 text-left transition hover:border-purple-400/50 hover:bg-slate-900/80"
				>
					<span class="text-sm font-medium text-slate-200">{preset.name}</span>
					<code class="w-full truncate font-mono text-xs text-slate-500">{preset.pattern}</code>
				</button>
			{/each}
		</div>
	</section>
</section>
