import { describe, expect, it } from 'vitest';
import { highlightJson } from './json-highlight';

function stripTags(html: string): string {
	return html
		.replace(/<[^>]+>/g, '')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&amp;/g, '&');
}

describe('highlightJson', () => {
	const json = JSON.stringify(
		{ version: '1.2.3', note: 'is true and null', id: 42, neg: -1.5e3, ok: false, none: null },
		null,
		2
	);
	const html = highlightJson(json);

	it('keeps the original text', () => {
		expect(stripTags(html)).toBe(json);
	});

	it('does not highlight numbers or literals inside strings', () => {
		expect(html).toContain('<span class="text-emerald-700">"1.2.3"</span>');
		expect(html).toContain('<span class="text-emerald-700">"is true and null"</span>');
	});

	it('highlights keys, numbers (including the sign), booleans and null', () => {
		expect(html).toContain('<span class="text-purple-700">"version"</span>:');
		expect(html).toContain('<span class="text-blue-700">42</span>');
		expect(html).toContain('<span class="text-blue-700">-1500</span>');
		expect(html).toContain('<span class="text-amber-700">false</span>');
		expect(html).toContain('<span class="text-slate-500">null</span>');
	});

	it('escapes HTML in values', () => {
		const output = highlightJson(JSON.stringify({ x: '</code><script>alert(1)</script>' }));
		expect(output).not.toContain('<script>');
		expect(output).toContain('&lt;script&gt;');
	});

	it('handles escaped quotes inside strings', () => {
		const input = JSON.stringify({ quote: 'say "hi" 2 times' });
		const output = highlightJson(input);
		expect(output).toContain('<span class="text-emerald-700">"say \\"hi\\" 2 times"</span>');
	});
});
