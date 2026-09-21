import { useCallback, useEffect, useState } from 'react';
import { GAME } from './game';
import { detectLocale, type Locale } from './locale';
import { getSessionLocale, setSessionLocale, subscribeLocale } from './session';

export function useGameCopy() {
  const [locale, setLocaleState] = useState<Locale>(() => getSessionLocale() || detectLocale());

  useEffect(() => subscribeLocale(setLocaleState), []);

  const setLocale = useCallback((next: Locale, persist = true) => {
    setSessionLocale(next, persist);
    setLocaleState(next);
  }, []);

  return { locale, setLocale, t: GAME[locale] };
}
