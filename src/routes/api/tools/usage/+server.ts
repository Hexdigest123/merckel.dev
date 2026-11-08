import { json } from '@sveltejs/kit';
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
		return json(
			{ success: false, error: 'Too many requests.' },
			{ status: 429, headers: { 'retry-after': String(limit.retryAfterSeconds) } }
		);
	}

	let body: { toolId?: unknown };
	try {
		body = (await request.json()) as { toolId?: unknown };
	} catch {
		return json({ success: false, error: 'Invalid JSON.' }, { status: 400 });
	}

	const toolId = typeof body?.toolId === 'string' ? body.toolId.trim() : '';
	if (!toolId) {
		return json({ success: false, error: 'toolId is required.' }, { status: 400 });
	}

	if (!webTools.some((tool) => tool.id === toolId)) {
		return json({ success: false, error: 'Unknown tool.' }, { status: 404 });
	}

	try {
		await incrementUsage(toolId);
		return json({ success: true });
	} catch (error) {
		console.error('[usage] Unexpected error:', error);
		return json({ success: false, error: 'Internal error.' }, { status: 500 });
	}
};
