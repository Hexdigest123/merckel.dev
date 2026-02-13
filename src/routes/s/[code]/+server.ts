import type { RequestHandler } from './$types';
import { resolveShortCode } from '$lib/server/services/url-shortener';
import { redirect } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
	const code = params.code;
	if (!code || code.length > 12) {
		return new Response('Not found', { status: 404 });
	}

	const result = await resolveShortCode(code);
	if (!result.found || !result.originalUrl) {
		return new Response('Not found', { status: 404 });
	}

	redirect(302, result.originalUrl);
};
