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

	it('rejects control characters in the name (mail header injection)', () => {
		const errors = validateContactInput({
			name: 'Ada\r\nBcc: attacker@example.com',
			mail: 'ada@example.com',
			message: 'Hello!'
		});
		expect(errors).toEqual([{ field: 'name', error: 'name contains invalid characters' }]);
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
