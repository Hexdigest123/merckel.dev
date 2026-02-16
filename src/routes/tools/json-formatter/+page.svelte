<script lang="ts">
	import { browser } from '$app/environment';

	type IndentOption = '2' | '4' | 'tab';

	interface ParseError {
		message: string;
		line?: number;
		position?: number;
	}

	const INDENT_OPTIONS: Array<{ value: IndentOption; label: string }> = [
		{ value: '2', label: '2 Leerzeichen' },
		{ value: '4', label: '4 Leerzeichen' },
		{ value: 'tab', label: 'Tab' }
	];

	let input = $state('');
	let formattedOutput = $state('');
	let error = $state<ParseError | null>(null);
	let indent = $state<IndentOption>('2');
	let isCopied = $state(false);
	let hasTrackedUsage = $state(false);

	let highlightedOutput = $derived(formattedOutput ? highlightJson(formattedOutput) : '');
	let lineCount = $derived(formattedOutput ? formattedOutput.split('\n').length : 0);
	let charCount = $derived(formattedOutput.length);
	let hasInput = $derived(input.trim().length > 0);

	function extractParseError(err: unknown): ParseError {
		if (!(err instanceof SyntaxError)) {
			return { message: 'Unbekannter Fehler' };
		}

		const match = err.message.match(/position\s+(\d+)/i);
		const position = match ? Number(match[1]) : undefined;
		return { message: err.message, position };
	}

	function getLineFromPosition(text: string, position: number): number {
		return text.slice(0, position).split('\n').length;
	}

	function highlightJson(json: string): string {
		const escaped = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

		const tokens: string[] = [];
		let remaining = escaped;

		// Tokenize: extract quoted strings first, then process the rest
		const stringPattern = /&quot;((?:\\.|[^&]|&(?!quot;))*)&quot;/g;
		// Since we escaped, " became &quot; — but actually JSON.stringify output has literal "
		// Re-check: the escaped string has &lt; &gt; &amp; but " stays as " since we didn't escape it
		// So the original regex approach should work — the real issue is chained replacements

		// Process keys first (quoted string followed by colon)
		let result = escaped.replace(/"((?:\\.|[^"\\])*)"\s*:/g, '\x00KEY_START\x00$1\x00KEY_END\x00:');

		// Process string values (remaining quoted strings not already replaced)
		result = result.replace(/"((?:\\.|[^"\\])*)"/g, '\x00STR_START\x00$1\x00STR_END\x00');

		// Process numbers
		result = result.replace(
			/\b(-?\d+\.?\d*(?:[eE][+-]?\d+)?)\b/g,
			'\x00NUM_START\x00$1\x00NUM_END\x00'
		);

		// Process booleans
		result = result.replace(/\b(true|false)\b/g, '\x00BOOL_START\x00$1\x00BOOL_END\x00');

		// Process null
		result = result.replace(/\bnull\b/g, '\x00NULL_START\x00null\x00NULL_END\x00');

		// Replace placeholders with actual HTML spans
		return result
			.replace(/\x00KEY_START\x00/g, '<span class="text-purple-300">"')
			.replace(/\x00KEY_END\x00/g, '"</span>')
			.replace(/\x00STR_START\x00/g, '<span class="text-emerald-300">"')
			.replace(/\x00STR_END\x00/g, '"</span>')
			.replace(/\x00NUM_START\x00/g, '<span class="text-blue-300">')
			.replace(/\x00NUM_END\x00/g, '</span>')
			.replace(/\x00BOOL_START\x00/g, '<span class="text-amber-300">')
			.replace(/\x00BOOL_END\x00/g, '</span>')
			.replace(/\x00NULL_START\x00/g, '<span class="text-slate-500">')
			.replace(/\x00NULL_END\x00/g, '</span>');
	}

	function formatJson() {
		error = null;
		formattedOutput = '';

		if (!input.trim()) return;

		try {
			const parsed = JSON.parse(input);
			const indentValue = indent === 'tab' ? '\t' : Number(indent);
			formattedOutput = JSON.stringify(parsed, null, indentValue);
		} catch (e) {
			const errInfo = extractParseError(e);
			if (errInfo.position !== undefined) {
				errInfo.line = getLineFromPosition(input, errInfo.position);
			}
			error = errInfo;
		}
	}

	function minifyJson() {
		error = null;
		formattedOutput = '';

		if (!input.trim()) return;

		try {
			formattedOutput = JSON.stringify(JSON.parse(input));
		} catch (e) {
			const errInfo = extractParseError(e);
			if (errInfo.position !== undefined) {
				errInfo.line = getLineFromPosition(input, errInfo.position);
			}
			error = errInfo;
		}
	}

	function clearAll() {
		input = '';
		formattedOutput = '';
		error = null;
		isCopied = false;
	}

	async function copyOutput() {
		if (!browser || !formattedOutput) return;

		await navigator.clipboard.writeText(formattedOutput);
		isCopied = true;
		setTimeout(() => {
			isCopied = false;
		}, 1800);
	}

	$effect(() => {
		if (hasTrackedUsage || !formattedOutput) return;

		hasTrackedUsage = true;

		if (!browser) return;

		void fetch('/api/tools/usage', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ toolId: 'json-formatter' })
		}).catch(() => undefined);
	});
