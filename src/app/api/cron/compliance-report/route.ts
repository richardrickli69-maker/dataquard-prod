/**
 * Dataquard – Automatischer Compliance-Report
 * GET /api/cron/compliance-report
 * Läuft jeden Montag 07:00 UTC via Vercel Cron
 *
 * Starter:       monatlich (alle 28+ Tage)
 * Professional:  wöchentlich (alle 6+ Tage)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { performExtendedScan } from '@/lib/extendedScanner';
import { sendComplianceReport, sendSslWarning, sendDseUpdateNotification, sendDseUpsellNotification } from '@/lib/emailService';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Maximale E-Mails pro Cron-Run (Resend Rate-Limit)
const MAX_EMAILS_PER_RUN = 50;

/** Prüft ob ein neuer Report fällig ist */
function isReportDue(lastSent: string | null | undefined, plan: string): boolean {
  if (!lastSent) return true;
  const diffDays = (Date.now() - new Date(lastSent).getTime()) / (1000 * 60 * 60 * 24);
  return plan === 'professional' ? diffDays >= 6 : diffDays >= 28;
}

/** SSL-Ablauftage aus sslExpiry-String berechnen */
function getSslDaysLeft(sslExpiry: string | undefined, hasSSL: boolean): number | null {
  if (!hasSSL || !sslExpiry) return null;
  const expiry = new Date(sslExpiry);
  if (isNaN(expiry.getTime())) return null;
  return Math.floor((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

/** Report-Periode als lesbaren Text */
function getReportPeriod(plan: string): string {
  const now = new Date();
  if (plan === 'professional') {
    const kw = getIsoWeek(now);
    return `KW ${kw} \u2013 ${now.getFullYear()}`;
  }
  return now.toLocaleDateString('de-CH', { month: 'long', year: 'numeric' });
}

/** ISO-Kalenderwoche berechnen */
function getIsoWeek(d: Date): number {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(
    ((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7
  );
}

/** Claude API: Neue Tracker-Abschnitte in bestehende DSE einfügen */
async function updatePolicyWithNewTrackers(
  existingContent: string,
  addedTrackers: string[]
): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('[ComplianceReport] ANTHROPIC_API_KEY nicht gesetzt – DSE-Update übersprungen');
    return null;
  }

  const trackerList = addedTrackers.join(', ');
  const prompt = `Du bist ein Datenschutzexperte. Aktualisiere die folgende Datenschutzerklärung (DSE) indem du kurze Abschnitte für die neu entdeckten Drittanbieter-Dienste hinzufügst: ${trackerList}.

Füge für jeden neuen Dienst einen knappen Abschnitt ein (Zweck, Anbieter, Datenkategorie, Rechtsgrundlage Art. 6 DSGVO oder nDSG Art. 31). Behalte Stil und Format der bestehenden DSE bei. Gib NUR den vollständigen aktualisierten DSE-Text zurück, ohne Einleitung oder Kommentar.

Bestehende DSE:
${existingContent.slice(0, 8000)}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      console.error('[ComplianceReport] Claude API Fehler:', response.status);
      return null;
    }

    const data = await response.json() as { content?: { type: string; text: string }[] };
    const text = data.content?.find(b => b.type === 'text')?.text ?? null;
    return text;
  } catch (err) {
    console.error('[ComplianceReport] Claude API Exception:', err);
    return null;
  }
}

export async function GET(request: NextRequest) {
  // Vercel Cron Authentifizierung (identisch zu anderen Cron-Routes)
  const secret =
    request.headers.get('x-cron-secret') ??
    request.nextUrl.searchParams.get('secret');

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = { processed: 0, emailsSent: 0, skipped: 0, errors: 0 };

  try {
    // Alle aktiven Subscriber mit user_id laden
    const { data: subscriptions, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('user_id, email, plan, last_report_sent')
      .eq('status', 'active')
      .in('plan', ['starter', 'professional'])
      .not('user_id', 'is', null);

    if (subError) throw new Error(subError.message);
    if (!subscriptions?.length) {
      return NextResponse.json({ message: 'Keine aktiven Subscriber', ...results });
    }

    // Auth-User-Emails holen (Fallback falls subscriptions.email leer)
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    const userEmailMap = new Map<string, string>(
      (users ?? []).map(u => [u.id, u.email ?? ''])
    );

    for (const sub of subscriptions) {
      // Rate-Limit prüfen
      if (results.emailsSent >= MAX_EMAILS_PER_RUN) break;

      // Report fällig?
      if (!isReportDue(sub.last_report_sent, sub.plan)) {
        results.skipped++;
        continue;
      }

      // E-Mail-Adresse auflösen
      const email = (sub.email as string | null) || userEmailMap.get(sub.user_id) || null;
      if (!email) {
        results.skipped++;
        continue;
      }

      // Letzten Scan dieser User holen
      const { data: scans } = await supabaseAdmin
        .from('scans')
        .select('id, url, domain, previous_services')
        .eq('user_id', sub.user_id)
        .order('created_at', { ascending: false })
        .limit(1);

      const lastScan = scans?.[0];
      if (!lastScan?.url) {
        results.skipped++;
        continue;
      }

      try {
        // Scan durchführen (bestehende Scanner-Logik)
        const scanResult = await performExtendedScan(lastScan.url);

        const newTrackers: string[] = scanResult.compliance.trackersFound ?? [];
        const oldTrackers: string[] = (lastScan.previous_services as string[]) ?? [];
        const addedTrackers = newTrackers.filter(t => !oldTrackers.includes(t));
        const removedTrackers = oldTrackers.filter(t => !newTrackers.includes(t));

        const sslDaysLeft = getSslDaysLeft(
          scanResult.optimization.sslExpiry,
          scanResult.optimization.hasSSL
        );

        // Compliance-Report senden
        await sendComplianceReport({
          email,
          domain: lastScan.domain || lastScan.url,
          plan: sub.plan as 'starter' | 'professional',
          reportPeriod: getReportPeriod(sub.plan),
          scores: {
            // null-Fallback auf 0 falls Website beim Rescan blockiert war
            compliance: scanResult.compliance.score ?? 0,
            performance: scanResult.optimization.score ?? 0,
            security: scanResult.trust.score ?? 0,
          },
          newTrackers: addedTrackers,
          removedTrackers,
          // AI-Trust nur bei Professional und wenn Sightengine-Daten vorhanden
          ...(sub.plan === 'professional' && scanResult.sightengine !== null ? {
            aiImagesFound: scanResult.sightengine.aiImagesFound,
            deepfakeFound: scanResult.sightengine.deepfakeDetected,
          } : {}),
          sslDaysLeft,
        });
        results.emailsSent++;

        // SSL-Warnung separat senden (wenn 1–29 Tage)
        if (sslDaysLeft !== null && sslDaysLeft > 0 && sslDaysLeft < 30) {
          if (results.emailsSent < MAX_EMAILS_PER_RUN) {
            await sendSslWarning({
              email,
              domain: lastScan.domain || lastScan.url,
              daysLeft: sslDaysLeft,
            });
            results.emailsSent++;
          }
        }

        // DSE-Update (Professional) oder Upsell (Starter) bei neuen Trackern
        if (addedTrackers.length > 0 && results.emailsSent < MAX_EMAILS_PER_RUN) {
          if (sub.plan === 'professional') {
            // Bestehende Policy laden
            const { data: existingPolicies } = await supabaseAdmin
              .from('policies')
              .select('id, content, jurisdiction, version')
              .eq('user_id', sub.user_id)
              .order('created_at', { ascending: false })
              .limit(1);

            const existingPolicy = existingPolicies?.[0];

            if (existingPolicy?.content) {
              // Claude API: neue Tracker in DSE einbauen
              const updatedContent = await updatePolicyWithNewTrackers(
                existingPolicy.content as string,
                addedTrackers
              );

              if (updatedContent) {
                const newVersion = ((existingPolicy.version as number | null) ?? 1) + 1;

                const { error: policyErr } = await supabaseAdmin.from('policies').insert([{
                  user_id: sub.user_id,
                  jurisdiction: existingPolicy.jurisdiction ?? 'nDSG',
                  content: updatedContent,
                  format: 'markdown',
                  auto_generated: true,
                  version: newVersion,
                  previous_version_id: existingPolicy.id,
                  changes_summary: `Neue Dienste erkannt: ${addedTrackers.join(', ')}`,
                }]);

                if (policyErr) {
                  console.error('[ComplianceReport] Policy-Speichern Fehler:', policyErr.message);
                } else {
                  const changesHtml = addedTrackers
                    .map(t => `<p style="color:#374151;font-size:14px;margin:4px 0;">&#43; ${t.replace(/&/g, '&amp;')}</p>`)
                    .join('');
                  await sendDseUpdateNotification({
                    email,
                    domain: lastScan.domain || lastScan.url,
                    changesHtml,
                  });
                  results.emailsSent++;
                }
              }
            }
          } else if (sub.plan === 'starter') {
            // Starter: Upsell-E-Mail senden
            await sendDseUpsellNotification({
              email,
              domain: lastScan.domain || lastScan.url,
              addedTrackers,
            });
            results.emailsSent++;
          }
        }

        // last_report_sent und Scan-Daten aktualisieren
        await supabaseAdmin
          .from('subscriptions')
          .update({ last_report_sent: new Date().toISOString() })
          .eq('user_id', sub.user_id);

        await supabaseAdmin
          .from('scans')
          .update({
            last_rescan_at: new Date().toISOString(),
            previous_services: newTrackers,
            change_detected: addedTrackers.length > 0 || removedTrackers.length > 0,
          })
          .eq('id', lastScan.id);

        results.processed++;
      } catch (scanErr) {
        console.error(`[ComplianceReport] Scan-Fehler f\u00fcr ${lastScan.url}:`, scanErr);
        results.errors++;
        // Nicht abbrechen — n\u00e4chster User wird verarbeitet
      }
    }

    return NextResponse.json({
      message: `${results.processed} Reports gesendet, ${results.emailsSent} E-Mails total, ${results.skipped} \u00fcbersprungen, ${results.errors} Fehler`,
      ...results,
    });

  } catch (error) {
    console.error('[ComplianceReport Cron] Fehler:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unbekannter Fehler' },
      { status: 500 }
    );
  }
}
