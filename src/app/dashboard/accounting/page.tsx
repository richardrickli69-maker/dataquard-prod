'use client';
import { useEffect, useState } from 'react';

interface AccountingData {
  totalRevenue: number; totalPayments: number;
  activeSubscriptions: number; mrr: number;
  revenuePerMonth: Record<string, number>;
  planCount: { FREE: number; STARTER: number; PROFESSIONAL: number; ENTERPRISE: number };
  recentPayments: { id: string; amount: number; currency: string; email: string; status: string; date: string; }[];
  error?: string;
}

function StatCard({ label, value, sub, color = 'blue' }: { label: string; value: string; sub?: string; color?: string; }) {
  const accent = color === 'green' ? 'border-green-500 text-green-600' : color === 'purple' ? 'border-purple-500 text-purple-600' : color === 'orange' ? 'border-orange-500 text-orange-600' : 'border-blue-600 text-blue-700';
  return (
    <div className={`bg-white rounded-xl border-l-4 ${accent} shadow-sm p-5`}>
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-3xl font-bold ${accent.split(' ')[1]}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function AccountingDashboard() {
  const [data, setData] = useState<AccountingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/accounting');
      setData(await res.json());
      setLastUpdated(new Date().toLocaleTimeString('de-CH'));
    } finally { setLoading(false); }
  }

  useEffect(() => { loadData(); }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Lade Accounting...</p>
      </div>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <button onClick={loadData} className="bg-red-600 text-white px-4 py-2 rounded-lg">Erneut versuchen</button>
    </div>
  );

  const currentMonth = new Date().toISOString().slice(0, 7);
  const thisMonthRevenue = data.revenuePerMonth[currentMonth] ?? 0;
  const totalPlans = Object.values(data.planCount).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">💰 Dataquard – Accounting</h1>
            <p className="text-sm text-gray-500">Letzte Aktualisierung: {lastUpdated}</p>
          </div>
          <button onClick={loadData} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">↻ Aktualisieren</button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Umsatz Total" value={`CHF ${data.totalRevenue.toFixed(2)}`} sub="alle Zeit" color="green" />
          <StatCard label="MRR" value={`CHF ${data.mrr.toFixed(2)}`} sub="monatlich wiederkehrend" color="blue" />
          <StatCard label="Aktive Abos" value={String(data.activeSubscriptions)} sub={`${data.totalPayments} Zahlungen total`} color="purple" />
          <StatCard label="Dieser Monat" value={`CHF ${thisMonthRevenue.toFixed(2)}`} sub={currentMonth} color="orange" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Plan-Verteilung</h2>
            {totalPlans === 0 ? (
              <div className="flex items-center justify-center h-24 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <p className="text-gray-400 text-sm">Noch keine Abos</p>
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { plan: 'FREE',         color: 'bg-gray-400',   count: data.planCount.FREE },
                  { plan: 'STARTER',      color: 'bg-blue-500',   count: data.planCount.STARTER },
                  { plan: 'PROFESSIONAL', color: 'bg-purple-500', count: data.planCount.PROFESSIONAL },
                  { plan: 'ENTERPRISE',   color: 'bg-orange-500', count: data.planCount.ENTERPRISE },
                ].map(({ plan, color, count }) => (
                  <div key={plan}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{plan}</span>
                      <span className="text-gray-500">{count} ({totalPlans > 0 ? Math.round(count/totalPlans*100) : 0}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div className={`${color} h-2.5 rounded-full`} style={{ width: `${totalPlans > 0 ? count/totalPlans*100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Umsatz letzte 12 Monate (CHF)</h2>
            <div className="flex items-center justify-center h-24 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <div className="text-center">
                <p className="text-gray-400 text-sm">Erscheint sobald Zahlungen eingehen</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Letzte 10 Zahlungen</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-gray-500 font-medium pb-3 pr-4">Stripe ID</th>
                <th className="text-left text-gray-500 font-medium pb-3 pr-4">Betrag</th>
                <th className="text-left text-gray-500 font-medium pb-3 pr-4">E-Mail</th>
                <th className="text-left text-gray-500 font-medium pb-3">Datum</th>
              </tr>
            </thead>
            <tbody>
              {data.recentPayments.length === 0 ? (
                <tr><td colSpan={4} className="text-center text-gray-400 py-10">
                  <p className="text-2xl mb-2">💳</p>
                  <p>Noch keine Zahlungen vorhanden</p>
                  <p className="text-xs text-gray-300 mt-1">Erscheint sobald erste Stripe-Zahlung eingeht</p>
                </td></tr>
              ) : data.recentPayments.map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 pr-4 font-mono text-xs text-gray-400">{p.id.slice(0,16)}...</td>
                  <td className="py-2 pr-4 font-semibold text-green-600">{p.currency} {p.amount.toFixed(2)}</td>
                  <td className="py-2 pr-4 text-gray-600 text-xs">{p.email}</td>
                  <td className="py-2 text-gray-400 text-xs">{new Date(p.date).toLocaleDateString('de-CH', { day:'2-digit', month:'2-digit', year:'numeric' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-blue-800 text-sm font-semibold mb-1">📋 Steuer-Hinweis</p>
          <p className="text-blue-700 text-sm">Alle Beträge CHF exkl. MWST. Für Buchhaltung: Stripe Dashboard → <strong>Reports → Financial reports</strong>. Schweizer MWST-Satz: 8.1%</p>
        </div>

      </div>
    </div>
  );
}