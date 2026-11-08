import type { Handle, HandleServerError } from '@sveltejs/kit';
import { resolveLocale } from '$lib/i18n/locale';

// The Content-Security-Policy for pages is configured via `kit.csp` in svelte.config.js,
// which lets SvelteKit attach a nonce to its inline bootstrap script.
const SECURITY_HEADERS: Record<string, string> = {
	'x-frame-options': 'DENY',
	'x-content-type-options': 'nosniff',
	'referrer-policy': 'strict-origin-when-cross-origin',
	'permissions-policy': 'camera=(), microphone=(), geolocation=()'
};

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.locale = resolveLocale(
		event.cookies.get('locale'),
		event.request.headers.get('accept-language')
	);

	const response = await resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', event.locals.locale ?? 'en')
	});

	for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
		response.headers.set(name, value);
	}

	if (event.url.protocol === 'https:') {
		response.headers.set('strict-transport-security', 'max-age=31536000');
	}

	return response;
};

export const handleError: HandleServerError = async ({ error, event, status }) => {
	console.error(`[${status}] ${event.request.method} ${event.url.pathname}:`, error);

	// The error page renders its own localized copy, so keep this message neutral.
	return {
		message: status === 404 ? 'Not Found' : 'Internal Error'
	};
};
