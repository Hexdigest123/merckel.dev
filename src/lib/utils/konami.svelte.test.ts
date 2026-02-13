import { describe, it, expect, vi } from 'vitest';

describe('Konami Code Detector (browser)', () => {
	it('should trigger callback exactly once when exact Konami sequence is dispatched', async () => {
		const { createKonamiDetector } = await import('./konami');
		const onDetected = vi.fn();
		const detector = createKonamiDetector({ onDetected });

		detector.start();

		const konamiSequence = [
			'ArrowUp',
			'ArrowUp',
			'ArrowDown',
			'ArrowDown',
			'ArrowLeft',
			'ArrowRight',
			'ArrowLeft',
			'ArrowRight',
			'b',
			'a'
		];

		konamiSequence.forEach((key) => {
			const event = new KeyboardEvent('keydown', { key });
			window.dispatchEvent(event);
		});

		expect(onDetected).toHaveBeenCalledOnce();

		detector.cleanup();
	});

	it('should not trigger callback when incorrect sequence is dispatched', async () => {
		const { createKonamiDetector } = await import('./konami');
		const onDetected = vi.fn();
		const detector = createKonamiDetector({ onDetected });

		detector.start();

		const wrongSequence = ['ArrowDown', 'ArrowUp', 'ArrowDown', 'ArrowUp'];

		wrongSequence.forEach((key) => {
			const event = new KeyboardEvent('keydown', { key });
			window.dispatchEvent(event);
		});

		expect(onDetected).not.toHaveBeenCalled();

		detector.cleanup();
	});
});
