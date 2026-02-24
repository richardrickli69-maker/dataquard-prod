import { NextRequest, NextResponse } from 'next/server';
import { scanWebsite, isValidUrl } from '@/lib/scanner';
import { detectJurisdiction } from '@/lib/jurisdiction';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    if (!isValidUrl(url)) {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    const scanResult = await scanWebsite(url);
    const jurisdictionResult = await detectJurisdiction(url, {
      domain: scanResult.domain,
      language: scanResult.language,
      country: guessCountryFromDomain(scanResult.domain),
      content: scanResult.description,
      impressum: scanResult.impressumText,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          scan: scanResult,
          jurisdiction: jurisdictionResult,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

function guessCountryFromDomain(domain: string): string {
  const ext = domain.split('.').pop()?.toUpperCase() || '';
  const countryMap: Record<string, string> = {
    CH: 'CH', DE: 'DE', AT: 'AT', FR: 'FR', IT: 'IT', ES: 'ES',
    NL: 'NL', BE: 'BE', SE: 'SE', DK: 'DK', NO: 'NO', FI: 'FI',
  };
  return countryMap[ext] || 'UNKNOWN';
}

export async function OPTIONS() {
  return NextResponse.json({});
}