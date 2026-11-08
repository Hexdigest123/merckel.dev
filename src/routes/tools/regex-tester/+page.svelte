<script lang="ts">
	import ToolHeader from '$lib/components/tools/ToolHeader.svelte';
	import { useLocale } from '$lib/i18n/locale.svelte';
	import { CopyFeedback } from '$lib/utils/clipboard.svelte';
	import { trackToolUsage } from '$lib/utils/tool-usage';

	type Flag = 'g' | 'i' | 'm' | 's' | 'u' | 'y';
	type PresetId = 'email' | 'url' | 'ipv4' | 'phone' | 'date' | 'hex' | 'html' | 'trim';

	/** Upper bound for collected matches, keeps huge inputs (e.g. `.` on a novel) responsive. */
	const MAX_MATCHES = 1000;
	/** Only the first matches get a detail card. */
	const MAX_DETAILS = 100;

	const FLAGS: Flag[] = ['g', 'i', 'm', 's', 'u', 'y'];

	const PRESET_PATTERNS: Array<{ id: PresetId; pattern: string }> = [
		{ id: 'email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' },
		{ id: 'url', pattern: 'https?://[^\\s/$.?#].[^\\s]*' },
		{ id: 'ipv4', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b' },
		{ id: 'phone', pattern: '\\+?\\d[\\d\\s\\-\\/]{6,}\\d' },
		{ id: 'date', pattern: '\\b\\d{2}\\.\\d{2}\\.\\d{4}\\b' },
		{ id: 'hex', pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b' },
		{ id: 'html', pattern: '<\\/?[a-z][a-z0-9]*[^>]*>' },
		{ id: 'trim', pattern: '^\\s+|\\s+$' }
	];

	const de = {
		pattern: 'Muster',
		patternPlaceholder: 'z. B. \\d{3}-\\d{4}',
		flags: 'Flags',
		flagDescriptions: {
			g: 'global – alle Treffer finden',
			i: 'ignoreCase – Groß-/Kleinschreibung ignorieren',
			m: 'multiline – ^ und $ gelten pro Zeile',
			s: 'dotAll – . passt auch auf Zeilenumbrüche',
			u: 'unicode – Unicode-Modus',
			y: 'sticky – nur ab lastIndex suchen'
		} satisfies Record<Flag, string>,
		invalidExpression: 'Ungültiger Ausdruck',
		testString: 'Testtext',
		testPlaceholder: 'Testtext hier eingeben...',
		result: 'Ergebnis',
		matchCount: (count: number, capped: boolean) => `${count}${capped ? '+' : ''} Treffer`,
		resultEmpty: 'Muster eingeben und Testtext hinzufügen, um Ergebnisse zu sehen.',
		details: 'Details',
		index: 'Index',
		groups: 'Gruppen:',
		moreMatches: (count: number) => `… und ${count} weitere Treffer`,
		copyPattern: 'Muster kopieren',
		copyMatches: 'Treffer kopieren',
		library: 'Muster-Bibliothek',
		presets: {
			email: { name: 'E-Mail', test: 'kontakt@beispiel.de und info@test.com' },
			url: { name: 'URL', test: 'Besuche https://beispiel.de oder http://test.com/pfad' },
			ipv4: { name: 'IPv4', test: 'Server: 192.168.1.1 und 10.0.0.255' },
			phone: { name: 'Telefon', test: 'Ruf an: +49 170 1234567 oder 030/12345678' },
			date: { name: 'Datum', test: 'Geburtsdatum: 15.03.1990, Ablauf: 31.12.2025' },
			hex: { name: 'HEX-Farbe', test: 'Farben: #8b5cf6, #fff, #1a2b3c' },
			html: { name: 'HTML-Tag', test: 'Code: <div class="box"><p>Hallo</p></div>' },
			trim: { name: 'Leerzeichen trimmen', test: '   Text mit Leerzeichen am Rand   ' }
		} satisfies Record<PresetId, { name: string; test: string }>
	};

	const en: typeof de = {
		pattern: 'Pattern',
		patternPlaceholder: 'e.g. \\d{3}-\\d{4}',
		flags: 'Flags',
		flagDescriptions: {
			g: 'global – find all matches',
			i: 'ignoreCase – case-insensitive matching',
			m: 'multiline – ^ and $ match at line boundaries',
			s: 'dotAll – . also matches line breaks',
			u: 'unicode – Unicode mode',
			y: 'sticky – only match from lastIndex'
		},
		invalidExpression: 'Invalid expression',
		testString: 'Test string',
		testPlaceholder: 'Enter test text here...',
		result: 'Result',
		matchCount: (count: number, capped: boolean) =>
			`${count}${capped ? '+' : ''} ${count === 1 && !capped ? 'match' : 'matches'}`,
		resultEmpty: 'Enter a pattern and some test text to see results.',
		details: 'Details',
		index: 'Index',
		groups: 'Groups:',
		moreMatches: (count: number) => `… and ${count} more matches`,
		copyPattern: 'Copy pattern',
		copyMatches: 'Copy matches',
		library: 'Pattern library',
		presets: {
			email: { name: 'Email', test: 'contact@example.com and info@test.com' },
			url: { name: 'URL', test: 'Visit https://example.com or http://test.com/path' },
			ipv4: { name: 'IPv4', test: 'Servers: 192.168.1.1 and 10.0.0.255' },
			phone: { name: 'Phone', test: 'Call +49 170 1234567 or 030/12345678' },
			date: { name: 'Date', test: 'Born: 15.03.1990, expires: 31.12.2025' },
			hex: { name: 'Hex color', test: 'Colors: #8b5cf6, #fff, #1a2b3c' },
			html: { name: 'HTML tag', test: 'Code: <div class="box"><p>Hello</p></div>' },
			trim: { name: 'Trim whitespace', test: '   Text with surrounding spaces   ' }
		}
	};

	const COPY = { de, en };

	const i18n = useLocale();
	const clipboard = new CopyFeedback();

	let t = $derived(COPY[i18n.current]);

	let pattern = $state('');
	let testString = $state('');
	let flags = $state<Record<Flag, boolean>>({
		g: true,
		i: false,
		m: false,
		s: false,
		u: false,
		y: false
	});
	let copyFailed = $state(false);

	let flagString = $derived(FLAGS.filter((flag) => flags[flag]).join(''));

	let compiled = $derived.by((): { regex: RegExp | null; error: string } => {
		if (!pattern) return { regex: null, error: '' };
		try {
			return { regex: new RegExp(pattern, flagString), error: '' };
		} catch (e) {
			return { regex: null, error: e instanceof Error ? e.message : t.invalidExpression };
		}
	});

	let matchResult = $derived.by((): { matches: RegExpMatchArray[]; capped: boolean } => {
		const { regex } = compiled;
		if (!regex || !testString) return { matches: [], capped: false };

		if (!regex.global) {
			const match = testString.match(regex);
			return { matches: match ? [match] : [], capped: false };
		}

		const matches: RegExpMatchArray[] = [];
		for (const match of testString.matchAll(regex)) {
			if (matches.length === MAX_MATCHES) {
				return { matches, capped: true };
			}
			matches.push(match);
		}
		return { matches, capped: false };
	});

	let matches = $derived(matchResult.matches);
	let detailMatches = $derived(matches.slice(0, MAX_DETAILS));

	let highlightedText = $derived.by(() => {
		if (!testString) return '';
		if (matches.length === 0) return escapeHtml(testString);

		let result = '';
		let lastIndex = 0;

		for (const match of matches) {
			// Zero-length matches have nothing to highlight.
			if (match.index === undefined || match[0].length === 0) continue;

			result += escapeHtml(testString.slice(lastIndex, match.index));
			result += `<mark class="rounded bg-purple-500/25 px-0.5 text-purple-900">${escapeHtml(match[0])}</mark>`;
			lastIndex = match.index + match[0].length;
		}

		return result + escapeHtml(testString.slice(lastIndex));
	});

	$effect(() => () => clipboard.dispose());

	$effect(() => {
		if (compiled.regex && testString) {
			trackToolUsage('regex-tester');
		}
	});

	function escapeHtml(text: string) {
		return text
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;');
	}

	function formatGroup(group: string | undefined): string {
		if (group === undefined) return '—';
		return group === '' ? '""' : group;
	}

	async function copy(text: string, key: string) {
		copyFailed = !(await clipboard.copy(text, key));
	}

	function applyPreset(id: PresetId, presetPattern: string) {
		pattern = presetPattern;
		testString = t.presets[id].test;
		flags.g = true;
	}

	function clearAll() {
		pattern = '';
		testString = '';
		copyFailed = false;
		clipboard.reset();
	}
</script>

<section class="mx-auto w-full max-w-2xl space-y-8">
	<ToolHeader toolId="regex-tester" />

	<section class="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
		<div class="space-y-6">
			<div class="space-y-4">
				<div class="flex flex-col gap-4 sm:flex-row sm:items-start">
					<div class="flex-1 space-y-2">
						<label for="pattern" class="text-sm font-medium text-slate-600">{t.pattern}</label>
						<div class="flex items-center gap-0">
							<span
								class="flex h-10 items-center rounded-l-lg border border-r-0 border-slate-200 bg-white pr-1 pl-3 font-mono text-sm text-slate-500 select-none"
								aria-hidden="true">/</span
							>
							<input
								id="pattern"
								type="text"
								bind:value={pattern}
								placeholder={t.patternPlaceholder}
								autocomplete="off"
								spellcheck="false"
								aria-invalid={compiled.error ? 'true' : undefined}
								aria-describedby={compiled.error ? 'pattern-error' : undefined}
								class="h-10 min-w-0 flex-1 border-y border-slate-200 bg-white px-2 font-mono text-sm text-slate-700 placeholder:text-slate-400 focus:border-purple-400/80 focus:ring-1 focus:ring-purple-400/30 focus:outline-none"
							/>
							<span
								class="flex h-10 items-center rounded-r-lg border border-l-0 border-slate-200 bg-white pr-3 pl-1 font-mono text-sm text-slate-500 select-none"
								aria-hidden="true">/{flagString}</span
							>
						</div>
					</div>

					<div class="space-y-2">
						<span class="text-sm font-medium text-slate-600" id="regex-flags-label">{t.flags}</span>
						<div class="flex flex-wrap gap-1" role="group" aria-labelledby="regex-flags-label">
							{#each FLAGS as flag (flag)}
								<button
									type="button"
									onclick={() => (flags[flag] = !flags[flag])}
									aria-pressed={flags[flag]}
									aria-label={t.flagDescriptions[flag]}
									title={t.flagDescriptions[flag]}
									class="h-10 w-8 rounded-lg border font-mono text-xs font-medium transition-colors {flags[
										flag
									]
										? 'border-purple-400 bg-purple-500/20 text-purple-700'
										: 'border-slate-200 bg-white text-slate-700 hover:border-purple-400 hover:text-purple-700'}"
								>
									{flag}
								</button>
							{/each}
						</div>
					</div>
				</div>

				{#if compiled.error}
					<p
						id="pattern-error"
						role="alert"
						class="rounded-lg border border-amber-400/60 bg-amber-50 px-3 py-2 text-sm text-amber-800"
					>
						{compiled.error}
					</p>
				{/if}
			</div>

			<div class="space-y-2">
				<label for="testString" class="text-sm font-medium text-slate-600">{t.testString}</label>
				<textarea
					id="testString"
					bind:value={testString}
					rows="6"
					placeholder={t.testPlaceholder}
					spellcheck="false"
					class="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 font-mono text-sm text-slate-700 placeholder:text-slate-400 focus:border-purple-400/80 focus:ring-1 focus:ring-purple-400/30 focus:outline-none"
				></textarea>
			</div>

			<div class="space-y-2">
				<div class="flex items-center justify-between">
					<span class="text-sm font-medium text-slate-600">{t.result}</span>
					{#if matches.length > 0}
						<span
							class="rounded-full border border-purple-400/45 bg-purple-500/15 px-2.5 py-1 font-mono text-xs text-purple-700"
							role="status"
						>
							{t.matchCount(matches.length, matchResult.capped)}
						</span>
					{/if}
				</div>

				<div
					class="relative min-h-[10rem] w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
				>
					<div
						class="absolute inset-0 overflow-auto p-4 font-mono text-sm whitespace-pre-wrap text-slate-700"
					>
						{#if !testString}
							<span class="text-slate-500 italic">{t.resultEmpty}</span>
						{:else}
							<!-- eslint-disable-next-line svelte/no-at-html-tags -- all text is HTML-escaped -->
							{@html highlightedText}
						{/if}
					</div>
				</div>
			</div>

			{#if detailMatches.length > 0}
				<div class="space-y-2">
					<span class="text-sm font-medium text-slate-600">{t.details}</span>
					<div
						class="max-h-[20rem] space-y-2 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-2"
					>
						{#each detailMatches as match, matchIndex (matchIndex)}
							<div class="rounded border border-slate-200 bg-white p-3 text-sm">
								<div class="flex items-start justify-between gap-4">
									<div class="min-w-0 font-mono break-all text-purple-700">
										<span class="mr-2 text-slate-500 select-none">#{matchIndex + 1}</span>
										{match[0]}
									</div>
									<span class="shrink-0 font-mono text-xs text-slate-500"
										>{t.index}: {match.index}</span
									>
								</div>
								{#if match.length > 1}
									<div class="mt-2 space-y-1 border-t border-slate-200 pt-2">
										<span class="text-xs font-medium text-slate-500">{t.groups}</span>
										{#each Array.from(match).slice(1) as group, groupIndex (groupIndex)}
											<div class="flex gap-2 font-mono text-xs">
												<span class="w-6 shrink-0 text-slate-500">${groupIndex + 1}</span>
												<span class="break-all text-slate-700">{formatGroup(group)}</span>
											</div>
										{/each}
										{#if match.groups}
											{#each Object.entries(match.groups) as [name, content] (name)}
												<div class="flex gap-2 font-mono text-xs">
													<span class="shrink-0 text-slate-500">?&lt;{name}&gt;</span>
													<span class="break-all text-slate-700">{formatGroup(content)}</span>
												</div>
											{/each}
										{/if}
									</div>
								{/if}
							</div>
						{/each}
						{#if matches.length > detailMatches.length}
							<p class="px-1 py-2 text-xs text-slate-500">
								{t.moreMatches(matches.length - detailMatches.length)}
							</p>
						{/if}
					</div>
				</div>
			{/if}

			<div class="flex flex-wrap gap-3 pt-2">
				<button
					type="button"
					onclick={() => copy(`/${pattern}/${flagString}`, 'pattern')}
					disabled={!pattern}
					class="rounded-lg bg-purple-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{clipboard.isCopied('pattern') ? i18n.t('copied') : t.copyPattern}
				</button>
				<button
					type="button"
					onclick={() => copy(matches.map((match) => match[0]).join('\n'), 'matches')}
					disabled={matches.length === 0}
					class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-purple-400 hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{clipboard.isCopied('matches') ? i18n.t('copied') : t.copyMatches}
				</button>
				<button
					type="button"
					onclick={clearAll}
					class="ml-auto rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-rose-500/50 hover:text-rose-600"
				>
					{i18n.t('clear')}
				</button>
			</div>

			{#if copyFailed}
				<p role="alert" class="text-sm text-rose-600">{i18n.t('clipboardFailed')}</p>
			{/if}
		</div>
	</section>

	<section class="space-y-4">
		<h2 class="text-xs font-bold tracking-wider text-slate-500 uppercase">{t.library}</h2>
		<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
			{#each PRESET_PATTERNS as preset (preset.id)}
				<button
					type="button"
					onclick={() => applyPreset(preset.id, preset.pattern)}
					class="flex flex-col items-start gap-1 rounded-lg border border-slate-200 bg-white p-3 text-left transition hover:border-purple-400/50 hover:bg-slate-50"
				>
					<span class="text-sm font-medium text-slate-700">{t.presets[preset.id].name}</span>
					<code class="w-full truncate font-mono text-xs text-slate-500">{preset.pattern}</code>
				</button>
			{/each}
		</div>
	</section>
</section>
