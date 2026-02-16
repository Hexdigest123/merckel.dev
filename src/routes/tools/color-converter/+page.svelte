<script lang="ts">
	import { browser } from '$app/environment';

	type ChannelKey = 'r' | 'g' | 'b';

	interface RGB {
		r: number;
		g: number;
		b: number;
	}

	interface HSL {
		h: number;
		s: number;
		l: number;
	}

	interface HSV {
		h: number;
		s: number;
		v: number;
	}

	interface CMYK {
		c: number;
		m: number;
		y: number;
		k: number;
	}

	interface PaletteGroup {
		id: string;
		label: string;
		colors: string[];
	}

	const CHANNELS: ChannelKey[] = ['r', 'g', 'b'];

	let { data }: { data: { title: string } } = $props();

	let colorInput = $state('#8b5cf6');
	let currentRgb = $state<RGB>({ r: 139, g: 92, b: 246 });
	let parseError = $state('');
	let copiedKey = $state<string | null>(null);
	let hasInitializedTracking = false;

	function clamp(value: number, min: number, max: number): number {
		return Math.min(max, Math.max(min, value));
	}

	function normalizeHue(hue: number): number {
		return ((hue % 360) + 360) % 360;
	}

	function round(value: number): number {
		return Math.round(value);
	}

	function formatPercent(value: number): string {
		return `${round(value)}%`;
	}

	function componentToHex(value: number): string {
		return value.toString(16).padStart(2, '0');
	}

	function rgbToHex(rgb: RGB): string {
		return `#${componentToHex(rgb.r)}${componentToHex(rgb.g)}${componentToHex(rgb.b)}`.toUpperCase();
	}

	function hexToRgb(value: string): RGB | null {
		const normalized = value.trim().replace(/^#/, '');
		if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(normalized)) {
			return null;
		}

		const expanded =
			normalized.length === 3
				? normalized
						.split('')
						.map((char) => `${char}${char}`)
						.join('')
				: normalized;

		return {
			r: Number.parseInt(expanded.slice(0, 2), 16),
			g: Number.parseInt(expanded.slice(2, 4), 16),
			b: Number.parseInt(expanded.slice(4, 6), 16)
		};
	}

	function rgbToHsl(rgb: RGB): HSL {
		const r = rgb.r / 255;
		const g = rgb.g / 255;
		const b = rgb.b / 255;

		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		const delta = max - min;

		let hue = 0;
		if (delta !== 0) {
			if (max === r) {
				hue = 60 * (((g - b) / delta) % 6);
			} else if (max === g) {
				hue = 60 * ((b - r) / delta + 2);
			} else {
				hue = 60 * ((r - g) / delta + 4);
			}
		}

		const lightness = (max + min) / 2;
		const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));

		return {
			h: normalizeHue(hue),
			s: clamp(saturation * 100, 0, 100),
			l: clamp(lightness * 100, 0, 100)
		};
	}

	function hueToRgb(p: number, q: number, t: number): number {
		let wrapped = t;
		if (wrapped < 0) wrapped += 1;
		if (wrapped > 1) wrapped -= 1;

		if (wrapped < 1 / 6) return p + (q - p) * 6 * wrapped;
		if (wrapped < 1 / 2) return q;
		if (wrapped < 2 / 3) return p + (q - p) * (2 / 3 - wrapped) * 6;
		return p;
	}

	function hslToRgb(hsl: HSL): RGB {
		const hue = normalizeHue(hsl.h) / 360;
		const saturation = clamp(hsl.s, 0, 100) / 100;
		const lightness = clamp(hsl.l, 0, 100) / 100;

		if (saturation === 0) {
			const value = round(lightness * 255);
			return { r: value, g: value, b: value };
		}

		const q =
			lightness < 0.5
				? lightness * (1 + saturation)
				: lightness + saturation - lightness * saturation;
		const p = 2 * lightness - q;

		return {
			r: round(hueToRgb(p, q, hue + 1 / 3) * 255),
			g: round(hueToRgb(p, q, hue) * 255),
			b: round(hueToRgb(p, q, hue - 1 / 3) * 255)
		};
	}

	function rgbToHsv(rgb: RGB): HSV {
		const r = rgb.r / 255;
		const g = rgb.g / 255;
		const b = rgb.b / 255;

		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		const delta = max - min;

		let hue = 0;
		if (delta !== 0) {
			if (max === r) {
				hue = 60 * (((g - b) / delta) % 6);
			} else if (max === g) {
				hue = 60 * ((b - r) / delta + 2);
			} else {
				hue = 60 * ((r - g) / delta + 4);
			}
		}

		const saturation = max === 0 ? 0 : delta / max;

		return {
			h: normalizeHue(hue),
			s: clamp(saturation * 100, 0, 100),
			v: clamp(max * 100, 0, 100)
		};
	}

	function hsvToRgb(hsv: HSV): RGB {
		const h = normalizeHue(hsv.h);
		const s = clamp(hsv.s, 0, 100) / 100;
		const v = clamp(hsv.v, 0, 100) / 100;

		const chroma = v * s;
		const x = chroma * (1 - Math.abs(((h / 60) % 2) - 1));
		const m = v - chroma;

		let rPrime = 0;
		let gPrime = 0;
		let bPrime = 0;

		if (h < 60) {
			rPrime = chroma;
			gPrime = x;
		} else if (h < 120) {
			rPrime = x;
			gPrime = chroma;
		} else if (h < 180) {
			gPrime = chroma;
			bPrime = x;
		} else if (h < 240) {
			gPrime = x;
			bPrime = chroma;
		} else if (h < 300) {
			rPrime = x;
			bPrime = chroma;
		} else {
			rPrime = chroma;
			bPrime = x;
		}

		return {
			r: round((rPrime + m) * 255),
			g: round((gPrime + m) * 255),
			b: round((bPrime + m) * 255)
		};
	}

	function rgbToCmyk(rgb: RGB): CMYK {
		const r = rgb.r / 255;
		const g = rgb.g / 255;
		const b = rgb.b / 255;

		const k = 1 - Math.max(r, g, b);
		if (k >= 1) {
			return { c: 0, m: 0, y: 0, k: 100 };
		}

		const c = (1 - r - k) / (1 - k);
		const m = (1 - g - k) / (1 - k);
		const y = (1 - b - k) / (1 - k);

		return {
			c: clamp(c * 100, 0, 100),
			m: clamp(m * 100, 0, 100),
			y: clamp(y * 100, 0, 100),
			k: clamp(k * 100, 0, 100)
		};
	}

	function cmykToRgb(cmyk: CMYK): RGB {
		const c = clamp(cmyk.c, 0, 100) / 100;
		const m = clamp(cmyk.m, 0, 100) / 100;
		const y = clamp(cmyk.y, 0, 100) / 100;
		const k = clamp(cmyk.k, 0, 100) / 100;

		return {
			r: round(255 * (1 - c) * (1 - k)),
			g: round(255 * (1 - m) * (1 - k)),
			b: round(255 * (1 - y) * (1 - k))
		};
	}

	function parseComponent(value: string, min: number, max: number): number | null {
		const parsed = Number.parseFloat(value);
		if (Number.isNaN(parsed) || parsed < min || parsed > max) {
			return null;
		}
		return parsed;
	}

	function parseColor(value: string): RGB | null {
		const input = value.trim();
		if (input.length === 0) {
			return null;
		}

		const parsedHex = hexToRgb(input);
		if (parsedHex) {
			return parsedHex;
		}

		const rgbMatch = input.match(/^rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i);
		if (rgbMatch) {
			const r = Number.parseInt(rgbMatch[1], 10);
			const g = Number.parseInt(rgbMatch[2], 10);
			const b = Number.parseInt(rgbMatch[3], 10);
			if (r <= 255 && g <= 255 && b <= 255) {
				return { r, g, b };
			}
		}

		const hslMatch = input.match(
			/^hsl\s*\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)%?\s*,\s*(\d+(?:\.\d+)?)%?\s*\)$/i
		);
		if (hslMatch) {
			const h = parseComponent(hslMatch[1], -360000, 360000);
			const s = parseComponent(hslMatch[2], 0, 100);
			const l = parseComponent(hslMatch[3], 0, 100);
			if (h !== null && s !== null && l !== null) {
				return hslToRgb({ h, s, l });
			}
		}

		const hsvMatch = input.match(
			/^hsv\s*\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)%?\s*,\s*(\d+(?:\.\d+)?)%?\s*\)$/i
		);
		if (hsvMatch) {
			const h = parseComponent(hsvMatch[1], -360000, 360000);
			const s = parseComponent(hsvMatch[2], 0, 100);
			const v = parseComponent(hsvMatch[3], 0, 100);
			if (h !== null && s !== null && v !== null) {
				return hsvToRgb({ h, s, v });
			}
		}

		const cmykMatch = input.match(
			/^cmyk\s*\(\s*(\d+(?:\.\d+)?)%?\s*,\s*(\d+(?:\.\d+)?)%?\s*,\s*(\d+(?:\.\d+)?)%?\s*,\s*(\d+(?:\.\d+)?)%?\s*\)$/i
		);
		if (cmykMatch) {
			const c = parseComponent(cmykMatch[1], 0, 100);
			const m = parseComponent(cmykMatch[2], 0, 100);
			const y = parseComponent(cmykMatch[3], 0, 100);
			const k = parseComponent(cmykMatch[4], 0, 100);
			if (c !== null && m !== null && y !== null && k !== null) {
				return cmykToRgb({ c, m, y, k });
			}
		}

		return null;
	}

	function setChannel(channel: ChannelKey, value: string) {
		const parsed = Number.parseInt(value, 10);
		if (Number.isNaN(parsed)) {
			return;
		}

		const nextRgb = { ...currentRgb, [channel]: clamp(parsed, 0, 255) };
		currentRgb = nextRgb;
		colorInput = rgbToHex(nextRgb);
		parseError = '';
	}

	function buildPaletteGroup(base: HSL): PaletteGroup[] {
		const makeColor = (hue: number, saturation: number, lightness: number): string =>
			rgbToHex(hslToRgb({ h: hue, s: saturation, l: lightness }));

		return [
			{
				id: 'tones',
				label: 'Tonwerte',
				colors: [18, 34, 50, 66, 82].map((lightness) => makeColor(base.h, base.s, lightness))
			},
			{
				id: 'analogous',
				label: 'Analog',
				colors: [-42, -22, 0, 22, 42].map((offset) =>
					makeColor(base.h + offset, clamp(base.s, 28, 92), clamp(base.l, 22, 78))
				)
			},
			{
				id: 'complementary',
				label: 'Komplementaer',
				colors: [
					makeColor(base.h, clamp(base.s + 8, 20, 100), 28),
					makeColor(base.h, base.s, 46),
					makeColor(base.h, clamp(base.s, 12, 96), 64),
					makeColor(base.h + 180, clamp(base.s + 8, 20, 100), 44),
					makeColor(base.h + 180, clamp(base.s, 12, 96), 64)
				]
			},
			{
				id: 'triad',
				label: 'Triade',
				colors: [
					makeColor(base.h, clamp(base.s + 6, 18, 100), 48),
					makeColor(base.h + 120, clamp(base.s, 18, 100), 42),
					makeColor(base.h + 240, clamp(base.s, 18, 100), 42),
					makeColor(base.h + 120, clamp(base.s, 18, 100), 64),
					makeColor(base.h + 240, clamp(base.s, 18, 100), 64)
				]
			}
		];
	}

	async function copyValue(key: string, value: string) {
		if (!browser) {
			return;
		}

		await navigator.clipboard.writeText(value);
		copiedKey = key;
		setTimeout(() => {
			copiedKey = null;
		}, 1800);
	}

	$effect(() => {
		const parsed = parseColor(colorInput);
		if (!parsed) {
			parseError = 'Ungueltiges Format. Erlaubt: HEX, rgb(...), hsl(...), hsv(...), cmyk(...).';
			return;
		}

		parseError = '';
		currentRgb = parsed;
	});

	const hexValue = $derived(rgbToHex(currentRgb));
	const hslValueRaw = $derived(rgbToHsl(currentRgb));
	const hsvValueRaw = $derived(rgbToHsv(currentRgb));
	const cmykValueRaw = $derived(rgbToCmyk(currentRgb));

	const rgbValue = $derived(`rgb(${currentRgb.r}, ${currentRgb.g}, ${currentRgb.b})`);
	const hslValue = $derived(
		`hsl(${round(hslValueRaw.h)}, ${formatPercent(hslValueRaw.s)}, ${formatPercent(hslValueRaw.l)})`
	);
	const hsvValue = $derived(
		`hsv(${round(hsvValueRaw.h)}, ${formatPercent(hsvValueRaw.s)}, ${formatPercent(hsvValueRaw.v)})`
	);
	const cmykValue = $derived(
		`cmyk(${formatPercent(cmykValueRaw.c)}, ${formatPercent(cmykValueRaw.m)}, ${formatPercent(cmykValueRaw.y)}, ${formatPercent(cmykValueRaw.k)})`
	);

	const outputItems = $derived([
		{ id: 'hex', label: 'HEX', value: hexValue },
		{ id: 'rgb', label: 'RGB', value: rgbValue },
		{ id: 'hsl', label: 'HSL', value: hslValue },
		{ id: 'hsv', label: 'HSV', value: hsvValue },
		{ id: 'cmyk', label: 'CMYK', value: cmykValue }
	]);

	const paletteGroups = $derived(buildPaletteGroup(hslValueRaw));

	$effect(() => {
		if (!browser || parseError || hexValue.length === 0) {
			return;
		}

		if (!hasInitializedTracking) {
			hasInitializedTracking = true;
			return;
		}

		const timeout = setTimeout(() => {
			void fetch('/api/tools/usage', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ toolId: 'color-converter' })
			}).catch(() => undefined);
		}, 2000);

		return () => {
			clearTimeout(timeout);
		};
	});
