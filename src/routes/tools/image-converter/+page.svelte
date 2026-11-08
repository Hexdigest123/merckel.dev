<script lang="ts">
	import { getLocalizedTool } from '$lib/i18n/content';
	import { useLocale } from '$lib/i18n/locale.svelte';
	import { trackToolUsage } from '$lib/utils/tool-usage';

	type SupportedMime = 'image/png' | 'image/jpeg' | 'image/webp';

	const FORMAT_OPTIONS: Array<{ mime: SupportedMime; label: string; extension: string }> = [
		{ mime: 'image/png', label: 'PNG', extension: 'png' },
		{ mime: 'image/jpeg', label: 'JPEG', extension: 'jpg' },
		{ mime: 'image/webp', label: 'WebP', extension: 'webp' }
	];

	const de = {
		unsupported: 'Bitte laden Sie ein PNG-, JPEG- oder WebP-Bild hoch.',
		failed: 'Konvertierung fehlgeschlagen. Bitte versuchen Sie ein anderes Bild.',
		dropzone: 'Bild hierher ziehen oder klicken zum Hochladen',
		original: 'Original',
		converted: 'Konvertiert',
		originalAlt: 'Vorschau des hochgeladenen Bildes',
		convertedAlt: 'Vorschau des konvertierten Bildes',
		format: 'Format',
		size: 'Größe',
		download: 'Konvertiertes Bild herunterladen',
		convertedPlaceholder: 'Konvertierte Vorschau erscheint hier',
		targetFormat: 'Zielformat',
		quality: 'Qualität',
		convert: 'Konvertieren',
		converting: 'Konvertiere…'
	};

	const en: typeof de = {
		unsupported: 'Please upload a PNG, JPEG or WebP image.',
		failed: 'Conversion failed. Please try a different image.',
		dropzone: 'Drag an image here or click to upload',
		original: 'Original',
		converted: 'Converted',
		originalAlt: 'Preview of the uploaded image',
		convertedAlt: 'Preview of the converted image',
		format: 'Format',
		size: 'Size',
		download: 'Download converted image',
		convertedPlaceholder: 'The converted preview appears here',
		targetFormat: 'Target format',
		quality: 'Quality',
		convert: 'Convert',
		converting: 'Converting…'
	};

	const COPY = { de, en };

	const i18n = useLocale();

	let t = $derived(COPY[i18n.current]);
	let tool = $derived(getLocalizedTool(i18n, 'image-converter'));

	let sourceFile = $state<File | null>(null);
	let sourcePreviewUrl = $state('');
	let sourceFormat = $state<SupportedMime>('image/png');
	let targetFormat = $state<SupportedMime>('image/jpeg');
	let quality = $state(0.9);
	let convertedBlob = $state<Blob | null>(null);
	let convertedFormat = $state<SupportedMime | null>(null);
	let convertedPreviewUrl = $state('');
	let convertedFileName = $state('');
	let isConverting = $state(false);
	let isDragOver = $state(false);
	let errorMessage = $state<'unsupported' | 'failed' | null>(null);

	let isQualityVisible = $derived(targetFormat === 'image/jpeg' || targetFormat === 'image/webp');
	let canConvert = $derived(Boolean(sourceFile) && sourceFormat !== targetFormat && !isConverting);

	$effect(() => {
		return () => {
			if (sourcePreviewUrl) {
				URL.revokeObjectURL(sourcePreviewUrl);
			}
			if (convertedPreviewUrl) {
				URL.revokeObjectURL(convertedPreviewUrl);
			}
		};
	});

	function formatBytes(bytes: number) {
		if (bytes < 1024) return `${bytes} B`;
		const units = ['KB', 'MB', 'GB'];
		let size = bytes / 1024;
		let unitIndex = 0;

		while (size >= 1024 && unitIndex < units.length - 1) {
			size /= 1024;
			unitIndex += 1;
		}

		return `${size.toFixed(2)} ${units[unitIndex]}`;
	}

	function clearConverted() {
		errorMessage = null;
		convertedBlob = null;
		convertedFormat = null;
		convertedFileName = '';
		if (convertedPreviewUrl) {
			URL.revokeObjectURL(convertedPreviewUrl);
			convertedPreviewUrl = '';
		}
	}

	function setSource(file: File) {
		if (!FORMAT_OPTIONS.some((option) => option.mime === file.type)) {
			errorMessage = 'unsupported';
			return;
		}

		clearConverted();

		if (sourcePreviewUrl) {
			URL.revokeObjectURL(sourcePreviewUrl);
		}

		sourceFile = file;
		sourcePreviewUrl = URL.createObjectURL(file);
		sourceFormat = file.type as SupportedMime;

		if (targetFormat === sourceFormat) {
			const nextOption = FORMAT_OPTIONS.find((option) => option.mime !== sourceFormat);
			if (nextOption) {
				targetFormat = nextOption.mime;
			}
		}
	}

	function handleFileInput(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		setSource(file);
		// Allow selecting the same file again later.
		input.value = '';
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		isDragOver = true;
	}

	function handleDragLeave(event: DragEvent) {
		event.preventDefault();
		// Moving over child elements also fires dragleave on the drop zone.
		const target = event.currentTarget as HTMLElement;
		if (!target.contains(event.relatedTarget as Node | null)) {
			isDragOver = false;
		}
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragOver = false;
		const file = event.dataTransfer?.files?.[0];
		if (!file) return;
		setSource(file);
	}

	function loadImage(url: string): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => resolve(img);
			img.onerror = () => reject(new Error('load-failed'));
			img.src = url;
		});
	}

	async function convertImage() {
		if (!sourceFile || sourceFormat === targetFormat) {
			return;
		}

		const format = targetFormat;
		isConverting = true;
		errorMessage = null;

		const sourceObjectUrl = URL.createObjectURL(sourceFile);

		try {
			const image = await loadImage(sourceObjectUrl);
			const canvas = document.createElement('canvas');
			canvas.width = image.naturalWidth;
			canvas.height = image.naturalHeight;

			const context = canvas.getContext('2d');
			if (!context) {
				throw new Error('context-failed');
			}

			if (format === 'image/jpeg') {
				// JPEG has no alpha channel; without a background, transparent pixels turn black.
				context.fillStyle = '#ffffff';
				context.fillRect(0, 0, canvas.width, canvas.height);
			}
			context.drawImage(image, 0, 0);

			const blob = await new Promise<Blob>((resolve, reject) => {
				canvas.toBlob(
					(result) => (result ? resolve(result) : reject(new Error('conversion-failed'))),
					format,
					format === 'image/png' ? undefined : quality
				);
			});

			clearConverted();
			convertedBlob = blob;
			convertedFormat = format;
			convertedPreviewUrl = URL.createObjectURL(blob);

			const sourceName = sourceFile.name.replace(/\.[^.]+$/, '');
			const targetOption = FORMAT_OPTIONS.find((option) => option.mime === format);
			convertedFileName = `${sourceName}.${targetOption?.extension ?? 'img'}`;

			trackToolUsage('image-converter');
		} catch {
			errorMessage = 'failed';
		} finally {
			URL.revokeObjectURL(sourceObjectUrl);
			isConverting = false;
		}
	}

	function getFormatLabel(mime: SupportedMime) {
		return FORMAT_OPTIONS.find((option) => option.mime === mime)?.label ?? mime;
	}

	let sourceSize = $derived(sourceFile ? formatBytes(sourceFile.size) : '');
	let convertedSize = $derived(convertedBlob ? formatBytes(convertedBlob.size) : '');
