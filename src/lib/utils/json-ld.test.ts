import { describe, expect, it } from 'vitest';
import { jsonLdScript, serializeJsonLd } from './json-ld';

describe('serializeJsonLd', () => {
	it('produces valid JSON', () => {
		expect(JSON.parse(serializeJsonLd({ name: 'Ada', url: 'https://example.com' }))).toEqual({
			name: 'Ada',
			url: 'https://example.com'
		});
	});

	it('cannot break out of the script element', () => {
		const output = serializeJsonLd({ name: '</script><script>alert(1)</script>' });
		expect(output).not.toContain('</script>');
		expect(JSON.parse(output).name).toBe('</script><script>alert(1)</script>');
	});
});

describe('jsonLdScript', () => {
	it('wraps the data in a single ld+json script element', () => {
		const html = jsonLdScript({ '@type': 'Person', name: '<b>' });
		expect(html).toBe(
			'<script type="application/ld+json">{"@type":"Person","name":"\\u003cb>"}</script>'
		);
	});
});
