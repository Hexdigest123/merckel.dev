import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '$env/dynamic/private';
import * as schema from './schema';

const connectionString = env.DATABASE_URL;
const DB_MAX_RETRIES = Number(env.DB_MAX_RETRIES) || 3;
const DB_RETRY_BASE_DELAY_MS = Number(env.DB_RETRY_BASE_DELAY_MS) || 200;

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
		backoff(retryCount: number) {
			if (retryCount >= DB_MAX_RETRIES) return 0;
			return Math.min(DB_RETRY_BASE_DELAY_MS * Math.pow(2, retryCount), 5_000);
		}
	});

	return drizzle(client, { schema });
}

export const db = createDb();

export type Database = NonNullable<typeof db>;
