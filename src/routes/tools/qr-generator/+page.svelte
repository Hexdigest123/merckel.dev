<script lang="ts">
	import { browser } from '$app/environment';
	import LinkStats from '$lib/components/tools/LinkStats.svelte';

	type OutputFormat = 'svg' | 'png';
	type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
	type SizeOption = 128 | 256 | 512;
	type ShortenResponse = {
		success?: boolean;
		shortCode?: string;
		error?: string;
	};
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
		default?: {
			toString?: ToStringFn;
			toDataURL?: ToDataUrlFn;
		};
	};

	let { data }: { data: { title: string } } = $props();

	let text = $state('');
	let outputFormat = $state<OutputFormat>('svg');
	let size = $state<SizeOption>(256);
	let level = $state<ErrorCorrectionLevel>('M');
	let svgString = $state('');
	let pngDataUrl = $state('');
	let errorMessage = $state('');
	let statusMessage = $state('');
	let encodedValue = $state('');
	let shortUrl = $state('');
	let isGenerating = $state(false);
	let isCopied = $state(false);
	let copyTimeoutId = $state<number | null>(null);

	let tokenCounter = 0;
	let trackedUsage = false;

	const sizeOptions: Array<{ label: string; value: SizeOption }> = [
		{ label: '128', value: 128 },
		{ label: '256', value: 256 },
		{ label: '512', value: 512 }
	];
	const levelOptions: ErrorCorrectionLevel[] = ['L', 'M', 'Q', 'H'];
	const formatOptions: OutputFormat[] = ['svg', 'png'];

	let trimmedText = $derived(text.trim());
	let hasOutput = $derived(outputFormat === 'svg' ? Boolean(svgString) : Boolean(pngDataUrl));

	$effect(() => {
		if (browser) {
			trackedUsage = window.sessionStorage.getItem('qr-generator-usage-tracked') === '1';
		}
	});

	$effect(() => {
		return () => {
			if (copyTimeoutId !== null) {
				clearTimeout(copyTimeoutId);
			}
		};
	});

	$effect(() => {
		const currentText = trimmedText;
		const currentFormat = outputFormat;
		const currentSize = size;
		const currentLevel = level;

		if (!browser) return;

		tokenCounter += 1;
		const myToken = tokenCounter;

		if (!currentText) {
			queueMicrotask(() => {
				if (myToken !== tokenCounter) return;
				svgString = '';
				pngDataUrl = '';
				errorMessage = '';
				statusMessage = '';
				encodedValue = '';
				shortUrl = '';
				isGenerating = false;
			});
			return;
		}

		queueMicrotask(() => {
			if (myToken !== tokenCounter) return;
			isGenerating = true;
			errorMessage = '';
			isCopied = false;
		});

		const timeoutId = window.setTimeout(async () => {
			if (myToken !== tokenCounter) return;

			try {
				const urlLike = /^https?:\/\//i.test(currentText);
				let valueToEncode = currentText;
				let generatedShortUrl = '';

				if (urlLike) {
					const shortenResponse = await fetch('/api/tools/shorten', {
						method: 'POST',
						headers: { 'content-type': 'application/json' },
						body: JSON.stringify({ url: currentText })
					});
					const shortenPayload: ShortenResponse = await shortenResponse.json();

					if (!shortenResponse.ok || !shortenPayload.success || !shortenPayload.shortCode) {
						throw new Error(shortenPayload.error ?? 'Diese URL konnte nicht gekürzt werden.');
					}

					generatedShortUrl = `${window.location.origin}/s/${shortenPayload.shortCode}`;
					valueToEncode = generatedShortUrl;
				}

				if (myToken !== tokenCounter) return;

				const qrModule = (await import('qrcode')) as QrModule;
				const toStringFn = qrModule.toString ?? qrModule.default?.toString;
				const toDataURLFn = qrModule.toDataURL ?? qrModule.default?.toDataURL;

				if (!toStringFn || !toDataURLFn) {
					throw new Error('QR-Code-Modul konnte nicht geladen werden.');
				}

				if (currentFormat === 'svg') {
					const svg = await toStringFn(valueToEncode, {
						type: 'svg',
						width: currentSize,
						errorCorrectionLevel: currentLevel
					});
					if (myToken !== tokenCounter) return;
					svgString = svg;
					pngDataUrl = '';
				} else {
					const dataUrl = await toDataURLFn(valueToEncode, {
						width: currentSize,
						errorCorrectionLevel: currentLevel
					});
					if (myToken !== tokenCounter) return;
					pngDataUrl = dataUrl;
					svgString = '';
				}

				encodedValue = valueToEncode;
				shortUrl = generatedShortUrl;
				statusMessage = generatedShortUrl
					? 'Nachverfolgbare Kurz-URL kodiert'
					: 'Klartext — nicht nachverfolgbar';

				if (!trackedUsage) {
					trackedUsage = true;
					window.sessionStorage.setItem('qr-generator-usage-tracked', '1');
					await fetch('/api/tools/usage', {
						method: 'POST',
						headers: { 'content-type': 'application/json' },
						body: JSON.stringify({ toolId: 'qr-generator' })
					}).catch(() => null);
				}
			} catch (error) {
				if (myToken !== tokenCounter) return;
				errorMessage =
					error instanceof Error ? error.message : 'QR-Code konnte nicht generiert werden.';
				svgString = '';
				pngDataUrl = '';
				encodedValue = '';
				shortUrl = '';
				statusMessage = '';
			} finally {
				if (myToken === tokenCounter) {
					isGenerating = false;
				}
			}
		}, 500);

		return () => {
			clearTimeout(timeoutId);
		};
	});

	function downloadQr() {
		if (!browser || !hasOutput) {
			return;
		}

		if (outputFormat === 'svg') {
			const blob = new Blob([svgString], { type: 'image/svg+xml' });
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = 'qr-code.svg';
			link.click();
			URL.revokeObjectURL(url);
			return;
		}

		const link = document.createElement('a');
		link.href = pngDataUrl;
		link.download = 'qr-code.png';
		link.click();
	}

	async function copySvg() {
		if (!browser || outputFormat !== 'svg' || !svgString) {
			return;
		}

		try {
			await navigator.clipboard.writeText(svgString);
			isCopied = true;
			if (copyTimeoutId !== null) {
				clearTimeout(copyTimeoutId);
			}
			copyTimeoutId = window.setTimeout(() => {
				isCopied = false;
				copyTimeoutId = null;
			}, 2000);
		} catch {
			errorMessage =
				'Zwischenablage-Zugriff fehlgeschlagen. Kopieren Sie manuell aus der Vorschauquelle.';
		}
	}
