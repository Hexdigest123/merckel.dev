import { db } from '$lib/server/db';
import { toolUsage } from '$lib/server/db/schema';
import { webTools } from '$lib/data/web-tools';
import type { WebToolWithUsage } from '$lib/types/content';
import { desc, sql } from 'drizzle-orm';

function withDefaults(limit?: number): WebToolWithUsage[] {
	return webTools.map((tool) => ({ ...tool, usageCount: 0 })).slice(0, limit);
}

export async function incrementUsage(toolId: string): Promise<void> {
	const validTool = webTools.find((t) => t.id === toolId);
	if (!validTool || !db) return;

	await db
		.insert(toolUsage)
		.values({ toolId, usageCount: 1, lastUsedAt: new Date() })
		.onConflictDoUpdate({
			target: toolUsage.toolId,
			set: {
				usageCount: sql`${toolUsage.usageCount} + 1`,
				lastUsedAt: new Date()
			}
		});
}

export async function getTopTools(limit = 3): Promise<WebToolWithUsage[]> {
	if (!db) return withDefaults(limit);

	try {
		const rows = await db.select().from(toolUsage).orderBy(desc(toolUsage.usageCount)).limit(limit);
		const usageMap = new Map(rows.map((r) => [r.toolId, r.usageCount]));

		return webTools
			.map((tool) => ({ ...tool, usageCount: usageMap.get(tool.id) ?? 0 }))
			.sort((a, b) => b.usageCount - a.usageCount)
			.slice(0, limit);
	} catch {
		return withDefaults(limit);
	}
}

export async function getAllToolsWithUsage(): Promise<WebToolWithUsage[]> {
	if (!db) return withDefaults();

	try {
		const rows = await db.select().from(toolUsage);
		const usageMap = new Map(rows.map((r) => [r.toolId, r.usageCount]));

		return webTools
			.map((tool) => ({ ...tool, usageCount: usageMap.get(tool.id) ?? 0 }))
			.sort((a, b) => b.usageCount - a.usageCount);
	} catch {
		return withDefaults();
	}
}
