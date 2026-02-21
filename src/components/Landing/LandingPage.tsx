import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  Zap,
  Vote,
  Target,
  Brain,
  Atom,
  Scale,
  Lightbulb,
  GraduationCap,
  ExternalLink,
  ChevronDown,
  Menu,
  X,
  Play,
  User,
  Github,
  Heart,
} from 'lucide-react';

interface LandingPageProps {
  onStartSingle: () => void;
  onStartMultiplayer: () => void;
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
      { threshold: 0.15 }
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

const NAV_ITEMS = [
  { id: 'about', label: 'Il Gioco' },
  { id: 'how', label: 'Come Funziona' },
  { id: 'why', label: 'Finalità' },
  { id: 'team', label: 'Chi Siamo' },
  { id: 'support', label: 'Sostieni' },
];

export const LandingPage = ({
  onStartSingle,
  onStartMultiplayer,
}: LandingPageProps) => {
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* ── Navbar ── */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-gray-950/90 backdrop-blur-md shadow-lg shadow-black/20'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5 group"
          >
            <Atom className="w-8 h-8 text-primary-400" />
            <span className="font-bold text-lg tracking-tight text-gray-100 group-hover:text-primary-400 transition-colors hidden sm:inline">
              Neuralforming
            </span>
          </button>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="text-sm text-gray-400 hover:text-gray-100 transition-colors"
              >
                {item.label}
              </button>
            ))}
            <Link
              to="/guida"
              className="text-sm text-gray-400 hover:text-gray-100 transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Guida
            </Link>
            <button
              onClick={() => scrollTo('play')}
              className="ml-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Gioca Ora
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-gray-300 hover:text-gray-100 p-2"
            onClick={() => setNavOpen(!navOpen)}
            aria-label="Menu"
          >
            {navOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {navOpen && (
          <div className="md:hidden bg-gray-950/95 backdrop-blur-md border-t border-gray-800 px-4 pb-4 space-y-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="block w-full text-left py-2.5 text-gray-300 hover:text-gray-100 transition-colors text-sm"
              >
                {item.label}
              </button>
            ))}
            <Link
              to="/guida"
              className="flex items-center gap-1.5 py-2.5 text-gray-300 hover:text-gray-100 transition-colors text-sm"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Guida al Gioco
            </Link>
            <button
              onClick={() => {
                scrollTo('play');
                setNavOpen(false);
              }}
              className="block w-full text-left py-2.5 text-primary-400 font-semibold text-sm"
            >
              Gioca Ora
            </button>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <header className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/home.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-gray-950" />

        <div className="relative z-10 text-center px-4 sm:px-6 max-w-3xl mx-auto pt-16">
          <div className="relative mx-auto mb-6 w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-primary-500/15 blur-2xl" />
            <div className="relative bg-gray-900/60 border border-primary-500/30 rounded-full p-8 sm:p-10 backdrop-blur-sm">
              <Atom className="w-20 h-20 sm:w-24 sm:h-24 text-primary-400" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-gray-100 via-primary-300 to-neural-light bg-clip-text text-transparent">
            Governare l'Intelligenza Artificiale
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Un gioco strategico ed educativo dove la tecnologia incontra l'etica.
            Affronta dilemmi reali, vota in parlamento e plasma il futuro dell'IA.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={onStartMultiplayer}
              className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-semibold py-3.5 px-8 rounded-xl transition-all duration-200 shadow-lg shadow-primary-600/25 hover:shadow-primary-500/30 hover:-translate-y-0.5"
            >
              <Users className="w-5 h-5" />
              Gioca in Classe
            </button>
            <button
              onClick={onStartSingle}
              className="inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-100 font-semibold py-3.5 px-8 rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-200 hover:-translate-y-0.5"
            >
              <Play className="w-5 h-5" />
              Prova il Playground
            </button>
          </div>
        </div>

        <button
          onClick={() => scrollTo('about')}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-400 hover:text-gray-200 transition-colors animate-bounce"
          aria-label="Scorri verso il basso"
        >
          <ChevronDown className="w-8 h-8" />
        </button>
      </header>

      {/* ── Cos'è Neuralforming ── */}
      <section id="about" className="py-24 sm:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <RevealSection>
            <p className="text-primary-400 font-semibold text-sm uppercase tracking-wider mb-3">
              Il Gioco
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Cos'è Neuralforming?
            </h2>
          </RevealSection>

          <div className="grid md:grid-cols-2 gap-12 items-start mt-8">
            <RevealSection>
              <p className="text-gray-300 leading-relaxed text-lg mb-6">
                In Neuralforming interpreti un <strong className="text-gray-100">partito politico</strong> che
                deve guidare lo sviluppo dell'Intelligenza Artificiale.
                Ad ogni turno dovrai proporre nuove tecnologie, affrontare dilemmi etici
                e sottoporre le tue scelte al voto parlamentare.
              </p>
              <p className="text-gray-300 leading-relaxed text-lg mb-6">
                L'obiettivo è raggiungere il perfetto equilibrio tra{' '}
                <strong className="text-primary-400">innovazione tecnologica</strong> e{' '}
                <strong className="text-green-400">responsabilità etica</strong>, completando
                il tuo obiettivo segreto prima degli avversari.
              </p>
              <Link
                to="/guida"
                className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 font-medium transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Leggi la guida completa
              </Link>
            </RevealSection>

            <RevealSection>
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    icon: Zap,
                    color: 'text-blue-400',
                    bg: 'bg-blue-400/10',
                    title: 'Punti Tecnologia',
                    desc: 'Fai avanzare la ricerca con tecnologie all\'avanguardia',
                  },
                  {
                    icon: Scale,
                    color: 'text-green-400',
                    bg: 'bg-green-400/10',
                    title: 'Punti Etica',
                    desc: 'Proteggi i valori sociali e la trasparenza',
                  },
                  {
                    icon: Brain,
                    color: 'text-purple-400',
                    bg: 'bg-purple-400/10',
                    title: 'Neuralforming Score',
                    desc: 'Il bilanciamento perfetto tra progresso ed etica',
                  },
                  {
                    icon: Target,
                    color: 'text-amber-400',
                    bg: 'bg-amber-400/10',
                    title: 'Obiettivi Segreti',
                    desc: 'Ogni giocatore ha una missione unica da completare',
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors"
                  >
                    <div className={`${item.bg} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <h4 className="font-semibold text-sm text-gray-100 mb-1">{item.title}</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ── Come Funziona ── */}
      <section id="how" className="py-24 sm:py-32 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <RevealSection className="text-center mb-16">
            <p className="text-primary-400 font-semibold text-sm uppercase tracking-wider mb-3">
              Le Meccaniche
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Come Funziona</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Ogni turno si articola in quattro fasi che ti metteranno alla prova
              tra strategia, diplomazia e scelte morali.
            </p>
          </RevealSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                icon: Zap,
                color: 'text-blue-400',
                border: 'border-blue-500/30',
                title: 'Sviluppo Tecnologico',
                desc: 'Gioca una carta tecnologia dalla tua mano e proponila al parlamento per l\'approvazione.',
              },
              {
                step: '02',
                icon: Scale,
                color: 'text-green-400',
                border: 'border-green-500/30',
                title: 'Dilemma Etico',
                desc: 'Affronta un dilemma morale complesso e scegli tra opzioni con conseguenze diverse.',
              },
              {
                step: '03',
                icon: Vote,
                color: 'text-red-400',
                border: 'border-red-500/30',
                title: 'Votazione Parlamentare',
                desc: 'Le tue proposte vengono sottoposte al voto: ogni voto ha un impatto reale sui punteggi.',
              },
              {
                step: '04',
                icon: Target,
                color: 'text-amber-400',
                border: 'border-amber-500/30',
                title: 'Conseguenze',
                desc: 'Scopri gli effetti a lungo termine delle tue decisioni attraverso eventi narrativi.',
              },
            ].map((phase) => (
              <RevealSection key={phase.step}>
                <div
                  className={`bg-gray-900 border ${phase.border} rounded-xl p-6 h-full hover:bg-gray-800/80 transition-colors`}
                >
                  <span className={`text-xs font-bold ${phase.color} uppercase tracking-widest`}>
                    Fase {phase.step}
                  </span>
                  <div className="mt-4 mb-3">
                    <phase.icon className={`w-8 h-8 ${phase.color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-100 mb-2">{phase.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{phase.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>

          {/* Game modes badges */}
          <RevealSection className="mt-12">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="flex items-center gap-3 bg-primary-600/10 border border-primary-500/30 rounded-full px-6 py-3">
                <Users className="w-5 h-5 text-primary-400" />
                <div>
                  <p className="text-sm font-semibold text-gray-100">Multiplayer in Classe</p>
                  <p className="text-xs text-gray-400">2-8 giocatori in tempo reale</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-full px-6 py-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-semibold text-gray-100">Playground</p>
                  <p className="text-xs text-gray-500">Esplora il gioco in autonomia</p>
                </div>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── Finalità Educative ── */}
      <section id="why" className="py-24 sm:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <RevealSection className="text-center mb-16">
            <p className="text-primary-400 font-semibold text-sm uppercase tracking-wider mb-3">
              Perché Giocare
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Finalità Educative</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Neuralforming non è solo un gioco: è uno strumento per comprendere
              le sfide reali della governance dell'Intelligenza Artificiale.
            </p>
          </RevealSection>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                color: 'text-purple-400',
                bg: 'from-purple-500/10 to-purple-500/5',
                title: 'Etica dell\'IA',
                desc: 'Affronta dilemmi ispirati a problemi reali: bias algoritmici, sorveglianza, automazione del lavoro, privacy dei dati. Ogni scelta ha conseguenze concrete.',
              },
              {
                icon: Lightbulb,
                color: 'text-amber-400',
                bg: 'from-amber-500/10 to-amber-500/5',
                title: 'Pensiero Critico',
                desc: 'Non esistono risposte giuste o sbagliate. Impara a valutare trade-off complessi, a negoziare con altri giocatori e a costruire un punto di vista informato.',
              },
              {
                icon: GraduationCap,
                color: 'text-primary-400',
                bg: 'from-primary-500/10 to-primary-500/5',
                title: 'Governance Tecnologica',
                desc: 'Sperimenta in prima persona il processo decisionale politico: proponi leggi, affronta l\'opinione pubblica e bilancia progresso e responsabilità.',
              },
            ].map((item) => (
              <RevealSection key={item.title}>
                <div className={`bg-gradient-to-b ${item.bg} border border-gray-800 rounded-2xl p-8 h-full`}>
                  <item.icon className={`w-10 h-10 ${item.color} mb-5`} />
                  <h3 className="text-xl font-bold text-gray-100 mb-3">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Chi Siamo / Relatronica ── */}
      <section id="team" className="py-24 sm:py-32 bg-gray-900/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <RevealSection>
            <div className="text-center mb-12">
              <p className="text-primary-400 font-semibold text-sm uppercase tracking-wider mb-3">
                Chi Siamo
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Un progetto di Relatronica
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg italic">
                &ldquo;Il futuro è un progetto collettivo&rdquo;
              </p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 sm:p-10 mb-8">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="shrink-0 bg-primary-600/10 rounded-xl p-4">
                  <Lightbulb className="w-10 h-10 text-primary-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-100 mb-3">Relatronica</h3>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    <strong className="text-gray-100">Relatronica</strong> è un progetto indipendente
                    e open source che opera all'intersezione tra{' '}
                    <strong className="text-gray-100">Design Speculativo</strong>,{' '}
                    <strong className="text-gray-100">Civic Tech</strong> e{' '}
                    <strong className="text-gray-100">Knowledge Mapping</strong>.
                    Immagina futuri possibili e crea strumenti che aiutano le comunità
                    a comprenderli, discuterli e plasmarli.
                  </p>
                  <p className="text-gray-300 leading-relaxed mb-6">
                    Neuralforming nasce come gioco ibrido da tavolo pensato per le scuole:
                    trasforma la classe in un parlamento democratico dove gli studenti propongono leggi,
                    dibattono implicazioni etiche e votano decisioni che plasmeranno il futuro
                    dell'Intelligenza Artificiale. Un'esperienza educativa che unisce gioco,
                    democrazia e consapevolezza tecnologica.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <a
                      href="https://relatronica.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 font-semibold transition-colors"
                    >
                      Scopri tutti i progetti su relatronica.com
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Design Speculativo', desc: 'Scenari futuri per stimolare il pensiero critico' },
                { label: 'Civic Tech', desc: 'Tecnologie che potenziano le comunità' },
                { label: 'Knowledge Mapping', desc: 'Relazioni tra concetti rese accessibili' },
                { label: 'Tecnologie Responsabili', desc: 'Approccio etico orientato al bene collettivo' },
              ].map((pillar) => (
                <div
                  key={pillar.label}
                  className="bg-gray-900/80 border border-gray-800 rounded-xl px-5 py-4 text-center"
                >
                  <p className="font-semibold text-sm text-gray-200 mb-1">{pillar.label}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{pillar.desc}</p>
                </div>
              ))}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-5">
              <div className="shrink-0 bg-gray-800 rounded-full p-3">
                <Github className="w-7 h-7 text-gray-300" />
              </div>
              <div className="text-center sm:text-left">
                <h4 className="font-bold text-gray-100 mb-1">Open Source &middot; GPL-3.0</h4>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Neuralforming è un progetto open source: il codice è pubblico, modificabile e riutilizzabile.
                  Contribuisci con nuovi dilemmi, tecnologie o miglioramenti al gameplay.
                </p>
              </div>
              <a
                href="https://github.com/Relatronica/Neuralforming"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-100 font-semibold py-2.5 px-5 rounded-lg border border-gray-700 hover:border-gray-600 transition-all text-sm"
              >
                <Github className="w-4 h-4" />
                Vedi su GitHub
              </a>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── Sostieni il Progetto ── */}
      <section id="support" className="py-24 sm:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <RevealSection className="text-center mb-16">
            <p className="text-primary-400 font-semibold text-sm uppercase tracking-wider mb-3">
              Partecipa
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Sostieni il Futuro Aperto
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Neuralforming è un progetto indipendente e open source. Non vendiamo dati,
              non mostriamo pubblicità. Sostenere questo progetto non è una donazione:
              è un <strong className="text-gray-200">atto di partecipazione civica</strong>.
            </p>
          </RevealSection>

          <RevealSection>
            <div className="grid sm:grid-cols-3 gap-6 mb-10">
              {[
                {
                  tier: 'The Observer',
                  desc: 'Il tuo nome tra i Civic Heroes del progetto',
                  color: 'border-gray-700',
                  accent: 'text-gray-300',
                },
                {
                  tier: 'The Explorer',
                  desc: 'Accesso anticipato a nuovi dilemmi, carte e meccaniche in sviluppo',
                  color: 'border-primary-500/40',
                  accent: 'text-primary-400',
                },
                {
                  tier: 'The Future Architect',
                  desc: 'Dialogo diretto con il team per proporre scenari etici e meccaniche di gioco',
                  color: 'border-amber-500/40',
                  accent: 'text-amber-400',
                },
              ].map((item) => (
                <div
                  key={item.tier}
                  className={`bg-gray-900 border ${item.color} rounded-2xl p-6 text-center hover:bg-gray-800/80 transition-colors`}
                >
                  <Heart className={`w-8 h-8 ${item.accent} mx-auto mb-4`} />
                  <h3 className={`text-lg font-bold ${item.accent} mb-2`}>{item.tier}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <a
                href="https://relatronica.com/about"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-semibold py-3.5 px-8 rounded-xl transition-all duration-200 shadow-lg shadow-primary-600/25 hover:shadow-primary-500/30 hover:-translate-y-0.5"
              >
                <Heart className="w-5 h-5" />
                Diventa parte del progetto
              </a>
              <p className="text-xs text-gray-500 mt-4">
                Ogni contributo ci permette di sviluppare strumenti aperti, ricerca indipendente e risorse educative.
              </p>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── CTA Finale ── */}
      <section id="play" className="py-24 sm:py-32 bg-gray-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <RevealSection>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Porta Neuralforming nella tua classe
            </h2>
            <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
              Crea una stanza multiplayer e coinvolgi i tuoi studenti.
              Nessuna registrazione necessaria.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button
                onClick={onStartMultiplayer}
                className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-semibold py-3.5 px-8 rounded-xl transition-all duration-200 shadow-lg shadow-primary-600/25 hover:shadow-primary-500/30 hover:-translate-y-0.5"
              >
                <Users className="w-5 h-5" />
                Gioca in Classe
              </button>
              <button
                onClick={onStartSingle}
                className="inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-100 font-semibold py-3.5 px-8 rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-200 hover:-translate-y-0.5"
              >
                <Play className="w-5 h-5" />
                Prova il Playground
              </button>
            </div>

            <Link
              to="/guida"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors text-sm"
            >
              <BookOpen className="w-4 h-4" />
              Leggi la Guida al Gioco
            </Link>
          </RevealSection>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-800 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Atom className="w-6 h-6 text-primary-400" />
              <span className="font-semibold text-gray-300">Neuralforming</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-500">
              <Link to="/guida" className="hover:text-gray-300 transition-colors">
                Guida al Gioco
              </Link>
              <a
                href="https://relatronica.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-300 transition-colors"
              >
                relatronica.com
              </a>
              <a
                href="https://github.com/Relatronica/Neuralforming"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-300 transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://relatronica.com/about"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-300 transition-colors flex items-center gap-1"
              >
                <Heart className="w-3 h-3" />
                Sostieni
              </a>
            </div>

            <p className="text-xs text-gray-600">
              Open Source &middot; GPL-3.0
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
