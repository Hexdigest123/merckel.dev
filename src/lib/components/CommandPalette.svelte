<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { tick } from 'svelte';
	import { webTools } from '$lib/data/web-tools';
	import { localizeTool } from '$lib/i18n/content';
	import { useLocale } from '$lib/i18n/locale.svelte';
	import {
		createCommandList,
		executeCommand,
		filterCommands,
		resolveCommandFromInput,
		type CommandPaletteCommand,
		type CommandPaletteSection
	} from '$lib/utils/command-palette';
	import { preferredScrollBehavior } from '$lib/utils/motion';

	const i18n = useLocale();
	const LISTBOX_ID = 'command-palette-results';

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
	let shortcutLabel = $state('Ctrl+K');
	let previouslyFocused: HTMLElement | null = null;

	let tools = $derived(webTools.map((tool) => localizeTool(i18n, tool)));
	let commands = $derived(createCommandList(sections, tools));
	let filteredCommands = $derived(filterCommands(commands, query));
	let selectedCommand = $derived(filteredCommands[selectedIndex]);

	$effect(() => {
		if (selectedIndex > filteredCommands.length - 1) {
			selectedIndex = Math.max(filteredCommands.length - 1, 0);
		}
	});

	$effect(() => {
		// The server cannot know the platform, so the label is only adjusted after hydration.
		if (/Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent)) {
			shortcutLabel = 'Cmd+K';
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

	function optionId(command: CommandPaletteCommand): string {
		return `command-option-${command.id}`;
	}

	async function openPalette() {
		if (isOpen) {
			inputElement?.focus();
			return;
		}

		previouslyFocused =
			document.activeElement instanceof HTMLElement ? document.activeElement : null;
		isOpen = true;
		selectedIndex = 0;
		await tick();
		inputElement?.focus();
	}

	function closePalette({ restoreFocus = true } = {}) {
		isOpen = false;
		query = '';
		selectedIndex = 0;
		feedback = '';

		if (restoreFocus && previouslyFocused?.isConnected) {
			previouslyFocused.focus();
		}
		previouslyFocused = null;
	}

	function handleInputKeydown(event: KeyboardEvent) {
		if (event.key === 'Tab') {
			// The input is the only focusable element of the modal dialog.
			event.preventDefault();
			return;
		}

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
		feedback = '';
	}

	function runCommand(command = selectedCommand) {
		if (!command || !browser) {
			feedback = i18n.t('commandMissing');
			return;
		}

		const result = executeCommand(command);

		if (result.navigateToUrl) {
			closePalette({ restoreFocus: false });
			void goto(resolve(result.navigateToUrl));
			return;
		}

		if (result.navigateToHash) {
			const hash = result.navigateToHash;
			const target = document.getElementById(hash);
			closePalette({ restoreFocus: false });

			if (!target) {
				// Sections live on the home page.
				void goto(resolve(`/#${hash}`));
				return;
			}

			if (window.location.hash === `#${hash}`) {
				target.scrollIntoView({ behavior: preferredScrollBehavior(), block: 'start' });
			} else {
				// A regular fragment navigation keeps SvelteKit's history state intact.
				window.location.hash = hash;
			}
			return;
		}

		feedback = result.message ? i18n.t('commandNoAction') : '';
	}
</script>

<button
	type="button"
	class="fixed top-4 right-4 z-30 hidden items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 font-mono text-xs tracking-wide text-slate-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500 sm:inline-flex"
	onclick={openPalette}
	aria-label={i18n.t('commandOpen')}
	aria-haspopup="dialog"
	aria-keyshortcuts="Control+K Meta+K"
>
	<span>{i18n.t('command')}</span>
	<kbd class="rounded border border-slate-200 px-1.5 py-0.5 text-[11px] text-slate-500"
		>{shortcutLabel}</kbd
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
			onclick={() => closePalette()}
			aria-label={i18n.t('commandClose')}
			tabindex="-1"
		></button>
		<div
			role="dialog"
			aria-modal="true"
			aria-label={i18n.t('commandDialog')}
			class="relative z-10 w-full max-w-2xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
		>
			<div class="border-b border-slate-200 px-4 py-3 sm:px-5">
				<input
					bind:this={inputElement}
					id="command-palette-input"
					type="text"
					role="combobox"
					value={query}
					aria-label={i18n.t('commandInput')}
					aria-expanded="true"
					aria-controls={LISTBOX_ID}
					aria-autocomplete="list"
					aria-activedescendant={selectedCommand ? optionId(selectedCommand) : undefined}
					placeholder={resolvedPlaceholder}
					autocomplete="off"
					spellcheck="false"
					class="w-full border-0 bg-transparent px-1 py-2 text-base text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0"
					oninput={handleInput}
					onkeydown={handleInputKeydown}
				/>
			</div>

			<ul
				id={LISTBOX_ID}
				role="listbox"
				aria-label={i18n.t('commandResults')}
				class="max-h-80 overflow-y-auto py-2"
			>
				{#each filteredCommands as command, index (command.id)}
					<li role="presentation">
						<button
							type="button"
							role="option"
							id={optionId(command)}
							tabindex="-1"
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
							<span class="font-mono text-xs tracking-wide text-slate-500 uppercase">
								{command.type === 'navigate'
									? i18n.t('commandTypeSection')
									: i18n.t('commandTypeTool')}
							</span>
						</button>
					</li>
				{/each}
			</ul>
			{#if filteredCommands.length === 0}
				<p class="px-5 pb-3 text-sm text-slate-500">{i18n.t('commandEmpty')}</p>
			{/if}

			<div class="border-t border-slate-200 px-5 py-2 text-xs text-slate-500">
				<kbd class="font-mono text-slate-500">Enter</kbd>
				{i18n.t('commandHint')}
				<kbd class="font-mono text-slate-500">Esc</kbd>
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
