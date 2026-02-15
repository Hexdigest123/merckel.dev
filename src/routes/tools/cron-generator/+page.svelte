<script lang="ts">
	import { browser } from '$app/environment';
	import cronstrue from 'cronstrue';

	type FieldKey = 'minute' | 'hour' | 'dayOfMonth' | 'month' | 'dayOfWeek';
	type FieldMode = 'every' | 'specific' | 'range' | 'interval';

	interface FieldBounds {
		min: number;
		max: number;
	}

	interface CronFieldState {
		mode: FieldMode;
		specific: string;
		rangeStart: string;
		rangeEnd: string;
		interval: string;
	}

	const FIELD_BOUNDS: Record<FieldKey, FieldBounds> = {
		minute: { min: 0, max: 59 },
		hour: { min: 0, max: 23 },
		dayOfMonth: { min: 1, max: 31 },
		month: { min: 1, max: 12 },
		dayOfWeek: { min: 0, max: 6 }
	};

	const FIELD_CONFIG: Array<{ key: FieldKey; label: string }> = [
		{ key: 'minute', label: 'Minute' },
		{ key: 'hour', label: 'Stunde' },
		{ key: 'dayOfMonth', label: 'Tag des Monats' },
		{ key: 'month', label: 'Monat' },
		{ key: 'dayOfWeek', label: 'Wochentag' }
	];

	const FIELD_ORDER: FieldKey[] = ['minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'];

	const presets: Array<{ label: string; parts: [string, string, string, string, string] }> = [
		{ label: 'Jede Minute', parts: ['*', '*', '*', '*', '*'] },
		{ label: 'Jede Stunde', parts: ['0', '*', '*', '*', '*'] },
		{ label: 'Täglich um Mitternacht', parts: ['0', '0', '*', '*', '*'] },
		{ label: 'Wöchentlich am Montag', parts: ['0', '0', '*', '*', '1'] },
		{ label: 'Monatlich am 1.', parts: ['0', '0', '1', '*', '*'] }
	];

	let fields = $state<Record<FieldKey, CronFieldState>>({
		minute: { mode: 'every', specific: '0', rangeStart: '0', rangeEnd: '59', interval: '1' },
		hour: { mode: 'every', specific: '0', rangeStart: '0', rangeEnd: '23', interval: '1' },
		dayOfMonth: { mode: 'every', specific: '1', rangeStart: '1', rangeEnd: '31', interval: '1' },
		month: { mode: 'every', specific: '1', rangeStart: '1', rangeEnd: '12', interval: '1' },
		dayOfWeek: { mode: 'every', specific: '0', rangeStart: '0', rangeEnd: '6', interval: '1' }
	});

	let isCopied = $state(false);
	let hasInitializedTracking = false;

	function parseNumber(value: string, bounds: FieldBounds): number | null {
		const parsed = Number.parseInt(value, 10);
		if (Number.isNaN(parsed)) {
			return null;
		}

		if (parsed < bounds.min || parsed > bounds.max) {
			return null;
		}

		return parsed;
	}

	function buildFieldPart(state: CronFieldState, bounds: FieldBounds): string {
		if (state.mode === 'every') {
			return '*';
		}

		if (state.mode === 'specific') {
			const specificValue = parseNumber(state.specific, bounds);
			return specificValue === null ? '*' : String(specificValue);
		}

		if (state.mode === 'range') {
			const start = parseNumber(state.rangeStart, bounds);
			const end = parseNumber(state.rangeEnd, bounds);
			if (start === null || end === null) {
				return '*';
			}

			const rangeStart = Math.min(start, end);
			const rangeEnd = Math.max(start, end);
			return `${rangeStart}-${rangeEnd}`;
		}

		const interval = Number.parseInt(state.interval, 10);
		if (Number.isNaN(interval) || interval <= 0) {
			return '*';
		}

		return `*/${interval}`;
	}

	function parseFieldPart(part: string, bounds: FieldBounds): CronFieldState {
		if (part === '*') {
			return {
				mode: 'every',
				specific: String(bounds.min),
				rangeStart: String(bounds.min),
				rangeEnd: String(bounds.max),
				interval: '1'
			};
		}

		if (part.startsWith('*/')) {
			const interval = part.slice(2);
			return {
				mode: 'interval',
				specific: String(bounds.min),
				rangeStart: String(bounds.min),
				rangeEnd: String(bounds.max),
				interval
			};
		}

		if (part.includes('-')) {
			const [rangeStart, rangeEnd] = part.split('-');
			return {
				mode: 'range',
				specific: String(bounds.min),
				rangeStart,
				rangeEnd,
				interval: '1'
			};
		}

		return {
			mode: 'specific',
			specific: part,
			rangeStart: String(bounds.min),
			rangeEnd: String(bounds.max),
			interval: '1'
		};
	}

	function applyPreset(parts: [string, string, string, string, string]) {
		parts.forEach((part, index) => {
			const key = FIELD_ORDER[index];
			fields[key] = parseFieldPart(part, FIELD_BOUNDS[key]);
		});
	}

	async function copyExpression() {
		if (!browser) {
			return;
		}

		await navigator.clipboard.writeText(expression);
		isCopied = true;
		setTimeout(() => {
			isCopied = false;
		}, 1800);
	}

	const expression = $derived(
		FIELD_ORDER.map((key) => buildFieldPart(fields[key], FIELD_BOUNDS[key])).join(' ')
	);

	const description = $derived.by(() => {
		try {
			return cronstrue.toString(expression);
		} catch {
			return 'Ungültiger Ausdruck';
		}
	});

	$effect(() => {
		if (expression.length === 0) {
			return;
		}

		if (!browser) {
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
				body: JSON.stringify({ toolId: 'cron-generator' })
			}).catch(() => undefined);
		}, 2000);

		return () => {
			clearTimeout(timeout);
		};
	});
