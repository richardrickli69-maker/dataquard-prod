/**
 * Stripe Webhook Handler
 * POST /api/webhooks/stripe
 *
 * Handled events:
 *   checkout.session.completed   – Einmalkauf (payment) + AI-Trust Abo (subscription)
 *   customer.subscription.updated – AI-Trust Abo verlängert / Status geändert
 *   customer.subscription.deleted – AI-Trust Abo gekündigt
 *   invoice.payment_failed        – Zahlung fehlgeschlagen (optional alert)
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { logAudit } from '@/lib/audit';
import { generateInvoicePdf } from '@/lib/generateInvoicePdf';
import { generateInstallationPdf } from '@/lib/generateInstallationPdf';

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
]);

export async function POST(request: NextRequest) {
  console.log('[Webhook] Step 1: Request received');
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
  console.log('[Webhook] Event verified, type:', event.type);

  if (!HANDLED_EVENTS.has(event.type)) {
    return NextResponse.json({ received: true });
  }

  const { supabaseAdmin } = await import('@/lib/supabaseAdmin');

  try {
    // ─── checkout.session.completed ────────────────────────────────────────
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const product = session.metadata?.product;
      const userId = session.metadata?.user_id;
      const customerEmail = session.customer_details?.email ?? session.customer_email;
      const amountTotal = (session.amount_total ?? 0) / 100;
      const currency = session.currency?.toUpperCase() ?? 'CHF';
      const createdAt = new Date(session.created * 1000);

      if (!product) {
        console.error('[Webhook] Kein product in metadata:', session.id);
        return NextResponse.json({ error: 'Missing product metadata' }, { status: 400 });
      }

      const plan = product as string;

      let resolvedUserId = userId ?? null;
      if (!resolvedUserId && customerEmail) {
        const { data } = await supabaseAdmin.auth.admin.listUsers();
        const match = data?.users?.find((u) => u.email === customerEmail);
        if (match) resolvedUserId = match.id;
      }

      // ── AI-Trust Abo (subscription mode) ──────────────────────────────
      if (session.mode === 'subscription' && plan === 'ai-trust') {
        console.log('[Webhook] Processing AI-Trust subscription');

        const stripeSubscriptionId = typeof session.subscription === 'string'
          ? session.subscription
          : (session.subscription as Stripe.Subscription | null)?.id ?? null;

        // current_period_end von Stripe holen (korrekte Ablaufzeit)
        const fallbackExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        let aiTrustExpiresAt: Date = fallbackExpiry;
        if (stripeSubscriptionId) {
          const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId) as unknown as { current_period_end?: number | null };
          const ts = stripeSub.current_period_end;
          if (ts && ts > 0) {
            const parsed = new Date(ts * 1000);
            aiTrustExpiresAt = isNaN(parsed.getTime()) ? fallbackExpiry : parsed;
            console.log('[Webhook] AI-Trust current_period_end:', aiTrustExpiresAt.toISOString());
          } else {
            console.warn('[Webhook] current_period_end fehlt oder 0 – Fallback +1 Jahr');
          }
        } else {
          console.warn('[Webhook] Kein stripeSubscriptionId – Fallback +1 Jahr');
        }

        const aiTrustFields = {
          ai_trust_active: true,
          ai_trust_expires_at: aiTrustExpiresAt.toISOString(),
          ai_trust_stripe_subscription_id: stripeSubscriptionId,
          stripe_customer_id: typeof session.customer === 'string' ? session.customer : null,
        };

        // Prüfen ob User bereits eine Subscription-Zeile hat
        const existingQuery = resolvedUserId
          ? supabaseAdmin.from('subscriptions').select('id').eq('user_id', resolvedUserId).maybeSingle()
          : customerEmail
            ? supabaseAdmin.from('subscriptions').select('id').eq('email', customerEmail).maybeSingle()
            : Promise.resolve({ data: null });
        const { data: existingSub } = await existingQuery;

        if (existingSub) {
          // Nur AI-Trust Felder ergänzen – bestehenden Plan NICHT überschreiben
          const { error: updateErr } = await supabaseAdmin
            .from('subscriptions')
            .update(aiTrustFields)
            .eq('id', (existingSub as { id: string }).id);
          if (updateErr) console.error('[Webhook] AI-Trust update error:', updateErr.message);
        } else {
          // Neue Zeile für reines AI-Trust Abo
          const { error: insertErr } = await supabaseAdmin.from('subscriptions').insert({
            ...(resolvedUserId ? { user_id: resolvedUserId } : {}),
            email: customerEmail ?? null,
            plan: 'ai-trust',
            status: 'active',
            stripe_session_id: session.id,
            amount: amountTotal,
            currency,
            purchased_at: createdAt.toISOString(),
            created_at: new Date().toISOString(),
            ...aiTrustFields,
          });
          if (insertErr) console.error('[Webhook] AI-Trust insert error:', insertErr.message);
        }

        if (customerEmail) {
          const invoiceNumber = `DQ-${createdAt.getFullYear()}-${session.id.slice(-6).toUpperCase()}`;
          const formattedDate = createdAt.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });
          const nextBillingDate = new Date(aiTrustExpiresAt).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });

          const [pdfBuffer, installationPdfBuffer] = await Promise.all([
            generateInvoicePdf({
              invoiceNumber,
              date: formattedDate,
              product: 'Dataquard AI-Trust Abo',
              description: 'Laufende KI-Überwachung (250 Bilder): Deepfake-Erkennung, EU AI Act Art. 50, Shield-Badge, E-Mail-Alerts, Quartals-Report',
              amount: amountTotal,
              customerEmail,
              mode: 'subscription',
              subscriptionEndsAt: nextBillingDate,
            }),
            generateInstallationPdf({ planLabel: 'AI-TRUST', customerEmail, isAiTrust: true }),
          ]);

          await resend.emails.send({
            from: 'Dataquard <info@dataquard.ch>',
            to: customerEmail,
            subject: '🤖 Ihr AI-Trust Abo ist aktiv – Dataquard',
            html: generateAiTrustEmailHtml({ userEmail: customerEmail, amount: amountTotal, currency }),
            attachments: [
              { filename: `Dataquard-Rechnung-${invoiceNumber}.pdf`, content: pdfBuffer },
              { filename: 'Dataquard-AI-Trust-Einrichtung.pdf', content: installationPdfBuffer },
            ],
          });
        }

        if (resolvedUserId) {
          await logAudit({ user_id: resolvedUserId, action: 'purchase', resource: 'ai-trust', details: { stripe_subscription_id: stripeSubscriptionId } });
        }

        console.log(`[Webhook] ✅ AI-Trust aktiviert für ${resolvedUserId ?? customerEmail}`);
        return NextResponse.json({ received: true });
      }

      // ── Einmalkauf (payment mode) ──────────────────────────────────────
      const { error: subUpsertError } = await supabaseAdmin.from('subscriptions').upsert({
        ...(resolvedUserId ? { user_id: resolvedUserId } : {}),
        email: customerEmail ?? null,
        plan,
        status: 'active',
        stripe_session_id: session.id,
        stripe_customer_id: typeof session.customer === 'string' ? session.customer : null,
        amount: amountTotal,
        currency,
        purchased_at: createdAt.toISOString(),
        created_at: new Date().toISOString(),
      }, { onConflict: resolvedUserId ? 'user_id' : 'email' });
      if (subUpsertError) {
        console.error('[Webhook] subscriptions-Upsert Fehler:', subUpsertError.message);
      }

      const { error: userUpsertError } = resolvedUserId
        ? await supabaseAdmin.from('users').upsert({ id: resolvedUserId, email: customerEmail ?? '', subscription_tier: plan }, { onConflict: 'id' })
        : await supabaseAdmin.from('users').upsert({ email: customerEmail ?? '', subscription_tier: plan }, { onConflict: 'email' });

      if (userUpsertError) {
        console.warn('[Webhook] users-Upsert Fehler:', userUpsertError.message);
      }

      if (plan !== 'impressum' && resolvedUserId) {
        await supabaseAdmin.from('scans').update({ rescan_enabled: true }).eq('user_id', resolvedUserId);
      }

      if (customerEmail) {
        const planLabel = plan === 'professional' ? 'Professional' : plan === 'impressum' ? 'Impressum' : 'Starter';
        const invoiceNumber = `DQ-${createdAt.getFullYear()}-${session.id.slice(-6).toUpperCase()}`;
        const formattedDate = createdAt.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });

        const descriptionMap: Record<string, string> = {
          starter: 'Datenschutzerklärung + Impressum + Cookie-Banner Generator + AI-Trust Scan (1 Domain)',
          professional: 'Datenschutzerklärung + Impressum + Cookie-Banner (5 Domains) + AI-Trust Scan + Priority Support',
          impressum: 'Impressum Generator (1 Domain) + PDF-Export',
        };

        const [pdfBuffer, installationPdfBuffer] = await Promise.all([
          generateInvoicePdf({
            invoiceNumber,
            date: formattedDate,
            product: `Dataquard ${planLabel}`,
            description: descriptionMap[plan] ?? 'Dataquard Compliance-Paket',
            amount: amountTotal,
            customerEmail,
            mode: 'payment',
          }),
          generateInstallationPdf({ planLabel, customerEmail, isAiTrust: false }),
        ]);

        const { error: emailError } = await resend.emails.send({
          from: 'Dataquard <info@dataquard.ch>',
          to: customerEmail,
          subject: `Ihre Rechnung ${invoiceNumber} – Dataquard ${planLabel}`,
          html: generateEmailHtml({ planLabel, amount: amountTotal, currency, invoiceNumber, formattedDate, userEmail: customerEmail }),
          attachments: [
            { filename: `Dataquard-Rechnung-${invoiceNumber}.pdf`, content: pdfBuffer },
            { filename: `Dataquard-Installationsanleitung.pdf`, content: installationPdfBuffer },
          ],
        });

        if (emailError) console.error('[Webhook] Resend Fehler:', emailError);
      }

      if (resolvedUserId) {
        await logAudit({ user_id: resolvedUserId, action: 'purchase', resource: plan, details: { stripe_customer_id: typeof session.customer === 'string' ? session.customer : null } });
      }

      console.log(`[Webhook] ✅ User ${resolvedUserId} → Plan "${plan}" aktiviert`);
      return NextResponse.json({ received: true });
    }

    // ─── customer.subscription.updated ─────────────────────────────────────
    if (event.type === 'customer.subscription.updated') {
      const sub = event.data.object as unknown as { id: string; customer: string | null; status: string; current_period_end?: number | null };
      const customerId = typeof sub.customer === 'string' ? sub.customer : null;
      const isActive = sub.status === 'active' || sub.status === 'trialing';
      const cpeTs = sub.current_period_end;
      const cpeRaw = cpeTs && cpeTs > 0 ? new Date(cpeTs * 1000) : null;
      const currentPeriodEnd = (cpeRaw && !isNaN(cpeRaw.getTime()))
        ? cpeRaw
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

      if (customerId) {
        const { error: updErr } = await supabaseAdmin.from('subscriptions')
          .update({
            ai_trust_active: isActive,
            ai_trust_expires_at: currentPeriodEnd.toISOString(),
            ai_trust_stripe_subscription_id: sub.id,
          })
          .eq('stripe_customer_id', customerId);

        if (updErr) console.error('[Webhook] subscription.updated DB error:', updErr.message);
        console.log(`[Webhook] AI-Trust updated: customer=${customerId}, active=${isActive}, expires=${currentPeriodEnd.toISOString()}`);
      }
      return NextResponse.json({ received: true });
    }

    // ─── customer.subscription.deleted ─────────────────────────────────────
    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as unknown as { customer: string | null };
      const customerId = typeof sub.customer === 'string' ? sub.customer : null;

      if (customerId) {
        const { error: delErr } = await supabaseAdmin.from('subscriptions')
          .update({ ai_trust_active: false, ai_trust_expires_at: new Date().toISOString() })
          .eq('stripe_customer_id', customerId);

        if (delErr) console.error('[Webhook] subscription.deleted DB error:', delErr.message);
        console.log(`[Webhook] AI-Trust deaktiviert: customer=${customerId}`);
      }
      return NextResponse.json({ received: true });
    }

    // ─── invoice.payment_failed ─────────────────────────────────────────────
    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object as Stripe.Invoice;
      const customerEmail = typeof invoice.customer_email === 'string' ? invoice.customer_email : null;

      if (customerEmail) {
        await resend.emails.send({
          from: 'Dataquard <info@dataquard.ch>',
          to: customerEmail,
          subject: '⚠️ Zahlung fehlgeschlagen – AI-Trust Abo',
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px;">
            <h2 style="color:#1a1a2e;">Zahlung fehlgeschlagen</h2>
            <p style="color:#555566;">Die Zahlung für Ihr Dataquard AI-Trust Abo konnte nicht verarbeitet werden. Bitte aktualisieren Sie Ihre Zahlungsmethode.</p>
            <a href="https://dataquard.ch/dashboard" style="display:inline-block;background:#22c55e;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;">Zahlungsmethode aktualisieren →</a>
            <p style="color:#888899;font-size:12px;margin-top:24px;">Dataquard · Reinach BL, Schweiz · <a href="https://dataquard.ch" style="color:#888899;">dataquard.ch</a></p>
          </div>`,
        });
        console.log(`[Webhook] Zahlungsfehlschlag-E-Mail gesendet an: ${customerEmail}`);
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

// ─── E-Mail Templates ──────────────────────────────────────────────────────

function generateAiTrustEmailHtml({ userEmail, amount, currency }: { userEmail: string; amount: number; currency: string }): string {
  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8" /><title>AI-Trust Abo aktiv – Dataquard</title></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#5b21b6,#7c3aed);padding:32px 40px;text-align:center;">
            <div style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">🤖 Dataquard AI-Trust</div>
            <div style="color:#ddd6fe;font-size:13px;margin-top:4px;">KI-Überwachung. Dauerhaft. Automatisch.</div>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 24px;text-align:center;">
            <div style="font-size:40px;margin-bottom:16px;">🤖</div>
            <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1a1a2e;">Ihr AI-Trust Abo ist aktiv!</h1>
            <p style="margin:0;color:#6b7280;font-size:15px;line-height:1.6;">
              Ihre Website wird ab sofort laufend auf KI-generierte Inhalte überwacht.<br/>
              Sie erhalten E-Mail-Alerts bei neuen Erkennungen und einen Quartals-Report.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px 32px;">
            <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:20px 24px;">
              <div style="font-size:13px;font-weight:700;color:#5b21b6;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:12px;">Ihr AI-Trust Abo beinhaltet</div>
              <div style="color:#374151;font-size:14px;line-height:2;">
                ✓ &nbsp;24/7 KI-Monitoring (250 Bilder/Monat)<br/>
                ✓ &nbsp;Deepfake-Erkennung<br/>
                ✓ &nbsp;EU AI Act Art. 50 Konformität<br/>
                ✓ &nbsp;Shield-Badge für Ihre Website<br/>
                ✓ &nbsp;E-Mail-Alerts bei neuen Erkennungen<br/>
                ✓ &nbsp;Quartals-Report
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px 24px;">
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;text-align:center;">
              <div style="font-size:13px;color:#15803d;font-weight:600;">Ihr Shield-Badge steht im Dashboard zum Einbetten bereit.</div>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px 32px;text-align:center;">
            <a href="https://dataquard.ch/dashboard" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#5b21b6);color:#fff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none;">
              Zum Dashboard →
            </a>
            <p style="margin:12px 0 0;color:#9ca3af;font-size:13px;">Angemeldet als ${userEmail}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px 32px;">
            <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px 20px;text-align:center;">
              <div style="font-size:13px;color:#374151;">Jahres-Abo · ${currency} ${amount.toFixed(2)} · Automatische Verlängerung</div>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              © 2026 Dataquard · Reinach BL, Schweiz<br/>
              <a href="https://dataquard.ch/datenschutz" style="color:#9ca3af;">Datenschutz</a> &nbsp;·&nbsp;
              <a href="https://dataquard.ch/impressum" style="color:#9ca3af;">Impressum</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function generateEmailHtml({
  planLabel, amount, currency, invoiceNumber, formattedDate, userEmail,
}: {
  planLabel: string; amount: number; currency: string; invoiceNumber: string; formattedDate: string; userEmail: string;
}): string {
  const featuresHtml = planLabel === 'Professional' ? `
    <div style="color:#374151;font-size:14px;line-height:2;">
      ✓ &nbsp;Datenschutzerklärung Generator (bis 5 Domains)<br/>
      ✓ &nbsp;Impressum Generator<br/>
      ✓ &nbsp;Cookie-Banner Generator (bis 5 Domains)<br/>
      ✓ &nbsp;Priority Support
    </div>` : planLabel === 'Impressum' ? `
    <div style="color:#374151;font-size:14px;line-height:2;">
      ✓ &nbsp;Impressum Generator (1 Domain)<br/>
      ✓ &nbsp;PDF-Export
    </div>` : `
    <div style="color:#374151;font-size:14px;line-height:2;">
      ✓ &nbsp;Datenschutzerklärung Generator<br/>
      ✓ &nbsp;Impressum Generator<br/>
      ✓ &nbsp;Cookie-Banner Generator (1 Domain)<br/>
      ✓ &nbsp;Compliance-Scan für Ihre Website
    </div>`;

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Ihre Rechnung – Dataquard ${planLabel}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#0b1829,#0d1f35);padding:32px 40px;text-align:center;">
              <div style="font-size:24px;font-weight:800;letter-spacing:-0.5px;">
                <span style="color:#4d9fff;">Data</span><span style="color:#e53935;">quard</span>
              </div>
              <div style="color:#9ab0c8;font-size:13px;margin-top:4px;">Ihre Website. Rechtssicher.</div>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 40px 24px;text-align:center;">
              <div style="font-size:40px;margin-bottom:16px;">✅</div>
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1a1a2e;">Vielen Dank für Ihren Kauf!</h1>
              <p style="margin:0;color:#6b7280;font-size:15px;line-height:1.6;">
                Ihr <strong style="color:#1a1a2e;">Dataquard ${planLabel}-Plan</strong> ist jetzt aktiv.<br/>
                Die Rechnung sowie die Installationsanleitung finden Sie als PDF-Anhang in dieser E-Mail.
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
              <a href="https://dataquard.ch/dashboard"
                style="display:inline-block;background:linear-gradient(135deg,#00e676,#00c853);color:#040c1c;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none;">
                Jetzt erste Datenschutzerklärung erstellen →
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
                    <td style="font-size:13px;color:#374151;text-align:right;">Einmalkauf</td>
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
                Einmalkauf · Keine Verlängerung · Keine versteckten Kosten<br/>
                Die vollständige Rechnung mit MwSt.-Aufschlüsselung finden Sie im PDF-Anhang.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 32px;">
              <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px 20px;text-align:center;">
                <div style="font-size:13px;color:#1e40af;">
                  Fragen? Wir helfen gerne weiter:<br/>
                  <a href="mailto:info@dataquard.ch" style="color:#2563eb;font-weight:600;">info@dataquard.ch</a>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                © 2026 Dataquard · Richard Rickli · Reinach BL, Schweiz<br/>
                <a href="https://dataquard.ch/datenschutz" style="color:#9ca3af;">Datenschutz</a>
                &nbsp;·&nbsp;
                <a href="https://dataquard.ch/impressum-generator" style="color:#9ca3af;">Impressum</a>
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
