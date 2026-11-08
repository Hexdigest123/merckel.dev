import type { Locale } from '$lib/i18n/messages';

const INTL_LOCALES: Record<Locale, string> = { de: 'de-DE', en: 'en-US' };

/**
 * Formats an ISO date (`YYYY-MM-DD`) as a long, localized date.
 *
 * Date-only strings are parsed as UTC midnight, so formatting them in the reader's
 * time zone could show the previous day (and differ from the server render).
 * Formatting in UTC keeps the calendar date stable everywhere.
 */
export function formatLongDate(isoDate: string, locale: Locale): string {
	const date = new Date(isoDate);
	if (Number.isNaN(date.getTime())) {
		return isoDate;
	}

	return date.toLocaleDateString(INTL_LOCALES[locale], {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		timeZone: 'UTC'
	});
}

/** Calendar year of an ISO date, independent of the reader's time zone. */
export function yearOf(isoDate: string): string {
	const date = new Date(isoDate);
	return Number.isNaN(date.getTime()) ? '' : String(date.getUTCFullYear());
}
