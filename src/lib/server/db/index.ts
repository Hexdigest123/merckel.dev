import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '$env/dynamic/private';
import { parsePositiveInt, reconnectDelaySeconds } from './backoff';
import * as schema from './schema';

const connectionString = env.DATABASE_URL;
const DB_MAX_RETRIES = parsePositiveInt(env.DB_MAX_RETRIES, 3);
const DB_RETRY_BASE_DELAY_MS = parsePositiveInt(env.DB_RETRY_BASE_DELAY_MS, 200);

function createDb() {
	if (!connectionString) {
		return null;
	}

	const client = postgres(connectionString, {
		prepare: false,
		max: 10,
		idle_timeout: 20,
		connect_timeout: 10,
		max_lifetime: 60 * 30,
		backoff: (retries: number) =>
			reconnectDelaySeconds(retries, DB_RETRY_BASE_DELAY_MS, DB_MAX_RETRIES)
	});

	return drizzle(client, { schema });
}

export const db = createDb();

export type Database = NonNullable<typeof db>;
