// src/app/api/checkout/route.ts
// Erstellt Stripe Checkout Sessions für Jahresabos (Starter / Professional)
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Pläne mit zugehöriger Env-Var für die Stripe Price ID
const PLANS: Record<string, { envVar: string; name: string }> = {
  starter: {
    envVar: 'STRIPE_STARTER_PRICE_ID',
    name: 'Dataquard Starter',
  },
  professional: {
    envVar: 'STRIPE_PRO_PRICE_ID',
    name: 'Dataquard Professional',
  },
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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      // Jahresabo – recurring subscription
      mode: 'subscription',
      ...(userEmail ? { customer_email: userEmail } : {}),
      metadata: {
        plan: product,
        ...(userId ? { user_id: userId } : {}),
      },
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&product=${product}`,
      cancel_url: `${baseUrl}/checkout?plan=${product}`,
      locale: 'de',
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Checkout] Stripe error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
