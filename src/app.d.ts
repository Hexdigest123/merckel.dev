// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			locale?: import('$lib/i18n/messages').Locale;
		}
		interface PageData {
			locale?: import('$lib/i18n/messages').Locale;
			/** Page title; the root layout appends " — merckel.dev". */
			title?: string;
			/** Meta/Open Graph description. Falls back to the job title. */
			description?: string;
			/** Open Graph type, `website` unless a page says otherwise. */
			ogType?: 'website' | 'article';
			/** ISO date for `article:published_time` (articles only). */
			publishedTime?: string;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
