// src/app/dashboard/accounting/page.task.tsx
// ÄNDERUNG: Button- und Akzentfarben → #22c55e, Purple-Akzente entfernt
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

function StatCard({ label, value, sub, color = 'green' }: { label: string; value: string; sub?: string; color?: string; }) {
  const borderColor = color === 'orange' ? '#f97316' : color === 'yellow' ? '#eab308' : '#22c55e';
  const textColor   = color === 'orange' ? '#ea580c'  : color === 'yellow' ? '#ca8a04' : '#16a34a';
  return (
    <div style={{ background: '#ffffff', borderRadius: 12, borderLeft: `4px solid ${borderColor}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 20 }}>
      <p style={{ fontSize: 11, color: '#888899', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 700, color: textColor }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: '#aaaabc', marginTop: 4 }}>{sub}</p>}
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
    <div style={{ minHeight: '100vh', background: '#f8f9fb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '4px solid #22c55e', borderTop: '4px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#888899' }}>Lade Accounting...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  if (!data) return (
    <div style={{ minHeight: '100vh', background: '#f8f9fb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <button onClick={loadData} style={{ background: '#dc2626', color: '#fff', padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>Erneut versuchen</button>
    </div>
  );

  const currentMonth = new Date().toISOString().slice(0, 7);
  const thisMonthRevenue = data.revenuePerMonth[currentMonth] ?? 0;
  const totalPlans = Object.values(data.planCount).reduce((a, b) => a + b, 0);

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fb' }}>
      {/* Header */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e4ea', padding: '16px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e' }}>💰 Dataquard – Accounting</h1>
            <p style={{ fontSize: 12, color: '#888899', marginTop: 2 }}>Letzte Aktualisierung: {lastUpdated}</p>
          </div>
          <button onClick={loadData} style={{ background: '#22c55e', color: '#fff', padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>↻ Aktualisieren</button>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px' }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
          <StatCard label="Umsatz Total" value={`CHF ${data.totalRevenue.toFixed(2)}`} sub="alle Zeit" color="green" />
          <StatCard label="MRR" value={`CHF ${data.mrr.toFixed(2)}`} sub="monatlich wiederkehrend" color="green" />
          <StatCard label="Aktive Abos" value={String(data.activeSubscriptions)} sub={`${data.totalPayments} Zahlungen total`} color="yellow" />
          <StatCard label="Dieser Monat" value={`CHF ${thisMonthRevenue.toFixed(2)}`} sub={currentMonth} color="orange" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 16 }}>
          <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e2e4ea', padding: 24 }}>
            <h2 style={{ fontWeight: 600, color: '#1a1a2e', marginBottom: 16, fontSize: 15 }}>Plan-Verteilung</h2>
            {totalPlans === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 96, background: '#f8f9fb', borderRadius: 8, border: '2px dashed #e2e4ea' }}>
                <p style={{ color: '#888899', fontSize: 13 }}>Noch keine Abos</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { plan: 'FREE',         color: '#888899', count: data.planCount.FREE },
                  { plan: 'STARTER',      color: '#22c55e', count: data.planCount.STARTER },
                  { plan: 'PROFESSIONAL', color: '#3b82f6', count: data.planCount.PROFESSIONAL },
                  { plan: 'ENTERPRISE',   color: '#f97316', count: data.planCount.ENTERPRISE },
                ].map(({ plan, color, count }) => (
                  <div key={plan}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                      <span style={{ fontWeight: 500, color: '#555566' }}>{plan}</span>
                      <span style={{ color: '#888899' }}>{count} ({totalPlans > 0 ? Math.round(count/totalPlans*100) : 0}%)</span>
                    </div>
                    <div style={{ width: '100%', background: '#f1f2f6', borderRadius: 4, height: 8 }}>
                      <div style={{ background: color, height: 8, borderRadius: 4, width: `${totalPlans > 0 ? count/totalPlans*100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e2e4ea', padding: 24 }}>
            <h2 style={{ fontWeight: 600, color: '#1a1a2e', marginBottom: 16, fontSize: 15 }}>Umsatz letzte 12 Monate (CHF)</h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 96, background: '#f8f9fb', borderRadius: 8, border: '2px dashed #e2e4ea' }}>
              <p style={{ color: '#888899', fontSize: 13 }}>Erscheint sobald Zahlungen eingehen</p>
            </div>
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e2e4ea', padding: 24, marginBottom: 16 }}>
          <h2 style={{ fontWeight: 600, color: '#1a1a2e', marginBottom: 16, fontSize: 15 }}>Letzte 10 Zahlungen</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e4ea' }}>
                  <th style={{ textAlign: 'left', color: '#888899', fontWeight: 500, padding: '8px 0', paddingRight: 16 }}>Stripe ID</th>
                  <th style={{ textAlign: 'left', color: '#888899', fontWeight: 500, padding: '8px 0', paddingRight: 16 }}>Betrag</th>
                  <th style={{ textAlign: 'left', color: '#888899', fontWeight: 500, padding: '8px 0', paddingRight: 16 }}>E-Mail</th>
                  <th style={{ textAlign: 'left', color: '#888899', fontWeight: 500, padding: '8px 0' }}>Datum</th>
                </tr>
              </thead>
              <tbody>
                {data.recentPayments.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px 0' }}>
                    <p style={{ fontSize: 24, marginBottom: 8 }}>💳</p>
                    <p style={{ color: '#888899', fontSize: 13 }}>Noch keine Zahlungen vorhanden</p>
                    <p style={{ color: '#aaaabc', fontSize: 11, marginTop: 4 }}>Erscheint sobald erste Stripe-Zahlung eingeht</p>
                  </td></tr>
                ) : data.recentPayments.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f1f2f6' }}>
                    <td style={{ padding: '8px 16px 8px 0', fontFamily: 'monospace', fontSize: 11, color: '#aaaabc' }}>{p.id.slice(0,16)}...</td>
                    <td style={{ padding: '8px 16px 8px 0', fontWeight: 600, color: '#22c55e' }}>{p.currency} {p.amount.toFixed(2)}</td>
                    <td style={{ padding: '8px 16px 8px 0', color: '#555566', fontSize: 12 }}>{p.email}</td>
                    <td style={{ padding: '8px 0', color: '#888899', fontSize: 12 }}>{new Date(p.date).toLocaleDateString('de-CH', { day:'2-digit', month:'2-digit', year:'numeric' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 12, padding: 16 }}>
          <p style={{ color: '#15803d', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>📋 Steuer-Hinweis</p>
          <p style={{ color: '#166534', fontSize: 13 }}>Alle Beträge CHF exkl. MWST. Für Buchhaltung: Stripe Dashboard → <strong>Reports → Financial reports</strong>. Schweizer MWST-Satz: 8.1%</p>
        </div>

      </div>
    </div>
  );
}
