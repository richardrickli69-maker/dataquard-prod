/**
 * Dataquard – Retargeting / Reminder Cron Job
 * src/app/api/cron/reminders/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL;

async function sendReminderEmail(to: string, domain: string, scanDate: string): Promise<boolean> {
  if (!APP_URL) {
    console.error('[Reminder Cron] NEXT_PUBLIC_APP_URL nicht gesetzt');
    return false;
  }
  try {
    const res = await fetch(`${APP_URL}/api/email/reminder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, domain, scanDate }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const secret = request.headers.get('x-cron-secret') ?? request.nextUrl.searchParams.get('secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Scans älter als 3 Tage mit eingeloggtem User
    const { data: scans, error: scansError } = await supabaseAdmin
      .from('scans')
      .select('id, user_id, url, domain, created_at')
      .lt('created_at', threeDaysAgo.toISOString())
      .not('user_id', 'is', null);

    if (scansError) throw new Error(scansError.message);
    if (!scans || scans.length === 0) {
      return NextResponse.json({ message: 'Keine Scans gefunden', sent: 0 });
    }

    // Scans mit Policy ausschliessen
    const scanIds = scans.map(s => s.id);
    const { data: policies } = await supabaseAdmin
      .from('policies')
      .select('scan_id')
      .in('scan_id', scanIds);

    const policySet = new Set((policies ?? []).map(p => p.scan_id));

    // Bereits gesendete Reminder ausschliessen
    const { data: sentReminders } = await supabaseAdmin
      .from('reminders')
      .select('scan_id')
      .in('scan_id', scanIds);

    const reminderSet = new Set((sentReminders ?? []).map(r => r.scan_id));

    // Kandidaten: kein Kauf + noch kein Reminder
    const candidates = scans.filter(
      s => !policySet.has(s.id) && !reminderSet.has(s.id)
    );

    if (candidates.length === 0) {
      return NextResponse.json({ message: 'Keine neuen Reminder nötig', sent: 0 });
    }

    // User E-Mails holen
    const userIds = [...new Set(candidates.map(s => s.user_id))];
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .in('id', userIds);

    const userMap = new Map((users ?? []).map(u => [u.id, u.email]));

    // E-Mails senden
    let sent = 0;
    for (const scan of candidates) {
      const email = userMap.get(scan.user_id);
      if (!email) continue;

      const success = await sendReminderEmail(email, scan.domain, scan.created_at);

      if (success) {
        await supabaseAdmin.from('reminders').insert([{
          scan_id: scan.id,
          user_id: scan.user_id,
          email,
          sent_at: new Date().toISOString(),
          type:    'day3',
        }]);
        sent++;
        console.log(`[Reminder] ✅ Gesendet an ${email} für ${scan.domain}`);
      }
    }

    return NextResponse.json({
      message: `${sent} Reminder gesendet`,
      sent,
      candidates: candidates.length,
    });

  } catch (error) {
    console.error('[Reminder Cron] Fehler:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unbekannter Fehler' },
      { status: 500 }
    );
  }
}
