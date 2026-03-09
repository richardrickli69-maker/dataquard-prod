'use client';

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
            body: JSON.stringify({ type: 'welcome', email: session.user.email, name: session.user.user_metadata?.full_name ?? session.user.email }),
          });
        }
      } catch {}
      if (product === 'impressum') {
        const t = setTimeout(() => router.push('/impressum-generator'), 2500);
        cleanup = () => clearTimeout(t);
      } else {
        const t = setTimeout(() => router.push('/dashboard'), 3000);
        cleanup = () => clearTimeout(t);
      }
    };
    run();
    return () => cleanup?.();
  }, [sessionId, product, router]);

  const isImpressum = product === 'impressum';

  return (
    <PageWrapper>
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: 72, marginBottom: 24 }}>✅</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12, color: G.text }}>Vielen Dank für Ihren Kauf!</h1>
          <p style={{ color: G.textSec, fontSize: 15, marginBottom: 28 }}>
            {isImpressum
              ? 'Ihr Impressum wird jetzt freigeschaltet. Sie werden in Kürze weitergeleitet...'
              : 'Ihr Dataquard-Zugang ist aktiv. Sie werden zum Dashboard weitergeleitet...'}
          </p>

          <div style={{ background: G.bgWhite, border: `1px solid ${G.border}`, borderRadius: 16, padding: 24, marginBottom: 28, textAlign: 'left', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontWeight: 700, color: G.text, marginBottom: 12, fontSize: 16 }}>
              {isImpressum ? '📄 Impressum' : product === 'starter' ? '⭐ Dataquard Starter' : '🚀 Dataquard Professional'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: G.textSec }}>
              {isImpressum ? (
                <>
                  <div style={{ display: 'flex', gap: 8 }}><span style={{ color: G.green }}>✓</span>Sofort-Download freigeschaltet</div>
                  <div style={{ display: 'flex', gap: 8 }}><span style={{ color: G.green }}>✓</span>nDSG / TMG-konform</div>
                  <div style={{ display: 'flex', gap: 8 }}><span style={{ color: G.green }}>✓</span>Für Schweiz &amp; Deutschland</div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: 8 }}><span style={{ color: G.green }}>✓</span>Datenschutzerklärung aktiviert</div>
                  <div style={{ display: 'flex', gap: 8 }}><span style={{ color: G.green }}>✓</span>Dashboard-Zugang freigeschaltet</div>
                </>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: G.textMuted, fontSize: 13 }}>
            <svg style={{ width: 18, height: 18, animation: 'spin 1s linear infinite', flexShrink: 0, color: G.green }} fill="none" viewBox="0 0 24 24">
              <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span>{isImpressum ? 'Weiterleitung zum Impressum Generator...' : 'Weiterleitung zum Dashboard...'}</span>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

          <div style={{ marginTop: 20 }}>
            <a href={isImpressum ? '/impressum-generator' : '/dashboard'} style={{ color: G.green, fontSize: 13, textDecoration: 'underline' }}>
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
          <div style={{ fontSize: 48 }}>✅</div>
        </div>
      </PageWrapper>
    }>
      <SuccessInner />
    </Suspense>
  );
}
