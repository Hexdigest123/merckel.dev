import { describe, expect, it } from 'vitest';
import { DB_RETRY_MAX_DELAY_MS, parsePositiveInt, reconnectDelaySeconds } from './backoff';

describe('reconnectDelaySeconds', () => {
	it('returns seconds, because postgres.js multiplies the value by 1000', () => {
		// First failure with a 200ms base must wait 0.2s, not 200s.
		expect(reconnectDelaySeconds(1, 200, 3)).toBe(0.2);
	});

	it('doubles the delay per retry until the retry cap is reached', () => {
		expect(reconnectDelaySeconds(2, 200, 3)).toBe(0.4);
		expect(reconnectDelaySeconds(3, 200, 3)).toBe(0.8);
		expect(reconnectDelaySeconds(4, 200, 3)).toBe(1.6);
		expect(reconnectDelaySeconds(10, 200, 3)).toBe(1.6);
	});

	it('never exceeds the maximum delay', () => {
		expect(reconnectDelaySeconds(20, 1_000, 20)).toBe(DB_RETRY_MAX_DELAY_MS / 1000);
	});

	it('handles retries below one', () => {
		expect(reconnectDelaySeconds(0, 200, 3)).toBe(0.2);
	});
});

describe('parsePositiveInt', () => {
	it('parses positive integers', () => {
		expect(parsePositiveInt('5', 3)).toBe(5);
	});

	it('falls back for missing, empty, zero, negative or invalid values', () => {
		expect(parsePositiveInt(undefined, 3)).toBe(3);
		expect(parsePositiveInt('', 3)).toBe(3);
		expect(parsePositiveInt('0', 3)).toBe(3);
		expect(parsePositiveInt('-1', 3)).toBe(3);
		expect(parsePositiveInt('abc', 3)).toBe(3);
		expect(parsePositiveInt('1.5', 3)).toBe(3);
	});
});
