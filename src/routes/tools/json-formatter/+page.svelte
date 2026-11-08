<script lang="ts">
	import ToolHeader from '$lib/components/tools/ToolHeader.svelte';
	import { useLocale } from '$lib/i18n/locale.svelte';
	import { CopyFeedback } from '$lib/utils/clipboard.svelte';
	import { highlightJson } from '$lib/utils/json-highlight';
	import { trackToolUsage } from '$lib/utils/tool-usage';

	type IndentOption = '2' | '4' | 'tab';
	type OutputMode = 'format' | 'minify';

	interface ParseError {
		message: string;
		line?: number;
		column?: number;
	}

	const de = {
		input: 'Eingabe',
		inputPlaceholder: 'JSON hier einfügen...',
		indentation: 'Einrückung',
		spaces: (count: number) => `${count} Leerzeichen`,
		tab: 'Tab',
		format: 'Formatieren',
		minify: 'Minimieren',
		validationError: 'Validierungsfehler',
		position: (line: number, column?: number) =>
			column === undefined ? `Zeile ${line}` : `Zeile ${line}, Spalte ${column}`,
		unknownError: 'Unbekannter Fehler',
		output: 'Ausgabe',
		outputEmpty: 'Formatiertes JSON erscheint hier.',
		characters: 'Zeichen',
		lines: 'Zeilen'
	};

	const en: typeof de = {
		input: 'Input',
		inputPlaceholder: 'Paste JSON here...',
		indentation: 'Indentation',
		spaces: (count: number) => `${count} spaces`,
		tab: 'Tab',
		format: 'Format',
		minify: 'Minify',
		validationError: 'Validation error',
		position: (line: number, column?: number) =>
			column === undefined ? `Line ${line}` : `Line ${line}, column ${column}`,
		unknownError: 'Unknown error',
		output: 'Output',
		outputEmpty: 'Formatted JSON appears here.',
		characters: 'Characters',
		lines: 'Lines'
	};

	const COPY = { de, en };

	const i18n = useLocale();
	const clipboard = new CopyFeedback();

	let t = $derived(COPY[i18n.current]);

	let input = $state('');
	let formattedOutput = $state('');
	let outputMode = $state<OutputMode | null>(null);
	let error = $state<ParseError | null>(null);
	let indent = $state<IndentOption>('2');
	let copyFailed = $state(false);

	let indentOptions = $derived<Array<{ value: IndentOption; label: string }>>([
		{ value: '2', label: t.spaces(2) },
		{ value: '4', label: t.spaces(4) },
		{ value: 'tab', label: t.tab }
	]);
	let highlightedOutput = $derived(formattedOutput ? highlightJson(formattedOutput) : '');
	let lineCount = $derived(formattedOutput ? formattedOutput.split('\n').length : 0);
	let charCount = $derived(formattedOutput.length);
	let hasInput = $derived(input.trim().length > 0);

	$effect(() => () => clipboard.dispose());

	/**
	 * Engines report parse errors differently:
	 * V8 "… at position 12 (line 2 column 5)", older V8 "… at position 12",
	 * Firefox "… at line 2 column 5 of the JSON data".
	 */
	function locateError(text: string, message: string): Pick<ParseError, 'line' | 'column'> {
		const lineColumn = message.match(/line (\d+) column (\d+)/i);
		if (lineColumn) {
			return { line: Number(lineColumn[1]), column: Number(lineColumn[2]) };
		}

		const position = message.match(/position (\d+)/i);
		if (position) {
			const linesBefore = text.slice(0, Number(position[1])).split('\n');
			return { line: linesBefore.length, column: (linesBefore.at(-1)?.length ?? 0) + 1 };
		}

		return {};
	}

	function render(mode: OutputMode) {
		error = null;
		formattedOutput = '';
		outputMode = null;
		copyFailed = false;
		clipboard.reset();

		if (!input.trim()) return;

		let parsed: unknown;
		try {
			parsed = JSON.parse(input);
		} catch (e) {
			const message = e instanceof Error ? e.message : t.unknownError;
			error = { message, ...locateError(input, message) };
			return;
		}

		formattedOutput =
			mode === 'minify'
				? JSON.stringify(parsed)
				: JSON.stringify(parsed, null, indent === 'tab' ? '\t' : Number(indent));
		outputMode = mode;
		trackToolUsage('json-formatter');
	}

	function selectIndent(value: IndentOption) {
		indent = value;
		if (outputMode === 'format') {
			render('format');
		}
	}

	function clearAll() {
		input = '';
		formattedOutput = '';
		outputMode = null;
		error = null;
		copyFailed = false;
		clipboard.reset();
	}

	async function copyOutput() {
		if (!formattedOutput) return;
		copyFailed = !(await clipboard.copy(formattedOutput));
	}
