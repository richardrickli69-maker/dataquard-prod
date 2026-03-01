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
  { name: 'IMPRESSUM ONLY', price: 19, interval: 'Einmalkauf', desc: 'Nur das Impressum', features: ['Impressum Generator', 'Schweiz + Deutschland', 'Sofort downloadbar'], highlight: false },
  { name: 'STARTER', price: 79, interval: 'pro Jahr', desc: 'Für Schweizer KMUs', features: ['Alles aus Free', 'Datenschutzerklärung', 'Impressum Generator', 'Cookie-Analyse', 'Updates', '1 Domain'], highlight: false },
  { name: 'PROFESSIONAL', price: 199, interval: 'pro Jahr', desc: 'Für wachsende Teams', features: ['Alles aus Starter', 'Bis zu 5 Domains', 'AGB-Vorlage', 'Priority Support', 'Rechtliche Alerts'], highlight: true },
];

export default function CheckoutPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState('PROFESSIONAL');
  const [policyStatus, setPolicyStatus] = useState<'idle'|'queued'|'processing'|'completed'|'error'>('idle');
  const [domain, setDomain] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jurisdiction, setJurisdiction] = useState<'GDPR'|'nDSG'|'BOTH'>('nDSG');
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
    } catch {
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

    if (selectedPlan === 'IMPRESSUM ONLY') {
      router.push('/impressum-generator');
      return;
    }

    if ((selectedPlan === 'PROFESSIONAL' || selectedPlan === 'STARTER') && domain) {
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
          <Link href="/" className="text-indigo-400 hover:text-indigo-300">← Zurück</Link>
        </div>

        {step === 1 && (
          <>
            {/* Plan Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {plans.map((plan) => (
                <div key={plan.name} onClick={() => setSelectedPlan(plan.name)}
                  className={`border-2 rounded-lg p-6 cursor-pointer transition ${selectedPlan === plan.name ? 'border-indigo-500 bg-indigo-900 bg-opacity-50' : 'border-indigo-700 hover:border-indigo-400 bg-indigo-900 bg-opacity-20'}`}>
                  {plan.highlight && <div className="text-xs text-indigo-300 font-bold mb-2">EMPFOHLEN</div>}
                  <h2 className="text-xl font-bold mb-1">{plan.name}</h2>
                  <p className="text-gray-400 text-sm mb-3">{plan.desc}</p>
                  <div className="text-3xl font-bold text-indigo-300 mb-1">CHF {plan.price}</div>
                  <div className="text-sm text-gray-400 mb-4">{plan.interval}</div>
                  <ul className="space-y-2 mb-4">
                    {plan.features.map((f) => <li key={f} className="text-gray-300 text-sm flex gap-2"><span className="text-green-400">✓</span>{f}</li>)}
                  </ul>
                  {selectedPlan === plan.name && <div className="text-indigo-400 font-bold text-sm">✓ Ausgewählt</div>}
                </div>
              ))}
            </div>

            {/* Domain Input für Starter + Professional */}
            {(selectedPlan === 'PROFESSIONAL' || selectedPlan === 'STARTER') && (
              <div className="bg-indigo-900 bg-opacity-30 border border-indigo-700 p-8 rounded-lg mb-8">
                <h3 className="text-xl font-bold mb-4">🤖 AI Datenschutzerklärung</h3>
                <p className="text-gray-300 mb-6">Wird automatisch nach der Zahlung generiert. Sie erhalten eine Email wenn sie fertig ist.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Domain *</label>
                    <input type="text" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="z.B. www.example.ch" className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Firmenname (optional)</label>
                    <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="z.B. Muster GmbH" className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Rechtsraum</label>
                    <select value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value as 'GDPR'|'nDSG'|'BOTH')} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white">
                      <option value="nDSG">🇨🇭 nDSG (Schweiz)</option>
                      <option value="GDPR">🇪🇺 DSGVO (EU/DE)</option>
                      <option value="BOTH">🌍 Beide</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Impressum Only Info */}
            {selectedPlan === 'IMPRESSUM ONLY' && (
              <div className="bg-indigo-900 bg-opacity-30 border border-indigo-700 p-8 rounded-lg mb-8">
                <h3 className="text-xl font-bold mb-2">📄 Impressum Generator</h3>
                <p className="text-gray-300">Nach der Zahlung werden Sie direkt zum Impressum Generator weitergeleitet. Das fertige Impressum können Sie sofort herunterladen.</p>
              </div>
            )}

            {/* Order Summary */}
            <div className="bg-indigo-900 bg-opacity-50 border border-indigo-700 p-8 rounded-lg">
              <h3 className="text-xl font-bold mb-4">📋 Bestellübersicht</h3>
              <div className="flex justify-between text-lg font-bold mb-6">
                <span>{selectedPlan}</span>
                <span className="text-indigo-300">CHF {plans.find((p) => p.name === selectedPlan)?.price}</span>
              </div>
              <button onClick={handlePayment}
                disabled={(selectedPlan === 'PROFESSIONAL' || selectedPlan === 'STARTER') && !domain}
                className="w-full px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-lg">
                💳 Jetzt kaufen – CHF {plans.find((p) => p.name === selectedPlan)?.price}
              </button>
              <p className="text-center text-gray-400 text-xs mt-3">30 Tage Geld-zurück-Garantie · Schweizer Qualität</p>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-indigo-900 bg-opacity-30 border border-indigo-700 p-8 rounded-lg text-center">
              {policyStatus === 'processing' && (<><div className="text-6xl mb-4">⚙️</div><h2 className="text-2xl font-bold mb-2">Ihre Policy wird generiert...</h2><p className="text-gray-400 mb-6">Dauert 30-60 Sekunden. Sie erhalten auch eine Email.</p><div className="flex justify-center"><div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div></>)}
              {policyStatus === 'completed' && (<><div className="text-6xl mb-4">✅</div><h2 className="text-2xl font-bold mb-2">Ihre Policy ist bereit!</h2><p className="text-gray-400 mb-6">Email wurde versendet. Policy im Dashboard verfügbar.</p><button onClick={() => router.push('/dashboard')} className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-lg">🚀 Zum Dashboard</button></>)}
              {policyStatus === 'error' && (<><div className="text-6xl mb-4">❌</div><h2 className="text-2xl font-bold mb-2">Fehler</h2><p className="text-gray-400 mb-6">Bitte kontaktieren Sie support@dataquard.ch</p><button onClick={() => { setStep(1); setPolicyStatus('idle'); }} className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-lg">← Zurück</button></>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}