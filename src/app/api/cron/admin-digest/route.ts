/**
 * Dataquard – Wöchentlicher Admin-Digest
 * GET /api/cron/admin-digest
 * Läuft jeden Montag 07:30 UTC via Vercel Cron
 *
 * Sendet eine Zusammenfassung an info@dataquard.ch:
 * - Neue Kunden & Kündigungen der Woche
 * - Aktive Subscriber nach Plan + MRR
 * - Scans & Leads der Woche
 * - Fehlgeschlagene Zahlungen
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendAdminDigest } from '@/lib/emailService';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

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

/** Montag 00:00:00 UTC der aktuellen Woche */
function getWeekStart(): Date {
  const now = new Date();
  const day = now.getUTCDay(); // 0=So, 1=Mo, ...6=Sa
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() + diff);
  monday.setUTCHours(0, 0, 0, 0);
  return monday;
}

/** MRR aus Plan-Map berechnen */
function calcMrr(activeByPlan: Record<string, number>): number {
  const prices: Record<string, number> = {
    starter: 19,
    professional: 39,
    agency_basic: 79,
    agency_pro: 179,
    agency_enterprise: 349,
    advokatur: 149,
  };
  return Object.entries(activeByPlan).reduce((sum, [plan, count]) => {
    return sum + (prices[plan] ?? 0) * count;
  }, 0);
}

export async function GET(request: NextRequest) {
  // CRON_SECRET Authentifizierung
  const secret =
    request.headers.get('x-cron-secret') ??
    request.nextUrl.searchParams.get('secret');

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const weekStart = getWeekStart();
    const weekStartIso = weekStart.toISOString();
    const weekNumber = getIsoWeek(now);
    const year = now.getUTCFullYear();

    // ─── Neue Kunden diese Woche ──────────────────────────────────────────────
    const { data: newSubsData } = await supabaseAdmin
      .from('subscriptions')
      .select('email, plan')
      .eq('status', 'active')
      .gte('created_at', weekStartIso)
      .not('plan', 'eq', 'free');

    const newCustomers = (newSubsData ?? []).map(r => ({
      email: (r.email as string) ?? '—',
      plan: (r.plan as string) ?? 'unknown',
    }));

    // ─── Kündigungen diese Woche ──────────────────────────────────────────────
    const { data: cancelData } = await supabaseAdmin
      .from('subscriptions')
      .select('email, plan')
      .eq('status', 'canceled')
      .gte('updated_at', weekStartIso);

    const cancellations = (cancelData ?? []).map(r => ({
      email: (r.email as string) ?? '—',
      plan: (r.plan as string) ?? 'unknown',
    }));

    // ─── Aktive Subscriber nach Plan ─────────────────────────────────────────
    const { data: activeSubsData } = await supabaseAdmin
      .from('subscriptions')
      .select('plan')
      .eq('status', 'active')
      .not('plan', 'eq', 'free');

    const activeByPlan: Record<string, number> = {};
    for (const row of (activeSubsData ?? [])) {
      const plan = (row.plan as string) ?? 'unknown';
      activeByPlan[plan] = (activeByPlan[plan] ?? 0) + 1;
    }

    // Agency-Accounts ebenfalls einrechnen
    const { data: agencyData } = await supabaseAdmin
      .from('agency_accounts')
      .select('plan')
      .eq('status', 'active');

    for (const row of (agencyData ?? [])) {
      const plan = (row.plan as string) ?? 'unknown';
      activeByPlan[plan] = (activeByPlan[plan] ?? 0) + 1;
    }

    const mrr = calcMrr(activeByPlan);

    // ─── Scans diese Woche ────────────────────────────────────────────────────
    const { data: scansData } = await supabaseAdmin
      .from('scans')
      .select('user_id')
      .gte('created_at', weekStartIso);

    const scansAll = scansData ?? [];
    const scansTotal = scansAll.length;
    const scansFree = scansAll.filter(s => !s.user_id).length;
    const scansPaid = scansTotal - scansFree;

    // ─── Neue Leads diese Woche ───────────────────────────────────────────────
    const { data: leadsData } = await supabaseAdmin
      .from('scan_leads')
      .select('id')
      .gte('created_at', weekStartIso);

    const newLeads = (leadsData ?? []).length;

    // ─── Fehlgeschlagene Zahlungen ────────────────────────────────────────────
    const { data: failedPayData } = await supabaseAdmin
      .from('subscriptions')
      .select('id')
      .in('status', ['past_due', 'unpaid']);

    const failedPayments = (failedPayData ?? []).length;

    // ─── Admin-Digest senden ──────────────────────────────────────────────────
    await sendAdminDigest({
      weekNumber,
      year,
      newCustomers,
      cancellations,
      activeByPlan,
      mrr,
      scansTotal,
      scansFree,
      scansPaid,
      newLeads,
      failedPayments,
    });

    return NextResponse.json({
      message: `Admin-Digest KW ${weekNumber}/${year} gesendet`,
      newCustomers: newCustomers.length,
      cancellations: cancellations.length,
      totalActive: Object.values(activeByPlan).reduce((a, b) => a + b, 0),
      mrr,
      scansTotal,
      newLeads,
      failedPayments,
    });

  } catch (error) {
    console.error('[AdminDigest Cron] Fehler:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unbekannter Fehler' },
      { status: 500 }
    );
  }
}
