import { messages } from '$lib/i18n/messages';
import { getAllToolsWithUsage } from '$lib/server/services/usage';

export const load = async ({ locals }) => {
	const locale = locals.locale ?? 'en';
	const tools = await getAllToolsWithUsage();

	return {
		title: messages[locale].navTools,
		description: messages[locale].toolsPageDescription,
		tools
	};
};
