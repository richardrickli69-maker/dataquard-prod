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
    ampel === 'gruen' ? 'bg-green-500' :
    ampel === 'gelb'  ? 'bg-yellow-400' :
    'bg-red-500';
  return <span className={`inline-block w-3 h-3 rounded-full ${color}`} />;
}

function StatCard({ label, value, sub, color = 'blue' }: {
  label: string; value: string | number; sub?: string; color?: string;
}) {
  const accent =
    color === 'green'  ? 'border-green-500 text-green-600' :
    color === 'yellow' ? 'border-yellow-400 text-yellow-600' :
    color === 'purple' ? 'border-purple-500 text-purple-600' :
    'border-blue-600 text-blue-700';
  return (
    <div className={`bg-white rounded-xl border-l-4 ${accent} shadow-sm p-5`}>
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-3xl font-bold ${accent.split(' ')[1]}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function BarChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data).sort((a, b) => a[0].localeCompare(b[0]));
  if (entries.length === 0) return <p className="text-gray-400 text-sm">Keine Daten</p>;
  const max = Math.max(...entries.map(e => e[1]), 1);
  return (
    <div className="flex items-end gap-1 h-24 w-full">
      {entries.map(([day, count]) => (
        <div key={day} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-blue-600 rounded-t opacity-80 hover:opacity-100 transition-opacity"
            style={{ height: `${(count / max) * 80}px` }}
            title={`${day}: ${count} Scans`}
          />
          <span className="text-gray-400 text-[9px] rotate-45 origin-left hidden sm:block">
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
    } catch (err) {
      setError('Daten konnten nicht geladen werden. Prüfe SUPABASE_SERVICE_ROLE_KEY.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Lade Analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md text-center">
          <p className="text-red-700 font-semibold mb-2">Fehler</p>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button onClick={loadData} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700">
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  const totalAmpel = data.ampelCount.gruen + data.ampelCount.gelb + data.ampelCount.rot;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">🛡 Dataquard – Analytics</h1>
            <p className="text-sm text-gray-500">Letzte Aktualisierung: {lastUpdated}</p>
          </div>
          <button onClick={loadData} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
            ↻ Aktualisieren
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Scans Total" value={data.totalScans} sub="alle Zeit" color="blue" />
          <StatCard label="Policies generiert" value={data.totalPolicies} sub={`${data.conversionRate}% Conversion`} color="green" />
          <StatCard label="Unique Users" value={data.uniqueUsers} sub="registrierte Nutzer" color="purple" />
          <StatCard label="Conversion Rate" value={`${data.conversionRate}%`} sub="Scan → Policy" color="yellow" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Scans letzte 30 Tage</h2>
            <BarChart data={data.scansPerDay} />
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Ampel-Verteilung</h2>
            <div className="space-y-3">
              {[
                { key: 'gruen', label: 'Grün – Compliant',      color: 'bg-green-500' },
                { key: 'gelb',  label: 'Gelb – Teilweise',      color: 'bg-yellow-400' },
                { key: 'rot',   label: 'Rot – Nicht compliant', color: 'bg-red-500' },
              ].map(({ key, label, color }) => {
                const count = data.ampelCount[key as keyof typeof data.ampelCount];
                const pct = totalAmpel > 0 ? Math.round((count / totalAmpel) * 100) : 0;
                return (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{label}</span>
                      <span className="font-semibold text-gray-800">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Top 10 Domains</h2>
            {data.topDomains.length === 0 ? (
              <p className="text-gray-400 text-sm">Noch keine Daten</p>
            ) : (
              <div className="space-y-2">
                {data.topDomains.map(([domain, count], i) => {
                  const pct = Math.round((count / data.topDomains[0][1]) * 100);
                  return (
                    <div key={domain}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 font-mono text-xs truncate max-w-[200px]">{i + 1}. {domain}</span>
                        <span className="text-gray-500 text-xs">{count}x</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Jurisdiktionen</h2>
            <div className="space-y-3">
              {Object.entries(data.jurisdictionCount)
                .sort((a, b) => b[1] - a[1])
                .map(([j, count]) => {
                  const pct = data.totalScans > 0 ? Math.round((count / data.totalScans) * 100) : 0;
                  const colorMap: Record<string, string> = { nDSG: 'bg-red-500', GDPR: 'bg-blue-500', Both: 'bg-purple-500' };
                  return (
                    <div key={j}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold text-gray-700">{j}</span>
                        <span className="text-gray-500">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className={`${colorMap[j] ?? 'bg-gray-400'} h-2 rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Letzte 20 Scans</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-gray-500 font-medium pb-3 pr-4">Domain</th>
                  <th className="text-left text-gray-500 font-medium pb-3 pr-4">Jurisdiktion</th>
                  <th className="text-left text-gray-500 font-medium pb-3 pr-4">Ampel</th>
                  <th className="text-left text-gray-500 font-medium pb-3 pr-4">Confidence</th>
                  <th className="text-left text-gray-500 font-medium pb-3">Datum</th>
                </tr>
              </thead>
              <tbody>
                {data.recentScans.length === 0 ? (
                  <tr><td colSpan={5} className="text-center text-gray-400 py-8">Noch keine Scans vorhanden</td></tr>
                ) : (
                  data.recentScans.map(scan => (
                    <tr key={scan.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 pr-4 font-mono text-xs text-gray-700">{scan.domain}</td>
                      <td className="py-2 pr-4 text-gray-600">{scan.jurisdiction}</td>
                      <td className="py-2 pr-4">
                        <div className="flex items-center gap-2">
                          <AmpelDot ampel={scan.ampel} />
                          <span className="text-gray-600 capitalize">{scan.ampel}</span>
                        </div>
                      </td>
                      <td className="py-2 pr-4 text-gray-600">{(scan.confidence * 100).toFixed(0)}%</td>
                      <td className="py-2 text-gray-400 text-xs">
                        {new Date(scan.created_at).toLocaleDateString('de-CH', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
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