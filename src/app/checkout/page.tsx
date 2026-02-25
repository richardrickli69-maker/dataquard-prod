'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Plan = 'essential' | 'professional';

const plans = {
  essential: {
    name: 'ESSENTIAL',
    price: 49,
    currency: 'CHF',
    billing: 'per year',
    features: ['5 Detailed Reports/Month', 'Full Compliance Check', 'Email Support'],
  },
  professional: {
    name: 'PROFESSIONAL',
    price: 159,
    currency: 'CHF',
    billing: 'one-time payment',
    features: ['Unlimited Reports', 'Full Analysis', 'Policy Generator', 'Priority Support'],
  },
};

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<Plan>('professional');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sign in required</h1>
          <Link href="/auth" className="text-blue-600 underline">Go to Sign In</Link>
        </div>
      </div>
    );
  }

  const plan = plans[selectedPlan];

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const success = Math.random() > 0.05;

      if (success) {
  alert(`✅ Payment successful! ${plan.name} plan activated!`);
  router.push('/dashboard');
} else {
  // User didn't buy - create reminder
  try {
    await fetch('/api/reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user?.email,
        domain: 'dataquard.ch',
        scanId: null,
      }),
    });
  } catch (err) {
    console.log('Reminder created');
  }
}
```

Speichern Sie: **Ctrl+S** ✅

---

## ✅ SCHRITT 4: Retargeting bei Scanner-Exit integrieren

Öffnen Sie VS Code:
```
src/app/scanner/page.tsx
      } else {
        setError('Payment declined (simulated)');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-gray-600">All plans include full website analysis</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {Object.entries(plans).map(([key, detail]) => (
            <div
              key={key}
              onClick={() => setSelectedPlan(key as Plan)}
              className={`rounded-lg p-8 cursor-pointer border-2 transition ${
                selectedPlan === key ? 'bg-white border-blue-600 shadow-lg' : 'bg-white border-gray-200'
              }`}
            >
              <h2 className="text-2xl font-bold mb-2">{detail.name}</h2>
              <div className="mb-6">
                <span className="text-5xl font-bold">{detail.price}</span>
                <span className="text-gray-600 ml-2">{detail.currency} {detail.billing}</span>
              </div>
              <ul className="space-y-2 mb-6">
                {detail.features.map((f, i) => (
                  <li key={i} className="text-gray-700">✓ {f}</li>
                ))}
              </ul>
              <button className="w-full py-2 rounded bg-gray-100 font-bold">
                {selectedPlan === key ? '✓ Selected' : 'Select'}
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold mb-6">Order Summary</h3>
          <div className="space-y-4 mb-6 pb-6 border-b">
            <div className="flex justify-between">
              <span>Plan:</span>
              <span className="font-bold">{plan.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Price:</span>
              <span className="font-bold">{plan.price} {plan.currency}</span>
            </div>
          </div>

          <div className="flex justify-between mb-6 text-lg">
            <span className="font-bold">Total:</span>
            <span className="text-3xl font-bold text-blue-600">{plan.price} {plan.currency}</span>
          </div>

          {error && <div className="text-red-600 mb-4 font-bold">❌ {error}</div>}

          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 disabled:bg-gray-400"
          >
            {loading ? 'Processing...' : `Pay ${plan.price} ${plan.currency}`}
          </button>

          <p className="text-center text-sm text-gray-600 mt-4">💳 Test Mode - Click Pay</p>

          <div className="mt-6 text-center">
            <Link href="/scanner" className="text-blue-600 hover:underline">← Back to Scanner</Link>
          </div>
        </div>
      </div>
    </div>
  );
}