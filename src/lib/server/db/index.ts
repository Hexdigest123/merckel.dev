import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '$env/dynamic/private';
import * as schema from './schema';

const connectionString = env.DATABASE_URL;

function createDb() {
	if (!connectionString) {
		return null;
	}

	const client = postgres(connectionString, {
		prepare: false,
		max: 10,
		idle_timeout: 20,
		connect_timeout: 10
	});

	return drizzle(client, { schema });
}

export const db = createDb();

export type Database = NonNullable<typeof db>;
