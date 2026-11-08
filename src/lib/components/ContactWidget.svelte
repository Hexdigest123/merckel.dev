<script lang="ts">
	import { browser } from '$app/environment';
	import { tick } from 'svelte';
	import { useLocale } from '$lib/i18n/locale.svelte';
	import type { MessageKey } from '$lib/i18n/messages';

	const i18n = useLocale();

	/** Maps API status codes to user-facing (localized) messages. */
	const ERROR_MESSAGES: Record<number, MessageKey> = {
		400: 'contactInvalid',
		429: 'contactRateLimited',
		503: 'contactUnavailable'
	};

	let isOpen = $state(false);
	let name = $state('');
	let mail = $state('');
	let message = $state('');
	let isSubmitting = $state(false);
	let errorKey = $state<MessageKey | null>(null);
	let isSent = $state(false);
	let toggleButton = $state<HTMLButtonElement | null>(null);
	let nameInput = $state<HTMLInputElement | null>(null);

	let canSubmit = $derived(
		name.trim().length > 0 && mail.trim().length > 0 && message.trim().length > 0 && !isSubmitting
	);

	$effect(() => {
		if (!browser || !isOpen) {
			return;
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				event.preventDefault();
				closePanel();
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	});

	async function openPanel() {
		isOpen = true;
		isSent = false;
		errorKey = null;
		await tick();
		nameInput?.focus();
	}

	function closePanel() {
		isOpen = false;
		toggleButton?.focus();
	}

	function togglePanel() {
		if (isOpen) {
			closePanel();
			return;
		}
		void openPanel();
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		errorKey = null;
		isSent = false;

		if (!canSubmit) {
			return;
		}

		isSubmitting = true;

		try {
			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					name: name.trim(),
					mail: mail.trim(),
					message: message.trim()
				})
			});

			if (!response.ok) {
				errorKey = ERROR_MESSAGES[response.status] ?? 'contactError';
				return;
			}

			isSent = true;
			name = '';
			mail = '';
			message = '';
		} catch {
			errorKey = 'contactNetwork';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="fixed right-3 bottom-3 z-30 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
	{#if isOpen}
		<section
			id="contact-widget-panel"
			class="w-[min(22rem,calc(100vw-2rem))] rounded-lg border border-slate-200 bg-white p-4 shadow-lg"
			aria-labelledby="contact-widget-title"
		>
			<div class="mb-3 flex items-start justify-between gap-3">
				<h2 id="contact-widget-title" class="font-sans text-base font-semibold text-slate-900">
					{i18n.t('contactSend')}
				</h2>
				<button
					type="button"
					class="rounded-md p-1 text-slate-500 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500"
					onclick={closePanel}
					aria-label={i18n.t('contactClose')}
				>
					<svg
						class="h-4 w-4"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						aria-hidden="true"
					>
						<path stroke-linecap="round" d="M6 6l12 12M18 6L6 18" />
					</svg>
				</button>
			</div>

			{#if isSent}
				<p role="status" class="text-sm text-slate-600">{i18n.t('contactThanks')}</p>
			{:else}
				<form class="space-y-3" onsubmit={handleSubmit} novalidate>
					<label class="block space-y-1 text-sm text-slate-600" for="contact-name">
						<span>{i18n.t('contactName')}</span>
						<input
							bind:this={nameInput}
							id="contact-name"
							name="name"
							type="text"
							autocomplete="name"
							maxlength="100"
							required
							bind:value={name}
							class="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:outline-none"
						/>
					</label>

					<label class="block space-y-1 text-sm text-slate-600" for="contact-mail">
						<span>{i18n.t('contactMail')}</span>
						<input
							id="contact-mail"
							name="mail"
							type="email"
							autocomplete="email"
							maxlength="254"
							required
							bind:value={mail}
							class="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:outline-none"
						/>
					</label>

					<label class="block space-y-1 text-sm text-slate-600" for="contact-message">
						<span>{i18n.t('contactMessage')}</span>
						<textarea
							id="contact-message"
							name="message"
							rows="4"
							maxlength="4000"
							required
							bind:value={message}
							class="w-full resize-y rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:outline-none"
						></textarea>
					</label>

					{#if errorKey}
						<p role="alert" class="text-sm text-rose-600">{i18n.t(errorKey)}</p>
					{/if}

					<button
						type="submit"
						disabled={!canSubmit}
						class="inline-flex w-full items-center justify-center rounded-md bg-purple-500 px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-purple-600 disabled:cursor-not-allowed disabled:bg-purple-400"
					>
						{isSubmitting ? i18n.t('contactSubmitting') : i18n.t('contactSubmit')}
					</button>
				</form>
			{/if}
		</section>
	{/if}

	<button
		bind:this={toggleButton}
		type="button"
		class="inline-flex h-20 w-20 items-center justify-center rounded-full bg-purple-500 text-white shadow-md transition-colors duration-150 hover:bg-purple-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500"
		onclick={togglePanel}
		aria-expanded={isOpen}
		aria-controls={isOpen ? 'contact-widget-panel' : undefined}
		aria-label={isOpen ? i18n.t('contactClose') : i18n.t('contactOpen')}
	>
		<svg
			class="h-10 w-10"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="1.8"
			aria-hidden="true"
		>
			<rect x="3" y="5" width="18" height="14" rx="2" />
			<path d="m4 7 8 6 8-6" />
		</svg>
	</button>
</div>
