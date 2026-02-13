import { describe, it, expect } from 'vitest';

describe('Secrets Tracker', () => {
	it('should export tracker functions', async () => {
		const {
			initializeSecretsTracker,
			revealSecret,
			getSecretsState,
			resetSecrets
		} = await import('./secrets-tracker');

		expect(typeof initializeSecretsTracker).toBe('function');
		expect(typeof revealSecret).toBe('function');
		expect(typeof getSecretsState).toBe('function');
		expect(typeof resetSecrets).toBe('function');
	});

	it('should initialize with 4 secrets, 0 found', async () => {
		const { initializeSecretsTracker } = await import('./secrets-tracker');
		const state = initializeSecretsTracker();

		expect(state.total).toBe(4);
		expect(state.found).toBe(0);
		expect(state.secrets).toHaveLength(4);
	});

	it('should have correct secret IDs', async () => {
		const { initializeSecretsTracker } = await import('./secrets-tracker');
		const state = initializeSecretsTracker();
		const secretIds = state.secrets.map((s) => s.id);

		expect(secretIds).toContain('konami');
		expect(secretIds).toContain('hover-project');
		expect(secretIds).toContain('hover-tool');
		expect(secretIds).toContain('terminal-secret');
	});

	it('should have correct secret structure with name and revealed fields', async () => {
		const { initializeSecretsTracker } = await import('./secrets-tracker');
		const state = initializeSecretsTracker();

		state.secrets.forEach((secret) => {
			expect(secret).toHaveProperty('id');
			expect(secret).toHaveProperty('name');
			expect(secret).toHaveProperty('revealed');
			expect(typeof secret.id).toBe('string');
			expect(typeof secret.name).toBe('string');
			expect(typeof secret.revealed).toBe('boolean');
		});
	});

	it('should have all secrets unrevealed initially', async () => {
		const { initializeSecretsTracker } = await import('./secrets-tracker');
		const state = initializeSecretsTracker();

		expect(state.secrets.every((s) => !s.revealed)).toBe(true);
	});
});
