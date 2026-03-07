// src/app/checkout/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

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
        // Stripe Checkout öffnen
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

  const selectedPlanData = plans.find((p) => p.id === selectedPlan);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">

        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2">Bestellung</h1>
            <p className="text-gray-300">Wählen Sie Ihren Plan</p>
          </div>
          <Link href="/" className="text-indigo-400 hover:text-indigo-300">← Zurück</Link>
        </div>

        {/* Plan Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`border-2 rounded-xl p-6 cursor-pointer transition ${
                selectedPlan === plan.id
                  ? 'border-indigo-500 bg-white md:bg-indigo-900 md:bg-opacity-50'
                  : 'border-gray-200 md:border-indigo-700 bg-white md:bg-indigo-900 md:bg-opacity-20 hover:border-indigo-400'
              }`}
            >
              {plan.highlight && (
                <div className="inline-block bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded mb-3">⭐ EMPFOHLEN</div>
              )}
              <h2 className="text-xl font-bold mb-1 text-gray-900 md:text-white">{plan.name}</h2>
              <p className="text-gray-500 md:text-gray-400 text-sm mb-3">{plan.desc}</p>
              <div className="text-3xl font-bold text-indigo-600 md:text-indigo-300 mb-1">CHF {plan.price}</div>
              <div className="text-sm text-gray-500 md:text-gray-400 mb-4">{plan.interval}</div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="text-gray-700 md:text-gray-300 text-sm flex gap-2">
                    <span className="text-green-500 md:text-green-400">✓</span>{f}
                  </li>
                ))}
              </ul>
              <button
                onClick={(e) => { e.stopPropagation(); handlePayment(plan.id); }}
                disabled={loading}
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition disabled:opacity-50 text-sm"
              >
                {loading && selectedPlan === plan.id ? '⏳ Weiterleitung…' : `Jetzt kaufen – CHF ${plan.price}`}
              </button>
            </div>
          ))}
        </div>

        {/* Info-Box je nach Plan */}
        {selectedPlan === 'impressum' && (
          <div className="bg-indigo-900 bg-opacity-30 border border-indigo-700 p-8 rounded-lg mb-8">
            <h3 className="text-xl font-bold mb-2">📄 Impressum Generator</h3>
            <p className="text-gray-300">
              Nach der Zahlung werden Sie direkt zum Impressum Generator weitergeleitet.
              Das fertige Impressum können Sie sofort herunterladen.
            </p>
          </div>
        )}

        {(selectedPlan === 'starter' || selectedPlan === 'professional') && (
          <div className="bg-indigo-900 bg-opacity-30 border border-indigo-700 p-8 rounded-lg mb-8">
            <h3 className="text-xl font-bold mb-2">🤖 AI Datenschutzerklärung inklusive</h3>
            <p className="text-gray-300">
              Nach der Zahlung können Sie im Dashboard Ihre Domain eingeben und die
              Datenschutzerklärung automatisch generieren lassen.
            </p>
          </div>
        )}

        {/* Bestellübersicht */}
        <div className="bg-indigo-900 bg-opacity-50 border border-indigo-700 p-8 rounded-lg">
          <h3 className="text-xl font-bold mb-4">📋 Bestellübersicht</h3>
          <div className="flex justify-between text-lg font-bold mb-6">
            <span>{selectedPlanData?.name}</span>
            <span className="text-indigo-300">CHF {selectedPlanData?.price}</span>
          </div>

          {error && (
            <div className="bg-red-900 bg-opacity-50 border border-red-600 rounded-lg p-4 mb-4 text-red-300 text-sm">
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={() => handlePayment()}
            disabled={loading}
            className="w-full px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {loading ? '⏳ Weiterleitung zu Stripe...' : `💳 Jetzt kaufen – CHF ${selectedPlanData?.price}`}
          </button>

          <p className="text-center text-gray-400 text-xs mt-3">
            Sichere Zahlung via Stripe · 30 Tage Geld-zurück-Garantie · Schweizer Qualität
          </p>
        </div>

      </div>
    </div>
  );
}