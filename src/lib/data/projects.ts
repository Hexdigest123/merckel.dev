import type { Project } from '$lib/types/content';

export const projects: Project[] = [
	{
		id: 'project-1',
		title: 'Interactive Data Visualization Dashboard',
		description:
			'A real-time analytics dashboard built with SvelteKit and Three.js, featuring interactive 3D charts and live data streaming from multiple sources.',
		image: '/images/projects/dashboard.png',
		tags: ['SvelteKit', 'Three.js', 'TypeScript', 'WebSocket'],
		url: 'https://example.com/dashboard',
		github: 'https://github.com/example/dashboard',
		featured: true
	},
	{
		id: 'project-2',
		title: 'E-Commerce Platform Redesign',
		description:
			'Complete redesign and rebuild of a legacy e-commerce platform with improved performance, accessibility, and user experience. Implemented responsive design and modern payment integration.',
		image: '/images/projects/ecommerce.png',
		tags: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
		url: 'https://example.com/shop',
		github: 'https://github.com/example/ecommerce',
		featured: true
	},
	{
		id: 'project-3',
		title: 'Open Source UI Component Library',
		description:
			'A comprehensive, accessible component library with 50+ components, full TypeScript support, and extensive documentation. Used by 100+ projects in production.',
		image: '/images/projects/components.png',
		tags: ['Svelte', 'TypeScript', 'Storybook', 'Accessibility'],
		url: 'https://components.example.com',
		github: 'https://github.com/example/ui-library',
		featured: true
	},
	{
		id: 'project-4',
		title: 'Machine Learning Model Deployment Tool',
		description:
			'CLI tool for deploying and managing ML models in production. Supports multiple frameworks and includes monitoring, versioning, and rollback capabilities.',
		image: '/images/projects/ml-tool.png',
		tags: ['Python', 'Docker', 'Kubernetes', 'FastAPI'],
		url: 'https://example.com/ml-deploy',
		github: 'https://github.com/example/ml-deploy',
		featured: true
	}
];
