// src/app/api/checkout/route.ts
// Erstellt Stripe Checkout Sessions für KMU-Jahresabos und Agency-Monatsabos
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

interface PlanConfig {
  envVar: string;
  name: string;
  planType: 'kmu' | 'agency';
}

// Pläne mit zugehöriger Env-Var für die Stripe Price ID
const PLANS: Record<string, PlanConfig> = {
  // ── KMU-Pläne (Jahresabo, unverändert) ───────────────────────────────────
  starter: {
    envVar: 'STRIPE_STARTER_PRICE_ID',
    name: 'Dataquard Starter',
    planType: 'kmu',
  },
  professional: {
    envVar: 'STRIPE_PRO_PRICE_ID',
    name: 'Dataquard Professional',
    planType: 'kmu',
  },
  // ── Agency-Pläne (Monatsabo, Self-Service) ───────────────────────────────
  agency_basic: {
    envVar: 'STRIPE_AGENCY_BASIC_PRICE_ID',
    name: 'Dataquard Agency Basic',
    planType: 'agency',
  },
  agency_pro: {
    envVar: 'STRIPE_AGENCY_PRO_PRICE_ID',
    name: 'Dataquard Agency Pro',
    planType: 'agency',
  },
  // Hinweis: agency_enterprise hat keinen Self-Service Checkout
};

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json({ error: 'Stripe nicht konfiguriert' }, { status: 500 });
  }
  const stripe = new Stripe(stripeKey, { apiVersion: '2026-02-25.clover' });

  try {
    const { product, userId, userEmail } = await req.json() as {
      product: string;
      userId: string | null;
      userEmail: string | null;
    };

    const planConfig = PLANS[product];
    if (!planConfig) {
      return NextResponse.json({ error: 'Ungültiges Produkt' }, { status: 400 });
    }

    // Price ID aus Umgebungsvariable lesen – niemals hardcoden
    const priceId = process.env[planConfig.envVar];
    if (!priceId) {
      console.error(`[Checkout] Price ID für Plan "${product}" nicht konfiguriert (${planConfig.envVar})`);
      return NextResponse.json({ error: 'Plan momentan nicht verfügbar' }, { status: 500 });
    }

    const baseUrl = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const isAgency = planConfig.planType === 'agency';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      ...(userEmail ? { customer_email: userEmail } : {}),
      metadata: {
        plan: product,
        // Agency-Sessions erhalten zusätzliches plan_type-Flag für den Webhook
        ...(isAgency ? { plan_type: 'agency' } : {}),
        ...(userId ? { user_id: userId } : {}),
      },
      // Agency: nach Checkout zum Agency-Dashboard; KMU: zur bisherigen Success-Seite
      success_url: isAgency
        ? `${baseUrl}/dashboard/agency?checkout=success&plan=${product}`
        : `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&product=${product}`,
      cancel_url: isAgency
        ? `${baseUrl}/fuer-agenturen`
        : `${baseUrl}/checkout?plan=${product}`,
      locale: 'de',
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Checkout] Stripe error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
