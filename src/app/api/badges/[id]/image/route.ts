/**
 * Badge SVG Image
 * GET /api/badges/[id]/image
 * Public endpoint – liefert SVG Badge für Embed
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function buildSvg(websiteUrl: string, isValid: boolean): string {
  const domain = websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const statusColor = isValid ? '#22c55e' : '#ef4444';
  const statusText = isValid ? '✓ Verifiziert' : '✗ Abgelaufen';
  const borderColor = isValid ? '#22c55e' : '#ef4444';

  // Alle Styles inline (kein <style>-Block) — SVG via <img> blockiert externe CSS
  return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="120" viewBox="0 0 200 120">

  <!-- Hintergrund -->
  <rect width="200" height="120" rx="10" ry="10" fill="#ffffff" stroke="${borderColor}" stroke-width="2"/>

  <!-- Obere Akzentleiste -->
  <rect x="0" y="0" width="200" height="10" rx="10" ry="10" fill="${borderColor}"/>
  <rect x="0" y="5" width="200" height="5" fill="${borderColor}"/>

  <!-- Schild-Logo inline -->
  <g transform="translate(82, 14)">
    <path d="M18 2L3 7.5V18c0 7 6.5 11.5 15 14.5 8.5-3 15-7.5 15-14.5V7.5Z" fill="${borderColor}" opacity="0.15"/>
    <path d="M18 4L5 9v9c0 5.5 5 9 13 11.5 8-2.5 13-6 13-11.5V9Z" fill="${borderColor}" opacity="0.25"/>
    <text x="18" y="24" text-anchor="middle" font-size="11" font-weight="900" font-family="Arial,sans-serif" fill="${borderColor}">DQ</text>
  </g>

  <!-- Markenname -->
  <text x="100" y="66" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" font-weight="700" fill="#1e1b4b">Dataquard</text>

  <!-- Trennlinie -->
  <line x1="20" y1="74" x2="180" y2="74" stroke="#e5e7eb" stroke-width="1"/>

  <!-- Status -->
  <text x="100" y="90" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" font-weight="700" fill="${statusColor}">${statusText}</text>

  <!-- Domain -->
  <text x="100" y="106" text-anchor="middle" font-family="Arial,sans-serif" font-size="9" font-weight="600" fill="#4f46e5">${domain.length > 22 ? domain.substring(0, 22) + '&#x2026;' : domain}</text>
</svg>`;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return new NextResponse('Not found', { status: 404 });
  }

  const { supabaseAdmin } = await import('@/lib/supabaseAdmin');
  const { data: badge } = await supabaseAdmin
    .from('verified_badges')
    .select('website_url, expires_at, is_active')
    .eq('id', id)
    .single();

  const isValid = !!badge?.is_active && (!badge.expires_at || new Date(badge.expires_at) > new Date());
  const websiteUrl = badge?.website_url ?? 'unbekannt';

  const svg = buildSvg(websiteUrl, isValid);

  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
