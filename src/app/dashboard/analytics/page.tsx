// src/app/dashboard/analytics/page.task.tsx
// ÄNDERUNG: Blue-Akzente → #22c55e Green
'use client';

import { useEffect, useState } from 'react';

interface AnalyticsData {
  totalScans: number;
  totalPolicies: number;
  uniqueUsers: number;
  conversionRate: string;
  scansPerDay: Record<string, number>;
  topDomains: [string, number][];
  jurisdictionCount: Record<string, number>;
  ampelCount: { gruen: number; gelb: number; rot: number };
  recentScans: {
    id: string;
    domain: string;
    jurisdiction: string;
    ampel: string;
    confidence: number;
    created_at: string;
  }[];
}

function AmpelDot({ ampel }: { ampel: string }) {
  const color =
    ampel === 'gruen' ? '#22c55e' :
    ampel === 'gelb'  ? '#eab308' :
    '#ef4444';
  return <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: color }} />;
}

function StatCard({ label, value, sub, color = 'green' }: {
  label: string; value: string | number; sub?: string; color?: string;
}) {
  const borderColor =
    color === 'green'  ? '#22c55e' :
    color === 'yellow' ? '#eab308' :
    color === 'red'    ? '#ef4444' :
    '#22c55e';
  const textColor =
    color === 'green'  ? '#16a34a' :
    color === 'yellow' ? '#ca8a04' :
    color === 'red'    ? '#dc2626' :
    '#16a34a';
  return (
    <div style={{ background: '#ffffff', borderRadius: 12, borderLeft: `4px solid ${borderColor}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 20 }}>
      <p style={{ fontSize: 11, color: '#888899', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 700, color: textColor }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: '#aaaabc', marginTop: 4 }}>{sub}</p>}
    </div>
  );
}

function BarChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data).sort((a, b) => a[0].localeCompare(b[0]));
  if (entries.length === 0) return <p style={{ color: '#888899', fontSize: 13 }}>Keine Daten</p>;
  const max = Math.max(...entries.map(e => e[1]), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 96, width: '100%' }}>
      {entries.map(([day, count]) => (
        <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div
            style={{ width: '100%', background: '#22c55e', borderRadius: '3px 3px 0 0', opacity: 0.8, height: `${(count / max) * 80}px`, transition: 'height 0.3s' }}
            title={`${day}: ${count} Scans`}
          />
          <span style={{ color: '#aaaabc', fontSize: 9, transform: 'rotate(45deg)', transformOrigin: 'left', display: 'none' }}>
            {day.slice(5)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/analytics');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: AnalyticsData = await res.json();
      setData(json);
      setLastUpdated(new Date().toLocaleTimeString('de-CH'));
    } catch {
      setError('Daten konnten nicht geladen werden. Prüfe SUPABASE_SERVICE_ROLE_KEY.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f8f9fb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '4px solid #22c55e', borderTop: '4px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#888899' }}>Lade Analytics...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  if (error || !data) return (
    <div style={{ minHeight: '100vh', background: '#f8f9fb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: 24, maxWidth: 400, textAlign: 'center' }}>
        <p style={{ color: '#dc2626', fontWeight: 600, marginBottom: 8 }}>Fehler</p>
        <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 16 }}>{error}</p>
        <button onClick={loadData} style={{ background: '#dc2626', color: '#fff', padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13 }}>
          Erneut versuchen
        </button>
      </div>
    </div>
  );

  const totalAmpel = data.ampelCount.gruen + data.ampelCount.gelb + data.ampelCount.rot;

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fb' }}>
      {/* Header */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e4ea', padding: '16px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e' }}>🛡 Dataquard – Analytics</h1>
            <p style={{ fontSize: 12, color: '#888899', marginTop: 2 }}>Letzte Aktualisierung: {lastUpdated}</p>
          </div>
          <button onClick={loadData} style={{ background: '#22c55e', color: '#fff', padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            ↻ Aktualisieren
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
          <StatCard label="Scans Total" value={data.totalScans} sub="alle Zeit" color="green" />
          <StatCard label="Policies generiert" value={data.totalPolicies} sub={`${data.conversionRate}% Conversion`} color="green" />
          <StatCard label="Unique Users" value={data.uniqueUsers} sub="registrierte Nutzer" color="yellow" />
          <StatCard label="Conversion Rate" value={`${data.conversionRate}%`} sub="Scan → Policy" color="yellow" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 16 }}>
          <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e2e4ea', padding: 24 }}>
            <h2 style={{ fontWeight: 600, color: '#1a1a2e', marginBottom: 16, fontSize: 15 }}>Scans letzte 30 Tage</h2>
            <BarChart data={data.scansPerDay} />
          </div>
          <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e2e4ea', padding: 24 }}>
            <h2 style={{ fontWeight: 600, color: '#1a1a2e', marginBottom: 16, fontSize: 15 }}>Ampel-Verteilung</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { key: 'gruen', label: 'Grün – Compliant',      color: '#22c55e' },
                { key: 'gelb',  label: 'Gelb – Teilweise',      color: '#eab308' },
                { key: 'rot',   label: 'Rot – Nicht compliant', color: '#ef4444' },
              ].map(({ key, label, color }) => {
                const count = data.ampelCount[key as keyof typeof data.ampelCount];
                const pct = totalAmpel > 0 ? Math.round((count / totalAmpel) * 100) : 0;
                return (
                  <div key={key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                      <span style={{ color: '#555566' }}>{label}</span>
                      <span style={{ fontWeight: 600, color: '#1a1a2e' }}>{count} ({pct}%)</span>
                    </div>
                    <div style={{ width: '100%', background: '#f1f2f6', borderRadius: 4, height: 6 }}>
                      <div style={{ background: color, height: 6, borderRadius: 4, width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 16 }}>
          <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e2e4ea', padding: 24 }}>
            <h2 style={{ fontWeight: 600, color: '#1a1a2e', marginBottom: 16, fontSize: 15 }}>Top 10 Domains</h2>
            {data.topDomains.length === 0 ? (
              <p style={{ color: '#888899', fontSize: 13 }}>Noch keine Daten</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.topDomains.map(([domain, count], i) => {
                  const pct = Math.round((count / data.topDomains[0][1]) * 100);
                  return (
                    <div key={domain}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                        <span style={{ color: '#555566', fontFamily: 'monospace' }}>{i + 1}. {domain}</span>
                        <span style={{ color: '#888899' }}>{count}x</span>
                      </div>
                      <div style={{ width: '100%', background: '#f1f2f6', borderRadius: 4, height: 5 }}>
                        <div style={{ background: '#22c55e', height: 5, borderRadius: 4, width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e2e4ea', padding: 24 }}>
            <h2 style={{ fontWeight: 600, color: '#1a1a2e', marginBottom: 16, fontSize: 15 }}>Jurisdiktionen</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {Object.entries(data.jurisdictionCount)
                .sort((a, b) => b[1] - a[1])
                .map(([j, count]) => {
                  const pct = data.totalScans > 0 ? Math.round((count / data.totalScans) * 100) : 0;
                  const colorMap: Record<string, string> = { nDSG: '#ef4444', GDPR: '#3b82f6', Both: '#22c55e' };
                  return (
                    <div key={j}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, color: '#1a1a2e' }}>{j}</span>
                        <span style={{ color: '#888899' }}>{count} ({pct}%)</span>
                      </div>
                      <div style={{ width: '100%', background: '#f1f2f6', borderRadius: 4, height: 6 }}>
                        <div style={{ background: colorMap[j] ?? '#888899', height: 6, borderRadius: 4, width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Letzte Scans */}
        <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e2e4ea', padding: 24 }}>
          <h2 style={{ fontWeight: 600, color: '#1a1a2e', marginBottom: 16, fontSize: 15 }}>Letzte 20 Scans</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e4ea' }}>
                  <th style={{ textAlign: 'left', color: '#888899', fontWeight: 500, padding: '8px 0', paddingRight: 16 }}>Domain</th>
                  <th style={{ textAlign: 'left', color: '#888899', fontWeight: 500, padding: '8px 0', paddingRight: 16 }}>Jurisdiktion</th>
                  <th style={{ textAlign: 'left', color: '#888899', fontWeight: 500, padding: '8px 0', paddingRight: 16 }}>Ampel</th>
                  <th style={{ textAlign: 'left', color: '#888899', fontWeight: 500, padding: '8px 0', paddingRight: 16 }}>Confidence</th>
                  <th style={{ textAlign: 'left', color: '#888899', fontWeight: 500, padding: '8px 0' }}>Datum</th>
                </tr>
              </thead>
              <tbody>
                {data.recentScans.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: '#888899', padding: '32px 0', fontSize: 13 }}>Noch keine Scans vorhanden</td></tr>
                ) : (
                  data.recentScans.map(scan => (
                    <tr key={scan.id} style={{ borderBottom: '1px solid #f1f2f6' }}>
                      <td style={{ padding: '8px 16px 8px 0', fontFamily: 'monospace', fontSize: 12, color: '#555566' }}>{scan.domain}</td>
                      <td style={{ padding: '8px 16px 8px 0', color: '#555566' }}>{scan.jurisdiction}</td>
                      <td style={{ padding: '8px 16px 8px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <AmpelDot ampel={scan.ampel} />
                          <span style={{ color: '#555566', textTransform: 'capitalize' }}>{scan.ampel}</span>
                        </div>
                      </td>
                      <td style={{ padding: '8px 16px 8px 0', color: '#555566' }}>{(scan.confidence * 100).toFixed(0)}%</td>
                      <td style={{ padding: '8px 0', color: '#888899', fontSize: 12 }}>
                        {new Date(scan.created_at).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
