import { renderMarkdown as render } from '$lib/utils/markdown';

/**
 * Renders the trusted Markdown writeups in `src/content/` to HTML.
 *
 * The content is authored in this repository, so it is not sanitised (which would
 * require a DOM implementation on the server). Never pass user input to this function.
 */
export function renderMarkdown(content: string): string {
	return render(content);
}
