const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** `true` when the user asked the OS/browser to minimise animations. */
export function prefersReducedMotion(): boolean {
	if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
		return false;
	}

	return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/** Scroll behaviour that respects the reduced-motion preference. */
export function preferredScrollBehavior(): ScrollBehavior {
	return prefersReducedMotion() ? 'auto' : 'smooth';
}
