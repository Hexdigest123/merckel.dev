import type { ServerLoad } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import {
	VITE_SECRET_DB_HOST,
	VITE_SECRET_DB_USER,
	VITE_SECRET_DB_PW,
	VITE_SECRET_DB_NAME
} from '$env/static/private';

import pkg from 'pg';

const { Pool } = pkg;

const pool = new Pool({
	user: VITE_SECRET_DB_USER,
	host: VITE_SECRET_DB_HOST,
	database: VITE_SECRET_DB_NAME,
	password: VITE_SECRET_DB_PW,
	port: 5432
});

export const load: ServerLoad = async (request) => {
	const id = request.params.id;
	let response;
	console.log(id);
	try {
		response = await pool.query('select url from url where short = $1', [id]);
	} catch (err) {
		console.error(err);
	}
	if (!response) throw redirect(308, 'https://merckel.dev');
	if (response.rows.length > 0) {
		throw redirect(308, response.rows[0].url);
	} else {
		throw redirect(308, 'https://merckel.dev');
	}
};
