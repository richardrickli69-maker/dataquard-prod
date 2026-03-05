import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

const PRICES = {
  impressum: 1900,   // CHF 19.00 in Rappen
  starter: 7900,     // CHF 79.00 in Rappen
  professional: 14900, // CHF 149.00 in Rappen
};

const PRODUCT_NAMES = {
  impressum: 'Dataquard Impressum',
  starter: 'Dataquard Starter',
  professional: 'Dataquard Professional',
};

export async function POST(req: NextRequest) {
  try {
    const { product, userId, userEmail } = await req.json();

    if (!product || !PRICES[product as keyof typeof PRICES]) {
      return NextResponse.json({ error: 'Ungültiges Produkt' }, { status: 400 });
    }

    const baseUrl = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'chf',
            product_data: {
              name: PRODUCT_NAMES[product as keyof typeof PRODUCT_NAMES],
              description: 'Dataquard – Website Compliance & Health Check',
            },
            unit_amount: PRICES[product as keyof typeof PRICES],
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      ...(userEmail ? { customer_email: userEmail } : {}),
      metadata: {
        product,
        ...(userId ? { user_id: userId } : {}),
      },
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&product=${product}`,
      cancel_url: `${baseUrl}/checkout?product=${product}`,
      locale: 'de',
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Stripe error:', message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
