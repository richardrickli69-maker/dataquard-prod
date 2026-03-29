/**
 * Agency Domains API
 * GET  /api/agency/domains      → Alle Domains des Agency-Accounts laden
 * POST /api/agency/domains      → Domain(s) hinzufügen (einzeln oder Bulk-Array)
 * DELETE /api/agency/domains    → Domain(s) entfernen (Array von IDs)
 */
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { cookies } from 'next/headers';

/** Supabase-Client mit Cookie-basierter Auth für Server-Komponenten */
async function createSupabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );
}

/** Domain-Format validieren (z.B. "example.ch", "www.example.com") */
function isValidDomain(d: string): boolean {
  return /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/.test(d.trim());
}

/** Domain normalisieren: https:// und trailing slash entfernen, lowercase */
function normalizeDomain(raw: string): string {
  return raw.trim().toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '');
}

// ── GET ────────────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    // Agency-Account des Users laden
    const { data: agency, error: agencyError } = await supabaseAdmin
      .from('agency_accounts')
      .select('id, plan, max_domains, white_label_enabled, custom_logo_url, custom_color, status')
      .eq('user_id', user.id)
      .single();

    if (agencyError || !agency) {
      return NextResponse.json({ error: 'Kein Agency-Account gefunden' }, { status: 404 });
    }

    // Domains dieses Agency-Accounts laden
    const { data: domains, error: domainsError } = await supabaseAdmin
      .from('agency_domains')
      .select('*')
      .eq('agency_id', agency.id)
      .order('added_at', { ascending: false });

    if (domainsError) {
      console.error('agency domains GET:', domainsError.message);
      return NextResponse.json({ error: 'Fehler beim Laden der Domains' }, { status: 500 });
    }

    return NextResponse.json({
      agency,
      domains: domains ?? [],
      domainCount: (domains ?? []).length,
    });
  } catch (err) {
    console.error('agency domains GET unhandled:', err);
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 });
  }
}

// ── POST ───────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Ungültiger JSON-Body' }, { status: 400 });
    }

    // Einzelne Domain ODER Array von Domains akzeptieren
    const rawDomains: string[] = [];
    if (typeof body === 'object' && body !== null) {
      const b = body as Record<string, unknown>;
      if (typeof b.domain === 'string') {
        rawDomains.push(b.domain);
      } else if (Array.isArray(b.domains)) {
        for (const d of b.domains) {
          if (typeof d === 'string') rawDomains.push(d);
        }
      }
    }

    if (rawDomains.length === 0) {
      return NextResponse.json({ error: 'Keine Domain(s) angegeben' }, { status: 400 });
    }

    // Agency-Account laden
    const { data: agency, error: agencyError } = await supabaseAdmin
      .from('agency_accounts')
      .select('id, max_domains, plan')
      .eq('user_id', user.id)
      .single();

    if (agencyError || !agency) {
      return NextResponse.json({ error: 'Kein Agency-Account gefunden' }, { status: 404 });
    }

    // Bestehende Domain-Anzahl prüfen
    const { count: existingCount } = await supabaseAdmin
      .from('agency_domains')
      .select('id', { count: 'exact', head: true })
      .eq('agency_id', agency.id);

    const currentCount = existingCount ?? 0;

    // Domains normalisieren + validieren + duplizieren entfernen
    const validDomains: string[] = [];
    const invalidDomains: string[] = [];
    const seen = new Set<string>();

    for (const raw of rawDomains) {
      const normalized = normalizeDomain(raw);
      if (!isValidDomain(normalized)) {
        invalidDomains.push(raw);
        continue;
      }
      if (seen.has(normalized)) continue;
      seen.add(normalized);
      validDomains.push(normalized);
    }

    if (validDomains.length === 0) {
      return NextResponse.json({
        error: 'Keine gültigen Domains. Ungültig: ' + invalidDomains.join(', '),
      }, { status: 400 });
    }

    // Domain-Limit prüfen
    if (currentCount + validDomains.length > agency.max_domains) {
      const planLabel = agency.plan === 'agency_basic' ? 'Agency Basic (15)'
        : agency.plan === 'agency_pro' ? 'Agency Pro (50)'
        : 'Agency Enterprise';
      return NextResponse.json({
        error: `Domain-Limit erreicht (${currentCount}/${agency.max_domains} — ${planLabel}). Upgrade auf höheren Plan.`,
        limitReached: true,
        currentCount,
        maxDomains: agency.max_domains,
      }, { status: 422 });
    }

    // Bereits vorhandene Domains ermitteln (Duplikate in DB)
    const { data: existingDomains } = await supabaseAdmin
      .from('agency_domains')
      .select('domain')
      .eq('agency_id', agency.id)
      .in('domain', validDomains);

    const existingSet = new Set((existingDomains ?? []).map(d => d.domain));
    const newDomains = validDomains.filter(d => !existingSet.has(d));

    if (newDomains.length === 0) {
      return NextResponse.json({
        message: 'Alle Domains bereits vorhanden',
        added: 0,
        skipped: validDomains.length,
      });
    }

    // Neue Domains einfügen
    const inserts = newDomains.map(domain => ({
      agency_id: agency.id,
      domain,
      status: 'pending',
      added_at: new Date().toISOString(),
    }));

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('agency_domains')
      .insert(inserts)
      .select();

    if (insertError) {
      console.error('agency domains POST insert:', insertError.message);
      return NextResponse.json({ error: 'Fehler beim Einfügen' }, { status: 500 });
    }

    return NextResponse.json({
      message: `${newDomains.length} Domain(s) hinzugefügt`,
      added: newDomains.length,
      skipped: validDomains.length - newDomains.length,
      invalid: invalidDomains,
      domains: inserted,
    }, { status: 201 });
  } catch (err) {
    console.error('agency domains POST unhandled:', err);
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 });
  }
}