</script>

<section class="mx-auto w-full max-w-3xl">
	<section class="rounded-lg border border-slate-200 bg-white p-6 sm:p-8">
		<h1 class="text-3xl font-bold text-slate-900">{tool.name}</h1>
		<p class="mt-2 text-base text-slate-600">{tool.description}</p>

		<div class="mt-6 space-y-6">
			<label
				for="image-input"
				class={`block cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors duration-200 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-purple-500 ${
					isDragOver
						? 'border-purple-400 bg-purple-500/10'
						: 'border-slate-200 bg-slate-50 hover:border-purple-400/60'
				}`}
				ondragover={handleDragOver}
				ondragleave={handleDragLeave}
				ondrop={handleDrop}
			>
				<input
					id="image-input"
					type="file"
					accept="image/png,image/jpeg,image/webp"
					onchange={handleFileInput}
					class="sr-only"
				/>
				<p class="text-sm text-slate-600">{t.dropzone}</p>
				<p class="mt-1 font-mono text-xs tracking-wide text-slate-500 uppercase">PNG, JPEG, WebP</p>
			</label>

			{#if sourceFile}
				<div class="grid gap-4 md:grid-cols-2">
					<div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
						<h2 class="font-mono text-xs tracking-wide text-slate-500 uppercase">{t.original}</h2>
						<img
							src={sourcePreviewUrl}
							alt={t.originalAlt}
							class="mt-3 max-h-64 w-full rounded-lg border border-slate-200 object-contain"
						/>
						<p class="mt-3 text-sm text-slate-600">{t.format}: {getFormatLabel(sourceFormat)}</p>
						<p class="text-sm text-slate-600">{t.size}: {sourceSize}</p>
					</div>

					<div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
						<h2 class="font-mono text-xs tracking-wide text-slate-500 uppercase">{t.converted}</h2>
						{#if convertedPreviewUrl && convertedFormat}
							<img
								src={convertedPreviewUrl}
								alt={t.convertedAlt}
								class="mt-3 max-h-64 w-full rounded-lg border border-slate-200 object-contain"
							/>
							<p class="mt-3 text-sm text-slate-600">
								{t.format}: {getFormatLabel(convertedFormat)}
							</p>
							<p class="text-sm text-slate-600">{t.size}: {convertedSize}</p>
							<!-- eslint-disable svelte/no-navigation-without-resolve -- local blob: download link -->
							<a
								href={convertedPreviewUrl}
								download={convertedFileName}
								class="mt-4 inline-flex rounded-md bg-purple-500 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-purple-600"
							>
								{t.download}
							</a>
							<!-- eslint-enable svelte/no-navigation-without-resolve -->
						{:else}
							<div
								class="mt-3 flex h-64 items-center justify-center rounded-lg border border-slate-200 text-sm text-slate-500"
							>
								{t.convertedPlaceholder}
							</div>
						{/if}
					</div>
				</div>

				<div class="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
					<div>
						<p class="text-sm text-slate-600" id="target-format-label">{t.targetFormat}</p>
						<div
							class="mt-2 flex flex-wrap gap-2"
							role="group"
							aria-labelledby="target-format-label"
						>
							{#each FORMAT_OPTIONS as option (option.mime)}
								<button
									type="button"
									onclick={() => (targetFormat = option.mime)}
									disabled={sourceFormat === option.mime}
									aria-pressed={targetFormat === option.mime}
									class={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
										targetFormat === option.mime
											? 'border-purple-400 bg-purple-500/20 text-purple-700'
											: 'border-slate-200 bg-white text-slate-700 hover:border-purple-400/60'
									} disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-500`}
								>
									{option.label}
								</button>
							{/each}
						</div>
					</div>

					{#if isQualityVisible}
						<label class="block space-y-2" for="quality-slider">
							<span class="text-sm text-slate-600">{t.quality}: {quality.toFixed(1)}</span>
							<input
								id="quality-slider"
								type="range"
								min="0.1"
								max="1"
								step="0.1"
								bind:value={quality}
								class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-purple-500"
							/>
						</label>
					{/if}

					<button
						type="button"
						onclick={convertImage}
						disabled={!canConvert}
						class="inline-flex rounded-md bg-purple-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-purple-600 disabled:cursor-not-allowed disabled:bg-purple-400/50"
					>
						{isConverting ? t.converting : t.convert}
					</button>
				</div>
			{/if}

			{#if errorMessage}
				<p role="alert" class="text-sm text-rose-600">{t[errorMessage]}</p>
			{/if}
		</div>
	</section>
</section>
