/**
 * Extended Scanner API Route
 * POST /api/scan/extended
 */

// Maximale Ausführungszeit auf Vercel Pro: 60s (Hobby-Plan: ignoriert, bleibt bei 10s)
export const maxDuration = 60;

import { isValidUrl } from '@/lib/scanner';
import { NextRequest, NextResponse } from 'next/server';
import { performExtendedScan } from '@/lib/extendedScanner';
import { logAudit } from '@/lib/audit';

const ipScanMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const WINDOW_MS = 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  // Rate limiting for unauthenticated requests
  const authHeader = request.headers.get('authorization');
  const isAuthenticated = authHeader?.startsWith('Bearer ');
  // Alte Einträge bereinigen (Memory Leak verhindern)
  const nowClean = Date.now();
  for (const [ip, data] of ipScanMap.entries()) {
    if (nowClean > data.resetAt) ipScanMap.delete(ip);
  }
  if (!isAuthenticated) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const now = Date.now();
    const entry = ipScanMap.get(ip);
    if (entry && now < entry.resetAt) {
      if (entry.count >= RATE_LIMIT) {
        return NextResponse.json(
          { success: false, error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      entry.count++;
    } else {
      ipScanMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    }
  }

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

      // User-ID aus Bearer-Token extrahieren
      let userId: string | null = null;
      let rescanEnabled = false;
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.slice(7).trim();
        // Anon-Key-Client für JWT-Verifikation verwenden (zuverlässiger als Admin-Client)
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseVerify = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          { auth: { autoRefreshToken: false, persistSession: false } }
        );
        const { data: { user }, error: authError } = await supabaseVerify.auth.getUser(token);
        if (!authError && user?.id) {
          userId = user.id;
          // User in public.users sicherstellen — existiert nach OAuth-Registrierung evtl. nicht
          const { error: userUpsertErr } = await supabaseAdmin
            .from('users')
            .upsert(
              { id: user.id, email: user.email ?? '' },
              { onConflict: 'id', ignoreDuplicates: true }
            );
          if (userUpsertErr) {
            console.error('[saveScan] User-Upsert Fehler:', userUpsertErr.message);
          }
          // Rescan aktivieren wenn User aktive Subscription hat
          const { data: sub } = await supabaseAdmin
            .from('subscriptions')
            .select('id')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .limit(1)
            .maybeSingle();
          rescanEnabled = !!sub;
        }
      }

      const trackersFound = scanResult.compliance.trackersFound ?? [];
      const { data, error } = await supabaseAdmin.from('scans').insert([{
        url:               trimmedUrl,
        domain:            domain,
        jurisdiction:      scanResult.compliance.jurisdiction ?? 'nDSG',
        ampel:             scanResult.compliance.ampel        ?? 'gelb',
        confidence:        0.8,
        reasons:           [],
        user_id:           userId,
        previous_services: trackersFound,
        rescan_enabled:    rescanEnabled,
      }]).select();

      if (error) {
        console.error('[saveScan] Supabase Fehler:', error.message, error.details);
      } else {
        if (userId) {
          await logAudit({
            user_id: userId,
            action: 'scan',
            resource: trimmedUrl,
            details: {
              risk_level: scanResult.compliance.ampel ?? 'unknown',
              detected_services_count: scanResult.compliance.trackersFound?.length ?? 0,
            },
          });

          // Erkannte KI-Bilder in ai_detected_images speichern
          const scanId: string | null = data?.[0]?.id ?? null;
          const imageDetails = scanResult.sightengine?.imageDetails ?? [];
          const aiImages = imageDetails
            .filter(r => r.ai_score > 0)
            .map(r => ({
              user_id: userId,
              scan_id: scanId,
              image_url: r.url,
              ai_probability: r.ai_score,
              is_labeled: r.ai_score > 0.7,
              detected_at: new Date().toISOString(),
            }));
          if (aiImages.length > 0) {
            const { error: imgErr } = await supabaseAdmin
              .from('ai_detected_images')
              .upsert(aiImages, { onConflict: 'user_id,image_url' });
            if (imgErr) {
              console.error('[saveAiImages] Fehler:', imgErr.message);
            }
          }
        }
      }
    } catch (saveError) {
      console.error('[saveScan] Exception:', saveError);
    }

    const se = scanResult.sightengine;
    const imageAnalysis = se ? {
      total_images_scanned: se.imagesAnalysed,
      total_images_found: se.totalImagesFound,
      ai_generated_count: se.aiImagesFound,
      deepfake_count: se.deepfakeCount,
      nudity_count: se.nudityCount,
      weapon_count: se.weaponCount,
      unsafe_count: se.unsafeCount,
      all_safe: se.allSafe,
    } : null;

    return NextResponse.json(
      {
        success: true,
        data: {
          url: trimmedUrl,
          scan: scanResult,
          image_analysis: imageAnalysis,
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