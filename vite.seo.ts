import type { Plugin } from 'vite';
import seo from './src/config/seo.config.json';

function resolveOrigin(fromEnv?: string | null): string {
  const raw = (fromEnv && fromEnv.trim()) || seo.origin;
  return raw.replace(/\/$/, '');
}

function abs(origin: string, path = '/'): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${origin}${normalized === '/' ? '/' : normalized}`;
}

function jsonLd(origin: string): string {
  const page = abs(origin, '/');
  const orgId = `${origin}/#organization`;
  const appId = `${origin}/#app`;
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': orgId,
        name: seo.organization.name,
        url: seo.organization.url,
        email: seo.organization.email,
        sameAs: [seo.github, seo.donate, seo.organization.url],
      },
      {
        '@type': ['WebApplication', 'Game'],
        '@id': appId,
        name: seo.name,
        url: page,
        description: seo.description,
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Web browser',
        isAccessibleForFree: true,
        inLanguage: ['it', 'en'],
        license: seo.license,
        educationalUse: 'classroom instruction',
        audience: { '@type': 'EducationalAudience', educationalRole: 'student' },
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
        numberOfPlayers: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 5 },
        publisher: { '@id': orgId },
        author: { '@id': orgId },
        screenshot: abs(origin, '/og.png'),
        image: abs(origin, '/og.png'),
      },
      {
        '@type': 'WebSite',
        '@id': `${origin}/#website`,
        url: page,
        name: seo.name,
        description: seo.description,
        inLanguage: ['it', 'en'],
        publisher: { '@id': orgId },
        about: { '@id': appId },
      },
      {
        '@type': 'FAQPage',
        '@id': `${origin}/#faq`,
        url: `${page}#faq`,
        inLanguage: 'it',
        isPartOf: { '@id': `${origin}/#website` },
        mainEntity: seo.faqIt.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    ],
  };
  return JSON.stringify(graph).replace(/</g, '\\u003c');
}

function robotsTxt(origin: string): string {
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /player',
    '',
    'User-agent: GPTBot',
    'Allow: /',
    '',
    'User-agent: ChatGPT-User',
    'Allow: /',
    '',
    'User-agent: Google-Extended',
    'Allow: /',
    '',
    'User-agent: PerplexityBot',
    'Allow: /',
    '',
    `Sitemap: ${abs(origin, '/sitemap.xml')}`,
    '',
  ].join('\n');
}

function sitemapXml(origin: string): string {
  const paths = [
    ['/', '1.0'],
    ['/guida', '0.8'],
    ['/contatti', '0.8'],
  ] as const;
  const urls = paths.map(([path, priority]) =>
    [
      '  <url>',
      `    <loc>${abs(origin, path)}</loc>`,
      '    <changefreq>weekly</changefreq>',
      `    <priority>${priority}</priority>`,
      '  </url>',
    ].join('\n')
  );
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

function llmsTxt(origin: string): string {
  return `# ${seo.name}

> ${seo.entity}

Neuralforming is a free, AGPL-licensed educational multiplayer game by Relatronica (a design studio founded at CERN). A master device shows the board and parliament; each player joins from a phone. There is no login, no ads, and no profiling. A single-player playground is available for practice.

## Facts

- Players: 2–5 in multiplayer (master + smartphones); 1 in the playground
- Languages: Italian (default) and English on the landing page
- Licence: GNU Affero GPL v3.0
- Publisher: Relatronica — ${seo.organization.url}
- Contact: ${seo.organization.email}

## Pages

- [Home](${abs(origin, '/')})
- [Game guide (Italian)](${abs(origin, '/guida')})
- [Contact](${abs(origin, '/contatti')})
- [Source code](${seo.github})
- [Licence](${seo.license})
- [Relatronica](${seo.organization.url})
- [Donate](${seo.donate})

## Optional

- [Sitemap](${abs(origin, '/sitemap.xml')})
`;
}

function serveSeoFiles(origin: string) {
  const files: Record<string, [string, string]> = {
    '/robots.txt': ['text/plain; charset=utf-8', robotsTxt(origin)],
    '/sitemap.xml': ['application/xml; charset=utf-8', sitemapXml(origin)],
    '/llms.txt': ['text/plain; charset=utf-8', llmsTxt(origin)],
  };

  return (
    req: { url?: string },
    res: { statusCode: number; setHeader: (k: string, v: string) => void; end: (b: string) => void },
    next: () => void
  ) => {
    const path = req.url?.split('?')[0] ?? '';
    const hit = files[path];
    if (!hit) {
      next();
      return;
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', hit[0]);
    res.end(hit[1]);
  };
}

export function seoPlugin(envUrl?: string): Plugin {
  const origin = resolveOrigin(envUrl);

  return {
    name: 'neuralforming-seo',
    transformIndexHtml(html) {
      return html.replaceAll('__SITE_ORIGIN__', origin).replace('__JSON_LD__', jsonLd(origin));
    },
    configureServer(server) {
      server.middlewares.use(serveSeoFiles(origin));
    },
    configurePreviewServer(server) {
      server.middlewares.use(serveSeoFiles(origin));
    },
    generateBundle() {
      const assets: Record<string, string> = {
        'robots.txt': robotsTxt(origin),
        'sitemap.xml': sitemapXml(origin),
        'llms.txt': llmsTxt(origin),
      };
      for (const [fileName, source] of Object.entries(assets)) {
        this.emitFile({ type: 'asset', fileName, source });
      }
    },
  };
}
