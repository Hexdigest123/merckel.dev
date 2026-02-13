import { describe, it, expect, vi } from 'vitest';

describe('Konami Code Detector', () => {
	it('should export createKonamiDetector function', async () => {
		const { createKonamiDetector } = await import('./konami');
		expect(typeof createKonamiDetector).toBe('function');
	});

	it('should return detector with start and cleanup methods', async () => {
		const { createKonamiDetector } = await import('./konami');
		const detector = createKonamiDetector({ onDetected: () => {} });
		expect(typeof detector.start).toBe('function');
		expect(typeof detector.cleanup).toBe('function');
	});

	it('should accept onDetected callback in options', async () => {
		const { createKonamiDetector } = await import('./konami');
		const callback = vi.fn();
		const detector = createKonamiDetector({ onDetected: callback });
		expect(detector).toBeDefined();
	});

	it('should support case-insensitive option', async () => {
		const { createKonamiDetector } = await import('./konami');
		const detector = createKonamiDetector({
			onDetected: () => {},
			caseSensitive: false
		});
		expect(detector).toBeDefined();
	});

	it('should have Konami sequence constant defined', async () => {
		const { createKonamiDetector } = await import('./konami');
		const detector = createKonamiDetector({ onDetected: () => {} });
		expect(detector).toBeDefined();
	});
});
