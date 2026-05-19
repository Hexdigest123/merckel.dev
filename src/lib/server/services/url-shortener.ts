import { db } from '$lib/server/db';
import { urls } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';

const BLACKLISTED_HOSTS = ['merckel.dev', 'h3x.to'];
const BLACKLISTED_HOST_SUFFIXES = ['.internal', '.local', '.localhost', '.lan', '.intranet'];
const BLACKLISTED_HOST_NAMES = new Set([
	'localhost',
	'ip6-localhost',
	'ip6-loopback',
	'broadcasthost'
]);
const SHORT_CODE_LENGTH = 6;
const SHORT_CODE_ALPHABET = '23456789abcdefghjkmnpqrstuvwxyz';
const MAX_COLLISION_RETRIES = 3;

function isPrivateIPv4(hostname: string): boolean {
	const parts = hostname.split('.');
	if (parts.length !== 4) return false;
	const octets = parts.map((p) => Number(p));
	if (octets.some((o) => !Number.isInteger(o) || o < 0 || o > 255)) return false;

	const [a, b] = octets;
	if (a === 10) return true;
	if (a === 127) return true;
	if (a === 0) return true;
	if (a === 169 && b === 254) return true;
	if (a === 172 && b >= 16 && b <= 31) return true;
	if (a === 192 && b === 168) return true;
	if (a === 100 && b >= 64 && b <= 127) return true;
	if (a >= 224) return true;
	return false;
}

function isPrivateIPv6(hostname: string): boolean {
	const h = hostname.replace(/^\[|\]$/g, '').toLowerCase();
	if (!h.includes(':')) return false;
	if (h === '::1' || h === '::' || h === '0:0:0:0:0:0:0:1' || h === '0:0:0:0:0:0:0:0') return true;
	if (h.startsWith('fc') || h.startsWith('fd')) return true;
	if (h.startsWith('fe80:') || h.startsWith('fe80')) return true;
	if (h.startsWith('ff')) return true;
	if (h.startsWith('::ffff:')) {
		const v4 = h.slice('::ffff:'.length);
		return isPrivateIPv4(v4);
	}
	return false;
}

function isBlockedHost(hostname: string): boolean {
	const h = hostname.toLowerCase();
	if (BLACKLISTED_HOST_NAMES.has(h)) return true;
	for (const blocked of BLACKLISTED_HOSTS) {
		if (h === blocked || h.endsWith(`.${blocked}`)) return true;
	}
	for (const suffix of BLACKLISTED_HOST_SUFFIXES) {
		if (h.endsWith(suffix)) return true;
	}
	if (isPrivateIPv4(h)) return true;
	if (isPrivateIPv6(h)) return true;
	return false;
}

function generateShortCode(): string {
	const chars = SHORT_CODE_ALPHABET;
	let code = '';
	const bytes = new Uint8Array(SHORT_CODE_LENGTH);
	crypto.getRandomValues(bytes);
	for (let i = 0; i < SHORT_CODE_LENGTH; i++) {
		code += chars[bytes[i] % chars.length];
	}
	return code;
}

export interface UrlValidationResult {
	valid: boolean;
	cleanUrl?: string;
	error?: string;
}

export function validateUrl(input: string): UrlValidationResult {
	const trimmed = input.trim();
	if (!trimmed) {
		return { valid: false, error: 'URL is required.' };
	}

	let parsed: URL;
	try {
		parsed = new URL(trimmed);
	} catch {
		return { valid: false, error: 'Invalid URL format.' };
	}

	if (!['http:', 'https:'].includes(parsed.protocol)) {
		return { valid: false, error: 'Only HTTP and HTTPS URLs are allowed.' };
	}

	const hostname = parsed.hostname.toLowerCase();

	if (!hostname) {
		return { valid: false, error: 'URL must include a hostname.' };
	}

	if (isBlockedHost(hostname)) {
		return { valid: false, error: 'URLs pointing to internal or reserved hosts are not allowed.' };
	}

	const cleanUrl = `${parsed.protocol}//${parsed.host}${parsed.pathname.replace(/\/+$/, '') || '/'}${parsed.search}${parsed.hash}`;

	if (cleanUrl.length > 2048) {
		return { valid: false, error: 'URL is too long (max 2048 characters).' };
	}

	return { valid: true, cleanUrl };
}

export async function createShortUrl(input: string): Promise<{
	success: boolean;
	shortCode?: string;
	originalUrl?: string;
	error?: string;
}> {
	const validation = validateUrl(input);
	if (!validation.valid || !validation.cleanUrl) {
		return { success: false, error: validation.error };
	}

	if (!db) {
		return { success: false, error: 'Database is not available.' };
	}

	for (let attempt = 0; attempt < MAX_COLLISION_RETRIES; attempt++) {
		const shortCode = generateShortCode();

		try {
			await db.insert(urls).values({
				originalUrl: validation.cleanUrl,
				shortCode
			});

			return { success: true, shortCode, originalUrl: validation.cleanUrl };
		} catch (err: unknown) {
			const isUniqueViolation = err instanceof Error && err.message.includes('unique');
			if (!isUniqueViolation) {
				return { success: false, error: 'Database connection failed. Please try again later.' };
			}
		}
	}

	return { success: false, error: 'Failed to generate a unique short code. Please try again.' };
}

export async function resolveShortCode(
	code: string
): Promise<{ found: boolean; originalUrl?: string }> {
	if (!db) return { found: false };

	try {
		const [row] = await db.select().from(urls).where(eq(urls.shortCode, code)).limit(1);

		if (!row) return { found: false };

		await db
			.update(urls)
			.set({ clicks: sql`${urls.clicks} + 1` })
			.where(eq(urls.shortCode, code));

		return { found: true, originalUrl: row.originalUrl };
	} catch {
		return { found: false };
	}
}

export async function getShortCodeStats(code: string): Promise<{
	found: boolean;
	originalUrl?: string;
	shortCode?: string;
	clicks?: number;
	createdAt?: Date;
}> {
	if (!db) return { found: false };
	try {
		const [row] = await db.select().from(urls).where(eq(urls.shortCode, code)).limit(1);
		if (!row) return { found: false };
		return {
			found: true,
			originalUrl: row.originalUrl,
			shortCode: row.shortCode,
			clicks: row.clicks,
			createdAt: row.createdAt
		};
	} catch {
		return { found: false };
	}
}
