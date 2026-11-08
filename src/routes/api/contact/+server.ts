import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	isSmtpConfigured,
	sendContactMessage,
	validateContactInput
} from '$lib/server/services/contact';
import { getClientKey, rateLimit } from '$lib/server/services/rate-limit';

const CONTACT_RATE_LIMIT = 3;
const CONTACT_RATE_WINDOW_MS = 10 * 60 * 1000;

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	let body: { name?: unknown; mail?: unknown; message?: unknown };
	try {
		body = (await request.json()) as { name?: unknown; mail?: unknown; message?: unknown };
	} catch {
		return json({ success: false, error: 'invalid json' }, { status: 400 });
	}

	const input = {
		name: typeof body?.name === 'string' ? body.name.trim() : '',
		mail: typeof body?.mail === 'string' ? body.mail.trim() : '',
		message: typeof body?.message === 'string' ? body.message.trim() : ''
	};

	const errors = validateContactInput(input);
	if (errors.length > 0) {
		return json({ success: false, error: errors[0]!.error, errors }, { status: 400 });
	}

	if (!isSmtpConfigured()) {
		return json({ success: false, error: 'mail is not configured' }, { status: 503 });
	}

	// Only messages that would actually be sent count towards the limit, so fixing a
	// validation error does not use up an attempt.
	const clientKey = getClientKey(request, getClientAddress);
	const limit = rateLimit(`contact:${clientKey}`, CONTACT_RATE_LIMIT, CONTACT_RATE_WINDOW_MS);
	if (!limit.allowed) {
		return json(
			{ success: false, error: 'too many requests' },
			{ status: 429, headers: { 'retry-after': String(limit.retryAfterSeconds) } }
		);
	}

	try {
		await sendContactMessage(input);
		return json({ success: true });
	} catch (error) {
		console.error('[contact] send failed:', error);
		return json({ success: false, error: 'mail could not be sent' }, { status: 502 });
	}
};
