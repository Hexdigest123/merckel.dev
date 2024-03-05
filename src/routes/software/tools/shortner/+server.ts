import {
	VITE_SECRET_DB_HOST,
	VITE_SECRET_DB_USER,
	VITE_SECRET_DB_PW,
	VITE_SECRET_DB_NAME
} from '$env/static/private';

import pkg from 'pg';
import crypto from 'crypto';

const { Pool } = pkg;

const pool = new Pool({
	user: VITE_SECRET_DB_USER,
	host: VITE_SECRET_DB_HOST,
	database: VITE_SECRET_DB_NAME,
	password: VITE_SECRET_DB_PW,
	port: 5432
});

async function randomBigInt(): Promise<bigint | undefined> {
	const buffer = crypto.randomBytes(7);
	const hex = buffer.toString('hex');
	const id = BigInt(`0x${hex}`);
	try {
		const response = await pool.query('select id from url where id = $1', [id]);
		if (response.rows.length > 0) {
			randomBigInt();
		}
	} catch (err) {
		return undefined;
	}
	return BigInt(`0x${hex}`);
}

async function randomString(length: number = 6): Promise<string | undefined> {
	const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
	let result = '';
	for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
	try {
		const response = await pool.query('select short from url where short = $1', [result]);
		if (response.rows.length > 0) {
			randomString(6);
		}
	} catch (err) {
		return undefined;
	}
	return result;
}

async function addToDB(url: string): Promise<string | undefined> {
	const id = await randomBigInt();
	const short = await randomString();
	if (id === undefined || short === undefined) return undefined;

	try {
		await pool.query('insert into url (id, url, short) values ($1, $2, $3)', [id, url, short]);
		return short;
	} catch (err) {
		console.error(err);
		return undefined;
	}
}

async function checkIfExists(url: string): Promise<string | undefined | boolean> {
	try {
		let queryResponse = await pool.query('select short from url where url = $1', [url]);
		if (queryResponse.rows.length > 0) {
			return queryResponse.rows[0].short;
		}
	} catch (err) {
		console.error(err);
		return false;
	}
	return undefined;
}

function isValid(url: string): boolean {
	if (url.includes('merckel.dev')) return false;
	if (!url.includes('https://')) return false;
	return true;
}

export async function POST({ request }: { request: Request }) {
	const data = await request.json();
	if (!isValid(data.url)) {
		return new Response('Illegal content', { status: 500 });
	}
	if (data.url === undefined) {
		return new Response('Missing URL parameter', { status: 500 });
	}
	const url = data.url.toLowerCase();
	const exists = await checkIfExists(url);
	if (exists !== undefined && typeof exists === 'string') {
		return new Response(`https://merckel.dev/s/${exists}`, { status: 200 });
	} else if (exists === false) {
		return new Response('Failed checking if exists', { status: 500 });
	}
	const newURL = await addToDB(url);
	if (newURL !== undefined) {
		return new Response(`https://merckel.dev/s/${newURL}`, { status: 200 });
	}
	return new Response('Failed creating URL', { status: 500 });
}
