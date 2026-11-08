/**
 * Serialises structured data for a `<script type="application/ld+json">` block.
 * `<` is escaped so values can never close the script element (`</script>`).
 */
export function serializeJsonLd(data: unknown): string {
	return JSON.stringify(data).replace(/</g, '\\u003c');
}

/** Complete `<script type="application/ld+json">` element for use with `{@html}`. */
export function jsonLdScript(data: unknown): string {
	return `<script type="application/ld+json">${serializeJsonLd(data)}</script>`;
}
