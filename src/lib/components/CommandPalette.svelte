<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import {
		createCommandList,
		executeCommand,
		filterCommands,
		resolveCommandFromInput,
		type CommandPaletteSection
	} from '$lib/utils/command-palette';
	import { prefersReducedMotion } from '$lib/utils/gsap';
	import { useLocale } from '$lib/i18n/locale.svelte';

	const i18n = useLocale();

	let {
		sections,
		placeholder
	}: {
		sections: readonly CommandPaletteSection[];
		placeholder?: string;
	} = $props();

	let resolvedPlaceholder = $derived(placeholder ?? i18n.t('commandPlaceholder'));

	let isOpen = $state(false);
	let query = $state('');
	let selectedIndex = $state(0);
	let feedback = $state('');
	let inputElement = $state<HTMLInputElement | null>(null);

	let commands = $derived(createCommandList(sections));
	let filteredCommands = $derived(filterCommands(commands, query));
	let selectedCommand = $derived(filteredCommands[selectedIndex]);

	$effect(() => {
		if (selectedIndex > filteredCommands.length - 1) {
			selectedIndex = Math.max(filteredCommands.length - 1, 0);
		}
	});

	$effect(() => {
		if (!browser) {
			return;
		}

		const onKeyDown = (event: KeyboardEvent) => {
			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
				event.preventDefault();
				openPalette();
				return;
			}

			if (event.key === 'Escape' && isOpen) {
				event.preventDefault();
				closePalette();
			}
		};

		window.addEventListener('keydown', onKeyDown);

		return () => {
			window.removeEventListener('keydown', onKeyDown);
		};
	});

	$effect(() => {
		if (isOpen) {
			selectedIndex = 0;
			setTimeout(() => inputElement?.focus(), 0);
		}
	});

	function openPalette() {
		isOpen = true;
	}

	function closePalette() {
		isOpen = false;
		query = '';
		selectedIndex = 0;
		feedback = '';
	}

	function handleInputKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			if (filteredCommands.length === 0) {
				return;
			}

			selectedIndex = (selectedIndex + 1) % filteredCommands.length;
			return;
		}

		if (event.key === 'ArrowUp') {
			event.preventDefault();
			if (filteredCommands.length === 0) {
				return;
			}

			selectedIndex = (selectedIndex - 1 + filteredCommands.length) % filteredCommands.length;
			return;
		}

		if (event.key === 'Enter') {
			event.preventDefault();
			runCommand(resolveCommandFromInput(commands, query, selectedCommand));
		}
	}

	function handleInput(event: Event) {
		query = (event.currentTarget as HTMLInputElement).value;
		selectedIndex = 0;
	}

	function runCommand(command = selectedCommand) {
		if (!command || !browser) {
			feedback = i18n.t('commandMissing');
			return;
		}

		const result = executeCommand(command);

		if (result.navigateToUrl) {
			closePalette();
			void goto(result.navigateToUrl);
			return;
		}

		if (result.navigateToHash) {
			const target = document.getElementById(result.navigateToHash);
			if (target) {
				target.scrollIntoView({
					behavior: prefersReducedMotion() ? 'auto' : 'smooth',
					block: 'start'
				});
				window.history.replaceState(null, '', `#${result.navigateToHash}`);
				closePalette();
				return;
			}

			feedback = i18n.t('commandUnavailable', { id: result.navigateToHash });
			return;
		}

		feedback = result.message ? i18n.t('commandNoAction') : '';
	}

	function keyboardHint(): string {
		return browser && navigator.userAgent.includes('Mac') ? 'Cmd+K' : 'Ctrl+K';
	}
</script>

<button
	type="button"
	class="fixed top-4 right-4 z-30 hidden items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 font-mono text-xs tracking-wide text-slate-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500 sm:inline-flex"
	onclick={openPalette}
	aria-label={i18n.t('commandOpen')}
>
	<span>{i18n.t('command')}</span>
	<kbd class="rounded border border-slate-200 px-1.5 py-0.5 text-[11px] text-slate-500"
		>{keyboardHint()}</kbd
	>
</button>

{#if isOpen}
	<div
		class="fixed inset-0 z-40 flex items-start justify-center p-4 pt-[12vh] sm:p-6"
		role="presentation"
	>
		<button
			type="button"
			class="absolute inset-0 bg-slate-900/20"
			onclick={closePalette}
			aria-label={i18n.t('commandClose')}
		></button>
		<div
			role="dialog"
			aria-modal="true"
			aria-label={i18n.t('commandDialog')}
			class="relative z-10 w-full max-w-2xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
		>
			<div class="border-b border-slate-200 px-4 py-3 sm:px-5">
				<label for="command-palette-input" class="sr-only">{i18n.t('commandInput')}</label>
				<input
					bind:this={inputElement}
					id="command-palette-input"
					type="text"
					value={query}
					aria-label={i18n.t('commandInput')}
					placeholder={resolvedPlaceholder}
					autocomplete="off"
					class="w-full border-0 bg-transparent px-1 py-2 text-base text-slate-900 outline-none placeholder:text-slate-400"
					oninput={handleInput}
					onkeydown={handleInputKeydown}
				/>
			</div>

			<ul role="listbox" aria-label={i18n.t('commandResults')} class="max-h-80 overflow-y-auto py-2">
				{#if filteredCommands.length === 0}
					<li class="px-5 py-3 text-sm text-slate-500">{i18n.t('commandEmpty')}</li>
				{:else}
					{#each filteredCommands as command, index (command.id)}
						<li>
							<button
								type="button"
								role="option"
								aria-selected={index === selectedIndex}
								class={`flex w-full items-center justify-between px-5 py-3 text-left transition-colors duration-150 ${
									index === selectedIndex
										? 'bg-purple-50 text-slate-900'
										: 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
								}`}
								onmouseenter={() => (selectedIndex = index)}
								onclick={() => runCommand(command)}
							>
								<span>{command.label}</span>
								<span class="font-mono text-xs tracking-wide text-slate-400 uppercase">
									{{
										navigate: i18n.t('commandTypeSection'),
										'navigate-url': i18n.t('commandTypeTool')
									}[command.type]}
								</span>
							</button>
						</li>
					{/each}
				{/if}
			</ul>

			<div class="border-t border-slate-200 px-5 py-2 text-xs text-slate-500">
				<span class="font-mono text-slate-400">Enter</span>
				{i18n.t('commandHint')}
				<span class="font-mono text-slate-400">Esc</span>
				{i18n.t('commandHintClose')}
			</div>

			{#if feedback}
				<div class="border-t border-slate-200 bg-slate-50 px-5 py-3">
					<p role="status" aria-live="polite" class="font-mono text-xs text-purple-700">
						{feedback}
					</p>
				</div>
			{/if}
		</div>
	</div>
{/if}
