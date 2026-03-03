import { NextResponse } from 'next/server';
import { getAnalyticsData } from '@/lib/supabaseAdmin';

export async function GET() {
  try {
    const data = await getAnalyticsData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Fehler' }, { status: 500 });
  }
}
