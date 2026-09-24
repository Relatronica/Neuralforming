import seo from './seo.config.json';

export const DEFAULT_SITE_ORIGIN = seo.origin;

export const SITE = {
  name: seo.name,
  defaultTitle: seo.title,
  defaultDescription: seo.description,
  entity: seo.entity,
  github: seo.github,
  license: seo.license,
  donate: seo.donate,
  ogImagePath: '/og.png',
  localeDefault: 'it' as const,
  locales: ['it', 'en'] as const,
  organization: {
    name: seo.organization.name,
    url: seo.organization.url,
    email: seo.organization.email,
    sameAs: [seo.github, seo.donate, seo.organization.url],
  },
  indexablePaths: ['/', '/guida', '/contatti', '/contributori'] as const,
} as const;

export function resolveSiteOrigin(fromEnv?: string | null): string {
  const raw = (fromEnv && fromEnv.trim()) || DEFAULT_SITE_ORIGIN;
  return raw.replace(/\/$/, '');
}

export function absoluteUrl(origin: string, path = '/'): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${origin}${normalized === '/' ? '/' : normalized}`;
}
