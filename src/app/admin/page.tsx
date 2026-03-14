'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const ADMIN_EMAIL = 'richard.rickli69@gmail.com';

interface Customer {
  id: string;
  email: string;
  subscription_tier: string;
  created_at: string;
}

interface AdminStats {
  totalCustomers: number;
  totalPaidCustomers: number;
  totalScans: number;
  totalPolicies: number;
  planBreakdown: Record<string, number>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('all');

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user || session.user.email !== ADMIN_EMAIL) {
        router.push('/dashboard');
        return;
      }
      setAuthorized(true);
      await loadAdminData();
      setLoading(false);
    };
    init();
  }, []);

  const loadAdminData = async () => {
    const { data: usersData } = await supabase
      .from('users')
      .select('id, email, subscription_tier, created_at')
      .order('created_at', { ascending: false });

    if (usersData) {
      setCustomers(usersData);

      const planBreakdown: Record<string, number> = {};
      let paidCount = 0;
      usersData.forEach((u: Customer) => {
        const tier = u.subscription_tier || 'free';
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

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch = !searchTerm ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan === 'all' ||
      (c.subscription_tier || 'free') === filterPlan;
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
            <button onClick={loadAdminData} style={{ padding: '8px 16px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>↻ Aktualisieren</button>
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
                    <td style={{ padding: '12px 16px' }}>{getPlanBadge(customer.subscription_tier || 'free')}</td>
                    <td style={{ padding: '12px 16px', color: '#888899' }}>{new Date(customer.created_at).toLocaleDateString('de-CH')}</td>
                    <td style={{ padding: '12px 16px', color: '#cccccc', fontFamily: 'monospace', fontSize: 11 }}>{customer.id.slice(0, 8)}...</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
