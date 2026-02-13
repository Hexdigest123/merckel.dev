import type { RequestHandler } from './$types';
import { incrementUsage } from '$lib/server/services/usage';
import { webTools } from '$lib/data/web-tools';

export const POST: RequestHandler = async ({ request }) => {
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
