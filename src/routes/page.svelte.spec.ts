import { describe, expect, it } from 'vitest';
import { mount, unmount } from 'svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	it('should render an h1 identity heading', async () => {
		const app = mount(Page, { target: document.body });

		const heading = document.querySelector('h1');
		expect(heading?.textContent?.trim()).toBe('Pierre-Maurice Merckel');

		await unmount(app);
	});
});
