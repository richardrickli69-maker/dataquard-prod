/**
 * Agency Report PDF
 * GET /api/agency/report/[domainId]
 * Generiert einen PDF-Compliance-Report für eine Domain.
 * Berücksichtigt White-Label-Einstellungen (Logo, Farbe) bei Agency Pro/Enterprise.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { generateAgencyReportPdf } from '@/lib/generateAgencyReportPdf';
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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ domainId: string }> }
) {
  try {
    const { domainId } = await params;

    const supabase = await createSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    // Agency-Account laden (für White-Label-Daten)
    const { data: agency, error: agencyError } = await supabaseAdmin
      .from('agency_accounts')
      .select('id, plan, white_label_enabled, custom_logo_url, custom_color')
      .eq('user_id', user.id)
      .single();

    if (agencyError || !agency) {
      return NextResponse.json({ error: 'Kein Agency-Account gefunden' }, { status: 404 });
    }

    // Domain laden — muss zum Agency-Account gehören
    const { data: domain, error: domainError } = await supabaseAdmin
      .from('agency_domains')
      .select('*')
      .eq('id', domainId)
      .eq('agency_id', agency.id)
      .single();

    if (domainError || !domain) {
      return NextResponse.json({ error: 'Domain nicht gefunden' }, { status: 404 });
    }

    // Letzten Scan-Datensatz laden (für Empfehlungen)
    const { data: lastScan } = await supabaseAdmin
      .from('agency_scan_results')
      .select('scan_data, scanned_at')
      .eq('domain_id', domainId)
      .order('scanned_at', { ascending: false })
      .limit(1)
      .single();

    // Empfehlungen aus letztem Scan extrahieren
    let recommendations: string[] = [];
    if (lastScan?.scan_data) {
      const sd = lastScan.scan_data as Record<string, unknown>;
      if (Array.isArray(sd.recommendations)) {
        recommendations = (sd.recommendations as unknown[])
          .filter((r): r is string => typeof r === 'string');
      }
    }

    // White-Label nur bei Pro/Enterprise
    const whiteLabel = agency.white_label_enabled &&
      (agency.plan === 'agency_pro' || agency.plan === 'agency_enterprise');

    const pdfBuffer = await generateAgencyReportPdf({
      domain: domain.domain,
      complianceScore:  domain.compliance_score,
      performanceScore: domain.performance_score,
      securityScore:    domain.security_score,
      aiTrustScore:     domain.ai_trust_score,
      aiImagesFound:    domain.ai_images_found ?? 0,
      aiImagesLabeled:  domain.ai_images_labeled ?? 0,
      trackersFound:    domain.trackers_found ?? 0,
      recommendations,
      scannedAt:        domain.last_scan_at,
      customLogoUrl:    whiteLabel ? (agency.custom_logo_url ?? null) : null,
      customColor:      whiteLabel ? (agency.custom_color ?? null) : null,
      agencyName:       whiteLabel ? user.email ?? null : null,
    });

    const filename = `report-${domain.domain.replace(/\./g, '-')}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (err) {
    console.error('agency report GET unhandled:', err);
    return NextResponse.json({ error: 'PDF-Generierung fehlgeschlagen' }, { status: 500 });
  }
}
