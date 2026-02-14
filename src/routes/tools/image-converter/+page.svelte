<script lang="ts">
	import { browser } from '$app/environment';

	type SupportedMime = 'image/png' | 'image/jpeg' | 'image/webp';

	const formatOptions: Array<{ mime: SupportedMime; label: string; extension: string }> = [
		{ mime: 'image/png', label: 'PNG', extension: 'png' },
		{ mime: 'image/jpeg', label: 'JPEG', extension: 'jpg' },
		{ mime: 'image/webp', label: 'WebP', extension: 'webp' }
	];

	let { data }: { data: { title: string } } = $props();

	let sourceFile = $state<File | null>(null);
	let sourcePreviewUrl = $state('');
	let sourceFormat = $state<SupportedMime>('image/png');
	let targetFormat = $state<SupportedMime>('image/jpeg');
	let quality = $state(0.9);
	let convertedBlob = $state<Blob | null>(null);
	let convertedPreviewUrl = $state('');
	let convertedFileName = $state('');
	let isConverting = $state(false);
	let isDragOver = $state(false);
	let errorMessage = $state('');
	let canvasElement = $state<HTMLCanvasElement | null>(null);

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
		errorMessage = '';
		convertedBlob = null;
		convertedFileName = '';
		if (convertedPreviewUrl) {
			URL.revokeObjectURL(convertedPreviewUrl);
			convertedPreviewUrl = '';
		}
	}

	function setSource(file: File) {
		if (!formatOptions.some((option) => option.mime === file.type)) {
			errorMessage = 'Bitte laden Sie ein PNG-, JPEG- oder WebP-Bild hoch.';
			return;
		}

		errorMessage = '';
		clearConverted();

		if (sourcePreviewUrl) {
			URL.revokeObjectURL(sourcePreviewUrl);
		}

		sourceFile = file;
		sourcePreviewUrl = URL.createObjectURL(file);
		sourceFormat = file.type as SupportedMime;

		if (targetFormat === sourceFormat) {
			const nextOption = formatOptions.find((option) => option.mime !== sourceFormat);
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
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		isDragOver = true;
	}

	function handleDragLeave(event: DragEvent) {
		event.preventDefault();
		isDragOver = false;
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragOver = false;
		const file = event.dataTransfer?.files?.[0];
		if (!file) return;
		setSource(file);
	}

	async function convertImage() {
		if (!browser || !sourceFile || !canvasElement || sourceFormat === targetFormat) {
			return;
		}

		const canvas = canvasElement;

		isConverting = true;
		errorMessage = '';

		const sourceObjectUrl = URL.createObjectURL(sourceFile);

		try {
			const image = await new Promise<HTMLImageElement>((resolve, reject) => {
				const img = new Image();
				img.onload = () => resolve(img);
				img.onerror = () => reject(new Error('load-failed'));
				img.src = sourceObjectUrl;
			});

			canvas.width = image.naturalWidth;
			canvas.height = image.naturalHeight;

			const context = canvas.getContext('2d');
			if (!context) {
				throw new Error('context-failed');
			}

			context.clearRect(0, 0, canvas.width, canvas.height);
			context.drawImage(image, 0, 0);

			const blob = await new Promise<Blob>((resolve, reject) => {
				const currentQuality = targetFormat === 'image/png' ? undefined : quality;
				canvas.toBlob(
					(result) => {
						if (!result) {
							reject(new Error('conversion-failed'));
							return;
						}
						resolve(result);
					},
					targetFormat,
					currentQuality
				);
			});

			clearConverted();
			convertedBlob = blob;
			convertedPreviewUrl = URL.createObjectURL(blob);

			const sourceName = sourceFile.name.replace(/\.[^.]+$/, '');
			const targetOption = formatOptions.find((option) => option.mime === targetFormat);
			convertedFileName = `${sourceName}.${targetOption?.extension ?? 'img'}`;

			await fetch('/api/tools/usage', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ toolId: 'image-converter' })
			}).catch(() => null);
		} catch {
			errorMessage = 'Konvertierung fehlgeschlagen. Bitte versuchen Sie ein anderes Bild.';
		} finally {
			URL.revokeObjectURL(sourceObjectUrl);
			isConverting = false;
		}
	}

	function getFormatLabel(mime: SupportedMime) {
		return formatOptions.find((option) => option.mime === mime)?.label ?? mime;
	}

	let sourceSize = $derived(sourceFile ? formatBytes(sourceFile.size) : '');
	let convertedSize = $derived(convertedBlob ? formatBytes(convertedBlob.size) : '');
</script>

