// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			isMobile?: boolean;
			locale?: import('$lib/i18n/messages').Locale;
		}
		interface PageData {
			isMobile?: boolean;
			locale?: import('$lib/i18n/messages').Locale;
			openSource?: import('$lib/types/content').OpenSourceData;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
