/*
 * ══════════════════════════════════════════
 * DATAQUARD DESIGN TOKENS
 * ══════════════════════════════════════════
 *
 * FARBEN:
 *   Primär (CTA/Akzent):    #22c55e (Electric Green)
 *   Primär Hover:            #16a34a (Dunkleres Grün)
 *   Hintergrund:             #ffffff (Weiss)
 *   Text Dunkel:             #1a1a2e
 *   Text Mittel:             #555566
 *   Text Hell:               #888899
 *   Border:                  #e2e4ea
 *   Card-BG:                 #f1f2f6
 *
 * TYPOGRAFIE:
 *   H1:            fontSize 46, fontWeight 900
 *   H2:            fontSize 24–30, fontWeight 800
 *   H3:            fontSize 18–20, fontWeight 700
 *   Section-Label: fontSize 12, fontWeight 700, uppercase
 *   Body:          fontSize 16
 *   Small:         fontSize 14
 *   Micro:         fontSize 12
 *
 * ICONS:
 *   Inline/Badges:  20–24px
 *   Checkmarks:     16px
 *   Card-Icons:     36–48px
 *   Section-Header: 40px
 *   Tabellen:       24px
 *
 * BUTTONS:
 *   Primär:    bg #22c55e, color white, padding '13px 32px', borderRadius 12, hover #16a34a
 *   Sekundär:  border '2px solid #22c55e', color #22c55e, padding '13px 32px', borderRadius 12
 *   Font:      fontWeight 700, fontSize 16
 *
 * LOGOS (Navbar):
 *   Desktop: shield 80px, text 48px
 *   Tablet:  shield 64px, text 36px
 *   Mobile:  shield 52px, text 28px
 * ══════════════════════════════════════════
 */

// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import ActionPlan from '@/components/ActionPlan';
import { supabase } from '@/lib/supabase';
import { PageWrapper } from '../components/PageWrapper';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'richard.rickli69@gmail.com';

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

