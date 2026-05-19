import type { RequestHandler } from './$types';
import { createShortUrl } from '$lib/server/services/url-shortener';
import { incrementUsage } from '$lib/server/services/usage';
import { getClientKey, rateLimit } from '$lib/server/services/rate-limit';

const SHORTEN_RATE_LIMIT = 10;
const SHORTEN_RATE_WINDOW_MS = 60_000;

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	const clientKey = getClientKey(request, getClientAddress);
	const limit = rateLimit(`shorten:${clientKey}`, SHORTEN_RATE_LIMIT, SHORTEN_RATE_WINDOW_MS);
	if (!limit.allowed) {
		return new Response(
			JSON.stringify({ success: false, error: 'Too many requests. Please slow down.' }),
			{
				status: 429,
				headers: {
					'content-type': 'application/json',
					'retry-after': String(limit.retryAfterSeconds)
				}
			}
		);
	}

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
