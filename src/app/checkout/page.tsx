// src/app/checkout/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const plans = [
  { name: 'ESSENTIAL', price: 49, interval: 'yearly', features: ['50 reports/month', 'Basic analysis', 'Email support'] },
  { name: 'PROFESSIONAL', price: 159, interval: 'one-time', features: ['Unlimited reports', 'AI policy generator', 'Priority support'] },
];

export default function CheckoutPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState('PROFESSIONAL');
  const [policyStatus, setPolicyStatus] = useState<'idle'|'queued'|'processing'|'completed'|'error'>('idle');
  const [domain, setDomain] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jurisdiction, setJurisdiction] = useState<'GDPR'|'nDSG'|'BOTH'>('GDPR');
  const [step, setStep] = useState<1|2>(1);

  const queuePolicyGeneration = async () => {
    if (!domain) { alert('Bitte geben Sie eine Domain ein'); return; }
    setPolicyStatus('queued');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setPolicyStatus('error'); alert('Sie sind nicht angemeldet!'); return; }
      const response = await fetch('/api/policy/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ domain, jurisdiction, companyName }),
      });
      const result = await response.json();
      if (result.success) {
        setPolicyStatus('processing');
        pollJobStatus(result.data.jobId);
      } else {
        setPolicyStatus('error');
        alert('Fehler: ' + result.error);
      }
    } catch (error) {
      setPolicyStatus('error');
      alert('Fehler beim Queuing der Policy');
    }
  };

  const pollJobStatus = async (id: string, attempt = 0) => {
    if (attempt > 120) { setPolicyStatus('error'); return; }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setPolicyStatus('error'); return; }
      const response = await fetch(`/api/policy/status/${id}`, { headers: { 'Authorization': `Bearer ${session.access_token}` } });
      const result = await response.json();
      if (result.success) {
        if (result.data.status === 'completed') { setPolicyStatus('completed'); }
        else if (result.data.status === 'failed') { setPolicyStatus('error'); }
        else { setTimeout(() => pollJobStatus(id, attempt + 1), 5000); }
      }
    } catch { setTimeout(() => pollJobStatus(id, attempt + 1), 5000); }
  };

  const handlePayment = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'welcome', email: session.user.email }),
        });
      }
    } catch {}
    if (selectedPlan === 'PROFESSIONAL' && domain) {
      await queuePolicyGeneration();
      setStep(2);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2">Checkout</h1>
            <p className="text-gray-300">{step === 1 ? 'Wählen Sie Ihren Plan' : 'Ihre Policy wird generiert...'}</p>
          </div>
          <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300">← Zurück zum Dashboard</Link>
        </div>

        {step === 1 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {plans.map((plan) => (
                <div key={plan.name} onClick={() => setSelectedPlan(plan.name)}
                  className={`border-2 rounded-lg p-8 cursor-pointer transition ${selectedPlan === plan.name ? 'border-indigo-500 bg-indigo-900 bg-opacity-30' : 'border-gray-600 hover:border-indigo-400'}`}>
                  <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
                  <div className="text-3xl font-bold text-indigo-400 mb-2">CHF {plan.price}<span className="text-sm text-gray-400">/{plan.interval}</span></div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((f) => <li key={f} className="text-gray-300 flex items-center"><span className="text-indigo-400 mr-2">✓</span>{f}</li>)}
                  </ul>
                  {selectedPlan === plan.name && <div className="text-indigo-400 font-bold">✓ Selected</div>}
                </div>
              ))}
            </div>

            {selectedPlan === 'PROFESSIONAL' && (
              <div className="bg-indigo-900 bg-opacity-30 border border-indigo-700 p-8 rounded-lg mb-8">
                <h3 className="text-2xl font-bold mb-4">🤖 AI Privacy Policy Generator</h3>
                <p className="text-gray-300 mb-6">Ihre Policy wird automatisch generiert. Sie erhalten eine Email wenn sie fertig ist!</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Domain *</label>
                    <input type="text" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="z.B. www.example.com" className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Company Name (optional)</label>
                    <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="z.B. Meine GmbH" className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Zuständigkeit</label>
                    <select value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value as 'GDPR'|'nDSG'|'BOTH')} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white">
                      <option value="GDPR">🇪🇺 GDPR (EU)</option>
                      <option value="nDSG">🇨🇭 nDSG (Schweiz)</option>
                      <option value="BOTH">🌍 Beide (EU + Schweiz)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-indigo-900 bg-opacity-50 border border-indigo-700 p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-6">📋 Order Summary</h3>
              <div className="flex justify-between text-xl font-bold mb-6">
                <span>Total</span>
                <span className="text-indigo-400">CHF {plans.find((p) => p.name === selectedPlan)?.price}</span>
              </div>
              <button onClick={handlePayment} disabled={selectedPlan === 'PROFESSIONAL' && !domain}
                className="w-full px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-lg hover:shadow-lg transition disabled:opacity-50">
                💳 Pay CHF {plans.find((p) => p.name === selectedPlan)?.price}
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-indigo-900 bg-opacity-30 border border-indigo-700 p-8 rounded-lg text-center">
              {policyStatus === 'processing' && (<><div className="text-6xl mb-4">⚙️</div><h2 className="text-2xl font-bold mb-2">Ihre Policy wird generiert...</h2><p className="text-gray-400 mb-6">Dies dauert typischerweise 30-60 Sekunden.</p><div className="flex justify-center"><div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div></>)}
              {policyStatus === 'completed' && (<><div className="text-6xl mb-4">✅</div><h2 className="text-2xl font-bold mb-2">Ihre Policy ist bereit!</h2><p className="text-gray-400 mb-6">Ein Email wurde an Sie versendet.</p><button onClick={() => router.push('/dashboard')} className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-lg">🚀 Zum Dashboard</button></>)}
              {policyStatus === 'error' && (<><div className="text-6xl mb-4">❌</div><h2 className="text-2xl font-bold mb-2">Fehler bei der Generierung</h2><p className="text-gray-400 mb-6">Bitte kontaktieren Sie support@dataquard.ch</p><button onClick={() => { setStep(1); setPolicyStatus('idle'); }} className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-lg">← Zurück</button></>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}