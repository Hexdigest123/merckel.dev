import type { Handle } from '@sveltejs/kit';

const MOBILE_USER_AGENT_PATTERN =
	/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i;

export const handle: Handle = async ({ event, resolve }) => {
	const userAgent = event.request.headers.get('user-agent') ?? '';
	event.locals.isMobile = MOBILE_USER_AGENT_PATTERN.test(userAgent);

	return resolve(event);
};
