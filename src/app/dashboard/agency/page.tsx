// src/app/dashboard/agency/page.tsx
// Agency-Dashboard: Multi-Domain-Verwaltung, Bulk-Scan, White-Label, Document Pack
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { PageWrapper } from '../../components/PageWrapper';

const G = {
  green: '#22c55e',
  greenBg: 'rgba(34,197,94,0.08)',
  greenBorder: 'rgba(34,197,94,0.25)',
  navy: '#1a1a2e',
  bg: '#f8f9fb',
  bgWhite: '#ffffff',
  bgLight: '#f1f2f6',
  border: '#e2e4ea',
  text: '#1a1a2e',
  textSec: '#555566',
  textMuted: '#888899',
  red: '#dc2626',
  yellow: '#eab308',
};

// ── Typen ──────────────────────────────────────────────────────────────────

interface AgencyAccount {
  id: string;
  plan: 'agency_basic' | 'agency_pro' | 'agency_enterprise';
  max_domains: number;
  white_label_enabled: boolean;
  custom_logo_url: string | null;
  custom_color: string | null;
  scan_frequency: 'monthly' | 'weekly';
  status: 'active' | 'cancelled' | 'past_due';
}

interface AgencyDomain {
  id: string;
  domain: string;
  status: 'pending' | 'scanned' | 'error';
  last_scan_at: string | null;
  compliance_score: number | null;
  performance_score: number | null;
  security_score: number | null;
  ai_trust_score: number | null;
  ai_images_found: number;
  ai_images_labeled: number;
  trackers_found: number;
  document_pack_enabled: boolean;
  added_at: string;
}

// ── Hilfsfunktionen ────────────────────────────────────────────────────────

function ampelColor(score: number | null): string {
  if (score === null) return G.textMuted;
  if (score >= 70) return G.green;
  if (score >= 50) return G.yellow;
  return G.red;
}

function ampelBg(score: number | null): string {
  if (score === null) return G.bgLight;
  if (score >= 70) return 'rgba(34,197,94,0.1)';
  if (score >= 50) return 'rgba(234,179,8,0.1)';
  return 'rgba(220,38,38,0.1)';
}

function scoreLabel(score: number | null): string {
  if (score === null) return '–';
  return `${score}`;
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Nie';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH   = Math.floor(diffMs / 3600000);
  const diffD   = Math.floor(diffMs / 86400000);
  if (diffMin < 1)  return 'Gerade eben';
  if (diffMin < 60) return `vor ${diffMin} Min.`;
  if (diffH < 24)   return `vor ${diffH} Std.`;
  if (diffD === 1)  return 'Gestern';
  if (diffD < 30)   return `vor ${diffD} Tagen`;
  return new Date(dateStr).toLocaleDateString('de-CH');
}

function planLabel(plan: string): string {
  if (plan === 'agency_basic')      return 'Agency Basic';
  if (plan === 'agency_pro')        return 'Agency Pro';
  if (plan === 'agency_enterprise') return 'Agency Enterprise';
  return plan;
}

// ── Komponente ─────────────────────────────────────────────────────────────