</script>

<section class="mx-auto w-full max-w-2xl space-y-8">
	<ToolHeader toolId="json-formatter" />

	<section class="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
		<div class="space-y-4">
			<div class="space-y-2">
				<label class="text-sm font-medium text-slate-700" for="json-input">{t.input}</label>
				<textarea
					id="json-input"
					rows="14"
					bind:value={input}
					spellcheck="false"
					class="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 font-mono text-sm text-slate-700 placeholder:text-slate-400 focus:border-purple-400/80 focus:ring-1 focus:ring-purple-400/30 focus:outline-none"
					placeholder={t.inputPlaceholder}
				></textarea>
			</div>

			<div class="space-y-2">
				<p class="text-sm font-medium text-slate-700" id="json-indent-label">{t.indentation}</p>
				<div class="flex flex-wrap gap-2" role="group" aria-labelledby="json-indent-label">
					{#each indentOptions as option (option.value)}
						<button
							type="button"
							aria-pressed={indent === option.value}
							onclick={() => selectIndent(option.value)}
							class={`rounded-lg border px-3 py-2 text-sm transition ${
								indent === option.value
									? 'border-purple-400 bg-purple-500/20 text-purple-700'
									: 'border-slate-200 bg-white text-slate-700 hover:border-purple-400 hover:text-purple-700'
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
					onclick={() => render('format')}
					disabled={!hasInput}
					class="rounded-lg bg-purple-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{t.format}
				</button>
				<button
					type="button"
					onclick={() => render('minify')}
					disabled={!hasInput}
					class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-purple-400 hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{t.minify}
				</button>
				<button
					type="button"
					onclick={clearAll}
					disabled={!hasInput}
					class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-purple-400 hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{i18n.t('clear')}
				</button>
			</div>
		</div>

		{#if error}
			<div role="alert" class="mt-4 rounded-lg border border-rose-500/30 bg-rose-50 p-4">
				<p class="text-sm font-medium text-rose-700">{t.validationError}</p>
				<p class="mt-1 font-mono text-sm break-words text-rose-700">{error.message}</p>
				{#if error.line}
					<p class="mt-1 text-sm text-rose-600">{t.position(error.line, error.column)}</p>
				{/if}
			</div>
		{/if}
	</section>

	<section class="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
		<div class="space-y-4">
			<h2 class="text-xs tracking-[0.16em] text-slate-500 uppercase">{t.output}</h2>

			<div class="max-h-[30rem] overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-4">
				{#if formattedOutput}
					<!-- eslint-disable svelte/no-at-html-tags -- highlightJson HTML-escapes all text -->
					<pre class="font-mono text-sm leading-6 text-slate-700"><code
							>{@html highlightedOutput}</code
						></pre>
					<!-- eslint-enable svelte/no-at-html-tags -->
				{:else}
					<p class="font-mono text-sm text-slate-500">{t.outputEmpty}</p>
				{/if}
			</div>

			<div class="flex flex-wrap items-center gap-3">
				<button
					type="button"
					onclick={copyOutput}
					disabled={!formattedOutput}
					class="inline-flex items-center rounded-lg bg-purple-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{clipboard.isCopied() ? i18n.t('copied') : i18n.t('copy')}
				</button>

				{#if formattedOutput}
					<span
						class="rounded-full border border-slate-200 bg-white px-2.5 py-1 font-mono text-xs text-slate-600"
					>
						{t.characters}: {charCount}
					</span>
					<span
						class="rounded-full border border-slate-200 bg-white px-2.5 py-1 font-mono text-xs text-slate-600"
					>
						{t.lines}: {lineCount}
					</span>
				{/if}
			</div>

			{#if copyFailed}
				<p role="alert" class="text-sm text-rose-600">{i18n.t('clipboardFailed')}</p>
			{/if}
		</div>
	</section>
</section>
