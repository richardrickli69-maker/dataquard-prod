// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import ActionPlan from '@/components/ActionPlan';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface AuditEntry {
  id: string;
  event_type: string;
  version_from: number;
  version_to: number;
  event_data: { modules_added: string[]; modules_removed: string[] };
  created_at: string;
}

interface Policy {
  id: string;
  website_url: string;
  title: string;
  status: string;
  created_at: string;
}

interface BatchJob {
  id: string;
  domain: string;
  status: string;
  jurisdiction: string;
  created_at: string;
  completed_at: string;
  cost_cents: number;
}

interface Subscription {
  id: string;
  plan: string;
  status: string;
  stripe_customer_id: string;
  valid_until: string;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [batchJobs, setBatchJobs] = useState<BatchJob[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [latestScan, setLatestScan] = useState<{ url: string; scan: any } | null>(null);
  const [badges, setBadges] = useState<{ id: string; website_url: string; issued_at: string; expires_at: string; is_active: boolean }[]>([]);
  const [badgeUrl, setBadgeUrl] = useState('');
  const [badgeLoading, setBadgeLoading] = useState(false);
  const [badgeCopied, setBadgeCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'policies' | 'audit' | 'jobs' | 'billing' | 'massnahmen' | 'badge'>('overview');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await loadData(session.user.id);
        setLoading(false);
      } else {
        router.push('/auth');
      }
    };
    checkAuth();
  }, []);

  const loadData = async (userId: string) => {
    const { data: policiesData } = await supabase
      .from('policies').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (policiesData) setPolicies(policiesData);

    const { data: auditData } = await supabase
      .from('audit_log').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20);
    if (auditData) setAuditLog(auditData);

    const { data: jobsData } = await supabase
      .from('batch_jobs').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10);
    if (jobsData) setBatchJobs(jobsData);

    const { data: subData } = await supabase
      .from('subscriptions').select('*').eq('user_id', userId)
      .eq('status', 'active').order('created_at', { ascending: false }).limit(1).single();
    if (subData) setSubscription(subData);

    // Letzten Scan des Users laden für Massnahmenplan
    const { data: scanData } = await supabase
      .from('scans')
      .select('url, jurisdiction, ampel')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (scanData) setLatestScan({ url: scanData.url, scan: null });

    // Verified Badges laden
    const { data: badgeData } = await supabase
      .from('verified_badges')
      .select('id, website_url, issued_at, expires_at, is_active')
      .eq('user_id', userId)
      .order('issued_at', { ascending: false });
    if (badgeData) setBadges(badgeData);
  };

  const generateBadge = async () => {
    if (!badgeUrl.trim()) return;
    setBadgeLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/badges/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ website_url: badgeUrl.trim() }),
      });
      const json = await res.json();
      if (json.badge_id) {
        const { data: badgeData } = await supabase
          .from('verified_badges')
          .select('id, website_url, issued_at, expires_at, is_active')
          .eq('user_id', user?.id)
          .order('issued_at', { ascending: false });
        if (badgeData) setBadges(badgeData);
        setBadgeUrl('');
      }
    } finally {
      setBadgeLoading(false);
    }
  };

  const copyEmbedCode = (badgeId: string) => {
    const code = `<a href="https://dataquard.ch/verify/${badgeId}" target="_blank" rel="noopener">\n  <img src="https://dataquard.ch/api/badges/${badgeId}/image" alt="Dataquard Verified" width="200" height="120" />\n</a>`;
    navigator.clipboard.writeText(code);
    setBadgeCopied(true);
    setTimeout(() => setBadgeCopied(false), 2000);
  };

  const getEventLabel = (type: string) => ({
    created: '✅ Erstellt', updated: '🔄 Aktualisiert',
    law_update: '⚖️ Gesetzesupdate', rescan: '🔍 Re-Scan', viewed: '👁️ Angesehen',
  }[type] || type);

  const getStatusColor = (status: string) => ({
    completed: 'text-green-400', processing: 'text-yellow-400',
    pending: 'text-blue-400', failed: 'text-red-400', active: 'text-green-400',
  }[status] || 'text-gray-400');

  const getPlanLabel = (plan: string) => ({
    starter: '🟢 Starter – CHF 79',
    professional: '🔵 Professional – CHF 149',
    enterprise: '🟣 Enterprise',
    impressum: '📄 Impressum Only – CHF 19',
  }[plan] || plan);

  const totalCostCents = batchJobs.reduce((sum, j) => sum + (j.cost_cents || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-1">Dashboard</h1>
            <p className="text-gray-400">{user?.email}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/scanner" className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 text-sm font-bold">🔍 Scannen</Link>
            <Link href="/analytics" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-bold">📊 Analytics</Link>
            <Link href="/checkout" className="px-4 py-2 border border-indigo-500 text-indigo-300 rounded-lg hover:bg-indigo-900 text-sm">📈 Upgrade</Link>
            <button
              onClick={async () => { await supabase.auth.signOut(); router.push('/auth'); }}
              className="px-4 py-2 border border-red-700 text-red-400 rounded-lg hover:bg-red-900 hover:bg-opacity-30 text-sm"
            >
              Abmelden
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Policies', value: policies.length, icon: '📄' },
            { label: 'Batch Jobs', value: batchJobs.length, icon: '⚙️' },
            { label: 'Audit Einträge', value: auditLog.length, icon: '📋' },
            { label: 'KI-Kosten', value: `CHF ${(totalCostCents / 100).toFixed(2)}`, icon: '🤖' },
            { label: 'Plan', value: subscription?.plan?.toUpperCase() || 'FREE', icon: '💳' },
          ].map((stat) => (
            <div key={stat.label} className="bg-indigo-900 bg-opacity-30 border border-indigo-700 p-4 rounded-lg text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-xl font-bold text-indigo-300">{stat.value}</div>
              <div className="text-gray-400 text-xs mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-indigo-700 pb-2 overflow-x-auto">
          {[
            { key: 'overview', label: '🏠 Übersicht' },
            { key: 'policies', label: '📄 Policies' },
            { key: 'audit', label: '📋 Audit-Trail' },
            { key: 'jobs', label: '⚙️ Batch Jobs' },
            { key: 'billing', label: '💳 Billing' },
            { key: 'massnahmen', label: '🎯 Massnahmen' },
            { key: 'badge', label: '🛡️ Verified Badge' },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-t-lg text-sm font-bold transition whitespace-nowrap ${activeTab === tab.key ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Übersicht */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-indigo-900 bg-opacity-30 border border-indigo-700 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">🚀 Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/scanner" className="block px-6 py-4 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 text-center font-bold">🔍 Website scannen</Link>
                <Link href="/datenschutz-generator" className="block px-6 py-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-center font-bold">📝 Datenschutz erstellen</Link>
                <Link href="/impressum-generator" className="block px-6 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 text-center font-bold">📄 Impressum erstellen</Link>
              </div>
            </div>
            {auditLog.length > 0 && (
              <div className="bg-indigo-900 bg-opacity-30 border border-indigo-700 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-4">🕐 Letzte Aktivität</h2>
                <div className="space-y-3">
                  {auditLog.slice(0, 3).map((entry) => (
                    <div key={entry.id} className="flex justify-between items-center border-b border-indigo-800 pb-3">
                      <span>{getEventLabel(entry.event_type)}</span>
                      <span className="text-gray-400 text-sm">{new Date(entry.created_at).toLocaleDateString('de-CH')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Policies */}
        {activeTab === 'policies' && (
          <div className="bg-indigo-900 bg-opacity-30 border border-indigo-700 rounded-lg overflow-hidden">
            {policies.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-400 mb-4">Noch keine Policies erstellt.</p>
                <Link href="/datenschutz-generator" className="px-6 py-3 bg-indigo-500 text-white rounded-lg font-bold">Erste Policy erstellen →</Link>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-indigo-700">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-400">Website</th>
                    <th className="text-left py-3 px-4 text-gray-400">Titel</th>
                    <th className="text-left py-3 px-4 text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 text-gray-400">Erstellt</th>
                  </tr>
                </thead>
                <tbody>
                  {policies.map((policy) => (
                    <tr key={policy.id} className="border-b border-indigo-900 hover:bg-indigo-900 hover:bg-opacity-30">
                      <td className="py-3 px-4 text-gray-300">{policy.website_url}</td>
                      <td className="py-3 px-4">{policy.title}</td>
                      <td className={`py-3 px-4 font-bold ${getStatusColor(policy.status)}`}>{policy.status}</td>
                      <td className="py-3 px-4 text-gray-400">{new Date(policy.created_at).toLocaleDateString('de-CH')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab: Audit-Trail */}
        {activeTab === 'audit' && (
          <div className="bg-indigo-900 bg-opacity-30 border border-indigo-700 rounded-lg overflow-hidden">
            {auditLog.length === 0 ? (
              <div className="p-8 text-center text-gray-400">Noch keine Audit-Einträge vorhanden.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-indigo-700">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-400">Ereignis</th>
                    <th className="text-left py-3 px-4 text-gray-400">Version</th>
                    <th className="text-left py-3 px-4 text-gray-400">Änderungen</th>
                    <th className="text-left py-3 px-4 text-gray-400">Datum</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLog.map((entry) => (
                    <tr key={entry.id} className="border-b border-indigo-900 hover:bg-indigo-900 hover:bg-opacity-30">
                      <td className="py-3 px-4">{getEventLabel(entry.event_type)}</td>
                      <td className="py-3 px-4 text-gray-400">
                        {entry.version_from && entry.version_to ? `v${entry.version_from} → v${entry.version_to}` : '–'}
                      </td>
                      <td className="py-3 px-4 text-xs">
                        {entry.event_data?.modules_added?.length > 0 && <span className="text-green-400">+{entry.event_data.modules_added.join(', ')} </span>}
                        {entry.event_data?.modules_removed?.length > 0 && <span className="text-red-400">-{entry.event_data.modules_removed.join(', ')}</span>}
                      </td>
                      <td className="py-3 px-4 text-gray-400">{new Date(entry.created_at).toLocaleDateString('de-CH')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab: Batch Jobs */}
        {activeTab === 'jobs' && (
          <div className="bg-indigo-900 bg-opacity-30 border border-indigo-700 rounded-lg overflow-hidden">
            {batchJobs.length === 0 ? (
              <div className="p-8 text-center text-gray-400">Noch keine Batch Jobs vorhanden.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-indigo-700">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-400">Domain</th>
                    <th className="text-left py-3 px-4 text-gray-400">Jurisdiction</th>
                    <th className="text-left py-3 px-4 text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 text-gray-400">KI-Kosten</th>
                    <th className="text-left py-3 px-4 text-gray-400">Erstellt</th>
                  </tr>
                </thead>
                <tbody>
                  {batchJobs.map((job) => (
                    <tr key={job.id} className="border-b border-indigo-900 hover:bg-indigo-900 hover:bg-opacity-30">
                      <td className="py-3 px-4 text-gray-300">{job.domain}</td>
                      <td className="py-3 px-4 text-gray-400">{job.jurisdiction}</td>
                      <td className={`py-3 px-4 font-bold ${getStatusColor(job.status)}`}>{job.status}</td>
                      <td className="py-3 px-4 text-gray-400">{job.cost_cents ? `CHF ${(job.cost_cents / 100).toFixed(4)}` : '–'}</td>
                      <td className="py-3 px-4 text-gray-400">{new Date(job.created_at).toLocaleDateString('de-CH')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab: Billing */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            {/* Aktueller Plan */}
            <div className="bg-indigo-900 bg-opacity-30 border border-indigo-700 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">💳 Aktueller Plan</h2>
              {subscription ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Plan</span>
                    <span className="font-bold text-indigo-300">{getPlanLabel(subscription.plan)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status</span>
                    <span className={`font-bold ${getStatusColor(subscription.status)}`}>{subscription.status}</span>
                  </div>
                  {subscription.valid_until && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Gültig bis</span>
                      <span className="text-white">{new Date(subscription.valid_until).toLocaleDateString('de-CH')}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Kunde seit</span>
                    <span className="text-white">{new Date(subscription.created_at).toLocaleDateString('de-CH')}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-400 mb-4">Kein aktiver Zugang – Sie nutzen den Free-Plan.</p>
                  <Link href="/checkout" className="px-6 py-3 bg-indigo-500 text-white rounded-lg font-bold hover:bg-indigo-600">Jetzt upgraden →</Link>
                </div>
              )}
            </div>

            {/* KI-Kostenübersicht */}
            <div className="bg-indigo-900 bg-opacity-30 border border-indigo-700 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">🤖 KI-Kostenübersicht</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-indigo-800 bg-opacity-50 p-4 rounded-lg text-center">
                  <div className="text-gray-400 text-sm mb-1">Gesamt KI-Kosten</div>
                  <div className="text-2xl font-bold text-yellow-300">CHF {(totalCostCents / 100).toFixed(4)}</div>
                </div>
                <div className="bg-indigo-800 bg-opacity-50 p-4 rounded-lg text-center">
                  <div className="text-gray-400 text-sm mb-1">Policy Jobs</div>
                  <div className="text-2xl font-bold text-indigo-300">{batchJobs.length}</div>
                </div>
              </div>
            </div>

            {/* Upgrade CTA */}
            {!subscription && (
              <div className="bg-gradient-to-r from-indigo-800 to-purple-800 border border-indigo-500 p-6 rounded-lg text-center">
                <h3 className="text-xl font-bold mb-2">Bereit für mehr?</h3>
                <p className="text-gray-300 mb-4">Starter ab CHF 79 – vollständige Compliance für Ihre Website.</p>
                <Link href="/checkout" className="px-8 py-3 bg-white text-indigo-700 font-bold rounded-lg hover:bg-gray-100">Jetzt starten →</Link>
              </div>
            )}
          </div>
        )}

        {/* Tab: Massnahmen */}
        {activeTab === 'massnahmen' && (
          <div>
            {latestScan ? (
              <ActionPlan
                scanResult={latestScan.scan ?? {
                  compliance: { score: 0, jurisdiction: 'nDSG', ampel: '🔴', hasPrivacyPolicy: false, trackersFound: [], hasCookieBanner: false },
                  optimization: { score: 0, loadTime: 0, trackerCount: 0 },
                  trust: { score: 0, hasSSL: false, hasImpressum: false },
                  recommendations: [],
                }}
                url={latestScan.url}
              />
            ) : (
              <div className="bg-indigo-900 bg-opacity-30 border border-indigo-700 p-8 rounded-lg text-center">
                <p className="text-gray-400 mb-4">Noch kein Scan vorhanden – scannen Sie zuerst Ihre Website.</p>
                <Link href="/scanner" className="px-6 py-3 bg-indigo-500 text-white rounded-lg font-bold hover:bg-indigo-600">
                  🔍 Website scannen →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab: Verified Badge */}
        {activeTab === 'badge' && (
          <div className="space-y-6">

            {/* Erklärung */}
            <div className="bg-gradient-to-r from-green-900 to-emerald-900 bg-opacity-40 border border-green-700 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-green-300 mb-2">🛡️ Dataquard Verified Badge</h2>
              <p className="text-gray-300 text-sm">
                Zeigen Sie Ihren Besuchern, dass Ihre Website auf DSGVO/nDSG-Compliance geprüft wurde.
                Betten Sie das Badge auf Ihrer Website ein – es verlinkt auf eine öffentliche Verifikationsseite.
              </p>
            </div>

            {/* Neuen Badge erstellen */}
            {subscription && subscription.plan !== 'impressum' ? (
              <div className="bg-indigo-900 bg-opacity-30 border border-indigo-700 p-6 rounded-lg">
                <h3 className="text-lg font-bold mb-4">Badge generieren</h3>
                <div className="flex gap-3">
                  <input
                    type="url"
                    value={badgeUrl}
                    onChange={(e) => setBadgeUrl(e.target.value)}
                    placeholder="https://ihrewebsite.ch"
                    className="flex-1 px-4 py-2 bg-indigo-800 bg-opacity-50 border border-indigo-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-400"
                  />
                  <button
                    onClick={generateBadge}
                    disabled={badgeLoading || !badgeUrl.trim()}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 text-sm whitespace-nowrap"
                  >
                    {badgeLoading ? '⏳ Erstelle...' : '🛡️ Badge erstellen'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-indigo-900 bg-opacity-30 border border-indigo-700 p-6 rounded-lg text-center">
                <p className="text-gray-400 mb-4">Verified Badge erfordert einen Starter- oder Professional-Plan.</p>
                <Link href="/checkout" className="px-6 py-3 bg-indigo-500 text-white rounded-lg font-bold hover:bg-indigo-600">Jetzt upgraden →</Link>
              </div>
            )}

            {/* Badge-Liste */}
            {badges.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Deine Badges</h3>
                {badges.map((badge) => {
                  const isExpired = badge.expires_at && new Date(badge.expires_at) < new Date();
                  const isValid = badge.is_active && !isExpired;
                  return (
                    <div key={badge.id} className="bg-indigo-900 bg-opacity-30 border border-indigo-700 rounded-lg p-6">
                      <div className="flex flex-col md:flex-row gap-6 items-start">

                        {/* Badge Preview */}
                        <div className="flex-shrink-0">
                          <img
                            src={`/api/badges/${badge.id}/image`}
                            alt="Verified Badge"
                            width={200}
                            height={120}
                            className="rounded-lg shadow-lg border border-indigo-700"
                          />
                        </div>

                        {/* Badge Info */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${isValid ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                              {isValid ? '✓ Aktiv' : '✗ Inaktiv/Abgelaufen'}
                            </span>
                            <a href={badge.website_url} target="_blank" rel="noopener noreferrer"
                              className="text-indigo-300 hover:text-indigo-200 font-semibold text-sm">
                              {badge.website_url}
                            </a>
                          </div>
                          <div className="text-xs text-gray-400 space-y-1">
                            <p>Ausgestellt: {new Date(badge.issued_at).toLocaleDateString('de-CH')}</p>
                            <p>Gültig bis: {badge.expires_at ? new Date(badge.expires_at).toLocaleDateString('de-CH') : '–'}</p>
                            <p className="font-mono text-gray-500">ID: {badge.id}</p>
                          </div>

                          {/* Verifikationslink */}
                          <a
                            href={`/verify/${badge.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block text-xs text-green-400 hover:text-green-300"
                          >
                            🔗 Verifikationsseite öffnen →
                          </a>

                          {/* Embed Code */}
                          <div>
                            <p className="text-xs text-gray-400 mb-2">Embed-Code für Ihre Website:</p>
                            <div className="bg-black bg-opacity-40 rounded-lg p-3 font-mono text-xs text-green-300 break-all">
                              {`<a href="https://dataquard.ch/verify/${badge.id}" target="_blank" rel="noopener">`}<br />
                              {`  <img src="https://dataquard.ch/api/badges/${badge.id}/image" alt="Dataquard Verified" width="200" height="120" />`}<br />
                              {`</a>`}
                            </div>
                            <button
                              onClick={() => copyEmbedCode(badge.id)}
                              className="mt-2 px-4 py-1.5 bg-indigo-700 text-white rounded text-xs hover:bg-indigo-600 transition"
                            >
                              {badgeCopied ? '✅ Kopiert!' : '📋 Code kopieren'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {badges.length === 0 && subscription && subscription.plan !== 'impressum' && (
              <div className="text-center text-gray-400 py-8">
                Noch kein Badge erstellt. Geben Sie Ihre Website-URL ein und klicken Sie auf "Badge erstellen".
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}