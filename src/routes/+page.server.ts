import { env } from '$env/dynamic/private';
import { projects } from '$lib/data/projects';
import { siteConfig } from '$lib/data/site-config';

interface OpenSourceContribution {
	id: string;
	title: string;
	description: string;
	tags: string[];
	url?: string;
}

interface OpenSourceData {
	source: 'github' | 'fallback';
	profileUrl?: string;
	profileLabel: string;
	note: string;
	stats: Array<{ label: string; value: string }>;
	contributions: OpenSourceContribution[];
}

const OPEN_SOURCE_CACHE_TTL_MS = 60 * 60 * 1000;

let openSourceCache: { expiresAt: number; data: OpenSourceData } | null = null;

const fallbackContributions: OpenSourceContribution[] = projects
	.filter((project) => Boolean(project.github))
	.map((project) => ({
		id: project.id,
		title: project.title,
		description: 'Open-source ready implementation details and reproducible workflows.',
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
		profileLabel: 'Visit GitHub profile',
		note,
		stats: [
			{ label: 'Public repositories', value: `${fallbackContributions.length}` },
			{
				label: 'Featured builds',
				value: `${projects.filter((project) => project.featured).length}`
			},
			{ label: 'Linked channels', value: `${siteConfig.socials.length}` }
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

	const [userResponse, reposResponse] = await Promise.all([
		fetch(`https://api.github.com/users/${username}`, { headers }),
		fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`, { headers })
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
		description: repo.description ?? 'Community-maintained repository.',
		tags: repo.topics?.slice(0, 3) ?? [],
		url: repo.html_url
	}));

	const featuredCount = projects.filter((project) => project.featured).length;

	return {
		source: 'github',
		profileUrl: userData.html_url,
		profileLabel: `@${username} on GitHub`,
		note: env.GITHUB_TOKEN
			? 'Live GitHub data is cached server-side for one hour.'
			: 'Live GitHub data (unauthenticated mode) is cached server-side for one hour.',
		stats: [
			{ label: 'Public repositories', value: `${userData.public_repos ?? 0}` },
			{ label: 'Featured builds', value: `${featuredCount}` },
			{ label: 'Tracked repositories', value: `${contributions.length}` }
		],
		contributions
	};
}

export const load = async () => {
	const now = Date.now();
	if (openSourceCache && openSourceCache.expiresAt > now) {
		return { openSource: openSourceCache.data };
	}

	const githubProfileUrl = siteConfig.socials.find((social) => social.platform === 'GitHub')?.url;
	const githubUsername = extractGithubUsername(githubProfileUrl);

	if (!githubUsername) {
		const fallbackData = createFallbackData(
			'GitHub profile is not configured yet, so this section uses local portfolio highlights.'
		);
		openSourceCache = { expiresAt: now + OPEN_SOURCE_CACHE_TTL_MS, data: fallbackData };
		return { openSource: fallbackData };
	}

	try {
		const githubData = await fetchGitHubOpenSourceData(githubUsername);
		const openSource =
			githubData ??
			createFallbackData(
				'GitHub data is temporarily unavailable, so local highlights are shown instead.'
			);

		openSourceCache = { expiresAt: now + OPEN_SOURCE_CACHE_TTL_MS, data: openSource };
		return { openSource };
	} catch {
		const fallbackData = createFallbackData(
			'GitHub data request failed, so local highlights are shown instead.'
		);
		openSourceCache = { expiresAt: now + OPEN_SOURCE_CACHE_TTL_MS, data: fallbackData };
		return { openSource: fallbackData };
	}
};

export function __resetOpenSourceCache() {
	openSourceCache = null;
}
