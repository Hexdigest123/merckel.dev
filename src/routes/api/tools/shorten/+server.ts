import type { RequestHandler } from './$types';
import { createShortUrl } from '$lib/server/services/url-shortener';
import { incrementUsage } from '$lib/server/services/usage';

export const POST: RequestHandler = async ({ request }) => {
	let body: { url?: unknown };
	try {
		body = (await request.json()) as { url?: unknown };
	} catch {
		return new Response(JSON.stringify({ success: false, error: 'Invalid JSON.' }), {
			status: 400,
			headers: { 'content-type': 'application/json' }
		});
	}

	const url = typeof body.url === 'string' ? body.url.trim() : '';
	if (!url) {
		return new Response(JSON.stringify({ success: false, error: 'url is required.' }), {
			status: 400,
			headers: { 'content-type': 'application/json' }
		});
	}

	try {
		const result = await createShortUrl(url);
		if (!result.success) {
			return new Response(JSON.stringify({ success: false, error: result.error }), {
				status: 400,
				headers: { 'content-type': 'application/json' }
			});
		}

		await incrementUsage('url-shortener');

		return new Response(
			JSON.stringify({
				success: true,
				shortCode: result.shortCode,
				originalUrl: result.originalUrl
			}),
			{
				status: 201,
				headers: { 'content-type': 'application/json' }
			}
		);
	} catch {
		return new Response(JSON.stringify({ success: false, error: 'Internal error.' }), {
			status: 500,
			headers: { 'content-type': 'application/json' }
		});
	}
};
