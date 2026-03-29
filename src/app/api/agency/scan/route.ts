/**
 * Agency Bulk-Scan API
 * POST /api/agency/scan
 * Startet Scans für alle oder ausgewählte Domains des Agency-Accounts.
 * Rate-Limiting: max. 5 parallele Scans, 2s Pause zwischen Batches.
 * Verwendet bestehende performExtendedScan() — keine Duplikation!
 */
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { performExtendedScan } from '@/lib/extendedScanner';
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

/** Pausiert für n Millisekunden */
function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

/** Verarbeitet eine einzelne Domain: Scan + Ergebnis in DB speichern */
async function scanAndSaveDomain(domainRow: {
  id: string;
  domain: string;
  agency_id: string;
}): Promise<{ domainId: string; success: boolean; error?: string }> {
  try {
    // Status auf "scanning" setzen (kein eigener Status in Schema → pending während Scan)
    await supabaseAdmin
      .from('agency_domains')
      .update({ status: 'pending' })
      .eq('id', domainRow.id);

    // Bestehende Scanner-Logik verwenden
    const result = await performExtendedScan(domainRow.domain);

    const scannedAt = new Date().toISOString();

    // Scan-Ergebnis in agency_scan_results speichern
    const { data: scanRow } = await supabaseAdmin
      .from('agency_scan_results')
      .insert({
        domain_id: domainRow.id,
        scan_data: result as unknown as Record<string, unknown>,
        scanned_at: scannedAt,
      })
      .select('id')
      .single();

    // Scores aus Scan-Ergebnis extrahieren
    const complianceScore  = result.compliance?.score ?? null;
    const performanceScore = result.optimization?.score ?? null;
    const securityScore    = result.trust?.score ?? null;
    // realityScore: 0–100, höher = mehr KI-Inhalt. AI-Trust = 100 - realityScore
    const aiTrustScore     = result.aiAudit ? Math.max(0, 100 - (result.aiAudit.realityScore ?? 0)) : null;
    const aiImagesFound    = result.sightengine?.aiImagesFound ?? 0;
    // Automatisch gekennzeichnet: ai_score > 0.7 (gleiche Schwelle wie in extended scan)
    const aiImagesLabeled  = result.sightengine?.imageDetails
      ? result.sightengine.imageDetails.filter(img => img.ai_score > 0.7).length
      : 0;
    const trackersFound    = result.compliance?.trackersFound?.length ?? 0;

    // Domain-Record aktualisieren
    await supabaseAdmin
      .from('agency_domains')
      .update({
        status: 'scanned',
        last_scan_at: scannedAt,
        compliance_score: complianceScore,
        performance_score: performanceScore,
        security_score: securityScore,
        ai_trust_score: aiTrustScore,
        ai_images_found: aiImagesFound,
        ai_images_labeled: aiImagesLabeled,
        trackers_found: trackersFound,
      })
      .eq('id', domainRow.id);

    // Vorherigen Scan als previous_scan_id verknüpfen (optional)
    if (scanRow) {
      const { data: prevScan } = await supabaseAdmin
        .from('agency_scan_results')
        .select('id')
        .eq('domain_id', domainRow.id)
        .neq('id', scanRow.id)
        .order('scanned_at', { ascending: false })
        .limit(1)
        .single();

      if (prevScan) {
        await supabaseAdmin
          .from('agency_scan_results')
          .update({ previous_scan_id: prevScan.id })
          .eq('id', scanRow.id);
      }
    }

    return { domainId: domainRow.id, success: true };
  } catch (err) {
    console.error(`Scan fehlgeschlagen für ${domainRow.domain}:`, err);

    // Domain auf Status "error" setzen
    await supabaseAdmin
      .from('agency_domains')
      .update({ status: 'error' })
      .eq('id', domainRow.id);

    return {
      domainId: domainRow.id,
      success: false,
      error: err instanceof Error ? err.message : 'Unbekannter Fehler',
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    let body: Record<string, unknown> = {};
    try {
      body = await request.json();
    } catch {
      // Leerer Body ist OK — dann alle Domains scannen
    }

    // Optional: spezifische Domain-IDs übergeben, sonst alle
    const specificIds: string[] | undefined =
      Array.isArray(body.domainIds) ? body.domainIds as string[] : undefined;

    // Agency-Account laden
    const { data: agency, error: agencyError } = await supabaseAdmin
      .from('agency_accounts')
      .select('id, plan, status')
      .eq('user_id', user.id)
      .single();

    if (agencyError || !agency) {
      return NextResponse.json({ error: 'Kein Agency-Account gefunden' }, { status: 404 });
    }

    if (agency.status !== 'active') {
      return NextResponse.json({ error: 'Agency-Account inaktiv' }, { status: 403 });
    }

    // Zu scannende Domains laden
    let query = supabaseAdmin
      .from('agency_domains')
      .select('id, domain, agency_id')
      .eq('agency_id', agency.id);

    if (specificIds && specificIds.length > 0) {
      query = query.in('id', specificIds);
    }

    const { data: domains, error: domainsError } = await query;

    if (domainsError) {
      console.error('agency scan load domains:', domainsError.message);
      return NextResponse.json({ error: 'Domains konnten nicht geladen werden' }, { status: 500 });
    }

    if (!domains || domains.length === 0) {
      return NextResponse.json({ message: 'Keine Domains zum Scannen', scanned: 0 });
    }

    // Bulk-Scan: Batches von max. 5 parallel, 2s Pause zwischen Batches
    const BATCH_SIZE = 5;
    const PAUSE_MS   = 2000;

    const results: { domainId: string; success: boolean; error?: string }[] = [];

    for (let i = 0; i < domains.length; i += BATCH_SIZE) {
      const batch = domains.slice(i, i + BATCH_SIZE);

      // Batch parallel ausführen
      const batchResults = await Promise.all(
        batch.map(d => scanAndSaveDomain({ id: d.id, domain: d.domain, agency_id: d.agency_id }))
      );
      results.push(...batchResults);

      // Pause nach jedem Batch (ausser nach dem letzten)
      if (i + BATCH_SIZE < domains.length) {
        await sleep(PAUSE_MS);
      }
    }

    const successCount = results.filter(r => r.success).length;
    const errorCount   = results.filter(r => !r.success).length;

    return NextResponse.json({
      message: `${successCount} von ${domains.length} Domains erfolgreich gescannt`,
      scanned: successCount,
      errors: errorCount,
      results,
    });
  } catch (err) {
    console.error('agency scan POST unhandled:', err);
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 });
  }
}
