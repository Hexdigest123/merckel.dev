import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js/lib/core';

import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import go from 'highlight.js/lib/languages/go';
import javascript from 'highlight.js/lib/languages/javascript';
import jsonLang from 'highlight.js/lib/languages/json';
import python from 'highlight.js/lib/languages/python';
import rust from 'highlight.js/lib/languages/rust';
import sql from 'highlight.js/lib/languages/sql';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('json', jsonLang);
hljs.registerLanguage('css', css);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('svelte', xml);
hljs.registerLanguage('go', go);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('yaml', yaml);

/**
 * Highlights a fenced code block. Unknown or missing languages are returned
 * unchanged, which tells marked-highlight to escape the code as plain text.
 * (The core highlight.js build has no `plaintext` grammar, so asking for one throws.)
 */
function highlightCode(code: string, lang: string): string {
	if (!lang || !hljs.getLanguage(lang)) return code;
	return hljs.highlight(code, { language: lang, ignoreIllegals: true }).value;
}

function createRenderer(breaks: boolean): Marked {
	const instance = new Marked(
		markedHighlight({ langPrefix: 'hljs language-', highlight: highlightCode })
	);
	instance.use({ gfm: true, breaks });
	return instance;
}

const renderers = { strict: createRenderer(false), breaks: createRenderer(true) };

export interface MarkdownOptions {
	/** Turn single line breaks into `<br>` (GitHub comment style). */
	breaks?: boolean;
}

/**
 * Renders Markdown to HTML with syntax-highlighted code blocks.
 *
 * The output is **not** sanitised. Only use it directly for trusted content and run
 * user input through a sanitiser such as DOMPurify.
 */
export function renderMarkdown(content: string, options: MarkdownOptions = {}): string {
	const renderer = options.breaks ? renderers.breaks : renderers.strict;
	return renderer.parse(content, { async: false });
}
