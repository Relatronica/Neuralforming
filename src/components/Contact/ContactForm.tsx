import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Check, CheckCircle2, ChevronDown, Loader2, Send } from 'lucide-react';
import {
  CONTACT_REASON_LABEL,
  CONTACT_REASON_PLACEHOLDER,
  CONTACT_REASONS,
  isContactReason,
  type ContactReason,
} from '../../lib/contact';

type Status = 'idle' | 'sending' | 'success' | 'error';

const ERROR_COPY: Record<string, string> = {
  invalid_email: 'Inserisci un indirizzo email valido.',
  invalid_reason: 'Scegli il motivo del messaggio.',
  invalid_name: 'Nome e messaggio sono obbligatori.',
  invalid_message: 'Nome e messaggio sono obbligatori.',
  not_configured: 'Il form non è ancora configurato. Riprova più tardi o scrivi a info@relatronica.com.',
  send_failed: 'Invio non riuscito. Riprova tra poco.',
};

export function ContactForm({ initialReason = '' }: { initialReason?: string }) {
  const [status, setStatus] = useState<Status>('idle');
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [reason, setReason] = useState<ContactReason | ''>(
    isContactReason(initialReason) ? initialReason : ''
  );
  const [reasonOpen, setReasonOpen] = useState(false);
  const reasonListId = useId();
  const reasonWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isContactReason(initialReason)) {
      setReason(initialReason);
    }
  }, [initialReason]);

  useEffect(() => {
    if (!reasonOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!reasonWrapRef.current?.contains(e.target as Node)) {
        setReasonOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setReasonOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [reasonOpen]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === 'sending') return;

    if (!reason) {
      setErrorKey('invalid_reason');
      setStatus('error');
      return;
    }

    const form = e.currentTarget;
    const data = new FormData(form);

    setStatus('sending');
    setErrorKey(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          reason,
          message: data.get('message'),
          website: data.get('website'),
        }),
      });

      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as { error?: string } | null;
        setErrorKey(payload?.error ?? 'send_failed');
        setStatus('error');
        return;
      }

      form.reset();
      setReason('');
      setStatus('success');
    } catch {
      setErrorKey('send_failed');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="py-4 text-center" role="status">
        <CheckCircle2 className="mx-auto h-8 w-8 text-tech-cyan" aria-hidden />
        <p className="mt-4 font-heading font-semibold text-gray-100">Messaggio inviato.</p>
        <p className="mt-2 text-sm text-gray-400">Ti rispondiamo appena possibile.</p>
        <button
          type="button"
          className="mt-5 text-sm text-tech-cyan hover:text-tech-blue underline-offset-4 hover:underline"
          onClick={() => setStatus('idle')}
        >
          Invia un altro messaggio
        </button>
      </div>
    );
  }

  const fieldClass =
    'w-full rounded-xl bg-cyber-900/80 border border-white/10 px-3.5 py-2.5 text-sm text-gray-100 placeholder:text-gray-500 outline-none focus:border-tech-cyan/50 focus:ring-2 focus:ring-tech-cyan/20 disabled:opacity-50';

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="absolute -left-[9999px] top-auto h-0 w-0 overflow-hidden" aria-hidden>
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="contact-name" className="text-sm font-medium text-gray-300">
            Nome
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            maxLength={120}
            autoComplete="name"
            disabled={status === 'sending'}
            className={fieldClass}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="contact-email" className="text-sm font-medium text-gray-300">
            Email
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            disabled={status === 'sending'}
            className={fieldClass}
          />
        </div>
      </div>

      <div className="space-y-2" ref={reasonWrapRef}>
        <label id={`${reasonListId}-label`} className="text-sm font-medium text-gray-300">
          Motivo
        </label>
        <div className="relative">
          <button
            type="button"
            id="contact-reason"
            disabled={status === 'sending'}
            aria-haspopup="listbox"
            aria-expanded={reasonOpen}
            aria-labelledby={`${reasonListId}-label contact-reason`}
            aria-controls={reasonListId}
            onClick={() => setReasonOpen((open) => !open)}
            className={`${fieldClass} flex items-center justify-between gap-2 text-left ${
              reason ? '' : 'text-gray-500'
            }`}
          >
            <span className="truncate">
              {reason ? CONTACT_REASON_LABEL[reason] : 'Scegli il tipo di richiesta'}
            </span>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${reasonOpen ? 'rotate-180' : ''}`}
              aria-hidden
            />
          </button>

          {reasonOpen && (
            <ul
              id={reasonListId}
              role="listbox"
              aria-labelledby={`${reasonListId}-label`}
              className="absolute z-20 mt-1.5 max-h-64 w-full overflow-auto rounded-xl border border-white/10 bg-cyber-900 py-1 shadow-xl"
            >
              {CONTACT_REASONS.map((id) => {
                const selected = reason === id;
                return (
                  <li key={id} role="option" aria-selected={selected}>
                    <button
                      type="button"
                      className={`flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left text-sm transition-colors ${
                        selected ? 'bg-neural-medium/20 text-gray-100' : 'text-gray-300 hover:bg-white/5'
                      }`}
                      onClick={() => {
                        setReason(id);
                        setReasonOpen(false);
                        if (errorKey === 'invalid_reason') {
                          setErrorKey(null);
                          setStatus('idle');
                        }
                      }}
                    >
                      <span>{CONTACT_REASON_LABEL[id]}</span>
                      {selected && <Check className="h-3.5 w-3.5 shrink-0 text-tech-cyan" aria-hidden />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="contact-message" className="text-sm font-medium text-gray-300">
          Messaggio
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          maxLength={5000}
          rows={6}
          disabled={status === 'sending'}
          placeholder={reason ? CONTACT_REASON_PLACEHOLDER[reason] : 'Scrivi qui…'}
          className={`${fieldClass} min-h-[8rem] resize-y`}
        />
      </div>

      {status === 'error' && (
        <p className="text-sm text-crisis-rose" role="alert">
          {ERROR_COPY[errorKey ?? ''] ?? ERROR_COPY.send_failed}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-neural-medium to-neural-dark hover:from-neural-light hover:to-neural-medium text-white font-heading font-semibold py-3 px-6 rounded-xl transition-all shadow-md shadow-neural-medium/25 disabled:opacity-60"
      >
        {status === 'sending' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4 text-tech-cyan" />
        )}
        {status === 'sending' ? 'Invio…' : 'Invia'}
      </button>
    </form>
  );
}
