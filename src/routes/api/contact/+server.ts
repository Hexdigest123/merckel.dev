import type { RequestHandler } from './$types';

const RATE_LIMIT_WINDOW_MS = 60_000;
const rateLimitByIp = new Map<string, number>();

type ContactPayload = {
	name?: unknown;
	email?: unknown;
	message?: unknown;
};

function jsonResponse(
	status: number,
	success: boolean,
	message: string,
	errors?: Record<string, string>
) {
	return new Response(JSON.stringify({ success, message, ...(errors ? { errors } : {}) }), {
		status,
		headers: { 'content-type': 'application/json' }
	});
}

function asNonEmptyTrimmedString(value: unknown) {
	if (typeof value !== 'string') {
		return '';
	}

	return value.trim();
}

function validatePayload(payload: ContactPayload) {
	const errors: Record<string, string> = {};
	const name = asNonEmptyTrimmedString(payload.name);
	const email = asNonEmptyTrimmedString(payload.email);
	const message = asNonEmptyTrimmedString(payload.message);

	if (!name) {
		errors.name = 'Name is required.';
	}

	if (!email) {
		errors.email = 'Email is required.';
	} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		errors.email = 'Email must be valid.';
	}

	if (!message) {
		errors.message = 'Message is required.';
	}

	if (message.length > 5000) {
		errors.message = 'Message must be 5000 characters or fewer.';
	}

	return {
		name,
		email,
		message,
		errors,
		isValid: Object.keys(errors).length === 0
	};
}

function getClientIp(getClientAddress: (() => string) | undefined) {
	try {
		return getClientAddress?.() ?? 'unknown';
	} catch {
		return 'unknown';
	}
}

async function sendWithResend(name: string, email: string, message: string) {
	const resendApiKey = process.env.RESEND_API_KEY;
	if (!resendApiKey) {
		return {
			sent: false,
			mode: 'local' as const
		};
	}

	const toEmail = process.env.CONTACT_TO_EMAIL ?? process.env.RESEND_TO_EMAIL ?? email;
	const fromEmail = process.env.CONTACT_FROM_EMAIL ?? 'onboarding@resend.dev';

	const response = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${resendApiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			from: fromEmail,
			to: [toEmail],
			reply_to: email,
			subject: `Portfolio inquiry from ${name}`,
			text: message
		})
	});

	if (!response.ok) {
		throw new Error('RESEND_REQUEST_FAILED');
	}

	return {
		sent: true,
		mode: 'resend' as const
	};
}

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	const clientIp = getClientIp(getClientAddress);
	const now = Date.now();
	const lastRequestAt = rateLimitByIp.get(clientIp) ?? 0;

	if (now - lastRequestAt < RATE_LIMIT_WINDOW_MS) {
		return jsonResponse(429, false, 'Please wait a minute before sending another message.');
	}

	rateLimitByIp.set(clientIp, now);

	let payload: ContactPayload;
	try {
		payload = (await request.json()) as ContactPayload;
	} catch {
		return jsonResponse(400, false, 'Request body must be valid JSON.');
	}

	const validated = validatePayload(payload);
	if (!validated.isValid) {
		return jsonResponse(400, false, 'Please provide valid contact details.', validated.errors);
	}

	try {
		const result = await sendWithResend(validated.name, validated.email, validated.message);
		if (result.mode === 'local') {
			return jsonResponse(
				200,
				true,
				'Message received. Email sending is disabled locally, but your submission was accepted.'
			);
		}

		return jsonResponse(200, true, 'Message sent successfully. I will reply soon.');
	} catch {
		return jsonResponse(502, false, 'Unable to send message right now. Please try again later.');
	}
};

export function __resetContactRateLimit() {
	rateLimitByIp.clear();
}
