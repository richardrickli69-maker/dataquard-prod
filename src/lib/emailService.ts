// src/lib/emailService.ts
import { Resend } from 'resend';

const getResend = () => new Resend(process.env.RESEND_API_KEY);

const BASE_URL = 'https://dataquard.ch';
const LOGO_URL = `${BASE_URL}/logo-dataquard.png`;
const SCHRIFTZUG_URL = `${BASE_URL}/schriftzug-dataquard.png`;

export interface PolicyReadyEmailParams {
  email: string;
  domain: string;
  policyContent: string;
  jobId: string;
}

export interface WelcomeEmailParams {
  email: string;
  name?: string;
}

export async function sendPolicyReadyEmail({ email, domain, policyContent, jobId }: PolicyReadyEmailParams) {
  try {
    const result = await getResend().emails.send({
      from: 'info@dataquard.ch',
      to: email,
      subject: '🎉 Ihre Datenschutzerklärung ist bereit!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #22c55e; color: white; padding: 30px 40px; text-align: center; border-radius: 8px 8px 0 0;">
            <div style="margin-bottom: 16px;">
              <img src="${LOGO_URL}" alt="Dataquard" width="48" height="48" style="display: inline-block; vertical-align: middle;" />
              <img src="${SCHRIFTZUG_URL}" alt="Dataquard" width="140" height="28" style="display: inline-block; vertical-align: middle; margin-left: 10px;" />
            </div>
            <h1 style="margin: 0; font-size: 20px;">🎉 Ihre Policy ist fertig!</h1>
          </div>
          <div style="background: #f8f9fb; padding: 40px; border-radius: 0 0 8px 8px; border: 1px solid #e2e4ea;">
            <p style="color: #1a1a2e;">Ihre Datenschutzerklärung für <strong>${domain}</strong> wurde generiert!</p>
            <a href="${BASE_URL}/dashboard" style="display: inline-block; background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              📊 Zur Policy gehen
            </a>
            <p style="font-size: 12px; color: #999; margin-top: 24px;">Job ID: ${jobId}</p>
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 32px;">Dataquard · Reinach BL, Schweiz · <a href="${BASE_URL}" style="color: #22c55e;">dataquard.ch</a></p>
          </div>
        </div>
      `,
    });
    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('[emailService] sendPolicyReadyEmail Fehler:', error);
    return { success: false, error };
  }
}

export async function sendWelcomeEmail({ email, name }: WelcomeEmailParams) {
  const safeDisplayName = name ? name.replace('@', '&#64;') : null;
  const greeting = safeDisplayName ? `Hallo ${safeDisplayName},` : 'Hallo,';
  try {
    const result = await getResend().emails.send({
      from: 'info@dataquard.ch',
      to: email,
      subject: '👋 Willkommen bei Dataquard!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #22c55e; color: white; padding: 30px 40px; text-align: center; border-radius: 8px 8px 0 0;">
            <div style="margin-bottom: 16px;">
              <img src="${LOGO_URL}" alt="Dataquard" width="48" height="48" style="display: inline-block; vertical-align: middle;" />
              <img src="${SCHRIFTZUG_URL}" alt="Dataquard" width="140" height="28" style="display: inline-block; vertical-align: middle; margin-left: 10px;" />
            </div>
            <h1 style="margin: 0; font-size: 20px;">👋 Willkommen bei Dataquard!</h1>
          </div>
          <div style="background: #f8f9fb; padding: 40px; border-radius: 0 0 8px 8px; border: 1px solid #e2e4ea;">
            <p style="color: #1a1a2e;">${greeting} vielen Dank für Ihre Anmeldung! 🎉</p>
            <p style="color: #374151;">Starten Sie jetzt mit Ihrer nDSG/DSGVO-Compliance.</p>
            <a href="${BASE_URL}/checkout" style="display: inline-block; background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              🚀 Jetzt starten
            </a>
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 32px;">Dataquard · Reinach BL, Schweiz · <a href="${BASE_URL}" style="color: #22c55e;">dataquard.ch</a></p>
          </div>
        </div>
      `,
    });
    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('[emailService] sendWelcomeEmail Fehler:', error);
    return { success: false, error };
  }
}

export interface RescanChangeEmailParams {
  email: string;
  domain: string;
  addedTrackers: string[];
  removedTrackers: string[];
}

