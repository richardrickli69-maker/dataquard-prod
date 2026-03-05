/**
 * Stripe Webhook Handler
 * POST /api/webhooks/stripe
 *
 * Empfängt und verarbeitet Stripe-Events nach erfolgreicher Zahlung.
 * Env-Vars erforderlich:
 *   STRIPE_SECRET_KEY
 *   STRIPE_WEBHOOK_SECRET  ← Stripe Dashboard → Webhooks → Signing Secret
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

const PLAN_MAP: Record<string, string> = {
  starter: 'starter',
  professional: 'professional',
  impressum: 'impressum',
};

export async function POST(request: NextRequest) {
  console.log('[Webhook] Request received');
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('[Webhook] STRIPE_WEBHOOK_SECRET nicht gesetzt');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  // Signatur verifizieren
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[Webhook] Signatur-Verifikation fehlgeschlagen:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Nur checkout.session.completed verarbeiten
  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const product = session.metadata?.product;
  const userId = session.metadata?.user_id;
  const customerEmail = session.customer_details?.email ?? session.customer_email;

  if (!product) {
    console.error('[Webhook] Kein product in metadata:', session.id);
    return NextResponse.json({ error: 'Missing product metadata' }, { status: 400 });
  }

  const plan = PLAN_MAP[product] ?? product;

  try {
    const { supabaseAdmin } = await import('@/lib/supabaseAdmin');

    // User-ID ermitteln: aus metadata oder per E-Mail-Lookup
    let resolvedUserId = userId ?? null;

    if (!resolvedUserId && customerEmail) {
      const { data } = await supabaseAdmin.auth.admin.listUsers();
      const match = data?.users?.find((u) => u.email === customerEmail);
      if (match) resolvedUserId = match.id;
    }

    if (!resolvedUserId) {
      console.error('[Webhook] User nicht gefunden – session:', session.id, 'email:', customerEmail);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 1. Subscription in "subscriptions" Tabelle anlegen/aktualisieren
    await supabaseAdmin.from('subscriptions').upsert({
      user_id: resolvedUserId,
      plan,
      status: 'active',
      stripe_customer_id: typeof session.customer === 'string' ? session.customer : null,
      created_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    // 2. subscription_tier in "users" Tabelle setzen (falls vorhanden)
    const tierMap: Record<string, string> = {
      starter: 'STARTER',
      professional: 'PROFESSIONAL',
      impressum: 'IMPRESSUM',
    };
    const { error: userUpdateError } = await supabaseAdmin
      .from('users')
      .update({ subscription_tier: tierMap[plan] ?? plan.toUpperCase() })
      .eq('id', resolvedUserId);
    if (userUpdateError) {
      // Tabelle existiert möglicherweise nicht – kein fataler Fehler
      console.warn('[Webhook] users-Update übersprungen:', userUpdateError.message);
    }

    // 3. rescan_enabled = true für alle Scans des Users (nur bei paid plans)
    if (plan !== 'impressum') {
      await supabaseAdmin
        .from('scans')
        .update({ rescan_enabled: true })
        .eq('user_id', resolvedUserId);
    }

    console.log(`[Webhook] ✅ User ${resolvedUserId} → Plan "${plan}" aktiviert`);
    return NextResponse.json({ received: true });

  } catch (err) {
    console.error('[Webhook] Fehler:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
