/**
 * Badge Generator
 * POST /api/badges/generate
 * Body: { website_url: string }
 * Auth: Bearer Token erforderlich (Subscriber only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logAudit } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
  }

  const token = authHeader.slice(7);

  // JWT verifizieren
  const supabaseVerify = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  const { data: { user }, error: authError } = await supabaseVerify.auth.getUser(token);
  if (authError || !user) {
    return NextResponse.json({ error: 'Ungültiger Token' }, { status: 401 });
  }

  let body: { website_url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Ungültiger Request-Body' }, { status: 400 });
  }

  const { website_url } = body;
  if (!website_url || typeof website_url !== 'string') {
    return NextResponse.json({ error: 'website_url fehlt' }, { status: 400 });
  }

  const { supabaseAdmin } = await import('@/lib/supabaseAdmin');

  // Subscription prüfen (STARTER oder PROFESSIONAL)
  const { data: sub } = await supabaseAdmin
    .from('subscriptions')
    .select('plan, current_period_end')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .in('plan', ['starter', 'professional'])
    .limit(1)
    .maybeSingle();

  if (!sub) {
    return NextResponse.json(
      { error: 'Verified Badge erfordert einen Starter- oder Professional-Plan' },
      { status: 403 }
    );
  }

  // Bestehenden Badge für diese URL prüfen
  const { data: existing } = await supabaseAdmin
    .from('verified_badges')
    .select('id')
    .eq('user_id', user.id)
    .eq('website_url', website_url)
    .eq('is_active', true)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ badge_id: existing.id, already_exists: true });
  }

  // expires_at aus Abo-Laufzeit ableiten, Fallback +1 Jahr
  const expiresAt = sub.current_period_end
    ? new Date(sub.current_period_end).toISOString()
    : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

  // Neuen Badge erstellen
  const { data: badge, error: insertError } = await supabaseAdmin
    .from('verified_badges')
    .insert({
      user_id: user.id,
      website_url: website_url.trim(),
      expires_at: expiresAt,
    })
    .select('id')
    .single();

  if (insertError || !badge) {
    console.error('[Badge] Insert-Fehler:', insertError?.message);
    return NextResponse.json({ error: 'Badge konnte nicht erstellt werden' }, { status: 500 });
  }

  await logAudit({
    user_id: user.id,
    action: 'badge_created',
    resource: website_url,
  });

  return NextResponse.json({ badge_id: badge.id, already_exists: false });
}
