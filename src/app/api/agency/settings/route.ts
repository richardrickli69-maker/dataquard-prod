/**
 * Agency Settings API
 * GET /api/agency/settings  → Agency-Einstellungen laden
 * PUT /api/agency/settings  → White-Label-Einstellungen aktualisieren
 */
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { cookies } from 'next/headers';

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

export async function GET() {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const { data: agency, error } = await supabaseAdmin
      .from('agency_accounts')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error || !agency) {
      // Kein Account → 404 (nicht 500)
      return NextResponse.json({ error: 'Kein Agency-Account gefunden' }, { status: 404 });
    }

    return NextResponse.json({ agency });
  } catch (err) {
    console.error('agency settings GET:', err);
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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

    // Nur erlaubte Felder akzeptieren
    const allowedFields: Record<string, unknown> = {};

    if (typeof b.custom_logo_url === 'string' || b.custom_logo_url === null) {
      allowedFields.custom_logo_url = b.custom_logo_url;
    }
    if (typeof b.custom_color === 'string' && /^#[0-9A-Fa-f]{6}$/.test(b.custom_color)) {
      allowedFields.custom_color = b.custom_color;
    }
    if (typeof b.white_label_enabled === 'boolean') {
      allowedFields.white_label_enabled = b.white_label_enabled;
    }
    if (typeof b.scan_frequency === 'string' && ['monthly', 'weekly'].includes(b.scan_frequency)) {
      allowedFields.scan_frequency = b.scan_frequency;
    }

    if (Object.keys(allowedFields).length === 0) {
      return NextResponse.json({ error: 'Keine gültigen Felder zum Aktualisieren' }, { status: 400 });
    }

    allowedFields.updated_at = new Date().toISOString();

    // Agency-Account laden (plan prüfen für White-Label)
    const { data: agency } = await supabaseAdmin
      .from('agency_accounts')
      .select('id, plan')
      .eq('user_id', user.id)
      .single();

    if (!agency) {
      return NextResponse.json({ error: 'Kein Agency-Account gefunden' }, { status: 404 });
    }

    // White-Label nur für agency_pro und agency_enterprise
    if (allowedFields.white_label_enabled === true &&
        agency.plan === 'agency_basic') {
      return NextResponse.json({
        error: 'White-Label erfordert Agency Pro oder Enterprise',
        upgradeRequired: true,
      }, { status: 403 });
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('agency_accounts')
      .update(allowedFields)
      .eq('id', agency.id)
      .select()
      .single();

    if (updateError) {
      console.error('agency settings PUT:', updateError.message);
      return NextResponse.json({ error: 'Fehler beim Aktualisieren' }, { status: 500 });
    }

    return NextResponse.json({ agency: updated });
  } catch (err) {
    console.error('agency settings PUT unhandled:', err);
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 });
  }
}
