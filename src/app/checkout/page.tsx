// src/app/checkout/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PageWrapper } from '../components/PageWrapper';

const G = {
  green: '#22c55e',
  greenBg: 'rgba(34,197,94,0.08)',
  bgWhite: '#ffffff',
  bgLight: '#f1f2f6',
  border: '#e2e4ea',
  text: '#1a1a2e',
  textSec: '#555566',
  textMuted: '#888899',
  red: '#dc2626',
  redBg: 'rgba(220,38,38,0.06)',
  redBorder: 'rgba(220,38,38,0.15)',
  violet: '#8B5CF6',
  violetBg: 'rgba(139,92,246,0.08)',
  violetBorder: 'rgba(139,92,246,0.25)',
};

const plans = [
  {
    id: 'impressum',
    name: 'IMPRESSUM ONLY',
    price: 19,
    interval: 'Einmalkauf',
    desc: 'Nur das Impressum',
    features: ['Impressum Generator', 'Schweiz + Deutschland', 'Sofort downloadbar'],
    highlight: false,
    isAddon: false,
  },
  {
    id: 'starter',
    name: 'STARTER',
    price: 79,
    interval: 'Einmalkauf',
    desc: 'Für Schweizer KMUs',
    features: ['Alles aus Free', 'Datenschutzerklärung', 'Impressum Generator', 'Cookie-Banner Generator', '1 Domain'],
    highlight: true,
    isAddon: false,
  },
  {
    id: 'professional',
    name: 'PROFESSIONAL',
    price: 149,
    interval: 'Einmalkauf',
    desc: 'Für wachsende Teams',
    features: ['Alles aus Starter', 'Bis zu 5 Domains', 'AGB-Vorlage', 'Priority Support', 'Rechtliche Alerts'],
    highlight: false,
    isAddon: false,
  },
  {
    id: 'ai-trust',
    name: 'AI-TRUST ABO',
    price: 99,
    interval: 'pro Jahr',
    desc: 'Laufende KI-Überwachung',
    features: [
      'KI-Bild-Erkennung (unbegrenzt)',
      'Deepfake-Check nach EU AI Act',
      'EU AI Act Art. 50 Klausel',
      'Wöchentliche Änderungs-Alerts',
      'AI-Trust Badge & Banner',
      'Automatisches Re-Scanning',
    ],
    highlight: false,
    isAddon: true,
  },
];