</script>

<section class="mx-auto w-full max-w-2xl space-y-8">
	<header class="space-y-3">
		<h1 class="font-sans text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl">
			Cron-Ausdruck Generator
		</h1>
		<p class="text-slate-400">Cron-Zeitpläne visuell erstellen mit lesbarer Ausgabe.</p>
	</header>

	<section class="rounded-2xl border border-slate-700 bg-slate-900/60 p-5 sm:p-6">
		<div class="grid gap-4">
			{#each FIELD_CONFIG as field (field.key)}
				<div class="grid gap-3 rounded-lg border border-slate-700/80 bg-slate-900/50 p-4">
					<label class="text-sm font-medium text-slate-200" for={`mode-${field.key}`}>
						{field.label}
					</label>
					<div class="grid gap-3 sm:grid-cols-[minmax(0,14rem),1fr]">
						<select
							id={`mode-${field.key}`}
							bind:value={fields[field.key].mode}
							class="w-full rounded-lg border border-slate-700 bg-slate-900/60 text-slate-200"
						>
							<option value="every">Jeder (*)</option>
							<option value="specific">Bestimmter Wert</option>
							<option value="range">Bereich</option>
							<option value="interval">Intervall (*/n)</option>
						</select>

						{#if fields[field.key].mode === 'specific'}
							<input
								type="number"
								min={FIELD_BOUNDS[field.key].min}
								max={FIELD_BOUNDS[field.key].max}
								bind:value={fields[field.key].specific}
								class="w-full rounded-lg border border-slate-700 bg-slate-900/60 text-slate-200"
							/>
						{:else if fields[field.key].mode === 'range'}
							<div class="grid grid-cols-[1fr,auto,1fr] items-center gap-2">
								<input
									type="number"
									min={FIELD_BOUNDS[field.key].min}
									max={FIELD_BOUNDS[field.key].max}
									bind:value={fields[field.key].rangeStart}
									class="w-full rounded-lg border border-slate-700 bg-slate-900/60 text-slate-200"
								/>
								<span class="text-center text-slate-500">bis</span>
								<input
									type="number"
									min={FIELD_BOUNDS[field.key].min}
									max={FIELD_BOUNDS[field.key].max}
									bind:value={fields[field.key].rangeEnd}
									class="w-full rounded-lg border border-slate-700 bg-slate-900/60 text-slate-200"
								/>
							</div>
						{:else if fields[field.key].mode === 'interval'}
							<div class="grid grid-cols-[auto,1fr] items-center gap-2">
								<span class="font-mono text-sm text-slate-400">*/</span>
								<input
									type="number"
									min="1"
									bind:value={fields[field.key].interval}
									class="w-full rounded-lg border border-slate-700 bg-slate-900/60 text-slate-200"
								/>
							</div>
						{:else}
							<p class="self-center text-sm text-slate-500">
								Verwendet Platzhalter für dieses Feld.
							</p>
						{/if}
					</div>
				</div>
			{/each}
		</div>

		<div class="mt-6 space-y-3 rounded-lg border border-slate-700/80 bg-slate-950/70 p-4">
			<p class="text-xs tracking-[0.16em] text-slate-400 uppercase">Cron-Ausdruck</p>
			<p class="font-mono text-lg text-purple-200">{expression}</p>
			<p class="text-sm text-slate-400">{description}</p>
			<button
				type="button"
				onclick={copyExpression}
				class="inline-flex items-center rounded-lg bg-purple-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-600"
			>
				{isCopied ? 'Kopiert' : 'Ausdruck kopieren'}
			</button>
		</div>
	</section>

	<section class="space-y-3">
		<h2 class="text-sm font-medium tracking-[0.14em] text-slate-300 uppercase">Schnellvorlagen</h2>
		<div class="flex flex-wrap gap-2">
			{#each presets as preset (preset.label)}
				<button
					type="button"
					onclick={() => applyPreset(preset.parts)}
					class="rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 transition hover:border-purple-400 hover:text-purple-200"
				>
					{preset.label}
				</button>
			{/each}
		</div>
	</section>
</section>
