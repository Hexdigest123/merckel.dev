import { describe, expect, it } from 'vitest';
import { computeTextDiff, formatTextDiff } from './text-diff';

describe('computeTextDiff', () => {
	it('numbers lines separately for the original and the modified text', () => {
		const { lines, additions, deletions } = computeTextDiff('a\nb\nc', 'a\nB\nc\nd');

		expect(additions).toBe(2);
		expect(deletions).toBe(1);
		expect(
			lines.map(({ kind, text, oldLineNumber, newLineNumber }) => [
				kind,
				text,
				oldLineNumber,
				newLineNumber
			])
		).toEqual([
			['unchanged', 'a', 1, 1],
			['removed', 'b', 2, undefined],
			['added', 'B', undefined, 2],
			['unchanged', 'c', 3, 3],
			['added', 'd', undefined, 4]
		]);
	});

	it('does not report a change for a missing newline at the end', () => {
		const { lines, additions, deletions } = computeTextDiff('a\nb', 'a\nb\nc');
		expect(deletions).toBe(0);
		expect(additions).toBe(1);
		expect(lines.filter((line) => line.kind !== 'unchanged').map((line) => line.text)).toEqual([
			'c'
		]);
	});

	it('ignores Windows line endings', () => {
		const result = computeTextDiff('a\r\nb\r\n', 'a\nb\n');
		expect(result.additions + result.deletions).toBe(0);
	});

	it('formats a unified plain-text diff', () => {
		expect(formatTextDiff(computeTextDiff('a\nb', 'a\nc').lines)).toBe('  a\n- b\n+ c');
	});
});
