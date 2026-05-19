import { getAllToolsWithUsage } from '$lib/server/services/usage';

export const load = async () => {
	const tools = await getAllToolsWithUsage();

	return {
		title: 'Werkzeuge',
		description: 'Kostenlose Web-Tools für Entwickler und den täglichen Gebrauch.',
		tools
	};
};
