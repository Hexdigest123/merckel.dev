import { env } from '$env/dynamic/private';

interface Bucket {
	count: number;
	resetAt: number;
}

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;
const SWEEP_INTERVAL_MS = 1_000;
let lastSweepAt = 0;

/**
 * Keeps the bucket map bounded. Expired buckets are swept at most once per second;
 * if the map is still full (e.g. under a flood of distinct keys), the oldest
 * buckets are dropped. `Map` iterates in insertion order, so those come first.
 */
function makeRoom(now: number) {
	if (buckets.size < MAX_BUCKETS) return;

	if (now - lastSweepAt >= SWEEP_INTERVAL_MS) {
		lastSweepAt = now;
		for (const [key, bucket] of buckets) {
			if (bucket.resetAt <= now) buckets.delete(key);
		}
	}

	let overflow = buckets.size - MAX_BUCKETS + 1;
	for (const key of buckets.keys()) {
		if (overflow-- <= 0) break;
		buckets.delete(key);
	}
}

export interface RateLimitResult {
	allowed: boolean;
	retryAfterSeconds: number;
}

export function rateLimit(
	key: string,
	limit: number,
	windowMs: number,
	now: number = Date.now()
): RateLimitResult {
	const bucket = buckets.get(key);

	if (!bucket || bucket.resetAt <= now) {
		buckets.delete(key);
		makeRoom(now);
		buckets.set(key, { count: 1, resetAt: now + windowMs });
		return { allowed: true, retryAfterSeconds: 0 };
	}

	if (bucket.count >= limit) {
		return {
			allowed: false,
			retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))
		};
	}

	bucket.count += 1;
	return { allowed: true, retryAfterSeconds: 0 };
}

function configuredXffDepth(): number {
	const depth = Number(env.XFF_DEPTH);
	return Number.isInteger(depth) && depth > 0 ? depth : 1;
}

/**
 * Identifies the client for rate limiting.
 *
 * Every proxy appends the address it received the request from to `X-Forwarded-For`,
 * so only the right-most entries are trustworthy; anything to the left can be forged
 * by the client. `xffDepth` is the number of trusted proxies in front of the app
 * (`XFF_DEPTH`, default 1), matching the semantics of `@sveltejs/adapter-node`.
 */
export function getClientKey(
	request: Request,
	getClientAddress: () => string,
	xffDepth: number = configuredXffDepth()
): string {
	const forwarded = request.headers.get('x-forwarded-for');
	if (forwarded) {
		const addresses = forwarded
			.split(',')
			.map((address) => address.trim())
			.filter(Boolean);
		const address = addresses[Math.max(0, addresses.length - xffDepth)];
		if (address) return address;
	}

	try {
		return getClientAddress();
	} catch {
		return 'unknown';
	}
}

export function __resetRateLimits() {
	buckets.clear();
	lastSweepAt = 0;
}
