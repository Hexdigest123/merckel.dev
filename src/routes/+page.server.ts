import { env } from '$env/dynamic/private';
import { projects } from '$lib/data/projects';
import { siteConfig } from '$lib/data/site-config';
import { getCachedGitHubData, setCachedGitHubData } from '$lib/server/services/github-cache';
import { getTopTools } from '$lib/server/services/usage';
import type { OpenSourceContribution, OpenSourceData } from '$lib/types/content';

const GITHUB_FETCH_TIMEOUT_MS = 8_000;

/** Short in-memory L1 cache to avoid DB round-trips on rapid successive requests. */
const IN_MEMORY_TTL_MS = 5 * 60 * 1000;
let inMemoryCache: { expiresAt: number; data: OpenSourceData } | null = null;

const fallbackContributions: OpenSourceContribution[] = projects
	.filter((project) => Boolean(project.github))
	.map((project) => ({
		id: project.id,
		title: project.title,
		description: 'Implementierungsdetails und reproduzierbare Arbeitsabläufe für Open Source.',
		tags: project.tags.slice(0, 3),
		url: project.github
	}));

function extractGithubUsername(profileUrl: string | undefined): string | null {
	if (!profileUrl) return null;

	try {
		const url = new URL(profileUrl);
		if (!url.hostname.includes('github.com')) return null;
		const [candidate] = url.pathname.split('/').filter(Boolean);
		if (!candidate || candidate === 'github') return null;
		return candidate;
	} catch {
		return null;
	}
}

function createFallbackData(note: string): OpenSourceData {
	const githubProfileUrl = siteConfig.socials.find((social) => social.platform === 'GitHub')?.url;

	return {
		source: 'fallback',
		profileUrl: githubProfileUrl,
		profileLabel: 'GitHub-Profil besuchen',
		note,
		stats: [
			{ label: 'Öffentliche Repositories', value: `${fallbackContributions.length}` },
			{
				label: 'Ausgewählte Projekte',
				value: `${projects.filter((project) => project.featured).length}`
			},
			{ label: 'Verknüpfte Kanäle', value: `${siteConfig.socials.length}` }
		],
		contributions: fallbackContributions
	};
}

async function fetchGitHubOpenSourceData(username: string): Promise<OpenSourceData | null> {
	const headers: HeadersInit = {
		Accept: 'application/vnd.github+json',
		'User-Agent': 'merckel.dev'
	};

	if (env.GITHUB_TOKEN) {
		headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`;
	}

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), GITHUB_FETCH_TIMEOUT_MS);

	try {
		const [userResponse, reposResponse] = await Promise.all([
			fetch(`https://api.github.com/users/${username}`, {
				headers,
				signal: controller.signal
			}),
			fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`, {
				headers,
				signal: controller.signal
			})
		]);

		if (!userResponse.ok || !reposResponse.ok) {
			return null;
		}

		const userData = (await userResponse.json()) as {
			public_repos?: number;
			html_url?: string;
		};
		const reposData = (await reposResponse.json()) as Array<{
			id: number;
			name: string;
			description: string | null;
			html_url: string;
			topics?: string[];
		}>;

		const contributions = reposData.map((repo) => ({
			id: `${repo.id}`,
			title: repo.name,
			description: repo.description ?? '',
			tags: repo.topics?.slice(0, 3) ?? [],
			url: repo.html_url
		}));

		const featuredCount = projects.filter((project) => project.featured).length;

		return {
			source: 'github',
			profileUrl: userData.html_url,
			profileLabel: `@${username} on GitHub`,
			note: env.GITHUB_TOKEN
				? 'Live-GitHub-Daten werden alle 24 Stunden serverseitig aktualisiert.'
				: 'Live-GitHub-Daten (nicht authentifiziert) werden alle 24 Stunden serverseitig aktualisiert.',
			stats: [
				{ label: 'Öffentliche Repositories', value: `${userData.public_repos ?? 0}` },
				{ label: 'Ausgewählte Projekte', value: `${featuredCount}` },
				{ label: 'Verfolgte Repositories', value: `${contributions.length}` }
			],
			contributions
		};
	} finally {
		clearTimeout(timeout);
	}
}

export const load = async () => {
	const now = Date.now();

	// L1: In-memory cache (5 min) — avoids DB round-trip on rapid requests
	if (inMemoryCache && inMemoryCache.expiresAt > now) {
		const topTools = await getTopTools(3);
		return { openSource: inMemoryCache.data, topTools };
	}

	const githubProfileUrl = siteConfig.socials.find((social) => social.platform === 'GitHub')?.url;
	const githubUsername = extractGithubUsername(githubProfileUrl);

	if (!githubUsername) {
		const topTools = await getTopTools(3);
		const fallbackData = createFallbackData(
			'GitHub-Profil ist noch nicht konfiguriert, daher zeigt dieser Bereich lokale Portfolio-Highlights.'
		);
		inMemoryCache = { expiresAt: now + IN_MEMORY_TTL_MS, data: fallbackData };
		return { openSource: fallbackData, topTools };
	}

	const cacheKey = `github:open-source:${githubUsername}`;

	// Parallel: fetch top tools + check DB cache simultaneously
	const [topTools, cachedData] = await Promise.all([getTopTools(3), getCachedGitHubData(cacheKey)]);

	// L2: DB cache (24h) — serves cached data without hitting GitHub API
	if (cachedData) {
		inMemoryCache = { expiresAt: now + IN_MEMORY_TTL_MS, data: cachedData };
		return { openSource: cachedData, topTools };
	}

	// Cache miss — fetch from GitHub API with timeout
	try {
		const githubData = await fetchGitHubOpenSourceData(githubUsername);
		const openSource =
			githubData ??
			createFallbackData(
				'GitHub-Daten sind vorübergehend nicht verfügbar, daher werden lokale Highlights angezeigt.'
			);

		inMemoryCache = { expiresAt: now + IN_MEMORY_TTL_MS, data: openSource };

		// Fire-and-forget: persist to DB cache (don't block response)
		void setCachedGitHubData(cacheKey, openSource);

		return { openSource, topTools };
	} catch {
		const fallbackData = createFallbackData(
			'GitHub-Datenanfrage fehlgeschlagen, daher werden lokale Highlights angezeigt.'
		);
		inMemoryCache = { expiresAt: now + IN_MEMORY_TTL_MS, data: fallbackData };
		return { openSource: fallbackData, topTools };
	}
};

export function __resetOpenSourceCache() {
	inMemoryCache = null;
}
