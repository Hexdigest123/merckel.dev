const WORDS_PER_MINUTE = 200;

/**
 * Strip markdown syntax to get plain text for accurate word counting.
 * Removes code blocks, inline code, images, links, headings, bold/italic markers.
 */
function stripMarkdown(markdown: string): string {
	return (
		markdown
			// Remove code blocks (``` ... ```)
			.replace(/```[\s\S]*?```/g, '')
			// Remove inline code
			.replace(/`[^`]+`/g, '')
			// Remove images ![alt](url)
			.replace(/!\[.*?\]\(.*?\)/g, '')
			// Remove links but keep text [text](url) → text
			.replace(/\[([^\]]+)\]\(.*?\)/g, '$1')
			// Remove heading markers
			.replace(/^#{1,6}\s+/gm, '')
			// Remove bold/italic markers
			.replace(/(\*{1,3}|_{1,3})(.*?)\1/g, '$2')
			// Remove strikethrough
			.replace(/~~(.*?)~~/g, '$1')
			// Remove horizontal rules
			.replace(/^[-*_]{3,}\s*$/gm, '')
			// Remove blockquote markers
			.replace(/^>\s+/gm, '')
			// Remove list markers
			.replace(/^[\s]*[-*+]\s+/gm, '')
			.replace(/^[\s]*\d+\.\s+/gm, '')
			// Remove HTML tags
			.replace(/<[^>]+>/g, '')
			// Collapse whitespace
			.replace(/\s+/g, ' ')
			.trim()
	);
}

/**
 * Calculate reading time in minutes from raw markdown content.
 * Returns at least 1 minute.
 */
export function calculateReadingTime(markdown: string): number {
	const plainText = stripMarkdown(markdown);
	if (!plainText) return 1;

	const wordCount = plainText.split(/\s+/).filter(Boolean).length;
	const minutes = Math.ceil(wordCount / WORDS_PER_MINUTE);
	return Math.max(1, minutes);
}

/**
 * Format reading time as a human-readable string.
 * Example: formatReadingTime(5) → "5 Min. Lesezeit"
 */
export function formatReadingTime(minutes: number): string {
	return `${minutes} Min. Lesezeit`;
}
