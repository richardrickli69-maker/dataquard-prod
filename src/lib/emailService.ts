// src/lib/emailService.ts
import { Resend } from 'resend';

const getResend = () => new Resend(process.env.RESEND_API_KEY);

const BASE_URL = 'https://www.dataquard.ch';
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
          <div style="background: #F3F4F6; color: #1F2937; padding: 30px 40px; text-align: center; border-radius: 8px 8px 0 0;">
            <div style="margin-bottom: 16px;">
              <img src="${LOGO_URL}" alt="Dataquard" width="58" height="58" style="display: inline-block; vertical-align: middle;" />
              <img src="${SCHRIFTZUG_URL}" alt="Dataquard" width="168" height="34" style="display: inline-block; vertical-align: middle; margin-left: 10px;" />
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
          <div style="background: #F3F4F6; color: #1F2937; padding: 30px 40px; text-align: center; border-radius: 8px 8px 0 0;">
            <div style="margin-bottom: 16px;">
              <img src="${LOGO_URL}" alt="Dataquard" width="58" height="58" style="display: inline-block; vertical-align: middle;" />
              <img src="${SCHRIFTZUG_URL}" alt="Dataquard" width="168" height="34" style="display: inline-block; vertical-align: middle; margin-left: 10px;" />
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
          <div style="background:#F3F4F6;color:#1F2937;padding:30px 40px;text-align:center;border-radius:8px 8px 0 0;">
            <div style="margin-bottom:16px;">
              <img src="${LOGO_URL}" alt="Dataquard" width="58" height="58" style="display:inline-block;vertical-align:middle;" />
              <img src="${SCHRIFTZUG_URL}" alt="Dataquard" width="168" height="34" style="display:inline-block;vertical-align:middle;margin-left:10px;" />
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

// ─── Hilfsfunktionen für Compliance-Report ──────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 50) return '#eab308';
  return '#ef4444';
}

function scoreLabel(score: number): string {
  if (score >= 80) return 'Gut';
  if (score >= 50) return 'M&auml;&szlig;ig';
  return 'Kritisch';
}

function scoreCard(label: string, score: number): string {
  const color = scoreColor(score);
  const barWidth = Math.min(100, Math.max(0, score));
  return `
    <td width="33%" style="padding:6px;">
      <div style="background:#f8fafc;border:1px solid #e2e4ea;border-radius:8px;padding:14px 10px;text-align:center;">
        <div style="font-size:26px;font-weight:900;color:${color};">${score}</div>
        <div style="font-size:10px;color:${color};font-weight:700;margin:2px 0 8px;">${scoreLabel(score)}</div>
        <div style="background:#e2e4ea;border-radius:4px;height:4px;">
          <div style="background:${color};height:4px;border-radius:4px;width:${barWidth}%;"></div>
        </div>
        <div style="font-size:10px;color:#888899;margin-top:6px;">${label}</div>
      </div>
    </td>`;
}

// ─── Compliance-Report E-Mail ────────────────────────────────────────────────

export interface ComplianceReportEmailParams {
  email: string;
  domain: string;
  plan: 'starter' | 'professional';
  reportPeriod: string;
  scores: { compliance: number; performance: number; security: number };
  newTrackers: string[];
  removedTrackers: string[];
  aiImagesFound?: number;
  deepfakeFound?: boolean;
  sslDaysLeft?: number | null;
}

