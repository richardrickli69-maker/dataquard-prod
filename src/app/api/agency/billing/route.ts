/**
 * Agency Billing API
 * GET /api/agency/billing → Stripe-Daten für Billing-Tab (Subscription, Zahlungsmethode, Invoices)
 */
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { cookies } from 'next/headers';

async function createSupabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );
}

export async function GET(request: NextRequest) {
  try {
    // Auth prüfen
    const supabase = await createSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // Fallback: Bearer Token aus Header
    let resolvedUser = user;
    if (authError || !resolvedUser) {
      const token = request.headers.get('Authorization')?.replace('Bearer ', '');
      if (token) {
        const { data } = await supabaseAdmin.auth.getUser(token);
        resolvedUser = data.user ?? null;
      }
    }

    if (!resolvedUser) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    // Agency-Account laden
    const { data: agency, error: agencyError } = await supabaseAdmin
      .from('agency_accounts')
      .select('id, plan, status, stripe_customer_id, stripe_subscription_id, current_period_end, max_domains')
      .eq('user_id', resolvedUser.id)
      .single();

    if (agencyError || !agency) {
      return NextResponse.json({ error: 'Kein Agency-Account gefunden' }, { status: 404 });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ error: 'Stripe nicht konfiguriert' }, { status: 500 });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2026-02-25.clover' });

    // Stripe Subscription laden für aktuelle Daten
    let currentPeriodEnd: string | null = agency.current_period_end ?? null;
    let paymentMethodLast4: string | null = null;
    let paymentMethodBrand: string | null = null;
    let customerPortalUrl: string | null = null;

    if (agency.stripe_subscription_id) {
      try {
        const stripeSub = await stripe.subscriptions.retrieve(
          agency.stripe_subscription_id,
          { expand: ['default_payment_method'] }
        ) as unknown as {
          current_period_end: number;
          default_payment_method?: {
            card?: { last4: string; brand: string };
          } | null;
          status: string;
        };

        // current_period_end × 1000 für JavaScript Date
        if (stripeSub.current_period_end && stripeSub.current_period_end > 0) {
          currentPeriodEnd = new Date(stripeSub.current_period_end * 1000).toISOString();

          // Supabase synchron halten
          await supabaseAdmin.from('agency_accounts')
            .update({ current_period_end: currentPeriodEnd })
            .eq('id', agency.id);
        }

        // Zahlungsmethode aus Subscription
        if (stripeSub.default_payment_method?.card) {
          paymentMethodLast4 = stripeSub.default_payment_method.card.last4;
          paymentMethodBrand = stripeSub.default_payment_method.card.brand;
        }
      } catch (stripeErr) {
        console.error('[Billing] Stripe Subscription laden fehlgeschlagen:', stripeErr instanceof Error ? stripeErr.message : stripeErr);
      }
    }

    // Zahlungsmethode aus Customer laden falls noch nicht vorhanden
    if (!paymentMethodLast4 && agency.stripe_customer_id) {
      try {
        const paymentMethods = await stripe.paymentMethods.list({
          customer: agency.stripe_customer_id,
          type: 'card',
          limit: 1,
        });
        const pm = paymentMethods.data[0];
        if (pm?.card) {
          paymentMethodLast4 = pm.card.last4;
          paymentMethodBrand = pm.card.brand;
        }
      } catch (pmErr) {
        console.error('[Billing] PaymentMethod laden fehlgeschlagen:', pmErr instanceof Error ? pmErr.message : pmErr);
      }
    }

    // Customer Portal URL generieren
    if (agency.stripe_customer_id) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.dataquard.ch';
        const portal = await stripe.billingPortal.sessions.create({
          customer: agency.stripe_customer_id,
          return_url: `${baseUrl}/dashboard/agency`,
        });
        customerPortalUrl = portal.url;
      } catch (portalErr) {
        console.error('[Billing] Customer Portal URL Fehler:', portalErr instanceof Error ? portalErr.message : portalErr);
      }
    }

    // Document Pack Domains zählen
    const { count: docPackCount } = await supabaseAdmin
      .from('agency_domains')
      .select('id', { count: 'exact', head: true })
      .eq('agency_id', agency.id)
      .eq('document_pack_enabled', true);

    // Planpreise (inkl. Advokatur-Partnerschaft)
    const planPrices: Record<string, number> = {
      agency_basic:      79,
      agency_pro:        179,
      agency_enterprise: 349,
      advokatur:         149,
    };
    const planPrice     = planPrices[agency.plan] ?? 0;
    const docPackTotal  = (docPackCount ?? 0) * 9;
    const totalMonthly  = planPrice + docPackTotal;

    return NextResponse.json({
      plan:              agency.plan,
      status:            agency.status,
      maxDomains:        agency.max_domains,
      planPrice,
      docPackDomains:    docPackCount ?? 0,
      docPackTotal,
      totalMonthly,
      currentPeriodEnd,
      paymentMethodLast4,
      paymentMethodBrand,
      customerPortalUrl,
    });
  } catch (err) {
    console.error('[Billing] Fehler:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 });
  }
}
