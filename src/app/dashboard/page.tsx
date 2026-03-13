// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ActionPlan from '@/components/ActionPlan';
import { supabase } from '@/lib/supabase';
import { PageWrapper } from '../components/PageWrapper';

const G = {
  green: '#22c55e',
  greenBg: 'rgba(34,197,94,0.08)',
  greenBorder: 'rgba(34,197,94,0.25)',
  bgWhite: '#ffffff',
  bgLight: '#f1f2f6',
  border: '#e2e4ea',
  text: '#1a1a2e',
  textSec: '#555566',
  textMuted: '#888899',
  red: '#dc2626',
  yellow: '#eab308',
  blue: '#3b82f6',
};

interface AuditEntry {
  id: string;
  action: string;
  resource: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
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
  ai_trust_active?: boolean;
  ai_trust_expires_at?: string;
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
  const [aiTrustCopied, setAiTrustCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'policies' | 'audit' | 'jobs' | 'billing' | 'massnahmen' | 'badge' | 'aitrust'>('overview');

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
      .from('audit_log').select('id, action, resource, details, ip_address, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(20);
    if (auditData) setAuditLog(auditData);

    const { data: jobsData } = await supabase
      .from('batch_jobs').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10);
    if (jobsData) setBatchJobs(jobsData);

    const { data: subData } = await supabase
      .from('subscriptions').select('*').eq('user_id', userId)
      .eq('status', 'active').order('created_at', { ascending: false }).limit(1).single();
    if (subData) setSubscription(subData);

    const { data: scanData } = await supabase
      .from('scans').select('url, jurisdiction, ampel').eq('user_id', userId)
      .order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (scanData) setLatestScan({ url: scanData.url, scan: null });

    const { data: badgeData } = await supabase
      .from('verified_badges').select('id, website_url, issued_at, expires_at, is_active')
      .eq('user_id', userId).order('issued_at', { ascending: false });
    if (badgeData) setBadges(badgeData);
  };

