import { getLocalizedTool } from '$lib/i18n/content';
import { createTranslator, parseLocale } from '$lib/i18n/locale';

/**
 * Creates the `load` function for a tool page. It provides the localized
 * `title` and `description` that the root layout uses for `<title>` and meta tags.
 */
export function createToolPageLoad(toolId: string) {
	return async ({ parent }: { parent: () => Promise<{ locale?: string }> }) => {
		const { locale } = await parent();
		const tool = getLocalizedTool(createTranslator(parseLocale(locale)), toolId);
		return { title: tool.name, description: tool.description };
	};
}
