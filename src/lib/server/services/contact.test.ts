import { describe, expect, it } from 'vitest';
import { resolveSmtpPort, validateContactInput } from './contact';

describe('validateContactInput', () => {
	it('accepts a complete message', () => {
		expect(
			validateContactInput({ name: 'Ada', mail: 'ada@example.com', message: 'Hello!' })
		).toEqual([]);
	});

	it('reports every missing field', () => {
		expect(validateContactInput({ name: '', mail: '', message: '' }).map((e) => e.field)).toEqual([
			'name',
			'mail',
			'message'
		]);
	});

	it('rejects invalid or overlong values', () => {
		const errors = validateContactInput({
			name: 'x'.repeat(101),
			mail: 'not-an-email',
			message: 'y'.repeat(4001)
		});
		expect(errors.map((e) => e.error)).toEqual([
			'name is too long',
			'mail is invalid',
			'message is too long'
		]);
	});
});

describe('resolveSmtpPort', () => {
	it('uses the configured port', () => {
		expect(resolveSmtpPort('465')).toBe(465);
	});

	it('falls back to 587 for empty or invalid values (e.g. SMTP_PORT=)', () => {
		expect(resolveSmtpPort(undefined)).toBe(587);
		expect(resolveSmtpPort('')).toBe(587);
		expect(resolveSmtpPort('abc')).toBe(587);
		expect(resolveSmtpPort('70000')).toBe(587);
	});
});