<section class="mx-auto w-full max-w-3xl">
	<section class="rounded-2xl border border-slate-700/60 bg-slate-800/30 p-6 sm:p-8">
		<h1 class="text-3xl font-bold text-slate-100">{data.title}</h1>
		<p class="mt-2 text-base text-slate-300">
			Bilder zwischen PNG, JPG und WebP konvertieren — komplett im Browser.
		</p>

		<div class="mt-6 space-y-6">
			<label
				for="image-input"
				class={`block rounded-2xl border-2 border-dashed p-6 text-center transition-colors duration-200 ${
					isDragOver
						? 'border-purple-400 bg-purple-500/10'
						: 'border-slate-700 bg-slate-900/35 hover:border-purple-400/60'
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
				<p class="text-sm text-slate-300">Bild hierher ziehen oder klicken zum Hochladen</p>
				<p class="mt-1 font-mono text-xs tracking-wide text-slate-400 uppercase">PNG, JPEG, WebP</p>
			</label>

			{#if sourceFile}
				<div class="grid gap-4 md:grid-cols-2">
					<div class="rounded-xl border border-slate-700 bg-slate-900/55 p-4">
						<p class="font-mono text-xs tracking-wide text-slate-400 uppercase">Original</p>
						<img
							src={sourcePreviewUrl}
							alt="Vorschau des Uploads"
							class="mt-3 max-h-64 w-full rounded-lg border border-slate-700 object-contain"
						/>
						<p class="mt-3 text-sm text-slate-300">Format: {getFormatLabel(sourceFormat)}</p>
						<p class="text-sm text-slate-300">Size: {sourceSize}</p>
					</div>

					<div class="rounded-xl border border-slate-700 bg-slate-900/55 p-4">
						<p class="font-mono text-xs tracking-wide text-slate-400 uppercase">Konvertiert</p>
						{#if convertedPreviewUrl}
							<img
								src={convertedPreviewUrl}
								alt="Vorschau der Konvertierung"
								class="mt-3 max-h-64 w-full rounded-lg border border-slate-700 object-contain"
							/>
							<p class="mt-3 text-sm text-slate-300">Format: {getFormatLabel(targetFormat)}</p>
							<p class="text-sm text-slate-300">Size: {convertedSize}</p>
							<a
								href={convertedPreviewUrl}
								download={convertedFileName}
								data-cursor="link"
								class="mt-4 inline-flex rounded-full bg-purple-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors duration-200 hover:bg-purple-400"
							>
								Konvertiertes Bild herunterladen
							</a>
						{:else}
							<div
								class="mt-3 flex h-64 items-center justify-center rounded-lg border border-slate-700 text-sm text-slate-400"
							>
								Konvertierte Vorschau erscheint hier
							</div>
						{/if}
					</div>
				</div>

				<div class="space-y-4 rounded-xl border border-slate-700 bg-slate-900/55 p-4">
					<div>
						<p class="text-sm text-slate-300">Zielformat</p>
						<div class="mt-2 flex flex-wrap gap-2">
							{#each formatOptions as option (option.mime)}
								<button
									type="button"
									onclick={() => (targetFormat = option.mime)}
									disabled={sourceFormat === option.mime}
									data-cursor="link"
									class={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
										targetFormat === option.mime
											? 'border-purple-400 bg-purple-500/20 text-purple-200'
											: 'border-slate-700 bg-slate-800 text-slate-200 hover:border-purple-400/60'
									} disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-800/50 disabled:text-slate-500`}
								>
									{option.label}
								</button>
							{/each}
						</div>
					</div>

					{#if isQualityVisible}
						<label class="block space-y-2" for="quality-slider">
							<span class="text-sm text-slate-300">Qualität: {quality.toFixed(1)}</span>
							<input
								id="quality-slider"
								type="range"
								min="0.1"
								max="1"
								step="0.1"
								bind:value={quality}
								class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-700 accent-purple-400"
							/>
						</label>
					{/if}

					<button
						type="button"
						onclick={convertImage}
						disabled={!canConvert}
						data-cursor="link"
						class="inline-flex rounded-full bg-purple-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors duration-200 hover:bg-purple-400 disabled:cursor-not-allowed disabled:bg-purple-400/50"
					>
						{isConverting ? 'Konvertiere...' : 'Konvertieren'}
					</button>
				</div>
			{/if}

			{#if errorMessage}
				<p role="alert" class="text-sm text-rose-300">{errorMessage}</p>
			{/if}
		</div>

		<canvas bind:this={canvasElement} class="hidden" aria-hidden="true"></canvas>
	</section>
</section>
