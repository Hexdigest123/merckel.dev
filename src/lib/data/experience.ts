import type { Experience } from '$lib/types/content';

export const experience: Experience[] = [
	{
		id: 'exp-1',
		role: 'Senior Frontend Engineer',
		company: 'Tech Innovations Inc.',
		companyUrl: 'https://example.com',
		startDate: '2022-01',
		endDate: undefined,
		description:
			'Led frontend architecture and development for a high-traffic SaaS platform. Mentored junior developers, established coding standards, and improved performance by 40%.',
		tags: ['SvelteKit', 'TypeScript', 'Performance', 'Leadership']
	},
	{
		id: 'exp-2',
		role: 'Full Stack Developer',
		company: 'Digital Solutions Co.',
		companyUrl: 'https://example.com',
		startDate: '2020-06',
		endDate: '2021-12',
		description:
			'Developed and maintained multiple client projects using React and Node.js. Implemented CI/CD pipelines and improved deployment process efficiency.',
		tags: ['React', 'Node.js', 'PostgreSQL', 'DevOps']
	},
	{
		id: 'exp-3',
		role: 'Junior Web Developer',
		company: 'StartUp Labs',
		companyUrl: 'https://example.com',
		startDate: '2019-03',
		endDate: '2020-05',
		description:
			'Built responsive web applications and contributed to product features. Learned modern web development practices and collaborated with cross-functional teams.',
		tags: ['JavaScript', 'Vue.js', 'CSS', 'Agile']
	}
];
