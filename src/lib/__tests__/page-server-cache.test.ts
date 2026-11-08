import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const cache = vi.hoisted(() => ({
	getCachedGitHubData: vi.fn(async () => null),
	setCachedGitHubData: vi.fn(async () => undefined)
}));

vi.mock('$lib/server/services/github-cache', () => cache);
vi.mock('$lib/server/services/usage', () => ({ getTopTools: vi.fn(async () => []) }));

const { __resetOpenSourceCache, load } = await import('../../routes/+page.server');

const githubUser = {
	ok: true,
	json: async () => ({ public_repos: 3, html_url: 'https://github.com/x' })
};
const githubRepos = { ok: true, json: async () => [] };

describe('page server load - GitHub cache persistence', () => {
	beforeEach(() => {
		__resetOpenSourceCache();
		cache.getCachedGitHubData.mockClear();
		cache.setCachedGitHubData.mockClear();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('persists successful GitHub responses to the 24h cache', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValueOnce(githubUser).mockResolvedValueOnce(githubRepos)
		);

		const data = await load();

		expect(data.openSource.source).toBe('github');
		expect(cache.setCachedGitHubData).toHaveBeenCalledTimes(1);
	});

	it('does not persist fallback data when GitHub is unavailable', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

		const data = await load();

		expect(data.openSource.source).toBe('fallback');
		expect(cache.setCachedGitHubData).not.toHaveBeenCalled();
	});

	it('shares one GitHub request between concurrent cold-cache loads', async () => {
		const fetchMock = vi.fn().mockResolvedValueOnce(githubUser).mockResolvedValueOnce(githubRepos);
		vi.stubGlobal('fetch', fetchMock);

		const [first, second] = await Promise.all([load(), load()]);

		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(first.openSource).toEqual(second.openSource);
	});
});
