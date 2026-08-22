import type { Locale } from './messages';

export const DEFAULT_LOCALE: Locale = 'en';

export function isLocale(value: string | undefined): value is Locale {
	return value === 'de' || value === 'en';
}

export function parseLocale(value: string | undefined): Locale {
	return isLocale(value) ? value : DEFAULT_LOCALE;
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
		.filter((entry) => entry.tag.length > 0 && !Number.isNaN(entry.quality))
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

export function resolveLocale(
	cookie: string | undefined,
	acceptLanguage?: string | null
): Locale {
	if (isLocale(cookie)) {
		return cookie;
	}
	return localeFromAcceptLanguage(acceptLanguage);
}
