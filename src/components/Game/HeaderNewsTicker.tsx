import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { loadGameContent } from '../../lib/i18n/content';
import { useGameCopy } from '../../lib/i18n/useGameCopy';

export function HeaderNewsTicker({
  turn,
  variant = 'player',
  className = '',
}: {
  turn?: number;
  variant?: 'player' | 'board';
  className?: string;
}) {
  const { locale, t } = useGameCopy();
  const items = loadGameContent(locale).headerNews;
  const [index, setIndex] = useState(() =>
    items.length ? Math.floor(Math.random() * items.length) : 0
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (items.length < 2) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
      setOpen(false);
    }, 20000);
    return () => clearInterval(interval);
  }, [items.length]);

  useEffect(() => {
    if (turn == null || items.length === 0) return;
    setIndex(Math.floor(Math.random() * items.length));
    setOpen(false);
  }, [turn, items.length]);

  const item = items[index];
  if (!item) return null;

  const date = new Date(item.date).toLocaleDateString(locale === 'en' ? 'en-GB' : 'it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  if (variant === 'board') {
    return (
      <div className={`flex items-center gap-4 flex-1 min-w-0 overflow-hidden ${className}`}>
        <div className="flex items-center gap-2 text-xs text-gray-400 whitespace-nowrap font-mono uppercase tracking-wider">
          <span className="text-tech-cyan">{t.ticker.label}</span>
        </div>
        <div className="text-xs text-gray-500 whitespace-nowrap">{date}</div>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-sm text-gray-300 font-medium truncate">{item.title}</span>
          <span className="text-xs text-gray-500 truncate hidden sm:inline">• {item.shortText}</span>
        </div>
        <div className="text-xs text-gray-500 whitespace-nowrap hidden md:inline">{item.source}</div>
      </div>
    );
  }

  return (
    <div className={`bg-cyber-900/90 border border-white/10 rounded-xl overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full text-left px-3 py-2.5 pr-12 flex items-start gap-2.5"
        aria-expanded={open}
      >
        <span className="mt-0.5 shrink-0 text-[10px] font-mono uppercase tracking-wider text-tech-cyan">
          {t.ticker.label}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] text-gray-500">{date}</span>
          <span className="block text-sm text-gray-200 font-medium leading-snug">{item.title}</span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 shrink-0 mt-1 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-3 pb-3 pt-0 pr-12">
          <p className="text-xs text-gray-400 leading-relaxed">{item.shortText}</p>
          <p className="text-[10px] text-gray-500 mt-1.5 font-mono">{item.source}</p>
        </div>
      )}
    </div>
  );
}
