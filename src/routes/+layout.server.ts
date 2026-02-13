export const load = async ({ locals }: { locals: App.Locals }) => {
	return {
		isMobile: locals.isMobile ?? false
	};
};
