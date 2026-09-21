import { SITE } from '../../config/site';

export function SiteCredit({ prefix }: { prefix: string }) {
  return (
    <>
      {prefix}{' '}
      <a
        href={SITE.organization.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-500 hover:text-tech-cyan transition-colors"
      >
        {SITE.organization.name}
      </a>
    </>
  );
}
