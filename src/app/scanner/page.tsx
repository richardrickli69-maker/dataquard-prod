'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { PageWrapper } from '../components/PageWrapper';

const G = {
  green: '#22c55e',
  greenBg: 'rgba(34,197,94,0.08)',
  bgWhite: '#ffffff',
  bgLight: '#f1f2f6',
  border: '#e2e4ea',
  text: '#1a1a2e',
  textSec: '#555566',
  textMuted: '#888899',
  red: '#dc2626',
  yellow: '#eab308',
  violet: '#8B5CF6',
  violetBg: 'rgba(139,92,246,0.08)',
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface ScanResult {
  url: string;
  scores: { compliance: number; optimization: number; trust: number; aiTrust: number; };
  findings: {
    datenschutz: boolean; cookieBanner: boolean; trackerCount: number;
    ssl: boolean; mobile: boolean; impressum: boolean;
    impressumVollstaendig: boolean; impressumPflichtangaben: string[];
  };
  jurisdiction: 'nDSG' | 'DSGVO' | 'BEIDES';
  insights: string[];
  recommendations: string[];
  aiTrust: {
    score: number;
    deepfakeRisk: 'none' | 'low' | 'medium' | 'high';
    requiresDisclosure: boolean;
    summary: string;
    signals: Array<{ type: string; confidence: number; detail: string }>;
    imagesAnalysed: number;
    aiImagesFound: number;
    sightengineActive: boolean;
  };
  imageAnalysis?: {
    total_images_scanned: number;
    ai_generated_count: number;
    deepfake_count: number;
    nudity_count: number;
    weapon_count: number;
    unsafe_count: number;
    all_safe: boolean;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const jurisdictionStyle = (j: string): React.CSSProperties => {
  if (j === 'nDSG') return { color: '#22c55e', background: '#f0fdf4', border: '1px solid #bbf7d0' };
  if (j === 'DSGVO') return { color: '#eab308', background: '#fefce8', border: '1px solid #fef08a' };
  return { color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca' };
};

const jurisdictionEmoji = (j: string) => j === 'nDSG' ? '🟢' : j === 'DSGVO' ? '🟡' : '🔴';

const scoreColor = (score: number) => score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444';
const scoreLabel = (score: number) => score >= 70 ? 'Gut' : score >= 40 ? 'Verbesserungsbedarf' : 'Kritisch';

// ─── Score Circle ─────────────────────────────────────────────────────────────

function ScoreCircle({ score, label, icon }: { score: number; label: string; icon: string }) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = scoreColor(score);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ position: 'relative', width: 56, height: 56 }}>
        <svg width="56" height="56" style={{ transform: 'rotate(-90deg)' }} viewBox="0 0 52 52">
          <circle cx="26" cy="26" r={r} fill="none" stroke={G.border} strokeWidth="5" />
          <circle cx="26" cy="26" r={r} fill="none" stroke={color} strokeWidth="5"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {({ '🔒': '/icon-sicherheit.png', '✅': '/icon-verifiziert.png', '🤖': '/badge-ai-trust.svg' } as Record<string,string>)[icon]
            ? <img src={({ '🔒': '/icon-sicherheit.png', '✅': '/icon-verifiziert.png', '🤖': '/badge-ai-trust.svg' } as Record<string,string>)[icon]} alt="" width={14} height={14} style={{ display: 'block', marginBottom: 1 }} />
            : <span style={{ fontSize: 14 }}>{icon}</span>}
          <span style={{ fontSize: 10, fontWeight: 700, color: G.text, lineHeight: 1 }}>{score}%</span>
        </div>
      </div>
      <span style={{ fontSize: 11, color: G.textMuted, fontWeight: 500, textAlign: 'center' }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 600, color }}>{scoreLabel(score)}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ScannerPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlParam = params.get('url');
    if (urlParam && urlParam.trim()) {
      setUrl(urlParam);
      setTimeout(() => handleScanWithUrl(urlParam), 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScanWithUrl = async (scanUrlParam?: string) => {
    const rawUrl = scanUrlParam ?? url;
    if (!rawUrl.trim()) { setError('Bitte geben Sie eine URL ein.'); return; }
    setError(''); setScanning(true); setResult(null);
    let scanUrl = rawUrl.trim();
    if (!scanUrl.startsWith('http://') && !scanUrl.startsWith('https://')) scanUrl = 'https://' + scanUrl;
    try {
      let session = null;
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!error) session = data.session;
      } catch {}
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;
      const res = await fetch('/api/scan/extended', { method: 'POST', headers, body: JSON.stringify({ url: scanUrl }) });
      if (!res.ok) throw new Error(`Serverfehler: ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Scan fehlgeschlagen');
      const scan = data.data?.scan;
      const rawJurisdiction = scan?.compliance?.jurisdiction ?? 'nDSG';
      const jurisdiction = (rawJurisdiction === 'GDPR' ? 'DSGVO' : rawJurisdiction) as 'nDSG' | 'DSGVO' | 'BEIDES';
      const aiAudit = scan?.aiAudit;
      const sightengine = scan?.sightengine;
      // AI-Trust score: Sightengine schlägt Metadaten-Analyse (realistischer)
      const baseScore = aiAudit?.realityScore ?? 95;
      const aiTrustScore = sightengine
        ? Math.round(baseScore * 0.4 + Math.max(0, 100 - sightengine.maxAiScore) * 0.6)
        : baseScore;
      setResult({
        url: scanUrl,
        scores: {
          compliance: scan?.compliance?.score ?? 0,
          optimization: scan?.optimization?.score ?? 0,
          trust: scan?.trust?.score ?? 0,
          aiTrust: aiTrustScore,
        },
        findings: {
          datenschutz: scan?.compliance?.hasPrivacyPolicy ?? false,
          cookieBanner: scan?.compliance?.hasCookieBanner ?? false,
          trackerCount: scan?.optimization?.trackerCount ?? 0,
          ssl: scan?.trust?.hasSSL ?? scan?.optimization?.hasSSL ?? false,
          mobile: scan?.optimization?.isMobileFriendly ?? false,
          impressum: scan?.trust?.hasImpressum ?? false,
          impressumVollstaendig: scan?.trust?.impressumComplete ?? false,
          impressumPflichtangaben: scan?.trust?.impressumMissing ?? [],
        },
        jurisdiction,
        insights: scan?.insights ?? [],
        recommendations: scan?.recommendations ?? [],
        aiTrust: {
          score: aiTrustScore,
          deepfakeRisk: aiAudit?.deepfakeRisk ?? 'none',
          requiresDisclosure: aiAudit?.requiresDisclosure ?? false,
          summary: aiAudit?.summary ?? 'Keine KI-Signale erkannt.',
          signals: aiAudit?.signals ?? [],
          imagesAnalysed: sightengine?.imagesAnalysed ?? 0,
          aiImagesFound: sightengine?.aiImagesFound ?? 0,
          sightengineActive: !!sightengine,
        },
        imageAnalysis: data.data?.image_analysis ?? undefined,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Scan fehlgeschlagen. Bitte versuchen Sie es erneut.');
    } finally { setScanning(false); }
  };

  const handleScan = () => handleScanWithUrl();

  const card: React.CSSProperties = { background: G.bgWhite, border: `1px solid ${G.border}`, borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' };
  const inputStyle: React.CSSProperties = { flex: 1, background: G.bgLight, border: `1px solid ${G.border}`, borderRadius: 12, padding: '12px 16px', color: G.text, fontSize: 14, outline: 'none' };

  return (
    <PageWrapper>
      {/* Sub-nav */}
      <div style={{ borderBottom: `1px solid ${G.border}`, background: G.bgWhite, padding: '8px 16px' }}>
        <div style={{ maxWidth: 896, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => router.back()} style={{ color: G.textSec, fontSize: 13, cursor: 'pointer', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            ← Zurück
          </button>
          <Link href="/checkout" style={{ background: G.green, color: '#fff', fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 20, textDecoration: 'none' }}>
            Upgrade – CHF 79 Einmalkauf
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 896, margin: '0 auto', padding: '40px 16px' }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6, color: G.text }}>Website-Analyse</h1>
          <p style={{ color: G.textSec, fontSize: 14 }}>Compliance · Optimierung · Sicherheit · <span style={{ color: G.violet }}>AI-Trust</span></p>
        </div>

        {/* URL Input */}
        <div style={{ ...card, marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: G.textSec, marginBottom: 8 }}>Website-URL eingeben</label>
          <div style={{ display: 'flex', gap: 12 }}>
            <input type="text" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleScan()}
              placeholder="https://ihre-website.ch" style={inputStyle} />
            <button onClick={handleScan} disabled={scanning} style={{ background: scanning ? G.bgLight : G.green, color: scanning ? G.textMuted : '#fff', padding: '12px 24px', borderRadius: 12, fontWeight: 600, border: 'none', cursor: scanning ? 'not-allowed' : 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
              {scanning ? (
                <>
                  <span style={{ width: 16, height: 16, border: `2px solid ${G.green}`, borderTop: '2px solid transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
                  Analyse läuft…
                </>
              ) : '🚀 Analyse starten'}
            </button>
          </div>
          {error && <p style={{ marginTop: 10, color: G.red, fontSize: 13 }}>{error}</p>}
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>

        {/* Info box – no result */}
        {!result && !scanning && (
          <div style={card}>
            <h2 style={{ fontSize: 13, fontWeight: 600, color: G.textSec, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: G.green }}>ℹ️</span> Was wir prüfen
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              {[
                { icon: '🔒', title: 'Compliance', desc: 'DSGVO/nDSG-Anforderungen, Tracker-Erkennung, Cookie Banner' },
                { icon: '⚡', title: 'Optimierung', desc: 'Ladezeit, Performance, Mobile-Freundlichkeit, SSL' },
                { icon: '🛡️', title: 'Sicherheit', desc: 'Veraltete Scripts, Mixed Content, SSL-Zertifikate' },
                { icon: '✅', title: 'Vertrauen', desc: 'Kontaktinfos, Meta Tags, Sicherheitsindikatoren' },
                { icon: '📄', title: 'Impressum', desc: 'Vollständigkeit, Pflichtangaben nach nDSG/DSGVO' },
                { icon: '🎯', title: 'Empfehlungen', desc: 'Konkrete Schritte zur Verbesserung' },
                { icon: '🤖', title: 'AI-Trust', desc: 'KI-Bild-Erkennung, Deepfake-Check, EU AI Act Art. 50' },
              ].map(item => (
                <div key={item.title} style={{ display: 'flex', gap: 12, padding: 12, background: G.bgLight, borderRadius: 10 }}>
                  {({ '🔒': '/icon-sicherheit.png', '🛡️': '/icon-schutz.png', '✅': '/icon-verifiziert.png', '🤖': '/badge-ai-trust.svg' } as Record<string,string>)[item.icon]
                    ? <img src={({ '🔒': '/icon-sicherheit.png', '🛡️': '/icon-schutz.png', '✅': '/icon-verifiziert.png', '🤖': '/badge-ai-trust.svg' } as Record<string,string>)[item.icon]} alt="" width={20} height={20} style={{ display: 'inline-block', flexShrink: 0 }} />
                    : <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>}
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: G.text, marginBottom: 2 }}>{item.title}</p>
                    <p style={{ fontSize: 12, color: G.textSec }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {scanning && (
          <div style={{ ...card, textAlign: 'center', padding: 48 }}>
            <div style={{ width: 48, height: 48, border: `4px solid ${G.green}`, borderTop: '4px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ fontWeight: 600, color: G.text }}>Analyse läuft…</p>
            <p style={{ color: G.textSec, fontSize: 13, marginTop: 4 }}>Wir prüfen Compliance, Optimierung, Sicherheit und AI-Trust.</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, ...jurisdictionStyle(result.jurisdiction) }}>
              {jurisdictionEmoji(result.jurisdiction)} Jurisdiktion: {result.jurisdiction}
            </div>

            {/* Scores */}
            <div style={card}>
              <h2 style={{ fontSize: 13, fontWeight: 600, color: G.textSec, marginBottom: 20 }}>Analyse-Ergebnis</h2>
              <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 16 }}>
                <ScoreCircle score={result.scores.compliance} label="Compliance" icon="🔒" />
                <ScoreCircle score={result.scores.optimization} label="Optimierung" icon="⚡" />
                <ScoreCircle score={result.scores.trust} label="Vertrauen" icon="✅" />
                <ScoreCircle score={result.scores.aiTrust} label="AI-Trust" icon="🤖" />
              </div>
            </div>

            {/* Findings */}
            <div style={card}>
              <h2 style={{ fontSize: 13, fontWeight: 600, color: G.textSec, marginBottom: 16 }}>📊 Befunde</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { label: 'Datenschutzerklärung', ok: result.findings.datenschutz, bad: '❌ Fehlt – Pflicht nach nDSG/DSGVO!', good: '✅ Vorhanden' },
                  { label: 'Cookie Banner', ok: result.findings.cookieBanner, bad: '❌ Fehlt', good: '✅ Vorhanden' },
                  { label: 'Tracker gefunden', ok: result.findings.trackerCount <= 4, bad: `⚠️ ${result.findings.trackerCount} Tracker – zu viele`, good: `✅ ${result.findings.trackerCount} Tracker (akzeptabel)` },
                  { label: 'SSL / HTTPS', ok: result.findings.ssl, bad: '❌ Kein SSL – Sicherheitsrisiko!', good: '✅ Sicher' },
                  { label: 'Mobile-Optimierung', ok: result.findings.mobile, bad: '⚠️ Nicht mobile-freundlich', good: '✅ Mobile-freundlich' },
                  { label: 'Impressum', ok: result.findings.impressum, bad: '❌ Fehlt – gesetzlich verpflichtend!', good: result.findings.impressumVollstaendig ? '✅ Vollständig vorhanden' : '⚠️ Vorhanden, aber unvollständig' },
                  { label: 'KI-Inhalte (AI-Trust)', ok: !result.aiTrust.requiresDisclosure, bad: '⚠️ KI-Signale erkannt – EU AI Act Art. 50 beachten', good: '✅ Keine KI-Inhalts-Signale' },
                  ...(result.imageAnalysis ? [{ label: '🖼️ Bilder-Sicherheit', ok: result.imageAnalysis.all_safe, bad: `❌ ${result.imageAnalysis.unsafe_count + result.imageAnalysis.ai_generated_count} Problem(e) erkannt`, good: `✅ Alle ${result.imageAnalysis.total_images_scanned} Bilder sicher` }] : []),
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 0', borderBottom: `1px solid ${G.border}` }}>
                    <span style={{ color: G.textMuted, fontSize: 13, width: 180, flexShrink: 0 }}>{row.label}:</span>
                    <span style={{ fontSize: 13, color: row.ok ? G.green : G.red }}>{row.ok ? row.good : row.bad}</span>
                  </div>
                ))}
                {result.findings.impressum && !result.findings.impressumVollstaendig && result.findings.impressumPflichtangaben.length > 0 && (
                  <div style={{ marginTop: 12, padding: 12, background: '#fefce8', border: '1px solid #fef08a', borderRadius: 10 }}>
                    <p style={{ color: G.yellow, fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Fehlende Pflichtangaben im Impressum:</p>
                    <ul style={{ paddingLeft: 16, fontSize: 12, color: G.textSec }}>
                      {result.findings.impressumPflichtangaben.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Insights */}
            {result.insights.length > 0 && (
              <div style={card}>
                <h2 style={{ fontSize: 13, fontWeight: 600, color: G.textSec, marginBottom: 16 }}>💡 Erkenntnisse</h2>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {result.insights.map((insight, i) => (
                    <li key={i} style={{ fontSize: 13, color: G.textSec, paddingLeft: 12, borderLeft: `2px solid ${G.border}` }}>{insight}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <div style={card}>
                <h2 style={{ fontSize: 13, fontWeight: 600, color: G.textSec, marginBottom: 16 }}>🎯 Empfehlungen</h2>
                <ol style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {result.recommendations.map((rec, i) => (
                    <li key={i} style={{ fontSize: 13, color: G.textSec, display: 'flex', gap: 12 }}>
                      <span style={{ flexShrink: 0, width: 20, height: 20, background: G.greenBg, color: G.green, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{i + 1}</span>
                      <span>{rec.replace(/^\d+\.?\s*/, '')}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* AI-Trust Detail */}
            <div style={{ ...card, borderTop: `3px solid ${G.violet}` }}>
              <h2 style={{ fontSize: 13, fontWeight: 600, color: G.violet, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                <img src="/badge-ai-trust.svg" alt="AI-Trust" width={16} height={16} style={{ display: 'inline-block', verticalAlign: 'middle' }} /> AI-Trust — KI-Inhaltsanalyse (EU AI Act Art. 50)
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ padding: 12, background: G.violetBg, borderRadius: 10, fontSize: 13, color: G.text }}>
                  {result.aiTrust.summary}
                </div>
                {result.aiTrust.sightengineActive && (
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 140, padding: '10px 14px', background: G.bgLight, borderRadius: 10, fontSize: 12 }}>
                      <span style={{ color: G.textMuted }}>Bilder gescannt</span>
                      <p style={{ fontWeight: 700, fontSize: 18, color: G.text, margin: '2px 0 0' }}>{result.aiTrust.imagesAnalysed}</p>
                    </div>
                    <div style={{ flex: 1, minWidth: 140, padding: '10px 14px', background: G.bgLight, borderRadius: 10, fontSize: 12 }}>
                      <span style={{ color: G.textMuted }}>KI-Bilder erkannt</span>
                      <p style={{ fontWeight: 700, fontSize: 18, color: result.aiTrust.aiImagesFound > 0 ? G.red : G.green, margin: '2px 0 0' }}>{result.aiTrust.aiImagesFound}</p>
                    </div>
                    <div style={{ flex: 1, minWidth: 140, padding: '10px 14px', background: G.bgLight, borderRadius: 10, fontSize: 12 }}>
                      <span style={{ color: G.textMuted }}>Deepfake-Risiko</span>
                      <p style={{ fontWeight: 700, fontSize: 16, color: result.aiTrust.deepfakeRisk === 'none' ? G.green : result.aiTrust.deepfakeRisk === 'low' ? G.yellow : G.red, margin: '2px 0 0', textTransform: 'capitalize' }}>{result.aiTrust.deepfakeRisk}</p>
                    </div>
                  </div>
                )}
                {result.aiTrust.signals.length > 0 && (
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: G.textSec, marginBottom: 6 }}>Erkannte Signale:</p>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {result.aiTrust.signals.map((s, i) => (
                        <li key={i} style={{ fontSize: 12, color: G.textSec, paddingLeft: 12, borderLeft: `2px solid ${G.violet}` }}>
                          {s.detail} <span style={{ color: G.textMuted }}>({Math.round(s.confidence * 100)}% Konfidenz)</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.aiTrust.requiresDisclosure && (
                  <div style={{ padding: 12, background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 10, fontSize: 12, color: '#92400e' }}>
                    <strong>Handlungsbedarf:</strong> Gemäss EU AI Act Art. 50 müssen KI-generierte Inhalte gekennzeichnet werden.{' '}
                    <a href="/checkout?plan=ai-trust" style={{ color: G.violet, fontWeight: 600, textDecoration: 'underline' }}>AI-Trust Abo – CHF 99/Jahr →</a>
                  </div>
                )}
              </div>
            </div>

            {/* KI-Bild-Analyse (Sightengine) */}
            {result.imageAnalysis && result.imageAnalysis.total_images_scanned > 0 && (
              <div style={{ ...card, borderTop: `3px solid ${G.violet}` }}>
                <h2 style={{ fontSize: 13, fontWeight: 600, color: G.violet, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                  🖼️ KI-Bild-Analyse
                  <span style={{ fontSize: 11, fontWeight: 400, color: G.textMuted }}>({result.imageAnalysis.total_images_scanned} Bilder geprüft via Sightengine)</span>
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 12 }}>
                  {[
                    { label: 'KI-generiert', val: result.imageAnalysis.ai_generated_count, warn: result.imageAnalysis.ai_generated_count > 0 },
                    { label: 'Deepfake', val: result.imageAnalysis.deepfake_count, warn: result.imageAnalysis.deepfake_count > 0 },
                    { label: 'Unsicher', val: result.imageAnalysis.unsafe_count, warn: result.imageAnalysis.unsafe_count > 0 },
                    { label: 'Status', val: null, warn: !result.imageAnalysis.all_safe },
                  ].map((item, i) => (
                    <div key={i} style={{ padding: '10px 14px', borderRadius: 10, textAlign: 'center', background: item.warn ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)', border: `1px solid ${item.warn ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}` }}>
                      {item.val !== null
                        ? <p style={{ fontSize: 22, fontWeight: 700, color: item.warn ? G.red : G.green, margin: '0 0 2px' }}>{item.val}</p>
                        : <p style={{ fontSize: 22, margin: '0 0 2px' }}>{result.imageAnalysis!.all_safe ? '✅' : '⚠️'}</p>
                      }
                      <span style={{ fontSize: 11, color: G.textMuted }}>{item.label}</span>
                    </div>
                  ))}
                </div>
                {result.imageAnalysis.ai_generated_count > 0 && (
                  <div style={{ padding: 10, background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: 10, fontSize: 12, color: '#92400e', marginBottom: 6 }}>
                    <strong style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><img src="/icon-recht.png" alt="Recht" width={14} height={14} style={{ display: 'inline-block', verticalAlign: 'middle' }} /> EU AI Act Art. 50:</strong> KI-generierte Bilder müssen als solche gekennzeichnet werden. {result.imageAnalysis.ai_generated_count} Bild(er) möglicherweise KI-generiert.
                  </div>
                )}
                {result.imageAnalysis.deepfake_count > 0 && (
                  <div style={{ padding: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, fontSize: 12, color: '#7f1d1d' }}>
                    <strong>🚨 Deepfake erkannt:</strong> {result.imageAnalysis.deepfake_count} Bild(er) weisen Deepfake-Merkmale auf – mögliche rechtliche Konsequenzen.
                  </div>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <button onClick={() => { setResult(null); setUrl(''); }} style={{ display: 'flex', alignItems: 'center', gap: 6, background: G.bgLight, border: `1px solid ${G.border}`, color: G.text, padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                ← Neue Analyse
              </button>
              <Link href={`/impressum-generator?domain=${encodeURIComponent(result.url)}&jurisdiction=${result.jurisdiction}`} style={{ display: 'flex', alignItems: 'center', gap: 6, background: G.bgLight, border: `1px solid ${G.border}`, color: G.text, padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
                📄 Impressum generieren
              </Link>
              <Link href={`/cookie-banner-generator?domain=${encodeURIComponent(result.url)}&jurisdiction=${result.jurisdiction}&trackers=${result.findings.trackerCount > 0 ? 'google_analytics' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: 6, background: G.bgLight, border: `1px solid ${G.border}`, color: G.text, padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
                🍪 Cookie-Banner generieren
              </Link>
              <Link href="/checkout" style={{ display: 'flex', alignItems: 'center', gap: 6, background: G.green, color: '#fff', padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                <img src="/icon-sicherheit.png" alt="Datenschutz" width={14} height={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }} />Datenschutzerklärung – CHF 79
              </Link>
            </div>
          </div>
        )}
      </div>

    </PageWrapper>
  );
}
