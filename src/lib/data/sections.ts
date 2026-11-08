import type { MessageKey } from '$lib/i18n/messages';

/** Sections of the home page in display order (used by the navigation and command palette). */
export const HOME_SECTIONS: ReadonlyArray<{ id: string; titleKey: MessageKey }> = [
	{ id: 'tools', titleKey: 'navTools' },
	{ id: 'projects', titleKey: 'navProjects' },
	{ id: 'pentests', titleKey: 'navPentests' },
	{ id: 'experience', titleKey: 'navExperience' },
	{ id: 'opensource', titleKey: 'navOpenSource' },
	{ id: 'testimonials', titleKey: 'navTestimonials' },
	{ id: 'contact', titleKey: 'navContact' }
];
