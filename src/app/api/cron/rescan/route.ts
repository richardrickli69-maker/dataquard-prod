/**
 * Dataquard – Automatisches Re-Scanning
 * GET /api/cron/rescan
 * Läuft jeden Montag 08:00 UTC via Vercel Cron
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { performExtendedScan } from '@/lib/extendedScanner';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function GET(request: NextRequest) {
  const secret = request.headers.get('x-cron-secret') ?? request.nextUrl.searchParams.get('secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = { processed: 0, changed: 0, errors: 0 };

  try {
    // Scans mit aktiviertem Rescan, älteste zuerst (max 50 pro Lauf)
    const { data: scans, error: scansError } = await supabaseAdmin
      .from('scans')
      .select('id, url, domain, user_id, previous_services')
      .eq('rescan_enabled', true)
      .not('user_id', 'is', null)
      .order('last_rescan_at', { ascending: true, nullsFirst: true })
      .limit(50);

    if (scansError) throw new Error(scansError.message);
    if (!scans || scans.length === 0) {
      return NextResponse.json({ message: 'Keine Scans zum Verarbeiten', ...results });
    }

    // User-Emails aus auth.users holen
    const userIds = [...new Set(scans.map(s => s.user_id))];
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    const userEmailMap = new Map(
      (users ?? []).filter(u => userIds.includes(u.id)).map(u => [u.id, u.email])
    );

    for (const scan of scans) {
      try {
        const newScanResult = await performExtendedScan(scan.url);
        const newTrackers: string[] = newScanResult.compliance.trackersFound ?? [];
        const oldTrackers: string[] = scan.previous_services ?? [];

        const addedTrackers = newTrackers.filter(t => !oldTrackers.includes(t));
        const removedTrackers = oldTrackers.filter(t => !newTrackers.includes(t));
        const hasChanges = addedTrackers.length > 0 || removedTrackers.length > 0;

        // Scan-Record aktualisieren
        await supabaseAdmin
          .from('scans')
          .update({
            last_rescan_at:    new Date().toISOString(),
            previous_services: newTrackers,
            change_detected:   hasChanges,
          })
          .eq('id', scan.id);

        if (hasChanges) {
          const email = userEmailMap.get(scan.user_id);
          if (email) {
            await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/email/send`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type:            'rescan-change',
                email,
                domain:          scan.domain,
                addedTrackers,
                removedTrackers,
              }),
            });
            console.log(`[Rescan] ✅ Änderungs-E-Mail gesendet an ${email} für ${scan.domain}`);
          }
          results.changed++;
        }

        results.processed++;
      } catch (err) {
        console.error(`[Rescan] ❌ Fehler bei ${scan.url}:`, err);
        results.errors++;
      }
    }

    return NextResponse.json({
      message: `${results.processed} Scans verarbeitet, ${results.changed} Änderungen erkannt`,
      ...results,
    });
  } catch (error) {
    console.error('[Rescan Cron] Fehler:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unbekannter Fehler' },
      { status: 500 }
    );
  }
}
