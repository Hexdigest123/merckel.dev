import { browser } from '$app/environment';

const STORAGE_KEY = 'portfolio_secrets_found';

export interface Secret {
	id: string;
	name: string;
	revealed: boolean;
}

export interface SecretsState {
	total: number;
	found: number;
	secrets: Secret[];
}

const DEFAULT_SECRETS: Secret[] = [
	{ id: 'konami', name: 'Konami Code', revealed: false },
	{ id: 'hover-project', name: 'Project Hover Reveal', revealed: false },
	{ id: 'hover-tool', name: 'Tool Hover Reveal', revealed: false },
	{ id: 'terminal-secret', name: 'Terminal Secret', revealed: false }
];

export function initializeSecretsTracker(): SecretsState {
	if (!browser) {
		return {
			total: DEFAULT_SECRETS.length,
			found: 0,
			secrets: DEFAULT_SECRETS
		};
	}

	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored) {
		try {
			return JSON.parse(stored);
		} catch {
			return createDefaultState();
		}
	}

	return createDefaultState();
}

function createDefaultState(): SecretsState {
	return {
		total: DEFAULT_SECRETS.length,
		found: 0,
		secrets: structuredClone(DEFAULT_SECRETS)
	};
}

export function revealSecret(secretId: string): SecretsState {
	if (!browser) {
		return createDefaultState();
	}

	const state = initializeSecretsTracker();
	const secret = state.secrets.find((s) => s.id === secretId);

	if (secret && !secret.revealed) {
		secret.revealed = true;
		state.found = state.secrets.filter((s) => s.revealed).length;
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	}

	return state;
}

export function getSecretsState(): SecretsState {
	return initializeSecretsTracker();
}

export function resetSecrets(): void {
	if (browser) {
		localStorage.removeItem(STORAGE_KEY);
	}
}
