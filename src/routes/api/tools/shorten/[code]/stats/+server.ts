import type { RequestHandler } from './$types';
import { getShortCodeStats } from '$lib/server/services/url-shortener';

export const GET: RequestHandler = async ({ params }) => {
	const code = params.code;
	if (!code || code.length > 12) {
		return new Response(JSON.stringify({ success: false, error: 'Invalid code.' }), {
			status: 400,
			headers: { 'content-type': 'application/json' }
		});
	}

	const result = await getShortCodeStats(code);
	if (!result.found) {
		return new Response(JSON.stringify({ success: false, error: 'Short code not found.' }), {
			status: 404,
			headers: { 'content-type': 'application/json' }
		});
	}

	return new Response(
		JSON.stringify({
			success: true,
			originalUrl: result.originalUrl,
			shortCode: result.shortCode,
			clicks: result.clicks,
			createdAt: result.createdAt?.toISOString()
		}),
		{ status: 200, headers: { 'content-type': 'application/json' } }
	);
};
