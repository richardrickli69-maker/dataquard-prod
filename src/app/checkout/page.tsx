'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const plans = [
  {
    id: 'impressum',
    name: 'Impressum Only',
    price: 'CHF 19',
    description: 'Einmaliger Kauf',
    features: [
      'Impressum Generator',
      'CH + DE konform',
      'HTML-Export',
    ],
    highlight: false,
    priceId: 'price_impressum',
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 'CHF 79',
    description: 'Pro Jahr',
    features: [
      'Website Scanner',
      'Datenschutzerklärung',
      'Impressum Generator',
      'Cookie-Analyse',
      'Automatische Updates',
      '1 Domain',
    ],
    highlight: true,
    priceId: 'price_starter',
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 'CHF 199',
    description: 'Pro Jahr',
    features: [
      'Alles aus Starter',
      'Bis zu 5 Domains',
      'Monatliche Re-Scans',
      'AGB-Vorlage',
      'Priority Support',
      'Rechtliche Alerts',
    ],
    highlight: false,
    priceId: 'price_professional',
  },
];

export default function CheckoutPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCheckout = async (planId: string) => {
    setLoading(planId);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: planId }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        setError(data.error);
      } else {
        setError('Fehler beim Starten des Checkouts.');
      }
    } catch {
      setError('Verbindungsfehler. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-black text-white px-4 py-16">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Plan wählen
          </h1>
          <p className="text-gray-400 text-lg">
            Alle Preise in CHF inkl. MwSt. · Keine versteckten Kosten
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900 border border-red-600 text-red-200 rounded-xl p-4 mb-8 text-center">
            ⚠️ {error}
          </div>
        )}

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl p-6 border ${
                plan.highlight
                  ? 'border-indigo-500 bg-indigo-900 bg-opacity-60'
                  : 'border-gray-700 bg-gray-900 bg-opacity-40'
              }`}
            >
              {plan.highlight && (
                <div className="text-center mb-4">
                  <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    ⭐ EMPFOHLEN
                  </span>
                </div>
              )}

              <h2 className="text-xl font-bold text-white mb-1">{plan.name}</h2>
              <div className="mb-1">
                <span className="text-3xl font-bold text-white">{plan.price}</span>
              </div>
              <p className="text-gray-400 text-sm mb-6">{plan.description}</p>

              <ul className="space-y-2 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                    <span className="text-green-400">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(plan.id)}
                disabled={loading !== null}
                className={`w-full py-3 rounded-xl font-bold transition-all ${
                  plan.highlight
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading === plan.id ? '⏳ Wird geladen...' : `${plan.name} wählen →`}
              </button>
            </div>
          ))}
        </div>

        {/* Back */}
        <div className="text-center">
          <a href="/scanner" className="text-gray-400 hover:text-white transition-all text-sm">
            ← Zurück zum Scanner
          </a>
        </div>

      </div>
    </div>
  );
}