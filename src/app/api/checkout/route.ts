import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

const ONE_TIME_PRICES: Record<string, number> = {
  impressum: 1900,
  starter: 7900,
  professional: 14900,
};

const ONE_TIME_NAMES: Record<string, string> = {
  impressum: 'Dataquard Impressum',
  starter: 'Dataquard Starter',
  professional: 'Dataquard Professional',
};

export async function POST(req: NextRequest) {
  try {
    const { product, userId, userEmail } = await req.json();
    const plan = product as string;

    if (!plan) {
      return NextResponse.json({ error: 'Ungültiges Produkt' }, { status: 400 });
    }

    const baseUrl = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    console.log('baseUrl:', baseUrl);

    let line_items: Stripe.Checkout.SessionCreateParams.LineItem[];
    let mode: Stripe.Checkout.SessionCreateParams.Mode;

    if (plan === 'ai-trust') {
      line_items = [{
        price_data: {
          currency: 'chf',
          product_data: {
            name: 'Dataquard AI-Trust Abo',
            description: 'Laufende KI-Überwachung (250 Bilder): Deepfake-Erkennung, EU AI Act Art. 50, Shield-Badge, E-Mail-Alerts, Quartals-Report',
          },
          unit_amount: 9900,
          recurring: { interval: 'year' },
        },
        quantity: 1,
      }];
      mode = 'subscription';
    } else if (ONE_TIME_PRICES[plan]) {
      line_items = [{
        price_data: {
          currency: 'chf',
          product_data: {
            name: ONE_TIME_NAMES[plan],
            description: 'Dataquard – Website Compliance & Health Check',
          },
          unit_amount: ONE_TIME_PRICES[plan],
        },
        quantity: 1,
      }];
      mode = 'payment';
    } else {
      return NextResponse.json({ error: 'Ungültiges Produkt' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode,
      ...(userEmail ? { customer_email: userEmail } : {}),
      metadata: {
        product: plan,
        ...(userId ? { user_id: userId } : {}),
      },
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&product=${plan}`,
      cancel_url: `${baseUrl}/checkout?product=${plan}`,
      locale: 'de',
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Stripe error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
