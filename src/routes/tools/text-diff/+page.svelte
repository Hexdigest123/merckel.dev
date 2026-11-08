<script lang="ts">
	import ToolHeader from '$lib/components/tools/ToolHeader.svelte';
	import { useLocale } from '$lib/i18n/locale.svelte';
	import { CopyFeedback } from '$lib/utils/clipboard.svelte';
	import { computeTextDiff, formatTextDiff } from '$lib/utils/text-diff';
	import { trackToolUsage } from '$lib/utils/tool-usage';

	const de = {
		original: 'Original',
		modified: 'Geändert',
		originalPlaceholder: 'Originaltext einfügen...',
		modifiedPlaceholder: 'Geänderten Text einfügen...',
		copyDiff: 'Diff-Ausgabe kopieren',
		additions: (count: number) => `${count} ${count === 1 ? 'Hinzufügung' : 'Hinzufügungen'}`,
		deletions: (count: number) => `${count} ${count === 1 ? 'Löschung' : 'Löschungen'}`,
		empty: 'Text in beide Felder einfügen, um einen Live-Vergleich zu sehen.',
		identical: 'Keine Unterschiede – beide Texte sind identisch.',
		originalLine: 'Zeile im Original',
		modifiedLine: 'Zeile in der geänderten Fassung',
		addedLine: 'Hinzugefügt:',
		removedLine: 'Entfernt:'
	};

	const en: typeof de = {
		original: 'Original',
		modified: 'Modified',
		originalPlaceholder: 'Paste the original text...',
		modifiedPlaceholder: 'Paste the modified text...',
		copyDiff: 'Copy diff output',
		additions: (count: number) => `${count} ${count === 1 ? 'addition' : 'additions'}`,
		deletions: (count: number) => `${count} ${count === 1 ? 'deletion' : 'deletions'}`,
		empty: 'Paste text into both fields to see a live comparison.',
		identical: 'No differences – both texts are identical.',
		originalLine: 'Line in the original',
		modifiedLine: 'Line in the modified version',
		addedLine: 'Added:',
		removedLine: 'Removed:'
	};

	const COPY = { de, en };

	const i18n = useLocale();
	const clipboard = new CopyFeedback();

	let t = $derived(COPY[i18n.current]);

	let originalText = $state('');
	let modifiedText = $state('');
	let copyFailed = $state(false);

	let hasBothInputs = $derived(originalText.trim().length > 0 && modifiedText.trim().length > 0);
	let diff = $derived(
		hasBothInputs
			? computeTextDiff(originalText, modifiedText)
			: { lines: [], additions: 0, deletions: 0 }
	);
	let hasDifferences = $derived(diff.additions > 0 || diff.deletions > 0);
	let diffOutput = $derived(hasDifferences ? formatTextDiff(diff.lines) : '');

	$effect(() => () => clipboard.dispose());

	$effect(() => {
		if (hasBothInputs) {
			trackToolUsage('text-diff');
		}
	});

	function clearAll() {
		originalText = '';
		modifiedText = '';
		copyFailed = false;
		clipboard.reset();
	}

	async function copyDiffOutput() {
		if (!diffOutput) return;
		copyFailed = !(await clipboard.copy(diffOutput));
	}
</script>

<section class="mx-auto w-full max-w-4xl space-y-8">
	<ToolHeader toolId="text-diff" />

	<section class="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
		<div class="grid gap-4 lg:grid-cols-2">
			<div class="space-y-2">
				<label class="text-sm font-medium text-slate-700" for="original-text">{t.original}</label>
				<textarea
					id="original-text"
					rows="12"
					bind:value={originalText}
					spellcheck="false"
					class="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 font-mono text-sm text-slate-700 placeholder:text-slate-400 focus:border-purple-400/80 focus:ring-1 focus:ring-purple-400/30 focus:outline-none"
					placeholder={t.originalPlaceholder}
				></textarea>
			</div>

			<div class="space-y-2">
				<label class="text-sm font-medium text-slate-700" for="modified-text">{t.modified}</label>
				<textarea
					id="modified-text"
					rows="12"
					bind:value={modifiedText}
					spellcheck="false"
					class="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 font-mono text-sm text-slate-700 placeholder:text-slate-400 focus:border-purple-400/80 focus:ring-1 focus:ring-purple-400/30 focus:outline-none"
					placeholder={t.modifiedPlaceholder}
				></textarea>
			</div>
		</div>

		<div class="mt-4 flex flex-wrap items-center gap-2">
			<button
				type="button"
				onclick={clearAll}
				class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-500"
			>
				{i18n.t('clear')}
			</button>
			<button
				type="button"
				onclick={copyDiffOutput}
				disabled={!diffOutput}
				class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition enabled:hover:border-purple-400 enabled:hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{clipboard.isCopied() ? i18n.t('copied') : t.copyDiff}
			</button>
		</div>
		{#if copyFailed}
			<p role="alert" class="mt-3 text-sm text-rose-600">{i18n.t('clipboardFailed')}</p>
		{/if}
	</section>

	<section class="space-y-3 rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
		{#if hasDifferences}
			<div class="flex flex-wrap items-center gap-2" role="status">
				<span
					class="rounded-full border border-emerald-400/50 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
				>
					{t.additions(diff.additions)}
				</span>
				<span
					class="rounded-full border border-rose-400/50 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700"
				>
					{t.deletions(diff.deletions)}
				</span>
			</div>
		{/if}

		<div class="max-h-[30rem] overflow-y-auto rounded-lg border border-slate-200 bg-slate-50">
			{#if !hasBothInputs}
				<p class="px-4 py-3 font-mono text-sm text-slate-500">{t.empty}</p>
			{:else if !hasDifferences}
				<p class="px-4 py-3 font-mono text-sm text-slate-600" role="status">{t.identical}</p>
			{:else}
				{#each diff.lines as line (line.key)}
					<div
						class={`flex items-start px-4 py-0.5 font-mono text-sm leading-6 ${
							line.kind === 'added'
								? 'border-l-2 border-emerald-500 bg-emerald-50 text-emerald-800'
								: line.kind === 'removed'
									? 'border-l-2 border-rose-500 bg-rose-50 text-rose-800'
									: 'border-l-2 border-transparent text-slate-600'
						}`}
					>
						<span
							class="w-10 shrink-0 pr-2 text-right text-slate-400 select-none"
							title={t.originalLine}>{line.oldLineNumber ?? ''}</span
						>
						<span
							class="w-10 shrink-0 pr-2 text-right text-slate-400 select-none"
							title={t.modifiedLine}>{line.newLineNumber ?? ''}</span
						>
						<span class="w-6 shrink-0 text-center select-none" aria-hidden="true"
							>{line.prefix}</span
						>
						{#if line.kind !== 'unchanged'}
							<span class="sr-only">{line.kind === 'added' ? t.addedLine : t.removedLine}</span>
						{/if}
						<span class="min-w-0 flex-1 break-words whitespace-pre-wrap">{line.text}</span>
					</div>
				{/each}
			{/if}
		</div>
	</section>
</section>
