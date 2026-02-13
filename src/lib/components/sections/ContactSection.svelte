<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import { siteConfig } from '$lib/data/site-config';

	type FormStatus =
		| { type: 'idle'; message: '' }
		| { type: 'success'; message: string }
		| { type: 'error'; message: string };

	type ValidationErrors = {
		name?: string;
		email?: string;
		message?: string;
	};

	let hoveredSocial = $state('');
	let name = $state('');
	let email = $state('');
	let message = $state('');
	let errors = $state<ValidationErrors>({});
	let isSubmitting = $state(false);
	let status = $state<FormStatus>({ type: 'idle', message: '' });

	function validateForm() {
		const nextErrors: ValidationErrors = {};
		const trimmedName = name.trim();
		const trimmedEmail = email.trim();
		const trimmedMessage = message.trim();

		if (!trimmedName) {
			nextErrors.name = 'Name is required.';
		}

		if (!trimmedEmail) {
			nextErrors.email = 'Email is required.';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
			nextErrors.email = 'Enter a valid email address.';
		}

		if (!trimmedMessage) {
			nextErrors.message = 'Project details are required.';
		}

		errors = nextErrors;
		return Object.keys(nextErrors).length === 0;
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		status = { type: 'idle', message: '' };

		if (!validateForm()) {
			status = { type: 'error', message: 'Please fix the highlighted fields.' };
			return;
		}

		isSubmitting = true;

		try {
			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					name: name.trim(),
					email: email.trim(),
					message: message.trim()
				})
			});

			const body = (await response.json().catch(() => null)) as { message?: string } | null;
			if (!response.ok) {
				status = {
					type: 'error',
					message: body?.message ?? 'Something went wrong. Please try again in a moment.'
				};
				return;
			}

			status = { type: 'success', message: body?.message ?? 'Thanks. Your message has been sent.' };
			name = '';
			email = '';
			message = '';
			errors = {};
		} catch {
			status = {
				type: 'error',
				message: 'Network issue detected. Your draft is still here, so you can try again.'
			};
		} finally {
			isSubmitting = false;
		}
	}
</script>

<Section id="contact" title="Contact" description="Call-to-action, channels, and form entry point.">
	<div class="grid gap-5 lg:grid-cols-[1fr,1.2fr] lg:gap-6">
		<aside class="rounded-2xl border border-slate-700/60 bg-slate-800/30 p-5 sm:p-6" data-reveal>
			<h3 class="font-sans text-lg font-semibold text-slate-100">Let's build something useful</h3>
			<p class="mt-3 text-sm leading-7 text-slate-300 sm:text-base">
				Share your timeline, goals, and constraints. I will reply with a practical plan and next
				steps.
			</p>
			<a
				data-cursor="link"
				href={`mailto:${siteConfig.email}`}
				class="mt-4 inline-flex rounded-full border border-purple-400/55 bg-purple-500/15 px-4 py-2 text-sm text-purple-200 transition-colors duration-200 hover:bg-purple-500/25"
			>
				{siteConfig.email}
			</a>

			<ul class="mt-5 space-y-2" data-testid="contact-socials" data-reveal-group>
				{#each siteConfig.socials as social (social.platform)}
					<li
						data-reveal-item
						class={`rounded-lg border border-slate-700/70 px-3 py-2 text-sm transition-opacity duration-200 ${
							hoveredSocial && hoveredSocial !== social.platform ? 'opacity-45' : 'opacity-100'
						}`}
						onmouseenter={() => (hoveredSocial = social.platform)}
						onmouseleave={() => (hoveredSocial = '')}
					>
						<a
							data-cursor="link"
							href={social.url}
							target="_blank"
							rel="noreferrer"
							class="text-slate-300 hover:text-purple-300"
						>
							{social.platform}
						</a>
					</li>
				{/each}
			</ul>
		</aside>

		<form
			data-reveal
			class="rounded-2xl border border-slate-700/60 bg-slate-900/55 p-5 sm:p-6"
			aria-label="Contact form"
			onsubmit={handleSubmit}
			novalidate
		>
			<div class="grid gap-4 sm:grid-cols-2">
				<label class="space-y-2 text-sm text-slate-300">
					<span>Name</span>
					<input
						data-cursor="input"
						type="text"
						name="name"
						placeholder="Your name"
						bind:value={name}
						required
						aria-invalid={errors.name ? 'true' : 'false'}
						class="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:border-purple-400/80 focus:outline-none"
					/>
					{#if errors.name}
						<p class="text-xs text-rose-300">{errors.name}</p>
					{/if}
				</label>
				<label class="space-y-2 text-sm text-slate-300">
					<span>Email</span>
					<input
						data-cursor="input"
						type="email"
						name="email"
						placeholder="you@example.com"
						bind:value={email}
						required
						aria-invalid={errors.email ? 'true' : 'false'}
						class="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:border-purple-400/80 focus:outline-none"
					/>
					{#if errors.email}
						<p class="text-xs text-rose-300">{errors.email}</p>
					{/if}
				</label>
			</div>

			<label class="mt-4 block space-y-2 text-sm text-slate-300">
				<span>Project details</span>
				<textarea
					data-cursor="text"
					name="message"
					rows="5"
					placeholder="Tell me about your project"
					bind:value={message}
					required
					aria-invalid={errors.message ? 'true' : 'false'}
					class="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:border-purple-400/80 focus:outline-none"
				></textarea>
				{#if errors.message}
					<p class="text-xs text-rose-300">{errors.message}</p>
				{/if}
			</label>

			<div class="mt-4 flex flex-wrap items-center gap-3">
				<button
					data-cursor="link"
					type="submit"
					disabled={isSubmitting}
					class="rounded-full bg-purple-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors duration-200 hover:bg-purple-400 disabled:cursor-not-allowed disabled:bg-purple-400/50"
				>
					{isSubmitting ? 'Sending...' : 'Send inquiry'}
				</button>

				{#if status.type !== 'idle'}
					<p
						role="status"
						aria-live="polite"
						class={status.type === 'success' ? 'text-sm text-emerald-300' : 'text-sm text-rose-300'}
					>
						{status.message}
					</p>
				{/if}
			</div>
		</form>
	</div>
</Section>
