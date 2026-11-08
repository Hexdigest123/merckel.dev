<script lang="ts">
	import cronstrue from 'cronstrue';
	import 'cronstrue/locales/de';
	import { untrack } from 'svelte';
	import ToolHeader from '$lib/components/tools/ToolHeader.svelte';
	import { useLocale } from '$lib/i18n/locale.svelte';
	import { CopyFeedback } from '$lib/utils/clipboard.svelte';
	import { trackToolUsage } from '$lib/utils/tool-usage';

	type FieldKey = 'minute' | 'hour' | 'dayOfMonth' | 'month' | 'dayOfWeek';
	type FieldMode = 'every' | 'specific' | 'range' | 'interval';
	type PresetId = 'everyMinute' | 'everyHour' | 'dailyMidnight' | 'weeklyMonday' | 'monthlyFirst';
	type CronParts = [string, string, string, string, string];

	interface FieldBounds {
		min: number;
		max: number;
	}

	/** `bind:value` on number inputs yields `null` while the field is empty. */
	interface CronFieldState {
		mode: FieldMode;
		specific: number | null;
		rangeStart: number | null;
		rangeEnd: number | null;
		interval: number | null;
	}

	const FIELD_BOUNDS: Record<FieldKey, FieldBounds> = {
		minute: { min: 0, max: 59 },
		hour: { min: 0, max: 23 },
		dayOfMonth: { min: 1, max: 31 },
		month: { min: 1, max: 12 },
		dayOfWeek: { min: 0, max: 6 }
	};

	const FIELD_ORDER: FieldKey[] = ['minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'];
	const MODES: FieldMode[] = ['every', 'specific', 'range', 'interval'];

	const PRESETS: Array<{ id: PresetId; parts: CronParts }> = [
		{ id: 'everyMinute', parts: ['*', '*', '*', '*', '*'] },
		{ id: 'everyHour', parts: ['0', '*', '*', '*', '*'] },
		{ id: 'dailyMidnight', parts: ['0', '0', '*', '*', '*'] },
		{ id: 'weeklyMonday', parts: ['0', '0', '*', '*', '1'] },
		{ id: 'monthlyFirst', parts: ['0', '0', '1', '*', '*'] }
	];

	const de = {
		fields: {
			minute: 'Minute',
			hour: 'Stunde',
			dayOfMonth: 'Tag des Monats',
			month: 'Monat',
			dayOfWeek: 'Wochentag (0 = Sonntag)'
		} satisfies Record<FieldKey, string>,
		modes: {
			every: 'Jeder (*)',
			specific: 'Bestimmter Wert',
			range: 'Bereich',
			interval: 'Intervall (*/n)'
		} satisfies Record<FieldMode, string>,
		value: 'Wert',
		from: 'von',
		to: 'bis',
		every: 'alle',
		wildcardHint: 'Verwendet Platzhalter für dieses Feld.',
		expression: 'Cron-Ausdruck',
		copyExpression: 'Ausdruck kopieren',
		invalidExpression: 'Ungültiger Ausdruck',
		presetsTitle: 'Schnellvorlagen',
		presets: {
			everyMinute: 'Jede Minute',
			everyHour: 'Jede Stunde',
			dailyMidnight: 'Täglich um Mitternacht',
			weeklyMonday: 'Wöchentlich am Montag',
			monthlyFirst: 'Monatlich am 1.'
		} satisfies Record<PresetId, string>
	};

	const en: typeof de = {
		fields: {
			minute: 'Minute',
			hour: 'Hour',
			dayOfMonth: 'Day of month',
			month: 'Month',
			dayOfWeek: 'Day of week (0 = Sunday)'
		},
		modes: {
			every: 'Every (*)',
			specific: 'Specific value',
			range: 'Range',
			interval: 'Interval (*/n)'
		},
		value: 'Value',
		from: 'from',
		to: 'to',
		every: 'every',
		wildcardHint: 'Uses a wildcard for this field.',
		expression: 'Cron expression',
		copyExpression: 'Copy expression',
		invalidExpression: 'Invalid expression',
		presetsTitle: 'Quick presets',
		presets: {
			everyMinute: 'Every minute',
			everyHour: 'Every hour',
			dailyMidnight: 'Daily at midnight',
			weeklyMonday: 'Weekly on Monday',
			monthlyFirst: 'Monthly on the 1st'
		}
	};

	const COPY = { de, en };

	const i18n = useLocale();
	const clipboard = new CopyFeedback();

	let t = $derived(COPY[i18n.current]);

	function defaultField(bounds: FieldBounds): CronFieldState {
		return {
			mode: 'every',
			specific: bounds.min,
			rangeStart: bounds.min,
			rangeEnd: bounds.max,
			interval: 1
		};
	}

	let fields = $state<Record<FieldKey, CronFieldState>>({
		minute: defaultField(FIELD_BOUNDS.minute),
		hour: defaultField(FIELD_BOUNDS.hour),
		dayOfMonth: defaultField(FIELD_BOUNDS.dayOfMonth),
		month: defaultField(FIELD_BOUNDS.month),
		dayOfWeek: defaultField(FIELD_BOUNDS.dayOfWeek)
	});
	let copyFailed = $state(false);

	/** Clamps a (possibly empty) number input into the field's range. */
	function clampValue(value: number | null, min: number, max: number, fallback: number): number {
		if (value === null || !Number.isFinite(value)) return fallback;
		return Math.min(max, Math.max(min, Math.trunc(value)));
	}

	function buildFieldPart(state: CronFieldState, bounds: FieldBounds): string {
		switch (state.mode) {
			case 'every':
				return '*';
			case 'specific':
				return String(clampValue(state.specific, bounds.min, bounds.max, bounds.min));
			case 'range': {
				const start = clampValue(state.rangeStart, bounds.min, bounds.max, bounds.min);
				const end = clampValue(state.rangeEnd, bounds.min, bounds.max, bounds.max);
				return `${Math.min(start, end)}-${Math.max(start, end)}`;
			}
			case 'interval': {
				const span = bounds.max - bounds.min + 1;
				return `*/${clampValue(state.interval, 1, span, 1)}`;
			}
		}
	}

	function parseFieldPart(part: string, bounds: FieldBounds): CronFieldState {
		const state = defaultField(bounds);

		if (part.startsWith('*/')) {
			return { ...state, mode: 'interval', interval: Number(part.slice(2)) };
		}

		if (part.includes('-')) {
			const [rangeStart, rangeEnd] = part.split('-').map(Number);
			return { ...state, mode: 'range', rangeStart, rangeEnd };
		}

		if (part !== '*') {
			return { ...state, mode: 'specific', specific: Number(part) };
		}

		return state;
	}

	function applyPreset(parts: CronParts) {
		parts.forEach((part, index) => {
			const key = FIELD_ORDER[index];
			fields[key] = parseFieldPart(part, FIELD_BOUNDS[key]);
		});
	}

	async function copyExpression() {
		copyFailed = !(await clipboard.copy(expression));
	}

	const expression = $derived(
		FIELD_ORDER.map((key) => buildFieldPart(fields[key], FIELD_BOUNDS[key])).join(' ')
	);

	const description = $derived.by(() => {
		try {
			return cronstrue.toString(expression, { locale: i18n.current });
		} catch {
			return t.invalidExpression;
		}
	});

	const initialExpression = untrack(() => expression);

	$effect(() => () => clipboard.dispose());

	$effect(() => {
		if (expression !== initialExpression) {
			trackToolUsage('cron-generator');
		}
	});