</script>

<section class="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:py-16">
	<a
		href="/tools"
		data-cursor="link"
		class="inline-flex items-center gap-2 text-sm text-slate-300 transition-colors duration-200 hover:text-purple-300"
	>
		<span aria-hidden="true">←</span>
		<span>Zurück zu Werkzeugen</span>
	</a>

	<div class="mt-6 rounded-2xl border border-slate-700/60 bg-slate-800/30 p-6 sm:p-8">
		<h1 class="text-3xl font-bold text-slate-100">{data.title}</h1>
		<p class="mt-2 text-base text-slate-300">
			QR-Codes für URLs oder Text generieren. URLs werden zuerst gekürzt, damit Scans nachverfolgt
			werden können.
		</p>

		<div class="mt-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
			<div class="space-y-5 rounded-xl border border-slate-700/60 bg-slate-800/30 p-5">
				<label for="qr-input" class="block space-y-2 text-sm text-slate-300">
					<span>Text oder URL</span>
					<input
						id="qr-input"
						type="text"
						bind:value={text}
						placeholder="https://example.com or any plain text"
						class="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:border-purple-400/80 focus:outline-none"
					/>
				</label>

				<div class="space-y-4 rounded-xl border border-slate-700/60 bg-slate-800/30 p-4">
					<div>
						<p class="text-sm text-slate-300">Format</p>
						<div class="mt-2 flex gap-2">
							{#each formatOptions as option (option)}
								<button
									type="button"
									onclick={() => (outputFormat = option)}
									class={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
										outputFormat === option
											? 'border-purple-400 bg-purple-500/20 text-purple-200'
											: 'border-slate-700 bg-slate-800 text-slate-200 hover:border-purple-400/60'
									}`}
								>
									{option.toUpperCase()}
								</button>
							{/each}
						</div>
					</div>

					<div>
						<p class="text-sm text-slate-300">Größe</p>
						<div class="mt-2 flex flex-wrap gap-2">
							{#each sizeOptions as option (option.value)}
								<button
									type="button"
									onclick={() => (size = option.value)}
									class={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
										size === option.value
											? 'border-purple-400 bg-purple-500/20 text-purple-200'
											: 'border-slate-700 bg-slate-800 text-slate-200 hover:border-purple-400/60'
									}`}
								>
									{option.label}
								</button>
							{/each}
						</div>
					</div>

					<div>
						<p class="text-sm text-slate-300">Fehlerkorrektur</p>
						<div class="mt-2 flex flex-wrap gap-2">
							{#each levelOptions as option (option)}
								<button
									type="button"
									onclick={() => (level = option)}
									class={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
										level === option
											? 'border-purple-400 bg-purple-500/20 text-purple-200'
											: 'border-slate-700 bg-slate-800 text-slate-200 hover:border-purple-400/60'
									}`}
								>
									{option}
								</button>
							{/each}
						</div>
					</div>
				</div>
			</div>

			<div class="rounded-xl border border-slate-700/60 bg-slate-800/30 p-5">
				<p class="font-mono text-xs tracking-wide text-slate-400 uppercase">Live-Vorschau</p>
				<div
					class="mt-3 flex min-h-80 items-center justify-center rounded-lg border border-slate-700 bg-slate-950/70 p-4"
				>
					{#if !trimmedText}
						<p class="text-sm text-slate-400">Text eingeben, um einen QR-Code zu generieren</p>
					{:else if isGenerating}
						<p class="text-sm text-slate-400">Wird generiert...</p>
					{:else if outputFormat === 'svg' && svgString}
						<div class="max-w-full" style={`width: ${size}px; height: ${size}px;`}>
							{@html svgString}
						</div>
					{:else if outputFormat === 'png' && pngDataUrl}
						<img
							src={pngDataUrl}
							alt="Generierter QR-Code"
							class="h-auto max-w-full"
							style={`width: ${size}px;`}
						/>
					{:else if errorMessage}
						<p class="text-sm text-rose-300">{errorMessage}</p>
					{:else}
						<p class="text-sm text-slate-400">Keine Vorschau verfügbar</p>
					{/if}
				</div>

				<div class="mt-4 flex flex-wrap gap-3">
					<button
						type="button"
						onclick={downloadQr}
						disabled={!hasOutput}
						class="inline-flex rounded-full bg-purple-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors duration-200 hover:bg-purple-400 disabled:cursor-not-allowed disabled:bg-purple-400/40"
					>
						Download {outputFormat.toUpperCase()}
					</button>

					{#if outputFormat === 'svg'}
						<button
							type="button"
							onclick={copySvg}
							disabled={!svgString}
							class="inline-flex rounded-full border border-slate-700 bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-200 transition-colors duration-200 hover:border-purple-400/60 hover:text-purple-200 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{isCopied ? 'SVG kopiert' : 'SVG in Zwischenablage kopieren'}
						</button>
					{/if}
				</div>

				{#if encodedValue}
					<div
						class="mt-4 space-y-2 rounded-lg border border-slate-700 bg-slate-900/60 p-3 text-sm text-slate-300"
					>
						<p class="font-semibold text-slate-200">{statusMessage}</p>
						{#if shortUrl}
							<p class="font-mono text-xs break-all text-purple-200">{shortUrl}</p>
						{:else}
							<p class="text-slate-400">Klartext — nicht nachverfolgbar</p>
						{/if}
					</div>
				{/if}
			</div>
		</div>

		{#if errorMessage}
			<p role="alert" class="mt-4 text-sm text-rose-300">{errorMessage}</p>
		{/if}
	</div>

	<div class="mt-6">
		<LinkStats />
	</div>
</section>
