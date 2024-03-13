import { exec } from 'child_process';
import util from 'util';
import {
	VITE_SECRET_DB_HOST,
	VITE_SECRET_DB_USER,
	VITE_SECRET_DB_PW,
	VITE_SECRET_DB_NAME
} from '$env/static/private';

const execPromise = util.promisify(exec);
const commandWhitelist = ['-sV', '-sP', '-sT', '', '-v'];
const urlBlackList = ['.gov', '.mil'];
const urlRegex = /^[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([a-zA-Z0-9]*)$/;
const referer = 'https://merckel.dev/software/tools/nmap';
const origin = 'https://merckel.dev';

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

export async function POST({
	request,
	getClientAddress
}: {
	request: Request;
	getClientAddress(): string;
}) {
	const { host, command } = await request.json();
	let clientIpAddress;
	try {
		clientIpAddress =
			request.headers.get('cf-connecting-ip') ||
			request.headers.get('x-forwarded-for') ||
			getClientAddress();
	} catch (err) {
		return new Response('Invalid request', { status: 500 });
	}

	if (host === undefined || command === undefined) {
		return new Response('Invalid request', { status: 500 });
	}
	if (host.includes('merckel.dev')) {
		return new Response('Illegal content', { status: 500 });
	}
	if (!clientIpAddress) {
		return new Response('Invalid request', { status: 500 });
	}
	if (!urlRegex.test(host)) {
		return new Response(
			'Illegal content has been detected. If necessary, this incident will be reported to the authorities.',
			{ status: 500 }
		);
	}
	if (urlBlackList.some((url) => host.includes(url))) {
		return new Response('Illegal remote host', { status: 500 });
	}
	if (request.headers.get('referer') !== referer || request.headers.get('origin') !== origin) {
		return new Response('Illegal headers', { status: 500 });
	}
	for (const cmd of command.split(' ')) {
		if (!commandWhitelist.includes(cmd)) {
			return new Response('Illegal content', { status: 500 });
		}
	}

	try {
		await pool.query('insert into scans (id, rhost, command, ip) values ($1, $2, $3, $4)', [
			await randomBigInt(),
			host,
			command,
			clientIpAddress
		]);
	} catch (err) {
		console.error(err);
		return new Response('Something went wrong', { status: 500 });
	}

	try {
		const { stdout, stderr } = await execPromise(`nmap -T4 ${host} ${command} -oN -`);
		if (stderr) {
			console.log('stderr:', stderr);
			return new Response('Your request failed!', { status: 500 });
		}
		return new Response(stdout.replace(/(\n|\r\n)/g, '<br>'), { status: 200 });
	} catch (err) {
		console.error(err);
	}
}
