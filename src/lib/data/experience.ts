import type { Experience } from '$lib/types/content';

export const experience: Experience[] = [
	{
		id: 'exp-1',
		role: 'Geschäftsführer und Softwareentwickler',
		company: 'Meta Menü',
		companyUrl: 'https://meta-menue.de',
		startDate: '2026-01',
		endDate: undefined,
		description: 'Entwicklung der Software meta-menue, Betreuung von Kunden und Projektmanagement.',
		tags: ['SvelteKit', 'PostgreSQL', 'DevOps', 'Projektmanagement']
	},
	{
		id: 'exp-2',
		role: 'Werkstudent Full-Stack Developer',
		company: 'NetTrek GmbH',
		companyUrl: 'https://nettrek.de',
		startDate: '2025-01',
		endDate: '2026-01',
		description:
			'Auch als Werkstudent wurden mir eigenständige Projekte für Großkunden aufgetragen, wodurch ich meine Kenntnisse in unterschiedlichen Frameworks und Architekturen vertiefen konnte.',
		tags: ['Next.js', 'Angular.js', 'PostgreSQL', 'n8n', 'RAG']
	},
	{
		id: 'exp-3',
		role: 'Geschäftsführer und Softwareentwickler',
		company: 'LogiQ IT',
		companyUrl: 'https://logiqit.de',
		startDate: '2022-06',
		endDate: undefined,
		description: 'Entwicklung von Web-Anwendungen und Webseiten für Endkunden aller Art.',
		tags: ['React', 'Node.js', 'PostgreSQL', 'DevOps', 'Leadership']
	}
];
