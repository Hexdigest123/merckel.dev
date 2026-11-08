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
const MAX_URL_LENGTH = 2048;
/** PostgreSQL SQLSTATE for `unique_violation`. */
const PG_UNIQUE_VIOLATION = '23505';

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

/**
 * Extracts an IPv4 address embedded in an IPv6 address (IPv4-mapped `::ffff:a.b.c.d`
 * or NAT64 `64:ff9b::a.b.c.d`). The WHATWG URL parser serialises the IPv4 part as two
 * hex groups (`::ffff:7f00:1`), so both notations are handled.
 */
function embeddedIPv4(address: string): string | null {
	const match = address.match(/^(?:::ffff:|64:ff9b::)(.+)$/);
	if (!match) return null;

	const tail = match[1];
	if (tail.includes('.')) return tail;

	const groups = tail.split(':');
	if (groups.length !== 2 || !groups.every((group) => /^[0-9a-f]{1,4}$/.test(group))) {
		return null;
	}

	const [high, low] = groups.map((group) => Number.parseInt(group, 16));
	return [high >> 8, high & 0xff, low >> 8, low & 0xff].join('.');
}

function isPrivateIPv6(hostname: string): boolean {
	const h = hostname.replace(/^\[|\]$/g, '').toLowerCase();
	if (!h.includes(':')) return false;
	if (h === '::1' || h === '::' || h === '0:0:0:0:0:0:0:1' || h === '0:0:0:0:0:0:0:0') return true;
	// Unique local (fc00::/7), link-local (fe80::/10) and multicast (ff00::/8). The URL
	// parser drops leading zeros, so these prefixes always form a full 4-digit group.
	if (/^f[cd][0-9a-f]{2}:/.test(h)) return true;
	if (/^fe[89ab][0-9a-f]:/.test(h)) return true;
	if (/^ff[0-9a-f]{2}:/.test(h)) return true;

	const v4 = embeddedIPv4(h);
	return v4 !== null && isPrivateIPv4(v4);
}

function isBlockedHost(hostname: string): boolean {
	const h = hostname.toLowerCase().replace(/\.$/, '');
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

/**
 * Drizzle wraps driver errors in `DrizzleQueryError` and keeps the original
 * postgres.js error as `cause`, so the SQLSTATE has to be looked up along the chain.
 */
export function isUniqueViolation(error: unknown): boolean {
	let current: unknown = error;
	for (let depth = 0; depth < 5 && current; depth++) {
		if (
			typeof current === 'object' &&
			'code' in current &&
			(current as { code?: unknown }).code === PG_UNIQUE_VIOLATION
		) {
			return true;
		}
		current = typeof current === 'object' ? (current as { cause?: unknown }).cause : undefined;
	}
	return false;
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

	// Keep the target exactly as entered (path, trailing slash, query and fragment), but
	// never store embedded credentials.
	parsed.username = '';
	parsed.password = '';
	const cleanUrl = parsed.href;

	if (cleanUrl.length > MAX_URL_LENGTH) {
		return { valid: false, error: `URL is too long (max ${MAX_URL_LENGTH} characters).` };
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
			if (!isUniqueViolation(err)) {
				console.error('[url-shortener] Failed to store short URL:', err);
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
		// Look up and count the click in a single atomic statement.
		const [row] = await db
			.update(urls)
			.set({ clicks: sql`${urls.clicks} + 1` })
			.where(eq(urls.shortCode, code))
			.returning({ originalUrl: urls.originalUrl });

		return row ? { found: true, originalUrl: row.originalUrl } : { found: false };
	} catch (error) {
		console.error(`[url-shortener] Failed to resolve short code "${code}":`, error);
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
	} catch (error) {
		console.error(`[url-shortener] Failed to load stats for "${code}":`, error);
		return { found: false };
	}
}
