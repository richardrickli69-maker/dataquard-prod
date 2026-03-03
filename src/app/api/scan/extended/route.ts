/**
 * Extended Scanner API Route
 * POST /api/scan/extended
 */
import { isValidUrl } from '@/lib/scanner';
import { NextRequest, NextResponse } from 'next/server';
import { performExtendedScan } from '@/lib/extendedScanner';

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (err) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'URL must be a non-empty string' },
        { status: 400 }
      );
    }

    const trimmedUrl = url.trim();

    if (trimmedUrl.length === 0 || trimmedUrl.length > 2048) {
      return NextResponse.json(
        { success: false, error: 'URL length invalid (1-2048 chars)' },
        { status: 400 }
      );
    }

    if (!isValidUrl(trimmedUrl)) {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    const scanResult = await performExtendedScan(trimmedUrl);

    // Scan in Supabase speichern
    try {
      const { supabaseAdmin } = await import('@/lib/supabaseAdmin');
      const domain = trimmedUrl.replace('https://', '').replace('http://', '').split('/')[0];
      const { data, error } = await supabaseAdmin.from('scans').insert([{
        url:          trimmedUrl,
        domain:       domain,
        jurisdiction: scanResult.jurisdiction ?? 'nDSG',
        ampel:        scanResult.riskLevel    ?? 'gelb',
        confidence:   scanResult.confidence   ?? 0.8,
        reasons:      scanResult.reasons      ?? [],
      }]).select();

      if (error) {
        console.error('[saveScan] Supabase Fehler:', error.message, error.details);
      } else {
        console.log('[saveScan] ✅ Gespeichert:', data);
      }
    } catch (saveError) {
      console.error('[saveScan] Exception:', saveError);
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          url: trimmedUrl,
          scan: scanResult,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Extended Scan Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({});
}