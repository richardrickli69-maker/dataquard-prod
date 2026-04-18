/**
 * Dataquard – 30-Tage Abo-Ablauf-Erinnerung
 * GET /api/cron/subscription-reminder
 *
 * Läuft täglich um 08:00 UTC (vercel.json)
 * Sendet Erinnerungs-E-Mails an Kunden deren Abo in 29–31 Tagen abläuft.
 * Verhindert Doppel-Versand via reminder_30d_sent-Spalte in subscriptions.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const resend = new Resend(process.env.RESEND_API_KEY!);

const PLAN_LABELS: Record<string, string> = {
  starter:           'Starter',
  professional:      'Professional',
  agency_basic:      'Agency Basic',
  agency_pro:        'Agency Pro',
  agency_enterprise: 'Agency Enterprise',
  advokatur:         'Advokatur-Partnerschaft',
};

// ─── E-Mail-Templates ───────────────────────────────────────────────────────

function generateReminderCustomerEmailHtml(params: {
  planLabel: string;
  periodEnd: string;
  dashboardUrl: string;
}): string {
  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8" /><title>Ihr Abo läuft in 30 Tagen ab</title></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#0a0f1e;padding:24px 32px;">
            <div style="font-size:20px;font-weight:800;"><span style="color:#22c55e;">Data</span><span style="color:#ffffff;">quard</span></div>
            <div style="color:#888;font-size:12px;margin-top:4px;">Abo-Erinnerung</div>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 8px;font-size:28px;">📅</p>
            <h2 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#1a1a2e;">
              Ihr Abo läuft in 30 Tagen ab
            </h2>
            <p style="margin:0 0 20px;font-size:14px;color:#555566;line-height:1.6;">
              Ihr <strong style="color:#1a1a2e;">Dataquard ${params.planLabel}</strong>-Plan läuft am
              <strong style="color:#1a1a2e;">${params.periodEnd}</strong> ab.<br /><br />
              Ohne Verlängerung endet Ihr Zugang automatisch zu diesem Datum.
              Um Ihre Compliance-Dokumente und Ihren Website-Schutz zu behalten,
              verlängern Sie bitte Ihr Abo rechtzeitig.
            </p>
            <a href="${params.dashboardUrl}"
               style="display:inline-block;background:#22c55e;color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;">
              Jetzt verlängern →
            </a>
            <p style="margin:24px 0 0;font-size:13px;color:#888899;line-height:1.6;">
              Fragen? Wir helfen gerne:
              <a href="mailto:support@dataquard.ch" style="color:#22c55e;">support@dataquard.ch</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#9ca3af;">
              © 2026 Dataquard · Reinach BL, Schweiz ·
              <a href="https://www.dataquard.ch/datenschutz" style="color:#9ca3af;">Datenschutz</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Cron-Handler ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  // CRON_SECRET Authentifizierung
  const secret = request.headers.get('x-cron-secret') ?? request.nextUrl.searchParams.get('secret');
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dashboardUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.dataquard.ch'}/dashboard`;

  // Zeitfenster: 29–31 Tage ab jetzt (±1 Tag Toleranz)
  const now = new Date();
  const in29Days = new Date(now.getTime() + 29 * 24 * 60 * 60 * 1000);
  const in31Days = new Date(now.getTime() + 31 * 24 * 60 * 60 * 1000);

  try {
    // Aktive Subscriptions mit ablaufendem Abo, noch keine Erinnerung gesendet
    const { data: subs, error: subsErr } = await supabaseAdmin
      .from('subscriptions')
      .select('id, email, plan, user_id, current_period_end')
      .eq('status', 'active')
      .eq('reminder_30d_sent', false)
      .gte('current_period_end', in29Days.toISOString())
      .lte('current_period_end', in31Days.toISOString())
      .limit(50); // Rate-Limit: max 50 pro Run

    if (subsErr) {
      console.error('[SubReminder] Supabase-Abfrage fehlgeschlagen:', subsErr.message);
      return NextResponse.json({ error: subsErr.message }, { status: 500 });
    }

    if (!subs || subs.length === 0) {
      return NextResponse.json({ message: 'Keine ablaufenden Abos gefunden', sent: 0 });
    }

    // E-Mail-Adressen: aus subscriptions.email oder Fallback users-Tabelle
    const missingEmailIds = subs
      .filter(s => !s.email && s.user_id)
      .map(s => s.user_id as string);

    const userEmailMap: Record<string, string> = {};
    if (missingEmailIds.length > 0) {
      const { data: usersData } = await supabaseAdmin
        .from('users')
        .select('id, email')
        .in('id', missingEmailIds);
      (usersData ?? []).forEach((u: Record<string, unknown>) => {
        if (u.id && u.email) userEmailMap[String(u.id)] = String(u.email);
      });
    }

    let sent = 0;
    let skipped = 0;

    for (const sub of subs) {
      const email: string | null = (sub.email as string | null) ?? (sub.user_id ? userEmailMap[sub.user_id as string] : null) ?? null;

      if (!email) {
        skipped++;
        continue;
      }

      const planLabel = PLAN_LABELS[sub.plan as string] ?? String(sub.plan ?? 'Unbekannt');
      const periodEnd = sub.current_period_end
        ? new Date(sub.current_period_end as string).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : '–';

      // Kunden-E-Mail (eigener try/catch)
      try {
        await resend.emails.send({
          from:    'Dataquard <info@dataquard.ch>',
          to:      email,
          replyTo: 'support@dataquard.ch',
          subject: `Dataquard — Ihr Abo läuft in 30 Tagen ab`,
          html:    generateReminderCustomerEmailHtml({ planLabel, periodEnd, dashboardUrl }),
        });
      } catch (custErr) {
        console.error('[SubReminder] Kunden-E-Mail fehlgeschlagen:', email, custErr instanceof Error ? custErr.message : custErr);
        skipped++;
        continue;
      }

      // Admin-Info-Mail (eigener try/catch)
      try {
        await resend.emails.send({
          from:    'Dataquard <info@dataquard.ch>',
          to:      'info@dataquard.ch',
          subject: `Abo-Erinnerung gesendet: ${email} — läuft ab am ${periodEnd}`,
          html:    `<div style="font-family:Arial,sans-serif;padding:24px;max-width:480px;">
            <p style="margin:0 0 8px;font-size:13px;color:#555566;">Plan: <strong>${planLabel}</strong></p>
            <p style="margin:0 0 8px;font-size:13px;color:#555566;">Kunde: <strong>${email}</strong></p>
            <p style="margin:0;font-size:13px;color:#555566;">Läuft ab am: <strong>${periodEnd}</strong></p>
          </div>`,
        });
      } catch (adminErr) {
        console.error('[SubReminder] Admin-Info-Mail fehlgeschlagen:', adminErr instanceof Error ? adminErr.message : adminErr);
      }

      // reminder_30d_sent auf true setzen
      const { error: updateErr } = await supabaseAdmin
        .from('subscriptions')
        .update({ reminder_30d_sent: true })
        .eq('id', sub.id as string);

      if (updateErr) {
        console.error('[SubReminder] reminder_30d_sent Update fehlgeschlagen:', updateErr.message);
      }

      sent++;
    }

    return NextResponse.json({
      message: `${sent} Erinnerung(en) gesendet`,
      sent,
      skipped,
      total: subs.length,
    });

  } catch (err) {
    console.error('[SubReminder] Unerwarteter Fehler:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unbekannter Fehler' },
      { status: 500 }
    );
  }
}
