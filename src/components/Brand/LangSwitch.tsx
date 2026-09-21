import { LOCALES, type Locale } from '../../lib/i18n/locale';

const LABELS: Record<Locale, string> = {
  it: 'Italiano',
  en: 'English',
};

export function LangSwitch({
  locale,
  setLocale,
  variant = 'compact',
}: {
  locale: Locale;
  setLocale: (next: Locale) => void;
  variant?: 'compact' | 'setup';
}) {
  if (variant === 'setup') {
    return (
      <div className="grid grid-cols-2 gap-2" role="group" aria-label="Language">
        {LOCALES.map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            className={`py-3 px-4 rounded-xl font-heading font-semibold text-sm border transition-colors ${
              locale === code
                ? 'border-tech-cyan bg-tech-cyan/10 text-tech-cyan'
                : 'border-white/10 bg-cyber-800 text-gray-400 hover:text-gray-200'
            }`}
            aria-pressed={locale === code}
          >
            <span className="block text-[10px] font-mono uppercase tracking-wider opacity-70 mb-0.5">
              {code}
            </span>
            {LABELS[code]}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0.5 shrink-0" role="group" aria-label="Language">
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          className={`px-1.5 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider transition-colors ${
            locale === code ? 'text-tech-cyan' : 'text-gray-500 hover:text-gray-300'
          }`}
          aria-pressed={locale === code}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
