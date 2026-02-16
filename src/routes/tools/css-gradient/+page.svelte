<script lang="ts">
	import { browser } from '$app/environment';

	type GradientType = 'linear' | 'radial' | 'conic';

	interface ColorStop {
		id: string;
		color: string;
		position: number;
	}

	interface GradientPreset {
		label: string;
		type: GradientType;
		angle: number;
		stops: Array<{ color: string; position: number }>;
	}

	const TYPE_OPTIONS: Array<{ value: GradientType; label: string }> = [
		{ value: 'linear', label: 'Linear' },
		{ value: 'radial', label: 'Radial' },
		{ value: 'conic', label: 'Konisch' }
	];

	const PRESETS: GradientPreset[] = [
		{
			label: 'Sonnenuntergang',
			type: 'linear',
			angle: 135,
			stops: [
				{ color: '#f97316', position: 0 },
				{ color: '#ec4899', position: 50 },
				{ color: '#8b5cf6', position: 100 }
			]
		},
		{
			label: 'Ozean',
			type: 'linear',
			angle: 135,
			stops: [
				{ color: '#06b6d4', position: 0 },
				{ color: '#3b82f6', position: 100 }
			]
		},
		{
			label: 'Wald',
			type: 'linear',
			angle: 135,
			stops: [
				{ color: '#22c55e', position: 0 },
				{ color: '#14b8a6', position: 100 }
			]
		},
		{
			label: 'Nacht',
			type: 'linear',
			angle: 135,
			stops: [
				{ color: '#1e1b4b', position: 0 },
				{ color: '#312e81', position: 50 },
				{ color: '#4c1d95', position: 100 }
			]
		},
		{
			label: 'Flamme',
			type: 'linear',
			angle: 135,
			stops: [
				{ color: '#ef4444', position: 0 },
				{ color: '#f97316', position: 50 },
				{ color: '#eab308', position: 100 }
			]
		},
		{
			label: 'Aurora',
			type: 'conic',
			angle: 45,
			stops: [
				{ color: '#06b6d4', position: 0 },
				{ color: '#8b5cf6', position: 33 },
				{ color: '#ec4899', position: 66 },
				{ color: '#06b6d4', position: 100 }
			]
		}
	];

	let gradientType = $state<GradientType>('linear');
	let angle = $state(135);
	let stops = $state<ColorStop[]>([
		{ id: crypto.randomUUID(), color: '#8b5cf6', position: 0 },
		{ id: crypto.randomUUID(), color: '#06b6d4', position: 100 }
	]);
	let isCopied = $state(false);
	let hasInitializedTracking = false;

	function buildStopsString(sortedStops: ColorStop[]): string {
		return sortedStops.map((s) => `${s.color} ${s.position}%`).join(', ');
	}

	const cssValue = $derived.by(() => {
		const sortedStops = [...stops].sort((a, b) => a.position - b.position);
		const stopsString = buildStopsString(sortedStops);

		switch (gradientType) {
			case 'linear':
				return `linear-gradient(${angle}deg, ${stopsString})`;
			case 'radial':
				return `radial-gradient(circle, ${stopsString})`;
			case 'conic':
				return `conic-gradient(from ${angle}deg, ${stopsString})`;
		}
	});

	const showAngle = $derived(gradientType !== 'radial');

	function addStop() {
		const newPosition = 50;
		const newColor = '#a855f7';
		stops = [...stops, { id: crypto.randomUUID(), color: newColor, position: newPosition }];
	}

	function removeStop(id: string) {
		if (stops.length <= 2) return;
		stops = stops.filter((s) => s.id !== id);
	}

	function updateStopColor(id: string, color: string) {
		stops = stops.map((s) => (s.id === id ? { ...s, color } : s));
	}

	function updateStopPosition(id: string, position: number) {
		const clamped = Math.max(0, Math.min(100, position));
		stops = stops.map((s) => (s.id === id ? { ...s, position: clamped } : s));
	}

	function applyPreset(preset: GradientPreset) {
		gradientType = preset.type;
		angle = preset.angle;
		stops = preset.stops.map((s) => ({
			id: crypto.randomUUID(),
			color: s.color,
			position: s.position
		}));
	}

	function buildPresetCss(preset: GradientPreset): string {
		const stopsString = preset.stops.map((s) => `${s.color} ${s.position}%`).join(', ');
		switch (preset.type) {
			case 'linear':
				return `linear-gradient(${preset.angle}deg, ${stopsString})`;
			case 'radial':
				return `radial-gradient(circle, ${stopsString})`;
			case 'conic':
				return `conic-gradient(from ${preset.angle}deg, ${stopsString})`;
		}
	}

	async function copyCss() {
		if (!browser) return;

		await navigator.clipboard.writeText(`background: ${cssValue};`);
		isCopied = true;
		setTimeout(() => {
			isCopied = false;
		}, 1800);
	}

	$effect(() => {
		if (!cssValue || !browser) return;

		if (!hasInitializedTracking) {
			hasInitializedTracking = true;
			return;
		}

		const timeout = setTimeout(() => {
			void fetch('/api/tools/usage', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ toolId: 'css-gradient' })
			}).catch(() => undefined);
		}, 2000);

		return () => clearTimeout(timeout);
	});
