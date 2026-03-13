import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;
export const runtime = 'nodejs';

async function checkStructuredData(pageUrl: string) {
  try {
    const res = await fetch(pageUrl, { signal: AbortSignal.timeout(8000) });
    const html = await res.text();
    const scripts = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
    const combined = scripts.map((s) => s[1]).join(' ');
    return {
      hasSoftwareApplicationSchema: combined.includes('"SoftwareApplication"'),
      hasFaqSchema: combined.includes('"FAQPage"'),
      hasOrganizationSchema: combined.includes('"Organization"'),
    };
  } catch {
    return { hasSoftwareApplicationSchema: false, hasFaqSchema: false, hasOrganizationSchema: false };
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get('url') ?? 'https://www.dataquard.ch';

  if (!targetUrl.startsWith('http')) {
    return NextResponse.json({ error: 'Ungültige URL' }, { status: 400 });
  }

  const startTime = Date.now();
  const structuredData = await checkStructuredData(targetUrl);

  return NextResponse.json({
    scannedUrl: targetUrl,
    scanDurationMs: Date.now() - startTime,
    timestamp: new Date().toISOString(),
    structuredData: {
      ...structuredData,
      summary: [
        structuredData.hasSoftwareApplicationSchema ? '✅ SoftwareApplication Schema' : '❌ SoftwareApplication Schema fehlt',
        structuredData.hasFaqSchema ? '✅ FAQPage Schema' : '❌ FAQPage Schema fehlt',
        structuredData.hasOrganizationSchema ? '✅ Organization Schema' : '❌ Organization Schema fehlt',
      ],
    },
  }, { headers: { 'Cache-Control': 'no-store' } });
}