export async function sendRescanChangeEmail({ email, domain, addedTrackers, removedTrackers }: RescanChangeEmailParams) {
  const addedHtml = addedTrackers.length > 0
    ? `<p style="margin:8px 0 4px;color:#991b1b;font-weight:bold;">Neu erkannte Dienste:</p><ul style="margin:0;padding-left:20px;color:#b91c1c;">${addedTrackers.map(t => `<li>${t}</li>`).join('')}</ul>`
    : '';
  const removedHtml = removedTrackers.length > 0
    ? `<p style="margin:12px 0 4px;color:#065f46;font-weight:bold;">Nicht mehr erkannte Dienste:</p><ul style="margin:0;padding-left:20px;color:#047857;">${removedTrackers.map(t => `<li>${t}</li>`).join('')}</ul>`
    : '';
  try {
    const result = await getResend().emails.send({
      from: 'info@dataquard.ch',
      to: email,
      subject: `🔄 Änderung erkannt auf ${domain} – Datenschutzerklärung prüfen`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#22c55e;color:white;padding:30px 40px;text-align:center;border-radius:8px 8px 0 0;">
            <div style="margin-bottom:16px;">
              <img src="${LOGO_URL}" alt="Dataquard" width="48" height="48" style="display:inline-block;vertical-align:middle;" />
              <img src="${SCHRIFTZUG_URL}" alt="Dataquard" width="140" height="28" style="display:inline-block;vertical-align:middle;margin-left:10px;" />
            </div>
            <h1 style="margin:0;font-size:20px;">🔄 Website-Änderung erkannt</h1>
            <p style="margin:8px 0 0;opacity:0.85;">Dataquard – Wöchentlicher Re-Scan</p>
          </div>
          <div style="background:#f8f9fb;padding:40px;border-radius:0 0 8px 8px;border:1px solid #e2e4ea;">
            <p style="color:#1a1a2e;">Beim wöchentlichen Re-Scan von <strong>${domain}</strong> wurden Änderungen bei den eingesetzten Drittdiensten festgestellt:</p>
            <div style="background:#fff;border:1px solid #e2e4ea;border-radius:8px;padding:20px;margin:16px 0;">
              ${addedHtml}${removedHtml}
            </div>
            <p style="color:#374151;">Ihre Datenschutzerklärung muss möglicherweise aktualisiert werden.</p>
            <div style="text-align:center;margin:32px 0;">
              <a href="${BASE_URL}/scanner?url=${encodeURIComponent(domain)}&utm_source=rescan&utm_medium=email"
                 style="background:#22c55e;color:#fff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:bold;display:inline-block;">
                Datenschutzerklärung aktualisieren →
              </a>
            </div>
            <p style="color:#9ca3af;font-size:12px;text-align:center;">Dataquard · Reinach BL, Schweiz · <a href="${BASE_URL}" style="color:#22c55e;">dataquard.ch</a></p>
          </div>
        </div>
      `,
    });
    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('[emailService] sendRescanChangeEmail Fehler:', error);
    return { success: false, error };
  }
}

export async function sendReminderEmail(email: string) {
  try {
    const result = await getResend().emails.send({
      from: 'info@dataquard.ch',
      to: email,
      subject: '⚠️ Sie haben eine Compliance-Lücke?',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #22c55e; color: white; padding: 30px 40px; text-align: center; border-radius: 8px 8px 0 0;">
            <div style="margin-bottom: 16px;">
              <img src="${LOGO_URL}" alt="Dataquard" width="48" height="48" style="display: inline-block; vertical-align: middle;" />
              <img src="${SCHRIFTZUG_URL}" alt="Dataquard" width="140" height="28" style="display: inline-block; vertical-align: middle; margin-left: 10px;" />
            </div>
            <h1 style="margin: 0; font-size: 20px;">⚠️ Compliance-Lücke schliessen</h1>
          </div>
          <div style="background: #f8f9fb; padding: 40px; border-radius: 0 0 8px 8px; border: 1px solid #e2e4ea;">
            <p style="color: #1a1a2e;">Sie haben sich angemeldet, aber noch keine Policy generiert.</p>
            <p style="color: #374151;">Schliessen Sie Ihre Compliance-Lücke jetzt – in wenigen Minuten nDSG/DSGVO-konform.</p>
            <a href="${BASE_URL}/checkout" style="display: inline-block; background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              🚀 Policy jetzt generieren
            </a>
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 32px;">Dataquard · Reinach BL, Schweiz · <a href="${BASE_URL}" style="color: #22c55e;">dataquard.ch</a></p>
          </div>
        </div>
      `,
    });
    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('[emailService] sendReminderEmail Fehler:', error);
    return { success: false, error };
  }
}