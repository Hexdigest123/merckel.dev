import { pgTable, uuid, text, timestamp, integer, varchar } from 'drizzle-orm/pg-core';

export const urls = pgTable('urls', {
	id: uuid('id').primaryKey().defaultRandom(),
	originalUrl: text('original_url').notNull(),
	shortCode: varchar('short_code', { length: 12 }).unique().notNull(),
	clicks: integer('clicks').default(0).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const toolUsage = pgTable('tool_usage', {
	toolId: varchar('tool_id', { length: 64 }).primaryKey(),
	usageCount: integer('usage_count').default(0).notNull(),
	lastUsedAt: timestamp('last_used_at').defaultNow().notNull()
});
