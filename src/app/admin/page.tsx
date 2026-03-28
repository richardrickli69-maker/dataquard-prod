'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'richard.rickli69@gmail.com';

interface RefundResult {
  success?: boolean;
  error?: string;
  refund_id?: string;
  status?: string;
  amount?: number;
  customer_email?: string;
}

interface Customer {
  id: string;
  email: string;
  plan: string;
  created_at: string;
}

interface AdminStats {
  totalCustomers: number;
  totalPaidCustomers: number;
  totalScans: number;
  totalPolicies: number;
  planBreakdown: Record<string, number>;
}

interface RecentScan {
  id: string;
  created_at: string;
  url: string;
  jurisdiction: string;
  ampel: string;
  user_id: string | null;
  user_email: string | null;
}

interface UserActivity {
  id: string;
  email: string;
  plan: string;
  created_at: string;
  last_scan: string | null;
  scan_count: number;
}

interface BehaviorData {
  scans7d: number;
  scans30d: number;
  newUsers30d: number;
  recentScans: RecentScan[];
  userActivity: UserActivity[];
}

// Relatives Datum (z.B. "vor 2 Std.", "gestern", "vor 3 Tagen")
function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 1) return 'gerade eben';
  if (diffMin < 60) return `vor ${diffMin} Min.`;
  if (diffH < 24) return `vor ${diffH} Std.`;
  if (diffD === 1) return 'gestern';
  if (diffD < 30) return `vor ${diffD} Tagen`;
  return date.toLocaleDateString('de-CH');
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [refundPaymentId, setRefundPaymentId] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundResult, setRefundResult] = useState<RefundResult | null>(null);
  const [behaviorData, setBehaviorData] = useState<BehaviorData | null>(null);
  const [activitySearch, setActivitySearch] = useState('');

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user || session.user.email !== ADMIN_EMAIL) {
        router.push('/dashboard');
        return;
      }
      setAuthorized(true);
      await Promise.all([loadAdminData(), loadBehaviorData(session.access_token)]);
      setLoading(false);
    };
    init();
  }, []);

  const loadAdminData = async () => {
    const { data: usersData } = await supabase
      .from('users')
      .select('id, email, plan, created_at')
      .order('created_at', { ascending: false });

    if (usersData) {
      setCustomers(usersData);

      const planBreakdown: Record<string, number> = {};
      let paidCount = 0;
      usersData.forEach((u: Customer) => {
        const tier = u.plan || 'free';
        planBreakdown[tier] = (planBreakdown[tier] || 0) + 1;
        if (tier !== 'free' && tier !== null) paidCount++;
      });

      const { count: scanCount } = await supabase
        .from('scans')
        .select('*', { count: 'exact', head: true });

      const { count: policyCount } = await supabase
        .from('policies')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalCustomers: usersData.length,
        totalPaidCustomers: paidCount,
        totalScans: scanCount || 0,
        totalPolicies: policyCount || 0,
        planBreakdown,
      });
    }
  };

  // Kundenverhalten-Daten via API-Route laden (Service Role, umgeht RLS)
  const loadBehaviorData = async (token: string) => {
    try {
      const res = await fetch('/api/admin/behavior', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data: BehaviorData = await res.json();
        setBehaviorData(data);
      }
    } catch {
      // Fehler still ignorieren – Admin-Dashboard lädt trotzdem
    }
  };

  const handleRefund = async () => {
    if (!refundPaymentId.trim()) return;
    if (!window.confirm(`Wirklich erstatten?\nPayment Intent: ${refundPaymentId}\nDies kann nicht rückgängig gemacht werden.`)) return;
    setRefundLoading(true);
    setRefundResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_intent_id: refundPaymentId.trim(),
          reason: refundReason.trim() || 'Geld-zurück-Garantie (14 Tage)',
          admin_email: session?.user?.email,
        }),
      });
      const data: RefundResult = await res.json();
      setRefundResult(data);
      if (data.success) {
        setRefundPaymentId('');
        setRefundReason('');
      }
    } catch {
      setRefundResult({ error: 'Verbindungsfehler' });
    } finally {
      setRefundLoading(false);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch = !searchTerm ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan === 'all' ||
      (c.plan || 'free') === filterPlan;
    return matchesSearch && matchesPlan;
  });

  const getPlanBadge = (plan: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      free:         { bg: 'rgba(136,136,153,0.08)', text: '#888899', border: 'rgba(136,136,153,0.2)' },
      starter:      { bg: 'rgba(34,197,94,0.08)',   text: '#22c55e', border: 'rgba(34,197,94,0.25)' },
      professional: { bg: 'rgba(59,130,246,0.08)',   text: '#3b82f6', border: 'rgba(59,130,246,0.25)' },
      enterprise:   { bg: 'rgba(249,115,22,0.08)',   text: '#f97316', border: 'rgba(249,115,22,0.25)' },
      impressum:    { bg: 'rgba(168,85,247,0.08)',   text: '#a855f7', border: 'rgba(168,85,247,0.25)' },
    };
    const c = colors[plan] || colors.free;
    return (
      <span style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}`, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
        {plan || 'free'}
      </span>
    );
  };

  if (loading || !authorized) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f9fb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 44, height: 44, border: '4px solid #e2e4ea', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fb', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e4ea', padding: '16px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: 8 }}>
              ⚡ Admin Dashboard
              <span style={{ background: '#f59e0b', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 12, letterSpacing: 1 }}>ADMIN</span>
            </h1>
            <p style={{ fontSize: 12, color: '#888899', marginTop: 2 }}>Dataquard Kundenübersicht</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/dashboard" style={{ padding: '8px 16px', border: '1px solid #e2e4ea', color: '#555566', borderRadius: 8, fontSize: 13, textDecoration: 'none' }}>← Dashboard</Link>
            <button onClick={async () => {
              const { data: { session } } = await supabase.auth.getSession();
              await Promise.all([loadAdminData(), session?.access_token ? loadBehaviorData(session.access_token) : Promise.resolve()]);
            }} style={{ padding: '8px 16px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>↻ Aktualisieren</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px' }}>

        {/* Stats */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }}>
            {[
              { label: 'Kunden gesamt', value: stats.totalCustomers, icon: '👥', color: '#22c55e' },
              { label: 'Zahlende Kunden', value: stats.totalPaidCustomers, icon: '💳', color: '#3b82f6' },
              { label: 'Scans total', value: stats.totalScans, icon: '🔍', color: '#f59e0b' },
              { label: 'Policies erstellt', value: stats.totalPolicies, icon: '📄', color: '#8b5cf6' },
            ].map((s) => (
              <div key={s.label} style={{ background: '#ffffff', border: '1px solid #e2e4ea', borderRadius: 12, padding: 20, borderLeft: `4px solid ${s.color}` }}>
                <div style={{ fontSize: 11, color: '#888899', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{s.icon} {s.label}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Plan-Verteilung */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginBottom: 28 }}>
            {Object.entries(stats.planBreakdown).sort((a, b) => b[1] - a[1]).map(([plan, count]) => (
              <div key={plan}
                onClick={() => setFilterPlan(filterPlan === plan ? 'all' : plan)}
                style={{ background: '#ffffff', border: '1px solid #e2e4ea', borderRadius: 10, padding: '14px 16px', textAlign: 'center', cursor: 'pointer', outline: filterPlan === plan ? '2px solid #22c55e' : 'none' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e' }}>{count}</div>
                <div style={{ marginTop: 4 }}>{getPlanBadge(plan)}</div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Links */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
          <Link href="/dashboard/analytics" style={{ padding: '10px 20px', background: '#22c55e', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>📊 Analytics Detail</Link>
          <Link href="/dashboard/accounting" style={{ padding: '10px 20px', background: '#3b82f6', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>💰 Accounting Detail</Link>
        </div>

        {/* Rückerstattung */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e4ea', borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            💶 Rückerstattung (14 Tage Garantie)
          </h2>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
            <input
              type="text"
              value={refundPaymentId}
              onChange={(e) => setRefundPaymentId(e.target.value)}
              placeholder="Stripe Payment Intent ID (pi_...)"
              style={{ flex: 1, minWidth: 260, background: '#f8f9fb', border: '1px solid #e2e4ea', borderRadius: 8, padding: '9px 14px', fontSize: 13, color: '#1a1a2e', outline: 'none', fontFamily: 'monospace' }}
            />
            <input
              type="text"
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="Grund (optional)"
              style={{ width: 200, background: '#f8f9fb', border: '1px solid #e2e4ea', borderRadius: 8, padding: '9px 14px', fontSize: 13, color: '#1a1a2e', outline: 'none' }}
            />
            <button
              onClick={handleRefund}
              disabled={refundLoading || !refundPaymentId.trim()}
              style={{ padding: '9px 20px', background: refundLoading ? '#e2e4ea' : '#ef4444', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: refundLoading ? 'default' : 'pointer' }}
            >
              {refundLoading ? '…' : 'Erstatten'}
            </button>
          </div>
          {refundResult && (
            <div style={{ padding: '10px 14px', borderRadius: 8, fontSize: 13, background: refundResult.success ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${refundResult.success ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`, color: refundResult.success ? '#166534' : '#991b1b' }}>
              {refundResult.success
                ? `✅ Erstattet: CHF ${refundResult.amount} · Refund ID: ${refundResult.refund_id} · Status: ${refundResult.status}${refundResult.customer_email ? ` · ${refundResult.customer_email}` : ''}`
                : `❌ Fehler: ${refundResult.error}`}
            </div>
          )}
        </div>

        {/* Kundenliste */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e4ea', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e4ea', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>👥 Kundenliste ({filteredCustomers.length})</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="E-Mail suchen..."
                style={{ background: '#f8f9fb', border: '1px solid #e2e4ea', borderRadius: 8, padding: '8px 14px', fontSize: 13, color: '#1a1a2e', outline: 'none', width: 220 }}
              />
              <select value={filterPlan} onChange={(e) => setFilterPlan(e.target.value)}
                style={{ background: '#f8f9fb', border: '1px solid #e2e4ea', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#1a1a2e', outline: 'none' }}>
                <option value="all">Alle Pläne</option>
                <option value="free">Free</option>
                <option value="starter">Starter</option>
                <option value="professional">Professional</option>
                <option value="enterprise">Enterprise</option>
                <option value="impressum">Impressum</option>
              </select>
            </div>
          </div>

          {filteredCustomers.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#888899' }}>Keine Kunden gefunden.</div>
          ) : (
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e4ea' }}>
                  {['E-Mail', 'Plan', 'Registriert', 'ID'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: '#888899', fontWeight: 600, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} style={{ borderBottom: '1px solid #f1f2f6' }}>
                    <td style={{ padding: '12px 16px', color: '#1a1a2e', fontWeight: 500 }}>{customer.email}</td>
                    <td style={{ padding: '12px 16px' }}>{getPlanBadge(customer.plan || 'free')}</td>
                    <td style={{ padding: '12px 16px', color: '#888899' }}>{new Date(customer.created_at).toLocaleDateString('de-CH')}</td>
                    <td style={{ padding: '12px 16px', color: '#cccccc', fontFamily: 'monospace', fontSize: 11 }}>{customer.id.slice(0, 8)}...</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ═══ ABSCHNITT 1: Aktivitäts-Übersicht letzte 30 Tage ═══ */}
        {behaviorData && (
          <div style={{ marginTop: 28 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', marginBottom: 14 }}>
              📈 Aktivitäts-Übersicht
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
              {[
                { label: 'Scans (7 Tage)', value: behaviorData.scans7d, color: '#22c55e', icon: '🔍' },
                { label: 'Scans (30 Tage)', value: behaviorData.scans30d, color: '#3b82f6', icon: '📊' },
                { label: 'Neue User (30 Tage)', value: behaviorData.newUsers30d, color: '#8b5cf6', icon: '👤' },
                {
                  label: 'Conversion-Rate',
                  value: stats && stats.totalCustomers > 0
                    ? `${((stats.totalPaidCustomers / stats.totalCustomers) * 100).toFixed(1)}%`
                    : '–',
                  color: '#f59e0b',
                  icon: '💰',
                },
              ].map((s) => (
                <div key={s.label} style={{ background: '#ffffff', border: '1px solid #e2e4ea', borderRadius: 12, padding: 20, borderLeft: `4px solid ${s.color}` }}>
                  <div style={{ fontSize: 11, color: '#888899', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{s.icon} {s.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ ABSCHNITT 2: Letzte Scans (Live-Feed) ═══ */}
        {behaviorData && behaviorData.recentScans.length > 0 && (
          <div style={{ marginTop: 28 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', marginBottom: 14 }}>
              🔄 Letzte Scans (Live-Feed)
            </h2>
            <div style={{ background: '#ffffff', border: '1px solid #e2e4ea', borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e4ea', background: '#f8f9fb' }}>
                    {['Datum', 'User', 'Gescannte URL', 'Jurisdiction', 'Ampel'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 14px', color: '#888899', fontWeight: 600, fontSize: 11, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {behaviorData.recentScans.map((scan, i) => {
                    // Jurisdiction-Badge Farbe
                    const jColors: Record<string, { bg: string; text: string }> = {
                      nDSG:  { bg: 'rgba(34,197,94,0.08)',  text: '#16a34a' },
                      DSGVO: { bg: 'rgba(234,179,8,0.08)',  text: '#ca8a04' },
                      BEIDES:{ bg: 'rgba(220,38,38,0.08)',  text: '#dc2626' },
                    };
                    const jc = jColors[scan.jurisdiction] ?? jColors.nDSG;
                    // Ampel-Farbe
                    const ampelColor = scan.ampel === 'grün' ? '#22c55e' : scan.ampel === 'gelb' ? '#eab308' : '#ef4444';
                    const ampelDot = scan.ampel === 'grün' ? '🟢' : scan.ampel === 'gelb' ? '🟡' : '🔴';
                    return (
                      <tr key={scan.id} style={{ borderBottom: '1px solid #f1f2f6', background: i % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                        <td style={{ padding: '10px 14px', color: '#888899', whiteSpace: 'nowrap', fontSize: 12 }}>{timeAgo(scan.created_at)}</td>
                        <td style={{ padding: '10px 14px', color: '#555566', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {scan.user_email ?? (scan.user_id ? `${scan.user_id.slice(0, 8)}…` : '–')}
                        </td>
                        <td style={{ padding: '10px 14px', color: '#1a1a2e', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <a href={scan.url} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none' }}>
                            {scan.url.replace(/^https?:\/\//, '').slice(0, 40)}{scan.url.length > 40 ? '…' : ''}
                          </a>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ background: jc.bg, color: jc.text, padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                            {scan.jurisdiction}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ color: ampelColor, fontWeight: 700, fontSize: 12 }}>{ampelDot} {scan.ampel}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ ABSCHNITT 3: Kunden-Aktivität ═══ */}
        {behaviorData && behaviorData.userActivity.length > 0 && (
          <div style={{ marginTop: 28, marginBottom: 40 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', marginBottom: 14 }}>
              👥 Kunden-Aktivität
            </h2>
            <div style={{ background: '#ffffff', border: '1px solid #e2e4ea', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e4ea', display: 'flex', alignItems: 'center', gap: 10 }}>
                <input
                  type="text"
                  value={activitySearch}
                  onChange={(e) => setActivitySearch(e.target.value)}
                  placeholder="E-Mail suchen..."
                  style={{ background: '#f8f9fb', border: '1px solid #e2e4ea', borderRadius: 8, padding: '7px 12px', fontSize: 13, color: '#1a1a2e', outline: 'none', width: 220 }}
                />
                <span style={{ fontSize: 12, color: '#888899' }}>
                  {behaviorData.userActivity.filter(u => !activitySearch || u.email.toLowerCase().includes(activitySearch.toLowerCase())).length} User
                </span>
              </div>
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e4ea', background: '#f8f9fb' }}>
                    {['E-Mail', 'Plan', 'Registriert', 'Letzter Scan', 'Scans', 'Status'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 14px', color: '#888899', fontWeight: 600, fontSize: 11, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {behaviorData.userActivity
                    .filter(u => !activitySearch || u.email.toLowerCase().includes(activitySearch.toLowerCase()))
                    .map((u, i) => {
                      // Aktivitäts-Status berechnen
                      const now = Date.now();
                      const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000;
                      const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
                      const lastScanMs = u.last_scan ? new Date(u.last_scan).getTime() : 0;

                      let statusLabel: string;
                      let statusColor: string;
                      let statusBg: string;
                      if (!u.last_scan || lastScanMs < ninetyDaysAgo) {
                        statusLabel = '🔴 Abgewandert';
                        statusColor = '#dc2626';
                        statusBg = 'rgba(220,38,38,0.08)';
                      } else if (lastScanMs < thirtyDaysAgo) {
                        statusLabel = '🟡 Inaktiv';
                        statusColor = '#ca8a04';
                        statusBg = 'rgba(234,179,8,0.08)';
                      } else {
                        statusLabel = '🟢 Aktiv';
                        statusColor = '#16a34a';
                        statusBg = 'rgba(34,197,94,0.08)';
                      }

                      return (
                        <tr key={u.id} style={{ borderBottom: '1px solid #f1f2f6', background: i % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                          <td style={{ padding: '10px 14px', color: '#1a1a2e', fontWeight: 500, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</td>
                          <td style={{ padding: '10px 14px' }}>{getPlanBadge(u.plan)}</td>
                          <td style={{ padding: '10px 14px', color: '#888899', whiteSpace: 'nowrap' }}>{new Date(u.created_at).toLocaleDateString('de-CH')}</td>
                          <td style={{ padding: '10px 14px', color: '#888899', whiteSpace: 'nowrap', fontSize: 12 }}>
                            {u.last_scan ? timeAgo(u.last_scan) : '–'}
                          </td>
                          <td style={{ padding: '10px 14px', fontWeight: 700, color: u.scan_count > 0 ? '#3b82f6' : '#cccccc', textAlign: 'center' }}>{u.scan_count}</td>
                          <td style={{ padding: '10px 14px' }}>
                            <span style={{ background: statusBg, color: statusColor, padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                              {statusLabel}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
