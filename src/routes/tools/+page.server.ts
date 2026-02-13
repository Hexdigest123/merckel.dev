import { getAllToolsWithUsage } from '$lib/server/services/usage';

export const load = async () => {
	const tools = await getAllToolsWithUsage();

	return { tools };
};
