/**
 * Admin Behavior API Route
 * GET /api/admin/behavior
 * Liefert Kundenverhalten-Statistiken für das Admin-Dashboard.
 * Verwendet Service Role (umgeht RLS) — nur für Admin-User zugänglich.
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createClient } from '@supabase/supabase-js';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'richard.rickli69@gmail.com';

export async function GET(req: NextRequest) {
  // Admin-Auth prüfen via Bearer Token
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const token = authHeader.slice(7).trim();

  // Token verifizieren
  const supabaseVerify = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  const { data: { user }, error: authError } = await supabaseVerify.auth.getUser(token);
  if (authError || !user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Scans letzte 7 und 30 Tage + neue User 30 Tage (parallel)
    const [
      { count: scans7d },
      { count: scans30d },
      { count: newUsers30d },
    ] = await Promise.all([
      supabaseAdmin.from('scans').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
      supabaseAdmin.from('scans').select('*', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo),
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo),
    ]);

    // Letzte 20 Scans für den Live-Feed
    const { data: recentScansRaw } = await supabaseAdmin
      .from('scans')
      .select('id, created_at, url, jurisdiction, ampel, user_id')
      .order('created_at', { ascending: false })
      .limit(20);

    // User-E-Mails für die Scan-User-IDs laden
    const userIds = [...new Set(
      (recentScansRaw ?? []).filter(s => s.user_id).map(s => s.user_id as string)
    )];
    const { data: usersForScans } = userIds.length > 0
      ? await supabaseAdmin.from('users').select('id, email').in('id', userIds)
      : { data: [] as Array<{ id: string; email: string }> };

    const userEmailMap: Record<string, string> = {};
    (usersForScans ?? []).forEach(u => { userEmailMap[u.id] = u.email; });

    const recentScans = (recentScansRaw ?? []).map(s => ({
      id: s.id as string,
      created_at: s.created_at as string,
      url: s.url as string,
      jurisdiction: (s.jurisdiction as string) ?? 'nDSG',
      ampel: (s.ampel as string) ?? 'gelb',
      user_id: (s.user_id as string | null) ?? null,
      user_email: s.user_id ? (userEmailMap[s.user_id as string] ?? null) : null,
    }));

    // Alle User laden (für Kunden-Aktivitäts-Tabelle)
    const { data: allUsers } = await supabaseAdmin
      .from('users')
      .select('id, email, plan, created_at')
      .order('created_at', { ascending: false });

    // Scan-Statistiken pro User laden (max. 5000 Einträge)
    const { data: scanStats } = await supabaseAdmin
      .from('scans')
      .select('user_id, created_at')
      .not('user_id', 'is', null)
      .limit(5000);

    // Pro-User: letzter Scan + Anzahl berechnen
    const scansByUser: Record<string, { count: number; last: string }> = {};
    (scanStats ?? []).forEach(s => {
      if (!s.user_id) return;
      const uid = s.user_id as string;
      if (!scansByUser[uid]) {
        scansByUser[uid] = { count: 0, last: s.created_at as string };
      }
      scansByUser[uid].count++;
      if ((s.created_at as string) > scansByUser[uid].last) {
        scansByUser[uid].last = s.created_at as string;
      }
    });

    // User-Aktivitäts-Array aufbauen, nach letztem Scan sortiert
    const userActivity = (allUsers ?? []).map(u => ({
      id: u.id as string,
      email: u.email as string,
      plan: (u.plan as string) || 'free',
      created_at: u.created_at as string,
      last_scan: scansByUser[u.id as string]?.last ?? null,
      scan_count: scansByUser[u.id as string]?.count ?? 0,
    })).sort((a, b) => {
      if (!a.last_scan && !b.last_scan) return 0;
      if (!a.last_scan) return 1;
      if (!b.last_scan) return -1;
      return b.last_scan.localeCompare(a.last_scan);
    });

    return NextResponse.json({
      scans7d: scans7d ?? 0,
      scans30d: scans30d ?? 0,
      newUsers30d: newUsers30d ?? 0,
      recentScans,
      userActivity,
    });
  } catch (err) {
    console.error('[admin/behavior] Fehler:', err);
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 });
  }
}
