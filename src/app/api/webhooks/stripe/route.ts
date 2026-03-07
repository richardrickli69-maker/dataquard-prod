/**
 * Stripe Webhook Handler
 * POST /api/webhooks/stripe
 *
 * Env-Vars erforderlich:
 *   STRIPE_SECRET_KEY
 *   STRIPE_WEBHOOK_SECRET  ← Stripe Dashboard → Webhooks → Signing Secret
 *   SUPABASE_SERVICE_ROLE_KEY
 *   RESEND_API_KEY
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { logAudit } from '@/lib/audit';
import { generateInvoicePdf } from '@/lib/generateInvoicePdf';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

const resend = new Resend(process.env.RESEND_API_KEY!);

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

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[Webhook] Signatur-Verifikation fehlgeschlagen:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  // metadata.product kommt aus checkout/route.ts: 'starter' | 'professional' | 'impressum'
  const product = session.metadata?.product;
  const userId = session.metadata?.user_id;
  const customerEmail = session.customer_details?.email ?? session.customer_email;
  const amountTotal = session.amount_total ?? 0;
  const currency = session.currency?.toUpperCase() ?? 'CHF';
  const createdAt = new Date(session.created * 1000);

  if (!product) {
    console.error('[Webhook] Kein product in metadata:', session.id);
    return NextResponse.json({ error: 'Missing product metadata' }, { status: 400 });
  }

  // Lowercase für Supabase (konsistent mit cookie-banner-generator/page.tsx Check)
  const plan = product as string; // 'starter' | 'professional' | 'impressum'

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
      // Kein Auth-User gefunden (z.B. Gast-Checkout) – User in users-Tabelle anlegen
      console.warn('[Webhook] Kein Auth-User gefunden – lege Eintrag via E-Mail an:', customerEmail);
    }

    // 1. Subscription in "subscriptions" Tabelle anlegen/aktualisieren
    await supabaseAdmin.from('subscriptions').upsert({
      ...(resolvedUserId ? { user_id: resolvedUserId } : {}),
      email: customerEmail ?? null,
      plan,
      status: 'active',
      stripe_session_id: session.id,
      stripe_customer_id: typeof session.customer === 'string' ? session.customer : null,
      amount: amountTotal / 100,
      currency,
      purchased_at: createdAt.toISOString(),
      created_at: new Date().toISOString(),
    }, { onConflict: resolvedUserId ? 'user_id' : 'email' });

    // 2. users-Tabelle: upsert (anlegen falls nicht vorhanden, sonst aktualisieren)
    //    subscription_tier lowercase – konsistent mit cookie-banner-generator/page.tsx
    const upsertPayload: Record<string, string> = {
      subscription_tier: plan,
      ...(customerEmail ? { email: customerEmail } : {}),
    };
    if (resolvedUserId) upsertPayload.id = resolvedUserId;

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
      console.log(`[Webhook] ✅ subscription_tier = '${plan}' für ${resolvedUserId ?? customerEmail}`);
    }

    // 3. rescan_enabled = true für alle Scans des Users (nur bei paid plans)
    if (plan !== 'impressum') {
      await supabaseAdmin
        .from('scans')
        .update({ rescan_enabled: true })
        .eq('user_id', resolvedUserId);
    }

    // 4. Bestätigungs-E-Mail via Resend
    if (customerEmail && plan !== 'impressum') {
      const planLabel = plan === 'professional' ? 'Professional' : 'Starter';
      const planPrice = plan === 'professional' ? '149' : '79';
      const invoiceNumber = `DQ-${createdAt.getFullYear()}-${session.id.slice(-6).toUpperCase()}`;
      const formattedDate = createdAt.toLocaleDateString('de-CH', {
        day: '2-digit', month: '2-digit', year: 'numeric',
      });

      const planAmount = plan === 'professional' ? 149 : 79;
      const pdfBuffer = await generateInvoicePdf({
        invoiceNumber,
        date: formattedDate,
        product: `Dataquard ${planLabel}`,
        amount: planAmount,
        customerEmail,
      });

      const { error: emailError } = await resend.emails.send({
        from: 'Dataquard <noreply@dataquard.ch>',
        to: customerEmail,
        subject: `Vielen Dank für Ihren Kauf – Dataquard ${planLabel}`,
        html: generateEmailHtml({ planLabel, planPrice, currency, invoiceNumber, formattedDate, userEmail: customerEmail }),
        attachments: [
          {
            filename: `Dataquard-Rechnung-${invoiceNumber}.pdf`,
            content: pdfBuffer,
          },
        ],
      });

      if (emailError) {
        console.error('[Webhook] Resend Fehler:', emailError);
      } else {
        console.log(`[Webhook] ✅ Bestätigungs-E-Mail gesendet an ${customerEmail}`);
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
    console.error('[Webhook] Fehler:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── E-Mail HTML Template ─────────────────────────────────────────────────────
function generateEmailHtml({
  planLabel,
  planPrice,
  currency,
  invoiceNumber,
  formattedDate,
  userEmail,
}: {
  planLabel: string;
  planPrice: string;
  currency: string;
  invoiceNumber: string;
  formattedDate: string;
  userEmail: string;
}): string {
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vielen Dank für Ihren Kauf</title>
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
                Sie haben Zugriff auf alle Funktionen Ihres Plans.
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
                ${planLabel === 'Professional' ? `
                <div style="color:#374151;font-size:14px;line-height:2;">
                  ✓ &nbsp;Datenschutzerklärung Generator<br/>
                  ✓ &nbsp;Impressum Generator<br/>
                  ✓ &nbsp;Cookie-Banner Generator (bis 5 Domains)<br/>
                  ✓ &nbsp;Priority Support
                </div>` : `
                <div style="color:#374151;font-size:14px;line-height:2;">
                  ✓ &nbsp;Datenschutzerklärung Generator<br/>
                  ✓ &nbsp;Impressum Generator<br/>
                  ✓ &nbsp;Cookie-Banner Generator (1 Domain)<br/>
                  ✓ &nbsp;Compliance-Scan für Ihre Website
                </div>`}
              </div>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 32px;text-align:center;">
              <a href="https://dataquard.ch/dashboard"
                style="display:inline-block;background:linear-gradient(135deg,#00e676,#00c853);color:#040c1c;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none;">
                Zum Dashboard →
              </a>
              <p style="margin:12px 0 0;color:#9ca3af;font-size:13px;">
                Angemeldet als ${userEmail}
              </p>
            </td>
          </tr>

          <!-- Rechnung -->
          <tr>
            <td style="padding:0 40px 32px;">
              <div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
                <div style="background:#f9fafb;padding:12px 20px;border-bottom:1px solid #e5e7eb;">
                  <span style="font-size:13px;font-weight:700;color:#374151;">Quittung / Rechnung</span>
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
                    <td style="font-size:14px;font-weight:700;color:#1a1a2e;text-align:right;">${currency} ${planPrice}</td>
                  </tr>
                </table>
              </div>
              <p style="font-size:12px;color:#9ca3af;margin:8px 0 0;text-align:center;">
                Einmalkauf · Keine Verlängerung · Keine versteckten Kosten
              </p>
            </td>
          </tr>

          <!-- Installationsanleitung -->
          <tr>
            <td style="padding:0 40px 32px;">
              <div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
                <div style="background:#fafafa;padding:14px 20px;border-bottom:1px solid #e5e7eb;">
                  <span style="font-size:14px;font-weight:700;color:#1a1a2e;">
                    🛠️ So installieren Sie Ihre Dokumente
                  </span>
                </div>
                <div style="padding:20px 24px;">

                  <div style="background:#fef9c3;border:1px solid #fde68a;border-radius:6px;padding:12px 16px;margin-bottom:20px;">
                    <span style="font-size:13px;color:#92400e;font-weight:600;">
                      💾 Wichtig: Speichern Sie alle Dokumente lokal auf Ihrem Computer bevor Sie beginnen.
                    </span>
                  </div>

                  <!-- Schritt 1: Datenschutzerklärung -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:18px;">
                    <tr>
                      <td width="28" valign="top">
                        <div style="width:22px;height:22px;background:#0b1829;border-radius:50%;text-align:center;line-height:22px;font-size:11px;font-weight:700;color:#00e676;">1</div>
                      </td>
                      <td style="padding-left:10px;">
                        <div style="font-size:13px;font-weight:700;color:#1a1a2e;margin-bottom:4px;">📄 Datenschutzerklärung einbinden</div>
                        <div style="font-size:13px;color:#6b7280;line-height:1.7;">
                          1. Melden Sie sich unter <a href="https://dataquard.ch/dashboard" style="color:#2563eb;">dataquard.ch/dashboard</a> an<br/>
                          2. Klicken Sie auf <strong style="color:#374151;">„Datenschutzerklärung generieren"</strong><br/>
                          3. Dokument als <strong style="color:#374151;">PDF herunterladen</strong> und lokal speichern<br/>
                          4. Auf Ihrer Website eine neue Seite <strong style="color:#374151;">/datenschutz</strong> erstellen<br/>
                          5. Den generierten Text dort einfügen und Seite veröffentlichen<br/>
                          6. Im Footer einen Link hinzufügen: <code style="background:#f3f4f6;padding:2px 6px;border-radius:3px;font-size:12px;">&lt;a href="/datenschutz"&gt;Datenschutz&lt;/a&gt;</code>
                        </div>
                      </td>
                    </tr>
                  </table>

                  <!-- Schritt 2: Impressum -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:18px;">
                    <tr>
                      <td width="28" valign="top">
                        <div style="width:22px;height:22px;background:#0b1829;border-radius:50%;text-align:center;line-height:22px;font-size:11px;font-weight:700;color:#00e676;">2</div>
                      </td>
                      <td style="padding-left:10px;">
                        <div style="font-size:13px;font-weight:700;color:#1a1a2e;margin-bottom:4px;">🏢 Impressum einbinden</div>
                        <div style="font-size:13px;color:#6b7280;line-height:1.7;">
                          1. Unter <a href="https://dataquard.ch/impressum-generator" style="color:#2563eb;">dataquard.ch/impressum-generator</a> Ihre Daten eingeben<br/>
                          2. Impressum als <strong style="color:#374151;">PDF herunterladen</strong> und lokal speichern<br/>
                          3. Auf Ihrer Website eine neue Seite <strong style="color:#374151;">/impressum</strong> erstellen<br/>
                          4. Den generierten Text einfügen und Seite veröffentlichen<br/>
                          5. Im Footer einen Link hinzufügen: <code style="background:#f3f4f6;padding:2px 6px;border-radius:3px;font-size:12px;">&lt;a href="/impressum"&gt;Impressum&lt;/a&gt;</code>
                        </div>
                      </td>
                    </tr>
                  </table>

                  <!-- Schritt 3: Cookie-Banner -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:18px;">
                    <tr>
                      <td width="28" valign="top">
                        <div style="width:22px;height:22px;background:#0b1829;border-radius:50%;text-align:center;line-height:22px;font-size:11px;font-weight:700;color:#00e676;">3</div>
                      </td>
                      <td style="padding-left:10px;">
                        <div style="font-size:13px;font-weight:700;color:#1a1a2e;margin-bottom:4px;">🍪 Cookie-Banner installieren</div>
                        <div style="font-size:13px;color:#6b7280;line-height:1.7;">
                          1. Unter <a href="https://dataquard.ch/cookie-banner-generator" style="color:#2563eb;">dataquard.ch/cookie-banner-generator</a> Banner konfigurieren<br/>
                          2. Wählen Sie <strong style="color:#374151;">React/Next.js</strong> oder <strong style="color:#374151;">Vanilla JS</strong><br/>
                          3. Code mit <strong style="color:#374151;">„Kopieren"</strong> in die Zwischenablage kopieren<br/>
                          <strong style="color:#374151;">WordPress:</strong> Appearance → Theme Editor → footer.php → vor <code style="background:#f3f4f6;padding:2px 6px;border-radius:3px;font-size:12px;">&lt;/body&gt;</code><br/>
                          <strong style="color:#374151;">Wix/Squarespace:</strong> Einstellungen → Benutzerdefinierter Code<br/>
                          <strong style="color:#374151;">Next.js:</strong> In <code style="background:#f3f4f6;padding:2px 6px;border-radius:3px;font-size:12px;">layout.tsx</code> vor <code style="background:#f3f4f6;padding:2px 6px;border-radius:3px;font-size:12px;">&lt;/body&gt;</code>
                        </div>
                      </td>
                    </tr>
                  </table>

                  <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:12px 16px;">
                    <span style="font-size:13px;color:#15803d;">
                      ✅ <strong>Tipp:</strong> Erstellen Sie einen Ordner <strong>„Dataquard – [Ihre Domain]"</strong>
                      und speichern Sie alle Dokumente (PDF, Code-Snippets) dort ab.
                    </span>
                  </div>

                </div>
              </div>
            </td>
          </tr>

          <!-- Support -->
          <tr>
            <td style="padding:0 40px 32px;">
              <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px 20px;text-align:center;">
                <div style="font-size:13px;color:#1e40af;">
                  Fragen? Schreiben Sie uns:<br/>
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