function CheckoutContent() {
  const searchParams = useSearchParams();
  const planParam = searchParams.get('plan');

  const [selectedPlan, setSelectedPlan] = useState('starter');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (planParam && plans.find(p => p.id === planParam)) {
      setSelectedPlan(planParam);
    }
  }, [planParam]);

  const handlePayment = async (planId?: string) => {
    const planToUse = planId ?? selectedPlan;
    if (planId) setSelectedPlan(planId);
    setLoading(true);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: planToUse,
          userId: session?.user?.id ?? null,
          userEmail: session?.user?.email ?? null,
        }),
      });
      const result = await response.json();
      if (result.url) {
        window.location.href = result.url;
      } else {
        setError(result.error || 'Fehler beim Starten der Zahlung');
        setLoading(false);
      }
    } catch {
      setError('Verbindungsfehler – bitte versuchen Sie es nochmals');
      setLoading(false);
    }
  };

  const selectedPlanData = plans.find(p => p.id === selectedPlan);
  const isAiTrust = selectedPlan === 'ai-trust';
  const accentColor = isAiTrust ? G.violet : G.green;
  const accentBg = isAiTrust ? G.violetBg : G.greenBg;

  return (
    <div style={{ maxWidth: 1020, margin: '0 auto', padding: '48px 24px' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4, color: G.text }}>Bestellung</h1>
          <p style={{ color: G.textSec, fontSize: 14 }}>Wählen Sie Ihren Plan</p>
        </div>
        <Link href="/" style={{ color: G.green, fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>← Zurück</Link>
      </div>

      {/* Plan Selection */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
        {plans.map(plan => {
          const isSelected = selectedPlan === plan.id;
          const isViolet = plan.id === 'ai-trust';
          const borderColor = isSelected ? (isViolet ? G.violet : G.green) : G.border;
          const shadow = isSelected ? `0 4px 20px ${isViolet ? G.violetBg : G.greenBg}` : '0 2px 8px rgba(0,0,0,0.03)';

          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              style={{
                cursor: 'pointer',
                background: isViolet ? (isSelected ? 'rgba(139,92,246,0.04)' : G.bgWhite) : G.bgWhite,
                border: isSelected ? `2px solid ${borderColor}` : `1px solid ${isViolet ? G.violetBorder : G.border}`,
                borderRadius: 14,
                padding: 24,
                position: 'relative',
                boxShadow: shadow,
                transition: 'all 0.15s',
              }}
            >
              {plan.highlight && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: G.green, color: '#fff', fontSize: 9, fontWeight: 800, padding: '3px 12px', borderRadius: 20, letterSpacing: 1 }}>EMPFOHLEN</div>
              )}
              {plan.isAddon && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: G.violet, color: '#fff', fontSize: 9, fontWeight: 800, padding: '3px 12px', borderRadius: 20, letterSpacing: 1 }}>ADD-ON · ABO</div>
              )}
              <h2 style={{ fontSize: 15, fontWeight: 700, color: isViolet ? G.violet : G.text, marginBottom: 4 }}>{plan.name}</h2>
              <p style={{ color: G.textMuted, fontSize: 13, marginBottom: 12 }}>{plan.desc}</p>
              <div style={{ fontSize: 28, fontWeight: 900, color: isViolet ? G.violet : (plan.highlight ? G.green : G.text), marginBottom: 2 }}>CHF {plan.price}</div>
              <div style={{ fontSize: 12, color: G.textMuted, marginBottom: 16 }}>{plan.interval}</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', gap: 8, fontSize: 13, color: G.textSec }}>
                    <span style={{ color: isViolet ? G.violet : G.green }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <button
                onClick={e => { e.stopPropagation(); handlePayment(plan.id); }}
                disabled={loading}
                style={{
                  background: isViolet ? G.violet : G.green,
                  color: '#fff',
                  width: '100%',
                  padding: '12px',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 14,
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading && selectedPlan === plan.id
                  ? <><img src="/uhr.png" alt="" width={16} height={16} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 6 }} />Weiterleitung…</>
                  : isViolet
                    ? `Abonnieren – CHF ${plan.price}/Jahr`
                    : `Jetzt kaufen – CHF ${plan.price}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Info box */}
      {selectedPlan === 'impressum' && (
        <div style={{ background: G.bgWhite, border: `1px solid ${G.border}`, borderRadius: 12, padding: '24px 28px', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: G.text, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}><img src="/dokument.png" alt="" width={20} height={20} style={{ display: 'inline-block', verticalAlign: 'middle' }} /> Impressum Generator</h3>
          <p style={{ color: G.textSec, fontSize: 13, lineHeight: 1.6 }}>Nach der Zahlung werden Sie direkt zum Impressum Generator weitergeleitet. Das fertige Impressum können Sie sofort herunterladen.</p>
        </div>
      )}
      {(selectedPlan === 'starter' || selectedPlan === 'professional') && (
        <div style={{ background: G.bgWhite, border: `1px solid ${G.border}`, borderRadius: 12, padding: '24px 28px', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: G.text, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}><img src="/badge-ai-trust.svg" alt="AI" width={20} height={20} style={{ display: 'inline-block' }} /> AI Datenschutzerklärung inklusive</h3>
          <p style={{ color: G.textSec, fontSize: 13, lineHeight: 1.6 }}>Nach der Zahlung können Sie im Dashboard Ihre Domain eingeben und die Datenschutzerklärung automatisch generieren lassen.</p>
        </div>
      )}
      {selectedPlan === 'ai-trust' && (
        <div style={{ background: G.violetBg, border: `1px solid ${G.violetBorder}`, borderRadius: 12, padding: '24px 28px', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: G.violet, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}><img src="/badge-ai-trust.svg" alt="AI-Trust" width={20} height={20} style={{ display: 'inline-block' }} /> AI-Trust – Laufende KI-Überwachung</h3>
          <p style={{ color: G.textSec, fontSize: 13, lineHeight: 1.6 }}>
            Das AI-Trust Abo überwacht Ihre Website wöchentlich auf KI-generierte Inhalte und Deepfakes nach EU AI Act Art. 50. Sie erhalten E-Mail-Alerts bei Änderungen und können den AI-Trust Badge auf Ihrer Website einbinden.
          </p>
        </div>
      )}

      {/* Order summary */}
      <div style={{ background: G.bgWhite, border: `1px solid ${isAiTrust ? G.violetBorder : G.border}`, borderRadius: 14, padding: '28px' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: G.text, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><img src="/ablage.png" alt="" width={20} height={20} style={{ display: 'inline-block', verticalAlign: 'middle' }} /> Bestellübersicht</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, marginBottom: 8, color: G.text }}>
          <span>{selectedPlanData?.name}</span>
          <span style={{ color: accentColor }}>CHF {selectedPlanData?.price}</span>
        </div>
        {selectedPlanData && (
          <div style={{ fontSize: 12, color: G.textMuted, marginBottom: 20 }}>
            {isAiTrust ? 'Jahres-Abo · automatisch verlängerbar · kündbar jederzeit' : 'Einmalkauf · keine Folgekosten'}
          </div>
        )}

        {error && (
          <div style={{ background: G.redBg, border: `1px solid ${G.redBorder}`, borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: G.red, fontSize: 13 }}>
            <img src="/warnung.png" alt="" width={16} height={16} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 6 }} />{error}
          </div>
        )}

        <button
          onClick={() => handlePayment()}
          disabled={loading}
          style={{ width: '100%', padding: '14px', background: accentColor, color: '#fff', fontWeight: 700, border: 'none', borderRadius: 10, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
        >
          {loading
            ? <><img src="/uhr.png" alt="" width={16} height={16} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 6 }} />Weiterleitung zu Stripe...</>
            : isAiTrust
              ? `Jetzt abonnieren – CHF ${selectedPlanData?.price}/Jahr`
              : `Jetzt kaufen – CHF ${selectedPlanData?.price}`}
        </button>
        <p style={{ textAlign: 'center', color: G.textMuted, fontSize: 12, marginTop: 10 }}>
          Sichere Zahlung via Stripe · {isAiTrust ? 'Jederzeit kündbar · ' : '14 Tage Geld-zurück-Garantie · '}Schweizer Qualität
        </p>
      </div>

    </div>
  );
}

export default function CheckoutPage() {
  return (
    <PageWrapper>
      <Suspense fallback={<div style={{ padding: 48, textAlign: 'center', color: '#888' }}>Laden…</div>}>
        <CheckoutContent />
      </Suspense>
    </PageWrapper>
  );
}
