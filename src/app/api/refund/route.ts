// src/app/api/refund/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'richard.rickli69@gmail.com';

export async function POST(req: NextRequest) {
  try {
    // Admin-Check: Bearer Token aus Authorization-Header validieren
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
    }
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user || user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 });
    }

    const { payment_intent_id, reason } = await req.json();

    if (!payment_intent_id) {
      return NextResponse.json(
        { error: 'Payment Intent ID ist erforderlich' },
        { status: 400 }
      );
    }

    // Payment Intent abrufen und Datum prüfen
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
    const purchaseDate = new Date(paymentIntent.created * 1000);
    const daysSincePurchase = Math.floor((Date.now() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSincePurchase > 14) {
      return NextResponse.json(
        { error: `Rückerstattungsfrist von 14 Tagen abgelaufen (Kauf vor ${daysSincePurchase} Tagen)` },
        { status: 400 }
      );
    }

    // Rückerstattung über Stripe auslösen
    const refund = await stripe.refunds.create({
      payment_intent: payment_intent_id,
      reason: 'requested_by_customer',
    });

    // Supabase-Datensatz aktualisieren
    const customerEmail =
      paymentIntent.receipt_email ||
      (paymentIntent.metadata as Record<string, string>)?.email ||
      '';

    if (customerEmail) {
      await supabase
        .from('subscriptions')
        .update({
          plan: null,
          ai_trust_active: false,
          refunded_at: new Date().toISOString(),
          refund_reason: reason || 'Geld-zurück-Garantie (14 Tage)',
        })
        .eq('email', customerEmail);
    }

    return NextResponse.json({
      success: true,
      refund_id: refund.id,
      status: refund.status,
      amount: refund.amount / 100,
      currency: 'CHF',
      customer_email: customerEmail,
    });
  } catch (error) {
    console.error('[api/refund] Fehler:', error);
    const message = error instanceof Error ? error.message : 'Rückerstattung fehlgeschlagen';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
