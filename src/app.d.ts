// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface OpenSourceData {
			source: 'github' | 'fallback';
			profileUrl?: string;
			profileLabel: string;
			note: string;
			stats: Array<{ label: string; value: string }>;
			contributions: Array<{
				id: string;
				title: string;
				description: string;
				tags: string[];
				url?: string;
			}>;
		}

		// interface Error {}
		interface Locals {
			isMobile?: boolean;
		}
		interface PageData {
			isMobile?: boolean;
			openSource?: OpenSourceData;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
