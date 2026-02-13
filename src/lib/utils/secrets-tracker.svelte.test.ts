import { describe, it, expect, beforeEach } from 'vitest';

describe('Secrets Tracker - Behavior', () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it('should increment found count when revealSecret is called', async () => {
		const { revealSecret, initializeSecretsTracker } = await import('./secrets-tracker');

		let state = initializeSecretsTracker();
		expect(state.found).toBe(0);

		state = revealSecret('konami');
		expect(state.found).toBe(1);
		expect(state.secrets.find((s) => s.id === 'konami')?.revealed).toBe(true);

		const stored = JSON.parse(localStorage.getItem('portfolio_secrets_found') || '{}');
		expect(stored.found).toBe(1);
	});

	it('should persist revealed state across fresh initialization', async () => {
		const { revealSecret, initializeSecretsTracker } = await import('./secrets-tracker');

		revealSecret('konami');

		const freshState = initializeSecretsTracker();
		expect(freshState.found).toBe(1);
		expect(freshState.secrets.find((s) => s.id === 'konami')?.revealed).toBe(true);
	});
});
