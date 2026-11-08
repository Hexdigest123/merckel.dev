<script lang="ts">
	import LinkStats from '$lib/components/tools/LinkStats.svelte';
	import { getLocalizedTool } from '$lib/i18n/content';
	import { useLocale } from '$lib/i18n/locale.svelte';
	import { CopyFeedback } from '$lib/utils/clipboard.svelte';
	import { trackToolUsage } from '$lib/utils/tool-usage';

	type OutputFormat = 'svg' | 'png';
	type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
	type SizeOption = 128 | 256 | 512;
	/** tracked: short URL encoded · plain: text encoded · untracked: URL encoded without short link */
	type EncodingStatus = 'tracked' | 'plain' | 'untracked';

	interface ResolvedValue {
		value: string;
		shortUrl: string;
		status: EncodingStatus;
	}

	interface ShortenResponse {
		success?: boolean;
		shortCode?: string;
	}

	type ToStringFn = (
		text: string,
		options: { type: 'svg'; width: number; errorCorrectionLevel: ErrorCorrectionLevel }
	) => Promise<string>;
	type ToDataUrlFn = (
		text: string,
		options: { width: number; errorCorrectionLevel: ErrorCorrectionLevel }
	) => Promise<string>;
	type QrModule = {
		toString?: ToStringFn;
		toDataURL?: ToDataUrlFn;
		default?: { toString?: ToStringFn; toDataURL?: ToDataUrlFn };
	};

	/** Wait for a typing pause before creating a short link, so partial URLs are not stored. */
	const SHORTEN_DEBOUNCE_MS = 700;
	const SIZE_OPTIONS: SizeOption[] = [128, 256, 512];
	const LEVEL_OPTIONS: ErrorCorrectionLevel[] = ['L', 'M', 'Q', 'H'];
	const FORMAT_OPTIONS: OutputFormat[] = ['svg', 'png'];

	const de = {
		intro:
			'QR-Codes für URLs oder Text generieren. URLs werden zuerst gekürzt, damit Scans nachverfolgt werden können.',
		input: 'Text oder URL',
		placeholder: 'https://example.com oder beliebiger Text',
		format: 'Format',
		size: 'Größe',
		pixels: (value: number) => `${value} Pixel`,
		errorCorrection: 'Fehlerkorrektur',
		levels: {
			L: 'Niedrig (~7 %)',
			M: 'Mittel (~15 %)',
			Q: 'Hoch (~25 %)',
			H: 'Sehr hoch (~30 %)'
		} satisfies Record<ErrorCorrectionLevel, string>,
		livePreview: 'Live-Vorschau',
		emptyPreview: 'Text eingeben, um einen QR-Code zu generieren',
		generating: 'Wird generiert...',
		noPreview: 'Keine Vorschau verfügbar',
		qrAlt: 'Generierter QR-Code',
		download: (format: string) => `${format} herunterladen`,
		copySvg: 'SVG in Zwischenablage kopieren',
		svgCopied: 'SVG kopiert',
		status: {
			tracked: 'Nachverfolgbare Kurz-URL kodiert',
			plain: 'Klartext — nicht nachverfolgbar',
			untracked:
				'URL direkt kodiert — es konnte kein Kurzlink erstellt werden, Scans werden nicht gezählt.'
		} satisfies Record<EncodingStatus, string>,
		generateFailed: 'QR-Code konnte nicht generiert werden.'
	};

	const en: typeof de = {
		intro:
			'Generate QR codes for URLs or text. URLs are shortened first so that scans can be tracked.',
		input: 'Text or URL',
		placeholder: 'https://example.com or any text',
		format: 'Format',
		size: 'Size',
		pixels: (value: number) => `${value} pixels`,
		errorCorrection: 'Error correction',
		levels: {
			L: 'Low (~7%)',
			M: 'Medium (~15%)',
			Q: 'Quartile (~25%)',
			H: 'High (~30%)'
		},
		livePreview: 'Live preview',
		emptyPreview: 'Enter text to generate a QR code',
		generating: 'Generating...',
		noPreview: 'No preview available',
		qrAlt: 'Generated QR code',
		download: (format: string) => `Download ${format}`,
		copySvg: 'Copy SVG to clipboard',
		svgCopied: 'SVG copied',
		status: {
			tracked: 'Trackable short URL encoded',
			plain: 'Plain text — not trackable',
			untracked: 'URL encoded directly — no short link could be created, so scans are not counted.'
		},
		generateFailed: 'The QR code could not be generated.'
	};

	const COPY = { de, en };

	const i18n = useLocale();
	const clipboard = new CopyFeedback();

	let t = $derived(COPY[i18n.current]);
	let tool = $derived(getLocalizedTool(i18n, 'qr-generator'));

	let text = $state('');
	let outputFormat = $state<OutputFormat>('svg');
	let size = $state<SizeOption>(256);
	let level = $state<ErrorCorrectionLevel>('M');
	let resolved = $state<ResolvedValue | null>(null);
	let isResolving = $state(false);
	let isRendering = $state(false);
	let svgString = $state('');
	let pngDataUrl = $state('');
	let renderFailed = $state(false);
	let copyFailed = $state(false);

	/** Short links already created in this session, keyed by the original URL. */
	// eslint-disable-next-line svelte/prefer-svelte-reactivity -- intentionally non-reactive cache
	const shortUrlCache = new Map<string, string>();

	let trimmedText = $derived(text.trim());
	let hasOutput = $derived(outputFormat === 'svg' ? Boolean(svgString) : Boolean(pngDataUrl));
	let isGenerating = $derived(isResolving || isRendering);

	/** Only complete-looking http(s) URLs are shortened (e.g. not `https://exa`). */
	function isShortenableUrl(value: string): boolean {
		if (!/^https?:\/\//i.test(value)) return false;
		try {
			const { hostname } = new URL(value);
			return hostname.includes('.') || hostname.startsWith('[');
		} catch {
			return false;
		}
	}

	/** Returns the short URL, or an empty string if the URL could not be shortened. */
	async function shorten(url: string): Promise<string> {
		try {
			const response = await fetch('/api/tools/shorten', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ url })
			});
			const payload = (await response.json().catch(() => null)) as ShortenResponse | null;
			if (!response.ok || !payload?.success || !payload.shortCode) return '';
			return `${window.location.origin}/s/${payload.shortCode}`;
		} catch {
			return '';
		}
	}

	async function renderQr(
		value: string,
		format: OutputFormat,
		width: number,
		errorCorrectionLevel: ErrorCorrectionLevel
	): Promise<string> {
		const qrModule = (await import('qrcode')) as QrModule;
		const toStringFn = qrModule.toString ?? qrModule.default?.toString;
		const toDataURLFn = qrModule.toDataURL ?? qrModule.default?.toDataURL;

		if (!toStringFn || !toDataURLFn) {
			throw new Error('qrcode module could not be loaded');
		}

		return format === 'svg'
			? toStringFn(value, { type: 'svg', width, errorCorrectionLevel })
			: toDataURLFn(value, { width, errorCorrectionLevel });
	}

	$effect(() => () => clipboard.dispose());

	// Step 1: decide what to encode. Only text changes can trigger a (debounced) short link.
	$effect(() => {
		const currentText = trimmedText;

		if (!currentText) {
			resolved = null;
			isResolving = false;
			return;
		}

		if (!isShortenableUrl(currentText)) {
			resolved = { value: currentText, shortUrl: '', status: 'plain' };
			isResolving = false;
			return;
		}

		const cached = shortUrlCache.get(currentText);
		if (cached) {
			resolved = { value: cached, shortUrl: cached, status: 'tracked' };
			isResolving = false;
			return;
		}

		isResolving = true;
		let cancelled = false;
		const timeoutId = window.setTimeout(async () => {
			const shortUrl = await shorten(currentText);
			if (cancelled) return;

			if (shortUrl) {
				shortUrlCache.set(currentText, shortUrl);
				resolved = { value: shortUrl, shortUrl, status: 'tracked' };
			} else {
				// e.g. rate-limited or a host the shortener rejects: still encode the URL itself.
				resolved = { value: currentText, shortUrl: '', status: 'untracked' };
			}
			isResolving = false;
		}, SHORTEN_DEBOUNCE_MS);

		return () => {
			cancelled = true;
			window.clearTimeout(timeoutId);
		};
	});

	// Step 2: render the QR code. Format, size and level changes never hit the network.
	$effect(() => {
		const current = resolved;
		const format = outputFormat;
		const width = size;
		const errorCorrectionLevel = level;

		renderFailed = false;
		copyFailed = false;
		clipboard.reset();

		if (!current) {
			svgString = '';
			pngDataUrl = '';
			isRendering = false;
			return;
		}

		let cancelled = false;
		isRendering = true;

		renderQr(current.value, format, width, errorCorrectionLevel)
			.then((output) => {
				if (cancelled) return;
				svgString = format === 'svg' ? output : '';
				pngDataUrl = format === 'png' ? output : '';
				trackToolUsage('qr-generator');
			})
			.catch(() => {
				if (cancelled) return;
				svgString = '';
				pngDataUrl = '';
				renderFailed = true;
			})
			.finally(() => {
				if (!cancelled) isRendering = false;
			});

		return () => {
			cancelled = true;
		};
	});

	function downloadQr() {
		if (!hasOutput) {
			return;
		}

		const link = document.createElement('a');

		if (outputFormat === 'svg') {
			const url = URL.createObjectURL(new Blob([svgString], { type: 'image/svg+xml' }));
			link.href = url;
			link.download = 'qr-code.svg';
			link.click();
			// Revoke after the download has been handed to the browser.
			setTimeout(() => URL.revokeObjectURL(url), 0);
			return;
		}

		link.href = pngDataUrl;
		link.download = 'qr-code.png';
		link.click();
	}

	async function copySvg() {
		if (outputFormat !== 'svg' || !svgString) {
			return;
		}
		copyFailed = !(await clipboard.copy(svgString));
	}
