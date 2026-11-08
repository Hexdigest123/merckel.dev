/** Upper bound for a single reconnect delay. */
export const DB_RETRY_MAX_DELAY_MS = 5_000;

/**
 * Parses a positive integer from an environment value, falling back when the
 * value is missing, empty, zero or not a number.
 */
export function parsePositiveInt(value: string | undefined, fallback: number): number {
	const parsed = Number(value);
	return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * Exponential reconnect delay for postgres.js.
 *
 * postgres.js calls `backoff(retries)` after a failed connection and multiplies the
 * result by 1000, so the return value is in **seconds**. `retries` starts at 1 for the
 * first failure. The exponent stops growing after `maxRetries` doublings and the delay
 * never exceeds {@link DB_RETRY_MAX_DELAY_MS}.
 */
export function reconnectDelaySeconds(retries: number, baseDelayMs: number, maxRetries: number) {
	const exponent = Math.min(Math.max(retries - 1, 0), maxRetries);
	return Math.min(baseDelayMs * 2 ** exponent, DB_RETRY_MAX_DELAY_MS) / 1000;
}