// ── DELETE ─────────────────────────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Ungültiger JSON-Body' }, { status: 400 });
    }

    const ids: string[] = [];
    if (typeof body === 'object' && body !== null && Array.isArray((body as Record<string, unknown>).ids)) {
      for (const id of (body as Record<string, unknown>).ids as unknown[]) {
        if (typeof id === 'string') ids.push(id);
      }
    }

    if (ids.length === 0) {
      return NextResponse.json({ error: 'Keine IDs angegeben' }, { status: 400 });
    }

    // Agency-Account des Users laden (Sicherheits-Check: nur eigene Domains löschen)
    const { data: agency, error: agencyError } = await supabaseAdmin
      .from('agency_accounts')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (agencyError || !agency) {
      return NextResponse.json({ error: 'Kein Agency-Account gefunden' }, { status: 404 });
    }

    const { error: deleteError } = await supabaseAdmin
      .from('agency_domains')
      .delete()
      .eq('agency_id', agency.id)
      .in('id', ids);

    if (deleteError) {
      console.error('agency domains DELETE:', deleteError.message);
      return NextResponse.json({ error: 'Fehler beim Löschen' }, { status: 500 });
    }

    return NextResponse.json({ message: `${ids.length} Domain(s) gelöscht` });
  } catch (err) {
    console.error('agency domains DELETE unhandled:', err);
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 });
  }
}

// ── PATCH — Document Pack Toggle ───────────────────────────────────────────
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Ungültiger JSON-Body' }, { status: 400 });
    }

    const b = body as Record<string, unknown>;
    const domainId = b.domainId as string;
    const documentPackEnabled = b.document_pack_enabled as boolean;

    if (!domainId || typeof documentPackEnabled !== 'boolean') {
      return NextResponse.json({ error: 'domainId und document_pack_enabled erforderlich' }, { status: 400 });
    }

    // Sicherheits-Check: Domain muss zum Agency-Account des Users gehören
    const { data: agency } = await supabaseAdmin
      .from('agency_accounts')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!agency) {
      return NextResponse.json({ error: 'Kein Agency-Account gefunden' }, { status: 404 });
    }

    const { error: updateError } = await supabaseAdmin
      .from('agency_domains')
      .update({ document_pack_enabled: documentPackEnabled })
      .eq('id', domainId)
      .eq('agency_id', agency.id);

    if (updateError) {
      console.error('agency domains PATCH:', updateError.message);
      return NextResponse.json({ error: 'Fehler beim Aktualisieren' }, { status: 500 });
    }

    return NextResponse.json({ success: true, document_pack_enabled: documentPackEnabled });
  } catch (err) {
    console.error('agency domains PATCH unhandled:', err);
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 });
  }
}
