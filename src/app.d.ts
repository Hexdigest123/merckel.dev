// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			isMobile?: boolean;
		}
		interface PageData {
			isMobile?: boolean;
			openSource?: import('$lib/types/content').OpenSourceData;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