export async function sendComplianceReport(params: ComplianceReportEmailParams) {
  const {
    email, domain, plan, reportPeriod, scores,
    newTrackers, removedTrackers, aiImagesFound, deepfakeFound, sslDaysLeft,
  } = params;

  const isPro = plan === 'professional';
  const periodType = isPro ? 'w&ouml;chentlicher' : 'monatlicher';
  const domainEscaped = domain.replace(/&/g, '&amp;');

  // Tracker-Änderungen
  const trackerChangesHtml = (newTrackers.length > 0 || removedTrackers.length > 0)
    ? `<tr><td style="padding:0 40px 24px;">
        <div style="background:#fff8ed;border:1px solid #fed7aa;border-radius:8px;padding:16px 20px;">
          <div style="font-size:12px;font-weight:700;color:#92400e;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:10px;">
            &Auml;nderungen bei Trackern
          </div>
          ${newTrackers.length > 0 ? `<p style="margin:0 0 6px;color:#991b1b;font-size:13px;font-weight:700;">Neu erkannt:</p>
            <ul style="margin:0 0 8px;padding-left:18px;color:#b91c1c;font-size:13px;">
              ${newTrackers.map(t => `<li>${t}</li>`).join('')}
            </ul>` : ''}
          ${removedTrackers.length > 0 ? `<p style="margin:0 0 6px;color:#065f46;font-size:13px;font-weight:700;">Entfernt:</p>
            <ul style="margin:0;padding-left:18px;color:#047857;font-size:13px;">
              ${removedTrackers.map(t => `<li>${t}</li>`).join('')}
            </ul>` : ''}
        </div>
      </td></tr>`
    : '';

  // AI-Trust Block (nur Professional)
  const aiTrustHtml = isPro
    ? `<tr><td style="padding:0 40px 24px;">
        <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:16px 20px;">
          <div style="font-size:12px;font-weight:700;color:#5b21b6;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:8px;">
            AI-Trust (EU AI Act Art.&nbsp;50)
          </div>
          ${deepfakeFound
            ? `<p style="margin:0;color:#991b1b;font-size:13px;">&#9888; <strong>Deepfake erkannt!</strong> Bitte pr&uuml;fen Sie die betroffenen Bilder im Dashboard.</p>`
            : aiImagesFound && aiImagesFound > 0
              ? `<p style="margin:0;color:#92400e;font-size:13px;">&#9888; <strong>${aiImagesFound} KI-generierte${aiImagesFound === 1 ? 's Bild' : ' Bilder'} erkannt</strong> — Kennzeichnungspflicht pr&uuml;fen.</p>`
              : `<p style="margin:0;color:#065f46;font-size:13px;">&#10003; Keine KI-Bilder oder Deepfakes erkannt. EU AI Act konform.</p>`
          }
        </div>
      </td></tr>`
    : '';

  // SSL-Warnung (inline im Report)
  const sslInlineHtml = (sslDaysLeft !== null && sslDaysLeft !== undefined && sslDaysLeft > 0 && sslDaysLeft < 30)
    ? `<tr><td style="padding:0 40px 24px;">
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px 20px;">
          <div style="font-size:12px;font-weight:700;color:#991b1b;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:8px;">
            &#9888; SSL-Zertifikat l&auml;uft ab
          </div>
          <p style="margin:0;color:#b91c1c;font-size:13px;">
            Das SSL-Zertifikat f&uuml;r <strong>${domainEscaped}</strong> l&auml;uft in
            <strong>${sslDaysLeft} Tage${sslDaysLeft === 1 ? '' : 'n'}</strong> ab.
            Bitte erneuern Sie es umgehend.
          </p>
        </div>
      </td></tr>`
    : '';

  const subject = `Ihr ${isPro ? 'wöchentlicher' : 'monatlicher'} Compliance-Report: ${domain} — ${reportPeriod}`;

  const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Compliance-Report ${domainEscaped}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc;padding:40px 20px;">
  <tr><td align="center">
    <table cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">

      <!-- Header -->
      <tr>
        <td style="background:#0a0f1e;padding:28px 40px;text-align:center;">
          <div style="font-size:22px;font-weight:800;letter-spacing:-0.5px;">
            <span style="color:#22c55e;">Data</span><span style="color:#ffffff;">quard</span>
          </div>
          <div style="color:#6b8399;font-size:12px;margin-top:4px;">Compliance-Report &mdash; ${reportPeriod}</div>
        </td>
      </tr>

      <!-- Titel -->
      <tr>
        <td style="padding:28px 40px 20px;text-align:center;border-bottom:1px solid #e2e4ea;">
          <h1 style="margin:0 0 6px;font-size:20px;font-weight:700;color:#1a1a2e;">
            Ihr ${periodType} Compliance-Report
          </h1>
          <p style="margin:0;color:#555566;font-size:13px;">${domainEscaped}</p>
        </td>
      </tr>

      <!-- Scores -->
      <tr>
        <td style="padding:24px 34px 8px;">
          <div style="font-size:11px;font-weight:700;color:#888899;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:12px;">
            4-S&auml;ulen-Score
          </div>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              ${scoreCard('Compliance', scores.compliance)}
              ${scoreCard('Performance', scores.performance)}
              ${scoreCard('Security', scores.security)}
            </tr>
          </table>
        </td>
      </tr>

      <!-- Tracker-Änderungen -->
      ${trackerChangesHtml}

      <!-- AI-Trust (nur Professional) -->
      ${aiTrustHtml}

      <!-- SSL-Warnung (inline) -->
      ${sslInlineHtml}

      <!-- CTA -->
      <tr>
        <td style="padding:8px 40px 32px;text-align:center;">
          <a href="${BASE_URL}/dashboard?utm_source=report&utm_medium=email"
             style="display:inline-block;background:#22c55e;color:#ffffff;font-size:14px;font-weight:700;padding:13px 32px;border-radius:8px;text-decoration:none;">
            Vollst&auml;ndigen Report im Dashboard ansehen &rarr;
          </a>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#f8fafc;border-top:1px solid #e2e4ea;padding:18px 40px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#888899;line-height:1.8;">
            &copy; 2026 Dataquard &middot; Reinach BL &middot; Schweiz &middot;
            <a href="mailto:info@dataquard.ch" style="color:#888899;">info@dataquard.ch</a><br/>
            <a href="${BASE_URL}/dashboard" style="color:#22c55e;font-size:11px;">Abmeldung vom Report</a>
            &nbsp;&middot;&nbsp;
            <a href="${BASE_URL}/datenschutz" style="color:#888899;font-size:11px;">Datenschutz</a>
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;

  try {
    const result = await getResend().emails.send({
      from: 'Dataquard <info@dataquard.ch>',
      to: email,
      subject,
      html,
    });
    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('[emailService] sendComplianceReport Fehler:', error);
    return { success: false, error };
  }
}

// ─── SSL-Ablauf-Warnung ──────────────────────────────────────────────────────

export interface SslWarningEmailParams {
  email: string;
  domain: string;
  daysLeft: number;
}

export async function sendSslWarning({ email, domain, daysLeft }: SslWarningEmailParams) {
  const domainEscaped = domain.replace(/&/g, '&amp;');
  try {
    const result = await getResend().emails.send({
      from: 'Dataquard <info@dataquard.ch>',
      to: email,
      subject: `SSL-Zertifikat für ${domain} läuft in ${daysLeft} Tagen ab`,
      html: `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc;padding:40px 20px;">
  <tr><td align="center">
    <table cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
      <tr>
        <td style="background:#0a0f1e;padding:28px 40px;text-align:center;">
          <div style="font-size:22px;font-weight:800;">
            <span style="color:#22c55e;">Data</span><span style="color:#ffffff;">quard</span>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding:32px 40px;">
          <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:20px;margin-bottom:24px;">
            <div style="font-size:18px;font-weight:700;color:#991b1b;margin-bottom:8px;">
              &#9888; SSL-Zertifikat l&auml;uft bald ab
            </div>
            <p style="margin:0;color:#b91c1c;font-size:14px;line-height:1.6;">
              Das SSL-Zertifikat f&uuml;r <strong>${domainEscaped}</strong> l&auml;uft in
              <strong>${daysLeft} Tage${daysLeft === 1 ? '' : 'n'}</strong> ab.
            </p>
          </div>
          <p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 16px;">
            Nach dem Ablauf erscheint in allen Browsern eine Sicherheitswarnung.
            Das schadet dem Vertrauen Ihrer Besucher und kann Ihre SEO-Rankings beeinflussen.
          </p>
          <p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 24px;">
            Bitte erneuern Sie das Zertifikat umgehend bei Ihrem Hosting-Anbieter.
          </p>
          <div style="text-align:center;">
            <a href="${BASE_URL}/dashboard?utm_source=ssl-warning&utm_medium=email"
               style="display:inline-block;background:#22c55e;color:#ffffff;font-size:14px;font-weight:700;padding:13px 28px;border-radius:8px;text-decoration:none;">
              Dashboard &ouml;ffnen &rarr;
            </a>
          </div>
        </td>
      </tr>
      <tr>
        <td style="background:#f8fafc;border-top:1px solid #e2e4ea;padding:18px 40px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#888899;">
            &copy; 2026 Dataquard &middot; Reinach BL &middot; Schweiz &middot;
            <a href="mailto:info@dataquard.ch" style="color:#888899;">info@dataquard.ch</a>
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
    });
    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('[emailService] sendSslWarning Fehler:', error);
    return { success: false, error };
  }
}

