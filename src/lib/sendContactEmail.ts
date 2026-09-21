import { Resend } from 'resend';
import { CONTACT_REASON_LABEL, parseContactBody } from './contact';

const DEFAULT_TO_EMAIL = 'info@relatronica.com';
const DEFAULT_FROM_EMAIL = 'Neuralforming <onboarding@resend.dev>';

export type ContactEnv = {
  RESEND_API_KEY?: string;
  CONTACT_TO_EMAIL?: string;
  CONTACT_FROM_EMAIL?: string;
};

export async function processContactRequest(
  body: unknown,
  env: ContactEnv
): Promise<{ status: number; json: Record<string, unknown> }> {
  const parsed = parseContactBody(body);
  if (parsed.ok && parsed.honeypot) {
    return { status: 200, json: { ok: true } };
  }
  if (!parsed.ok) {
    return { status: 400, json: { error: parsed.error } };
  }

  const apiKey = env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { status: 503, json: { error: 'not_configured' } };
  }

  const { name, email, reason, message } = parsed.data;
  const reasonLabel = CONTACT_REASON_LABEL[reason];
  const toEmail = (env.CONTACT_TO_EMAIL || DEFAULT_TO_EMAIL).trim();
  const fromEmail = (env.CONTACT_FROM_EMAIL || DEFAULT_FROM_EMAIL).trim();

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: email,
      subject: `Neuralforming — ${reasonLabel} · ${name}`,
      text: [
        'Nuovo messaggio dal form Contatti su Neuralforming',
        '',
        `Motivo: ${reasonLabel}`,
        `Nome: ${name}`,
        `Email: ${email}`,
        '',
        message,
      ].join('\n'),
    });

    if (error) {
      console.error('[contact] resend error', error);
      return { status: 502, json: { error: 'send_failed' } };
    }

    return { status: 200, json: { ok: true, id: data?.id ?? null } };
  } catch (err) {
    console.error('[contact] exception', err);
    return { status: 502, json: { error: 'send_failed' } };
  }
}
