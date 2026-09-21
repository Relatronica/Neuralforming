export type Locale = 'it' | 'en';

export const LOCALES: Locale[] = ['it', 'en'];

const STORAGE_KEY = 'neuralforming-locale';

export function isLocale(value: unknown): value is Locale {
  return value === 'it' || value === 'en';
}

export function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'it';

  const query = new URLSearchParams(window.location.search).get('lang');
  if (isLocale(query)) return query;

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (isLocale(stored)) return stored;

  const nav = window.navigator.language?.toLowerCase() ?? '';
  if (nav.startsWith('en')) return 'en';
  return 'it';
}

export function persistLocale(locale: Locale) {
  window.localStorage.setItem(STORAGE_KEY, locale);
  const url = new URL(window.location.href);
  url.searchParams.set('lang', locale);
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}
