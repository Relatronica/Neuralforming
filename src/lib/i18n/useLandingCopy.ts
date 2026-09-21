import { useCallback, useEffect, useState } from 'react';
import { LANDING } from './landing';
import { detectLocale, persistLocale, type Locale } from './locale';

export function useLandingCopy() {
  const [locale, setLocaleState] = useState<Locale>(() => detectLocale());

  useEffect(() => {
    const copy = LANDING[locale];
    document.documentElement.lang = locale;
    document.title = copy.metaTitle;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', copy.metaDescription);
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    persistLocale(next);
  }, []);

  return { locale, setLocale, t: LANDING[locale] };
}
