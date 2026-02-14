import type { Project } from '$lib/types/content';

export const projects: Project[] = [
	{
		id: 'project-1',
		title: 'Zendoc',
		description:
			'Ein Echtzeit-Infrastrukturverwaltungssystem, das Benutzern erlaubt, ihre Server, Dienste und Anwendungen zentral zu überwachen und zu steuern',
		image: '/images/projects/dashboard.png',
		tags: ['React', 'Go', 'WebSocket', 'C++', 'Docker'],
		url: 'https://zendoc.io',
		github: 'https://github.com/zendoc-io/zendoc',
		featured: true
	},
	{
		id: 'project-2',
		title: 'OpenLingo',
		description:
			'Sprachlerntool zum Lernen von Spanisch von A1- bis C2-Niveau. Es bietet interaktive Übungen ähnlich wie Duolingo sowie einen KI-Assistenten, welcher mit einem selbst bereitgestellten OpenAI-Key aktiviert wird.',
		image: '/images/projects/ml-tool.png',
		tags: ['SvelteKit', 'Docker', 'Drizzle'],
		url: 'https://openlingo.merckel.dev/',
		github: 'https://github.com/Hexdigest123/open-lingo',
		featured: true
	}
];
