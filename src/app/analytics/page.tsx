// src/app/analytics/page.task.tsx
// ÄNDERUNG: Indigo/Purple Dark-Theme → PageWrapper + Light Theme
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { PageWrapper } from '../components/PageWrapper';

const G = {
  green: '#22c55e',
  greenBg: 'rgba(34,197,94,0.08)',
  border: '#e2e4ea',
  text: '#1a1a2e',
  textSec: '#555566',
  textMuted: '#888899',
  bgWhite: '#ffffff',
  bgLight: '#f1f2f6',
};

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [scansTotal, setScansTotal] = useState(0);
  const [remindersTotal, setRemindersTotal] = useState(0);
  const [remindersSent, setRemindersSent] = useState(0);
  const [remindersConverted, setRemindersConverted] = useState(0);
  const [batchJobsTotal, setBatchJobsTotal] = useState(0);
  const [batchJobsCompleted, setBatchJobsCompleted] = useState(0);
  const [lawAlertsTotal, setLawAlertsTotal] = useState(0);
  const [recentReminders, setRecentReminders] = useState<any[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        window.location.href = '/auth';
        return;
      }
      await loadData(session.user.id);
      setLoading(false);
    };
    checkAuth();
  }, []);

  const loadData = async (userId: string) => {
    const { count: scans } = await supabase
      .from('scans').select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    setScansTotal(scans || 0);

    const { data: reminders } = await supabase
      .from('reminders').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10);
    if (reminders) {
      setRemindersTotal(reminders.length);
      setRemindersSent(reminders.filter(r => r.status === 'sent').length);
      setRemindersConverted(reminders.filter(r => r.status === 'converted').length);
      setRecentReminders(reminders.slice(0, 5));
    }

    const { data: jobs } = await supabase.from('batch_jobs').select('*').eq('user_id', userId);
    if (jobs) {
      setBatchJobsTotal(jobs.length);
      setBatchJobsCompleted(jobs.filter(j => j.status === 'completed').length);
    }

    const { count: alerts } = await supabase.from('law_alerts').select('*', { count: 'exact', head: true });
    setLawAlertsTotal(alerts || 0);
  };

  const getStatusColor = (status: string) => ({
    sent: '#22c55e',
    pending: '#eab308',
    converted: '#3b82f6',
    unsubscribed: '#dc2626',
  }[status] || G.textMuted);

  if (loading) {
    return (
      <PageWrapper>
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 40, height: 40, border: `4px solid ${G.green}`, borderTop: '4px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </PageWrapper>
    );
  }

  const conversionRate = remindersTotal > 0 ? ((remindersConverted / remindersTotal) * 100).toFixed(1) : '0';
  const completionRate = batchJobsTotal > 0 ? ((batchJobsCompleted / batchJobsTotal) * 100).toFixed(0) : '0';

  return (
    <PageWrapper>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: G.text, marginBottom: 4 }}>📊 Analytics</h1>
            <p style={{ color: G.textMuted, fontSize: 13 }}>Echtzeit-Daten aus Supabase</p>
          </div>
          <Link href="/dashboard" style={{ color: G.green, fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>← Dashboard</Link>
        </div>

        {/* KPI Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }}>
          {[
            { label: 'Scans Total', value: scansTotal, icon: '🔍' },
            { label: 'Reminders', value: remindersTotal, icon: '📧' },
            { label: 'Policy Jobs', value: batchJobsTotal, icon: '⚙️' },
            { label: 'Gesetzes-Alerts', value: lawAlertsTotal, icon: '⚖️' },
          ].map((kpi) => (
            <div key={kpi.label} style={{ background: G.bgWhite, border: `1px solid ${G.border}`, borderRadius: 12, padding: '20px 16px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{kpi.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: G.green }}>{kpi.value}</div>
              <div style={{ color: G.textMuted, fontSize: 12, marginTop: 4 }}>{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Performance Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 24 }}>
          <div style={{ background: G.bgWhite, border: `1px solid ${G.border}`, borderRadius: 12, padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: G.text, marginBottom: 16 }}>📧 Retargeting Performance</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Versendet', value: remindersSent, color: '#22c55e' },
                { label: 'Konvertiert', value: remindersConverted, color: '#3b82f6' },
                { label: 'Pending', value: remindersTotal - remindersSent, color: '#eab308' },
              ].map((item) => (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ color: G.textSec }}>{item.label}</span>
                    <span style={{ fontWeight: 700, color: G.text }}>{item.value}</span>
                  </div>
                  <div style={{ width: '100%', background: G.bgLight, borderRadius: 4, height: 6 }}>
                    <div style={{ background: item.color, height: 6, borderRadius: 4, width: `${remindersTotal > 0 ? (item.value / remindersTotal) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
              <div style={{ paddingTop: 8, borderTop: `1px solid ${G.border}`, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: G.textMuted }}>Conversion Rate</span>
                <span style={{ color: G.green, fontWeight: 700 }}>{conversionRate}%</span>
              </div>
            </div>
          </div>

          <div style={{ background: G.bgWhite, border: `1px solid ${G.border}`, borderRadius: 12, padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: G.text, marginBottom: 16 }}>⚙️ Policy Generation</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Abgeschlossen', value: batchJobsCompleted, color: '#22c55e' },
                { label: 'Ausstehend', value: batchJobsTotal - batchJobsCompleted, color: '#eab308' },
              ].map((item) => (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ color: G.textSec }}>{item.label}</span>
                    <span style={{ fontWeight: 700, color: G.text }}>{item.value}</span>
                  </div>
                  <div style={{ width: '100%', background: G.bgLight, borderRadius: 4, height: 6 }}>
                    <div style={{ background: item.color, height: 6, borderRadius: 4, width: `${batchJobsTotal > 0 ? (item.value / batchJobsTotal) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
              <div style={{ paddingTop: 8, borderTop: `1px solid ${G.border}`, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: G.textMuted }}>Erfolgsrate</span>
                <span style={{ color: G.green, fontWeight: 700 }}>{completionRate}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Letzte Reminders */}
        <div style={{ background: G.bgWhite, border: `1px solid ${G.border}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${G.border}` }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: G.text }}>📋 Letzte Reminders</h2>
          </div>
          {recentReminders.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: G.textMuted, fontSize: 13 }}>Noch keine Reminders vorhanden.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${G.border}` }}>
                    <th style={{ textAlign: 'left', padding: '10px 16px', color: G.textMuted, fontWeight: 600 }}>E-Mail</th>
                    <th style={{ textAlign: 'left', padding: '10px 16px', color: G.textMuted, fontWeight: 600 }}>Domain</th>
                    <th style={{ textAlign: 'left', padding: '10px 16px', color: G.textMuted, fontWeight: 600 }}>Status</th>
                    <th style={{ textAlign: 'left', padding: '10px 16px', color: G.textMuted, fontWeight: 600 }}>Datum</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReminders.map((r) => (
                    <tr key={r.id} style={{ borderBottom: `1px solid ${G.border}` }}>
                      <td style={{ padding: '10px 16px', color: G.textSec }}>{r.email}</td>
                      <td style={{ padding: '10px 16px', color: G.textSec }}>{r.domain}</td>
                      <td style={{ padding: '10px 16px', fontWeight: 700, color: getStatusColor(r.status) }}>{r.status}</td>
                      <td style={{ padding: '10px 16px', color: G.textMuted }}>{new Date(r.created_at).toLocaleDateString('de-CH')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </PageWrapper>
  );
}
