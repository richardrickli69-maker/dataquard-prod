import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function reminderEmailHtml(domain: string, scanDate: string): string {
  const formattedDate = new Date(scanDate).toLocaleDateString('de-CH', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
  return `<!DOCTYPE html>
<html lang="de">
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
  <table width="100%" style="background:#f3f4f6;padding:40px 20px;"><tr><td align="center">
  <table width="600" style="background:#fff;border-radius:12px;overflow:hidden;">
    <tr><td style="background:#003d82;padding:32px 40px;">
      <h1 style="margin:0;color:#fff;font-size:24px;">🛡 Dataquard</h1>
      <p style="margin:8px 0 0;color:#93c5fd;font-size:14px;">nDSG & DSGVO Compliance</p>
    </td></tr>
    <tr><td style="padding:40px;">
      <p style="color:#374151;font-size:16px;">Guten Tag,</p>
      <p style="color:#374151;font-size:16px;">vor 3 Tagen haben Sie <strong>${domain}</strong> geprüft (${formattedDate}).</p>
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:20px;margin:24px 0;">
        <p style="margin:0 0 8px;color:#991b1b;font-weight:bold;">⚠️ Ihre Website ist noch nicht geschützt</p>
        <p style="margin:0;color:#b91c1c;font-size:14px;">Ohne Datenschutzerklärung riskieren Sie Abmahnungen nach nDSG/DSGVO (bis CHF 250'000).</p>
      </div>
      <p style="color:#374151;font-size:16px;">Erstellen Sie jetzt in <strong>3 Minuten</strong> Ihre Datenschutzerklärung:</p>
      <div style="text-align:center;margin:32px 0;">
        <a href="https://dataquard.ch/datenschutz-generator?domain=${encodeURIComponent(domain)}&utm_source=reminder&utm_medium=email&utm_campaign=day3"
           style="background:#003d82;color:#fff;text-decoration:none;padding:16px 40px;border-radius:8px;font-size:16px;font-weight:bold;display:inline-block;">
          Jetzt Datenschutzerklärung erstellen →
        </a>
      </div>
    </td></tr>
    <tr><td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 40px;">
      <p style="margin:0;color:#9ca3af;font-size:12px;">
        Sie erhalten diese E-Mail weil Sie ${domain} auf dataquard.ch geprüft haben.<br>
        <a href="https://dataquard.ch/unsubscribe" style="color:#9ca3af;">Abmelden</a> ·
        Dataquard · Basel, Schweiz
      </p>
    </td></tr>
  </table>
  </td></tr></table>
</body></html>`;
}

export async function POST(request: NextRequest) {
  try {
    const { to, domain, scanDate } = await request.json();
    if (!to || !domain) {
      return NextResponse.json({ error: 'to und domain erforderlich' }, { status: 400 });
    }
    const { data, error } = await resend.emails.send({
      from:    'Dataquard <info@dataquard.ch>',
      to:      [to],
      subject: `⚠️ ${domain} – Ihre Datenschutzerklärung fehlt noch`,
      html:    reminderEmailHtml(domain, scanDate ?? new Date().toISOString()),
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, id: data?.id });
  } catch (error) {
    return NextResponse.json({ error: 'Fehler beim Senden' }, { status: 500 });
  }
}