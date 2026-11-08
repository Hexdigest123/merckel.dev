<script lang="ts">
	import { browser } from '$app/environment';
	import DOMPurify from 'dompurify';
	// Same light theme as the writeup pages: highlight.js styles are global, so two
	// different themes would override each other after client-side navigation.
	import 'highlight.js/styles/github.css';
	import ToolHeader from '$lib/components/tools/ToolHeader.svelte';
	import { useLocale } from '$lib/i18n/locale.svelte';
	import { CopyFeedback } from '$lib/utils/clipboard.svelte';
	import { renderMarkdown } from '$lib/utils/markdown';
	import { trackToolUsage } from '$lib/utils/tool-usage';

	const SAMPLE_DE = `# Markdown-Vorschau Demo

Das ist ein **fetter Text**, *kursiver Text* und ~~durchgestrichener Text~~.

## Aufgabenliste

- [x] Markdown-Parser integrieren
- [x] Live-Vorschau implementieren
- [ ] Weitere Funktionen hinzufügen

## Code-Beispiel

\`\`\`typescript
interface Benutzer {
  name: string;
  alter: number;
}

function begruessung(b: Benutzer): string {
  return \`Hallo, \${b.name}!\`;
}
\`\`\`

## Tabelle

| Sprache    | Typ        | Beliebtheit |
|------------|------------|-------------|
| TypeScript | Statisch   | Sehr hoch   |
| Python     | Dynamisch  | Sehr hoch   |
| Rust       | Statisch   | Steigend    |

## Blockzitat

> Einfachheit ist die höchste Stufe der Vollendung.
> — Leonardo da Vinci

## Links

Besuche [GitHub](https://github.com) für mehr Informationen.

---

Inline-Code: \`const x = 42;\`

### Verschachtelte Liste

1. Erster Punkt
   - Unterpunkt A
   - Unterpunkt B
2. Zweiter Punkt
3. Dritter Punkt
`;

	const SAMPLE_EN = `# Markdown Preview Demo

This is **bold text**, *italic text* and ~~strikethrough text~~.

## Task list

- [x] Integrate a Markdown parser
- [x] Implement the live preview
- [ ] Add more features

## Code example

\`\`\`typescript
interface User {
  name: string;
  age: number;
}

function greet(user: User): string {
  return \`Hello, \${user.name}!\`;
}
\`\`\`

## Table

| Language   | Typing   | Popularity |
|------------|----------|------------|
| TypeScript | Static   | Very high  |
| Python     | Dynamic  | Very high  |
| Rust       | Static   | Rising     |

## Blockquote

> Simplicity is the ultimate sophistication.
> — Leonardo da Vinci

## Links

Visit [GitHub](https://github.com) for more information.

---

Inline code: \`const x = 42;\`

### Nested list

1. First item
   - Sub-item A
   - Sub-item B
2. Second item
3. Third item
`;

	const de = {
		sample: SAMPLE_DE,
		loadSample: 'Beispiel laden',
		copyHtml: 'HTML kopieren',
		copyMarkdown: 'Markdown kopieren',
		input: 'Markdown-Eingabe',
		inputPlaceholder: 'Markdown hier eingeben...',
		words: (count: number) => `${count} ${count === 1 ? 'Wort' : 'Wörter'}`,
		characters: (count: number) => `${count} Zeichen`,
		preview: 'Vorschau',
		previewEmpty: 'Markdown eingeben, um die Vorschau zu sehen.'
	};

	const en: typeof de = {
		sample: SAMPLE_EN,
		loadSample: 'Load sample',
		copyHtml: 'Copy HTML',
		copyMarkdown: 'Copy Markdown',
		input: 'Markdown input',
		inputPlaceholder: 'Type Markdown here...',
		words: (count: number) => `${count} ${count === 1 ? 'word' : 'words'}`,
		characters: (count: number) => `${count} ${count === 1 ? 'character' : 'characters'}`,
		preview: 'Preview',
		previewEmpty: 'Type some Markdown to see the preview.'
	};

	const COPY = { de, en };

	const i18n = useLocale();
	const clipboard = new CopyFeedback();

	let t = $derived(COPY[i18n.current]);

	let markdownInput = $state('');
	let copyFailed = $state(false);

	let htmlOutput = $derived.by(() => {
		const trimmed = markdownInput.trim();
		// DOMPurify needs a DOM, so the preview is only rendered in the browser.
		if (!trimmed || !browser) return '';
		return DOMPurify.sanitize(renderMarkdown(trimmed, { breaks: true }));
	});

	let wordCount = $derived(markdownInput.trim() ? markdownInput.trim().split(/\s+/).length : 0);
	let charCount = $derived(markdownInput.length);

	$effect(() => () => clipboard.dispose());

	$effect(() => {
		if (markdownInput.trim()) {
			trackToolUsage('markdown-preview');
		}
	});

	async function copy(text: string, key: string) {
		copyFailed = !(await clipboard.copy(text, key));
	}

	function clearInput() {
		markdownInput = '';
		copyFailed = false;
		clipboard.reset();
	}

	function loadSample() {
		markdownInput = t.sample;
	}
