/**
 * Extended Scanner API Route
 * POST /api/scan/extended
 * Comprehensive Website Analysis with Security Validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { performExtendedScan } from '@/lib/extendedScanner';
import { isValidUrl } from '@/lib/scanner';

export async function POST(request: NextRequest) {
  try {
    // Parse JSON with error handling
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

    // Type validation
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'URL must be a non-empty string' },
        { status: 400 }
      );
    }

    // Sanitize
    const trimmedUrl = url.trim();

    // Length validation
    if (trimmedUrl.length === 0 || trimmedUrl.length > 2048) {
      return NextResponse.json(
        { success: false, error: 'URL length invalid (1-2048 chars)' },
        { status: 400 }
      );
    }

    // Format validation
    if (!isValidUrl(trimmedUrl)) {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Perform extended scan with validated URL
    const scanResult = await performExtendedScan(trimmedUrl);

    // Return success response
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
        error:
          error instanceof Error
            ? error.message
            : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({});
}