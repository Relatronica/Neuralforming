import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import { NeuralformingMark } from '../Brand/NeuralformingMark';
import { SiteCredit } from '../Brand/SiteCredit';
import { ContactForm } from './ContactForm';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';

export function ContactPage() {
  const [params] = useSearchParams();
  const initialReason = params.get('motivo') ?? '';

  useDocumentMeta({
    title: 'Contatti — Neuralforming',
    description:
      'Scrivi a Relatronica per richiedere un’istanza stabile, segnalare un bug, organizzare un workshop o contribuire a Neuralforming.',
    path: '/contatti',
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
            <Mail className="w-5 h-5 text-tech-cyan" />
            <h1 className="font-heading font-bold text-lg">Contatti</h1>
          </div>
          <NeuralformingMark className="w-7 h-7" />
        </div>
      </header>

      <section className="relative mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
        <p className="text-tech-cyan font-mono text-xs tracking-[0.22em] uppercase mb-3">
          Scrivici
        </p>
        <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
          Segnalazioni, istanze, domande
        </h2>
        <p className="text-gray-400 leading-relaxed mb-10">
          Un solo form: scegli il motivo e raccontaci cosa ti serve. Lo usiamo per le richieste
          di istanza stabile, i bug, i workshop e chi vuole contribuire al progetto.
        </p>
        <div className="relative glass-card rounded-2xl p-6 sm:p-8">
          <ContactForm initialReason={initialReason} />
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
