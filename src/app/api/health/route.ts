/**
 * Health-Check Route
 * GET /api/health
 * Gibt den Status der externen Dienste zurück (Scanner, Sightengine, Claude API).
 * Wird beim Laden der Scanner-Seite aufgerufen um den User frühzeitig zu informieren.
 */
import { NextResponse } from 'next/server';

export async function GET() {
  const status = {
    scanner: true,
    sightengine: !!process.env.SIGHTENGINE_API_USER,
    claude: !!process.env.ANTHROPIC_API_KEY,
  };

  return NextResponse.json({
    operational: status.scanner && status.claude,
    status,
  });
}
