import { useCallback, useState } from 'react';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { LANDING } from './landing';
import { detectLocale, persistLocale, type Locale } from './locale';

export function useLandingCopy() {
  const [locale, setLocaleState] = useState<Locale>(() => detectLocale());
  const copy = LANDING[locale];

  useDocumentMeta({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: '/',
    locale,
  });

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    persistLocale(next);
  }, []);

  return { locale, setLocale, t: LANDING[locale] };
}
