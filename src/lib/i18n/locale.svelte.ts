import { browser } from '$app/environment';
import { getContext, setContext } from 'svelte';
import { DEFAULT_LOCALE } from './locale';
import { messages, type Locale, type MessageKey } from './messages';

export { isLocale, parseLocale, resolveLocale } from './locale';

const COOKIE_NAME = 'locale';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const CONTEXT_KEY = Symbol('locale');

export class LocaleStore {
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
		document.cookie = `${COOKIE_NAME}=${next}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
	}

	t(key: MessageKey, vars?: Record<string, string | number>): string {
		let value: string = messages[this.current][key] ?? messages.de[key];
		if (!vars) {
			return value;
		}

		for (const [name, replacement] of Object.entries(vars)) {
			value = value.replaceAll(`{${name}}`, String(replacement));
		}
		return value;
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


