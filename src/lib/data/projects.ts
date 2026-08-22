import type { Project } from '$lib/types/content';

export const projects: Project[] = [
	{
		id: 'project-1',
		title: 'Saraylı Döner',
		description:
			'Website für Saraylı Döner in Gladbeck: Speisekarte, Bestellung, Galerie und Standort.',
		image: '/images/projects/sarayli-doener.webp',
		tags: ['SvelteKit', 'Bestellung'],
		url: 'https://sarayli-doener.de',
		featured: true
	},
	{
		id: 'project-2',
		title: 'Adoptierlieber',
		description: 'Webseite unter adoptierlieber.de.',
		tags: ['SvelteKit'],
		url: 'https://adoptierlieber.de',
		featured: true
	}
];
