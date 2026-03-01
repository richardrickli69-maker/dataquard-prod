// src/lib/emailService.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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
    const result = await resend.emails.send({
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

export async function sendWelcomeEmail({ email, name = 'Benutzer' }: WelcomeEmailParams) {
  try {
    const result = await resend.emails.send({
      from: 'noreply@dataquard.ch',
      to: email,
      subject: '👋 Willkommen bei Dataquard!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">👋 Willkommen!</h1>
          </div>
          <div style="background: #f7f7f7; padding: 40px; border-radius: 0 0 8px 8px;">
            <p>Hallo ${name}, vielen Dank für Ihre Anmeldung! 🎉</p>
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

export async function sendReminderEmail(email: string) {
  try {
    const result = await resend.emails.send({
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