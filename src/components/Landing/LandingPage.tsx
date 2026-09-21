import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  Zap,
  Vote,
  Target,
  Brain,
  Scale,
  Megaphone,
  Landmark,
  Handshake,
  ExternalLink,
  ChevronDown,
  Menu,
  X,
  Github,
  Heart,
  AlertTriangle,
  Mail,
  Sparkles,
  Coffee,
  Smartphone,
  Monitor,
  Server,
  Gamepad2,
  Map,
  HelpCircle,
  Check,
} from 'lucide-react';
import { HeroBackdrop } from './HeroBackdrop';
import { NeuralformingMark } from '../Brand/NeuralformingMark';
import { LangSwitch } from '../Brand/LangSwitch';
import { useLandingCopy } from '../../lib/i18n/useLandingCopy';

const BMC_URL = 'https://buymeacoffee.com/relatronica';
const GITHUB_URL = 'https://github.com/Relatronica/Neuralforming';

interface LandingPageProps {
  onStartMultiplayer: () => void;
  onStartSinglePlayer: () => void;
}

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

function RevealSection({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
    >
      {children}
    </div>
  );
}

function SectionKicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-tech-cyan font-mono text-xs tracking-[0.22em] uppercase mb-3">
      {children}
    </p>
  );
}

export const LandingPage = ({
  onStartMultiplayer,
  onStartSinglePlayer,
}: LandingPageProps) => {
  const { locale, setLocale, t } = useLandingCopy();
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showCloudModal, setShowCloudModal] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const navItems = [
    { id: 'why', label: t.nav.why },
    { id: 'about', label: t.nav.about },
    { id: 'how', label: t.nav.how },
    { id: 'use', label: t.nav.use },
    { id: 'faq', label: t.nav.faq },
    { id: 'roadmap', label: t.nav.roadmap },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setNavOpen(false);
  };

  return (
    <div className="min-h-screen bg-cyber-950 text-gray-100 selection:bg-tech-cyan selection:text-cyber-950">
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-cyber-950/90 backdrop-blur-md border-b border-white/10 shadow-xl shadow-black/40'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16 gap-4">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5 group shrink-0"
          >
            <NeuralformingMark className="w-8 h-8 group-hover:scale-105 transition-transform" />
            <span className="font-heading font-bold text-xl tracking-tight text-gray-100 group-hover:text-tech-cyan transition-colors hidden sm:inline">
              Neuralforming
            </span>
          </button>

          <div className="hidden lg:flex items-center gap-3 xl:gap-4 min-w-0 flex-1 justify-end">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="text-sm font-medium text-gray-400 hover:text-tech-cyan transition-colors whitespace-nowrap"
              >
                {item.label}
              </button>
            ))}
            <LangSwitch locale={locale} setLocale={setLocale} />
            <a
              href={BMC_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-heading font-semibold text-ethics-amber hover:text-amber-300 transition-colors shrink-0"
            >
              <Coffee className="w-4 h-4" />
              {t.nav.donate}
            </a>
            <button
              onClick={() => scrollTo('play')}
              className="shrink-0 bg-gradient-to-r from-neural-medium to-neural-dark hover:from-neural-light hover:to-neural-medium text-white text-sm font-heading font-semibold px-4 py-2 rounded-xl transition-all shadow-md shadow-neural-medium/30 hover:shadow-neural-medium/50 hover:-translate-y-0.5"
            >
              {t.nav.playNow}
            </button>
          </div>

          <div className="flex items-center gap-1 lg:hidden">
            <LangSwitch locale={locale} setLocale={setLocale} />
            <button
              className="text-gray-300 hover:text-gray-100 p-2"
              onClick={() => setNavOpen(!navOpen)}
              aria-label={t.nav.menu}
            >
              {navOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {navOpen && (
          <div className="lg:hidden glass-panel border-t border-white/10 px-4 pb-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="block w-full text-left py-2.5 text-gray-300 hover:text-tech-cyan transition-colors text-sm"
              >
                {item.label}
              </button>
            ))}
            <Link
              to="/guida"
              className="flex items-center gap-1.5 py-2.5 text-gray-300 hover:text-tech-cyan transition-colors text-sm"
            >
              <BookOpen className="w-3.5 h-3.5" />
              {t.nav.guide}
            </Link>
            <Link
              to="/contatti"
              className="flex items-center gap-1.5 py-2.5 text-gray-300 hover:text-tech-cyan transition-colors text-sm"
            >
              <Mail className="w-3.5 h-3.5" />
              {t.nav.contact}
            </Link>
            <a
              href={BMC_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 py-2.5 text-ethics-amber hover:text-amber-300 transition-colors text-sm font-heading font-semibold"
            >
              <Coffee className="w-4 h-4" />
              {t.nav.donate}
            </a>
            <button
              onClick={() => {
                scrollTo('play');
                setNavOpen(false);
              }}
              className="block w-full text-left py-2.5 text-tech-cyan font-heading font-semibold text-sm"
            >
              {t.nav.playNow}
            </button>
          </div>
        )}
      </nav>

      <header className="relative min-h-screen flex items-center justify-center pt-20 pb-16 overflow-hidden">
        <HeroBackdrop />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 w-full text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-tech-cyan/30 text-tech-cyan text-xs font-mono tracking-wide">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-ethics-amber" />
            <span>{t.hero.badge}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight leading-[1.1] text-gray-100">
            {t.hero.titleLead}{' '}
            <span className="bg-gradient-to-r from-tech-cyan via-neural-light to-ethics-amber bg-clip-text text-transparent">
              {t.hero.titleAccent}
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed font-sans">
            {t.hero.lead}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setShowCloudModal(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-neural-medium to-neural-dark hover:from-neural-light hover:to-neural-medium text-white font-heading font-semibold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg shadow-neural-medium/30 hover:shadow-neural-medium/50 hover:-translate-y-0.5"
            >
              <Users className="w-5 h-5 text-tech-cyan" />
              {t.hero.playMulti}
            </button>

            <a
              href={BMC_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 glass-panel hover:bg-cyber-800/80 text-ethics-amber font-heading font-semibold py-4 px-7 rounded-xl border border-ethics-amber/30 hover:border-ethics-amber/60 transition-all duration-200 hover:-translate-y-0.5"
            >
              <Coffee className="w-5 h-5" />
              {t.hero.donate}
            </a>
          </div>

          <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div>
              <p className="text-xl sm:text-2xl font-mono font-bold text-tech-cyan">2–8</p>
              <p className="text-xs text-gray-400 font-sans">{t.hero.players}</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-mono font-bold text-ethics-amber">15+</p>
              <p className="text-xs text-gray-400 font-sans">{t.hero.dilemmas}</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-mono font-bold text-neural-light">AGPL</p>
              <p className="text-xs text-gray-400 font-sans">{t.hero.openSource}</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => scrollTo('why')}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-gray-400 hover:text-tech-cyan transition-colors animate-bounce p-2"
          aria-label={t.hero.scrollDown}
        >
          <ChevronDown className="w-7 h-7" />
        </button>
      </header>

      <section id="why" className="py-24 sm:py-32 bg-cyber-900/60 border-y border-white/5 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <RevealSection className="max-w-3xl mx-auto text-center mb-16">
            <SectionKicker>{t.why.kicker}</SectionKicker>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-6">
              {t.why.title}
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-8">{t.why.lead}</p>
            <blockquote className="font-heading text-xl sm:text-2xl text-neural-light italic leading-snug">
              {t.why.quote}
            </blockquote>
          </RevealSection>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                icon: Megaphone,
                color: 'text-crisis-rose',
                border: 'border-crisis-rose/25',
                title: t.why.politicalTitle,
                desc: t.why.politicalDesc,
              },
              {
                icon: Landmark,
                color: 'text-ethics-amber',
                border: 'border-ethics-amber/25',
                title: t.why.gameTitle,
                desc: t.why.gameDesc,
              },
              {
                icon: Handshake,
                color: 'text-tech-cyan',
                border: 'border-tech-cyan/25',
                title: t.why.youthTitle,
                desc: t.why.youthDesc,
              },
            ].map((item) => (
              <RevealSection key={item.title}>
                <div className={`glass-card rounded-2xl p-8 h-full ${item.border}`}>
                  <item.icon className={`w-10 h-10 ${item.color} mb-5`} />
                  <h3 className="text-xl font-heading font-bold text-gray-100 mb-3">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>

          <RevealSection>
            <div className="glass-panel rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto text-center border border-neural-medium/25">
              <p className="text-gray-300 leading-relaxed text-lg">
                {t.why.closerBefore}{' '}
                <strong className="text-gray-100">{t.why.closerNo}</strong>,{' '}
                <strong className="text-gray-100">{t.why.closerYes}</strong> {t.why.closerAnd}{' '}
                <strong className="text-gray-100">{t.why.closerDepends}</strong> {t.why.closerAfter}
              </p>
            </div>
          </RevealSection>
        </div>
      </section>

      <section id="about" className="py-24 sm:py-32 relative scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <RevealSection>
            <SectionKicker>{t.about.kicker}</SectionKicker>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-6">{t.about.title}</h2>
          </RevealSection>

          <RevealSection className="mb-12">
            <div className="glass-card rounded-2xl p-6 sm:p-8 border border-neural-medium/30 glow-neural">
              <div className="flex items-start gap-4">
                <div className="shrink-0 p-3 rounded-xl bg-neural-medium/15 border border-neural-medium/30">
                  <Target className="w-6 h-6 text-neural-light" />
                </div>
                <div>
                  <p className="font-heading font-semibold text-neural-light mb-2">{t.about.objectiveLabel}</p>
                  <p className="text-gray-300 leading-relaxed text-lg">{t.about.objective}</p>
                </div>
              </div>
            </div>
          </RevealSection>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            <RevealSection>
              <p className="text-gray-300 leading-relaxed text-lg mb-6">{t.about.body1}</p>
              <p className="text-gray-300 leading-relaxed text-lg mb-6">
                {t.about.body2Before}{' '}
                <strong className="text-tech-cyan">{t.about.tech}</strong>,{' '}
                <strong className="text-ethics-amber">{t.about.ethics}</strong> {t.why.closerAnd}{' '}
                <strong className="text-neural-light">{t.about.neural}</strong> {t.about.body2After}
              </p>
              <Link
                to="/guida"
                className="inline-flex items-center gap-2 text-tech-cyan hover:text-tech-blue font-medium transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                {t.about.readGuide}
              </Link>
            </RevealSection>

            <RevealSection>
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    icon: Zap,
                    color: 'text-tech-cyan',
                    bg: 'bg-tech-cyan/10',
                    border: 'border-tech-cyan/20',
                    title: t.about.techTitle,
                    desc: t.about.techDesc,
                  },
                  {
                    icon: Scale,
                    color: 'text-ethics-amber',
                    bg: 'bg-ethics-amber/10',
                    border: 'border-ethics-amber/20',
                    title: t.about.ethicsTitle,
                    desc: t.about.ethicsDesc,
                  },
                  {
                    icon: Brain,
                    color: 'text-neural-light',
                    bg: 'bg-neural-medium/15',
                    border: 'border-neural-medium/25',
                    title: t.about.neuralTitle,
                    desc: t.about.neuralDesc,
                  },
                  {
                    icon: Target,
                    color: 'text-ethics-gold',
                    bg: 'bg-ethics-gold/10',
                    border: 'border-ethics-gold/20',
                    title: t.about.secretsTitle,
                    desc: t.about.secretsDesc,
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className={`glass-panel rounded-xl p-5 hover:border-white/20 transition-colors ${item.border}`}
                  >
                    <div className={`${item.bg} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <h4 className="font-heading font-semibold text-sm text-gray-100 mb-1">{item.title}</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      <section id="how" className="py-24 sm:py-32 bg-cyber-900/60 border-y border-white/5 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <RevealSection className="text-center mb-16">
            <SectionKicker>{t.how.kicker}</SectionKicker>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">{t.how.title}</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">{t.how.lead}</p>
          </RevealSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                icon: Zap,
                color: 'text-tech-cyan',
                border: 'border-tech-cyan/25',
                title: t.how.p1Title,
                desc: t.how.p1Desc,
              },
              {
                step: '02',
                icon: Scale,
                color: 'text-ethics-amber',
                border: 'border-ethics-amber/25',
                title: t.how.p2Title,
                desc: t.how.p2Desc,
              },
              {
                step: '03',
                icon: Vote,
                color: 'text-crisis-rose',
                border: 'border-crisis-rose/25',
                title: t.how.p3Title,
                desc: t.how.p3Desc,
              },
              {
                step: '04',
                icon: Target,
                color: 'text-neural-light',
                border: 'border-neural-medium/30',
                title: t.how.p4Title,
                desc: t.how.p4Desc,
              },
            ].map((phase) => (
              <RevealSection key={phase.step}>
                <div className={`glass-panel rounded-xl p-6 h-full hover:bg-cyber-800/80 transition-colors ${phase.border}`}>
                  <span className={`text-xs font-mono font-bold ${phase.color} uppercase tracking-widest`}>
                    {t.how.phase} {phase.step}
                  </span>
                  <div className="mt-4 mb-3">
                    <phase.icon className={`w-8 h-8 ${phase.color}`} />
                  </div>
                  <h3 className="text-lg font-heading font-bold text-gray-100 mb-2">{phase.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{phase.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      <section id="use" className="py-24 sm:py-32 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <RevealSection className="text-center mb-16">
            <SectionKicker>{t.use.kicker}</SectionKicker>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">{t.use.title}</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">{t.use.lead}</p>
          </RevealSection>

          <div className="grid md:grid-cols-3 gap-6">
            <RevealSection>
              <div className="glass-card rounded-2xl p-6 h-full flex flex-col border border-neural-medium/35">
                <div className="flex items-center justify-between mb-5">
                  <div className="p-3 rounded-xl bg-neural-medium/15 border border-neural-medium/30">
                    <Monitor className="w-6 h-6 text-neural-light" />
                  </div>
                  <span className="text-[10px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-full bg-neural-medium/15 text-neural-light border border-neural-medium/30">
                    {t.use.recommended}
                  </span>
                </div>
                <h3 className="font-heading text-xl font-bold mb-2">{t.use.classTitle}</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-4 flex-1">{t.use.classDesc}</p>
                <ul className="space-y-2 text-xs text-gray-300 mb-6">
                  <li className="flex items-center gap-2">
                    <Smartphone className="w-3.5 h-3.5 text-tech-cyan shrink-0" />
                    {t.use.classBullet1}
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-tech-cyan shrink-0" />
                    {t.use.classBullet2}
                  </li>
                </ul>
                <button
                  onClick={() => setShowCloudModal(true)}
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-neural-medium to-neural-dark hover:from-neural-light hover:to-neural-medium text-white font-heading font-semibold py-2.5 px-4 rounded-xl transition-all shadow-md shadow-neural-medium/20 text-sm"
                >
                  {t.use.classCta}
                </button>
              </div>
            </RevealSection>

            <RevealSection>
              <div className="glass-card rounded-2xl p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-5">
                  <div className="p-3 rounded-xl bg-tech-cyan/10 border border-tech-cyan/25">
                    <Gamepad2 className="w-6 h-6 text-tech-cyan" />
                  </div>
                  <span className="text-[10px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-full bg-cyber-800 text-gray-400 border border-white/10">
                    {t.use.soloBadge}
                  </span>
                </div>
                <h3 className="font-heading text-xl font-bold mb-2">{t.use.soloTitle}</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-4 flex-1">{t.use.soloDesc}</p>
                <ul className="space-y-2 text-xs text-gray-300 mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-tech-cyan shrink-0" /> {t.use.soloBullet1}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-tech-cyan shrink-0" /> {t.use.soloBullet2}
                  </li>
                </ul>
                <button
                  onClick={onStartSinglePlayer}
                  className="w-full inline-flex items-center justify-center gap-2 glass-panel hover:bg-cyber-800 text-gray-100 font-heading font-semibold py-2.5 px-4 rounded-xl border border-tech-cyan/30 hover:border-tech-cyan/60 transition-all text-sm"
                >
                  {t.use.soloCta}
                </button>
              </div>
            </RevealSection>

            <RevealSection>
              <div className="glass-card rounded-2xl p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-5">
                  <div className="p-3 rounded-xl bg-cyber-800 border border-white/10">
                    <Server className="w-6 h-6 text-gray-300" />
                  </div>
                  <span className="text-[10px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-full bg-cyber-800 text-gray-400 border border-white/10">
                    Self-hosted
                  </span>
                </div>
                <h3 className="font-heading text-xl font-bold mb-2">{t.use.selfTitle}</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-4 flex-1">{t.use.selfDesc}</p>
                <ul className="space-y-2 text-xs text-gray-300 mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-ethics-amber shrink-0" /> {t.use.selfBullet1}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-ethics-amber shrink-0" /> {t.use.selfBullet2}
                  </li>
                </ul>
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-cyber-800 hover:bg-cyber-700 text-gray-200 font-heading font-semibold py-2.5 px-4 rounded-xl border border-white/10 transition-colors text-sm"
                >
                  <Github className="w-4 h-4" />
                  {t.use.selfCta}
                </a>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      <section id="faq" className="py-24 sm:py-32 scroll-mt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <RevealSection className="text-center mb-12">
            <SectionKicker>{t.faq.kicker}</SectionKicker>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4 flex items-center justify-center gap-3">
              <HelpCircle className="w-8 h-8 text-tech-cyan" />
              {t.faq.title}
            </h2>
            <p className="text-gray-400 text-lg">{t.faq.lead}</p>
          </RevealSection>

          <RevealSection>
            <div className="space-y-3">
              {t.faq.items.map((item, i) => {
                const open = openFaq === i;
                return (
                  <div
                    key={item.q}
                    className={`glass-panel rounded-xl overflow-hidden transition-colors ${open ? 'border-tech-cyan/30' : ''}`}
                  >
                    <button
                      onClick={() => setOpenFaq(open ? null : i)}
                      className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                      aria-expanded={open}
                    >
                      <span className="font-heading font-semibold text-gray-100">{item.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-tech-cyan shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {open && (
                      <p className="px-5 pb-5 text-sm text-gray-400 leading-relaxed">{item.a}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </RevealSection>
        </div>
      </section>

      <section id="roadmap" className="py-24 sm:py-32 bg-cyber-900/60 border-y border-white/5 scroll-mt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <RevealSection className="text-center mb-16">
            <SectionKicker>{t.roadmap.kicker}</SectionKicker>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4 flex items-center justify-center gap-3">
              <Map className="w-8 h-8 text-neural-light" />
              {t.roadmap.title}
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">{t.roadmap.lead}</p>
          </RevealSection>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                label: t.roadmap.now,
                accent: 'text-tech-cyan',
                dot: 'bg-tech-cyan',
                border: 'border-tech-cyan/30',
                items: t.roadmap.nowItems,
              },
              {
                label: t.roadmap.next,
                accent: 'text-neural-light',
                dot: 'bg-neural-light',
                border: 'border-neural-medium/35',
                items: t.roadmap.nextItems,
              },
              {
                label: t.roadmap.later,
                accent: 'text-ethics-amber',
                dot: 'bg-ethics-amber',
                border: 'border-ethics-amber/30',
                items: t.roadmap.laterItems,
              },
            ].map((col) => (
              <RevealSection key={col.label}>
                <div className={`glass-card rounded-2xl p-6 h-full ${col.border}`}>
                  <p className={`font-mono text-xs tracking-[0.2em] uppercase mb-4 ${col.accent}`}>
                    {col.label}
                  </p>
                  <ul className="space-y-3">
                    {col.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-gray-300 leading-relaxed">
                        <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${col.dot}`} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      <section id="play" className="py-24 sm:py-32 scroll-mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <RevealSection>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">{t.cta.title}</h2>
            <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">{t.cta.lead}</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button
                onClick={() => setShowCloudModal(true)}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-neural-medium to-neural-dark hover:from-neural-light hover:to-neural-medium text-white font-heading font-semibold py-3.5 px-8 rounded-xl transition-all duration-200 shadow-lg shadow-neural-medium/25 hover:-translate-y-0.5"
              >
                <Users className="w-5 h-5 text-tech-cyan" />
                {t.cta.createRoom}
              </button>
              <a
                href={BMC_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 glass-panel text-ethics-amber font-heading font-semibold py-3.5 px-8 rounded-xl border border-ethics-amber/30 hover:border-ethics-amber/60 transition-all duration-200 hover:-translate-y-0.5"
              >
                <Coffee className="w-5 h-5" />
                {t.cta.donateBmc}
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
              <Link
                to="/guida"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-tech-cyan transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                {t.cta.guide}
              </Link>
              <Link
                to="/contatti"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-tech-cyan transition-colors"
              >
                <Mail className="w-4 h-4" />
                {t.cta.contact}
              </Link>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-tech-cyan transition-colors"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
            </div>
          </RevealSection>
        </div>
      </section>

      <footer className="border-t border-white/10 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <NeuralformingMark className="w-7 h-7" />
              <span className="font-heading font-semibold text-gray-300">Neuralforming</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-500">
              <Link to="/guida" className="hover:text-gray-300 transition-colors">
                {t.footer.guide}
              </Link>
              <Link to="/contatti" className="hover:text-gray-300 transition-colors">
                {t.footer.contact}
              </Link>
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">
                GitHub
              </a>
              <a
                href={BMC_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-ethics-amber transition-colors flex items-center gap-1"
              >
                <Heart className="w-3 h-3" />
                {t.footer.donate}
              </a>
            </div>

            <p className="text-xs text-gray-600">Open Source · AGPL-3.0</p>
          </div>
        </div>
      </footer>

      {showCloudModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-cyber-900 border border-white/10 rounded-2xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl space-y-6">
            <button
              onClick={() => setShowCloudModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition-colors p-1"
              aria-label={t.modal.close}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-ethics-amber">
              <div className="p-2.5 bg-ethics-amber/10 rounded-xl border border-ethics-amber/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-heading font-bold text-gray-100">{t.modal.title}</h3>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-ethics-amber/20 text-amber-300 rounded-full border border-ethics-amber/40 uppercase">
                  {t.modal.badge}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed">{t.modal.body}</p>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => {
                  setShowCloudModal(false);
                  onStartMultiplayer();
                }}
                className="w-full flex items-center justify-between bg-gradient-to-r from-neural-medium to-neural-dark hover:from-neural-light hover:to-neural-medium text-white font-heading font-semibold py-3 px-4 rounded-xl transition-all shadow-md text-sm group"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-tech-cyan" />
                  <span>{t.modal.tryDemo}</span>
                </div>
                <span className="text-xs text-neural-light group-hover:translate-x-0.5 transition-transform">→</span>
              </button>

              <Link
                to="/contatti?motivo=instance"
                className="w-full flex items-center justify-between bg-ethics-amber/10 hover:bg-ethics-amber/20 text-amber-300 font-heading font-semibold py-3 px-4 rounded-xl border border-ethics-amber/30 transition-all text-sm"
              >
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-ethics-amber" />
                  <span>{t.modal.requestInstance}</span>
                </div>
                <span className="text-xs text-ethics-amber">→</span>
              </Link>

              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between bg-cyber-800 hover:bg-cyber-700 text-gray-200 font-medium py-3 px-4 rounded-xl border border-white/10 transition-all text-sm"
              >
                <div className="flex items-center gap-2">
                  <Github className="w-4 h-4 text-gray-400" />
                  <span>{t.modal.selfHost}</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
              </a>
            </div>

            <p className="text-[11px] text-gray-500 text-center">{t.modal.footnote}</p>
          </div>
        </div>
      )}
    </div>
  );
};
