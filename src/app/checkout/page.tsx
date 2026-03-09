// src/app/checkout/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
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
  },
  {
    id: 'starter',
    name: 'STARTER',
    price: 79,
    interval: 'Einmalkauf',
    desc: 'Für Schweizer KMUs',
    features: ['Alles aus Free', 'Datenschutzerklärung', 'Impressum Generator', 'Cookie-Banner Generator', '1 Domain'],
    highlight: true,
  },
  {
    id: 'professional',
    name: 'PROFESSIONAL',
    price: 149,
    interval: 'Einmalkauf',
    desc: 'Für wachsende Teams',
    features: ['Alles aus Starter', 'Bis zu 5 Domains', 'AGB-Vorlage', 'Priority Support', 'Rechtliche Alerts'],
    highlight: false,
  },
];

export default function CheckoutPage() {
  const [selectedPlan, setSelectedPlan] = useState('starter');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  return (
    <PageWrapper>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 24px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4, color: G.text }}>Bestellung</h1>
            <p style={{ color: G.textSec, fontSize: 14 }}>Wählen Sie Ihren Plan</p>
          </div>
          <Link href="/" style={{ color: G.green, fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>← Zurück</Link>
        </div>

        {/* Plan Selection */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 32 }}>
          {plans.map(plan => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              style={{
                cursor: 'pointer',
                background: G.bgWhite,
                border: selectedPlan === plan.id ? `2px solid ${G.green}` : `1px solid ${G.border}`,
                borderRadius: 14,
                padding: 24,
                position: 'relative',
                boxShadow: selectedPlan === plan.id ? `0 4px 20px ${G.greenBg}` : '0 2px 8px rgba(0,0,0,0.03)',
                transition: 'all 0.15s',
              }}
            >
              {plan.highlight && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: G.green, color: '#fff', fontSize: 9, fontWeight: 800, padding: '3px 12px', borderRadius: 20, letterSpacing: 1 }}>EMPFOHLEN</div>
              )}
              <h2 style={{ fontSize: 15, fontWeight: 700, color: G.text, marginBottom: 4 }}>{plan.name}</h2>
              <p style={{ color: G.textMuted, fontSize: 13, marginBottom: 12 }}>{plan.desc}</p>
              <div style={{ fontSize: 28, fontWeight: 900, color: plan.highlight ? G.green : G.text, marginBottom: 4 }}>CHF {plan.price}</div>
              <div style={{ fontSize: 12, color: G.textMuted, marginBottom: 16 }}>{plan.interval}</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', gap: 8, fontSize: 13, color: G.textSec }}>
                    <span style={{ color: G.green }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <button
                onClick={e => { e.stopPropagation(); handlePayment(plan.id); }}
                disabled={loading}
                style={{ background: G.green, color: '#fff', width: '100%', padding: '12px', borderRadius: 8, fontWeight: 700, fontSize: 14, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
              >
                {loading && selectedPlan === plan.id ? '⏳ Weiterleitung…' : `Jetzt kaufen – CHF ${plan.price}`}
              </button>
            </div>
          ))}
        </div>

        {/* Info box */}
        {selectedPlan === 'impressum' && (
          <div style={{ background: G.bgWhite, border: `1px solid ${G.border}`, borderRadius: 12, padding: '24px 28px', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: G.text, marginBottom: 6 }}>📄 Impressum Generator</h3>
            <p style={{ color: G.textSec, fontSize: 13, lineHeight: 1.6 }}>Nach der Zahlung werden Sie direkt zum Impressum Generator weitergeleitet. Das fertige Impressum können Sie sofort herunterladen.</p>
          </div>
        )}
        {(selectedPlan === 'starter' || selectedPlan === 'professional') && (
          <div style={{ background: G.bgWhite, border: `1px solid ${G.border}`, borderRadius: 12, padding: '24px 28px', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: G.text, marginBottom: 6 }}>🤖 AI Datenschutzerklärung inklusive</h3>
            <p style={{ color: G.textSec, fontSize: 13, lineHeight: 1.6 }}>Nach der Zahlung können Sie im Dashboard Ihre Domain eingeben und die Datenschutzerklärung automatisch generieren lassen.</p>
          </div>
        )}

        {/* Order summary */}
        <div style={{ background: G.bgWhite, border: `1px solid ${G.border}`, borderRadius: 14, padding: '28px' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: G.text, marginBottom: 16 }}>📋 Bestellübersicht</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, marginBottom: 20, color: G.text }}>
            <span>{selectedPlanData?.name}</span>
            <span style={{ color: G.green }}>CHF {selectedPlanData?.price}</span>
          </div>

          {error && (
            <div style={{ background: G.redBg, border: `1px solid ${G.redBorder}`, borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: G.red, fontSize: 13 }}>
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={() => handlePayment()}
            disabled={loading}
            style={{ width: '100%', padding: '14px', background: G.green, color: '#fff', fontWeight: 700, border: 'none', borderRadius: 10, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? '⏳ Weiterleitung zu Stripe...' : `💳 Jetzt kaufen – CHF ${selectedPlanData?.price}`}
          </button>
          <p style={{ textAlign: 'center', color: G.textMuted, fontSize: 12, marginTop: 10 }}>
            Sichere Zahlung via Stripe · 30 Tage Geld-zurück-Garantie · Schweizer Qualität
          </p>
        </div>

      </div>
    </PageWrapper>
  );
}
