import type { SiteConfig } from '$lib/types/content';

export const siteConfig: SiteConfig = {
	name: 'Your Name',
	title: 'Full Stack Developer',
	subtitle: 'Crafting beautiful, performant web experiences',
	bio: "I am a passionate full-stack developer with expertise in modern web technologies. I love building scalable applications, mentoring teams, and exploring new technologies. When I'm not coding, you can find me contributing to open source or writing about web development.",
	email: 'hello@example.com',
	socials: [
		{
			platform: 'GitHub',
			url: 'https://github.com',
			icon: 'github'
		},
		{
			platform: 'LinkedIn',
			url: 'https://linkedin.com',
			icon: 'linkedin'
		},
		{
			platform: 'Twitter',
			url: 'https://twitter.com',
			icon: 'twitter'
		},
		{
			platform: 'Email',
			url: 'mailto:hello@example.com',
			icon: 'email'
		}
	]
};
