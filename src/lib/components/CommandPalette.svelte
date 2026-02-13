<script lang="ts">
	import { browser } from '$app/environment';
	import {
		createCommandList,
		executeCommand,
		filterCommands,
		resolveCommandFromInput,
		type CommandPaletteSection
	} from '$lib/utils/command-palette';
	import { prefersReducedMotion } from '$lib/utils/gsap';

	let {
		sections,
		placeholder = 'Type a command or section...',
		onSecretRevealed
	}: {
		sections: readonly CommandPaletteSection[];
		placeholder?: string;
		onSecretRevealed?: (secretId: string) => void;
	} = $props();

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
			feedback = 'No matching command.';
			return;
		}

		const result = executeCommand(command) as {
			navigateToHash?: string;
			message?: string;
			secretId?: string;
		};

		if (result.secretId && onSecretRevealed) {
			onSecretRevealed(result.secretId);
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

			feedback = `Section #${result.navigateToHash} is unavailable.`;
			return;
		}

		feedback = result.message ?? 'Done.';
	}

	function keyboardHint(): string {
		return browser && navigator.userAgent.includes('Mac') ? 'Cmd+K' : 'Ctrl+K';
	}
</script>

<button
	type="button"
	data-cursor="link"
	class="fixed top-4 right-4 z-30 hidden items-center gap-2 rounded-full border border-slate-600/70 bg-slate-900/75 px-3 py-1.5 font-mono text-xs tracking-wide text-slate-300 shadow-[0_8px_24px_rgba(15,23,42,0.55)] backdrop-blur focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-300 sm:inline-flex"
	onclick={openPalette}
	aria-label="Open command palette"
>
	<span>Command</span>
	<kbd class="rounded border border-slate-500/80 px-1.5 py-0.5 text-[11px] text-slate-200"
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
			class="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
			onclick={closePalette}
			aria-label="Close command palette"
		></button>
		<div
			role="dialog"
			aria-modal="true"
			aria-label="Command palette"
			class="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-purple-400/30 bg-slate-900/95 shadow-[0_28px_80px_rgba(6,11,28,0.9)]"
		>
			<div class="border-b border-slate-700/70 px-4 py-3 sm:px-5">
				<label for="command-palette-input" class="sr-only">Command input</label>
				<input
					bind:this={inputElement}
					id="command-palette-input"
					type="text"
					value={query}
					aria-label="Command input"
					{placeholder}
					autocomplete="off"
					class="w-full border-0 bg-transparent px-1 py-2 text-base text-slate-100 outline-none placeholder:text-slate-500"
					oninput={handleInput}
					onkeydown={handleInputKeydown}
				/>
			</div>

			<ul role="listbox" aria-label="Command results" class="max-h-80 overflow-y-auto py-2">
				{#if filteredCommands.length === 0}
					<li class="px-5 py-3 text-sm text-slate-500">No commands match your input.</li>
				{:else}
					{#each filteredCommands as command, index (command.id)}
						<li>
							<button
								type="button"
								role="option"
								aria-selected={index === selectedIndex}
								class={`flex w-full items-center justify-between px-5 py-3 text-left transition-colors duration-150 ${
									index === selectedIndex
										? 'bg-purple-500/20 text-slate-100'
										: 'text-slate-300 hover:bg-slate-800/80 hover:text-slate-100'
								}`}
								onmouseenter={() => (selectedIndex = index)}
								onclick={() => runCommand(command)}
							>
								<span>{command.label}</span>
								<span class="font-mono text-xs tracking-wide text-slate-500 uppercase">
									{command.type === 'navigate' ? 'Section' : 'Hidden'}
								</span>
							</button>
						</li>
					{/each}
				{/if}
			</ul>

			<div class="border-t border-slate-700/60 px-5 py-2 text-xs text-slate-500">
				Press <span class="font-mono text-slate-400">Enter</span> to run,
				<span class="font-mono text-slate-400">Esc</span> to close.
			</div>

			{#if feedback}
				<div class="border-t border-slate-700/60 bg-slate-950/60 px-5 py-3">
					<p role="status" aria-live="polite" class="font-mono text-xs text-purple-200">
						{feedback}
					</p>
				</div>
			{/if}
		</div>
	</div>
{/if}