</script>

<section class="mx-auto w-full max-w-5xl">
	<div class="rounded-lg border border-slate-200 bg-white p-6 sm:p-8">
		<h1 class="text-3xl font-bold text-slate-900">{tool.name}</h1>
		<p class="mt-2 text-base text-slate-600">{t.intro}</p>

		<div class="mt-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
			<div class="space-y-5 rounded-lg border border-slate-200 bg-white p-5">
				<label for="qr-input" class="block space-y-2 text-sm text-slate-600">
					<span>{t.input}</span>
					<input
						id="qr-input"
						type="text"
						bind:value={text}
						placeholder={t.placeholder}
						autocomplete="off"
						spellcheck="false"
						class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-purple-400/80 focus:outline-none"
					/>
				</label>

				<div class="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
					<div>
						<p class="text-sm text-slate-600" id="qr-format-label">{t.format}</p>
						<div class="mt-2 flex gap-2" role="group" aria-labelledby="qr-format-label">
							{#each FORMAT_OPTIONS as option (option)}
								<button
									type="button"
									aria-pressed={outputFormat === option}
									onclick={() => (outputFormat = option)}
									class={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
										outputFormat === option
											? 'border-purple-400 bg-purple-500/20 text-purple-700'
											: 'border-slate-200 bg-white text-slate-700 hover:border-purple-400/60'
									}`}
								>
									{option.toUpperCase()}
								</button>
							{/each}
						</div>
					</div>

					<div>
						<p class="text-sm text-slate-600" id="qr-size-label">{t.size}</p>
						<div class="mt-2 flex flex-wrap gap-2" role="group" aria-labelledby="qr-size-label">
							{#each SIZE_OPTIONS as option (option)}
								<button
									type="button"
									aria-pressed={size === option}
									aria-label={t.pixels(option)}
									onclick={() => (size = option)}
									class={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
										size === option
											? 'border-purple-400 bg-purple-500/20 text-purple-700'
											: 'border-slate-200 bg-white text-slate-700 hover:border-purple-400/60'
									}`}
								>
									{option}
								</button>
							{/each}
						</div>
					</div>

					<div>
						<p class="text-sm text-slate-600" id="qr-level-label">{t.errorCorrection}</p>
						<div class="mt-2 flex flex-wrap gap-2" role="group" aria-labelledby="qr-level-label">
							{#each LEVEL_OPTIONS as option (option)}
								<button
									type="button"
									aria-pressed={level === option}
									aria-label={`${option}: ${t.levels[option]}`}
									title={t.levels[option]}
									onclick={() => (level = option)}
									class={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
										level === option
											? 'border-purple-400 bg-purple-500/20 text-purple-700'
											: 'border-slate-200 bg-white text-slate-700 hover:border-purple-400/60'
									}`}
								>
									{option}
								</button>
							{/each}
						</div>
					</div>
				</div>
			</div>

			<div class="rounded-lg border border-slate-200 bg-white p-5">
				<h2 class="font-mono text-xs tracking-wide text-slate-500 uppercase">{t.livePreview}</h2>
				<div
					class="mt-3 flex min-h-80 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-4"
					aria-busy={isGenerating}
				>
					{#if !trimmedText}
						<p class="text-sm text-slate-500">{t.emptyPreview}</p>
					{:else if isGenerating}
						<p class="text-sm text-slate-500" role="status">{t.generating}</p>
					{:else if outputFormat === 'svg' && svgString}
						<div
							class="max-w-full"
							style={`width: ${size}px; height: ${size}px;`}
							role="img"
							aria-label={t.qrAlt}
						>
							<!-- eslint-disable-next-line svelte/no-at-html-tags -- SVG markup generated by the qrcode library -->
							{@html svgString}
						</div>
					{:else if outputFormat === 'png' && pngDataUrl}
						<img
							src={pngDataUrl}
							alt={t.qrAlt}
							class="h-auto max-w-full"
							style={`width: ${size}px;`}
						/>
					{:else if !renderFailed}
						<p class="text-sm text-slate-500">{t.noPreview}</p>
					{/if}
				</div>

				<div class="mt-4 flex flex-wrap gap-3">
					<button
						type="button"
						onclick={downloadQr}
						disabled={!hasOutput}
						class="inline-flex rounded-md bg-purple-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-purple-600 disabled:cursor-not-allowed disabled:bg-purple-400/40"
					>
						{t.download(outputFormat.toUpperCase())}
					</button>

					{#if outputFormat === 'svg'}
						<button
							type="button"
							onclick={copySvg}
							disabled={!svgString}
							class="inline-flex rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:border-purple-400/60 hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{clipboard.isCopied() ? t.svgCopied : t.copySvg}
						</button>
					{/if}
				</div>

				{#if resolved && hasOutput && !isGenerating}
					<div
						class="mt-4 space-y-2 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600"
					>
						<p class="font-semibold text-slate-700">{t.status[resolved.status]}</p>
						{#if resolved.shortUrl}
							<p class="font-mono text-xs break-all text-purple-700">{resolved.shortUrl}</p>
						{/if}
					</div>
				{/if}
			</div>
		</div>

		{#if renderFailed}
			<p role="alert" class="mt-4 text-sm text-rose-600">{t.generateFailed}</p>
		{/if}
		{#if copyFailed}
			<p role="alert" class="mt-4 text-sm text-rose-600">{i18n.t('clipboardFailed')}</p>
		{/if}
	</div>

	<div class="mt-6">
		<LinkStats />
	</div>
</section>