interface Subscription {
  id: string;
  plan: string;
  status: string;
  stripe_customer_id: string;
  stripe_subscription_id?: string;
  current_period_end?: string;
  interval?: string;
  created_at: string;
  ai_trust_active?: boolean;
  ai_trust_expires_at?: string;
  ai_trust_stripe_subscription_id?: string;
  ai_images_scanned?: number;
  ai_images_limit?: number;
  ai_images_reset_at?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [latestScan, setLatestScan] = useState<{ url: string; scan: any } | null>(null);
  const [badges, setBadges] = useState<{ id: string; website_url: string; issued_at: string; expires_at: string; is_active: boolean }[]>([]);
  const [badgeUrl, setBadgeUrl] = useState('');
  const [badgeLoading, setBadgeLoading] = useState(false);
  const [badgeCopied, setBadgeCopied] = useState(false);
  const [aiTrustCopied, setAiTrustCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'policies' | 'billing' | 'massnahmen' | 'badge' | 'aitrust' | 'aishield'>('overview');

  // AI-Shield States
  const [shieldSettings, setShieldSettings] = useState<{
    enabled: boolean;
    badge_style: 'minimal' | 'standard' | 'detailed';
    badge_color: string;
    badge_position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  }>({ enabled: false, badge_style: 'standard', badge_color: '#8B5CF6', badge_position: 'top-left' });
  const [aiImages, setAiImages] = useState<{ id: string; image_url: string; ai_probability: number; is_labeled: boolean }[]>([]);
  const [shieldSaving, setShieldSaving] = useState(false);
  const [snippetCopied, setSnippetCopied] = useState(false);

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
      .from('audit_log').select('id, action, resource, details, ip_address, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(3);
    if (auditData) setAuditLog(auditData);

    // Schritt 1: KMU-Abos aus subscriptions laden (starter/professional)
    const { data: subData } = await supabase
      .from('subscriptions').select('*').eq('user_id', userId)
      .eq('status', 'active').in('plan', ['starter', 'professional'])
      .order('created_at', { ascending: false }).limit(1).maybeSingle();

    if (subData) {
      setSubscription(subData);
    } else {
      // Schritt 2: Fallback auf agency_accounts (Agency/Advokatur-Pläne)
      const { data: agencyData } = await supabase
        .from('agency_accounts').select('*').eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (agencyData) setSubscription(agencyData as unknown as Subscription);
    }

    const { data: scanData } = await supabase
      .from('scans').select('url, jurisdiction, ampel').eq('user_id', userId)
      .order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (scanData) setLatestScan({ url: scanData.url, scan: null });

    const { data: badgeData } = await supabase
      .from('verified_badges').select('id, website_url, issued_at, expires_at, is_active')
      .eq('user_id', userId).order('issued_at', { ascending: false });
    if (badgeData) setBadges(badgeData);

    // AI-Shield Einstellungen laden
    const { data: shieldData } = await supabase
      .from('ai_shield_settings')
      .select('enabled, badge_style, badge_color, badge_position')
      .eq('user_id', userId)
      .maybeSingle();
    if (shieldData) {
      setShieldSettings({
        enabled: shieldData.enabled ?? false,
        badge_style: shieldData.badge_style ?? 'standard',
        badge_color: shieldData.badge_color ?? '#8B5CF6',
        badge_position: shieldData.badge_position ?? 'top-left',
      });
    }

    // Erkannte KI-Bilder laden
    const { data: imagesData } = await supabase
      .from('ai_detected_images')
      .select('id, image_url, ai_probability, is_labeled')
      .eq('user_id', userId)
      .order('ai_probability', { ascending: false })
      .limit(50);
    if (imagesData) setAiImages(imagesData);
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

  const saveShieldSettings = async (newSettings: typeof shieldSettings) => {
    if (!user) return;
    setShieldSaving(true);
    try {
      await supabase.from('ai_shield_settings').upsert(
        { user_id: user.id, ...newSettings, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      );
    } finally {
      setShieldSaving(false);
    }
  };

  const toggleImageLabel = async (imageId: string, newValue: boolean) => {
    setAiImages(prev => prev.map(img => img.id === imageId ? { ...img, is_labeled: newValue } : img));
    await supabase.from('ai_detected_images').update({ is_labeled: newValue }).eq('id', imageId);
  };

  const copyShieldSnippet = async (userId: string) => {
    const code = `<!-- Dataquard AI-Trust Shield -->\n<script src="https://www.dataquard.ch/api/shield/${userId}.js" defer></script>`;
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const el = document.createElement('textarea');
      el.value = code;
      el.style.cssText = 'position:fixed;opacity:0;';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setSnippetCopied(true);
    setTimeout(() => setSnippetCopied(false), 2000);
  };

  const copyEmbedCode = (badgeId: string) => {
    const code = `<a href="https://www.dataquard.ch/verify/${badgeId}" target="_blank" rel="noopener">\n  <img src="https://www.dataquard.ch/api/badges/${badgeId}/image" alt="Dataquard Verified" width="200" height="120" />\n</a>`;
    navigator.clipboard.writeText(code);
    setBadgeCopied(true);
    setTimeout(() => setBadgeCopied(false), 2000);
  };

  const getEventLabel = (action: string) => ({
    scan: 'Website gescannt',
    purchase: 'Kauf abgeschlossen',
    policy_generated: 'Policy erstellt',
    badge_created: 'Badge erstellt',
  }[action] || action);

  const getStatusColor = (status: string): string => ({
    completed: G.green, processing: G.yellow,
    pending: G.blue, failed: G.red, active: G.green,
  }[status] || G.textMuted);

  const getPlanLabel = (plan: string) => ({
    starter:           '🟢 Starter – CHF 19.–/Mt. (CHF 228.–/Jahr)',
    professional:      '🔵 Professional – CHF 39.–/Mt. (CHF 468.–/Jahr)',
    enterprise:        '🟣 Enterprise',
    agency_basic:      '🟠 Agency Basic – CHF 79.–/Mt.',
    agency_pro:        '🟡 Agency Pro – CHF 179.–/Mt.',
    agency_enterprise: '⚫ Agency Enterprise – CHF 349.–/Mt.',
    advokatur:         '⚖️ Advokatur-Partnerschaft – CHF 149.–/Mt.',
  }[plan] || plan);

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
            <Link href="/scanner" style={{ padding: '8px 16px', background: G.green, color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}><img src="/suche.png" alt="" width={14} height={14} /> Scannen</Link>
            <Link href="/checkout" style={{ padding: '8px 16px', border: `1px solid ${G.border}`, color: G.textSec, borderRadius: 10, fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}><img src="/diagramm.png" alt="" width={14} height={14} /> Upgrade</Link>
            {user?.email === ADMIN_EMAIL && (
              <Link href="/admin" style={{ padding: '8px 16px', background: '#f59e0b', color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}><img src="/energie.png" alt="" width={14} height={14} /> Admin</Link>
            )}
            <button
              onClick={async () => { await supabase.auth.signOut(); router.push('/auth'); }}
              style={{ padding: '8px 16px', border: `1px solid rgba(220,38,38,0.3)`, color: G.red, background: 'transparent', borderRadius: 10, fontSize: 13, cursor: 'pointer' }}
            >
              Abmelden
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 28 }}>
          {[
            { label: 'Policies', value: policies.length, icon: '/dokument.png' },
            { label: 'Letzter Scan', value: latestScan ? new Date().toLocaleDateString('de-CH') : '–', icon: '/suche.png' },
            { label: 'Plan', value: subscription ? getPlanLabel(subscription.plan) : 'FREE', icon: '/icon-zahlung.png' },
            { label: 'Aktives Abo', value: subscription?.plan ? 1 : 0, icon: '/icon-schutz.png' },
          ].map((stat) => (
            <div key={stat.label} style={{ ...card, textAlign: 'center', padding: 16 }}>
              <div style={{ marginBottom: 4 }}>
                {(stat.icon as string).startsWith('/')
                  ? ((stat.icon as string).endsWith('.svg')
                      ? <img src={stat.icon as string} alt={stat.label} width={22} height={22} style={{ display: 'inline-block' }} />
                      : <img src={stat.icon as string} alt={stat.label} width={22} height={22} style={{ display: 'inline-block' }} />)
                  : <span style={{ fontSize: 22 }}>{stat.icon}</span>}
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: G.green }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: G.textMuted, marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: `1px solid ${G.border}`, paddingBottom: 0, overflowX: 'auto' }}>
          {[
            { key: 'overview', icon: '/haus.png', label: 'Übersicht' },
            { key: 'policies', icon: '/dokument.png', label: 'Policies' },
            { key: 'billing', icon: '/icon-zahlung.png', label: 'Abrechnung' },
            { key: 'massnahmen', icon: '/ziel.png', label: 'Massnahmen' },
            { key: 'badge', icon: '/icon-schutz.png', label: 'Verified Badge' },
            { key: 'aitrust', icon: '/badge-ai-trust.svg', label: 'AI-Trust' },
            { key: 'aishield', icon: '/badge-ai-trust.svg', label: 'AI-Shield' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                padding: '10px 16px', border: 'none', background: activeTab === tab.key ? G.green : 'transparent',
                color: activeTab === tab.key ? '#fff' : G.textSec, borderRadius: '8px 8px 0 0',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}
            >
              {tab.icon.startsWith('/')
                ? (tab.icon.endsWith('.svg')
                    ? <img src={tab.icon} alt="" width={16} height={16} style={{ display: 'inline-block', opacity: activeTab === tab.key ? 1 : 0.7 }} />
                    : <img src={tab.icon} alt="" width={16} height={16} style={{ display: 'inline-block', opacity: activeTab === tab.key ? 1 : 0.7 }} />)
                : <span>{tab.icon}</span>}
              {tab.label}
            </button>
          ))}
          {/* Link zum Agentur-Dashboard (separate Route) */}
          <Link
            href="/dashboard/agency"
            style={{
              padding: '10px 16px', border: 'none', background: 'transparent',
              color: G.textSec, borderRadius: '8px 8px 0 0',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
              display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none',
              marginLeft: 'auto', flexShrink: 0,
            }}
          >
            <img src="/diagramm.png" alt="" width={16} height={16} style={{ display: 'inline-block', opacity: 0.7 }} />
            Agentur →
          </Link>
        </div>

        {/* Tab: Übersicht */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={card}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: G.text, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}><img src="/flug.png" alt="" width={18} height={18} /> Quick Actions</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                <Link href="/scanner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', background: G.green, color: '#fff', borderRadius: 10, textAlign: 'center', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}><img src="/suche.png" alt="" width={16} height={16} /> Website scannen</Link>
                <Link href="/datenschutz-generator" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', background: G.bgLight, color: G.text, border: `1px solid ${G.border}`, borderRadius: 10, textAlign: 'center', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}><img src="/dokument.png" alt="" width={16} height={16} /> Datenschutz erstellen</Link>
                <Link href="/impressum-generator" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', background: G.bgLight, color: G.text, border: `1px solid ${G.border}`, borderRadius: 10, textAlign: 'center', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}><img src="/dokument.png" alt="" width={16} height={16} /> Impressum erstellen</Link>
              </div>
            </div>
            {auditLog.length > 0 && (
              <div style={card}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: G.text, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}><img src="/zeit.png" alt="" width={18} height={18} /> Letzte Aktivität</h2>
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

        {/* Tab: Billing */}
        {activeTab === 'billing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={card}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: G.text, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><img src="/icon-zahlung.png" alt="Plan" width={18} height={18} style={{ display: 'inline-block' }} /> Aktueller Plan</h2>
              {subscription ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: 'Plan', value: getPlanLabel(subscription.plan), highlight: true },
                    { label: 'Status', value: subscription.status, color: getStatusColor(subscription.status) },
                    { label: 'Abrechnung', value: 'Jahresabo' },
                    ...(subscription.current_period_end ? [{ label: 'Nächste Verlängerung', value: new Date(subscription.current_period_end).toLocaleDateString('de-CH') }] : []),
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
                  <Link href="/checkout" style={{ padding: '10px 24px', background: G.green, color: '#fff', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Jetzt upgraden →</Link>
                </div>
              )}
            </div>

            {/* KI-Bilder-Kontingent Fortschrittsbalken */}
            {subscription && (
              (() => {
                const scanned = subscription.ai_images_scanned ?? 0;
                const limit = subscription.ai_images_limit ?? 50;
                const pct = limit > 0 ? Math.min(100, Math.round((scanned / limit) * 100)) : 0;
                const barColor = pct >= 90 ? G.red : pct >= 70 ? G.yellow : G.green;
                const resetDate = subscription.ai_images_reset_at
                  ? new Date(subscription.ai_images_reset_at).toLocaleDateString('de-CH')
                  : null;
                return (
                  <div style={card}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: G.text, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <img src="/ki-transparenz.png" alt="KI" width={18} height={18} style={{ display: 'inline-block' }} />
                      KI-Bilder Kontingent
                    </h2>
                    <p style={{ color: G.textMuted, fontSize: 13, marginBottom: 14 }}>
                      Anzahl KI-gescannter Bilder seit letzter Erneuerung
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: G.textSec }}>{scanned} / {limit} Bilder analysiert</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: barColor }}>{pct}%</span>
                    </div>
                    <div style={{ height: 10, background: G.bgLight, borderRadius: 99, overflow: 'hidden', border: `1px solid ${G.border}` }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: 99, transition: 'width 0.4s ease' }} />
                    </div>
                    {resetDate && (
                      <p style={{ fontSize: 12, color: G.textMuted, marginTop: 8, marginBottom: 0 }}>
                        Zurückgesetzt am {resetDate} · erneuert sich jährlich mit dem Abo
                      </p>
                    )}
                  </div>
                );
              })()
            )}

