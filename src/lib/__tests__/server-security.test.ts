import { describe, expect, it } from 'vitest';
import { validateUrl } from '$lib/server/services/url-shortener';
import { getClientKey, rateLimit, __resetRateLimits } from '$lib/server/services/rate-limit';
import { validateContactInput } from '$lib/server/services/contact';

describe('url shortener host validation (SSRF)', () => {
	it('rejects IPv4-mapped IPv6 loopback addresses in dot notation', () => {
		const result = validateUrl('http://[::ffff:127.0.0.1]/');
		expect(result.valid).toBe(false);
	});

	it('rejects IPv4-mapped IPv6 loopback addresses in hex notation', () => {
		const result = validateUrl('http://[::ffff:7f00:1]/');
		expect(result.valid).toBe(false);
	});

	it('rejects IPv4-mapped private ranges in hex notation', () => {
		expect(validateUrl('http://[::ffff:a00:1]/').valid).toBe(false);
		expect(validateUrl('http://[::ffff:ac10:1]/').valid).toBe(false);
	});

	it('allows IPv4-mapped public addresses in hex notation', () => {
		const result = validateUrl('http://[::ffff:808:808]/');
		expect(result.valid).toBe(true);
	});

	it('rejects alternate loopback encodings', () => {
		expect(validateUrl('http://2130706433/').valid).toBe(false);
		expect(validateUrl('http://0x7f.1/').valid).toBe(false);
		expect(validateUrl('http://127.1/').valid).toBe(false);
		expect(validateUrl('http://0177.0.0.1/').valid).toBe(false);
	});

	it('allows public hosts', () => {
		expect(validateUrl('https://example.com/some/path').valid).toBe(true);
	});
});

describe('rate limit client key', () => {
	it('ignores X-Forwarded-For unless TRUST_PROXY is set', () => {
		const request = new Request('http://localhost/', {
			headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' }
		});
		expect(getClientKey(request, () => '9.9.9.9')).toBe('9.9.9.9');
	});

	it('uses the leftmost X-Forwarded-For entry when TRUST_PROXY is enabled', () => {
		process.env.TRUST_PROXY = '1';
		try {
			const request = new Request('http://localhost/', {
				headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' }
			});
			expect(getClientKey(request, () => '9.9.9.9')).toBe('1.2.3.4');
		} finally {
			delete process.env.TRUST_PROXY;
		}
	});

	it('enforces the configured limit', () => {
		__resetRateLimits();
		const key = 'test-bucket';
		expect(rateLimit(key, 2, 1000).allowed).toBe(true);
		expect(rateLimit(key, 2, 1000).allowed).toBe(true);
		const blocked = rateLimit(key, 2, 1000);
		expect(blocked.allowed).toBe(false);
		expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
	});
});

describe('contact input validation (header injection)', () => {
	it('rejects names containing CR/LF characters', () => {
		const errors = validateContactInput({
			name: 'Alice\r\nBcc: victim@example.com',
			mail: 'alice@example.com',
			message: 'Hallo'
		});
		expect(errors).toContainEqual({ field: 'name', error: 'name is invalid' });
	});

	it('rejects NUL bytes in names', () => {
		const errors = validateContactInput({
			name: 'Alice\u0000',
			mail: 'alice@example.com',
			message: 'Hallo'
		});
		expect(errors).toContainEqual({ field: 'name', error: 'name is invalid' });
	});

	it('accepts valid input', () => {
		const errors = validateContactInput({
			name: 'Alice',
			mail: 'alice@example.com',
			message: 'Hallo'
		});
		expect(errors).toEqual([]);
	});
});
