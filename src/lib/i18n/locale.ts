import { messages, type Locale, type MessageKey } from './messages';

export const DEFAULT_LOCALE: Locale = 'en';

export type TranslationVars = Record<string, string | number>;

/** Anything that can translate message keys, e.g. the reactive `LocaleStore`. */
export interface Translator {
	t(key: MessageKey, vars?: TranslationVars): string;
}

export function isLocale(value: string | undefined): value is Locale {
	return value === 'de' || value === 'en';
}

export function parseLocale(value: string | undefined): Locale {
	return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function translate(locale: Locale, key: MessageKey, vars?: TranslationVars): string {
	let value: string = messages[locale][key] ?? messages[DEFAULT_LOCALE][key];
	if (!vars) {
		return value;
	}

	for (const [name, replacement] of Object.entries(vars)) {
		value = value.replaceAll(`{${name}}`, String(replacement));
	}
	return value;
}

/** Non-reactive translator for a fixed locale (load functions, server code). */
export function createTranslator(locale: Locale): Translator {
	return { t: (key, vars) => translate(locale, key, vars) };
}

export function localeFromAcceptLanguage(header: string | null | undefined): Locale {
	if (!header) {
		return DEFAULT_LOCALE;
	}

	const tags = header
		.split(',')
		.map((part) => {
			const [rawTag, ...params] = part.trim().split(';');
			const tag = rawTag?.trim().toLowerCase() ?? '';
			const qParam = params.find((param) => param.trim().startsWith('q='));
			const quality = qParam ? Number(qParam.trim().slice(2)) : 1;
			return { tag, quality };
		})
		// q=0 explicitly marks a language as "not acceptable".
		.filter((entry) => entry.tag.length > 0 && !Number.isNaN(entry.quality) && entry.quality > 0)
		.sort((a, b) => b.quality - a.quality);

	for (const { tag } of tags) {
		if (tag === 'de' || tag.startsWith('de-')) {
			return 'de';
		}
		if (tag === 'en' || tag.startsWith('en-')) {
			return 'en';
		}
	}

	return DEFAULT_LOCALE;
}

export function resolveLocale(cookie: string | undefined, acceptLanguage?: string | null): Locale {
	if (isLocale(cookie)) {
		return cookie;
	}
	return localeFromAcceptLanguage(acceptLanguage);
}
