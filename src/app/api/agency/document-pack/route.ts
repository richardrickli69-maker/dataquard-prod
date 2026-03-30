/**
 * Agency Document Pack API
 * PUT /api/agency/document-pack → Document Pack für Domain toggle + Stripe Quantity updaten
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

export async function PUT(request: NextRequest) {
  try {
    // Auth prüfen
    const supabase = await createSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

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

    const { domainId, enabled } = await request.json() as {
      domainId: string;
      enabled: boolean;
    };

    if (!domainId || typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'domainId und enabled sind Pflichtfelder' }, { status: 400 });
    }

    // Agency-Account laden (für Sicherheitscheck + Stripe-Daten)
    const { data: agency, error: agencyError } = await supabaseAdmin
      .from('agency_accounts')
      .select('id, stripe_customer_id, stripe_subscription_id, doc_pack_stripe_item_id, plan')
      .eq('user_id', resolvedUser.id)
      .single();

    if (agencyError || !agency) {
      return NextResponse.json({ error: 'Kein Agency-Account gefunden' }, { status: 404 });
    }

    // Domain gehört zu diesem Agency-Account prüfen
    const { data: domain, error: domainError } = await supabaseAdmin
      .from('agency_domains')
      .select('id, agency_id, document_pack_enabled')
      .eq('id', domainId)
      .eq('agency_id', agency.id)
      .single();

    if (domainError || !domain) {
      return NextResponse.json({ error: 'Domain nicht gefunden oder kein Zugriff' }, { status: 404 });
    }

    // Supabase: document_pack_enabled aktualisieren
    const { error: updateErr } = await supabaseAdmin
      .from('agency_domains')
      .update({ document_pack_enabled: enabled })
      .eq('id', domainId);

    if (updateErr) {
      console.error('[DocPack] Supabase Update Fehler:', updateErr.message);
      return NextResponse.json({ error: 'Datenbankfehler' }, { status: 500 });
    }

    // Neue Anzahl aktiver Document-Pack-Domains zählen
    const { count: newCount } = await supabaseAdmin
      .from('agency_domains')
      .select('id', { count: 'exact', head: true })
      .eq('agency_id', agency.id)
      .eq('document_pack_enabled', true);

    const activeCount = newCount ?? 0;

    // Stripe: Subscription Quantity aktualisieren (nur wenn Stripe konfiguriert)
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const docPackPriceId = process.env.STRIPE_DOC_PACK_PRICE_ID;

    if (stripeKey && docPackPriceId && agency.stripe_subscription_id) {
      try {
        const stripe = new Stripe(stripeKey, { apiVersion: '2026-02-25.clover' });
        const subscription = await stripe.subscriptions.retrieve(agency.stripe_subscription_id) as unknown as {
          id: string;
          items: { data: Array<{ id: string; price: { id: string }; quantity: number }> };
        };

        // Prüfen ob Document Pack bereits als Subscription Item vorhanden
        const existingItem = subscription.items.data.find(
          item => item.price.id === docPackPriceId
        );

        if (activeCount === 0) {
          // Kein aktives Document Pack mehr → Item entfernen (falls vorhanden)
          if (existingItem) {
            await stripe.subscriptionItems.del(existingItem.id, {
              proration_behavior: 'always_invoice',
            });
            // doc_pack_stripe_item_id in agency_accounts löschen
            await supabaseAdmin.from('agency_accounts')
              .update({ doc_pack_stripe_item_id: null })
              .eq('id', agency.id);
          }
        } else if (existingItem) {
          // Item vorhanden → Quantity aktualisieren
          await stripe.subscriptionItems.update(existingItem.id, {
            quantity: activeCount,
            proration_behavior: 'always_invoice',
          });
        } else {
          // Item noch nicht vorhanden → hinzufügen
          const newItem = await stripe.subscriptionItems.create({
            subscription: agency.stripe_subscription_id,
            price: docPackPriceId,
            quantity: activeCount,
            proration_behavior: 'always_invoice',
          });
          // Item-ID für spätere Updates in Supabase speichern
          await supabaseAdmin.from('agency_accounts')
            .update({ doc_pack_stripe_item_id: newItem.id })
            .eq('id', agency.id);
        }
      } catch (stripeErr) {
        // Stripe-Fehler loggen aber nicht den User blockieren (Supabase ist bereits aktuell)
        console.error('[DocPack] Stripe Update Fehler:', stripeErr instanceof Error ? stripeErr.message : stripeErr);
      }
    }

    const docPackTotal = activeCount * 9;

    return NextResponse.json({
      success: true,
      domainId,
      enabled,
      activeDocPackDomains: activeCount,
      docPackTotal,
    });
  } catch (err) {
    console.error('[DocPack] Fehler:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 });
  }
}
