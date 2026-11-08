import { describe, expect, it } from 'vitest';
import { renderMarkdown } from './markdown';

describe('renderMarkdown', () => {
	it('renders fenced code blocks without a language as escaped text', () => {
		// Regression: the preview used to request the unregistered "plaintext" grammar and threw.
		const html = renderMarkdown('```\n<b>plain</b>\n```');
		expect(html).toContain('<pre><code>&lt;b&gt;plain&lt;/b&gt;');
	});

	it('renders code blocks in unknown languages as escaped text', () => {
		const html = renderMarkdown('```php\necho "<b>";\n```');
		expect(html).toContain('class="hljs language-php"');
		expect(html).toContain('&lt;b&gt;');
	});

	it('highlights known languages', () => {
		const html = renderMarkdown('```typescript\nconst answer: number = 42;\n```');
		expect(html).toContain('<span class="hljs-keyword">const</span>');
	});

	it('only converts single line breaks when asked to', () => {
		expect(renderMarkdown('a\nb')).not.toContain('<br>');
		expect(renderMarkdown('a\nb', { breaks: true })).toContain('<br>');
	});
});