</script>

<section class="mx-auto w-full max-w-2xl space-y-8">
	<header class="space-y-3">
		<h1 class="font-sans text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl">
			JSON Formatter & Validator
		</h1>
		<p class="text-slate-400">JSON formatieren, validieren und mit Syntaxhervorhebung anzeigen.</p>
	</header>

	<section class="rounded-2xl border border-slate-700 bg-slate-900/60 p-5 sm:p-6">
		<div class="space-y-4">
			<div class="space-y-2">
				<label class="text-sm font-medium text-slate-200" for="json-input">Eingabe</label>
				<textarea
					id="json-input"
					rows="14"
					bind:value={input}
					class="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-3 font-mono text-sm text-slate-200 placeholder:text-slate-500 focus:border-purple-400/80 focus:ring-1 focus:ring-purple-400/30 focus:outline-none"
					placeholder="JSON hier einfügen..."
				></textarea>
			</div>

			<div class="space-y-2">
				<p class="text-sm font-medium text-slate-200">Einrückung</p>
				<div class="flex flex-wrap gap-2">
					{#each INDENT_OPTIONS as option (option.value)}
						<button
							type="button"
							onclick={() => (indent = option.value)}
							class={`rounded-lg border px-3 py-2 text-sm transition ${
								indent === option.value
									? 'border-purple-400 bg-purple-500/20 text-purple-200'
									: 'border-slate-700 bg-slate-900/60 text-slate-200 hover:border-purple-400 hover:text-purple-200'
							}`}
						>
							{option.label}
						</button>
					{/each}
				</div>
			</div>

			<div class="flex flex-wrap items-center gap-2">
				<button
					type="button"
					onclick={formatJson}
					disabled={!hasInput}
					class="rounded-lg bg-purple-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
				>
					Formatieren
				</button>
				<button
					type="button"
					onclick={minifyJson}
					disabled={!hasInput}
					class="rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-purple-400 hover:text-purple-200 disabled:cursor-not-allowed disabled:opacity-50"
				>
					Minimieren
				</button>
				<button
					type="button"
					onclick={clearAll}
					disabled={!hasInput}
					class="rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-purple-400 hover:text-purple-200 disabled:cursor-not-allowed disabled:opacity-50"
				>
					Löschen
				</button>
			</div>
		</div>

		{#if error}
			<div role="alert" class="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-4">
				<p class="text-sm font-medium text-rose-300">Validierungsfehler</p>
				<p class="mt-1 font-mono text-sm text-rose-200">{error.message}</p>
				{#if error.line}
					<p class="mt-1 text-sm text-rose-300/70">Zeile {error.line}</p>
				{/if}
			</div>
		{/if}
	</section>

	<section class="rounded-2xl border border-slate-700 bg-slate-900/60 p-5 sm:p-6">
		<div class="space-y-4">
			<p class="text-xs tracking-[0.16em] text-slate-400 uppercase">Ausgabe</p>

			<div
				class="max-h-[30rem] overflow-auto rounded-lg border border-slate-700/80 bg-slate-950/70 p-4"
			>
				{#if formattedOutput}
					<pre class="font-mono text-sm leading-6 text-slate-200"><code
							>{@html highlightedOutput}</code
						></pre>
				{:else}
					<p class="font-mono text-sm text-slate-400">Formatiertes JSON erscheint hier.</p>
				{/if}
			</div>

			<div class="flex flex-wrap items-center gap-3">
				<button
					type="button"
					onclick={copyOutput}
					disabled={!formattedOutput}
					class="inline-flex items-center rounded-lg bg-purple-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{isCopied ? 'Kopiert' : 'Kopieren'}
				</button>

				{#if formattedOutput}
					<span
						class="rounded-full border border-slate-700 bg-slate-900/60 px-2.5 py-1 font-mono text-xs text-slate-300"
					>
						Zeichen: {charCount}
					</span>
					<span
						class="rounded-full border border-slate-700 bg-slate-900/60 px-2.5 py-1 font-mono text-xs text-slate-300"
					>
						Zeilen: {lineCount}
					</span>
				{/if}
			</div>
		</div>
	</section>
</section>
