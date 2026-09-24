import { Link } from 'react-router-dom';
import { ArrowLeft, HeartHandshake } from 'lucide-react';
import { NeuralformingMark } from '../Brand/NeuralformingMark';
import { SiteCredit } from '../Brand/SiteCredit';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';

const PEOPLE = [
  'Morosini Maria Elisa',
  'Michela Matera',
  'Ilaria Gallocchio',
  'Fabiana Signorini',
  'Capasso Teresa',
  'Marco Capasso',
  'Maddalena Vialli',
] as const;

const GROUPS = [
  "Studenti dell'Istituto Superiore Carlo Emilio Gadda",
  'Biblioteca di Cormano',
] as const;

export function ContributorsPage() {
  useDocumentMeta({
    title: 'Contributori — Neuralforming',
    description:
      'Un ringraziamento pubblico a chi ha contribuito a Neuralforming: persone, scuole e comunità che hanno sostenuto il progetto.',
    path: '/contributori',
    locale: 'it',
  });

  return (
    <div className="min-h-screen bg-cyber-950 text-gray-100 flex flex-col">
      <header className="sticky top-0 z-40 bg-cyber-950/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-14">
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-400 hover:text-gray-100 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Torna alla Home</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <HeartHandshake className="w-5 h-5 text-tech-cyan" />
            <h1 className="font-heading font-bold text-lg">Contributori</h1>
          </div>
          <NeuralformingMark className="w-7 h-7" />
        </div>
      </header>

      <section className="relative mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
        <p className="text-tech-cyan font-mono text-xs tracking-[0.22em] uppercase mb-3">
          Grazie
        </p>
        <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
          Chi ha reso possibile Neuralforming
        </h2>
        <p className="text-gray-400 leading-relaxed mb-10">
          Un ringraziamento pubblico a chi ha contribuito tempo, idee e supporto.
          Senza di voi questo progetto non sarebbe lo stesso.
        </p>

        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 sm:p-8">
            <p className="text-tech-cyan font-mono text-xs tracking-[0.18em] uppercase mb-5">
              Persone
            </p>
            <ul className="space-y-3">
              {PEOPLE.map((name) => (
                <li
                  key={name}
                  className="font-heading text-lg text-gray-100 border-b border-white/5 pb-3 last:border-0 last:pb-0"
                >
                  {name}
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card rounded-2xl p-6 sm:p-8">
            <p className="text-tech-cyan font-mono text-xs tracking-[0.18em] uppercase mb-5">
              Scuole e comunità
            </p>
            <ul className="space-y-3">
              {GROUPS.map((name) => (
                <li
                  key={name}
                  className="font-heading text-lg text-gray-100 border-b border-white/5 pb-3 last:border-0 last:pb-0"
                >
                  {name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <footer className="mt-auto border-t border-white/10 py-8">
        <p className="text-center text-xs text-gray-600">
          <SiteCredit prefix="Un progetto di" />
          {' · '}Open Source · AGPL-3.0
        </p>
      </footer>
    </div>
  );
}
