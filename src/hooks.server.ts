import type { Handle, HandleServerError } from '@sveltejs/kit';

const MOBILE_USER_AGENT_PATTERN =
	/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i;

const CSP_DIRECTIVES = [
	"default-src 'self'",
	"script-src 'self' 'unsafe-inline'",
	"style-src 'self' 'unsafe-inline'",
	"img-src 'self' data: blob: https:",
	"font-src 'self' data:",
	"connect-src 'self' https://api.github.com",
	"frame-ancestors 'none'",
	"base-uri 'self'",
	"form-action 'self'",
	"object-src 'none'"
].join('; ');

export const handle: Handle = async ({ event, resolve }) => {
	const userAgent = event.request.headers.get('user-agent') ?? '';
	event.locals.isMobile = MOBILE_USER_AGENT_PATTERN.test(userAgent);

	const response = await resolve(event);

	response.headers.set('content-security-policy', CSP_DIRECTIVES);
	response.headers.set('x-frame-options', 'DENY');
	response.headers.set('x-content-type-options', 'nosniff');
	response.headers.set('referrer-policy', 'strict-origin-when-cross-origin');
	response.headers.set(
		'permissions-policy',
		'camera=(), microphone=(), geolocation=(), interest-cohort=()'
	);

	return response;
};

export const handleError: HandleServerError = async ({ error, event, status, message }) => {
	const url = event?.url?.pathname ?? 'unknown';
	console.error(`[${status}] ${event.request.method} ${url}:`, error);

	return {
		message: status === 404 ? 'Seite nicht gefunden' : 'Ein unerwarteter Fehler ist aufgetreten.'
	};
};
