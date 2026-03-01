// src/app/analytics/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
    // Scans
    const { count: scans } = await supabase
      .from('scans').select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    setScansTotal(scans || 0);

    // Reminders
    const { data: reminders } = await supabase
      .from('reminders').select('*').order('created_at', { ascending: false }).limit(10);
    if (reminders) {
      setRemindersTotal(reminders.length);
      setRemindersSent(reminders.filter(r => r.status === 'sent').length);
      setRemindersConverted(reminders.filter(r => r.status === 'converted').length);
      setRecentReminders(reminders.slice(0, 5));
    }

    // Batch Jobs
    const { data: jobs } = await supabase
      .from('batch_jobs').select('*').eq('user_id', userId);
    if (jobs) {
      setBatchJobsTotal(jobs.length);
      setBatchJobsCompleted(jobs.filter(j => j.status === 'completed').length);
    }

    // Law Alerts
    const { count: alerts } = await supabase
      .from('law_alerts').select('*', { count: 'exact', head: true });
    setLawAlertsTotal(alerts || 0);
  };

  const getStatusColor = (status: string) => ({
    sent: 'text-green-400',
    pending: 'text-yellow-400',
    converted: 'text-indigo-400',
    unsubscribed: 'text-red-400',
  }[status] || 'text-gray-400');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const conversionRate = remindersTotal > 0 ? ((remindersConverted / remindersTotal) * 100).toFixed(1) : '0';
  const completionRate = batchJobsTotal > 0 ? ((batchJobsCompleted / batchJobsTotal) * 100).toFixed(0) : '0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-1">📊 Analytics</h1>
            <p className="text-gray-400">Echtzeit-Daten aus Supabase</p>
          </div>
          <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300">← Dashboard</Link>
        </div>

        {/* KPI Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Scans Total', value: scansTotal, icon: '🔍', color: 'text-indigo-300' },
            { label: 'Reminders', value: remindersTotal, icon: '📧', color: 'text-blue-300' },
            { label: 'Policy Jobs', value: batchJobsTotal, icon: '⚙️', color: 'text-purple-300' },
            { label: 'Gesetzes-Alerts', value: lawAlertsTotal, icon: '⚖️', color: 'text-yellow-300' },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-indigo-900 bg-opacity-30 border border-indigo-700 p-5 rounded-lg text-center">
              <div className="text-3xl mb-2">{kpi.icon}</div>
              <div className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</div>
              <div className="text-gray-400 text-sm mt-1">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Retargeting Performance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-indigo-900 bg-opacity-30 border border-indigo-700 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">📧 Retargeting Performance</h2>
            <div className="space-y-4">
              {[
                { label: 'Versendet', value: remindersSent, total: remindersTotal, color: 'bg-green-500' },
                { label: 'Konvertiert', value: remindersConverted, total: remindersTotal, color: 'bg-indigo-500' },
                { label: 'Pending', value: remindersTotal - remindersSent, total: remindersTotal, color: 'bg-yellow-500' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{item.label}</span>
                    <span className="text-white font-bold">{item.value}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className={`${item.color} h-2 rounded-full`}
                      style={{ width: `${remindersTotal > 0 ? (item.value / remindersTotal) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-indigo-700 flex justify-between">
                <span className="text-gray-400 text-sm">Conversion Rate</span>
                <span className="text-indigo-300 font-bold">{conversionRate}%</span>
              </div>
            </div>
          </div>

          <div className="bg-indigo-900 bg-opacity-30 border border-indigo-700 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">⚙️ Policy Generation</h2>
            <div className="space-y-4">
              {[
                { label: 'Abgeschlossen', value: batchJobsCompleted, color: 'bg-green-500' },
                { label: 'Ausstehend', value: batchJobsTotal - batchJobsCompleted, color: 'bg-yellow-500' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{item.label}</span>
                    <span className="text-white font-bold">{item.value}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className={`${item.color} h-2 rounded-full`}
                      style={{ width: `${batchJobsTotal > 0 ? (item.value / batchJobsTotal) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-indigo-700 flex justify-between">
                <span className="text-gray-400 text-sm">Erfolgsrate</span>
                <span className="text-green-300 font-bold">{completionRate}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Letzte Reminders */}
        <div className="bg-indigo-900 bg-opacity-30 border border-indigo-700 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-indigo-700">
            <h2 className="text-xl font-bold">📋 Letzte Reminders</h2>
          </div>
          {recentReminders.length === 0 ? (
            <div className="p-8 text-center text-gray-400">Noch keine Reminders vorhanden.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-indigo-700">
                <tr>
                  <th className="text-left py-3 px-4 text-gray-400">E-Mail</th>
                  <th className="text-left py-3 px-4 text-gray-400">Domain</th>
                  <th className="text-left py-3 px-4 text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400">Datum</th>
                </tr>
              </thead>
              <tbody>
                {recentReminders.map((r) => (
                  <tr key={r.id} className="border-b border-indigo-900 hover:bg-indigo-900 hover:bg-opacity-30">
                    <td className="py-3 px-4 text-gray-300">{r.email}</td>
                    <td className="py-3 px-4 text-gray-300">{r.domain}</td>
                    <td className={`py-3 px-4 font-bold ${getStatusColor(r.status)}`}>{r.status}</td>
                    <td className="py-3 px-4 text-gray-400">{new Date(r.created_at).toLocaleDateString('de-CH')}</td>
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