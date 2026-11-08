import { beforeEach, describe, expect, it } from 'vitest';
import { __resetRateLimits, getClientKey, rateLimit } from './rate-limit';

function requestWithXff(value?: string): Request {
	const headers = new Headers();
	if (value !== undefined) headers.set('x-forwarded-for', value);
	return new Request('http://localhost/api/test', { method: 'POST', headers });
}

describe('getClientKey', () => {
	const socketAddress = () => '172.18.0.1';

	it('uses the address appended by the trusted proxy, not the client-controlled one', () => {
		// The client sent "X-Forwarded-For: 6.6.6.6"; the reverse proxy appended the real address.
		expect(getClientKey(requestWithXff('6.6.6.6, 203.0.113.7'), socketAddress, 1)).toBe(
			'203.0.113.7'
		);
	});

	it('supports multiple trusted proxies via the depth', () => {
		expect(getClientKey(requestWithXff('6.6.6.6, 203.0.113.7, 10.0.0.2'), socketAddress, 2)).toBe(
			'203.0.113.7'
		);
	});

	it('uses the left-most entry when the chain is shorter than the depth', () => {
		expect(getClientKey(requestWithXff('203.0.113.7'), socketAddress, 3)).toBe('203.0.113.7');
	});

	it('falls back to the socket address without X-Forwarded-For', () => {
		expect(getClientKey(requestWithXff(), socketAddress, 1)).toBe('172.18.0.1');
		expect(getClientKey(requestWithXff(' , '), socketAddress, 1)).toBe('172.18.0.1');
	});

	it('returns "unknown" if the address cannot be determined', () => {
		const throwing = () => {
			throw new Error('no address');
		};
		expect(getClientKey(requestWithXff(), throwing, 1)).toBe('unknown');
	});
});

describe('rateLimit', () => {
	beforeEach(() => {
		__resetRateLimits();
	});

	it('allows requests up to the limit and reports the retry delay', () => {
		const now = 1_000_000;
		expect(rateLimit('client', 2, 60_000, now).allowed).toBe(true);
		expect(rateLimit('client', 2, 60_000, now + 1).allowed).toBe(true);

		const blocked = rateLimit('client', 2, 60_000, now + 1_000);
		expect(blocked.allowed).toBe(false);
		expect(blocked.retryAfterSeconds).toBe(59);
	});

	it('starts a new window once the old one expired', () => {
		const now = 1_000_000;
		rateLimit('client', 1, 1_000, now);
		expect(rateLimit('client', 1, 1_000, now + 500).allowed).toBe(false);
		expect(rateLimit('client', 1, 1_000, now + 1_000).allowed).toBe(true);
	});

	it('keeps memory bounded by evicting the oldest buckets', () => {
		const now = 1_000_000;
		rateLimit('first', 1, 60_000, now);
		expect(rateLimit('first', 1, 60_000, now).allowed).toBe(false);

		for (let i = 0; i < 10_000; i++) {
			rateLimit(`flood-${i}`, 1, 60_000, now);
		}

		// "first" was the oldest bucket and has been evicted.
		expect(rateLimit('first', 1, 60_000, now).allowed).toBe(true);
	});
});
