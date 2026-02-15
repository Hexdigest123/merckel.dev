import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { sql } from 'drizzle-orm';

export const GET: RequestHandler = async () => {
	let dbStatus = 'disconnected';

	try {
		if (db) {
			await db.execute(sql`SELECT 1`);
			dbStatus = 'connected';
		}
	} catch {
		dbStatus = 'error';
	}

	return json({
		status: 'ok',
		db: dbStatus,
		uptime: Math.floor(process.uptime())
	});
};
