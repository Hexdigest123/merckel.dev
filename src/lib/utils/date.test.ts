import { describe, expect, it } from 'vitest';
import { formatLongDate, yearOf } from './date';

describe('formatLongDate', () => {
	it('formats ISO dates without shifting them into the previous day', () => {
		// 2025-01-01 is parsed as UTC midnight; in America/* time zones a local
		// format would print 31 December 2024.
		expect(formatLongDate('2025-01-01', 'en')).toBe('January 1, 2025');
		expect(formatLongDate('2025-10-12', 'de')).toBe('12. Oktober 2025');
	});

	it('returns invalid input unchanged', () => {
		expect(formatLongDate('soon', 'en')).toBe('soon');
	});
});

describe('yearOf', () => {
	it('returns the UTC calendar year', () => {
		expect(yearOf('2025-01-01')).toBe('2025');
		expect(yearOf('invalid')).toBe('');
	});
});
