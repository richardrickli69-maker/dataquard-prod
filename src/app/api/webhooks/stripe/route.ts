/**
 * Stripe Webhook Handler
 * POST /api/webhooks/stripe
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
    console.error('[Webhook] Step 2 ERROR: Signatur-Verifikation fehlgeschlagen:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
  console.log('[Webhook] Step 2: Event verified, type:', event.type);

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true });
  }
  console.log('[Webhook] Step 3: Processing checkout.session.completed');

  const session = event.data.object as Stripe.Checkout.Session;

  const product = session.metadata?.product;
  const userId = session.metadata?.user_id;
  const customerEmail = session.customer_details?.email ?? session.customer_email;
  // Preis direkt aus Stripe – kein Hardcoding mehr
  const amountTotal = (session.amount_total ?? 0) / 100;
  const currency = session.currency?.toUpperCase() ?? 'CHF';
  const createdAt = new Date(session.created * 1000);

  if (!product) {
    console.error('[Webhook] Kein product in metadata:', session.id);
    return NextResponse.json({ error: 'Missing product metadata' }, { status: 400 });
  }

  const plan = product as string;

  try {
    const { supabaseAdmin } = await import('@/lib/supabaseAdmin');

    let resolvedUserId = userId ?? null;

    if (!resolvedUserId && customerEmail) {
      const { data } = await supabaseAdmin.auth.admin.listUsers();
      const match = data?.users?.find((u) => u.email === customerEmail);
      if (match) resolvedUserId = match.id;
    }

    if (!resolvedUserId) {
      console.warn('[Webhook] Kein Auth-User gefunden – lege Eintrag via E-Mail an:', customerEmail);
    }

    // 1. Subscription anlegen
    await supabaseAdmin.from('subscriptions').upsert({
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

    // 2. users-Tabelle aktualisieren
    const { error: userUpsertError } = resolvedUserId
      ? await supabaseAdmin
          .from('users')
          .upsert({ id: resolvedUserId, email: customerEmail ?? '', subscription_tier: plan }, { onConflict: 'id' })
      : await supabaseAdmin
          .from('users')
          .upsert({ email: customerEmail ?? '', subscription_tier: plan }, { onConflict: 'email' });

    if (userUpsertError) {
      console.warn('[Webhook] users-Upsert Fehler:', userUpsertError.message);
    } else {
      console.log(`[Webhook] Step 4: Supabase updated, user: ${resolvedUserId ?? customerEmail}, plan: ${plan}`);
    }

    // 3. rescan_enabled setzen
    if (plan !== 'impressum' && resolvedUserId) {
      await supabaseAdmin
        .from('scans')
        .update({ rescan_enabled: true })
        .eq('user_id', resolvedUserId);
    }

    // 4. Bestaetigungs-E-Mail via Resend
    if (customerEmail) {
      const planLabel = plan === 'professional' ? 'Professional' : plan === 'impressum' ? 'Impressum' : 'Starter';
      const invoiceNumber = `DQ-${createdAt.getFullYear()}-${session.id.slice(-6).toUpperCase()}`;
      const formattedDate = createdAt.toLocaleDateString('de-CH', {
        day: '2-digit', month: '2-digit', year: 'numeric',
      });

      console.log('[Webhook] Step 5: Starting PDF generation');
      const [pdfBuffer, installationPdfBuffer] = await Promise.all([
        generateInvoicePdf({
          invoiceNumber,
          date: formattedDate,
          product: `Dataquard ${planLabel}`,
          amount: amountTotal,
          customerEmail,
        }),
        generateInstallationPdf({ planLabel, customerEmail }),
      ]);

      console.log('[Webhook] Step 6: PDFs generated, invoice size:', pdfBuffer.length, 'installation size:', installationPdfBuffer.length);
      console.log('[Webhook] Step 7: Sending email to:', customerEmail);

      const { error: emailError } = await resend.emails.send({
        from: 'Dataquard <noreply@dataquard.ch>',
        to: customerEmail,
        subject: `Ihre Rechnung ${invoiceNumber} – Dataquard ${planLabel}`,
        html: generateEmailHtml({ planLabel, amount: amountTotal, currency, invoiceNumber, formattedDate, userEmail: customerEmail }),
        attachments: [
          {
            filename: `Dataquard-Rechnung-${invoiceNumber}.pdf`,
            content: pdfBuffer,
          },
          {
            filename: `Dataquard-Installationsanleitung.pdf`,
            content: installationPdfBuffer,
          },
        ],
      });

      if (emailError) {
        console.error('[Webhook] Step 7 ERROR: Resend Fehler:', emailError);
      } else {
        console.log('[Webhook] Step 8: Email sent successfully to:', customerEmail);
      }
    }

    console.log(`[Webhook] ✅ User ${resolvedUserId} → Plan "${plan}" aktiviert`);

    if (resolvedUserId) {
      await logAudit({
        user_id: resolvedUserId,
        action: 'purchase',
        resource: plan,
        details: {
          stripe_customer_id: typeof session.customer === 'string' ? session.customer : null,
        },
      });
    }

    return NextResponse.json({ received: true });

  } catch (err) {
    console.error('[Webhook] ERROR (outer catch):', err instanceof Error ? err.message : err);
    console.error('[Webhook] ERROR stack:', err instanceof Error ? err.stack : 'no stack');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── E-Mail HTML Template ─────────────────────────────────────────────────────
function generateEmailHtml({
  planLabel,
  amount,
  currency,
  invoiceNumber,
  formattedDate,
  userEmail,
}: {
  planLabel: string;
  amount: number;
  currency: string;
  invoiceNumber: string;
  formattedDate: string;
  userEmail: string;
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

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0b1829,#0d1f35);padding:32px 40px;text-align:center;">
              <div style="font-size:24px;font-weight:800;letter-spacing:-0.5px;">
                <span style="color:#4d9fff;">Data</span><span style="color:#e53935;">quard</span>
              </div>
              <div style="color:#9ab0c8;font-size:13px;margin-top:4px;">Ihre Website. Rechtssicher.</div>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td style="padding:40px 40px 24px;text-align:center;">
              <div style="font-size:40px;margin-bottom:16px;">✅</div>
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1a1a2e;">
                Vielen Dank für Ihren Kauf!
              </h1>
              <p style="margin:0;color:#6b7280;font-size:15px;line-height:1.6;">
                Ihr <strong style="color:#1a1a2e;">Dataquard ${planLabel}-Plan</strong> ist jetzt aktiv.<br/>
                Die Rechnung sowie die Installationsanleitung finden Sie als PDF-Anhang in dieser E-Mail.
              </p>
            </td>
          </tr>

          <!-- Was ist jetzt verfügbar -->
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

          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 32px;text-align:center;">
              <a href="https://dataquard.ch/dashboard"
                style="display:inline-block;background:linear-gradient(135deg,#00e676,#00c853);color:#040c1c;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none;">
                Jetzt erste Datenschutzerklärung erstellen →
              </a>
              <p style="margin:12px 0 0;color:#9ca3af;font-size:13px;">
                Angemeldet als ${userEmail}
              </p>
            </td>
          </tr>

          <!-- Rechnungsübersicht -->
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
                    <td colspan="2" style="border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px;"></td>
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

          <!-- Support -->
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

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                © 2026 Dataquard · Richard Rickli · Basel, Schweiz<br/>
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