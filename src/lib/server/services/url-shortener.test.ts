import { describe, expect, it } from 'vitest';
import { isUniqueViolation, validateUrl } from './url-shortener';

describe('validateUrl', () => {
	it('keeps the URL exactly as entered (trailing slash, query and fragment)', () => {
		expect(validateUrl('  https://example.com/docs/?a=1&b=2#intro  ')).toEqual({
			valid: true,
			cleanUrl: 'https://example.com/docs/?a=1&b=2#intro'
		});
		expect(validateUrl('https://example.com').cleanUrl).toBe('https://example.com/');
	});

	it('removes embedded credentials', () => {
		expect(validateUrl('https://user:secret@example.com/path').cleanUrl).toBe(
			'https://example.com/path'
		);
	});

	it('rejects empty, malformed and non-http URLs', () => {
		expect(validateUrl('').valid).toBe(false);
		expect(validateUrl('not a url').valid).toBe(false);
		expect(validateUrl('javascript:alert(1)').valid).toBe(false);
		expect(validateUrl('ftp://example.com/file').valid).toBe(false);
	});

	it.each([
		'http://localhost:3000',
		'http://127.0.0.1',
		'http://2130706433',
		'http://10.1.2.3',
		'http://192.168.0.10',
		'http://169.254.169.254/latest/meta-data',
		'http://[::1]/',
		'http://[::ffff:127.0.0.1]/',
		'http://[::ffff:10.0.0.1]/',
		'http://[fd00::1]/',
		'http://[fe80::1]/',
		'http://[febf::1]/',
		'http://printer.local/',
		'https://merckel.dev/s/abc',
		'https://www.merckel.dev/',
		'https://merckel.dev./'
	])('rejects internal or own hosts: %s', (url) => {
		expect(validateUrl(url).valid).toBe(false);
	});

	it.each(['https://example.com', 'http://[2001:db8::1]/', 'https://8.8.8.8/'])(
		'accepts public hosts: %s',
		(url) => {
			expect(validateUrl(url).valid).toBe(true);
		}
	);

	it('rejects URLs longer than 2048 characters', () => {
		expect(validateUrl(`https://example.com/${'a'.repeat(2100)}`).valid).toBe(false);
	});
});

describe('isUniqueViolation', () => {
	it('finds the SQLSTATE on a wrapped driver error', () => {
		// Drizzle wraps postgres.js errors: DrizzleQueryError -> cause: PostgresError
		const driverError = Object.assign(new Error('duplicate key value'), { code: '23505' });
		const wrapped = new Error('Failed query: insert into "urls" ...', { cause: driverError });
		expect(isUniqueViolation(wrapped)).toBe(true);
		expect(isUniqueViolation(driverError)).toBe(true);
	});

	it('ignores other errors, even if the message mentions "unique"', () => {
		const wrapped = new Error('Failed query ... params: https://example.com/unique-page', {
			cause: Object.assign(new Error('connection refused'), { code: 'ECONNREFUSED' })
		});
		expect(isUniqueViolation(wrapped)).toBe(false);
		expect(isUniqueViolation(null)).toBe(false);
		expect(isUniqueViolation('23505')).toBe(false);
	});
});