export default function AgencyDashboardPage() {
  const router = useRouter();

  const [loading, setLoading]             = useState(true);
  const [agency, setAgency]               = useState<AgencyAccount | null>(null);
  const [domains, setDomains]             = useState<AgencyDomain[]>([]);
  const [error, setError]                 = useState<string | null>(null);

  // Domain hinzufügen
  const [newDomain, setNewDomain]         = useState('');
  const [addLoading, setAddLoading]       = useState(false);
  const [addError, setAddError]           = useState<string | null>(null);

  // CSV-Upload
  const csvRef                            = useRef<HTMLInputElement>(null);
  const [csvLoading, setCsvLoading]       = useState(false);

  // Selektion + Löschen
  const [selected, setSelected]           = useState<Set<string>>(new Set());
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Bulk-Scan
  const [scanning, setScanning]           = useState(false);
  const [scanProgress, setScanProgress]   = useState('');
  const [scanResult, setScanResult]       = useState<string | null>(null);

  // Filter + Suche
  const [filter, setFilter]               = useState<'all' | 'ok' | 'issues' | 'pending'>('all');
  const [search, setSearch]               = useState('');

  // White-Label Einstellungen (Tab)
  const [activeTab, setActiveTab]         = useState<'domains' | 'branding'>('domains');
  const [brandColor, setBrandColor]       = useState('#22c55e');
  const [brandLogoUrl, setBrandLogoUrl]   = useState('');
  const [brandSaving, setBrandSaving]     = useState(false);
  const [brandSaved, setBrandSaved]       = useState(false);

  // ── Auth + Daten laden ───────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/auth');
        return;
      }
      await loadData();
    };
    init();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch('/api/agency/domains', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.status === 404) {
        // Kein Agency-Account — Upsell zeigen
        setAgency(null);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        const json = await res.json() as { error?: string };
        throw new Error(json.error ?? 'Fehler beim Laden');
      }

      const json = await res.json() as { agency: AgencyAccount; domains: AgencyDomain[] };
      setAgency(json.agency);
      setDomains(json.domains ?? []);

      // White-Label Felder initialisieren
      if (json.agency.custom_color)   setBrandColor(json.agency.custom_color);
      if (json.agency.custom_logo_url) setBrandLogoUrl(json.agency.custom_logo_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  }

  // ── Domain einzeln hinzufügen ────────────────────────────────────────────
  async function handleAddDomain(e: React.FormEvent) {
    e.preventDefault();
    if (!newDomain.trim()) return;
    setAddLoading(true);
    setAddError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/agency/domains', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token ?? ''}`,
        },
        body: JSON.stringify({ domain: newDomain.trim() }),
      });
      const json = await res.json() as { error?: string; limitReached?: boolean };
      if (!res.ok) {
        setAddError(json.error ?? 'Fehler beim Hinzufügen');
        return;
      }
      setNewDomain('');
      await loadData();
    } catch {
      setAddError('Netzwerkfehler');
    } finally {
      setAddLoading(false);
    }
  }

  // ── CSV-Upload ───────────────────────────────────────────────────────────
  async function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvLoading(true);
    setAddError(null);
    try {
      const text = await file.text();
      // Eine Domain pro Zeile, Komma-getrennt und Semikolon-getrennt auch akzeptieren
      const domains = text
        .split(/[\r\n,;]+/)
        .map(d => d.trim())
        .filter(d => d.length > 0);

      if (domains.length === 0) {
        setAddError('CSV enthält keine gültigen Domains');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/agency/domains', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token ?? ''}`,
        },
        body: JSON.stringify({ domains }),
      });
      const json = await res.json() as { error?: string; added?: number; skipped?: number; invalid?: string[] };
      if (!res.ok) {
        setAddError(json.error ?? 'Fehler beim CSV-Import');
        return;
      }
      await loadData();
      setAddError(`${json.added ?? 0} Domains hinzugefügt${(json.skipped ?? 0) > 0 ? `, ${json.skipped} bereits vorhanden` : ''}`);
    } catch {
      setAddError('Fehler beim Lesen der CSV-Datei');
    } finally {
      setCsvLoading(false);
      if (csvRef.current) csvRef.current.value = '';
    }
  }

  // ── Domains löschen ──────────────────────────────────────────────────────
  async function handleDelete() {
    if (selected.size === 0) return;
    setDeleteLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/agency/domains', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token ?? ''}`,
        },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });
      if (res.ok) {
        setSelected(new Set());
        setDeleteConfirm(false);
        await loadData();
      }
    } catch {
      console.error('Löschen fehlgeschlagen');
    } finally {
      setDeleteLoading(false);
    }
  }

  // ── Bulk-Scan: sequenziell, mit Live-Fortschritt pro Domain ─────────────
  async function handleBulkScanAll() {
    // Nur Domains scannen die noch ausstehen oder deren letzter Scan älter als 24h ist
    const MS_24H = 24 * 60 * 60 * 1000;
    const toScan = domains.filter(d =>
      d.status === 'pending' ||
      d.last_scan_at === null ||
      Date.now() - new Date(d.last_scan_at).getTime() > MS_24H
    );

    if (toScan.length === 0) {
      setScanResult('Alle Domains wurden in den letzten 24 Stunden bereits gescannt.');
      return;
    }

    setScanning(true);
    setScanResult(null);
    setScanProgress(`Bereite ${toScan.length} Scans vor…`);

    let successCount = 0;
    let errorCount   = 0;

    try {
      const { data: { session } } = await supabase.auth.getSession();

      for (let i = 0; i < toScan.length; i++) {
        const d = toScan[i];
        setScanProgress(`Scanne Domain ${i + 1} von ${toScan.length}: ${d.domain}`);

        try {
          const res = await fetch('/api/agency/scan', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session?.access_token ?? ''}`,
            },
            body: JSON.stringify({ domainIds: [d.id] }),
          });
          if (res.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch {
          errorCount++;
        }

        // Tabelle nach jeder Domain aktualisieren
        await loadData();
      }

      const errInfo = errorCount > 0 ? `, ${errorCount} Fehler` : '';
      setScanResult(`${successCount} von ${toScan.length} Domains erfolgreich gescannt${errInfo}.`);
    } catch {
      setScanResult('Scan fehlgeschlagen — bitte erneut versuchen');
    } finally {
      setScanning(false);
      setScanProgress('');
    }
  }

  // ── Einzel-Domain scannen (direkt, ohne 24h-Filter) ─────────────────────
  async function handleScanSingle(domainId: string, domainName: string) {
    setScanning(true);
    setScanResult(null);
    setScanProgress(`Scanne ${domainName}…`);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/agency/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token ?? ''}`,
        },
        body: JSON.stringify({ domainIds: [domainId] }),
      });
      if (res.ok) {
        setScanResult(`${domainName} erfolgreich gescannt.`);
      } else {
        setScanResult(`Scan fehlgeschlagen für ${domainName}.`);
      }
      await loadData();
    } catch {
      setScanResult(`Scan fehlgeschlagen — bitte erneut versuchen`);
    } finally {
      setScanning(false);
      setScanProgress('');
    }
  }

  // ── Document Pack Toggle ─────────────────────────────────────────────────
  async function handleDocPackToggle(domainId: string, current: boolean) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch('/api/agency/domains', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token ?? ''}`,
        },
        body: JSON.stringify({ domainId, document_pack_enabled: !current }),
      });
      setDomains(prev => prev.map(d =>
        d.id === domainId ? { ...d, document_pack_enabled: !current } : d
      ));
    } catch {
      console.error('Doc Pack Toggle fehlgeschlagen');
    }
  }

  // ── White-Label speichern ────────────────────────────────────────────────
  async function handleBrandSave() {
    setBrandSaving(true);
    setBrandSaved(false);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const body: Record<string, unknown> = { custom_color: brandColor };
      if (brandLogoUrl.trim()) body.custom_logo_url = brandLogoUrl.trim();
      body.white_label_enabled = true;

      const res = await fetch('/api/agency/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token ?? ''}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setBrandSaved(true);
        await loadData();
        setTimeout(() => setBrandSaved(false), 3000);
      } else {
        const json = await res.json() as { error?: string };
        setError(json.error ?? 'Fehler beim Speichern');
      }
    } catch {
      setError('Netzwerkfehler');
    } finally {
      setBrandSaving(false);
    }
  }

  // ── Gefilterte Domains ───────────────────────────────────────────────────
  const filteredDomains = domains.filter(d => {
    const matchSearch = search === '' || d.domain.toLowerCase().includes(search.toLowerCase());
    const score = d.compliance_score;
    const matchFilter =
      filter === 'all'     ? true :
      filter === 'ok'      ? (score !== null && score >= 70) :
      filter === 'issues'  ? (score !== null && score < 70) :
      filter === 'pending' ? (d.status === 'pending') :
      true;
    return matchSearch && matchFilter;
  });

  // ── Quick-Stats ──────────────────────────────────────────────────────────
  const statsOk      = domains.filter(d => d.compliance_score !== null && d.compliance_score >= 70).length;
  const statsIssues  = domains.filter(d => d.compliance_score !== null && d.compliance_score < 70).length;
  const statsPending = domains.filter(d => d.status === 'pending').length;
  const docPackCount = domains.filter(d => d.document_pack_enabled).length;

  // ── Render ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <PageWrapper>
        <div style={{ padding: '80px 24px', textAlign: 'center', color: G.textMuted }}>
          Laden…
        </div>
      </PageWrapper>
    );
  }

  // Kein Agency-Account → Upsell
  if (!agency) {
    return (
      <PageWrapper>
        <div style={{ maxWidth: '640px', margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
          <img src="/diagramm.png" alt="" width={64} height={64} style={{ marginBottom: '24px' }} />
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: G.text, margin: '0 0 12px' }}>
            Agency-Dashboard
          </h1>
          <p style={{ fontSize: '16px', color: G.textSec, marginBottom: '32px', lineHeight: 1.6 }}>
            Das Agency-Dashboard ist für Agentur-Kunden verfügbar.
            Verwalten Sie mehrere Kunden-Websites zentral, mit Bulk-Scan, White-Label-Reports und Document Pack.
          </p>
          <a href="mailto:info@dataquard.ch?subject=Agency Anfrage" style={{
            display: 'inline-block',
            background: G.green,
            color: '#fff',
            fontWeight: 700,
            fontSize: '15px',
            padding: '13px 28px',
            borderRadius: '12px',
            textDecoration: 'none',
          }}>
            Agency-Plan anfragen →
          </a>
          <div style={{ marginTop: '16px' }}>
            <Link href="/dashboard" style={{ fontSize: '14px', color: G.textMuted, textDecoration: 'none' }}>
              ← Zurück zum Dashboard
            </Link>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const canWhiteLabel = agency.plan === 'agency_pro' || agency.plan === 'agency_enterprise';

  return (
    <PageWrapper>
      <style>{`
        @media (max-width: 860px) {
          .ag-header-row { flex-direction: column !important; align-items: flex-start !important; }
          .ag-stats-grid { grid-template-columns: 1fr 1fr !important; }
          .ag-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .ag-table-wrap table { min-width: 820px; }
          .ag-toolbar { flex-wrap: wrap !important; }
        }
      `}</style>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>

        {/* ── Breadcrumb ── */}
        <div style={{ marginBottom: '20px', fontSize: '13px', color: G.textMuted }}>
          <Link href="/dashboard" style={{ color: G.textMuted, textDecoration: 'none' }}>Dashboard</Link>
          {' / '}
          <span style={{ color: G.text }}>Agentur</span>
        </div>

        {/* ── Header ── */}
        <div className="ag-header-row" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: G.text, margin: '0 0 6px' }}>
              Agentur-Dashboard
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{
                background: G.greenBg,
                border: `1px solid ${G.greenBorder}`,
                borderRadius: '20px',
                padding: '3px 12px',
                fontSize: '12px',
                fontWeight: 700,
                color: G.green,
              }}>
                {planLabel(agency.plan)}
              </span>
              <span style={{ fontSize: '13px', color: G.textSec }}>
                {domains.length} / {agency.max_domains === 9999 ? '∞' : agency.max_domains} Domains
              </span>
              {agency.status !== 'active' && (
                <span style={{ fontSize: '12px', color: G.red, fontWeight: 600 }}>
                  Abo inaktiv
                </span>
              )}
            </div>
          </div>

          {/* Bulk-Scan Button */}
          <button
            onClick={() => handleBulkScanAll()}
            disabled={scanning || domains.length === 0}
            style={{
              background: scanning ? G.bgLight : G.green,
              color: scanning ? G.textMuted : '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '11px 22px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: scanning ? 'not-allowed' : 'pointer',
              flexShrink: 0,
              minWidth: '180px',
              textAlign: 'center',
            }}
          >
            {scanning ? (scanProgress || 'Scannt…') : `Alle Domains scannen`}
          </button>
        </div>

        {/* Scan-Ergebnis Banner */}
        {scanResult && (
          <div style={{
            background: G.greenBg,
            border: `1px solid ${G.greenBorder}`,
            borderRadius: '10px',
            padding: '10px 16px',
            marginBottom: '20px',
            fontSize: '14px',
            color: G.text,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <img src="/checkmark.png" alt="" width={16} height={16} />
            {scanResult}
          </div>
        )}

        {/* Fehler-Banner */}
        {error && (
          <div style={{
            background: 'rgba(220,38,38,0.06)',
            border: '1px solid rgba(220,38,38,0.2)',
            borderRadius: '10px',
            padding: '10px 16px',
            marginBottom: '20px',
            fontSize: '14px',
            color: G.red,
          }}>
            {error}
          </div>
        )}

        {/* ── Domain-Nutzungs-Bar ── */}
        <div style={{ background: G.bgWhite, border: `1px solid ${G.border}`, borderRadius: '14px', padding: '20px 24px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
            <span style={{ fontWeight: 600, color: G.text }}>Domain-Nutzung</span>
            <span style={{ color: G.textMuted }}>{domains.length} / {agency.max_domains === 9999 ? '∞' : agency.max_domains}</span>
          </div>
          {agency.max_domains !== 9999 && (
            <div style={{ height: '8px', background: G.bgLight, borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.min(100, (domains.length / agency.max_domains) * 100)}%`,
                background: domains.length >= agency.max_domains ? G.red : G.green,
                borderRadius: '4px',
                transition: 'width 0.3s',
              }} />
            </div>
          )}
        </div>

        {/* ── Quick-Stats ── */}
        <div className="ag-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
          {[
            { label: 'Domains OK', value: statsOk, color: G.green, icon: '/checkmark.png' },
            { label: 'Mit Problemen', value: statsIssues, color: G.red, icon: '/fehler.png' },
            { label: 'Ausstehend', value: statsPending, color: G.yellow, icon: '/warnung.png' },
            { label: 'Doc Pack aktiv', value: docPackCount, color: G.green, icon: '/dokument.png' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: G.bgWhite,
              border: `1px solid ${G.border}`,
              borderRadius: '12px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <img src={stat.icon} alt="" width={28} height={28} />
              <div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: '12px', color: G.textMuted }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: `1px solid ${G.border}` }}>
          {[
            { id: 'domains' as const, label: 'Domains' },
            { id: 'branding' as const, label: 'Branding / White-Label' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 18px',
                fontSize: '14px',
                fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? G.green : G.textMuted,
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? `2px solid ${G.green}` : '2px solid transparent',
                cursor: 'pointer',
                marginBottom: '-1px',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            TAB: DOMAINS
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'domains' && (
          <>
            {/* Domain hinzufügen */}
            <div style={{
              background: G.bgWhite,
              border: `1px solid ${G.border}`,
              borderRadius: '14px',
              padding: '20px 24px',
              marginBottom: '20px',
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: G.text, margin: '0 0 14px' }}>
                Domain hinzufügen
              </h3>
              <form onSubmit={handleAddDomain} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={newDomain}
                  onChange={e => setNewDomain(e.target.value)}
                  placeholder="example.ch"
                  style={{
                    flex: 1,
                    minWidth: '200px',
                    padding: '10px 14px',
                    border: `1px solid ${G.border}`,
                    borderRadius: '10px',
                    fontSize: '14px',
                    color: G.text,
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  disabled={addLoading || !newDomain.trim()}
                  style={{
                    background: G.green,
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px 20px',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: addLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {addLoading ? 'Wird hinzugefügt…' : 'Hinzufügen'}
                </button>
                <button
                  type="button"
                  onClick={() => csvRef.current?.click()}
                  disabled={csvLoading}
                  style={{
                    background: G.bgLight,
                    color: G.textSec,
                    border: `1px solid ${G.border}`,
                    borderRadius: '10px',
                    padding: '10px 16px',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: csvLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {csvLoading ? 'CSV lädt…' : 'CSV hochladen'}
                </button>
                <input
                  ref={csvRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleCsvUpload}
                  style={{ display: 'none' }}
                />
              </form>
              {addError && (
                <p style={{
                  marginTop: '8px',
                  fontSize: '13px',
                  color: addError.includes('hinzugefügt') ? G.green : G.red,
                }}>
                  {addError}
                </p>
              )}
            </div>

            {/* Toolbar: Suche + Filter + Löschen */}
            <div className="ag-toolbar" style={{ display: 'flex', gap: '10px', marginBottom: '14px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Domain suchen…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: '160px',
                  maxWidth: '280px',
                  padding: '8px 12px',
                  border: `1px solid ${G.border}`,
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: G.text,
                  outline: 'none',
                }}
              />

              {/* Filter-Buttons */}
              {(['all', 'ok', 'issues', 'pending'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '7px 14px',
                    fontSize: '12px',
                    fontWeight: 600,
                    borderRadius: '8px',
                    border: `1px solid ${filter === f ? G.green : G.border}`,
                    background: filter === f ? G.greenBg : G.bgWhite,
                    color: filter === f ? G.green : G.textMuted,
                    cursor: 'pointer',
                  }}
                >
                  {f === 'all' ? 'Alle' : f === 'ok' ? 'OK' : f === 'issues' ? 'Probleme' : 'Ausstehend'}
                </button>
              ))}

              {/* Ausgewählte löschen */}
              {selected.size > 0 && (
                <button
                  onClick={() => setDeleteConfirm(true)}
                  style={{
                    marginLeft: 'auto',
                    padding: '7px 14px',
                    fontSize: '12px',
                    fontWeight: 700,
                    borderRadius: '8px',
                    border: `1px solid rgba(220,38,38,0.3)`,
                    background: 'rgba(220,38,38,0.06)',
                    color: G.red,
                    cursor: 'pointer',
                  }}
                >
                  {selected.size} löschen
                </button>
              )}
            </div>

            {/* Bestätigungs-Dialog */}
            {deleteConfirm && (
              <div style={{
                background: 'rgba(220,38,38,0.06)',
                border: `1px solid rgba(220,38,38,0.25)`,
                borderRadius: '12px',
                padding: '16px 20px',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                flexWrap: 'wrap',
              }}>
                <span style={{ fontSize: '14px', color: G.text }}>
                  {selected.size} Domain(s) wirklich entfernen?
                </span>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  style={{
                    background: G.red,
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '7px 16px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: deleteLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {deleteLoading ? 'Löschen…' : 'Ja, löschen'}
                </button>
                <button
                  onClick={() => setDeleteConfirm(false)}
                  style={{
                    background: G.bgLight,
                    color: G.textSec,
                    border: `1px solid ${G.border}`,
                    borderRadius: '8px',
                    padding: '7px 14px',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Abbrechen
                </button>
              </div>
            )}

            {/* ── Domain-Tabelle ── */}
            {filteredDomains.length === 0 ? (
              <div style={{
                background: G.bgWhite,
                border: `1px solid ${G.border}`,
                borderRadius: '14px',
                padding: '48px 24px',
                textAlign: 'center',
                color: G.textMuted,
              }}>
                <img src="/suche.png" alt="" width={48} height={48} style={{ marginBottom: '16px', opacity: 0.4 }} />
                <p style={{ margin: 0, fontSize: '15px' }}>
                  {domains.length === 0
                    ? 'Noch keine Domains. Fügen Sie oben Ihre erste Domain hinzu.'
                    : 'Keine Domains entsprechen den Filterkriterien.'}
                </p>
              </div>
            ) : (
              <div className="ag-table-wrap">
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  background: G.bgWhite,
                  border: `1px solid ${G.border}`,
                  borderRadius: '14px',
                  overflow: 'hidden',
                  fontSize: '13px',
                }}>
                  <thead>
                    <tr style={{ background: G.bgLight }}>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: G.textMuted, width: '36px' }}>
                        {/* Alle auswählen */}
                        <input
                          type="checkbox"
                          checked={selected.size === filteredDomains.length && filteredDomains.length > 0}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelected(new Set(filteredDomains.map(d => d.id)));
                            } else {
                              setSelected(new Set());
                            }
                          }}
                        />
                      </th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: G.textMuted }}>Domain</th>
                      <th style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 700, color: G.textMuted }}>Compliance</th>
                      <th style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 700, color: G.textMuted }}>Perf.</th>
                      <th style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 700, color: G.textMuted }}>Security</th>
                      <th style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 700, color: G.textMuted }}>AI-Trust</th>
                      <th style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 700, color: G.textMuted }}>KI-Bilder</th>
                      <th style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 700, color: G.textMuted }}>Tracker</th>
                      <th style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 700, color: G.textMuted }}>Doc Pack</th>
                      <th style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 700, color: G.textMuted }}>Letzter Scan</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: G.textMuted }}>Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDomains.map((d, i) => (
                      <tr
                        key={d.id}
                        style={{
                          background: i % 2 === 0 ? G.bgWhite : G.bg,
                          borderTop: `1px solid ${G.border}`,
                        }}
                      >
                        {/* Checkbox */}
                        <td style={{ padding: '10px 12px' }}>
                          <input
                            type="checkbox"
                            checked={selected.has(d.id)}
                            onChange={e => {
                              const next = new Set(selected);
                              if (e.target.checked) next.add(d.id);
                              else next.delete(d.id);
                              setSelected(next);
                            }}
                          />
                        </td>

                        {/* Domain */}
                        <td style={{ padding: '10px 12px', fontWeight: 600, color: G.text }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {d.status === 'error' && (
                              <img src="/fehler.png" alt="Fehler" width={12} height={12} style={{ flexShrink: 0 }} />
                            )}
                            {d.domain}
                          </div>
                        </td>

                        {/* Score-Zellen */}
                        {[d.compliance_score, d.performance_score, d.security_score, d.ai_trust_score].map((score, si) => (
                          <td key={si} style={{ padding: '8px', textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-block',
                              minWidth: '36px',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontWeight: 700,
                              fontSize: '12px',
                              background: ampelBg(score),
                              color: ampelColor(score),
                            }}>
                              {scoreLabel(score)}
                            </span>
                          </td>
                        ))}

                        {/* KI-Bilder */}
                        <td style={{ padding: '8px', textAlign: 'center', color: G.textSec }}>
                          {d.ai_images_found > 0 ? (
                            <span style={{ color: d.ai_images_found > d.ai_images_labeled ? G.yellow : G.green }}>
                              {d.ai_images_labeled}/{d.ai_images_found}
                            </span>
                          ) : '–'}
                        </td>

                        {/* Tracker */}
                        <td style={{ padding: '8px', textAlign: 'center', color: d.trackers_found > 0 ? G.yellow : G.textMuted }}>
                          {d.trackers_found > 0 ? d.trackers_found : '–'}
                        </td>

                        {/* Doc Pack Toggle */}
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          <button
                            onClick={() => handleDocPackToggle(d.id, d.document_pack_enabled)}
                            title={d.document_pack_enabled ? 'Doc Pack deaktivieren' : 'Doc Pack aktivieren'}
                            style={{
                              width: '36px',
                              height: '20px',
                              borderRadius: '10px',
                              background: d.document_pack_enabled ? G.green : G.bgLight,
                              border: `1px solid ${d.document_pack_enabled ? G.green : G.border}`,
                              cursor: 'pointer',
                              position: 'relative',
                              transition: 'background 0.2s',
                              padding: 0,
                            }}
                          >
                            <span style={{
                              display: 'block',
                              width: '14px',
                              height: '14px',
                              borderRadius: '50%',
                              background: '#fff',
                              position: 'absolute',
                              top: '2px',
                              left: d.document_pack_enabled ? '19px' : '2px',
                              transition: 'left 0.2s',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                            }} />
                          </button>
                        </td>

                        {/* Letzter Scan */}
                        <td style={{ padding: '8px', textAlign: 'center', fontSize: '12px', color: G.textMuted }}>
                          {timeAgo(d.last_scan_at)}
                        </td>

                        {/* Aktionen */}
                        <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            {/* Scannen */}
                            <button
                              onClick={() => handleScanSingle(d.id, d.domain)}
                              disabled={scanning}
                              title="Diese Domain scannen"
                              style={{
                                padding: '5px 10px',
                                fontSize: '11px',
                                fontWeight: 600,
                                borderRadius: '6px',
                                border: `1px solid ${G.border}`,
                                background: G.bgWhite,
                                color: G.textSec,
                                cursor: scanning ? 'not-allowed' : 'pointer',
                              }}
                            >
                              <img src="/suche.png" alt="Scan" width={12} height={12} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />
                              Scan
                            </button>

                            {/* PDF-Report */}
                            <a
                              href={`/api/agency/report/${d.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="PDF-Report herunterladen"
                              style={{
                                padding: '5px 10px',
                                fontSize: '11px',
                                fontWeight: 600,
                                borderRadius: '6px',
                                border: `1px solid ${G.greenBorder}`,
                                background: G.greenBg,
                                color: G.green,
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <img src="/dokument.png" alt="" width={12} height={12} />
                              PDF
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Doc Pack Zähler */}
            {docPackCount > 0 && (
              <div style={{
                marginTop: '14px',
                padding: '10px 16px',
                background: G.bgWhite,
                border: `1px solid ${G.border}`,
                borderRadius: '10px',
                fontSize: '13px',
                color: G.textSec,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <img src="/dokument.png" alt="" width={16} height={16} />
                Document Pack aktiv für <strong style={{ color: G.text }}>{docPackCount} Domain(s)</strong>
                {' '}— CHF {(docPackCount * 9).toFixed(2)}.– / Mt. zusätzlich
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB: BRANDING / WHITE-LABEL
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'branding' && (
          <div style={{
            background: G.bgWhite,
            border: `1px solid ${G.border}`,
            borderRadius: '14px',
            padding: '28px',
          }}>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: G.text, margin: '0 0 6px' }}>
              White-Label Branding
            </h3>
            <p style={{ fontSize: '13px', color: G.textMuted, margin: '0 0 24px' }}>
              Ihre PDF-Reports erscheinen mit Ihrem Logo und Ihrer Markenfarbe.
            </p>

            {!canWhiteLabel ? (
              /* Upsell für Agency Basic */
              <div style={{
                background: G.bgLight,
                borderRadius: '12px',
                padding: '28px',
                textAlign: 'center',
              }}>
                <img src="/icon-schutz.png" alt="" width={48} height={48} style={{ marginBottom: '16px', opacity: 0.6 }} />
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: G.text, margin: '0 0 8px' }}>
                  White-Label erfordert Agency Pro
                </h4>
                <p style={{ fontSize: '14px', color: G.textSec, margin: '0 0 20px' }}>
                  Mit Agency Pro (CHF 179.–/Mt.) erhalten Sie White-Label-Reports mit Ihrem Logo und Ihrer Farbe.
                </p>
                <a
                  href="mailto:info@dataquard.ch?subject=Upgrade auf Agency Pro"
                  style={{
                    display: 'inline-block',
                    background: G.green,
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '14px',
                    padding: '11px 24px',
                    borderRadius: '10px',
                    textDecoration: 'none',
                  }}
                >
                  Auf Agency Pro upgraden →
                </a>
              </div>
            ) : (
              /* White-Label Formular */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '480px' }}>
                {/* Agentur-Logo URL */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: G.text, marginBottom: '6px' }}>
                    Logo-URL (PNG oder JPG, max. 500 KB)
                  </label>
                  <input
                    type="url"
                    value={brandLogoUrl}
                    onChange={e => setBrandLogoUrl(e.target.value)}
                    placeholder="https://ihreagentur.ch/logo.png"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: `1px solid ${G.border}`,
                      borderRadius: '10px',
                      fontSize: '14px',
                      color: G.text,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <p style={{ fontSize: '12px', color: G.textMuted, margin: '4px 0 0' }}>
                    Das Logo muss öffentlich erreichbar sein (CDN-URL).
                  </p>
                </div>

                {/* Farbe */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: G.text, marginBottom: '6px' }}>
                    Primärfarbe (Hex)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="color"
                      value={brandColor}
                      onChange={e => setBrandColor(e.target.value)}
                      style={{ width: '48px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={brandColor}
                      onChange={e => {
                        if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) setBrandColor(e.target.value);
                      }}
                      style={{
                        width: '120px',
                        padding: '10px 12px',
                        border: `1px solid ${G.border}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontFamily: 'monospace',
                        color: G.text,
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Vorschau */}
                <div style={{
                  background: G.bgLight,
                  borderRadius: '10px',
                  padding: '16px',
                }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: G.textMuted, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Vorschau
                  </p>
                  <div style={{
                    background: G.bgWhite,
                    border: `1px solid ${G.border}`,
                    borderRadius: '8px',
                    overflow: 'hidden',
                  }}>
                    <div style={{ height: '4px', background: brandColor }} />
                    <div style={{ padding: '12px 16px', fontSize: '12px', color: G.textMuted }}>
                      {brandLogoUrl ? (
                        <img src={brandLogoUrl} alt="Logo" style={{ height: '32px', maxWidth: '120px', objectFit: 'contain' }} />
                      ) : (
                        <span style={{ fontWeight: 700, color: brandColor, fontSize: '14px' }}>Ihre Agentur</span>
                      )}
                    </div>
                    <div style={{ padding: '8px 16px 12px', fontSize: '11px', color: G.textMuted }}>
                      <strong style={{ color: brandColor }}>COMPLIANCE REPORT</strong>
                      <br />example.ch — Compliance Score: 85/100
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleBrandSave}
                  disabled={brandSaving}
                  style={{
                    background: brandSaved ? G.green : G.green,
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '11px 24px',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: brandSaving ? 'not-allowed' : 'pointer',
                    alignSelf: 'flex-start',
                  }}
                >
                  {brandSaving ? 'Wird gespeichert…' : brandSaved ? 'Gespeichert!' : 'Einstellungen speichern'}
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </PageWrapper>
  );
}
