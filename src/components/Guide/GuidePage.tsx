import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { guideChapters } from './guideChapters';

export const GuidePage = () => {
  const [activeId, setActiveId] = useState(guideChapters[0].id);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    const els = Array.from(sectionRefs.current.values());
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    sectionRefs.current.get(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileNavOpen(false);
  };

  const activeIndex = guideChapters.findIndex((c) => c.id === activeId);
  const prevChapter = activeIndex > 0 ? guideChapters[activeIndex - 1] : null;
  const nextChapter = activeIndex < guideChapters.length - 1 ? guideChapters[activeIndex + 1] : null;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-14">
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-400 hover:text-gray-100 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Torna alla Home</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-primary-400" />
            <h1 className="font-bold text-lg">Guida al Gioco</h1>
          </div>

          <img
            src="/images/logo/logo_neuralforming.png"
            alt="Neuralforming"
            className="h-8 w-8 object-contain"
          />
        </div>
      </header>

      {/* ── Mobile chapter selector ── */}
      <div className="lg:hidden sticky top-14 z-30 bg-gray-950/90 backdrop-blur-md border-b border-gray-800">
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm"
        >
          <span className="flex items-center gap-2 text-gray-200 font-medium">
            {(() => {
              const ch = guideChapters.find((c) => c.id === activeId);
              if (!ch) return null;
              const Icon = ch.icon;
              return (
                <>
                  <Icon className={`w-4 h-4 ${ch.iconColor}`} />
                  {ch.title}
                </>
              );
            })()}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${mobileNavOpen ? 'rotate-180' : ''}`} />
        </button>

        {mobileNavOpen && (
          <nav className="border-t border-gray-800 bg-gray-950 px-2 pb-2 max-h-64 overflow-y-auto">
            {guideChapters.map((chapter, i) => {
              const Icon = chapter.icon;
              const isActive = chapter.id === activeId;
              return (
                <button
                  key={chapter.id}
                  onClick={() => scrollTo(chapter.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-gray-800 text-gray-100'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'
                  }`}
                >
                  <span className="text-xs text-gray-600 w-4 text-right">{i + 1}.</span>
                  <Icon className={`w-4 h-4 ${isActive ? chapter.iconColor : 'text-gray-500'}`} />
                  {chapter.title}
                </button>
              );
            })}
          </nav>
        )}
      </div>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:block w-64 shrink-0">
          <nav className="sticky top-14 p-4 pt-8 space-y-1 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
              Capitoli
            </p>
            {guideChapters.map((chapter, i) => {
              const Icon = chapter.icon;
              const isActive = chapter.id === activeId;
              return (
                <button
                  key={chapter.id}
                  onClick={() => scrollTo(chapter.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                    isActive
                      ? 'bg-gray-800/80 text-gray-100 font-medium'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/50'
                  }`}
                >
                  <span className={`text-xs w-4 text-right ${isActive ? 'text-gray-400' : 'text-gray-600'}`}>
                    {i + 1}.
                  </span>
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? chapter.iconColor : 'text-gray-500'}`} />
                  <span className="truncate">{chapter.title}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content area */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-10 py-8 lg:py-12 lg:border-l border-gray-800">
          <div className="max-w-3xl">
            {guideChapters.map((chapter) => {
              const Icon = chapter.icon;
              return (
                <section
                  key={chapter.id}
                  id={chapter.id}
                  ref={(el) => {
                    if (el) sectionRefs.current.set(chapter.id, el);
                  }}
                  className="mb-16 scroll-mt-32 lg:scroll-mt-20"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-2 rounded-lg bg-gray-800`}>
                      <Icon className={`w-6 h-6 ${chapter.iconColor}`} />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold">{chapter.title}</h2>
                  </div>
                  {chapter.content}
                </section>
              );
            })}

            {/* Bottom navigation */}
            <div className="flex items-center justify-between pt-8 border-t border-gray-800">
              {prevChapter ? (
                <button
                  onClick={() => scrollTo(prevChapter.id)}
                  className="flex items-center gap-2 text-gray-400 hover:text-gray-100 transition-colors text-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {prevChapter.title}
                </button>
              ) : (
                <div />
              )}
              {nextChapter ? (
                <button
                  onClick={() => scrollTo(nextChapter.id)}
                  className="flex items-center gap-2 text-gray-400 hover:text-gray-100 transition-colors text-sm"
                >
                  {nextChapter.title}
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <Link
                  to="/"
                  className="flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors text-sm font-medium"
                >
                  Torna alla Home
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
