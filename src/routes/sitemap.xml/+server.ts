import type { RequestHandler } from './$types';
import { siteConfig } from '$lib/data/site-config';
import { webTools } from '$lib/data/web-tools';
import { getAllPentestingEntries } from '$lib/server/content/pentesting';

interface SitemapEntry {
	path: string;
	lastmod?: string;
	priority: string;
}

function escapeXml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

export const GET: RequestHandler = () => {
	const entries: SitemapEntry[] = [
		{ path: '/', priority: '1.0' },
		{ path: '/tools', priority: '0.8' },
		...webTools.map((tool) => ({ path: tool.path, priority: '0.6' })),
		{ path: '/pentesting', priority: '0.7' },
		...getAllPentestingEntries().map((entry) => ({
			path: `/pentesting/${entry.slug}`,
			lastmod: entry.date || undefined,
			priority: '0.6'
		}))
	];

	const urls = entries
		.map((entry) =>
			[
				'\t<url>',
				`\t\t<loc>${escapeXml(new URL(entry.path, siteConfig.url).href)}</loc>`,
				entry.lastmod ? `\t\t<lastmod>${escapeXml(entry.lastmod)}</lastmod>` : '',
				`\t\t<priority>${entry.priority}</priority>`,
				'\t</url>'
			]
				.filter(Boolean)
				.join('\n')
		)
		.join('\n');

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

	return new Response(body, {
		headers: {
			'content-type': 'application/xml; charset=utf-8',
			'cache-control': 'public, max-age=3600'
		}
	});
};
