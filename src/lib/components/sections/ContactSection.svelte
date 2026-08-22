<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import { siteConfig } from '$lib/data/site-config';
	import { useLocale } from '$lib/i18n/locale.svelte';

	const i18n = useLocale();
	const iconClass = 'h-4 w-4 shrink-0';
</script>

<Section id="contact" title={i18n.t('navContact')}>
	<ul class="space-y-3" data-testid="contact-socials">
		{#each siteConfig.socials as social (social.platform)}
			<li>
				<a
					href={social.url}
					target={social.icon === 'email' ? undefined : '_blank'}
					rel={social.icon === 'email' ? undefined : 'noreferrer'}
					class="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-purple-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500"
				>
					{#if social.icon === 'github'}
						<svg class={iconClass} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
							<path
								d="M12 2C6.477 2 2 6.486 2 12.021c0 4.425 2.865 8.18 6.839 9.504.5.093.682-.217.682-.483 0-.237-.009-.866-.013-1.7-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.004.071 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.833.091-.647.35-1.088.636-1.339-2.22-.253-4.555-1.113-4.555-4.952 0-1.094.39-1.988 1.029-2.688-.103-.254-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.56 9.56 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.026 2.747-1.026.546 1.378.203 2.396.1 2.65.64.7 1.028 1.594 1.028 2.688 0 3.848-2.338 4.696-4.566 4.944.359.31.679.922.679 1.859 0 1.341-.012 2.422-.012 2.751 0 .268.18.58.688.481A10.02 10.02 0 0 0 22 12.021C22 6.486 17.523 2 12 2Z"
							/>
						</svg>
					{:else if social.icon === 'x'}
						<svg class={iconClass} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
							<path
								d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.725-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"
							/>
						</svg>
					{:else if social.icon === 'email'}
						<svg
							class={iconClass}
							viewBox="0 0 24 24"
							aria-hidden="true"
							fill="none"
							stroke="currentColor"
							stroke-width="1.8"
						>
							<rect x="3" y="5" width="18" height="14" rx="2" />
							<path d="m4 7 8 6 8-6" />
						</svg>
					{/if}
					<span>{social.platform === 'Email' ? siteConfig.email : social.platform}</span>
				</a>
			</li>
		{/each}
	</ul>
</Section>