  const generateBadge = async () => {
    if (!badgeUrl.trim()) return;
    setBadgeLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/badges/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ website_url: badgeUrl.trim() }),
      });
      const json = await res.json();
      if (json.badge_id) {
        const { data: badgeData } = await supabase
          .from('verified_badges').select('id, website_url, issued_at, expires_at, is_active')
          .eq('user_id', user?.id).order('issued_at', { ascending: false });
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

  const getEventLabel = (action: string) => ({
    scan: '🔍 Website gescannt',
    purchase: '💳 Kauf abgeschlossen',
    policy_generated: '📄 Policy erstellt',
    badge_created: '🏅 Badge erstellt',
  }[action] || action);

  const getStatusColor = (status: string): string => ({
    completed: G.green, processing: G.yellow,
    pending: G.blue, failed: G.red, active: G.green,
  }[status] || G.textMuted);

  const getPlanLabel = (plan: string) => ({
    starter: '🟢 Starter – CHF 79',
    professional: '🔵 Professional – CHF 149',
    enterprise: '🟣 Enterprise',
    impressum: '📄 Impressum Only – CHF 19',
  }[plan] || plan);

  const totalCostCents = batchJobs.reduce((sum, j) => sum + (j.cost_cents || 0), 0);

  const card: React.CSSProperties = {
    background: G.bgWhite, border: `1px solid ${G.border}`, borderRadius: 12, padding: 24,
  };

  if (loading) {
    return (
      <PageWrapper>
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 44, height: 44, border: `4px solid ${G.border}`, borderTopColor: G.green, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: G.text, marginBottom: 2 }}>Dashboard</h1>
            <p style={{ color: G.textMuted, fontSize: 13 }}>{user?.email}</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link href="/scanner" style={{ padding: '8px 16px', background: G.green, color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>🔍 Scannen</Link>
            <Link href="/checkout" style={{ padding: '8px 16px', border: `1px solid ${G.border}`, color: G.textSec, borderRadius: 8, fontSize: 13, textDecoration: 'none' }}>📈 Upgrade</Link>
            <button
              onClick={async () => { await supabase.auth.signOut(); router.push('/auth'); }}
              style={{ padding: '8px 16px', border: `1px solid rgba(220,38,38,0.3)`, color: G.red, background: 'transparent', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}
            >
              Abmelden
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 28 }}>
          {[
            { label: 'Policies', value: policies.length, icon: '📄' },
            { label: 'Batch Jobs', value: batchJobs.length, icon: '⚙️' },
            { label: 'Audit Einträge', value: auditLog.length, icon: '📋' },
            { label: 'KI-Kosten', value: `CHF ${(totalCostCents / 100).toFixed(2)}`, icon: '🤖' },
            { label: 'Plan', value: subscription?.plan?.toUpperCase() || 'FREE', icon: '💳' },
          ].map((stat) => (
            <div key={stat.label} style={{ ...card, textAlign: 'center', padding: 16 }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{stat.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: G.green }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: G.textMuted, marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: `1px solid ${G.border}`, paddingBottom: 0, overflowX: 'auto' }}>
          {[
            { key: 'overview', label: '🏠 Übersicht' },
            { key: 'policies', label: '📄 Policies' },
            { key: 'audit', label: '📋 Audit-Trail' },
            { key: 'jobs', label: '⚙️ Batch Jobs' },
            { key: 'billing', label: '💳 Abrechnung' },
            { key: 'massnahmen', label: '🎯 Massnahmen' },
            { key: 'badge', label: '🛡️ Verified Badge' },
            { key: 'aitrust', label: '🤖 AI-Trust' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                padding: '10px 16px', border: 'none', background: activeTab === tab.key ? G.green : 'transparent',
                color: activeTab === tab.key ? '#fff' : G.textSec, borderRadius: '8px 8px 0 0',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Übersicht */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={card}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: G.text, marginBottom: 16 }}>🚀 Quick Actions</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                <Link href="/scanner" style={{ display: 'block', padding: '14px', background: G.green, color: '#fff', borderRadius: 10, textAlign: 'center', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>🔍 Website scannen</Link>
                <Link href="/datenschutz-generator" style={{ display: 'block', padding: '14px', background: G.bgLight, color: G.text, border: `1px solid ${G.border}`, borderRadius: 10, textAlign: 'center', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>📝 Datenschutz erstellen</Link>
                <Link href="/impressum-generator" style={{ display: 'block', padding: '14px', background: G.bgLight, color: G.text, border: `1px solid ${G.border}`, borderRadius: 10, textAlign: 'center', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>📄 Impressum erstellen</Link>
              </div>
            </div>
            {auditLog.length > 0 && (
              <div style={card}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: G.text, marginBottom: 16 }}>🕐 Letzte Aktivität</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {auditLog.slice(0, 3).map((entry, i) => (
                    <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < 2 ? `1px solid ${G.border}` : 'none' }}>
                      <span style={{ color: G.textSec, fontSize: 14 }}>{getEventLabel(entry.action)}</span>
                      <span style={{ color: G.textMuted, fontSize: 12 }}>{new Date(entry.created_at).toLocaleDateString('de-CH')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Policies */}
        {activeTab === 'policies' && (
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            {policies.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center' }}>
                <p style={{ color: G.textMuted, marginBottom: 16 }}>Noch keine Policies erstellt.</p>
                <Link href="/datenschutz-generator" style={{ padding: '10px 24px', background: G.green, color: '#fff', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Erste Policy erstellen →</Link>
              </div>
            ) : (
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${G.border}` }}>
                    {['Website', 'Titel', 'Status', 'Erstellt'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: G.textMuted, fontWeight: 600, fontSize: 12 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {policies.map((policy) => (
                    <tr key={policy.id} style={{ borderBottom: `1px solid ${G.border}` }}>
                      <td style={{ padding: '12px 16px', color: G.textSec }}>{policy.website_url}</td>
                      <td style={{ padding: '12px 16px', color: G.text }}>{policy.title}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: getStatusColor(policy.status) }}>{policy.status}</td>
                      <td style={{ padding: '12px 16px', color: G.textMuted }}>{new Date(policy.created_at).toLocaleDateString('de-CH')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab: Audit-Trail */}
        {activeTab === 'audit' && (
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            {auditLog.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: G.textMuted }}>Noch keine Audit-Einträge vorhanden.</div>
            ) : (
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${G.border}` }}>
                    {['Ereignis', 'Resource', 'Details', 'Datum'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: G.textMuted, fontWeight: 600, fontSize: 12 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {auditLog.map((entry) => (
                    <tr key={entry.id} style={{ borderBottom: `1px solid ${G.border}` }}>
                      <td style={{ padding: '12px 16px', color: G.text }}>{getEventLabel(entry.action)}</td>
                      <td style={{ padding: '12px 16px', color: G.textMuted, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.resource ?? '–'}</td>
                      <td style={{ padding: '12px 16px', color: G.textMuted, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {entry.details ? JSON.stringify(entry.details).slice(0, 60) : '–'}
                      </td>
                      <td style={{ padding: '12px 16px', color: G.textMuted }}>{new Date(entry.created_at).toLocaleDateString('de-CH')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab: Batch Jobs */}
        {activeTab === 'jobs' && (
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            {batchJobs.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: G.textMuted }}>Noch keine Batch Jobs vorhanden.</div>
            ) : (
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${G.border}` }}>
                    {['Domain', 'Jurisdiction', 'Status', 'KI-Kosten', 'Erstellt'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: G.textMuted, fontWeight: 600, fontSize: 12 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {batchJobs.map((job) => (
                    <tr key={job.id} style={{ borderBottom: `1px solid ${G.border}` }}>
                      <td style={{ padding: '12px 16px', color: G.text }}>{job.domain}</td>
                      <td style={{ padding: '12px 16px', color: G.textSec }}>{job.jurisdiction}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: getStatusColor(job.status) }}>{job.status}</td>
                      <td style={{ padding: '12px 16px', color: G.textMuted }}>{job.cost_cents ? `CHF ${(job.cost_cents / 100).toFixed(4)}` : '–'}</td>
                      <td style={{ padding: '12px 16px', color: G.textMuted }}>{new Date(job.created_at).toLocaleDateString('de-CH')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab: Billing */}
        {activeTab === 'billing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={card}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: G.text, marginBottom: 16 }}>💳 Aktueller Plan</h2>
              {subscription ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: 'Plan', value: getPlanLabel(subscription.plan), highlight: true },
                    { label: 'Status', value: subscription.status, color: getStatusColor(subscription.status) },
                    ...(subscription.valid_until ? [{ label: 'Gültig bis', value: new Date(subscription.valid_until).toLocaleDateString('de-CH') }] : []),
                    { label: 'Kunde seit', value: new Date(subscription.created_at).toLocaleDateString('de-CH') },
                  ].map(({ label, value, highlight, color }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${G.border}`, paddingBottom: 12 }}>
                      <span style={{ color: G.textMuted, fontSize: 14 }}>{label}</span>
                      <span style={{ fontWeight: highlight ? 700 : 400, color: color || G.text, fontSize: 14 }}>{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <p style={{ color: G.textMuted, marginBottom: 16 }}>Kein aktiver Zugang – Sie nutzen den Free-Plan.</p>
                  <Link href="/checkout" style={{ padding: '10px 24px', background: G.green, color: '#fff', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Jetzt upgraden →</Link>
                </div>
              )}
            </div>

            <div style={card}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: G.text, marginBottom: 16 }}>🤖 KI-Kostenübersicht</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                <div style={{ background: G.bgLight, borderRadius: 10, padding: 16, textAlign: 'center' }}>
                  <div style={{ color: G.textMuted, fontSize: 12, marginBottom: 4 }}>Gesamt KI-Kosten</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: G.yellow }}>CHF {(totalCostCents / 100).toFixed(4)}</div>
                </div>
                <div style={{ background: G.bgLight, borderRadius: 10, padding: 16, textAlign: 'center' }}>
                  <div style={{ color: G.textMuted, fontSize: 12, marginBottom: 4 }}>Policy Jobs</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: G.green }}>{batchJobs.length}</div>
                </div>
              </div>
            </div>

            {!subscription && (
              <div style={{ background: G.bgLight, border: `1px solid ${G.border}`, borderRadius: 12, padding: 28, textAlign: 'center' }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: G.text, marginBottom: 8 }}>Bereit für mehr?</h3>
                <p style={{ color: G.textSec, marginBottom: 20, fontSize: 14 }}>Starter ab CHF 79 – vollständige Compliance für Ihre Website.</p>
                <Link href="/checkout" style={{ padding: '12px 32px', background: G.green, color: '#fff', fontWeight: 700, borderRadius: 10, fontSize: 15, textDecoration: 'none' }}>Jetzt starten →</Link>
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
              <div style={{ ...card, textAlign: 'center', padding: 48 }}>
                <p style={{ color: G.textMuted, marginBottom: 16 }}>Noch kein Scan vorhanden – scannen Sie zuerst Ihre Website.</p>
                <Link href="/scanner" style={{ padding: '10px 24px', background: G.green, color: '#fff', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                  🔍 Website scannen →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab: Verified Badge */}
        {activeTab === 'badge' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: G.greenBg, border: `1px solid ${G.greenBorder}`, borderRadius: 12, padding: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: G.green, marginBottom: 6 }}>🛡️ Dataquard Verified Badge</h2>
              <p style={{ color: G.textSec, fontSize: 13 }}>
                Zeigen Sie Ihren Besuchern, dass Ihre Website auf DSGVO/nDSG-Compliance geprüft wurde.
                Betten Sie das Badge auf Ihrer Website ein – es verlinkt auf eine öffentliche Verifikationsseite.
              </p>
            </div>

            {subscription && subscription.plan !== 'impressum' ? (
              <div style={card}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: G.text, marginBottom: 14 }}>Badge generieren</h3>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input
                    type="url" value={badgeUrl} onChange={(e) => setBadgeUrl(e.target.value)}
                    placeholder="https://ihrewebsite.ch"
                    style={{ flex: 1, background: G.bgLight, border: `1px solid ${G.border}`, borderRadius: 8, padding: '10px 14px', fontSize: 14, color: G.text, outline: 'none' }}
                  />
                  <button
                    onClick={generateBadge} disabled={badgeLoading || !badgeUrl.trim()}
                    style={{ padding: '10px 20px', background: G.green, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: badgeLoading ? 'not-allowed' : 'pointer', opacity: badgeLoading ? 0.6 : 1, whiteSpace: 'nowrap' }}
                  >
                    {badgeLoading ? '⏳ Erstelle...' : '🛡️ Badge erstellen'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ ...card, textAlign: 'center', padding: 32 }}>
                <p style={{ color: G.textMuted, marginBottom: 16 }}>Verified Badge erfordert einen Starter- oder Professional-Plan.</p>
                <Link href="/checkout" style={{ padding: '10px 24px', background: G.green, color: '#fff', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Jetzt upgraden →</Link>
              </div>
            )}

            {badges.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: G.text }}>Deine Badges</h3>
                {badges.map((badge) => {
                  const isExpired = badge.expires_at && new Date(badge.expires_at) < new Date();
                  const isValid = badge.is_active && !isExpired;
                  return (
                    <div key={badge.id} style={card}>
                      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        <img src={`/api/badges/${badge.id}/image`} alt="Verified Badge" width={200} height={120}
                          style={{ borderRadius: 8, border: `1px solid ${G.border}`, flexShrink: 0 }} />

                        <div style={{ flex: 1, minWidth: 200 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                            <span style={{ background: isValid ? G.greenBg : 'rgba(220,38,38,0.08)', color: isValid ? G.green : G.red, border: `1px solid ${isValid ? G.greenBorder : 'rgba(220,38,38,0.2)'}`, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                              {isValid ? '✓ Aktiv' : '✗ Inaktiv/Abgelaufen'}
                            </span>
                            <a href={badge.website_url} target="_blank" rel="noopener noreferrer"
                              style={{ color: G.green, fontWeight: 600, fontSize: 13 }}>{badge.website_url}</a>
                          </div>
                          <div style={{ color: G.textMuted, fontSize: 12, marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <span>Ausgestellt: {new Date(badge.issued_at).toLocaleDateString('de-CH')}</span>
                            <span>Gültig bis: {badge.expires_at ? new Date(badge.expires_at).toLocaleDateString('de-CH') : '–'}</span>
                            <span style={{ fontFamily: 'monospace', color: G.border }}>ID: {badge.id}</span>
                          </div>
                          <a href={`/verify/${badge.id}`} target="_blank" rel="noopener noreferrer"
                            style={{ color: G.green, fontSize: 12, display: 'block', marginBottom: 12 }}>
                            🔗 Verifikationsseite öffnen →
                          </a>
                          <p style={{ color: G.textMuted, fontSize: 12, marginBottom: 6 }}>Embed-Code für Ihre Website:</p>
                          <div style={{ background: G.bgLight, border: `1px solid ${G.border}`, borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 11, color: G.green, wordBreak: 'break-all', lineHeight: 1.6 }}>
                            {`<a href="https://dataquard.ch/verify/${badge.id}" target="_blank" rel="noopener">`}<br />
                            {`  <img src="https://dataquard.ch/api/badges/${badge.id}/image" alt="Dataquard Verified" width="200" height="120" />`}<br />
                            {`</a>`}
                          </div>
                          <button onClick={() => copyEmbedCode(badge.id)}
                            style={{ marginTop: 8, padding: '6px 14px', background: G.bgLight, border: `1px solid ${G.border}`, borderRadius: 6, fontSize: 12, color: G.textSec, cursor: 'pointer' }}>
                            {badgeCopied ? '✅ Kopiert!' : '📋 Code kopieren'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {badges.length === 0 && subscription && subscription.plan !== 'impressum' && (
              <div style={{ textAlign: 'center', color: G.textMuted, padding: 32 }}>
                Noch kein Badge erstellt. Geben Sie Ihre Website-URL ein und klicken Sie auf &ldquo;Badge erstellen&rdquo;.
              </div>
            )}
          </div>
        )}

        {/* Tab: AI-Trust */}
        {activeTab === 'aitrust' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {subscription?.ai_trust_active ? (
              <>
                {/* Status-Anzeige */}
                <div style={{ background: '#0F1B2D', borderRadius: 12, padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                  <img src="/badge-ai-trust.svg" alt="AI-Trust Badge" style={{ width: 64, height: 'auto', flexShrink: 0 }} />
                  <div>
                    <p style={{ color: '#ffffff', fontWeight: 600, fontSize: 15, marginBottom: 4 }}>AI-Trust aktiv</p>
                    <p style={{ color: '#9ca3af', fontSize: 13 }}>Nächster Scan: automatisch · 250 Bilder</p>
                    <p style={{ color: '#9ca3af', fontSize: 13 }}>
                      Gültig bis: {subscription.ai_trust_expires_at
                        ? new Date(subscription.ai_trust_expires_at).toLocaleDateString('de-CH')
                        : '–'}
                    </p>
                  </div>
                </div>

                {/* Shield-Badge Embed Code */}
                <div style={card}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e', marginBottom: 8 }}>Shield-Badge für Ihre Website</h3>
                  <p style={{ fontSize: 13, color: '#888899', marginBottom: 14 }}>
                    Kopieren Sie diesen Code in den Footer Ihrer Website:
                  </p>
                  <div style={{ background: '#111827', borderRadius: 8, padding: 14, fontFamily: 'monospace', fontSize: 12, color: '#22c55e', position: 'relative', lineHeight: 1.7 }}>
                    <button
                      onClick={() => {
                        const code = `<!-- Dataquard AI-Trust Badge -->\n<a href="https://dataquard.ch" target="_blank" rel="noopener" style="display:inline-block;">\n  <img src="https://dataquard.ch/badge-ai-trust-banner.svg" alt="AI-Compliance verifiziert durch Dataquard" width="200" height="70" />\n</a>`;
                        navigator.clipboard.writeText(code);
                        setAiTrustCopied(true);
                        setTimeout(() => setAiTrustCopied(false), 2000);
                      }}
                      style={{ position: 'absolute', top: 10, right: 10, background: 'transparent', border: '1px solid #374151', borderRadius: 6, color: aiTrustCopied ? '#22c55e' : '#9ca3af', fontSize: 11, padding: '3px 10px', cursor: 'pointer' }}
                    >
                      {aiTrustCopied ? '✅ Kopiert!' : 'Kopieren'}
                    </button>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{`<!-- Dataquard AI-Trust Badge -->
<a href="https://dataquard.ch" target="_blank" rel="noopener" style="display:inline-block;">
  <img src="https://dataquard.ch/badge-ai-trust-banner.svg" alt="AI-Compliance verifiziert durch Dataquard" width="200" height="70" />
</a>`}</pre>
                  </div>

                  {/* Vorschau */}
                  <div style={{ marginTop: 16 }}>
                    <p style={{ fontSize: 12, color: '#888899', marginBottom: 8 }}>Vorschau:</p>
                    <img src="/badge-ai-trust-banner.svg" alt="AI-Trust Banner" style={{ height: 70, width: 'auto' }} />
                  </div>
                </div>
              </>
            ) : (
              /* Upsell */
              <div style={{ border: '1px solid rgba(139,92,246,0.3)', borderRadius: 12, padding: 20, background: 'rgba(139,92,246,0.04)' }}>
                <p style={{ fontSize: 14, color: '#1a1a2e', marginBottom: 6 }}>🤖 Laufende KI-Überwachung für Ihre Website</p>
                <p style={{ fontSize: 13, color: '#888899', marginBottom: 12 }}>Deepfake-Erkennung, EU AI Act Konformität, Shield-Badge</p>
                <a
                  href="/checkout?plan=ai-trust"
                  style={{ color: '#8B5CF6', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
                >
                  AI-Trust Abo aktivieren → CHF 99/Jahr
                </a>
              </div>
            )}
          </div>
        )}

      </div>
    </PageWrapper>
  );
}
