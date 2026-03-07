// src/lib/emailService.ts
import { Resend } from 'resend';

const getResend = () => new Resend(process.env.RESEND_API_KEY);

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
      from: 'noreply@dataquard.ch',
      to: email,
      subject: '🎉 Ihre Datenschutzerklärung ist bereit!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">🎉 Ihre Policy ist fertig!</h1>
          </div>
          <div style="background: #f7f7f7; padding: 40px; border-radius: 0 0 8px 8px;">
            <p>Ihre Datenschutzerklärung für <strong>${domain}</strong> wurde generiert!</p>
            <a href="https://dataquard.ch/dashboard" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              📊 Zur Policy gehen
            </a>
            <p style="font-size: 12px; color: #999;">Job ID: ${jobId}</p>
          </div>
        </div>
      `,
    });
    return { success: true, messageId: result.data?.id };
  } catch (error) {
    return { success: false, error };
  }
}

export async function sendWelcomeEmail({ email, name }: WelcomeEmailParams) {
  const greeting = name ? `Hallo ${name},` : 'Hallo,';
  try {
    const result = await getResend().emails.send({
      from: 'noreply@dataquard.ch',
      to: email,
      subject: '👋 Willkommen bei Dataquard!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">👋 Willkommen!</h1>
          </div>
          <div style="background: #f7f7f7; padding: 40px; border-radius: 0 0 8px 8px;">
            <p>${greeting} vielen Dank für Ihre Anmeldung! 🎉</p>
            <a href="https://dataquard.ch/checkout" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              🚀 Jetzt starten
            </a>
          </div>
        </div>
      `,
    });
    return { success: true, messageId: result.data?.id };
  } catch (error) {
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
      from: 'noreply@dataquard.ch',
      to: email,
      subject: `🔄 Änderung erkannt auf ${domain} – Datenschutzerklärung prüfen`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);color:white;padding:40px;text-align:center;border-radius:8px 8px 0 0;">
            <h1 style="margin:0;">🔄 Website-Änderung erkannt</h1>
            <p style="margin:8px 0 0;opacity:0.85;">Dataquard – Wöchentlicher Re-Scan</p>
          </div>
          <div style="background:#f7f7f7;padding:40px;border-radius:0 0 8px 8px;">
            <p style="color:#374151;">Beim wöchentlichen Re-Scan von <strong>${domain}</strong> wurden Änderungen bei den eingesetzten Drittdiensten festgestellt:</p>
            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin:16px 0;">
              ${addedHtml}${removedHtml}
            </div>
            <p style="color:#374151;">Ihre Datenschutzerklärung muss möglicherweise aktualisiert werden.</p>
            <div style="text-align:center;margin:32px 0;">
              <a href="https://dataquard.ch/datenschutz-generator?domain=${encodeURIComponent(domain)}&utm_source=rescan&utm_medium=email"
                 style="background:#4f46e5;color:#fff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:bold;display:inline-block;">
                Datenschutzerklärung aktualisieren →
              </a>
            </div>
            <p style="color:#9ca3af;font-size:12px;text-align:center;">Dataquard · Basel, Schweiz · <a href="https://dataquard.ch" style="color:#9ca3af;">dataquard.ch</a></p>
          </div>
        </div>
      `,
    });
    return { success: true, messageId: result.data?.id };
  } catch (error) {
    return { success: false, error };
  }
}

export async function sendReminderEmail(email: string) {
  try {
    const result = await getResend().emails.send({
      from: 'noreply@dataquard.ch',
      to: email,
      subject: '⚠️ Sie haben eine Compliance-Lücke?',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">⚠️ GDPR-Compliance?</h1>
          </div>
          <div style="background: #f7f7f7; padding: 40px; border-radius: 0 0 8px 8px;">
            <p>Sie haben sich angemeldet, aber noch keine Policy generiert.</p>
            <a href="https://dataquard.ch/checkout" style="display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              🚀 Policy jetzt generieren
            </a>
          </div>
        </div>
      `,
    });
    return { success: true, messageId: result.data?.id };
  } catch (error) {
    return { success: false, error };
  }
}