import { detectLocale, persistLocale, type Locale } from './locale';

const CHANGE_EVENT = 'neuralforming-locale';

let sessionLocale: Locale = typeof window === 'undefined' ? 'it' : detectLocale();

export function getSessionLocale(): Locale {
  return sessionLocale;
}

export function setSessionLocale(locale: Locale, persist = true) {
  sessionLocale = locale;
  if (persist && typeof window !== 'undefined') {
    persistLocale(locale);
  }
  if (typeof window !== 'undefined') {
    document.documentElement.lang = locale;
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: locale }));
  }
}

export function subscribeLocale(listener: (locale: Locale) => void) {
  const handler = (event: Event) => {
    const next = (event as CustomEvent<Locale>).detail;
    listener(next ?? sessionLocale);
  };
  window.addEventListener(CHANGE_EVENT, handler);
  return () => window.removeEventListener(CHANGE_EVENT, handler);
}