</script>

<section class="mx-auto w-full max-w-5xl space-y-8">
	<ToolHeader toolId="markdown-preview" />

	<section class="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
		<div class="flex flex-wrap items-center gap-2">
			<button
				type="button"
				onclick={loadSample}
				class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-500"
			>
				{t.loadSample}
			</button>
			<button
				type="button"
				onclick={clearInput}
				class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-500"
			>
				{i18n.t('clear')}
			</button>
			<button
				type="button"
				onclick={() => copy(htmlOutput, 'html')}
				disabled={!htmlOutput}
				class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition enabled:hover:border-purple-400 enabled:hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{clipboard.isCopied('html') ? i18n.t('copied') : t.copyHtml}
			</button>
			<button
				type="button"
				onclick={() => copy(markdownInput, 'markdown')}
				disabled={!markdownInput.trim()}
				class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition enabled:hover:border-purple-400 enabled:hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{clipboard.isCopied('markdown') ? i18n.t('copied') : t.copyMarkdown}
			</button>
		</div>
		{#if copyFailed}
			<p role="alert" class="mt-3 text-sm text-rose-600">{i18n.t('clipboardFailed')}</p>
		{/if}
	</section>

	<div class="grid gap-6 lg:grid-cols-2">
		<section class="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
			<div class="space-y-2">
				<label class="text-sm font-medium text-slate-700" for="markdown-input">
					{t.input}
				</label>
				<textarea
					id="markdown-input"
					rows="24"
					bind:value={markdownInput}
					class="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 font-mono text-sm text-slate-700 placeholder:text-slate-400 focus:border-purple-400/80 focus:ring-1 focus:ring-purple-400/30 focus:outline-none"
					placeholder={t.inputPlaceholder}
				></textarea>
				<div class="flex gap-3 text-xs text-slate-500">
					<span>{t.words(wordCount)}</span>
					<span aria-hidden="true">&middot;</span>
					<span>{t.characters(charCount)}</span>
				</div>
			</div>
		</section>

		<section class="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
			<div class="space-y-2">
				<h2 class="text-sm font-medium text-slate-700">{t.preview}</h2>
				<div
					class="max-h-[38rem] overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 px-5 py-4"
				>
					{#if htmlOutput}
						<div
							class="prose max-w-none prose-headings:text-slate-900 prose-a:text-purple-600 prose-a:no-underline hover:prose-a:text-purple-700 prose-code:text-purple-700 prose-code:before:content-none prose-code:after:content-none prose-pre:border prose-pre:border-slate-200 prose-pre:bg-white prose-thead:border-slate-200 prose-tr:border-slate-200 prose-th:text-slate-600"
						>
							<!-- eslint-disable-next-line svelte/no-at-html-tags -- sanitised with DOMPurify -->
							{@html htmlOutput}
						</div>
					{:else}
						<p class="text-sm text-slate-500">{t.previewEmpty}</p>
					{/if}
				</div>
			</div>
		</section>
	</div>
</section>
