<script lang="ts">
	import { browser } from '$app/environment';
	import { Marked } from 'marked';
	import { markedHighlight } from 'marked-highlight';
	import hljs from 'highlight.js/lib/core';
	import DOMPurify from 'dompurify';
	import 'highlight.js/styles/github-dark.css';

	import javascript from 'highlight.js/lib/languages/javascript';
	import typescript from 'highlight.js/lib/languages/typescript';
	import python from 'highlight.js/lib/languages/python';
	import bash from 'highlight.js/lib/languages/bash';
	import jsonLang from 'highlight.js/lib/languages/json';
	import css from 'highlight.js/lib/languages/css';
	import xml from 'highlight.js/lib/languages/xml';
	import go from 'highlight.js/lib/languages/go';
	import rust from 'highlight.js/lib/languages/rust';
	import sql from 'highlight.js/lib/languages/sql';
	import yaml from 'highlight.js/lib/languages/yaml';

	hljs.registerLanguage('javascript', javascript);
	hljs.registerLanguage('typescript', typescript);
	hljs.registerLanguage('python', python);
	hljs.registerLanguage('bash', bash);
	hljs.registerLanguage('json', jsonLang);
	hljs.registerLanguage('css', css);
	hljs.registerLanguage('html', xml);
	hljs.registerLanguage('xml', xml);
	hljs.registerLanguage('go', go);
	hljs.registerLanguage('rust', rust);
	hljs.registerLanguage('sql', sql);
	hljs.registerLanguage('yaml', yaml);
	hljs.registerLanguage('svelte', xml);

	const markedInstance = new Marked(
		markedHighlight({
			langPrefix: 'hljs language-',
			highlight(code: string, lang: string) {
				const language = hljs.getLanguage(lang) ? lang : 'plaintext';
				return hljs.highlight(code, { language }).value;
			}
		})
	);

	markedInstance.use({ gfm: true, breaks: true });

	const SAMPLE_MARKDOWN = `# Markdown-Vorschau Demo

Das ist ein **fetter Text**, *kursiver Text* und ~~durchgestrichener Text~~.

## Aufgabenliste

- [x] Markdown-Parser integrieren
- [x] Live-Vorschau implementieren
- [ ] Weitere Funktionen hinzuf\u00FCgen

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

> Einfachheit ist die h\u00F6chste Stufe der Vollendung.
> \u2014 Leonardo da Vinci

## Links

Besuche [GitHub](https://github.com) f\u00FCr mehr Informationen.

---

Inline-Code: \`const x = 42;\`

### Verschachtelte Liste

1. Erster Punkt
   - Unterpunkt A
   - Unterpunkt B
2. Zweiter Punkt
3. Dritter Punkt
`;

	let markdownInput = $state('');
	let hasTrackedUsage = $state(false);
	let isCopiedHtml = $state(false);
	let isCopiedMd = $state(false);

	let htmlOutput = $derived.by(() => {
		const trimmed = markdownInput.trim();
		if (!trimmed || !browser) return '';
		const raw = markedInstance.parse(trimmed) as string;
		return DOMPurify.sanitize(raw);
	});

	let wordCount = $derived(markdownInput.trim() ? markdownInput.trim().split(/\s+/).length : 0);
	let charCount = $derived(markdownInput.length);

	async function trackUsage() {
		if (!browser) return;
		await fetch('/api/tools/usage', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ toolId: 'markdown-preview' })
		});
	}

	$effect(() => {
		if (hasTrackedUsage || !markdownInput.trim()) return;
		hasTrackedUsage = true;
		void trackUsage();
	});

	async function copyHtml() {
		if (!browser || !htmlOutput) return;
		await navigator.clipboard.writeText(htmlOutput);
		isCopiedHtml = true;
		setTimeout(() => {
			isCopiedHtml = false;
		}, 1800);
	}

	async function copyMarkdown() {
		if (!browser || !markdownInput.trim()) return;
		await navigator.clipboard.writeText(markdownInput);
		isCopiedMd = true;
		setTimeout(() => {
			isCopiedMd = false;
		}, 1800);
	}

	function clearInput() {
		markdownInput = '';
		isCopiedHtml = false;
		isCopiedMd = false;
	}

	function loadSample() {
		markdownInput = SAMPLE_MARKDOWN;
	}
</script>

<section class="mx-auto w-full max-w-5xl space-y-8">
	<header class="space-y-3">
		<h1 class="font-sans text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl">
			Markdown-Vorschau
		</h1>
		<p class="text-slate-400">Markdown mit Live-Vorschau bearbeiten und als HTML kopieren.</p>
	</header>

	<section class="rounded-2xl border border-slate-700 bg-slate-900/60 p-5 sm:p-6">
		<div class="flex flex-wrap items-center gap-2">
			<button
				type="button"
				onclick={loadSample}
				class="rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500"
			>
				Beispiel laden
			</button>
			<button
				type="button"
				onclick={clearInput}
				class="rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500"
			>
				L&ouml;schen
			</button>
			<button
				type="button"
				onclick={copyHtml}
				disabled={!htmlOutput}
				class="rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-200 transition enabled:hover:border-purple-400 enabled:hover:text-purple-200 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{isCopiedHtml ? 'Kopiert' : 'HTML kopieren'}
			</button>
			<button
				type="button"
				onclick={copyMarkdown}
				disabled={!markdownInput.trim()}
				class="rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-200 transition enabled:hover:border-purple-400 enabled:hover:text-purple-200 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{isCopiedMd ? 'Kopiert' : 'Markdown kopieren'}
			</button>
		</div>
	</section>

	<div class="grid gap-6 lg:grid-cols-2">
		<section class="rounded-2xl border border-slate-700 bg-slate-900/60 p-5 sm:p-6">
			<div class="space-y-2">
				<label class="text-sm font-medium text-slate-200" for="markdown-input">
					Markdown-Eingabe
				</label>
				<textarea
					id="markdown-input"
					rows="24"
					bind:value={markdownInput}
					class="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-3 font-mono text-sm text-slate-200 placeholder:text-slate-500 focus:border-purple-400/80 focus:ring-1 focus:ring-purple-400/30 focus:outline-none"
					placeholder="Markdown hier eingeben..."
				></textarea>
				<div class="flex gap-3 text-xs text-slate-500">
					<span>{wordCount} W&ouml;rter</span>
					<span>&middot;</span>
					<span>{charCount} Zeichen</span>
				</div>
			</div>
		</section>

		<section class="rounded-2xl border border-slate-700 bg-slate-900/60 p-5 sm:p-6">
			<div class="space-y-2">
				<span class="text-sm font-medium text-slate-200">Vorschau</span>
				<div
					class="max-h-[38rem] overflow-y-auto rounded-lg border border-slate-700/80 bg-slate-950/80 px-5 py-4"
				>
					{#if htmlOutput}
						<div
							class="prose max-w-none prose-invert prose-a:text-purple-400 prose-a:no-underline hover:prose-a:text-purple-300 prose-code:text-purple-300 prose-code:before:content-none prose-code:after:content-none prose-pre:border prose-pre:border-slate-700/50 prose-pre:bg-slate-950/80 prose-thead:border-slate-700 prose-tr:border-slate-700/50 prose-th:text-slate-300"
						>
							{@html htmlOutput}
						</div>
					{:else}
						<p class="text-sm text-slate-500">Markdown eingeben, um die Vorschau zu sehen.</p>
					{/if}
				</div>
			</div>
		</section>
	</div>
</section>
