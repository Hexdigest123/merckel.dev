import { db } from '$lib/server/db';
import { apiCache } from '$lib/server/db/schema';
import type { OpenSourceData } from '$lib/types/content';
import { eq } from 'drizzle-orm';

const GITHUB_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export async function getCachedGitHubData(key: string): Promise<OpenSourceData | null> {
	if (!db) return null;

	try {
		const [row] = await db.select().from(apiCache).where(eq(apiCache.key, key)).limit(1);
		if (!row) return null;

		const age = Date.now() - row.fetchedAt.getTime();
		if (age > GITHUB_CACHE_TTL_MS) return null;

		return JSON.parse(row.data) as OpenSourceData;
	} catch (error) {
		console.error(`[github-cache] Failed to read cache for key "${key}":`, error);
		return null;
	}
}

export async function setCachedGitHubData(key: string, data: OpenSourceData): Promise<void> {
	if (!db) return;

	try {
		await db
			.insert(apiCache)
			.values({ key, data: JSON.stringify(data), fetchedAt: new Date() })
			.onConflictDoUpdate({
				target: apiCache.key,
				set: {
					data: JSON.stringify(data),
					fetchedAt: new Date()
				}
			});
	} catch (error) {
		console.error(`[github-cache] Failed to write cache for key "${key}":`, error);
	}
}
