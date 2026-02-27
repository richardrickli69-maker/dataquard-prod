'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const PRODUCTS = {
  impressum: {
    name: 'Impressum',
    price: 19,
    description: 'Rechtssicheres Impressum für Ihre Website',
    features: [
      'Sofort-Download als .txt & HTML',
      'nDSG / TMG-konform',
      'Inkl. Haftungsausschluss',
      'Für Schweiz & Deutschland',
    ],
  },
  starter: {
    name: 'Starter',
    price: 79,
    description: 'Komplettschutz für Ihre Website – pro Jahr',
    features: [
      'Datenschutzerklärung (nDSG/DSGVO)',
      'Impressum Generator',
      'Cookie-Analyse & Ampel',
      'Performance-Check',
      'Automatische Updates',
      '1 Domain',
    ],
  },
  professional: {
    name: 'Professional',
    price: 199,
    description: 'Für wachsende KMUs – pro Jahr',
    features: [
      'Alles aus Starter',
      'Bis zu 5 Domains',
      'Priorisierter Support',
      'Monatliche Re-Scans',
      'AGB-Vorlage',
      'Rechtliche Änderungs-Alerts',
    ],
  },
};

type ProductKey = keyof typeof PRODUCTS;

function CheckoutInner() {
  const searchParams = useSearchParams();
  const productParam = (searchParams.get('product') || 'starter') as ProductKey;
  const [selectedProduct, setSelectedProduct] = useState<ProductKey>(
    PRODUCTS[productParam] ? productParam : 'starter'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Test card info
  const [showTestInfo, setShowTestInfo] = useState(false);

  const product = PRODUCTS[selectedProduct];

  const handleCheckout = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: selectedProduct,
          price: product.price,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Checkout fehlgeschlagen');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-black text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-3">🔒 Dataquard kaufen</h1>
          <p className="text-gray-300 text-lg">Wählen Sie Ihren Plan – sofort aktiv nach Zahlung.</p>
        </div>

        {/* Test Mode Banner */}
        <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-4 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-yellow-400 text-xl">🧪</span>
            <div>
              <p className="text-yellow-300 font-semibold text-sm">Test-Modus aktiv</p>
              <p className="text-yellow-400 text-xs">Keine echten Zahlungen – nur zum Testen</p>
            </div>
          </div>
          <button
            onClick={() => setShowTestInfo(!showTestInfo)}
            className="text-yellow-400 text-xs underline hover:text-yellow-300"
          >
            Testkarte anzeigen
          </button>
        </div>

        {showTestInfo && (
          <div className="bg-yellow-900 bg-opacity-50 border border-yellow-700 rounded-lg p-4 mb-6 font-mono text-sm">
            <p className="text-yellow-300 font-bold mb-2">Stripe Testkarte:</p>
            <p className="text-white">Kartennummer: <span className="text-yellow-300">4242 4242 4242 4242</span></p>
            <p className="text-white">Ablauf: <span className="text-yellow-300">12/34</span></p>
            <p className="text-white">CVC: <span className="text-yellow-300">123</span></p>
            <p className="text-white">PLZ: <span className="text-yellow-300">00000</span></p>
          </div>
        )}

        {/* Product Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {(Object.keys(PRODUCTS) as ProductKey[]).map((key) => {
            const p = PRODUCTS[key];
            const isSelected = selectedProduct === key;
            const isPopular = key === 'starter';

            return (
              <button
                key={key}
                onClick={() => setSelectedProduct(key)}
                className={`relative text-left p-6 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-indigo-400 bg-indigo-800 bg-opacity-80'
                    : 'border-indigo-700 bg-indigo-900 bg-opacity-40 hover:border-indigo-500'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Empfohlen ⭐
                  </div>
                )}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-white text-lg">{p.name}</h3>
                  {isSelected && (
                    <span className="text-indigo-400 text-xl">✓</span>
                  )}
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  CHF {p.price}
                  {key !== 'impressum' && (
                    <span className="text-sm text-gray-400 font-normal">/Jahr</span>
                  )}
                </div>
                <p className="text-gray-400 text-sm mb-4">{p.description}</p>
                <ul className="space-y-1">
                  {p.features.map((f, i) => (
                    <li key={i} className="text-gray-300 text-xs flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="bg-indigo-900 bg-opacity-50 border border-indigo-700 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-bold text-white mb-4">📋 Bestellübersicht</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-300">
              <span>Dataquard {product.name}</span>
              <span>CHF {product.price}.00</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>MWST (0% – Kleinunternehmer)</span>
              <span>CHF 0.00</span>
            </div>
            <div className="border-t border-indigo-700 pt-3 flex justify-between text-white font-bold text-lg">
              <span>Total</span>
              <span>CHF {product.price}.00</span>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4">
            ❌ {error}
          </div>
        )}

        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white font-bold py-5 rounded-xl text-xl transition-all shadow-lg"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Weiterleitung zu Stripe...
            </span>
          ) : (
            `💳 Jetzt kaufen – CHF ${product.price}`
          )}
        </button>

        {/* Trust Badges */}
        <div className="mt-6 flex items-center justify-center gap-6 text-gray-400 text-sm">
          <span className="flex items-center gap-2">🔒 SSL-verschlüsselt</span>
          <span className="flex items-center gap-2">🇨🇭 Schweizer Produkt</span>
          <span className="flex items-center gap-2">✅ Sofortiger Zugang</span>
        </div>

        <p className="text-center text-gray-500 text-xs mt-4">
          Zahlung wird sicher über Stripe abgewickelt. Keine Kreditkartendaten werden bei uns gespeichert.
        </p>

        {/* Back Links */}
        <div className="flex justify-center gap-6 mt-6">
          <a href="/scanner" className="text-gray-400 hover:text-gray-300 text-sm underline">
            ← Zurück zum Scanner
          </a>
          <a href="/impressum-generator" className="text-gray-400 hover:text-gray-300 text-sm underline">
            Impressum Generator
          </a>
        </div>

      </div>
    </div>
  );
}

export default function Checkout() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-300">Wird geladen...</p>
        </div>
      </div>
    }>
      <CheckoutInner />
    </Suspense>
  );
}
