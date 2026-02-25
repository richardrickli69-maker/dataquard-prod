import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const analytics = {
      totalScans: 1247,
      scansByDomain: [
        { domain: 'example.ch', count: 345 },
        { domain: 'example.de', count: 298 },
      ],
      scansByJurisdiction: {
        nDSG: 445,
        GDPR: 802,
      },
      conversionMetrics: {
        totalScans: 1247,
        totalConversions: 87,
        conversionRate: 6.98,
        conversionByPlan: {
          essential: 32,
          professional: 55,
        },
      },
      revenue: {
        totalRevenue: 12815,
        essential: { count: 32, revenue: 1568 },
        professional: { count: 55, revenue: 8745 },
      },
      monthlyRevenue: [
        { month: 'Jan', revenue: 2340 },
        { month: 'Feb', revenue: 3456 },
      ],
      topCountries: [
        { country: 'Switzerland', scans: 445, revenue: 5230 },
        { country: 'Germany', scans: 298, revenue: 3120 },
      ],
    };

    return NextResponse.json(
      { success: true, data: analytics },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({});
}