'use client';

// src/app/checkout/success/page.tsx
// Bestätigung nach erfolgreichem Jahresabo-Abschluss (Starter / Professional)
import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PageWrapper } from '../../components/PageWrapper';

const G = {
  green: '#22c55e',
  greenBg: 'rgba(34,197,94,0.08)',
  greenBorder: 'rgba(34,197,94,0.25)',
  bgWhite: '#ffffff',
  border: '#e2e4ea',
  text: '#1a1a2e',
  textSec: '#555566',
  textMuted: '#888899',
};

function SuccessInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const product = searchParams.get('product');
  const sessionId = searchParams.get('session_id');

  const planLabel = product === 'professional' ? 'Professional' : 'Starter';

  useEffect(() => {
    if (!sessionId) return;
    let cleanup: (() => void) | undefined;
    const run = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
          await fetch('/api/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'welcome',
              email: session.user.email,
              name: session.user.user_metadata?.full_name ?? session.user.email,
            }),
          });
        }
      } catch {
        // Willkommens-E-Mail optional – kein Fehler werfen
      }
      // Weiterleitung zum Dashboard nach 3 Sekunden
      const t = setTimeout(() => router.push('/dashboard'), 3000);
      cleanup = () => clearTimeout(t);
    };
    run();
    return () => cleanup?.();
  }, [sessionId, router]);

  return (
    <PageWrapper>
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
          <div style={{ marginBottom: 24 }}>
            <img src="/icon-verifiziert.png" alt="Erfolg" width={72} height={72} style={{ display: 'inline-block' }} />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12, color: G.text }}>
            Ihr {planLabel}-Abo ist aktiv!
          </h1>
          <p style={{ color: G.textSec, fontSize: 15, marginBottom: 28 }}>
            Vielen Dank. Ihre Rechnung und die Einrichtungsanleitung wurden per E-Mail zugestellt. Sie werden jetzt zum Dashboard weitergeleitet.
          </p>

          <div style={{
            background: G.bgWhite,
            border: `2px solid ${G.green}`,
            borderRadius: 16,
            padding: 28,
            marginBottom: 20,
            textAlign: 'left',
            boxShadow: `0 4px 24px ${G.greenBg}`,
          }}>
            <h2 style={{ fontWeight: 700, color: G.text, marginBottom: 14, fontSize: 16 }}>
              ⭐ Dataquard {planLabel} – aktiv
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: G.textSec }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ color: G.green }}>✓</span>Datenschutzerklärung Generator freigeschaltet
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ color: G.green }}>✓</span>Dashboard-Zugang aktiv
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ color: G.green }}>✓</span>AI-Trust Scan inklusive
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ color: G.green }}>✓</span>Monatlicher Compliance-Report aktiviert
              </div>
            </div>
          </div>

          {/* Lade-Spinner mit Weiterleitungshinweis */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: G.textMuted, fontSize: 13 }}>
            <svg
              style={{ width: 18, height: 18, animation: 'spin 1s linear infinite', flexShrink: 0, color: G.green }}
              fill="none" viewBox="0 0 24 24"
            >
              <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span>Weiterleitung zum Dashboard…</span>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

          <div style={{ marginTop: 20 }}>
            <a href="/dashboard" style={{ color: G.green, fontSize: 13, textDecoration: 'underline' }}>
              Nicht weitergeleitet? Hier klicken →
            </a>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <PageWrapper>
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div><img src="/icon-verifiziert.png" alt="Erfolg" width={48} height={48} style={{ display: 'inline-block' }} /></div>
        </div>
      </PageWrapper>
    }>
      <SuccessInner />
    </Suspense>
  );
}
