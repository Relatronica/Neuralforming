import { useEffect } from 'react';
import { SITE, absoluteUrl, resolveSiteOrigin } from '../config/site';
import type { Locale } from '../lib/i18n/locale';

const SITE_ORIGIN = resolveSiteOrigin(import.meta.env.VITE_SITE_URL);

type DocumentMeta = {
  title: string;
  description: string;
  path?: string;
  locale?: Locale;
  robots?: string;
};

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string, hreflang?: string) {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  let el = document.head.querySelector<HTMLLinkElement>(selector);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    if (hreflang) el.setAttribute('hreflang', hreflang);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function useDocumentMeta({
  title,
  description,
  path = '/',
  locale,
  robots = 'index,follow',
}: DocumentMeta) {
  useEffect(() => {
    const base = absoluteUrl(SITE_ORIGIN, path);
    const url = locale && locale !== 'it' ? `${base}?lang=${locale}` : base;
    const ogLocale = locale === 'en' ? 'en_US' : 'it_IT';

    document.title = title;
    if (locale) document.documentElement.lang = locale;

    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', robots);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:locale', ogLocale);
    upsertMeta('property', 'og:site_name', SITE.name);
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);

    upsertLink('canonical', url);
  }, [title, description, path, locale, robots]);
}
