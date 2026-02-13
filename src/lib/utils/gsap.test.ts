import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRevealContext, prefersReducedMotion } from './gsap';

describe('gsap utilities', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('detects reduced-motion preference when media query matches', () => {
		vi.stubGlobal('window', {
			matchMedia: vi.fn().mockReturnValue({ matches: true })
		});

		expect(prefersReducedMotion()).toBe(true);
	});

	it('returns false when reduced-motion media query does not match', () => {
		vi.stubGlobal('window', {
			matchMedia: vi.fn().mockReturnValue({ matches: false })
		});

		expect(prefersReducedMotion()).toBe(false);
	});

	it('skips reveal animation context when reduced motion is enabled', () => {
		vi.stubGlobal('window', {
			matchMedia: vi.fn().mockReturnValue({ matches: true })
		});

		const root = {
			querySelectorAll: () => []
		} as unknown as HTMLElement;

		expect(createRevealContext(root)).toBeNull();
	});
});
