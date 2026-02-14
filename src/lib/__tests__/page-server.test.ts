import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { siteConfig } from '$lib/data/site-config';
import { __resetOpenSourceCache, load } from '../../routes/+page.server';

describe('page server load - open source data', () => {
	const githubSocial = siteConfig.socials.find((social) => social.platform === 'GitHub');
	const originalGithubUrl = githubSocial?.url;

	beforeEach(() => {
		__resetOpenSourceCache();
		if (githubSocial && originalGithubUrl) {
			githubSocial.url = originalGithubUrl;
		}
		vi.unstubAllGlobals();
	});

	afterEach(() => {
		if (githubSocial && originalGithubUrl) {
			githubSocial.url = originalGithubUrl;
		}
		vi.unstubAllGlobals();
	});

	it('returns fallback data without calling GitHub API when profile is not configured', async () => {
		if (githubSocial) {
			githubSocial.url = 'https://github.com';
		}

		const fetchMock = vi.fn();
		vi.stubGlobal('fetch', fetchMock);

		const data = await load();

		expect(fetchMock).not.toHaveBeenCalled();
		expect(data.openSource.source).toBe('fallback');
		expect(data.openSource.stats[0].label).toBe('Public repositories');
		expect(data.openSource.note).toContain('not configured');
	});

	it('falls back gracefully when GitHub API responds with errors', async () => {
		if (githubSocial) {
			githubSocial.url = 'https://github.com/octocat';
		}

		const fetchMock = vi.fn().mockResolvedValue({ ok: false });
		vi.stubGlobal('fetch', fetchMock);

		const data = await load();

		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(data.openSource.source).toBe('fallback');
		expect(data.openSource.note).toContain('temporarily unavailable');
	});

	it('caches successful GitHub responses for repeated load calls', async () => {
		if (githubSocial) {
			githubSocial.url = 'https://github.com/octocat';
		}

		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ public_repos: 12, html_url: 'https://github.com/octocat' })
			})
			.mockResolvedValueOnce({
				ok: true,
				json: async () => [
					{
						id: 1,
						name: 'hello-world',
						description: 'Example repository',
						html_url: 'https://github.com/octocat/hello-world',
						topics: ['svelte', 'oss']
					}
				]
			});

		vi.stubGlobal('fetch', fetchMock);

		const first = await load();
		const second = await load();

		expect(first.openSource.source).toBe('github');
		expect(first.openSource.contributions[0].title).toBe('hello-world');
		expect(second.openSource.source).toBe('github');
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});
});
