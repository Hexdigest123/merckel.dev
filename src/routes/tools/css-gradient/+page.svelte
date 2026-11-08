<script lang="ts">
	import { untrack } from 'svelte';
	import ToolHeader from '$lib/components/tools/ToolHeader.svelte';
	import { useLocale } from '$lib/i18n/locale.svelte';
	import { CopyFeedback } from '$lib/utils/clipboard.svelte';
	import { trackToolUsage } from '$lib/utils/tool-usage';

	type GradientType = 'linear' | 'radial' | 'conic';
	type PresetId = 'sunset' | 'ocean' | 'forest' | 'night' | 'flame' | 'aurora';

	interface ColorStop {
		id: number;
		color: string;
		position: number;
	}

	interface GradientPreset {
		id: PresetId;
		type: GradientType;
		angle: number;
		stops: Array<{ color: string; position: number }>;
	}

	const TYPES: GradientType[] = ['linear', 'radial', 'conic'];

	const PRESETS: GradientPreset[] = [
		{
			id: 'sunset',
			type: 'linear',
			angle: 135,
			stops: [
				{ color: '#f97316', position: 0 },
				{ color: '#ec4899', position: 50 },
				{ color: '#8b5cf6', position: 100 }
			]
		},
		{
			id: 'ocean',
			type: 'linear',
			angle: 135,
			stops: [
				{ color: '#06b6d4', position: 0 },
				{ color: '#3b82f6', position: 100 }
			]
		},
		{
			id: 'forest',
			type: 'linear',
			angle: 135,
			stops: [
				{ color: '#22c55e', position: 0 },
				{ color: '#14b8a6', position: 100 }
			]
		},
		{
			id: 'night',
			type: 'linear',
			angle: 135,
			stops: [
				{ color: '#1e1b4b', position: 0 },
				{ color: '#312e81', position: 50 },
				{ color: '#4c1d95', position: 100 }
			]
		},
		{
			id: 'flame',
			type: 'linear',
			angle: 135,
			stops: [
				{ color: '#ef4444', position: 0 },
				{ color: '#f97316', position: 50 },
				{ color: '#eab308', position: 100 }
			]
		},
		{
			id: 'aurora',
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

	const de = {
		gradientType: 'Verlaufstyp',
		types: { linear: 'Linear', radial: 'Radial', conic: 'Konisch' } satisfies Record<
			GradientType,
			string
		>,
		angle: (degrees: number) => `Winkel: ${degrees}°`,
		colorStops: 'Farbstopps',
		stopColor: (index: number) => `Farbe von Stopp ${index}`,
		stopColorCode: (index: number) => `Farbcode von Stopp ${index}`,
		stopPosition: (index: number) => `Position von Stopp ${index} in Prozent`,
		removeStop: (index: number) => `Farbstopp ${index} entfernen`,
		addStop: 'Farbstopp hinzufügen',
		preview: 'Vorschau',
		cssCode: 'CSS-Code',
		copyCss: 'CSS kopieren',
		presetsTitle: 'Schnellvorlagen',
		presets: {
			sunset: 'Sonnenuntergang',
			ocean: 'Ozean',
			forest: 'Wald',
			night: 'Nacht',
			flame: 'Flamme',
			aurora: 'Aurora'
		} satisfies Record<PresetId, string>
	};

	const en: typeof de = {
		gradientType: 'Gradient type',
		types: { linear: 'Linear', radial: 'Radial', conic: 'Conic' },
		angle: (degrees: number) => `Angle: ${degrees}°`,
		colorStops: 'Color stops',
		stopColor: (index: number) => `Color of stop ${index}`,
		stopColorCode: (index: number) => `Color code of stop ${index}`,
		stopPosition: (index: number) => `Position of stop ${index} in percent`,
		removeStop: (index: number) => `Remove color stop ${index}`,
		addStop: 'Add color stop',
		preview: 'Preview',
		cssCode: 'CSS code',
		copyCss: 'Copy CSS',
		presetsTitle: 'Quick presets',
		presets: {
			sunset: 'Sunset',
			ocean: 'Ocean',
			forest: 'Forest',
			night: 'Night',
			flame: 'Flame',
			aurora: 'Aurora'
		}
	};

	const COPY = { de, en };

	const i18n = useLocale();
	const clipboard = new CopyFeedback();

	let t = $derived(COPY[i18n.current]);

	// A plain counter keeps ids identical between server render and hydration
	// (unlike crypto.randomUUID, which is also missing outside secure contexts).
	let nextStopId = 0;
	function createStop(color: string, position: number): ColorStop {
		nextStopId += 1;
		return { id: nextStopId, color, position };
	}

	let gradientType = $state<GradientType>('linear');
	let angle = $state(135);
	let stops = $state<ColorStop[]>([createStop('#8b5cf6', 0), createStop('#06b6d4', 100)]);
	let copyFailed = $state(false);

	function buildCss(
		type: GradientType,
		degrees: number,
		colorStops: Array<{ color: string; position: number }>
	): string {
		const stopsString = [...colorStops]
			.sort((a, b) => a.position - b.position)
			.map((stop) => `${stop.color} ${stop.position}%`)
			.join(', ');

		switch (type) {
			case 'linear':
				return `linear-gradient(${degrees}deg, ${stopsString})`;
			case 'radial':
				return `radial-gradient(circle, ${stopsString})`;
			case 'conic':
				return `conic-gradient(from ${degrees}deg, ${stopsString})`;
		}
	}

	const cssValue = $derived(buildCss(gradientType, angle, stops));
	const showAngle = $derived(gradientType !== 'radial');
	const initialCss = untrack(() => cssValue);

	$effect(() => () => clipboard.dispose());

	$effect(() => {
		if (cssValue !== initialCss) {
			trackToolUsage('css-gradient');
		}
	});

	function addStop() {
		stops = [...stops, createStop('#a855f7', 50)];
	}

	function removeStop(id: number) {
		if (stops.length <= 2) return;
		stops = stops.filter((s) => s.id !== id);
	}

	function updateStopColor(id: number, color: string) {
		stops = stops.map((s) => (s.id === id ? { ...s, color } : s));
	}

	function updateStopPosition(id: number, position: number) {
		const clamped = Number.isFinite(position) ? Math.max(0, Math.min(100, position)) : 0;
		stops = stops.map((s) => (s.id === id ? { ...s, position: clamped } : s));
	}

	function applyPreset(preset: GradientPreset) {
		gradientType = preset.type;
		angle = preset.angle;
		stops = preset.stops.map((s) => createStop(s.color, s.position));
	}

	/** `<input type="color">` only accepts `#rrggbb`, so expand `#rgb` and ignore anything else. */
	function toColorInputValue(color: string): string {
		const hex = color.trim().toLowerCase();
		if (/^#[0-9a-f]{6}$/.test(hex)) return hex;
		if (/^#[0-9a-f]{3}$/.test(hex)) {
			return `#${[...hex.slice(1)].map((char) => char + char).join('')}`;
		}
		return '#000000';
	}

	async function copyCss() {
		copyFailed = !(await clipboard.copy(`background: ${cssValue};`));
	}
</script>

<section class="mx-auto w-full max-w-2xl space-y-8">
	<ToolHeader toolId="css-gradient" />

	<section class="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
		<div class="grid gap-5">
			<div class="space-y-2">
				<p class="text-sm font-medium text-slate-700" id="gradient-type-label">
					{t.gradientType}
				</p>
				<div class="flex flex-wrap gap-2" role="group" aria-labelledby="gradient-type-label">
					{#each TYPES as type (type)}
						<button
							type="button"
							aria-pressed={gradientType === type}
							onclick={() => (gradientType = type)}
							class={`rounded-lg border px-3 py-2 text-sm transition ${
								gradientType === type
									? 'border-purple-400 bg-purple-500/20 text-purple-700'
									: 'border-slate-200 bg-white text-slate-700 hover:border-purple-400 hover:text-purple-700'
							}`}
						>
							{t.types[type]}
						</button>
					{/each}
				</div>
			</div>

			{#if showAngle}
				<div class="space-y-2">
					<label class="text-sm font-medium text-slate-700" for="angle-slider">
						{t.angle(angle)}
					</label>
					<input
						id="angle-slider"
						type="range"
						min="0"
						max="360"
						step="1"
						bind:value={angle}
						class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-purple-500"
					/>
				</div>
			{/if}

			<div class="space-y-3">
				<p class="text-sm font-medium text-slate-700">{t.colorStops}</p>
				{#each stops as stop, index (stop.id)}
					<div class="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
						<label class="relative cursor-pointer" for={`color-${stop.id}`}>
							<span class="sr-only">{t.stopColor(index + 1)}</span>
							<span
								class="block h-8 w-8 rounded-lg border border-slate-300"
								style="background-color: {stop.color};"
								aria-hidden="true"
							></span>
							<input
								id={`color-${stop.id}`}
								type="color"
								value={toColorInputValue(stop.color)}
								oninput={(e) => updateStopColor(stop.id, e.currentTarget.value)}
								class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
							/>
						</label>

						<input
							type="text"
							value={stop.color}
							aria-label={t.stopColorCode(index + 1)}
							spellcheck="false"
							oninput={(e) => updateStopColor(stop.id, e.currentTarget.value)}
							class="w-24 rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-700 focus:border-purple-400/80 focus:outline-none"
						/>

						<div class="flex items-center gap-1">
							<input
								type="number"
								min="0"
								max="100"
								value={stop.position}
								aria-label={t.stopPosition(index + 1)}
								oninput={(e) => updateStopPosition(stop.id, e.currentTarget.valueAsNumber)}
								class="w-20 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-purple-400/80 focus:outline-none"
							/>
							<span class="text-sm text-slate-500" aria-hidden="true">%</span>
						</div>

						{#if stops.length > 2}
							<button
								type="button"
								onclick={() => removeStop(stop.id)}
								class="ml-auto text-slate-500 transition hover:text-rose-600"
								aria-label={t.removeStop(index + 1)}
							>
								<span aria-hidden="true">✕</span>
							</button>
						{/if}
					</div>
				{/each}

				<button
					type="button"
					onclick={addStop}
					class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-purple-400 hover:text-purple-700"
				>
					{t.addStop}
				</button>
			</div>
		</div>

		<div class="mt-6 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
			<h2 class="text-xs tracking-[0.16em] text-slate-500 uppercase">{t.preview}</h2>
			<div class="h-40 w-full rounded-lg" style="background: {cssValue};"></div>
		</div>

		<div class="mt-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
			<h2 class="text-xs tracking-[0.16em] text-slate-500 uppercase">{t.cssCode}</h2>
			<p class="font-mono text-sm break-all text-purple-700">background: {cssValue};</p>
			<button
				type="button"
				onclick={copyCss}
				class="inline-flex items-center rounded-lg bg-purple-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-600"
			>
				{clipboard.isCopied() ? i18n.t('copied') : t.copyCss}
			</button>
			{#if copyFailed}
				<p role="alert" class="text-sm text-rose-600">{i18n.t('clipboardFailed')}</p>
			{/if}
		</div>
	</section>

	<section class="space-y-3">
		<h2 class="text-sm font-medium tracking-[0.14em] text-slate-600 uppercase">
			{t.presetsTitle}
		</h2>
		<div class="flex flex-wrap gap-2">
			{#each PRESETS as preset (preset.id)}
				<button
					type="button"
					onclick={() => applyPreset(preset)}
					class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition hover:border-purple-400 hover:text-purple-700"
				>
					<span
						class="inline-block h-3 w-3 rounded-full"
						style="background: {buildCss(preset.type, preset.angle, preset.stops)};"
						aria-hidden="true"
					></span>
					{t.presets[preset.id]}
				</button>
			{/each}
		</div>
	</section>
</section>
