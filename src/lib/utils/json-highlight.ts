const TOKEN_PATTERN =
	/("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false)\b|\b(null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g;

const CLASS_NAMES = {
	key: 'text-purple-700',
	string: 'text-emerald-700',
	number: 'text-blue-700',
	boolean: 'text-amber-700',
	null: 'text-slate-500'
} as const;

function escapeHtml(value: string): string {
	return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function wrap(kind: keyof typeof CLASS_NAMES, text: string): string {
	return `<span class="${CLASS_NAMES[kind]}">${escapeHtml(text)}</span>`;
}

/**
 * Turns JSON text (as produced by `JSON.stringify`) into HTML with syntax colours.
 *
 * Tokens are matched in a single left-to-right pass, so digits or `true`/`null`
 * inside strings stay part of the string. All text is HTML-escaped, so the result
 * is safe to render with `{@html}`.
 */
export function highlightJson(json: string): string {
	let html = '';
	let lastIndex = 0;

	for (const match of json.matchAll(TOKEN_PATTERN)) {
		const [token, quoted, colon, boolean, nullValue, number] = match;
		html += escapeHtml(json.slice(lastIndex, match.index));

		if (quoted !== undefined) {
			html +=
				colon !== undefined ? wrap('key', quoted) + escapeHtml(colon) : wrap('string', quoted);
		} else if (boolean !== undefined) {
			html += wrap('boolean', boolean);
		} else if (nullValue !== undefined) {
			html += wrap('null', nullValue);
		} else if (number !== undefined) {
			html += wrap('number', number);
		}

		lastIndex = match.index + token.length;
	}

	return html + escapeHtml(json.slice(lastIndex));
}
