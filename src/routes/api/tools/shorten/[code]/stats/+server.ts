import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getShortCodeStats } from '$lib/server/services/url-shortener';

export const GET: RequestHandler = async ({ params }) => {
	const code = params.code;
	if (!code || code.length > 12) {
		return json({ success: false, error: 'Invalid code.' }, { status: 400 });
	}

	const result = await getShortCodeStats(code);
	if (!result.found) {
		return json({ success: false, error: 'Short code not found.' }, { status: 404 });
	}

	return json(
		{
			success: true,
			originalUrl: result.originalUrl,
			shortCode: result.shortCode,
			clicks: result.clicks,
			createdAt: result.createdAt?.toISOString()
		},
		{ headers: { 'cache-control': 'no-store' } }
	);
};