</script>

<section class="mx-auto w-full max-w-2xl space-y-8">
	<ToolHeader toolId="cron-generator" />

	<section class="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
		<div class="grid gap-4">
			{#each FIELD_ORDER as key (key)}
				{@const bounds = FIELD_BOUNDS[key]}
				{@const label = t.fields[key]}
				<div class="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
					<label class="text-sm font-medium text-slate-700" for={`mode-${key}`}>
						{label}
					</label>
					<div class="grid gap-3 sm:grid-cols-[minmax(0,14rem)_1fr]">
						<select
							id={`mode-${key}`}
							bind:value={fields[key].mode}
							class="w-full rounded-lg border border-slate-200 bg-white text-slate-700"
						>
							{#each MODES as mode (mode)}
								<option value={mode}>{t.modes[mode]}</option>
							{/each}
						</select>

						{#if fields[key].mode === 'specific'}
							<input
								type="number"
								min={bounds.min}
								max={bounds.max}
								bind:value={fields[key].specific}
								aria-label={`${label}: ${t.value}`}
								class="w-full rounded-lg border border-slate-200 bg-white text-slate-700"
							/>
						{:else if fields[key].mode === 'range'}
							<div class="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
								<input
									type="number"
									min={bounds.min}
									max={bounds.max}
									bind:value={fields[key].rangeStart}
									aria-label={`${label}: ${t.from}`}
									class="w-full rounded-lg border border-slate-200 bg-white text-slate-700"
								/>
								<span class="text-center text-slate-500" aria-hidden="true">{t.to}</span>
								<input
									type="number"
									min={bounds.min}
									max={bounds.max}
									bind:value={fields[key].rangeEnd}
									aria-label={`${label}: ${t.to}`}
									class="w-full rounded-lg border border-slate-200 bg-white text-slate-700"
								/>
							</div>
						{:else if fields[key].mode === 'interval'}
							<div class="grid grid-cols-[auto_1fr] items-center gap-2">
								<span class="font-mono text-sm text-slate-500" aria-hidden="true">*/</span>
								<input
									type="number"
									min="1"
									max={bounds.max - bounds.min + 1}
									bind:value={fields[key].interval}
									aria-label={`${label}: ${t.every} n`}
									class="w-full rounded-lg border border-slate-200 bg-white text-slate-700"
								/>
							</div>
						{:else}
							<p class="self-center text-sm text-slate-500">{t.wildcardHint}</p>
						{/if}
					</div>
				</div>
			{/each}
		</div>

		<div class="mt-6 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
			<h2 class="text-xs tracking-[0.16em] text-slate-500 uppercase">{t.expression}</h2>
			<p class="font-mono text-lg text-purple-700">{expression}</p>
			<p class="text-sm text-slate-600" aria-live="polite">{description}</p>
			<button
				type="button"
				onclick={copyExpression}
				class="inline-flex items-center rounded-lg bg-purple-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-600"
			>
				{clipboard.isCopied() ? i18n.t('copied') : t.copyExpression}
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
					onclick={() => applyPreset(preset.parts)}
					class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition hover:border-purple-400 hover:text-purple-700"
				>
					{t.presets[preset.id]}
				</button>
			{/each}
		</div>
	</section>
</section>
