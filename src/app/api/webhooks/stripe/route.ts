/**
 * Stripe Webhook Handler
 * POST /api/webhooks/stripe
 *
 * Behandelte Events:
 *   checkout.session.completed   – Jahresabo Starter/Professional aktiviert
 *   customer.subscription.updated – Plan-Änderung oder Verlängerung
 *   customer.subscription.deleted – Abo gekündigt → status: 'cancelled'
 *   invoice.payment_failed        – Zahlung fehlgeschlagen → status: 'past_due'
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { logAudit } from '@/lib/audit';
import { generateInvoicePdf } from '@/lib/generateInvoicePdf';
import { generateInstallationPdf } from '@/lib/generateInstallationPdf';
import { generateAgencyInvoicePdf } from '@/lib/generateAgencyInvoicePdf';
import { generateAgencyGuidePdf } from '@/lib/generateAgencyGuidePdf';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

const resend = new Resend(process.env.RESEND_API_KEY!);

const HANDLED_EVENTS = new Set([
  'checkout.session.completed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_failed',
  'invoice.paid',
]);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('[Webhook] STRIPE_WEBHOOK_SECRET nicht gesetzt');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[Webhook] Signatur-Verifikation fehlgeschlagen:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (!HANDLED_EVENTS.has(event.type)) {
    return NextResponse.json({ received: true });
  }

  const { supabaseAdmin } = await import('@/lib/supabaseAdmin');

  try {
    // ─── checkout.session.completed ────────────────────────────────────────────
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      // Nur Subscription-Mode handeln (kein payment-mode mehr)
      if (session.mode !== 'subscription') {
        console.log('[Webhook] Nicht-Subscription Session ignoriert:', session.id);
        return NextResponse.json({ received: true });
      }

      // metadata.plan (neue Sessions) oder metadata.product (alte Sessions, Fallback)
      const plan = session.metadata?.plan ?? session.metadata?.product;
      const userId = session.metadata?.user_id;
      const customerEmail = session.customer_details?.email ?? session.customer_email;
      const amountTotal = (session.amount_total ?? 0) / 100;
      const currency = session.currency?.toUpperCase() ?? 'CHF';
      const createdAt = new Date(session.created * 1000);

      if (!plan) {
        console.error('[Webhook] Kein Plan in metadata:', session.id);
        return NextResponse.json({ error: 'Kein Plan in metadata' }, { status: 400 });
      }

      // ── Agency-Pläne: eigener Branch (inkl. Advokatur-Partnerschaft) ─────
      const isAgencyPlan = session.metadata?.plan_type === 'agency' ||
        plan === 'agency_basic' || plan === 'agency_pro' || plan === 'agency_enterprise' ||
        plan === 'advokatur';

      if (isAgencyPlan) {
        const agencyResult = await handleAgencyCheckout({ session, plan, stripe });
        return agencyResult;
      }

      // ── Ab hier: nur KMU-Pläne ────────────────────────────────────────────
      if (plan !== 'starter' && plan !== 'professional') {
        console.error('[Webhook] Unbekannter KMU-Plan in metadata:', plan, session.id);
        return NextResponse.json({ error: 'Unbekannter Plan' }, { status: 400 });
      }

      // User-ID per E-Mail auflösen falls nicht in Metadata
      let resolvedUserId = userId ?? null;
      if (!resolvedUserId && customerEmail) {
        const { data } = await supabaseAdmin.auth.admin.listUsers();
        const match = data?.users?.find((u) => u.email === customerEmail);
        if (match) resolvedUserId = match.id;
      }

      // Stripe Subscription-ID und current_period_end holen
      const stripeSubscriptionId = typeof session.subscription === 'string'
        ? session.subscription
        : (session.subscription as Stripe.Subscription | null)?.id ?? null;

      // current_period_end × 1000 für JavaScript Date (UNIX → ms)
      const fallbackExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      let currentPeriodEnd: Date = fallbackExpiry;
      if (stripeSubscriptionId) {
        const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId) as unknown as { current_period_end?: number | null };
        const ts = stripeSub.current_period_end;
        if (ts && ts > 0) {
          const parsed = new Date(ts * 1000);
          currentPeriodEnd = isNaN(parsed.getTime()) ? fallbackExpiry : parsed;
        } else {
          console.warn('[Webhook] current_period_end fehlt – Fallback +1 Jahr');
        }
      }

      // Supabase subscriptions aktualisieren (upsert nach user_id oder E-Mail)
      const { error: upsertErr } = await supabaseAdmin.from('subscriptions').upsert({
        ...(resolvedUserId ? { user_id: resolvedUserId } : {}),
        email: customerEmail ?? null,
        plan,
        status: 'active',
        stripe_session_id: session.id,
        stripe_customer_id: typeof session.customer === 'string' ? session.customer : null,
        stripe_subscription_id: stripeSubscriptionId,
        current_period_end: currentPeriodEnd.toISOString(),
        interval: 'year',
        amount: amountTotal,
        currency,
        purchased_at: createdAt.toISOString(),
        created_at: new Date().toISOString(),
        // KI-Bilder-Kontingent je Plan
        ai_images_limit: plan === 'professional' ? 250 : 50,
        ai_images_scanned: 0,
        ai_images_reset_at: new Date().toISOString(),
      }, { onConflict: resolvedUserId ? 'user_id' : 'email' });

      if (upsertErr) {
        console.error('[Webhook] subscriptions-Upsert Fehler:', upsertErr.message);
      }

      // users-Tabelle aktualisieren
      if (resolvedUserId) {
        const { error: userErr } = await supabaseAdmin.from('users')
          .upsert({ id: resolvedUserId, email: customerEmail ?? '', plan }, { onConflict: 'id' });
        if (userErr) console.warn('[Webhook] users-Upsert Fehler:', userErr.message);

        // Rescan aktivieren
        await supabaseAdmin.from('scans').update({ rescan_enabled: true }).eq('user_id', resolvedUserId);
      }

      // Rechnung per E-Mail versenden
      if (customerEmail) {
        const planLabel = plan === 'professional' ? 'Professional' : 'Starter';
        const invoiceNumber = `DQ-${createdAt.getFullYear()}-${session.id.slice(-6).toUpperCase()}`;
        const formattedDate = createdAt.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const nextBillingDate = currentPeriodEnd.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });

        const descriptionMap: Record<string, string> = {
          starter: 'Datenschutzerklärung + Impressum + Cookie-Banner Generator + AI-Trust Scan (1 Domain) · Jahresabo',
          professional: 'Datenschutzerklärung + Impressum + Cookie-Banner (5 Domains) + AI-Trust Scan · Jahresabo',
        };

        try {
          const [pdfBuffer, installationPdfBuffer] = await Promise.all([
            generateInvoicePdf({
              invoiceNumber,
              date: formattedDate,
              product: `Dataquard ${planLabel}`,
              description: descriptionMap[plan] ?? 'Dataquard Jahresabo',
              amount: amountTotal,
              customerEmail,
              mode: 'subscription',
              subscriptionEndsAt: nextBillingDate,
            }),
            generateInstallationPdf({ planLabel, customerEmail, isAiTrust: false }),
          ]);

          const { error: emailError } = await resend.emails.send({
            from: 'Dataquard <info@dataquard.ch>',
            to: customerEmail,
            subject: `Ihr ${planLabel}-Abo ist aktiv – Dataquard`,
            html: generateSubscriptionEmailHtml({ planLabel, amount: amountTotal, currency, invoiceNumber, formattedDate, nextBillingDate, userEmail: customerEmail }),
            attachments: [
              { filename: `Dataquard-Rechnung-${invoiceNumber}.pdf`, content: pdfBuffer },
              { filename: `Dataquard-Einrichtungsanleitung.pdf`, content: installationPdfBuffer },
            ],
          });

          if (emailError) console.error('[Webhook] Resend Fehler:', emailError);
        } catch (emailErr) {
          console.error('[Webhook] E-Mail-Versand fehlgeschlagen:', emailErr instanceof Error ? emailErr.message : emailErr);
        }
      }

      if (resolvedUserId) {
        await logAudit({ user_id: resolvedUserId, action: 'purchase', resource: plan, details: { stripe_subscription_id: stripeSubscriptionId } });
      }

      console.log(`[Webhook] ✅ Abo "${plan}" aktiviert für ${resolvedUserId ?? customerEmail}`);
      return NextResponse.json({ received: true });
    }

    // ─── customer.subscription.updated ─────────────────────────────────────────
    if (event.type === 'customer.subscription.updated') {
      const sub = event.data.object as unknown as {
        id: string;
        customer: string | null;
        status: string;
        current_period_end?: number | null;
        metadata?: { plan?: string };
      };

      const customerId = typeof sub.customer === 'string' ? sub.customer : null;
      const isActive = sub.status === 'active' || sub.status === 'trialing';
      const cpeTs = sub.current_period_end;
      const cpeRaw = cpeTs && cpeTs > 0 ? new Date(cpeTs * 1000) : null;
      const currentPeriodEnd = (cpeRaw && !isNaN(cpeRaw.getTime()))
        ? cpeRaw
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

      // Status gemäss Stripe setzen: active, past_due, cancelled etc.
      const dbStatus: string = isActive ? 'active' : sub.status === 'past_due' ? 'past_due' : 'cancelled';

      if (customerId) {
        // KMU-Subscriptions aktualisieren
        const { error: updErr } = await supabaseAdmin.from('subscriptions')
          .update({
            status: dbStatus,
            current_period_end: currentPeriodEnd.toISOString(),
            stripe_subscription_id: sub.id,
          })
          .eq('stripe_customer_id', customerId);

        if (updErr) console.error('[Webhook] subscription.updated KMU DB error:', updErr.message);

        // Agency-Accounts aktualisieren (falls vorhanden)
        const { error: agencyUpdErr } = await supabaseAdmin.from('agency_accounts')
          .update({
            status: dbStatus as 'active' | 'cancelled' | 'past_due',
            current_period_end: currentPeriodEnd.toISOString(),
          })
          .eq('stripe_customer_id', customerId);

        if (agencyUpdErr) console.error('[Webhook] subscription.updated Agency DB error:', agencyUpdErr.message);

        console.log(`[Webhook] Abo aktualisiert: customer=${customerId}, status=${dbStatus}, expires=${currentPeriodEnd.toISOString()}`);
      }

      return NextResponse.json({ received: true });
    }

    // ─── customer.subscription.deleted ─────────────────────────────────────────
    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as unknown as {
        id: string;
        customer: string | null;
        current_period_end?: number | null;
        cancel_at?: number | null;
        canceled_at?: number | null;
        metadata?: Record<string, string>;
        items?: {
          data: Array<{ price: { product: string | { name?: string } | null } }>;
        };
      };
      const customerId = typeof sub.customer === 'string' ? sub.customer : null;

      // Laufzeitende aus Stripe Event — Fallback-Kette: current_period_end → cancel_at → canceled_at
      const periodEndTs = sub.current_period_end || sub.cancel_at || sub.canceled_at || null;
      const periodEndFormatted = periodEndTs && periodEndTs > 0
        ? new Date(periodEndTs * 1000).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : null;

      if (customerId) {
        // KMU-Subscriptions deaktivieren
        const { error: delErr } = await supabaseAdmin.from('subscriptions')
          .update({ status: 'cancelled' })
          .eq('stripe_customer_id', customerId);

        if (delErr) console.error('[Webhook] subscription.deleted KMU DB error:', delErr.message);

        // Agency-Account deaktivieren (falls vorhanden)
        const { error: agencyDelErr } = await supabaseAdmin.from('agency_accounts')
          .update({ status: 'cancelled' })
          .eq('stripe_customer_id', customerId);

        if (agencyDelErr) console.error('[Webhook] subscription.deleted Agency DB error:', agencyDelErr.message);

        // ── Plan und Kunden-E-Mail für Kündigungs-Benachrichtigungen ermitteln ──
        let planKey: string | null = null;
        let customerEmail: string | null = null;

        // Zuerst KMU-Subscriptions prüfen (hat email-Spalte)
        const { data: subData } = await supabaseAdmin
          .from('subscriptions')
          .select('plan, email')
          .eq('stripe_customer_id', customerId)
          .maybeSingle();
        if (subData) {
          planKey = (subData.plan as string | null) ?? null;
          customerEmail = (subData.email as string | null) ?? null;
        }

        // Falls nicht gefunden: Agency-Accounts prüfen (kein email, hat user_id)
        if (!planKey) {
          const { data: agencyData } = await supabaseAdmin
            .from('agency_accounts')
            .select('plan, user_id')
            .eq('stripe_customer_id', customerId)
            .maybeSingle();
          if (agencyData) {
            planKey = (agencyData.plan as string | null) ?? null;
            if (agencyData.user_id) {
              const { data: userData } = await supabaseAdmin
                .from('users')
                .select('email')
                .eq('id', agencyData.user_id)
                .maybeSingle();
              customerEmail = (userData?.email as string | null) ?? null;
            }
          }
        }

        // Fallback: E-Mail aus Stripe Customer-Objekt holen
        if (!customerEmail) {
          try {
            const stripeCustomer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
            customerEmail = stripeCustomer.email ?? null;
          } catch {
            console.error('[Webhook] Stripe Customer konnte nicht geladen werden:', customerId);
          }
        }

        // Fallback: Plan aus Stripe Subscription ermitteln (Metadata → Product-Name)
        if (!planKey) {
          try {
            // Schritt 1: Metadata direkt aus dem Event-Objekt
            const metaPlan = sub.metadata?.plan ?? null;
            if (metaPlan) {
              planKey = metaPlan;
            } else {
              // Schritt 2: Vollständige Subscription abrufen (inkl. Product)
              const stripeSub = await stripe.subscriptions.retrieve(sub.id, {
                expand: ['items.data.price.product'],
              }) as Stripe.Subscription & {
                metadata?: Record<string, string>;
                items: { data: Array<{ price: { product: Stripe.Product | string | null } }> };
              };
              if (stripeSub.metadata?.plan) {
                // metadata.plan wurde beim Checkout gesetzt
                planKey = stripeSub.metadata.plan;
              } else {
                // Schritt 3: Product-Name als letzter Fallback
                const product = stripeSub.items?.data?.[0]?.price?.product;
                if (product && typeof product === 'object' && 'name' in product) {
                  planKey = (product as Stripe.Product).name ?? null;
                }
              }
            }
          } catch (stripeSubErr) {
            console.error('[Webhook] Plan-Fallback via Stripe Subscription fehlgeschlagen:', stripeSubErr instanceof Error ? stripeSubErr.message : stripeSubErr);
          }
        }

        const planLabelStr   = planKey ? getCancellationPlanLabel(planKey) : 'Unbekannt';
        const planCategoryStr = planKey ? getCancellationPlanCategory(planKey) : 'Unbekannt';
        const nowFormatted   = new Date().toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });

        // ── Admin-Benachrichtigung (eigener try/catch) ─────────────────────────
        try {
          await resend.emails.send({
            from: 'Dataquard <info@dataquard.ch>',
            to: 'info@dataquard.ch',
            subject: `Kündigung: ${customerEmail ?? customerId} hat ${planLabelStr} gekündigt`,
            html: generateCancellationAdminEmailHtml({
              customerEmail: customerEmail ?? customerId,
              planLabel:     planLabelStr,
              planCategory:  planCategoryStr,
              customerId,
              cancelledAt:   nowFormatted,
              periodEnd:     periodEndFormatted ?? '–',
            }),
          });
        } catch (adminEmailErr) {
          console.error('[Webhook] Admin-Kündigungs-E-Mail fehlgeschlagen:', adminEmailErr instanceof Error ? adminEmailErr.message : adminEmailErr);
        }

        // ── Kunden-Bestätigung (eigener try/catch) ─────────────────────────────
        if (customerEmail) {
          try {
            const returnUrl = planKey ? getCancellationReturnUrl(planKey) : 'https://www.dataquard.ch/preise';
            await resend.emails.send({
              from:    'Dataquard <info@dataquard.ch>',
              to:      customerEmail,
              replyTo: 'support@dataquard.ch',
              subject: 'Ihre Kündigung bei Dataquard wurde bestätigt',
              html:    generateCancellationCustomerEmailHtml({
                planLabel:       planLabelStr,
                planKey:         planKey ?? '',
                periodEnd:       periodEndFormatted ?? '–',
                returnUrl,
              }),
            });
          } catch (custEmailErr) {
            console.error('[Webhook] Kunden-Kündigungs-E-Mail fehlgeschlagen:', custEmailErr instanceof Error ? custEmailErr.message : custEmailErr);
          }
        }

        console.log(`[Webhook] Abo gekündigt: customer=${customerId}, plan=${planKey ?? 'unbekannt'}`);
      }

      return NextResponse.json({ received: true });
    }

    // ─── invoice.payment_failed ─────────────────────────────────────────────────
    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object as Stripe.Invoice;
      const customerEmail = typeof invoice.customer_email === 'string' ? invoice.customer_email : null;
      const customerId = typeof invoice.customer === 'string' ? invoice.customer : null;

      // Status auf past_due setzen
      if (customerId) {
        const { error: pdErr } = await supabaseAdmin.from('subscriptions')
          .update({ status: 'past_due' })
          .eq('stripe_customer_id', customerId);
        if (pdErr) console.error('[Webhook] past_due update error:', pdErr.message);
      }

      // Kundin per E-Mail benachrichtigen
      if (customerEmail) {
        await resend.emails.send({
          from: 'Dataquard <info@dataquard.ch>',
          to: customerEmail,
          subject: '⚠️ Zahlung fehlgeschlagen – Dataquard Abo',
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px;">
            <h2 style="color:#1a1a2e;">Zahlung fehlgeschlagen</h2>
            <p style="color:#555566;">Die Zahlung für Ihr Dataquard-Abo konnte nicht verarbeitet werden. Bitte aktualisieren Sie Ihre Zahlungsmethode um Ihren Zugang nicht zu verlieren.</p>
            <a href="https://www.dataquard.ch/dashboard" style="display:inline-block;background:#22c55e;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;">Zahlungsmethode aktualisieren →</a>
            <p style="color:#888899;font-size:12px;margin-top:24px;">Dataquard · Reinach BL, Schweiz · <a href="https://www.dataquard.ch" style="color:#888899;">dataquard.ch</a></p>
          </div>`,
        });
        console.log(`[Webhook] Zahlungsfehlschlag-E-Mail gesendet an: ${customerEmail}`);
      }

      return NextResponse.json({ received: true });
    }

    // ─── invoice.paid ────────────────────────────────────────────────────────────
    // Wird bei jeder erfolgreichen Jahresverlängerung ausgelöst → Kontingent zurücksetzen
    if (event.type === 'invoice.paid') {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = typeof invoice.customer === 'string' ? invoice.customer : null;

      if (customerId) {
        const { error: resetErr } = await supabaseAdmin.from('subscriptions')
          .update({
            ai_images_scanned: 0,
            ai_images_reset_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId)
          .eq('status', 'active');

        if (resetErr) {
          console.error('[Webhook] invoice.paid Reset Fehler:', resetErr.message);
        } else {
          console.log(`[Webhook] KI-Bilder-Kontingent zurückgesetzt für customer=${customerId}`);
        }
      }

      return NextResponse.json({ received: true });
    }

  } catch (err) {
    console.error('[Webhook] ERROR:', err instanceof Error ? err.message : err);
    console.error('[Webhook] Stack:', err instanceof Error ? err.stack : 'no stack');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// ─── E-Mail Template für Jahresabo ─────────────────────────────────────────────

function generateSubscriptionEmailHtml({
  planLabel, amount, currency, invoiceNumber, formattedDate, nextBillingDate, userEmail,
}: {
  planLabel: string;
  amount: number;
  currency: string;
  invoiceNumber: string;
  formattedDate: string;
  nextBillingDate: string;
  userEmail: string;
}): string {
  const featuresHtml = planLabel === 'Professional' ? `
    <div style="color:#374151;font-size:14px;line-height:2;">
      ✓ &nbsp;Datenschutzerklärung Generator (bis 5 Domains)<br/>
      ✓ &nbsp;Impressum Generator<br/>
      ✓ &nbsp;Cookie-Banner Generator (bis 5 Domains)<br/>
      ✓ &nbsp;AI-Trust Scan inklusive<br/>
      ✓ &nbsp;Monatlicher Compliance-Report
    </div>` : `
    <div style="color:#374151;font-size:14px;line-height:2;">
      ✓ &nbsp;Datenschutzerklärung Generator (1 Domain)<br/>
      ✓ &nbsp;Impressum Generator<br/>
      ✓ &nbsp;Cookie-Banner Generator<br/>
      ✓ &nbsp;AI-Trust Scan inklusive<br/>
      ✓ &nbsp;Monatlicher Compliance-Report
    </div>`;

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Ihr ${planLabel}-Abo ist aktiv – Dataquard</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#0b1829,#0d1f35);padding:32px 40px;text-align:center;">
              <div style="font-size:24px;font-weight:800;letter-spacing:-0.5px;">
                <span style="color:#22c55e;">Data</span><span style="color:#ffffff;">quard</span>
              </div>
              <div style="color:#9ab0c8;font-size:13px;margin-top:4px;">Ihre Website. Rechtssicher.</div>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 40px 24px;text-align:center;">
              <div style="font-size:40px;margin-bottom:16px;">✅</div>
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1a1a2e;">Ihr ${planLabel}-Abo ist aktiv!</h1>
              <p style="margin:0;color:#6b7280;font-size:15px;line-height:1.6;">
                Ihr <strong style="color:#1a1a2e;">Dataquard ${planLabel}-Plan</strong> läuft ab sofort.<br/>
                Rechnung und Einrichtungsanleitung finden Sie im Anhang.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 32px;">
              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px 24px;">
                <div style="font-size:13px;font-weight:700;color:#15803d;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:12px;">
                  Ihr ${planLabel}-Plan beinhaltet
                </div>
                ${featuresHtml}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 32px;text-align:center;">
              <a href="https://www.dataquard.ch/dashboard"
                style="display:inline-block;background:linear-gradient(135deg,#00e676,#00c853);color:#040c1c;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none;">
                Zum Dashboard →
              </a>
              <p style="margin:12px 0 0;color:#9ca3af;font-size:13px;">Angemeldet als ${userEmail}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 32px;">
              <div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
                <div style="background:#f9fafb;padding:12px 20px;border-bottom:1px solid #e5e7eb;">
                  <span style="font-size:13px;font-weight:700;color:#374151;">Rechnungsübersicht</span>
                </div>
                <table width="100%" cellpadding="0" cellspacing="0" style="padding:16px 20px;">
                  <tr>
                    <td style="font-size:13px;color:#6b7280;padding:4px 0;">Rechnungsnummer</td>
                    <td style="font-size:13px;color:#374151;font-weight:600;text-align:right;">${invoiceNumber}</td>
                  </tr>
                  <tr>
                    <td style="font-size:13px;color:#6b7280;padding:4px 0;">Datum</td>
                    <td style="font-size:13px;color:#374151;text-align:right;">${formattedDate}</td>
                  </tr>
                  <tr>
                    <td style="font-size:13px;color:#6b7280;padding:4px 0;">Produkt</td>
                    <td style="font-size:13px;color:#374151;text-align:right;">Dataquard ${planLabel}</td>
                  </tr>
                  <tr>
                    <td style="font-size:13px;color:#6b7280;padding:4px 0;">Art</td>
                    <td style="font-size:13px;color:#374151;text-align:right;">Jahresabo</td>
                  </tr>
                  <tr>
                    <td style="font-size:13px;color:#6b7280;padding:4px 0;">Nächste Verlängerung</td>
                    <td style="font-size:13px;color:#374151;text-align:right;">${nextBillingDate}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="border-top:1px solid #e5e7eb;padding-top:8px;"></td>
                  </tr>
                  <tr>
                    <td style="font-size:14px;font-weight:700;color:#1a1a2e;padding:4px 0;">Total</td>
                    <td style="font-size:14px;font-weight:700;color:#1a1a2e;text-align:right;">${currency} ${amount.toFixed(2)}</td>
                  </tr>
                </table>
              </div>
              <p style="font-size:12px;color:#9ca3af;margin:8px 0 0;text-align:center;">
                Jahresabo · Automatische Verlängerung · Jederzeit kündbar<br/>
                Die vollständige Rechnung mit MwSt.-Aufschlüsselung finden Sie im PDF-Anhang.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 32px;">
              <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px 20px;text-align:center;">
                <div style="font-size:13px;color:#1e40af;">
                  Fragen? Wir helfen gerne weiter:<br/>
                  <a href="mailto:support@dataquard.ch" style="color:#2563eb;font-weight:600;">support@dataquard.ch</a>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                © 2026 Dataquard · Reinach BL, Schweiz<br/>
                <a href="https://www.dataquard.ch/datenschutz" style="color:#9ca3af;">Datenschutz</a>
                &nbsp;·&nbsp;
                <a href="https://www.dataquard.ch/impressum" style="color:#9ca3af;">Impressum</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Agency-Plan Mapping ────────────────────────────────────────────────────

interface AgencyPlanConfig {
  maxDomains: number;
  scanFrequency: 'monthly' | 'weekly';
  whiteLabelEnabled: boolean;
  monthlyAmount: number;
}

const AGENCY_PLAN_CONFIG: Record<string, AgencyPlanConfig> = {
  agency_basic: {
    maxDomains: 15,
    scanFrequency: 'monthly',
    whiteLabelEnabled: false,
    monthlyAmount: 79,
  },
  agency_pro: {
    maxDomains: 50,
    scanFrequency: 'weekly',
    whiteLabelEnabled: true,
    monthlyAmount: 179,
  },
  agency_enterprise: {
    maxDomains: 9999,
    scanFrequency: 'weekly',
    whiteLabelEnabled: true,
    monthlyAmount: 349,
  },
  // Advokatur-Partnerschaft: speziell fuer Anwaltskanzleien
  advokatur: {
    maxDomains: 30,
    scanFrequency: 'weekly',
    whiteLabelEnabled: true,
    monthlyAmount: 149,
  },
};

// ─── Agency Checkout Handler ────────────────────────────────────────────────

async function handleAgencyCheckout({
  session,
  plan,
  stripe,
}: {
  session: Stripe.Checkout.Session;
  plan: string;
  stripe: Stripe;
}): Promise<NextResponse> {
  const { supabaseAdmin } = await import('@/lib/supabaseAdmin');
  const resend = new Resend(process.env.RESEND_API_KEY!);
  const planConfig = AGENCY_PLAN_CONFIG[plan];
  if (!planConfig) {
    console.error('[Webhook] Unbekannter Agency-Plan:', plan, session.id);
    return NextResponse.json({ error: 'Unbekannter Agency-Plan' }, { status: 400 });
  }

  const userId       = session.metadata?.user_id ?? null;
  const customerEmail = session.customer_details?.email ?? session.customer_email ?? null;
  const stripeCustomerId = typeof session.customer === 'string' ? session.customer : null;
  const createdAt    = new Date(session.created * 1000);

  // Stripe Subscription laden für current_period_end
  const stripeSubscriptionId = typeof session.subscription === 'string'
    ? session.subscription
    : (session.subscription as Stripe.Subscription | null)?.id ?? null;

  const fallbackExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  let currentPeriodEnd: Date = fallbackExpiry;

  if (stripeSubscriptionId) {
    const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId) as unknown as { current_period_end?: number | null };
    const ts = stripeSub.current_period_end;
    if (ts && ts > 0) {
      const parsed = new Date(ts * 1000);
      currentPeriodEnd = isNaN(parsed.getTime()) ? fallbackExpiry : parsed;
    }
  }

  // User-ID auflösen — 3-stufige Fallback-Kette
  let resolvedUserId: string | null = userId ?? null;

  // Stufe 1: users-Tabelle nach E-Mail (schnell, keine Pagination)
  if (!resolvedUserId && customerEmail) {
    const { data: usersRow } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', customerEmail)
      .maybeSingle();
    if (usersRow?.id) resolvedUserId = usersRow.id as string;
  }

  // Stufe 2: Auth Admin listUsers paginiert (Fallback)
  if (!resolvedUserId && customerEmail) {
    const { data: authData } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const match = authData?.users?.find((u) => u.email === customerEmail);
    if (match) resolvedUserId = match.id;
  }

  // Stufe 3: Neuen Auth-User anlegen (Gast-Checkout ohne Supabase-Konto)
  if (!resolvedUserId && customerEmail) {
    try {
      const { data: newAuthUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email: customerEmail,
        email_confirm: true,
      });
      if (newAuthUser?.user?.id) {
        resolvedUserId = newAuthUser.user.id;
        console.error('[Webhook] Agency-Checkout: Neuer Auth-User angelegt für', customerEmail);
      } else if (createErr) {
        console.error('[Webhook] Agency-Checkout: createUser fehlgeschlagen:', createErr.message);
      }
    } catch (createUserErr) {
      console.error('[Webhook] Agency-Checkout: createUser Fehler:', createUserErr instanceof Error ? createUserErr.message : createUserErr);
    }
  }

  if (!resolvedUserId) {
    // 200 zurückgeben damit Stripe nicht endlos retried — manuelles Nacharbeiten nötig
    console.error('[Webhook] Agency-Checkout: User-ID konnte nicht aufgelöst werden', { customerEmail, session_id: session.id });
    return NextResponse.json({ received: true });
  }

  // agency_accounts upsert – on conflict user_id
  const { error: upsertErr } = await supabaseAdmin.from('agency_accounts').upsert({
    user_id: resolvedUserId,
    plan,
    status: 'active',
    max_domains: planConfig.maxDomains,
    scan_frequency: planConfig.scanFrequency,
    white_label_enabled: planConfig.whiteLabelEnabled,
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_id: stripeSubscriptionId,
    current_period_end: currentPeriodEnd.toISOString(),
    created_at: createdAt.toISOString(),
  }, { onConflict: 'user_id' });

  if (upsertErr) {
    console.error('[Webhook] agency_accounts upsert Fehler:', upsertErr.message);
  }

  // Bestätigungs-E-Mail mit PDF-Anhängen senden
  if (customerEmail) {
    const nextBillingDate = currentPeriodEnd.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const invoiceDate     = createdAt.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const planLabelMap: Record<string, string> = {
      agency_basic:      'Agency Basic',
      agency_pro:        'Agency Pro',
      agency_enterprise: 'Agency Enterprise',
      advokatur:         'Advokatur-Partnerschaft',
    };
    const planLabel = planLabelMap[plan] ?? plan;

    try {
      // PDFs parallel generieren
      const [invoicePdf, guidePdf] = await Promise.all([
        generateAgencyInvoicePdf({
          plan,
          customerEmail,
          nextBillingDate,
          invoiceDate,
          // Advokatur-Rechnungen erhalten eigenes Nummernpräfix DQ-ADV-
          invoicePrefix: plan === 'advokatur' ? 'DQ-ADV' : 'DQ-AG',
        }),
        generateAgencyGuidePdf({
          plan,
          planLabel,
        }),
      ]);

      const { error: emailError } = await resend.emails.send({
        from: 'Dataquard <info@dataquard.ch>',
        to: customerEmail,
        subject: 'Willkommen bei Dataquard — Ihr Agency-Account ist bereit',
        html: generateAgencyWelcomeEmailHtml({
          plan,
          planConfig,
          customerEmail,
          nextBillingDate,
        }),
        attachments: [
          {
            filename: `Dataquard-Rechnung-${plan}-${createdAt.getFullYear()}${String(createdAt.getMonth() + 1).padStart(2, '0')}${String(createdAt.getDate()).padStart(2, '0')}.pdf`,
            content: invoicePdf,
          },
          {
            filename: 'Dataquard-Agency-Kurzanleitung.pdf',
            content: guidePdf,
          },
        ],
      });

      if (emailError) console.error('[Webhook] Agency Welcome-E-Mail Fehler:', emailError);
    } catch (emailErr) {
      console.error('[Webhook] Agency Welcome-E-Mail fehlgeschlagen:', emailErr instanceof Error ? emailErr.message : emailErr);
    }
  }

  console.log(`[Webhook] ✅ Agency-Account "${plan}" erstellt für user=${resolvedUserId}`);
  return NextResponse.json({ received: true });
}

// ─── Agency Welcome E-Mail Template ────────────────────────────────────────

function generateAgencyWelcomeEmailHtml({
  plan,
  planConfig,
  customerEmail,
  nextBillingDate,
}: {
  plan: string;
  planConfig: AgencyPlanConfig;
  customerEmail: string;
  nextBillingDate: string;
}): string {
  const planLabelMap: Record<string, string> = {
    agency_basic:      'Agency Basic',
    agency_pro:        'Agency Pro',
    agency_enterprise: 'Agency Enterprise',
    advokatur:         'Advokatur-Partnerschaft',
  };
  const planLabel = planLabelMap[plan] ?? plan;
  // White-Label-Hinweis für Pro, Enterprise und Advokatur anzeigen
  const isProOrEnterprise = plan === 'agency_pro' || plan === 'agency_enterprise' || plan === 'advokatur';
  const domainsLabel = planConfig.maxDomains === 9999 ? 'Unbegrenzt' : `bis ${planConfig.maxDomains}`;

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Willkommen bei Dataquard — Ihr Agency-Account ist bereit</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0b1829,#0d1f35);padding:32px 40px;text-align:center;">
              <div style="font-size:24px;font-weight:800;letter-spacing:-0.5px;">
                <span style="color:#22c55e;">Data</span><span style="color:#ffffff;">quard</span>
              </div>
              <div style="color:#9ab0c8;font-size:13px;margin-top:4px;">${plan === 'advokatur' ? 'Compliance-Analyse für Ihre Mandanten.' : 'Ihre Website. Rechtssicher.'}</div>
            </td>
          </tr>
          <!-- Begrüssung -->
          <tr>
            <td style="padding:40px 40px 24px;text-align:center;">
              <div style="font-size:40px;margin-bottom:16px;">✅</div>
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1a1a2e;">Ihr Agency-Account ist bereit!</h1>
              <p style="margin:0;color:#6b7280;font-size:15px;line-height:1.6;">
                Vielen Dank für Ihr Vertrauen.<br/>
                Ihr <strong style="color:#1a1a2e;">Dataquard ${planLabel}-Plan</strong> ist ab sofort aktiv.
              </p>
            </td>
          </tr>
          <!-- Rechnungsübersicht -->
          <tr>
            <td style="padding:0 40px 28px;">
              <div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
                <div style="background:#f9fafb;padding:12px 20px;border-bottom:1px solid #e5e7eb;">
                  <span style="font-size:13px;font-weight:700;color:#374151;">Rechnungsübersicht</span>
                </div>
                <table width="100%" cellpadding="0" cellspacing="0" style="padding:16px 20px;">
                  <tr>
                    <td style="font-size:13px;color:#6b7280;padding:4px 0;">Plan</td>
                    <td style="font-size:13px;color:#374151;font-weight:600;text-align:right;">Dataquard ${planLabel}</td>
                  </tr>
                  <tr>
                    <td style="font-size:13px;color:#6b7280;padding:4px 0;">Domains inbegriffen</td>
                    <td style="font-size:13px;color:#374151;text-align:right;">${domainsLabel}</td>
                  </tr>
                  <tr>
                    <td style="font-size:13px;color:#6b7280;padding:4px 0;">Nächste Abrechnung</td>
                    <td style="font-size:13px;color:#374151;text-align:right;">${nextBillingDate}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="border-top:1px solid #e5e7eb;padding-top:8px;"></td>
                  </tr>
                  <tr>
                    <td style="font-size:14px;font-weight:700;color:#1a1a2e;padding:4px 0;">Monatliche Kosten</td>
                    <td style="font-size:14px;font-weight:700;color:#1a1a2e;text-align:right;">CHF ${planConfig.monthlyAmount}.–/Mt.</td>
                  </tr>
                </table>
              </div>
              <p style="font-size:12px;color:#9ca3af;margin:8px 0 0;text-align:center;">
                Monatsabo · Monatlich kündbar · Keine Mindestlaufzeit
              </p>
            </td>
          </tr>
          <!-- 3 Schritte -->
          <tr>
            <td style="padding:0 40px 28px;">
              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px 24px;">
                <div style="font-size:13px;font-weight:700;color:#15803d;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:16px;">
                  So starten Sie in 3 Schritten
                </div>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="vertical-align:top;padding-bottom:14px;">
                      <div style="display:inline-block;width:24px;height:24px;background:#22c55e;border-radius:50%;color:#fff;font-weight:700;font-size:13px;text-align:center;line-height:24px;flex-shrink:0;">1</div>
                      &nbsp;&nbsp;<strong style="color:#1a1a2e;font-size:14px;">Dashboard öffnen</strong><br/>
                      <span style="color:#555566;font-size:13px;padding-left:32px;display:block;margin-top:4px;">
                        Unter <a href="https://www.dataquard.ch/dashboard" style="color:#22c55e;text-decoration:none;">dataquard.ch/dashboard</a> → Tab "Agentur" klicken.
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="vertical-align:top;padding-bottom:14px;">
                      <div style="display:inline-block;width:24px;height:24px;background:#22c55e;border-radius:50%;color:#fff;font-weight:700;font-size:13px;text-align:center;line-height:24px;">2</div>
                      &nbsp;&nbsp;<strong style="color:#1a1a2e;font-size:14px;">Domains hinzufügen</strong><br/>
                      <span style="color:#555566;font-size:13px;padding-left:32px;display:block;margin-top:4px;">
                        Einzeln eingeben oder per CSV-Upload (eine Domain pro Zeile).
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="vertical-align:top;">
                      <div style="display:inline-block;width:24px;height:24px;background:#22c55e;border-radius:50%;color:#fff;font-weight:700;font-size:13px;text-align:center;line-height:24px;">3</div>
                      &nbsp;&nbsp;<strong style="color:#1a1a2e;font-size:14px;">Scannen &amp; Reports</strong><br/>
                      <span style="color:#555566;font-size:13px;padding-left:32px;display:block;margin-top:4px;">
                        Klicken Sie auf "Alle Domains scannen". PDF-Reports können direkt heruntergeladen werden.
                      </span>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 28px;text-align:center;">
              <a href="https://www.dataquard.ch/dashboard/agency"
                style="display:inline-block;background:linear-gradient(135deg,#00e676,#00c853);color:#040c1c;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none;">
                Zum Agency-Dashboard →
              </a>
              <p style="margin:10px 0 0;color:#9ca3af;font-size:13px;">Angemeldet als ${customerEmail}</p>
            </td>
          </tr>
          <!-- Document Pack Tipp -->
          <tr>
            <td style="padding:0 40px 28px;">
              <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:16px 20px;">
                <div style="font-size:13px;color:#92400e;line-height:1.6;">
                  <strong>Tipp: Document Pack</strong><br/>
                  Aktivieren Sie das Document Pack (CHF 9.–/Domain/Mt.) für automatisch generierte Datenschutzerklärungen,
                  Impressum und Cookie-Banner pro Kunden-Website.
                </div>
              </div>
            </td>
          </tr>
          ${isProOrEnterprise ? `
          <!-- White-Label Hinweis -->
          <tr>
            <td style="padding:0 40px 28px;">
              <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px 20px;">
                <div style="font-size:13px;color:#1e40af;line-height:1.6;">
                  <strong>White-Label freigeschaltet</strong><br/>
                  Unter "Branding" im Agency-Dashboard können Sie Ihr eigenes Logo und Ihre Markenfarben
                  für alle PDF-Reports konfigurieren.
                </div>
              </div>
            </td>
          </tr>
          ` : ''}
          <!-- Support -->
          <tr>
            <td style="padding:0 40px 28px;">
              <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px 20px;text-align:center;">
                <div style="font-size:13px;color:#6b7280;">
                  Fragen? Wir helfen gerne weiter:<br/>
                  <a href="mailto:support@dataquard.ch" style="color:#22c55e;font-weight:600;text-decoration:none;">support@dataquard.ch</a>
                </div>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                © 2026 Dataquard · Reinach BL, Schweiz<br/>
                <a href="https://www.dataquard.ch/datenschutz" style="color:#9ca3af;text-decoration:none;">Datenschutz</a>
                &nbsp;·&nbsp;
                <a href="https://www.dataquard.ch/impressum" style="color:#9ca3af;text-decoration:none;">Impressum</a>
                &nbsp;·&nbsp;
                <a href="https://www.dataquard.ch" style="color:#9ca3af;text-decoration:none;">dataquard.ch</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Kündigungs-Hilfsfunktionen ────────────────────────────────────────────

// Plan-Label mit Preis für alle 6 Pläne + Fallback
function getCancellationPlanLabel(plan: string): string {
  const labels: Record<string, string> = {
    starter:           'Starter (CHF 19.–/Mt.)',
    professional:      'Professional (CHF 39.–/Mt.)',
    agency_basic:      'Agency Basic (CHF 79/Mt.)',
    agency_pro:        'Agency Pro (CHF 179/Mt.)',
    agency_enterprise: 'Agency Enterprise (CHF 349/Mt.)',
    advokatur:         'Advokatur-Partnerschaft (CHF 149/Mt.)',
  };
  return labels[plan] ?? plan;
}

// Plan-Kategorie für Admin-Anzeige
function getCancellationPlanCategory(plan: string): string {
  if (plan === 'starter' || plan === 'professional') return 'KMU';
  if (plan === 'advokatur') return 'Advokatur';
  return 'Agency';
}

// Rückkehr-URL je nach Plan-Typ für den CTA in der Kunden-E-Mail
function getCancellationReturnUrl(plan: string): string {
  if (plan === 'starter' || plan === 'professional') return 'https://www.dataquard.ch/preise';
  if (plan === 'advokatur') return 'https://www.dataquard.ch/fuer-advokaturen';
  return 'https://www.dataquard.ch/fuer-agenturen';
}

// ─── Admin-Benachrichtigung bei Kündigung ──────────────────────────────────

function generateCancellationAdminEmailHtml(params: {
  customerEmail: string;
  planLabel: string;
  planCategory: string;
  customerId: string;
  cancelledAt: string;
  periodEnd: string;
}): string {
  const rows: [string, string][] = [
    ['Kunde',            params.customerEmail],
    ['Plan',             params.planLabel],
    ['Kategorie',        params.planCategory],
    ['Stripe Customer',  params.customerId],
    ['Gekündigt am',     params.cancelledAt],
    ['Zugang aktiv bis', params.periodEnd],
  ];

  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8" /><title>Kündigung</title></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#0a0f1e;padding:24px 32px;">
            <div style="font-size:20px;font-weight:800;"><span style="color:#22c55e;">Data</span><span style="color:#ffffff;">quard</span></div>
            <div style="color:#888;font-size:12px;margin-top:4px;">Admin-Benachrichtigung</div>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px;">
            <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:14px 18px;margin-bottom:24px;">
              <div style="font-size:15px;font-weight:700;color:#991b1b;">Kündigung eingegangen</div>
            </div>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${rows.map(([label, value]) => `
              <tr>
                <td style="font-size:13px;color:#6b7280;padding:6px 0;width:160px;">${label}</td>
                <td style="font-size:13px;color:#1a1a2e;font-weight:600;padding:6px 0;">${value}</td>
              </tr>`).join('')}
            </table>
            <div style="margin-top:24px;">
              <a href="https://dashboard.stripe.com/customers/${params.customerId}"
                style="display:inline-block;background:#22c55e;color:#040c1c;font-weight:700;font-size:13px;padding:10px 20px;border-radius:8px;text-decoration:none;">
                Stripe Dashboard →
              </a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">Dataquard · Reinach BL · Schweiz</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Kunden-Bestätigung bei Kündigung ─────────────────────────────────────

function generateCancellationCustomerEmailHtml(params: {
  planLabel: string;
  planKey: string;
  periodEnd: string;
  returnUrl: string;
}): string {
  const isKmu      = params.planKey === 'starter' || params.planKey === 'professional';
  const isAdvokatur = params.planKey === 'advokatur';
  const isAgency   = !isKmu && !isAdvokatur;

  // Plan-spezifischer Text
  const accessNote = isAgency
    ? 'Bis zu diesem Datum können Sie alle Domains und Funktionen Ihres Plans weiterhin nutzen. Danach werden keine weiteren Zahlungen eingezogen.'
    : 'Bis zu diesem Datum können Sie alle Funktionen Ihres Plans weiterhin nutzen. Danach werden keine weiteren Zahlungen eingezogen.';

  const dataNote = isAgency
    ? 'Ihre Domain-Daten und Scan-Reports bleiben nach Ablauf noch 30 Tage gespeichert.'
    : 'Ihre Scan-Daten bleiben nach Ablauf noch 30 Tage gespeichert.';

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Ihre Kündigung bei Dataquard wurde bestätigt</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#0b1829,#0d1f35);padding:32px 40px;text-align:center;">
            <div style="font-size:24px;font-weight:800;letter-spacing:-0.5px;">
              <span style="color:#22c55e;">Data</span><span style="color:#ffffff;">quard</span>
            </div>
            <div style="color:#9ab0c8;font-size:13px;margin-top:4px;">Ihre Website. Rechtssicher.</div>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 24px;text-align:center;">
            <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#1a1a2e;">Kündigung bestätigt</h1>
            <p style="margin:0;color:#6b7280;font-size:15px;line-height:1.7;">
              Guten Tag,<br/><br/>
              Ihre Kündigung wurde erfolgreich verarbeitet.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px 28px;">
            <div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
              <div style="background:#f9fafb;padding:12px 20px;border-bottom:1px solid #e5e7eb;">
                <span style="font-size:13px;font-weight:700;color:#374151;">Ihre Kündigung im Überblick</span>
              </div>
              <table width="100%" cellpadding="0" cellspacing="0" style="padding:16px 20px;">
                <tr>
                  <td style="font-size:13px;color:#6b7280;padding:5px 0;">Plan</td>
                  <td style="font-size:13px;color:#374151;font-weight:600;text-align:right;">${params.planLabel}</td>
                </tr>
                <tr>
                  <td style="font-size:13px;color:#6b7280;padding:5px 0;">Zugang aktiv bis</td>
                  <td style="font-size:13px;color:#374151;font-weight:600;text-align:right;">${params.periodEnd}</td>
                </tr>
              </table>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px 24px;">
            <p style="margin:0 0 12px;color:#374151;font-size:15px;line-height:1.7;">${accessNote}</p>
            <p style="margin:0 0 12px;color:#374151;font-size:15px;line-height:1.7;">${dataNote}</p>
            <p style="margin:0;color:#374151;font-size:15px;line-height:1.7;">Sie können jederzeit wieder einsteigen.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px 28px;text-align:center;">
            <a href="${params.returnUrl}"
              style="display:inline-block;background:#22c55e;color:#040c1c;font-weight:700;font-size:15px;padding:14px 28px;border-radius:8px;text-decoration:none;">
              Wieder einsteigen →
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px 28px;">
            <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px 20px;text-align:center;">
              <div style="font-size:13px;color:#1e40af;">
                Haben Sie Fragen? Antworten Sie direkt auf diese E-Mail oder schreiben Sie an<br/>
                <a href="mailto:support@dataquard.ch" style="color:#2563eb;font-weight:600;">support@dataquard.ch</a>
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              © 2026 Dataquard · Reinach BL, Schweiz<br/>
              <a href="https://www.dataquard.ch" style="color:#9ca3af;">dataquard.ch</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