// ─── Bestehende Reminder-Funktion ────────────────────────────────────────────

// ─── DSE-Update Benachrichtigung (Professional: automatisch aktualisiert) ──────

export async function sendDseUpdateNotification({
  email,
  domain,
  changesHtml,
}: {
  email: string;
  domain: string;
  changesHtml: string;
}): Promise<{ success: boolean; error?: unknown }> {
  const domainEscaped = domain.replace(/&/g, '&amp;');
  try {
    const { error } = await getResend().emails.send({
      from: 'Dataquard <info@dataquard.ch>',
      to: email,
      subject: `Ihre Datenschutzerkl&#228;rung wurde automatisch aktualisiert – ${domainEscaped}`,
      html: `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8" /><title>DSE automatisch aktualisiert</title></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
      <tr><td style="background:linear-gradient(135deg,#0b1829,#0d1f35);padding:28px 40px;text-align:center;">
        <div style="font-size:22px;font-weight:800;">
          <span style="color:#22c55e;">Data</span><span style="color:#fff;">quard</span>
        </div>
        <div style="color:#9ab0c8;font-size:13px;margin-top:4px;">Automatische DSE-Aktualisierung</div>
      </td></tr>
      <tr><td style="padding:36px 40px 24px;text-align:center;">
        <div style="font-size:36px;margin-bottom:12px;">&#128196;</div>
        <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a1a2e;">DSE aktualisiert</h1>
        <p style="margin:0;color:#6b7280;font-size:15px;line-height:1.6;">
          Ihre Datenschutzerkl&#228;rung f&#252;r <strong style="color:#1a1a2e;">${domainEscaped}</strong>
          wurde automatisch auf die neueste Version aktualisiert.<br/>
          Neue Tracker wurden erkannt und in der DSE ber&#252;cksichtigt.
        </p>
      </td></tr>
      <tr><td style="padding:0 40px 28px;">
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:18px 22px;">
          <div style="font-size:13px;font-weight:700;color:#15803d;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:10px;">&#196;nderungen</div>
          ${changesHtml}
        </div>
      </td></tr>
      <tr><td style="padding:0 40px 32px;text-align:center;">
        <a href="https://www.dataquard.ch/dashboard"
          style="display:inline-block;background:linear-gradient(135deg,#00e676,#00c853);color:#040c1c;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none;">
          DSE im Dashboard ansehen &#8594;
        </a>
      </td></tr>
      <tr><td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:18px 40px;text-align:center;">
        <p style="margin:0;font-size:12px;color:#9ca3af;">
          &#169; 2026 Dataquard &#183; Reinach BL, Schweiz &#183;
          <a href="https://www.dataquard.ch/datenschutz" style="color:#9ca3af;">Datenschutz</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
    });
    if (error) {
      console.error('[emailService] sendDseUpdateNotification Fehler:', error);
      return { success: false, error };
    }
    return { success: true };
  } catch (err) {
    console.error('[emailService] sendDseUpdateNotification Exception:', err);
    return { success: false, error: err };
  }
}

// ─── DSE-Upsell Benachrichtigung (Starter: neue Tracker, DSE veraltet) ─────────

export async function sendDseUpsellNotification({
  email,
  domain,
  addedTrackers,
}: {
  email: string;
  domain: string;
  addedTrackers: string[];
}): Promise<{ success: boolean; error?: unknown }> {
  const domainEscaped = domain.replace(/&/g, '&amp;');
  const trackerListHtml = addedTrackers.map((t) =>
    `<li style="color:#374151;font-size:14px;padding:3px 0;">+ ${t.replace(/&/g, '&amp;')}</li>`
  ).join('');
  try {
    const { error } = await getResend().emails.send({
      from: 'Dataquard <info@dataquard.ch>',
      to: email,
      subject: `Neue Tracker auf ${domainEscaped} – DSE-Update empfohlen`,
      html: `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8" /><title>DSE-Update empfohlen</title></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
      <tr><td style="background:linear-gradient(135deg,#0b1829,#0d1f35);padding:28px 40px;text-align:center;">
        <div style="font-size:22px;font-weight:800;">
          <span style="color:#22c55e;">Data</span><span style="color:#fff;">quard</span>
        </div>
        <div style="color:#9ab0c8;font-size:13px;margin-top:4px;">Compliance-Warnung</div>
      </td></tr>
      <tr><td style="padding:36px 40px 24px;text-align:center;">
        <div style="font-size:36px;margin-bottom:12px;">&#9888;&#65039;</div>
        <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a1a2e;">Neue Tracker entdeckt</h1>
        <p style="margin:0;color:#6b7280;font-size:15px;line-height:1.6;">
          Auf <strong style="color:#1a1a2e;">${domainEscaped}</strong> wurden neue Drittanbieter-Dienste erkannt.<br/>
          Ihre Datenschutzerkl&#228;rung sollte aktualisiert werden.
        </p>
      </td></tr>
      <tr><td style="padding:0 40px 24px;">
        <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:18px 22px;">
          <div style="font-size:13px;font-weight:700;color:#92400e;text-transform:uppercase;margin-bottom:10px;">Neue Dienste</div>
          <ul style="margin:0;padding-left:16px;">${trackerListHtml}</ul>
        </div>
      </td></tr>
      <tr><td style="padding:0 40px 12px;">
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px 20px;">
          <p style="margin:0;font-size:14px;color:#1e40af;line-height:1.6;">
            &#128161; Mit dem <strong>Professional-Plan</strong> wird Ihre DSE bei solchen &#196;nderungen
            automatisch aktualisiert – Sie m&#252;ssen nichts manuell tun.
          </p>
        </div>
      </td></tr>
      <tr><td style="padding:16px 40px 32px;text-align:center;">
        <a href="https://www.dataquard.ch/checkout"
          style="display:inline-block;background:linear-gradient(135deg,#00e676,#00c853);color:#040c1c;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none;margin-right:12px;">
          Auf Professional upgraden &#8594;
        </a>
        <a href="https://www.dataquard.ch/dashboard"
          style="display:inline-block;border:2px solid #22c55e;color:#22c55e;font-weight:700;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;">
          DSE manuell aktualisieren
        </a>
      </td></tr>
      <tr><td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:18px 40px;text-align:center;">
        <p style="margin:0;font-size:12px;color:#9ca3af;">
          &#169; 2026 Dataquard &#183; Reinach BL, Schweiz &#183;
          <a href="https://www.dataquard.ch/datenschutz" style="color:#9ca3af;">Datenschutz</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
    });
    if (error) {
      console.error('[emailService] sendDseUpsellNotification Fehler:', error);
      return { success: false, error };
    }
    return { success: true };
  } catch (err) {
    console.error('[emailService] sendDseUpsellNotification Exception:', err);
    return { success: false, error: err };
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
          <div style="background: #F3F4F6; color: #1F2937; padding: 30px 40px; text-align: center; border-radius: 8px 8px 0 0;">
            <div style="margin-bottom: 16px;">
              <img src="${LOGO_URL}" alt="Dataquard" width="58" height="58" style="display: inline-block; vertical-align: middle;" />
              <img src="${SCHRIFTZUG_URL}" alt="Dataquard" width="168" height="34" style="display: inline-block; vertical-align: middle; margin-left: 10px;" />
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

// ─── Scan Lead E-Mail ─────────────────────────────────────────────────────────

export interface ScanLeadEmailParams {
  email: string;
  domain: string;
  scores: {
    compliance: number;
    optimization: number;
    trust: number;
    aiTrust: number;
  };
  /** Top-3 Befunde als kurze Strings */
  topFindings: string[];
}

/**
 * Sendet eine E-Mail nach einem Free-Scan mit den Score-Ergebnissen.
 * Absender: info@dataquard.ch
 * Enthält 4 Ampelwerte, Top-Befunde und zwei CTAs (Scanner + Upgrade).
 */
export async function sendScanLeadEmail({ email, domain, scores, topFindings }: ScanLeadEmailParams) {
  const col = (s: number) => s >= 70 ? '#22c55e' : s >= 40 ? '#eab308' : '#ef4444';
  const lbl = (s: number) => s >= 70 ? 'Gut' : s >= 40 ? 'Verbesserungsbedarf' : 'Kritisch';

  const scoreBlock = (label: string, score: number) => `
    <td style="padding:6px;text-align:center;">
      <div style="background:#f8fafc;border:1px solid #e2e4ea;border-radius:8px;padding:12px 8px;">
        <div style="width:12px;height:12px;border-radius:50%;background:${col(score)};margin:0 auto 6px;"></div>
        <div style="font-size:22px;font-weight:900;color:${col(score)};line-height:1;">${score}</div>
        <div style="font-size:11px;color:#555566;margin-top:2px;">${label}</div>
        <div style="font-size:11px;font-weight:700;color:${col(score)};margin-top:2px;">${lbl(score)}</div>
      </div>
    </td>`;

  const findingsHtml = topFindings.length > 0
    ? topFindings.slice(0, 3).map(f =>
        `<tr><td style="padding:4px 0;font-size:13px;color:#374151;border-bottom:1px solid #e2e4ea;">${f}</td></tr>`
      ).join('')
    : `<tr><td style="padding:4px 0;font-size:13px;color:#22c55e;">Keine kritischen Befunde.</td></tr>`;

  const scanUrl = `${BASE_URL}/scanner?url=${encodeURIComponent('https://' + domain)}`;

  try {
    const result = await getResend().emails.send({
      from: 'info@dataquard.ch',
      to: email,
      subject: `Ihr Dataquard Compliance-Check: ${domain}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
          <!-- Header -->
          <div style="background:#0a0f1e;padding:28px 32px;text-align:center;border-radius:8px 8px 0 0;">
            <img src="${LOGO_URL}" alt="Dataquard" width="48" height="48"
                 style="display:inline-block;vertical-align:middle;" />
            <img src="${SCHRIFTZUG_URL}" alt="Dataquard" width="140" height="28"
                 style="display:inline-block;vertical-align:middle;margin-left:10px;" />
          </div>

          <!-- Body -->
          <div style="background:#f8f9fb;padding:32px;border:1px solid #e2e4ea;border-top:none;border-radius:0 0 8px 8px;">
            <p style="font-size:15px;color:#1a1a2e;margin:0 0 8px;">Hallo,</p>
            <p style="font-size:15px;color:#374151;margin:0 0 24px;">
              hier ist Ihr Compliance-Check f&#252;r <strong style="color:#1a1a2e;">${domain}</strong>:
            </p>

            <!-- Score-Tabelle -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                ${scoreBlock('Compliance', scores.compliance)}
                ${scoreBlock('Optimierung', scores.optimization)}
                ${scoreBlock('Vertrauen', scores.trust)}
                ${scoreBlock('AI-Trust', scores.aiTrust)}
              </tr>
            </table>

            <!-- Top Befunde -->
            <p style="font-size:13px;font-weight:700;color:#555566;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">
              Wichtigste Befunde
            </p>
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="background:#fff;border:1px solid #e2e4ea;border-radius:8px;padding:12px 16px;margin-bottom:24px;">
              ${findingsHtml}
            </table>

            <!-- CTA Primär -->
            <div style="text-align:center;margin:0 0 16px;">
              <a href="${scanUrl}"
                 style="background:#22c55e;color:#ffffff;text-decoration:none;padding:14px 36px;
                        border-radius:8px;font-size:15px;font-weight:700;display:inline-block;">
                Vollst&#228;ndigen Report ansehen &#8594;
              </a>
            </div>

            <!-- CTA Sekundär -->
            <div style="text-align:center;margin-bottom:28px;">
              <a href="${BASE_URL}/preise"
                 style="color:#22c55e;font-size:13px;text-decoration:underline;">
                Probleme automatisch beheben &ndash; ab CHF 19.&ndash;/Mt.
              </a>
            </div>

            <!-- Footer -->
            <p style="font-size:11px;color:#9ca3af;text-align:center;border-top:1px solid #e2e4ea;padding-top:16px;margin:0;">
              Sie erhalten diese E-Mail weil Sie <strong>${domain}</strong> auf
              <a href="${BASE_URL}" style="color:#22c55e;">dataquard.ch</a> gescannt haben.<br/>
              Dataquard &middot; Reinach BL, Schweiz
            </p>
          </div>
        </div>
      `,
    });
    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('[emailService] sendScanLeadEmail Fehler:', error);
    return { success: false, error };
  }
}