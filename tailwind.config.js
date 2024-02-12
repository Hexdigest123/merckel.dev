/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				'roboto-mono': ['"Roboto Mono"', 'monospace'],
				'indie-flower': ['"Indie Flower"', 'cursive']
			}
		}
	},
	plugins: []
};
