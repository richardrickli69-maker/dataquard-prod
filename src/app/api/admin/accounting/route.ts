/**
 * Dataquard – Accounting API Route
 * src/app/api/admin/accounting/route.ts
 *
 * GET /api/admin/accounting
 * Holt Zahlungsdaten direkt von Stripe API
 */

import { NextResponse } from 'next/server';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_API = 'https://api.stripe.com/v1';

async function stripeGet(endpoint: string) {
  if (!STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY fehlt in .env.local');

  const res = await fetch(`${STRIPE_API}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Stripe Fehler: ${err.error?.message ?? res.statusText}`);
  }

  return res.json();
}

async function getAccountingData() {
  const chargesData = await stripeGet('/charges?limit=100&status=succeeded');
  const charges = chargesData.data ?? [];

  const subsData = await stripeGet('/subscriptions?limit=100&status=active');
  const subscriptions = subsData.data ?? [];

  // Umsatz total
  const totalRevenue = charges.reduce(
    (sum: number, c: any) => sum + c.amount, 0
  ) / 100;

  // Umsatz pro Monat (letzte 12 Monate)
  const revenuePerMonth: Record<string, number> = {};
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    revenuePerMonth[key] = 0;
  }
  charges.forEach((c: any) => {
    const d = new Date(c.created * 1000);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (key in revenuePerMonth) {
      revenuePerMonth[key] += c.amount / 100;
    }
  });

  // Plan-Verteilung
  const planCount: Record<string, number> = {
    FREE: 0, STARTER: 0, PROFESSIONAL: 0, ENTERPRISE: 0,
  };
  subscriptions.forEach((sub: any) => {
    const amount = sub.plan?.amount ?? 0;
    if (amount === 0)          planCount.FREE++;
    else if (amount <= 7900)   planCount.STARTER++;
    else if (amount <= 19900)  planCount.PROFESSIONAL++;
    else                       planCount.ENTERPRISE++;
  });

  // Letzte 10 Zahlungen
  const recentPayments = charges.slice(0, 10).map((c: any) => ({
    id:       c.id,
    amount:   c.amount / 100,
    currency: c.currency.toUpperCase(),
    email:    c.billing_details?.email ?? c.customer ?? '—',
    status:   c.status,
    date:     new Date(c.created * 1000).toISOString(),
  }));

  // MRR
  const mrr = subscriptions.reduce(
    (sum: number, sub: any) => sum + (sub.plan?.amount ?? 0), 0
  ) / 100;

  return {
    totalRevenue,
    totalPayments:       charges.length,
    activeSubscriptions: subscriptions.length,
    mrr,
    revenuePerMonth,
    planCount,
    recentPayments,
  };
}

export async function GET() {
  try {
    const data = await getAccountingData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Accounting API] Fehler:', error);
    return NextResponse.json({
      totalRevenue:        0,
      totalPayments:       0,
      activeSubscriptions: 0,
      mrr:                 0,
      revenuePerMonth:     {},
      planCount:           { FREE: 0, STARTER: 0, PROFESSIONAL: 0, ENTERPRISE: 0 },
      recentPayments:      [],
      error: error instanceof Error ? error.message : 'Unbekannter Fehler',
    });
  }
}