            {!subscription && (
              <div style={{ background: G.bgLight, border: `1px solid ${G.border}`, borderRadius: 12, padding: 28, textAlign: 'center' }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: G.text, marginBottom: 8 }}>Bereit für mehr?</h3>
                <p style={{ color: G.textSec, marginBottom: 20, fontSize: 14 }}>Starter ab CHF 19.–/Mt. – vollständige Compliance für Ihre Website.</p>
                <Link href="/checkout" style={{ padding: '12px 32px', background: G.green, color: '#fff', fontWeight: 700, borderRadius: 10, fontSize: 15, textDecoration: 'none' }}>Jetzt starten →</Link>
              </div>
            )}

            {/* Kündigung: Kontakt per E-Mail */}
            {subscription && (
              <div style={{ background: G.bgWhite, border: `1px solid ${G.border}`, borderRadius: 10, padding: '16px 20px', textAlign: 'center' }}>
                <p style={{ color: G.textMuted, fontSize: 13, margin: 0 }}>
                  Kündigung per E-Mail an{' '}
                  <a href="mailto:support@dataquard.ch" style={{ color: G.green, fontWeight: 600, textDecoration: 'none' }}>support@dataquard.ch</a>
                  {' '}· Das Abo läuft bis zum Ende der bezahlten Laufzeit.
                </p>
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
                <Link href="/scanner" style={{ padding: '10px 24px', background: G.green, color: '#fff', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <img src="/suche.png" alt="" width={16} height={16} /> Website scannen →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab: Verified Badge */}
        {activeTab === 'badge' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: G.greenBg, border: `1px solid ${G.greenBorder}`, borderRadius: 12, padding: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: G.green, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}><img src="/icon-schutz.png" alt="Badge" width={18} height={18} style={{ display: 'inline-block' }} /> Dataquard Verified Badge</h2>
              <p style={{ color: G.textSec, fontSize: 13 }}>
                Zeigen Sie Ihren Besuchern, dass Ihre Website auf DSGVO/nDSG-Compliance geprüft wurde.
                Betten Sie das Badge auf Ihrer Website ein – es verlinkt auf eine öffentliche Verifikationsseite.
              </p>
            </div>

            {subscription ? (
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
                    {badgeLoading ? '⏳ Erstelle...' : <><img src="/icon-schutz.png" alt="" width={14} height={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }} />Badge erstellen</>}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ ...card, textAlign: 'center', padding: 32 }}>
                <p style={{ color: G.textMuted, marginBottom: 16 }}>Verified Badge erfordert einen Starter- oder Professional-Plan.</p>
                <Link href="/checkout" style={{ padding: '10px 24px', background: G.green, color: '#fff', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Jetzt upgraden →</Link>
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
                      {/* Badge Vorschau */}
                      <div style={{ marginBottom: 16, padding: 16, background: G.bgLight, borderRadius: 10, border: `1px solid ${G.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                          src={`/api/badges/${badge.id}/image`}
                          alt="Dataquard Verified Badge"
                          style={{ maxWidth: 200, height: 'auto', display: 'block' }}
                        />
                      </div>

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
                            {`<a href="https://www.dataquard.ch/verify/${badge.id}" target="_blank" rel="noopener">`}<br />
                            {`  <img src="https://www.dataquard.ch/api/badges/${badge.id}/image" alt="Dataquard Verified" width="200" height="120" />`}<br />
                            {`</a>`}
                          </div>
                          <button onClick={() => copyEmbedCode(badge.id)}
                            style={{ marginTop: 8, padding: '6px 14px', background: G.bgLight, border: `1px solid ${G.border}`, borderRadius: 6, fontSize: 12, color: G.textSec, cursor: 'pointer' }}>
                            {badgeCopied ? '✅ Kopiert!' : '📋 Code kopieren'}
                          </button>
                        </div>
                    </div>
                  );
                })}
              </div>
            )}

            {badges.length === 0 && subscription && (
              <div style={{ textAlign: 'center', color: G.textMuted, padding: 32 }}>
                Noch kein Badge erstellt. Geben Sie Ihre Website-URL ein und klicken Sie auf &ldquo;Badge erstellen&rdquo;.
              </div>
            )}
          </div>
        )}

        {/* Tab: AI-Shield */}
        {activeTab === 'aishield' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Header */}
            <div style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 12, padding: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#8B5CF6', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                <img src="/badge-ai-trust.svg" alt="" width={20} height={20} style={{ display: 'inline-block' }} />
                AI-Shield: KI-Bilder Kennzeichnung
              </h2>
              <p style={{ color: G.textSec, fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                Binden Sie ein JavaScript-Snippet in Ihre Website ein. Es erkennt KI-generierte Bilder automatisch und blendet ein Kennzeichnungs-Badge ein, konform nach EU AI Act Art. 50.
              </p>
            </div>

            {/* KI-Bilder Liste */}
            <div style={card}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: G.text, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                <img src="/ki-transparenz.png" alt="" width={18} height={18} style={{ display: 'inline-block' }} />
                Erkannte KI-Bilder
                {aiImages.length > 0 && (
                  <span style={{ background: 'rgba(139,92,246,0.1)', color: '#8B5CF6', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
                    {aiImages.length}
                  </span>
                )}
              </h3>
              <p style={{ color: G.textMuted, fontSize: 13, marginBottom: 16 }}>
                Aus dem letzten Scan. Haken Sie ab, welche Bilder mit dem Badge gekennzeichnet werden sollen.
              </p>

              {aiImages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: G.textMuted }}>
                  <p style={{ marginBottom: 12, fontSize: 13 }}>Noch keine KI-Bilder erkannt. Führen Sie einen Website-Scan durch.</p>
                  <a href="/scanner" style={{ padding: '8px 20px', background: G.green, color: '#fff', borderRadius: 8, fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                    Website scannen →
                  </a>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {aiImages.map((img) => {
                    const pct = Math.round(img.ai_probability * 100);
                    const barColor = pct >= 80 ? '#dc2626' : pct >= 60 ? '#eab308' : '#8B5CF6';
                    return (
                      <div key={img.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: G.bgLight, borderRadius: 8, border: `1px solid ${G.border}`, flexWrap: 'wrap' }}>
                        {/* Thumbnail */}
                        <img
                          src={img.image_url}
                          alt="KI-Bild"
                          style={{ width: 80, height: 52, objectFit: 'cover', borderRadius: 6, flexShrink: 0, border: `1px solid ${G.border}` }}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        {/* URL + Score */}
                        <div style={{ flex: 1, minWidth: 120 }}>
                          <div style={{ fontSize: 12, color: G.textSec, wordBreak: 'break-all', marginBottom: 4, lineHeight: 1.4 }}>
                            {img.image_url.length > 60 ? '…' + img.image_url.slice(-57) : img.image_url}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1, maxWidth: 120, height: 6, background: G.border, borderRadius: 99, overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: 99 }} />
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: barColor }}>KI: {pct}%</span>
                          </div>
                        </div>
                        {/* Checkbox */}
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: subscription?.plan === 'professional' ? 'pointer' : 'not-allowed', opacity: subscription?.plan === 'professional' ? 1 : 0.5, flexShrink: 0 }}>
                          <input
                            type="checkbox"
                            checked={img.is_labeled}
                            disabled={subscription?.plan !== 'professional'}
                            onChange={(e) => toggleImageLabel(img.id, e.target.checked)}
                            style={{ width: 16, height: 16, accentColor: '#8B5CF6' }}
                          />
                          <span style={{ fontSize: 12, color: G.textSec }}>Kennzeichnen</span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Professional-only: Einstellungen + Snippet */}
            {subscription?.plan === 'professional' ? (
              <>
                {/* Toggle + Einstellungen */}
                <div style={card}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: G.text, marginBottom: 16 }}>Badge-Einstellungen</h3>

                  {/* Toggle */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${G.border}` }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: G.text }}>Kennzeichnung aktivieren</div>
                      <div style={{ fontSize: 12, color: G.textMuted, marginTop: 2 }}>Badge wird auf KI-Bildern auf Ihrer Website eingeblendet</div>
                    </div>
                    <button
                      onClick={async () => {
                        const newSettings = { ...shieldSettings, enabled: !shieldSettings.enabled };
                        setShieldSettings(newSettings);
                        await saveShieldSettings(newSettings);
                      }}
                      style={{ padding: '7px 18px', background: shieldSettings.enabled ? '#8B5CF6' : G.bgLight, color: shieldSettings.enabled ? '#fff' : G.textSec, border: `1px solid ${shieldSettings.enabled ? '#8B5CF6' : G.border}`, borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s' }}
                    >
                      {shieldSaving ? '⏳' : shieldSettings.enabled ? '✓ Aktiv' : 'Inaktiv'}
                    </button>
                  </div>

                  {/* Badge-Stil */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: G.textSec, marginBottom: 8 }}>Badge-Stil</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {([
                        { key: 'minimal', label: 'Minimal', desc: 'Nur "KI ✓"' },
                        { key: 'standard', label: 'Standard', desc: '"KI-generiert ✓"' },
                        { key: 'detailed', label: 'Ausführlich', desc: 'EU AI Act Art. 50' },
                      ] as const).map(opt => (
                        <button
                          key={opt.key}
                          onClick={async () => {
                            const newSettings = { ...shieldSettings, badge_style: opt.key };
                            setShieldSettings(newSettings);
                            await saveShieldSettings(newSettings);
                          }}
                          style={{ padding: '8px 14px', background: shieldSettings.badge_style === opt.key ? 'rgba(139,92,246,0.12)' : G.bgLight, border: `1px solid ${shieldSettings.badge_style === opt.key ? '#8B5CF6' : G.border}`, borderRadius: 8, cursor: 'pointer', textAlign: 'left' }}
                        >
                          <div style={{ fontSize: 12, fontWeight: 700, color: shieldSettings.badge_style === opt.key ? '#8B5CF6' : G.text }}>{opt.label}</div>
                          <div style={{ fontSize: 11, color: G.textMuted }}>{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Position */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: G.textSec, marginBottom: 8 }}>Position</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {([
                        { key: 'top-left', label: '↖ Oben links' },
                        { key: 'top-right', label: '↗ Oben rechts' },
                        { key: 'bottom-left', label: '↙ Unten links' },
                        { key: 'bottom-right', label: '↘ Unten rechts' },
                      ] as const).map(opt => (
                        <button
                          key={opt.key}
                          onClick={async () => {
                            const newSettings = { ...shieldSettings, badge_position: opt.key };
                            setShieldSettings(newSettings);
                            await saveShieldSettings(newSettings);
                          }}
                          style={{ padding: '7px 12px', background: shieldSettings.badge_position === opt.key ? 'rgba(139,92,246,0.12)' : G.bgLight, border: `1px solid ${shieldSettings.badge_position === opt.key ? '#8B5CF6' : G.border}`, borderRadius: 8, fontSize: 12, fontWeight: shieldSettings.badge_position === opt.key ? 700 : 400, color: shieldSettings.badge_position === opt.key ? '#8B5CF6' : G.textSec, cursor: 'pointer' }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Farbe */}
                  <div style={{ marginBottom: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: G.textSec, marginBottom: 8 }}>Badge-Farbe</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <input
                        type="color"
                        value={shieldSettings.badge_color}
                        onChange={(e) => setShieldSettings(prev => ({ ...prev, badge_color: e.target.value }))}
                        onBlur={async () => saveShieldSettings(shieldSettings)}
                        style={{ width: 40, height: 32, border: `1px solid ${G.border}`, borderRadius: 6, cursor: 'pointer', padding: 2 }}
                      />
                      <span style={{ fontSize: 13, fontFamily: 'monospace', color: G.textSec }}>{shieldSettings.badge_color}</span>
                      <button
                        onClick={async () => {
                          const newSettings = { ...shieldSettings, badge_color: '#8B5CF6' };
                          setShieldSettings(newSettings);
                          await saveShieldSettings(newSettings);
                        }}
                        style={{ padding: '4px 10px', background: G.bgLight, border: `1px solid ${G.border}`, borderRadius: 6, fontSize: 11, color: G.textMuted, cursor: 'pointer' }}
                      >
                        Standard
                      </button>
                    </div>
                  </div>
                </div>

                {/* Live-Vorschau */}
                {aiImages.length > 0 && (
                  <div style={card}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: G.text, marginBottom: 12 }}>Live-Vorschau</h3>
                    <div style={{ position: 'relative', display: 'inline-block', lineHeight: 0 }}>
                      <img
                        src={aiImages[0].image_url}
                        alt="Vorschau"
                        style={{ maxWidth: 320, maxHeight: 200, objectFit: 'cover', borderRadius: 8, border: `1px solid ${G.border}`, display: 'block' }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      {/* Badge-Overlay-Simulation */}
                      <div style={{
                        position: 'absolute',
                        ...(shieldSettings.badge_position === 'top-left' ? { top: 8, left: 8 } :
                          shieldSettings.badge_position === 'top-right' ? { top: 8, right: 8 } :
                          shieldSettings.badge_position === 'bottom-left' ? { bottom: 8, left: 8 } :
                          { bottom: 8, right: 8 }),
                        background: shieldSettings.badge_color,
                        color: '#fff',
                        padding: shieldSettings.badge_style === 'detailed' ? '5px 8px' : '3px 8px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontFamily: 'Arial, sans-serif',
                        opacity: 0.92,
                        maxWidth: shieldSettings.badge_style === 'detailed' ? 180 : undefined,
                        lineHeight: 1.3,
                        pointerEvents: 'none',
                      }}>
                        {shieldSettings.badge_style === 'minimal' ? 'KI ✓' :
                         shieldSettings.badge_style === 'standard' ? 'KI-generiert ✓' :
                         'KI-generiert, geprüft nach EU AI Act Art. 50'}
                      </div>
                    </div>
                  </div>
                )}

                {/* JS-Snippet */}
                <div style={card}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: G.text, marginBottom: 8 }}>JS-Snippet für Ihre Website</h3>
                  <p style={{ fontSize: 13, color: G.textMuted, marginBottom: 14 }}>
                    Fügen Sie diesen Code einmalig in den <code style={{ background: G.bgLight, padding: '1px 5px', borderRadius: 4 }}>&lt;head&gt;</code> oder vor <code style={{ background: G.bgLight, padding: '1px 5px', borderRadius: 4 }}>&lt;/body&gt;</code> Ihrer Website ein:
                  </p>
                  <div style={{ background: '#111827', borderRadius: 8, padding: '12px 14px', fontFamily: 'monospace', fontSize: 12, color: '#22c55e', position: 'relative', lineHeight: 1.7 }}>
                    <button
                      onClick={() => user && copyShieldSnippet(user.id)}
                      style={{ position: 'absolute', top: 10, right: 10, background: 'transparent', border: '1px solid #374151', borderRadius: 6, color: snippetCopied ? '#22c55e' : '#9ca3af', fontSize: 11, padding: '3px 10px', cursor: 'pointer' }}
                    >
                      {snippetCopied ? '✅ Kopiert!' : '📋 Kopieren'}
                    </button>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', paddingRight: 80 }}>
                      {`<!-- Dataquard AI-Trust Shield -->\n<script src="https://www.dataquard.ch/api/shield/${user?.id}.js" defer></script>`}
                    </pre>
                  </div>
                  <p style={{ fontSize: 11, color: G.textMuted, marginTop: 10, marginBottom: 0 }}>
                    Das Script lädt asynchron und blockiert Ihre Website nicht. Badge-Einstellungen werden stündlich aktualisiert.
                  </p>
                </div>
              </>
            ) : (
              /* Starter: read-only mit Upsell */
              <div style={{ border: '1px solid rgba(139,92,246,0.25)', borderRadius: 12, padding: 28, background: 'rgba(139,92,246,0.04)', textAlign: 'center' }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: G.text, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <img src="/badge-ai-trust.svg" alt="" width={20} height={20} style={{ display: 'inline-block' }} />
                  Kennzeichnung aktivieren
                </p>
                <p style={{ fontSize: 13, color: G.textSec, marginBottom: 20, lineHeight: 1.6 }}>
                  Die automatische KI-Kennzeichnung auf Ihrer Website (JS-Overlay, Badge-Einstellungen, EU AI Act Art. 50) ist exklusiv für den Professional-Plan.
                </p>
                <a
                  href="/checkout?plan=professional"
                  style={{ display: 'inline-block', background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', color: '#fff', padding: '12px 28px', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}
                >
                  Upgrade auf Professional →
                </a>
              </div>
            )}
          </div>
        )}

        {/* Tab: AI-Trust */}
        {activeTab === 'aitrust' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {(subscription?.plan === 'starter' || subscription?.plan === 'professional') ? (
              <>
                {/* Status-Anzeige */}
                <div style={{ background: '#0F1B2D', borderRadius: 12, padding: 20, display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                  <img src="/badge-ai-trust.svg" alt="AI-Trust Badge" style={{ width: 64, height: 'auto', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <p style={{ color: '#22c55e', fontWeight: 700, fontSize: 15, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}><img src="/icon-verifiziert.png" alt="Aktiv" width={18} height={18} style={{ display: 'inline-block' }} /> AI-Trust aktiv</p>
                    <p style={{ color: '#9ca3af', fontSize: 13, marginBottom: 3 }}>Nächster Scan: automatisch · 250 Bilder</p>
                    <p style={{ color: '#9ca3af', fontSize: 13, marginBottom: 3 }}>
                      Gültig bis: {subscription.ai_trust_expires_at
                        ? new Date(subscription.ai_trust_expires_at).toLocaleDateString('de-CH')
                        : '–'}
                    </p>
                    {subscription.ai_trust_stripe_subscription_id && (
                      <p style={{ color: '#4b5563', fontSize: 11, fontFamily: 'monospace', marginBottom: 3 }}>
                        Abo-ID: {subscription.ai_trust_stripe_subscription_id}
                      </p>
                    )}
                    <Link
                      href="/scanner"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10, color: '#22c55e', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
                    >
                      <img src="/suche.png" alt="" width={14} height={14} /> Neuen KI-Scan starten →
                    </Link>
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
                      onClick={async () => {
                        const code = `<!-- Dataquard AI-Trust Badge -->\n<a href="https://www.dataquard.ch" target="_blank" rel="noopener" style="display:inline-block;">\n  <img src="https://www.dataquard.ch/badge-ai-trust-banner.svg" alt="AI-Compliance verifiziert durch Dataquard" width="200" height="70" />\n</a>`;
                        try {
                          await navigator.clipboard.writeText(code);
                        } catch {
                          // Fallback für Browser ohne Clipboard API
                          const el = document.createElement('textarea');
                          el.value = code;
                          el.style.position = 'fixed';
                          el.style.opacity = '0';
                          document.body.appendChild(el);
                          el.select();
                          document.execCommand('copy');
                          document.body.removeChild(el);
                        }
                        setAiTrustCopied(true);
                        setTimeout(() => setAiTrustCopied(false), 2000);
                      }}
                      style={{ position: 'absolute', top: 10, right: 10, background: 'transparent', border: '1px solid #374151', borderRadius: 6, color: aiTrustCopied ? '#22c55e' : '#9ca3af', fontSize: 11, padding: '3px 10px', cursor: 'pointer', transition: 'color 0.15s' }}
                    >
                      {aiTrustCopied ? '✅ Kopiert!' : '📋 Kopieren'}
                    </button>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', paddingRight: 80 }}>{`<!-- Dataquard AI-Trust Badge -->
<a href="https://www.dataquard.ch" target="_blank" rel="noopener" style="display:inline-block;">
  <img src="https://www.dataquard.ch/badge-ai-trust-banner.svg" alt="AI-Compliance verifiziert durch Dataquard" width="200" height="70" />
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
              <div style={{ border: '1px solid rgba(139,92,246,0.3)', borderRadius: 12, padding: 28, background: 'rgba(139,92,246,0.04)' }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}><img src="/badge-ai-trust.svg" alt="AI-Trust" width={20} height={20} style={{ display: 'inline-block' }} /> AI-Trust aktivieren</p>
                <p style={{ fontSize: 13, color: '#555566', marginBottom: 6, lineHeight: 1.6 }}>
                  Laufende KI-Bildüberwachung (250 Bilder/Monat), Deepfake-Erkennung,<br/>
                  EU AI Act Art. 50 Konformität, Shield-Badge + E-Mail-Alerts.
                </p>
                <p style={{ fontSize: 12, color: '#888899', marginBottom: 18 }}>Jahres-Abo · Keine Einrichtungsgebühr · Kündbar</p>
                <Link
                  href="/checkout?plan=professional"
                  style={{ display: 'inline-block', background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', color: '#fff', padding: '12px 28px', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}
                >
                  Jetzt für CHF 99/Jahr aktivieren →
                </Link>
              </div>
            )}
          </div>
        )}

      </div>
    </PageWrapper>
  );
}
