export const load = async ({ cookies }: any) => {
	if (!cookies.get('email')) {
		cookies.set('email', 'verified', { maxAge: 60 * 60 * 24 * 365, path: '/' });
	}
};
