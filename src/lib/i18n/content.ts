import type { Experience, Project, WebTool } from '$lib/types/content';
import type { LocaleStore } from './locale.svelte';
import type { MessageKey } from './messages';

const PROJECT_DESCRIPTION: Record<string, MessageKey> = {
	'project-1': 'projectSarayli',
	'project-2': 'projectAdoptierlieber'
};

const PROJECT_TAG: Record<string, MessageKey> = {
	Bestellung: 'tagOrdering'
};

const EXPERIENCE_ROLE: Record<string, MessageKey> = {
	'exp-1': 'expRoleFounder',
	'exp-2': 'expRoleFounder',
	'exp-3': 'expRoleStudent'
};

const EXPERIENCE_DESCRIPTION: Record<string, MessageKey> = {
	'exp-1': 'expMetaMenue',
	'exp-2': 'expLogiqit',
	'exp-3': 'expNettrek'
};

const EXPERIENCE_TAG: Record<string, MessageKey> = {
	Projektmanagement: 'tagProjectManagement'
};

const TOOL_DESCRIPTION: Record<string, MessageKey> = {
	'url-shortener': 'toolUrlShortener',
	'cron-generator': 'toolCron',
	'text-diff': 'toolTextDiff',
	'image-converter': 'toolImage',
	'qr-generator': 'toolQr',
	'css-gradient': 'toolGradient',
	'json-formatter': 'toolJson',
	'color-converter': 'toolColor',
	'regex-tester': 'toolRegex',
	'markdown-preview': 'toolMarkdown'
};

const TOOL_NAME: Record<string, MessageKey> = {
	'color-converter': 'toolColorName'
};

const OSS_LABEL: Record<string, MessageKey> = {
	'Öffentliche Repositories': 'ossPublicRepos',
	'Ausgewählte Projekte': 'ossFeaturedProjects',
	'Verknüpfte Kanäle': 'ossLinkedChannels',
	'Verfolgte Repositories': 'ossTrackedRepos'
};

export function localizeProject(i18n: LocaleStore, project: Project): Project {
	const descriptionKey = PROJECT_DESCRIPTION[project.id];
	return {
		...project,
		description: descriptionKey ? i18n.t(descriptionKey) : project.description,
		tags: project.tags.map((tag) => {
			const tagKey = PROJECT_TAG[tag];
			return tagKey ? i18n.t(tagKey) : tag;
		})
	};
}

export function localizeExperience(i18n: LocaleStore, entry: Experience): Experience {
	const roleKey = EXPERIENCE_ROLE[entry.id];
	const descriptionKey = EXPERIENCE_DESCRIPTION[entry.id];
	return {
		...entry,
		role: roleKey ? i18n.t(roleKey) : entry.role,
		description: descriptionKey ? i18n.t(descriptionKey) : entry.description,
		tags: entry.tags.map((tag) => {
			const tagKey = EXPERIENCE_TAG[tag];
			return tagKey ? i18n.t(tagKey) : tag;
		})
	};
}

export function localizeTool<T extends WebTool>(i18n: LocaleStore, tool: T): T {
	const nameKey = TOOL_NAME[tool.id];
	const descriptionKey = TOOL_DESCRIPTION[tool.id];
	return {
		...tool,
		name: nameKey ? i18n.t(nameKey) : tool.name,
		description: descriptionKey ? i18n.t(descriptionKey) : tool.description
	};
}

export function localizeOssLabel(i18n: LocaleStore, label: string): string {
	const key = OSS_LABEL[label];
	return key ? i18n.t(key) : label;
}

export function localizeGithubProfileLabel(i18n: LocaleStore, label: string): string {
	if (label === 'GitHub-Profil besuchen') {
		return i18n.t('openGithubProfile');
	}
	return label;
}
