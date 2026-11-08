import { describe, expect, it } from 'vitest';
import { webTools } from '$lib/data/web-tools';
import { getAllPentestingEntries } from '$lib/server/content/pentesting';
import { GET } from './+server';

describe('GET /sitemap.xml', () => {
	it('lists the home page, every tool and every published writeup', async () => {
		const response = await GET({} as Parameters<typeof GET>[0]);
		const xml = await response.text();

		expect(response.headers.get('content-type')).toContain('application/xml');
		expect(xml).toContain('<loc>https://merckel.dev/</loc>');
		expect(xml).toContain('<loc>https://merckel.dev/tools</loc>');
		for (const tool of webTools) {
			expect(xml).toContain(`<loc>https://merckel.dev${tool.path}</loc>`);
		}
		for (const entry of getAllPentestingEntries()) {
			expect(xml).toContain(`<loc>https://merckel.dev/pentesting/${entry.slug}</loc>`);
			expect(xml).toContain(`<lastmod>${entry.date}</lastmod>`);
		}
	});
});
