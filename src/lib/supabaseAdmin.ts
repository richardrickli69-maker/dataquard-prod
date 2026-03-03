/**
 * Dataquard – Supabase Admin Client
 * Server-seitig ONLY – niemals im Client/Browser verwenden!
 * Verwendet SUPABASE_SERVICE_ROLE_KEY (umgeht Row Level Security)
 *
 * .env.local ergänzen:
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ...  ← Supabase Dashboard → Settings → API → service_role
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    'Missing SUPABASE_SERVICE_ROLE_KEY in .env.local\n' +
    'Supabase Dashboard → Settings → API → service_role secret'
  );
}

// Admin-Client: umgeht RLS – NUR server-seitig verwenden!
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ---------------------------------------------------------------------------
// TYPEN
// ---------------------------------------------------------------------------

export interface ScanRow {
  id: string;
  user_id: string;
  url: string;
  domain: string;
  jurisdiction: string;
  ampel: string;
  confidence: number;
  reasons: string[];
  created_at: string;
}

export interface PolicyRow {
  id: string;
  user_id: string;
  scan_id: string;
  jurisdiction: string;
  content: string;
  format: string;
  created_at: string;
}

export interface AnalyticsData {
  // Kennzahlen
  totalScans: number;
  totalPolicies: number;
  uniqueUsers: number;
  conversionRate: string;       // Prozent: Scans → Policy
  // Charts
  scansPerDay: Record<string, number>;   // "2026-03-01": 12
  topDomains: [string, number][];        // [["example.ch", 5], ...]
  jurisdictionCount: Record<string, number>;
  ampelCount: { gruen: number; gelb: number; rot: number };
  // Letzte Scans
  recentScans: ScanRow[];
}

// ---------------------------------------------------------------------------
// QUERIES
// ---------------------------------------------------------------------------

export async function getAllScans(): Promise<ScanRow[]> {
  const { data, error } = await supabaseAdmin
    .from('scans')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(`getAllScans: ${error.message}`);
  return data ?? [];
}

export async function getAllPolicies(): Promise<PolicyRow[]> {
  const { data, error } = await supabaseAdmin
    .from('policies')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(`getAllPolicies: ${error.message}`);
  return data ?? [];
}

// ---------------------------------------------------------------------------
// ANALYTICS AGGREGATION
// ---------------------------------------------------------------------------

export async function getAnalyticsData(): Promise<AnalyticsData> {
  const [scans, policies] = await Promise.all([
    getAllScans(),
    getAllPolicies(),
  ]);

  // Scans pro Tag (letzte 30 Tage)
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);

  const scansPerDay: Record<string, number> = {};
  scans
    .filter(s => new Date(s.created_at) >= cutoff)
    .forEach(s => {
      const day = s.created_at.slice(0, 10);
      scansPerDay[day] = (scansPerDay[day] ?? 0) + 1;
    });

  // Top 10 Domains
  const domainCount: Record<string, number> = {};
  scans.forEach(s => {
    domainCount[s.domain] = (domainCount[s.domain] ?? 0) + 1;
  });
  const topDomains = Object.entries(domainCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10) as [string, number][];

  // Jurisdiktions-Verteilung
  const jurisdictionCount: Record<string, number> = {};
  scans.forEach(s => {
    jurisdictionCount[s.jurisdiction] =
      (jurisdictionCount[s.jurisdiction] ?? 0) + 1;
  });

  // Ampel-Verteilung
  const ampelCount = { gruen: 0, gelb: 0, rot: 0 };
  scans.forEach(s => {
    const key = s.ampel as keyof typeof ampelCount;
    if (key in ampelCount) ampelCount[key]++;
  });

  // Unique User
  const uniqueUsers = new Set(scans.map(s => s.user_id)).size;

  // Conversion: Scans die eine Policy generiert haben
  const scansWithPolicy = new Set(policies.map(p => p.scan_id)).size;
  const conversionRate = scans.length > 0
    ? ((scansWithPolicy / scans.length) * 100).toFixed(1)
    : '0.0';

  return {
    totalScans:      scans.length,
    totalPolicies:   policies.length,
    uniqueUsers,
    conversionRate,
    scansPerDay,
    topDomains,
    jurisdictionCount,
    ampelCount,
    recentScans:     scans.slice(0, 20),
  };
}