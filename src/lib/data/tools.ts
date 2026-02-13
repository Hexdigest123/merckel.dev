import type { Tool } from '$lib/types/content';

export const tools: Tool[] = [
	// Languages
	{
		id: 'tool-1',
		name: 'TypeScript',
		icon: 'ts',
		category: 'language',
		proficiency: 'expert',
		url: 'https://www.typescriptlang.org'
	},
	{
		id: 'tool-2',
		name: 'JavaScript',
		icon: 'js',
		category: 'language',
		proficiency: 'expert',
		url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript'
	},
	{
		id: 'tool-3',
		name: 'Python',
		icon: 'py',
		category: 'language',
		proficiency: 'proficient',
		url: 'https://www.python.org'
	},
	{
		id: 'tool-4',
		name: 'SQL',
		icon: 'sql',
		category: 'language',
		proficiency: 'proficient',
		url: 'https://en.wikipedia.org/wiki/SQL'
	},

	// Frameworks
	{
		id: 'tool-5',
		name: 'SvelteKit',
		icon: 'svelte',
		category: 'framework',
		proficiency: 'expert',
		url: 'https://kit.svelte.dev'
	},
	{
		id: 'tool-6',
		name: 'React',
		icon: 'react',
		category: 'framework',
		proficiency: 'expert',
		url: 'https://react.dev'
	},
	{
		id: 'tool-7',
		name: 'Vue.js',
		icon: 'vue',
		category: 'framework',
		proficiency: 'proficient',
		url: 'https://vuejs.org'
	},
	{
		id: 'tool-8',
		name: 'Next.js',
		icon: 'nextjs',
		category: 'framework',
		proficiency: 'proficient',
		url: 'https://nextjs.org'
	},

	// Tools
	{
		id: 'tool-9',
		name: 'Tailwind CSS',
		icon: 'tailwind',
		category: 'tool',
		proficiency: 'expert',
		url: 'https://tailwindcss.com'
	},
	{
		id: 'tool-10',
		name: 'Git',
		icon: 'git',
		category: 'tool',
		proficiency: 'expert',
		url: 'https://git-scm.com'
	},
	{
		id: 'tool-11',
		name: 'Docker',
		icon: 'docker',
		category: 'tool',
		proficiency: 'proficient',
		url: 'https://www.docker.com'
	},
	{
		id: 'tool-12',
		name: 'Vitest',
		icon: 'vitest',
		category: 'tool',
		proficiency: 'proficient',
		url: 'https://vitest.dev'
	},

	// Platforms
	{
		id: 'tool-13',
		name: 'Node.js',
		icon: 'nodejs',
		category: 'platform',
		proficiency: 'expert',
		url: 'https://nodejs.org'
	},
	{
		id: 'tool-14',
		name: 'PostgreSQL',
		icon: 'postgres',
		category: 'platform',
		proficiency: 'proficient',
		url: 'https://www.postgresql.org'
	},
	{
		id: 'tool-15',
		name: 'AWS',
		icon: 'aws',
		category: 'platform',
		proficiency: 'familiar',
		url: 'https://aws.amazon.com'
	}
];
