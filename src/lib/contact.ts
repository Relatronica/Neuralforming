export const CONTACT_REASONS = [
  'instance',
  'bug',
  'school',
  'contribute',
  'question',
  'press',
  'other',
] as const;

export type ContactReason = (typeof CONTACT_REASONS)[number];

export function isContactReason(value: unknown): value is ContactReason {
  return typeof value === 'string' && (CONTACT_REASONS as readonly string[]).includes(value);
}

export const CONTACT_REASON_LABEL: Record<ContactReason, string> = {
  instance: 'Istanza stabile per evento o classe',
  bug: 'Segnalazione bug',
  school: 'Workshop o uso scolastico',
  contribute: 'Contributo (codice, dilemmi, traduzioni)',
  question: 'Domanda sul progetto',
  press: 'Stampa o partnership',
  other: 'Altro',
};

export const CONTACT_REASON_PLACEHOLDER: Record<ContactReason, string> = {
  instance: 'Data, luogo, numero di partecipanti, scuola o evento…',
  bug: 'Cosa è successo, su quale dispositivo, come si riproduce…',
  school: 'Classe, materia, quando vorresti usarlo…',
  contribute: 'Cosa vorresti aggiungere o migliorare…',
  question: 'Scrivi la tua domanda…',
  press: 'Testata, scadenza, di cosa hai bisogno…',
  other: 'Come possiamo aiutarti…',
};

const MAX_NAME = 120;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 5000;

export type ContactPayload = {
  name: string;
  email: string;
  reason: ContactReason;
  message: string;
};

export type ContactParseResult =
  | { ok: true; honeypot: true }
  | { ok: true; honeypot?: false; data: ContactPayload }
  | { ok: false; error: string };

function isNonEmptyString(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= max;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function parseContactBody(body: unknown): ContactParseResult {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'invalid_json' };
  }

  const data = body as Record<string, unknown>;

  if (typeof data.website === 'string' && data.website.trim() !== '') {
    return { ok: true, honeypot: true };
  }

  if (!isNonEmptyString(data.name, MAX_NAME)) {
    return { ok: false, error: 'invalid_name' };
  }
  if (!isNonEmptyString(data.email, MAX_EMAIL) || !isValidEmail(data.email.trim())) {
    return { ok: false, error: 'invalid_email' };
  }
  if (!isContactReason(data.reason)) {
    return { ok: false, error: 'invalid_reason' };
  }
  if (!isNonEmptyString(data.message, MAX_MESSAGE)) {
    return { ok: false, error: 'invalid_message' };
  }

  return {
    ok: true,
    data: {
      name: data.name.trim(),
      email: data.email.trim(),
      reason: data.reason,
      message: data.message.trim(),
    },
  };
}
