/**
 * Badge Verifikation
 * GET /api/badges/verify/[id]
 * Public endpoint – kein Auth erforderlich
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Ungültige Badge-ID' }, { status: 400 });
  }

  const { supabaseAdmin } = await import('@/lib/supabaseAdmin');

  const { data: badge, error } = await supabaseAdmin
    .from('verified_badges')
    .select('id, website_url, issued_at, expires_at, is_active')
    .eq('id', id)
    .single();

  if (error || !badge) {
    return NextResponse.json({ error: 'Badge nicht gefunden' }, { status: 404 });
  }

  const now = new Date();
  const isExpired = badge.expires_at && new Date(badge.expires_at) < now;
  const isValid = badge.is_active && !isExpired;

  return NextResponse.json({
    id: badge.id,
    website_url: badge.website_url,
    issued_at: badge.issued_at,
    expires_at: badge.expires_at,
    is_active: badge.is_active,
    is_expired: isExpired,
    is_valid: isValid,
  });
}
