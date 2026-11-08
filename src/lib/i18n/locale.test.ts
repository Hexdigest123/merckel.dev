import { describe, expect, it } from 'vitest';
import {
	createTranslator,
	localeFromAcceptLanguage,
	parseLocale,
	resolveLocale,
	translate
} from './locale';

describe('localeFromAcceptLanguage', () => {
	it('picks the supported language with the highest quality', () => {
		expect(localeFromAcceptLanguage('fr-FR, de;q=0.8, en;q=0.9')).toBe('en');
		expect(localeFromAcceptLanguage('de-DE,de;q=0.9,en;q=0.8')).toBe('de');
	});

	it('ignores languages marked as not acceptable (q=0)', () => {
		expect(localeFromAcceptLanguage('fr, de;q=0')).toBe('en');
	});

	it('defaults to English', () => {
		expect(localeFromAcceptLanguage(null)).toBe('en');
		expect(localeFromAcceptLanguage('fr, es')).toBe('en');
	});
});

describe('resolveLocale', () => {
	it('prefers a valid cookie over the Accept-Language header', () => {
		expect(resolveLocale('de', 'en-US')).toBe('de');
		expect(resolveLocale('xx', 'de-DE')).toBe('de');
	});
});

describe('parseLocale', () => {
	it('falls back to the default locale', () => {
		expect(parseLocale('de')).toBe('de');
		expect(parseLocale('fr')).toBe('en');
		expect(parseLocale(undefined)).toBe('en');
	});
});

describe('translate', () => {
	it('translates and interpolates variables', () => {
		expect(translate('en', 'readingTime', { minutes: 3 })).toBe('3 min read');
		expect(translate('de', 'readingTime', { minutes: 3 })).toBe('3 Min. Lesezeit');
	});

	it('creates fixed-locale translators', () => {
		expect(createTranslator('de').t('navTools')).toBe('Werkzeuge');
		expect(createTranslator('en').t('navTools')).toBe('Tools');
	});
});
