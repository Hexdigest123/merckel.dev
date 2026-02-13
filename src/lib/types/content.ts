/**
 * Content type definitions for the portfolio
 * All interfaces are exported for use in data files and components
 */

export interface Project {
	id: string;
	title: string;
	description: string;
	image?: string;
	tags: string[];
	url?: string;
	github?: string;
	featured: boolean;
}

export interface Experience {
	id: string;
	role: string;
	company: string;
	companyUrl?: string;
	startDate: string;
	endDate?: string;
	description: string;
	tags: string[];
}

export interface WebTool {
	id: string;
	name: string;
	slug: string;
	description: string;
	icon: string;
	category: 'utility' | 'developer';
	path: string;
}

export interface WebToolWithUsage extends WebTool {
	usageCount: number;
}

export interface Testimonial {
	id: string;
	quote: string;
	author: string;
	role: string;
	company: string;
	avatar?: string;
}

export interface SocialLink {
	platform: string;
	url: string;
	icon: string;
}

export interface SiteConfig {
	name: string;
	title: string;
	subtitle: string;
	bio: string;
	email: string;
	socials: SocialLink[];
}

export interface OpenSourceStat {
	label: string;
	value: string;
}

export interface OpenSourceContribution {
	id: string;
	title: string;
	description: string;
	tags: string[];
	url?: string;
}

export interface OpenSourceData {
	source: 'github' | 'fallback';
	profileUrl?: string;
	profileLabel: string;
	note: string;
	stats: OpenSourceStat[];
	contributions: OpenSourceContribution[];
}
