import type { RequestHandler } from './$types';
import { incrementUsage } from '$lib/server/services/usage';
import { webTools } from '$lib/data/web-tools';
import { getClientKey, rateLimit } from '$lib/server/services/rate-limit';

const USAGE_RATE_LIMIT = 60;
const USAGE_RATE_WINDOW_MS = 60_000;

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	const clientKey = getClientKey(request, getClientAddress);
	const limit = rateLimit(`usage:${clientKey}`, USAGE_RATE_LIMIT, USAGE_RATE_WINDOW_MS);
	if (!limit.allowed) {
		return new Response(
			JSON.stringify({ success: false, error: 'Too many requests.' }),
			{
				status: 429,
				headers: {
					'content-type': 'application/json',
					'retry-after': String(limit.retryAfterSeconds)
				}
			}
		);
	}

	let body: { toolId?: unknown };
	try {
		body = (await request.json()) as { toolId?: unknown };
	} catch {
		return new Response(JSON.stringify({ success: false, error: 'Invalid JSON.' }), {
			status: 400,
			headers: { 'content-type': 'application/json' }
		});
	}

	const toolId = typeof body.toolId === 'string' ? body.toolId.trim() : '';
	if (!toolId) {
		return new Response(JSON.stringify({ success: false, error: 'toolId is required.' }), {
			status: 400,
			headers: { 'content-type': 'application/json' }
		});
	}

	const validTool = webTools.find((t) => t.id === toolId);
	if (!validTool) {
		return new Response(JSON.stringify({ success: false, error: 'Unknown tool.' }), {
			status: 404,
			headers: { 'content-type': 'application/json' }
		});
	}

	try {
		await incrementUsage(toolId);
		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { 'content-type': 'application/json' }
		});
	} catch {
		return new Response(JSON.stringify({ success: false, error: 'Internal error.' }), {
			status: 500,
			headers: { 'content-type': 'application/json' }
		});
	}
};
