<script lang="ts">
	import { browser } from '$app/environment';
	import { diffLines, type Change } from 'diff';

	type DiffKind = 'added' | 'removed' | 'unchanged';

	interface DiffLine {
		kind: DiffKind;
		text: string;
		prefix: '+' | '-' | ' ';
		lineNumber: number;
		key: string;
	}

	let originalText = $state('');
	let modifiedText = $state('');
	let hasTrackedUsage = $state(false);
	let isCopied = $state(false);

	function splitLines(value: string): string[] {
		if (value.length === 0) {
			return [];
		}

		const lines = value.split('\n');
		if (lines.at(-1) === '') {
			lines.pop();
		}

		return lines;
	}

	function countChunkLines(value: string): number {
		return splitLines(value).length;
	}

	function getChunkKind(chunk: Change): DiffKind {
		if (chunk.added) {
			return 'added';
		}

		if (chunk.removed) {
			return 'removed';
		}

		return 'unchanged';
	}

	async function trackUsage() {
		if (!browser) {
			return;
		}

		await fetch('/api/tools/usage', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ toolId: 'text-diff' })
		});
	}

	let chunks = $derived.by(() => {
		if (!originalText.trim() || !modifiedText.trim()) {
			return [];
		}

		return diffLines(originalText, modifiedText);
	});

	$effect(() => {
		if (hasTrackedUsage || chunks.length === 0) {
			return;
		}

		hasTrackedUsage = true;
		void trackUsage();
	});

	function clearAll() {
		originalText = '';
		modifiedText = '';
		isCopied = false;
	}

	const additions = $derived(
		chunks.reduce((total, chunk) => total + (chunk.added ? countChunkLines(chunk.value) : 0), 0)
	);

	const deletions = $derived(
		chunks.reduce((total, chunk) => total + (chunk.removed ? countChunkLines(chunk.value) : 0), 0)
	);

	const hasDifferences = $derived(additions > 0 || deletions > 0);

	const lines = $derived.by(() => {
		const output: DiffLine[] = [];
		let lineNumber = 1;

		chunks.forEach((chunk, chunkIndex) => {
			const kind = getChunkKind(chunk);
			const prefix = kind === 'added' ? '+' : kind === 'removed' ? '-' : ' ';
			const lineItems = splitLines(chunk.value);

			lineItems.forEach((line, lineIndex) => {
				output.push({
					kind,
					text: line,
					prefix,
					lineNumber,
					key: `${chunkIndex}-${lineIndex}-${kind}-${lineNumber}`
				});
				lineNumber += 1;
			});
		});

		return output;
	});

	const diffOutput = $derived(lines.map((line) => `${line.prefix} ${line.text}`).join('\n'));

	async function copyDiffOutput() {
		if (!browser || diffOutput.length === 0) {
			return;
		}

		await navigator.clipboard.writeText(diffOutput);
		isCopied = true;
		setTimeout(() => {
			isCopied = false;
		}, 1800);
	}
</script>

<section class="px-4 py-10 sm:px-6 lg:px-8">
	<div class="mx-auto flex w-full max-w-4xl flex-col gap-8">
		<a
			href="/tools"
			class="inline-flex w-fit items-center gap-2 text-sm text-purple-300 transition hover:text-purple-200"
		>
			<span aria-hidden="true">&larr;</span>
			Back to Tools
		</a>

		<header class="space-y-3">
			<h1 class="font-sans text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl">
				Text Diff Checker
			</h1>
			<p class="text-slate-400">Compare two texts side-by-side with highlighted differences.</p>
		</header>

		<section class="rounded-2xl border border-slate-700 bg-slate-900/60 p-5 sm:p-6">
			<div class="grid gap-4 lg:grid-cols-2">
				<div class="space-y-2">
					<label class="text-sm font-medium text-slate-200" for="original-text">Original</label>
					<textarea
						id="original-text"
						rows="12"
						bind:value={originalText}
						class="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-3 font-mono text-sm text-slate-200 placeholder:text-slate-500 focus:border-purple-400/80 focus:ring-1 focus:ring-purple-400/30 focus:outline-none"
						placeholder="Paste original text..."
					></textarea>
				</div>

				<div class="space-y-2">
					<label class="text-sm font-medium text-slate-200" for="modified-text">Modified</label>
					<textarea
						id="modified-text"
						rows="12"
						bind:value={modifiedText}
						class="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-3 font-mono text-sm text-slate-200 placeholder:text-slate-500 focus:border-purple-400/80 focus:ring-1 focus:ring-purple-400/30 focus:outline-none"
						placeholder="Paste modified text..."
					></textarea>
				</div>
			</div>

			<div class="mt-4 flex flex-wrap items-center gap-2">
				<button
					type="button"
					onclick={clearAll}
					class="rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500"
				>
					Clear
				</button>
				<button
					type="button"
					onclick={copyDiffOutput}
					disabled={diffOutput.length === 0}
					class="rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-200 transition enabled:hover:border-purple-400 enabled:hover:text-purple-200 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{isCopied ? 'Copied' : 'Copy diff output'}
				</button>
			</div>
		</section>

		<section class="space-y-3 rounded-2xl border border-slate-700 bg-slate-900/60 p-5 sm:p-6">
			{#if hasDifferences}
				<div class="flex flex-wrap items-center gap-2">
					<span
						class="rounded-full border border-emerald-400/50 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300"
					>
						{additions} additions
					</span>
					<span
						class="rounded-full border border-rose-400/50 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-300"
					>
						{deletions} deletions
					</span>
				</div>
			{/if}

			<div
				class="max-h-[30rem] overflow-y-auto rounded-lg border border-slate-700/80 bg-slate-950/80"
			>
				{#if !originalText.trim() || !modifiedText.trim()}
					<p class="px-4 py-3 font-mono text-sm text-slate-400">
						Paste text into both panels to see a live diff.
					</p>
				{:else if lines.length === 0}
					<p class="px-4 py-3 font-mono text-sm text-slate-400">No differences.</p>
				{:else}
					{#each lines as line (line.key)}
						<div
							class={`flex items-start px-4 py-0.5 font-mono text-sm leading-6 ${
								line.kind === 'added'
									? 'border-l-2 border-emerald-400 bg-emerald-500/10 text-emerald-300'
									: line.kind === 'removed'
										? 'border-l-2 border-rose-400 bg-rose-500/10 text-rose-300'
										: 'text-slate-400'
							}`}
						>
							<span class="w-12 shrink-0 pr-3 text-right text-slate-500 select-none"
								>{line.lineNumber}</span
							>
							<span class="w-6 shrink-0 text-center select-none">{line.prefix}</span>
							<span class="min-w-0 flex-1 break-words whitespace-pre-wrap">{line.text}</span>
						</div>
					{/each}
				{/if}
			</div>
		</section>
	</div>
</section>
