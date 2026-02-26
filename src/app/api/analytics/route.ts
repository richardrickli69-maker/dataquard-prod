import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Simulate analytics data
    const analytics = {
      totalScans: 1247,
      scansByDomain: [
        { domain: 'example.ch', count: 345 },
        { domain: 'example.de', count: 298 },
        { domain: 'example.at', count: 156 },
        { domain: 'example.fr', count: 89 },
        { domain: 'other', count: 359 },
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
        { month: 'Mar', revenue: 4019 },
        { month: 'Apr', revenue: 3000 },
      ],
      topCountries: [
        { country: 'Switzerland', scans: 445, revenue: 5230 },
        { country: 'Germany', scans: 298, revenue: 3120 },
        { country: 'Austria', scans: 156, revenue: 1890 },
        { country: 'France', scans: 89, revenue: 1100 },
        { country: 'Others', scans: 259, revenue: 1475 },
      ],
    };

    return NextResponse.json(
      {
        success: true,
        data: analytics,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch analytics',
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({});
}