</script>

<section class="mx-auto w-full max-w-3xl space-y-8">
	<header class="space-y-3">
		<h1 class="font-sans text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl">
			{data.title}
		</h1>
		<p class="text-slate-400">
			Farben zwischen HEX, RGB, HSL, HSV und CMYK konvertieren und passende Paletten erzeugen.
		</p>
	</header>

	<section class="rounded-2xl border border-slate-700 bg-slate-900/60 p-5 sm:p-6">
		<div class="grid gap-6 lg:grid-cols-[minmax(0,1fr),minmax(0,16rem)]">
			<div class="space-y-4">
				<label class="space-y-2" for="color-input">
					<span class="text-sm font-medium text-slate-200">Eingabe</span>
					<input
						id="color-input"
						type="text"
						bind:value={colorInput}
						placeholder="#8B5CF6 oder rgb(139, 92, 246)"
						class="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-2.5 font-mono text-sm text-slate-200 placeholder:text-slate-500 focus:border-purple-400/80 focus:ring-1 focus:ring-purple-400/30 focus:outline-none"
					/>
				</label>

				<div class="grid gap-3 sm:grid-cols-3">
					{#each CHANNELS as channel (channel)}
						<div class="space-y-2 rounded-lg border border-slate-700/80 bg-slate-900/50 p-3">
							<div class="flex items-center justify-between">
								<span class="text-xs font-medium tracking-[0.12em] text-slate-400 uppercase"
									>{channel}</span
								>
								<input
									type="number"
									min="0"
									max="255"
									value={currentRgb[channel]}
									oninput={(event) => setChannel(channel as ChannelKey, event.currentTarget.value)}
									class="w-18 rounded-md border border-slate-700 bg-slate-900/60 px-2 py-1 text-right font-mono text-sm text-slate-200 focus:border-purple-400/80 focus:outline-none"
								/>
							</div>
							<input
								type="range"
								min="0"
								max="255"
								value={currentRgb[channel]}
								oninput={(event) => setChannel(channel as ChannelKey, event.currentTarget.value)}
								class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-700 accent-purple-400"
							/>
						</div>
					{/each}
				</div>

				{#if parseError}
					<p
						class="rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200"
					>
						{parseError}
					</p>
				{/if}
			</div>

			<div class="space-y-3 rounded-xl border border-slate-700/80 bg-slate-950/70 p-4">
				<p class="text-xs tracking-[0.16em] text-slate-400 uppercase">Vorschau</p>
				<div
					class="h-36 w-full rounded-lg border border-slate-700/80"
					style="background-color: {hexValue};"
				></div>
				<div class="flex items-center gap-2">
					<input
						type="color"
						value={hexValue}
						oninput={(event) => (colorInput = event.currentTarget.value)}
						class="h-10 w-14 cursor-pointer rounded-md border border-slate-700 bg-transparent"
						aria-label="Farbwaehler"
					/>
					<button
						type="button"
						onclick={() => copyValue('preview-hex', hexValue)}
						class="flex-1 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-left font-mono text-sm text-slate-200 transition hover:border-purple-400 hover:text-purple-200"
					>
						{copiedKey === 'preview-hex' ? 'Kopiert' : hexValue}
					</button>
				</div>
			</div>
		</div>

		<div class="mt-6 grid gap-3">
			{#each outputItems as item (item.id)}
				<div
					class="flex items-center justify-between rounded-lg border border-slate-700/80 bg-slate-950/70 px-4 py-3"
				>
					<div class="min-w-0">
						<p class="text-xs tracking-[0.14em] text-slate-500 uppercase">{item.label}</p>
						<p class="truncate font-mono text-sm text-slate-200">{item.value}</p>
					</div>
					<button
						type="button"
						onclick={() => copyValue(item.id, item.value)}
						class="rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-purple-400 hover:text-purple-200"
					>
						{copiedKey === item.id ? 'Kopiert' : 'Kopieren'}
					</button>
				</div>
			{/each}
		</div>
	</section>

	<section class="space-y-4 rounded-2xl border border-slate-700 bg-slate-900/60 p-5 sm:p-6">
		<h2 class="text-sm font-medium tracking-[0.14em] text-slate-300 uppercase">
			Palette Generator
		</h2>
		<div class="grid gap-4">
			{#each paletteGroups as palette (palette.id)}
				<div class="space-y-2 rounded-lg border border-slate-700/80 bg-slate-950/70 p-4">
					<p class="text-xs tracking-[0.12em] text-slate-400 uppercase">{palette.label}</p>
					<div class="grid gap-2 sm:grid-cols-5">
						{#each palette.colors as color, index (`${palette.id}-${color}-${index}`)}
							<div class="space-y-2">
								<button
									type="button"
									onclick={() => (colorInput = color)}
									class="h-14 w-full rounded-md border border-slate-700/80 transition hover:scale-[1.02]"
									style="background-color: {color};"
									aria-label={`Farbe ${color} anwenden`}
								></button>
								<button
									type="button"
									onclick={() => copyValue(`${palette.id}-${index}`, color)}
									class="w-full rounded-md border border-slate-700 bg-slate-900/60 px-2 py-1 font-mono text-xs text-slate-200 transition hover:border-purple-400 hover:text-purple-200"
								>
									{copiedKey === `${palette.id}-${index}` ? 'Kopiert' : color}
								</button>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</section>
</section>
