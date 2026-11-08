import { browser } from '$app/environment';
import { getContext, setContext } from 'svelte';
import { DEFAULT_LOCALE, translate, type TranslationVars, type Translator } from './locale';
import type { Locale, MessageKey } from './messages';

export { isLocale, parseLocale, resolveLocale } from './locale';

const COOKIE_NAME = 'locale';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const CONTEXT_KEY = Symbol('locale');

export class LocaleStore implements Translator {
	current = $state<Locale>(DEFAULT_LOCALE);

	constructor(initial: Locale = DEFAULT_LOCALE) {
		this.current = initial;
	}

	set(next: Locale) {
		this.current = next;
		if (!browser) {
			return;
		}

		document.documentElement.lang = next;
		const secure = window.location.protocol === 'https:' ? '; secure' : '';
		document.cookie = `${COOKIE_NAME}=${next}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax${secure}`;
	}

	t(key: MessageKey, vars?: TranslationVars): string {
		return translate(this.current, key, vars);
	}
}

export function createLocaleStore(initial: Locale): LocaleStore {
	const store = new LocaleStore(initial);
	setContext(CONTEXT_KEY, store);
	return store;
}

export function useLocale(): LocaleStore {
	return getContext<LocaleStore>(CONTEXT_KEY) ?? new LocaleStore(DEFAULT_LOCALE);
}
