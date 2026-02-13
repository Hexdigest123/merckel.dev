import type { Testimonial } from '$lib/types/content';

export const testimonials: Testimonial[] = [
	{
		id: 'testimonial-1',
		quote:
			'An exceptional developer who consistently delivers high-quality code and innovative solutions. Their attention to detail and problem-solving skills are outstanding.',
		author: 'Sarah Johnson',
		role: 'Product Manager',
		company: 'Tech Innovations Inc.',
		avatar: '/images/avatars/sarah.jpg'
	},
	{
		id: 'testimonial-2',
		quote:
			'Working with them was a game-changer for our team. They not only built amazing features but also mentored our junior developers and improved our entire development process.',
		author: 'Michael Chen',
		role: 'Engineering Lead',
		company: 'Digital Solutions Co.',
		avatar: '/images/avatars/michael.jpg'
	},
	{
		id: 'testimonial-3',
		quote:
			'Their expertise in frontend architecture and performance optimization helped us reduce our bundle size by 50% and improve user experience significantly.',
		author: 'Emma Rodriguez',
		role: 'CTO',
		company: 'StartUp Labs',
		avatar: '/images/avatars/emma.jpg'
	}
];