</script>

<section class="mx-auto w-full max-w-2xl space-y-8">
	<header class="space-y-3">
		<h1 class="font-sans text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl">
			CSS-Verlauf Generator
		</h1>
		<p class="text-slate-400">
			CSS-Verläufe visuell erstellen mit Live-Vorschau und kopierfertigem Code.
		</p>
	</header>

	<section class="rounded-2xl border border-slate-700 bg-slate-900/60 p-5 sm:p-6">
		<div class="grid gap-5">
			<div class="space-y-2">
				<p class="text-sm font-medium text-slate-200">Verlaufstyp</p>
				<div class="flex flex-wrap gap-2">
					{#each TYPE_OPTIONS as option (option.value)}
						<button
							type="button"
							onclick={() => (gradientType = option.value)}
							class={`rounded-lg border px-3 py-2 text-sm transition ${
								gradientType === option.value
									? 'border-purple-400 bg-purple-500/20 text-purple-200'
									: 'border-slate-700 bg-slate-900/60 text-slate-200 hover:border-purple-400 hover:text-purple-200'
							}`}
						>
							{option.label}
						</button>
					{/each}
				</div>
			</div>

			{#if showAngle}
				<div class="space-y-2">
					<label class="text-sm font-medium text-slate-200" for="angle-slider">
						Winkel: {angle}°
					</label>
					<input
						id="angle-slider"
						type="range"
						min="0"
						max="360"
						step="1"
						bind:value={angle}
						class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-700 accent-purple-400"
					/>
				</div>
			{/if}

			<div class="space-y-3">
				<p class="text-sm font-medium text-slate-200">Farbstopps</p>
				{#each stops as stop (stop.id)}
					<div
						class="flex items-center gap-3 rounded-lg border border-slate-700/80 bg-slate-900/50 p-3"
					>
						<label class="relative cursor-pointer" for={`color-${stop.id}`}>
							<span
								class="block h-8 w-8 rounded-lg border border-slate-600"
								style="background-color: {stop.color};"
							></span>
							<input
								id={`color-${stop.id}`}
								type="color"
								value={stop.color}
								oninput={(e) => updateStopColor(stop.id, e.currentTarget.value)}
								class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
							/>
						</label>

						<input
							type="text"
							value={stop.color}
							oninput={(e) => updateStopColor(stop.id, e.currentTarget.value)}
							class="w-24 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 font-mono text-sm text-slate-200 focus:border-purple-400/80 focus:outline-none"
						/>

						<div class="flex items-center gap-1">
							<input
								type="number"
								min="0"
								max="100"
								value={stop.position}
								oninput={(e) => updateStopPosition(stop.id, Number(e.currentTarget.value))}
								class="w-20 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 focus:border-purple-400/80 focus:outline-none"
							/>
							<span class="text-sm text-slate-400">%</span>
						</div>

						{#if stops.length > 2}
							<button
								type="button"
								onclick={() => removeStop(stop.id)}
								class="ml-auto text-slate-400 transition hover:text-rose-300"
								aria-label="Farbstopp entfernen"
							>
								✕
							</button>
						{/if}
					</div>
				{/each}

				<button
					type="button"
					onclick={addStop}
					class="rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-purple-400 hover:text-purple-200"
				>
					Farbstopp hinzufügen
				</button>
			</div>
		</div>

		<div class="mt-6 space-y-3 rounded-lg border border-slate-700/80 bg-slate-950/70 p-4">
			<p class="text-xs tracking-[0.16em] text-slate-400 uppercase">Vorschau</p>
			<div class="h-40 w-full rounded-lg" style="background: {cssValue};"></div>
		</div>

		<div class="mt-4 space-y-3 rounded-lg border border-slate-700/80 bg-slate-950/70 p-4">
			<p class="text-xs tracking-[0.16em] text-slate-400 uppercase">CSS-Code</p>
			<p class="font-mono text-sm break-all text-purple-200">background: {cssValue};</p>
			<button
				type="button"
				onclick={copyCss}
				class="inline-flex items-center rounded-lg bg-purple-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-600"
			>
				{isCopied ? 'Kopiert' : 'CSS kopieren'}
			</button>
		</div>
	</section>

	<section class="space-y-3">
		<h2 class="text-sm font-medium tracking-[0.14em] text-slate-300 uppercase">Schnellvorlagen</h2>
		<div class="flex flex-wrap gap-2">
			{#each PRESETS as preset (preset.label)}
				<button
					type="button"
					onclick={() => applyPreset(preset)}
					class="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 transition hover:border-purple-400 hover:text-purple-200"
				>
					<span
						class="inline-block h-3 w-3 rounded-full"
						style="background: {buildPresetCss(preset)};"
					></span>
					{preset.label}
				</button>
			{/each}
		</div>
	</section>
</section>
