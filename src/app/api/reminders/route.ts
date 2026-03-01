// src/app/api/reminders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
    }

    const { email, domain, scanId } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: 'Ungültige E-Mail' }, { status: 400 });
    }
    if (!domain) {
      return NextResponse.json({ success: false, error: 'Domain fehlt' }, { status: 400 });
    }

    // Prüfen ob bereits ein Reminder für diese E-Mail+Domain existiert
    const { data: existing } = await supabase
      .from('reminders')
      .select('id')
      .eq('email', email)
      .eq('domain', domain)
      .eq('status', 'pending')
      .single();

    if (existing) {
      return NextResponse.json({ success: true, data: { message: 'Reminder bereits vorhanden' } });
    }

    // Reminder in DB speichern
    const scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const { data: reminder, error } = await supabase
      .from('reminders')
      .insert({
        email,
        domain,
        scan_id: scanId || null,
        status: 'pending',
        scheduled_at: scheduledAt,
      })
      .select()
      .single();

    if (error) throw error;

    // Sofort erste E-Mail senden
    await resend.emails.send({
      from: 'Dataquard <noreply@dataquard.ch>',
      to: email,
      subject: `Ihr Scan-Ergebnis für ${domain} – Handlungsbedarf`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Ihr Dataquard-Scan ist abgeschlossen</h2>
          <p>Wir haben <strong>${domain}</strong> gescannt und Compliance-Risiken festgestellt.</p>
          <p>Ein fehlendes Impressum oder eine fehlende Datenschutzerklärung kann zu Bussgeldern bis CHF 50'000 führen.</p>
          <div style="margin: 30px 0;">
            <a href="https://dataquard.ch/checkout" style="background: #4F46E5; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Jetzt rechtssicher werden →
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">Dataquard · Basel, Schweiz · <a href="https://dataquard.ch">dataquard.ch</a></p>
        </div>
      `,
    });

    // Status auf 'sent' aktualisieren
    await supabase
      .from('reminders')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', reminder.id);

    return NextResponse.json({
      success: true,
      data: { reminderId: reminder.id, email, domain, scheduledAt },
    });

  } catch (error) {
    console.error('Reminder error:', error);
    return NextResponse.json({ success: false, error: 'Server-Fehler' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    let query = supabase.from('reminders').select('*').order('created_at', { ascending: false });
    if (email) query = query.eq('email', email);

    const { data: reminders, error } = await query.limit(50);
    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: {
        reminders: reminders || [],
        totalReminders: reminders?.length || 0,
        sentCount: reminders?.filter((r) => r.status === 'sent').length || 0,
        pendingCount: reminders?.filter((r) => r.status === 'pending').length || 0,
      },
    });

  } catch (error) {
    console.error('Reminder fetch error:', error);
    return NextResponse.json({ success: false, error: 'Server-Fehler' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({});
}