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

interface JsRenderingInfo {
  isLikelyJsRendered: boolean;
  confidence: 'high' | 'medium' | 'low';
  scanReliability: string;
  detectedFramework: string | null;
  signals: string[];
}

interface PageSpeedMetric {
  score: number;
  fcp: number;
  lcp: number;
  tbt: number;
  cls: number;
  si: number;
}

interface ScanResult {
  url: string;
  /** Wenn gesetzt: Seite konnte nicht vollständig geladen werden (Partial Result) */
  fetchError?: string;
  scores: { compliance: number; optimization: number; trust: number; aiTrust: number; };
  pageSpeed?: {
    mobile: PageSpeedMetric | null;
    desktop: PageSpeedMetric | null;
    combinedScore: number;
  };
  findings: {
    datenschutz: boolean;
    cookieBanner: boolean;
    cookieBannerProvider?: string;
    /** Kontextabhängiger Status: vorhanden | fehlt_pflicht | nicht_erforderlich | nicht_erkennbar */
    cookieBannerStatus: 'vorhanden' | 'fehlt_pflicht' | 'nicht_erforderlich' | 'nicht_erkennbar';
    cookieBannerTrackerCount: number;
    trackerCount: number;
    ssl: boolean; mobile: boolean; impressum: boolean;
    impressumVollstaendig: boolean; impressumPflichtangaben: string[];
  };
  jsRendering?: JsRenderingInfo;
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
    /** Gesamt-Anzahl gefundener Bilder (vor Free-Tier-Limit von 5) */
    total_images_found: number;
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

function JurisdictionIcon({ j }: { j: string }) {
  const src = j === 'nDSG' ? '/gruener-kreis.png' : j === 'DSGVO' ? '/gelber-kreis.png' : '/roter-kreis.png';
  return <img src={src} alt={j} width={16} height={16} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }} />;
}

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
          {((): React.ReactNode => {
            const scoreIconMap: Record<string, string> = {
              '🔒': '/gruener-kreis.png',
              '⚡': '/flug.png',
              '✅': '/energie.png',
              '🤖': '/badge-ai-trust.svg',
            };
            const src = scoreIconMap[icon];
            if (!src) return <span style={{ fontSize: 14 }}>{icon}</span>;
            return <img src={src} alt="" width={14} height={14} style={{ display: 'block', marginBottom: 1 }} />;
          })()}
          {/* Prozent-Zahl im Circle */}
          <span style={{ fontSize: 10, fontWeight: 700, color: G.text, lineHeight: 1 }}>{score}%</span>
        </div>
      </div>
      {/* Score-Label: text-sm (14px) */}
      <span style={{ fontSize: 14, color: G.textMuted, fontWeight: 500, textAlign: 'center' }}>{label}</span>
      {/* Bewertung: text-xs (12px) */}
      <span style={{ fontSize: 12, fontWeight: 600, color }}>{scoreLabel(score)}</span>
    </div>
  );
}

// ─── Emoji-Bereiniger für API-Antwort-Texte ───────────────────────────────────
// Entfernt alle Emojis aus API-generierten Strings (insights, recommendations)
function stripEmojis(text: string): string {
  return text.replace(
    /[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{FE00}-\u{FE0F}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u2000-\u206F]|[\u2300-\u23FF]|[\u2B00-\u2BFF]|[\u{E0020}-\u{E007F}]/gu,
    ''
  ).replace(/\s{2,}/g, ' ').trim();
}

// ─── Befund-Icon Helfer ────────────────────────────────────────────────────────

function IconOK() {
  return <img src="/checkmark.png" alt="OK" width={16} height={16} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }} />;
}
function IconWarn() {
  return <img src="/warnung.png" alt="Warnung" width={16} height={16} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }} />;
}
function IconErr() {
  return <img src="/fehler.png" alt="Fehler" width={16} height={16} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }} />;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ScannerPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState('');
  const [serviceStatus, setServiceStatus] = useState<'loading' | 'ok' | 'degraded' | 'down'>('loading');

  // Health-Check beim Laden: Dienste-Status prüfen
  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then((data: { operational: boolean; status: { scanner: boolean; sightengine: boolean; claude: boolean } }) => {
        if (data.operational) {
          setServiceStatus('ok');
        } else if (data.status?.scanner) {
          setServiceStatus('degraded');
        } else {
          setServiceStatus('down');
        }
      })
      .catch(() => setServiceStatus('down'));
  }, []);

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
        fetchError: scan?.fetchError ?? undefined,
        scores: {
          compliance: scan?.compliance?.score ?? 0,
          optimization: scan?.optimization?.score ?? 0,
          trust: scan?.trust?.score ?? 0,
          aiTrust: aiTrustScore,
        },
        findings: {
          datenschutz: scan?.compliance?.hasPrivacyPolicy ?? false,
          cookieBanner: scan?.compliance?.hasCookieBanner ?? false,
          cookieBannerProvider: scan?.compliance?.cookieBannerProvider ?? undefined,
          cookieBannerStatus: scan?.compliance?.cookieBannerAssessment?.status ?? 'fehlt_pflicht',
          cookieBannerTrackerCount: scan?.compliance?.cookieBannerAssessment?.trackerCount ?? 0,
          trackerCount: scan?.optimization?.trackerCount ?? 0,
          ssl: scan?.trust?.hasSSL ?? scan?.optimization?.hasSSL ?? false,
          mobile: scan?.optimization?.isMobileFriendly ?? false,
          impressum: scan?.trust?.hasImpressum ?? false,
          impressumVollstaendig: scan?.trust?.impressumComplete ?? false,
          impressumPflichtangaben: scan?.trust?.impressumMissing ?? [],
        },
        jsRendering: scan?.compliance?.jsRendering ?? undefined,
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
        pageSpeed: scan?.pageSpeed ?? undefined,
      });
    } catch {
      setError('Der Scanner ist momentan nicht verfügbar. Bitte versuchen Sie es in einigen Minuten erneut.');
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
            Upgrade – CHF 19.–/Mt.
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 896, margin: '0 auto', padding: '40px 16px' }}>
        {/* Titel */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6, color: G.text }}>Website-Analyse</h1>
          <p style={{ color: G.textSec, fontSize: 14 }}>Compliance · Optimierung · Sicherheit · <span style={{ color: G.violet }}>AI-Trust</span></p>
        </div>

        {/* Status-Banner (nur bei Problemen) */}
        {serviceStatus === 'down' && (
          <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, textAlign: 'center', justifyContent: 'center' }}>
            <img src="/fehler.png" alt="" width={16} height={16} style={{ flexShrink: 0 }} />
            <p style={{ color: G.red, fontSize: 13, fontWeight: 600, margin: 0 }}>
              Der Scanner ist momentan nicht verfügbar. Bitte versuchen Sie es später erneut.
            </p>
          </div>
        )}
        {serviceStatus === 'degraded' && (
          <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.25)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/warnung.png" alt="" width={16} height={16} style={{ flexShrink: 0 }} />
            <p style={{ color: '#92400e', fontSize: 13, margin: 0 }}>
              Eingeschränkter Betrieb — die KI-Bild-Analyse ist momentan nicht verfügbar. Compliance, Performance und Security werden normal geprüft.
            </p>
          </div>
        )}

        {/* URL-Eingabe */}
        <div style={{ ...card, marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: G.textSec, marginBottom: 8 }}>Website-URL eingeben</label>
          <div style={{ display: 'flex', gap: 12 }}>
            <input type="text" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleScan()}
              placeholder="https://ihre-website.ch" style={inputStyle} />
            <button onClick={handleScan} disabled={scanning || serviceStatus === 'down'} style={{ background: (scanning || serviceStatus === 'down') ? G.bgLight : G.green, color: (scanning || serviceStatus === 'down') ? G.textMuted : '#fff', padding: '12px 24px', borderRadius: 12, fontWeight: 600, border: 'none', cursor: (scanning || serviceStatus === 'down') ? 'not-allowed' : 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap', opacity: serviceStatus === 'down' ? 0.5 : 1 }}>
              {scanning ? (
                <>
                  <span style={{ width: 16, height: 16, border: `2px solid ${G.green}`, borderTop: '2px solid transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
                  Analyse läuft…
                </>
              ) : <><img src="/suche.png" alt="" width={16} height={16} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 6 }} />Analyse starten</>}
            </button>
          </div>
          {error && (
            <div style={{ marginTop: 12, background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ color: G.red, fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Scan nicht möglich</p>
              <p style={{ color: G.textSec, fontSize: 13, marginBottom: 10 }}>{error}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { setError(''); setResult(null); setUrl(''); }}
                  style={{ fontSize: 12, color: G.textSec, background: 'none', border: `1px solid ${G.border}`, borderRadius: 8, padding: '5px 12px', cursor: 'pointer' }}>
                  Andere URL
                </button>
                <button onClick={handleScan}
                  style={{ fontSize: 12, color: '#fff', background: G.green, border: 'none', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontWeight: 600 }}>
                  Erneut versuchen
                </button>
              </div>
            </div>
          )}
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>

        {/* Info-Box – kein Ergebnis */}
        {!result && !scanning && (
          <div style={card}>
            <h2 style={{ fontSize: 13, fontWeight: 600, color: G.textSec, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
              <img src="/energie.png" alt="" width={16} height={16} style={{ display: 'inline-block', verticalAlign: 'middle' }} /> Was wir prüfen
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
              ].map(item => {
                const featureIconMap: Record<string, string> = {
                  '🔒': '/gruener-kreis.png',
                  '🛡️': '/icon-schutz.png',
                  '✅': '/energie.png',
                  '🤖': '/badge-ai-trust.svg',
                  '⚡': '/flug.png',
                  '📄': '/dokument.png',
                  '🎯': '/ziel.png',
                };
                const iconSrc = featureIconMap[item.icon];
                return (
                  <div key={item.title} style={{ display: 'flex', gap: 12, padding: 12, background: G.bgLight, borderRadius: 10 }}>
                    {iconSrc
                      ? <img src={iconSrc} alt="" width={20} height={20} style={{ display: 'inline-block', flexShrink: 0 }} />
                      : <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>}
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: G.text, marginBottom: 2 }}>{item.title}</p>
                      <p style={{ fontSize: 12, color: G.textSec }}>{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Ladeanimation */}
        {scanning && (
          <div style={{ ...card, textAlign: 'center', padding: 48 }}>
            <div style={{ width: 48, height: 48, border: `4px solid ${G.green}`, borderTop: '4px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ fontWeight: 600, color: G.text }}>Analyse läuft…</p>
            <p style={{ color: G.textSec, fontSize: 13, marginTop: 4 }}>Wir prüfen Compliance, Optimierung, Sicherheit und AI-Trust.</p>
          </div>
        )}

        {/* Ergebnisse */}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Jurisdiktion-Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, ...jurisdictionStyle(result.jurisdiction) }}>
              <JurisdictionIcon j={result.jurisdiction} /> Jurisdiktion: {result.jurisdiction}
            </div>

            {/* Score-Circles */}
            <div style={card}>
              <h2 style={{ fontSize: 13, fontWeight: 600, color: G.textSec, marginBottom: 20 }}>Analyse-Ergebnis</h2>
              <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 16 }}>
                <ScoreCircle score={result.scores.compliance} label="Compliance" icon="🔒" />
                <ScoreCircle score={result.scores.optimization} label="Optimierung" icon="⚡" />
                <ScoreCircle score={result.scores.trust} label="Vertrauen" icon="✅" />
                <ScoreCircle score={result.scores.aiTrust} label="AI-Trust" icon="🤖" />
              </div>
            </div>

            {/* Partial-Result-Warnung wenn Seite nicht vollständig geladen werden konnte */}
            {result.fetchError && (
              <div style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.4)', borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ color: '#92400e', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Eingeschränkter Scan</p>
                <p style={{ color: G.textSec, fontSize: 13 }}>{result.fetchError} Einige Prüfungen (Datenschutzerklärung, Tracker, Cookie-Banner) konnten nicht durchgeführt werden — SSL und Basis-Analyse sind trotzdem verfügbar.</p>
              </div>
            )}

            {/* JS-Rendering-Hinweis (nur wenn erkannt) */}
            {result.jsRendering?.isLikelyJsRendered && (result.jsRendering.confidence === 'high' || result.jsRendering.confidence === 'medium') && (
              <div style={{
                background: '#fefce8',
                border: `1px solid ${G.yellow}`,
                borderLeft: `4px solid ${G.yellow}`,
                borderRadius: 10,
                padding: '14px 18px',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ fontSize: 20, lineHeight: 1 }}>⚠️</span>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, color: '#92400e', marginBottom: 4 }}>
                      Diese Website verwendet JavaScript-Rendering
                      {result.jsRendering.detectedFramework ? ` (${result.jsRendering.detectedFramework})` : ''}
                    </p>
                    <p style={{ fontSize: 13, color: '#78350f', lineHeight: 1.5, marginBottom: 6 }}>
                      Einige Inhalte werden erst im Browser geladen und konnten nicht vollständig analysiert werden.
                      Die Ergebnisse zu Cookie-Banner, Datenschutzerklärung und Tracker-Erkennung könnten unvollständig sein.
                    </p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                        background: result.jsRendering.confidence === 'high' ? '#dc2626' : '#f59e0b',
                        color: '#fff',
                      }}>
                        Scan-Zuverlässigkeit: {result.jsRendering.scanReliability}
                      </span>
                      <span style={{ fontSize: 12, color: '#92400e' }}>
                        🔜 Vollständiger JS-Scan kommt bald
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Befunde */}
            <div style={card}>
              <h2 style={{ fontSize: 13, fontWeight: 600, color: G.textSec, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                <img src="/diagramm.png" alt="Befunde" width={16} height={16} /> Befunde
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {(() => {
                  // JS-Rendering aktiv wenn medium oder high confidence
                  const jsActive = result.jsRendering?.isLikelyJsRendered &&
                    (result.jsRendering.confidence === 'high' || result.jsRendering.confidence === 'medium');
                  const jsHint = <span style={{ color: G.textMuted, fontSize: 12 }}> (JavaScript-Rendering)</span>;
                  return ([
                  {
                    label: 'Datenschutzerklärung',
                    ok: result.findings.datenschutz,
                    bad: jsActive
                      ? <><IconWarn /> Nicht erkennbar{jsHint}</>
                      : <><IconErr /> Fehlt – Pflicht nach nDSG/DSGVO!</>,
                    good: <><IconOK /> Vorhanden</>,
                  },
                  {
                    label: 'Cookie Banner',
                    // Status bestimmt ok/nicht ok:
                    // vorhanden → grün, nicht_erforderlich → grün (kein Banner nötig),
                    // nicht_erkennbar → gelb (kein harter Verstoss), fehlt_pflicht → rot
                    ok: result.findings.cookieBannerStatus !== 'fehlt_pflicht',
                    bad: <><IconErr /> Fehlt – Pflicht wegen {result.findings.cookieBannerTrackerCount} erkannter Tracker!</>,
                    good: (() => {
                      switch (result.findings.cookieBannerStatus) {
                        case 'vorhanden':
                          return <><IconOK /> {result.findings.cookieBannerProvider ? `Vorhanden (${result.findings.cookieBannerProvider})` : 'Vorhanden'}</>;
                        case 'nicht_erforderlich':
                          return <><img src="/gruener-kreis.png" alt="Info" width={16} height={16} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }} /> Nicht erforderlich (keine Tracker erkannt)</>;
                        case 'nicht_erkennbar':
                          return <><IconWarn /> Nicht erkennbar{jsHint}</>;
                        default:
                          return <><IconOK /> Vorhanden</>;
                      }
                    })(),
                  },
                  {
                    label: 'Tracker gefunden',
                    ok: result.findings.trackerCount <= 4,
                    bad: jsActive
                      ? <><IconWarn /> Möglicherweise mehr{jsHint}</>
                      : <><IconWarn /> {result.findings.trackerCount} Tracker – zu viele</>,
                    good: <><IconOK /> {result.findings.trackerCount} Tracker (akzeptabel)</>,
                  },
                  {
                    label: 'SSL / HTTPS',
                    ok: result.findings.ssl,
                    bad: <><IconErr /> Kein SSL – Sicherheitsrisiko!</>,
                    good: <><IconOK /> Sicher</>,
                  },
                  {
                    label: 'Mobile-Optimierung',
                    ok: result.findings.mobile,
                    bad: <><IconWarn /> Nicht mobile-freundlich</>,
                    good: <><IconOK /> Mobile-freundlich</>,
                  },
                  {
                    label: 'Impressum',
                    ok: result.findings.impressum,
                    bad: <><IconErr /> Fehlt – gesetzlich verpflichtend!</>,
                    good: result.findings.impressumVollstaendig
                      ? <><IconOK /> Vollständig vorhanden</>
                      : <><IconWarn /> Vorhanden, aber unvollständig</>,
                  },
                  {
                    label: 'KI-Inhalte (AI-Trust)',
                    ok: !result.aiTrust.requiresDisclosure,
                    // Violett als AI-Trust Markenfarbe für Ampel-Punkt und Text
                    dotColor: G.violet,
                    textColor: G.violet,
                    bad: (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <img src="/suche.png" alt="KI" width={16} height={16} style={{ flexShrink: 0 }} />
                        KI-Signale erkannt —{' '}
                        <a href="#ai-trust-section" style={{ color: G.violet, fontWeight: 600, textDecoration: 'none' }}>
                          Details im AI-Trust Bereich unten
                        </a>
                      </span>
                    ),
                    // Unterscheide: deklarierte KI (positiv) vs. keine KI (neutral)
                    good: result.aiTrust.signals.length > 0
                      ? <><IconOK /> KI-Nutzung transparent deklariert (EU AI Act konform)</>
                      : <><IconOK /> Keine KI-Inhalte erkannt</>,
                  },
                  ...(result.imageAnalysis ? [{
                    label: (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <img src="/suche.png" alt="Bilder" width={14} height={14} /> Bilder-Sicherheit
                      </span>
                    ),
                    ok: result.imageAnalysis.all_safe,
                    bad: <><IconErr /> {result.imageAnalysis.unsafe_count + result.imageAnalysis.ai_generated_count} Problem(e) erkannt</>,
                    good: <><IconOK /> Alle {result.imageAnalysis.total_images_scanned} Bilder sicher</>,
                  }] : []),
                  ] as Array<{ label: React.ReactNode; ok: boolean; bad: React.ReactNode; good: React.ReactNode; dotColor?: string; textColor?: string }>).map((row, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 0', borderBottom: `1px solid ${G.border}` }}>
                      {/* Ampel-Punkt: farbiger Kreis für schnellen Status-Überblick */}
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: row.dotColor ?? (row.ok ? G.green : G.red), flexShrink: 0, marginTop: 5 }} />
                      <span style={{ color: G.textMuted, fontSize: 14, width: 174, flexShrink: 0 }}>{row.label}</span>
                      {/* Beschreibungstext: flex-start für korrekte Ausrichtung bei mehrzeiligem Text */}
                      <span style={{ fontSize: 14, color: row.textColor ?? (row.ok ? G.green : G.red), display: 'flex', alignItems: 'flex-start', gap: 6, flexWrap: 'wrap', flex: 1 }}>
                        {row.ok ? row.good : row.bad}
                      </span>
                    </div>
                  ));
                })()}
                {/* Unvollständige Impressum-Angaben */}
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

            {/* Erkenntnisse */}
            {result.insights.length > 0 && (
              <div style={card}>
                {/* FIX 3: Erkenntnisse-Header — energie.png statt Emoji */}
                <h2 style={{ fontSize: 13, fontWeight: 600, color: G.textSec, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <img src="/energie.png" alt="Erkenntnisse" width={16} height={16} /> Erkenntnisse
                </h2>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {result.insights.map((insight, i) => (
                    <li key={i} style={{ fontSize: 14, color: G.textSec, paddingLeft: 12, borderLeft: `2px solid ${G.border}` }}>{stripEmojis(insight)}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Empfehlungen */}
            {result.recommendations.length > 0 && (
              <div style={card}>
                <h2 style={{ fontSize: 13, fontWeight: 600, color: G.textSec, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <img src="/ziel.png" alt="Empfehlungen" width={16} height={16} /> Empfehlungen
                </h2>
                <ol style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {result.recommendations.map((rec, i) => (
                    <li key={i} style={{ fontSize: 14, color: G.textSec, display: 'flex', gap: 12 }}>
                      <span style={{ flexShrink: 0, width: 20, height: 20, background: G.greenBg, color: G.green, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{i + 1}</span>
                      <span>{stripEmojis(rec.replace(/^\d+\.?\s*/, ''))}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* ─── PageSpeed Insights ─── */}
            {result.pageSpeed && (result.pageSpeed.mobile || result.pageSpeed.desktop) && (() => {
              // Schwellenwerte gemäss Google Core Web Vitals
              const cwvColor = (val: number, good: number, poor: number) =>
                val <= good ? G.green : val <= poor ? G.yellow : G.red;
              const cwvLabel = (val: number, good: number, poor: number) =>
                val <= good ? 'Gut' : val <= poor ? 'Verbesserung' : 'Schlecht';

              const metrics: Array<{
                key: keyof PageSpeedMetric;
                label: string;
                unit: string;
                good: number;
                poor: number;
                format: (v: number) => string;
              }> = [
                { key: 'fcp', label: 'Erster sichtbarer Inhalt', unit: 'FCP', good: 1800, poor: 3000, format: v => `${(v / 1000).toFixed(1)}s` },
                { key: 'lcp', label: 'Grösster sichtbarer Inhalt', unit: 'LCP', good: 2500, poor: 4000, format: v => `${(v / 1000).toFixed(1)}s` },
                { key: 'tbt', label: 'Gesamte Blockierungszeit', unit: 'TBT', good: 200, poor: 600, format: v => `${v}ms` },
                { key: 'cls', label: 'Visuelle Stabilität', unit: 'CLS', good: 0.1, poor: 0.25, format: v => v.toFixed(3) },
                { key: 'si', label: 'Geschwindigkeits-Index', unit: 'SI', good: 3400, poor: 5800, format: v => `${(v / 1000).toFixed(1)}s` },
              ];

              // Mini Score-Circle für Mobile/Desktop
              const MiniCircle = ({ score, label }: { score: number; label: string }) => {
                const r = 16;
                const circ = 2 * Math.PI * r;
                const offset = circ - (score / 100) * circ;
                const color = scoreColor(score);
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ position: 'relative', width: 44, height: 44 }}>
                      <svg width="44" height="44" style={{ transform: 'rotate(-90deg)' }} viewBox="0 0 40 40">
                        <circle cx="20" cy="20" r={r} fill="none" stroke={G.border} strokeWidth="4" />
                        <circle cx="20" cy="20" r={r} fill="none" stroke={color} strokeWidth="4"
                          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
                      </svg>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: G.text }}>{score}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: 12, color: G.textMuted, fontWeight: 500 }}>{label}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color }}>{scoreLabel(score)}</span>
                  </div>
                );
              };

              // CWV-Zeile für eine Strategie
              const CwvRow = ({ metric, val }: { metric: typeof metrics[0]; val: number }) => {
                const color = cwvColor(val, metric.good, metric.poor);
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: `1px solid ${G.border}` }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <span style={{ color: G.textMuted, fontSize: 13, flex: 1 }}>{metric.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: G.textMuted, width: 36, textAlign: 'right', flexShrink: 0 }}>{metric.unit}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color, width: 56, textAlign: 'right', flexShrink: 0 }}>{metric.format(val)}</span>
                    <span style={{ fontSize: 11, color, width: 80, flexShrink: 0 }}>{cwvLabel(val, metric.good, metric.poor)}</span>
                  </div>
                );
              };

              const activeStrategy = result.pageSpeed!.mobile ?? result.pageSpeed!.desktop;

              return (
                <div style={card}>
                  <h2 style={{ fontSize: 13, fontWeight: 600, color: G.textSec, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <img src="/flug.png" alt="Performance" width={16} height={16} /> Performance Details (PageSpeed Insights)
                  </h2>

                  {/* Mobile + Desktop Score-Circles */}
                  <div style={{ display: 'flex', gap: 32, marginBottom: 24, flexWrap: 'wrap' }}>
                    {result.pageSpeed!.mobile && <MiniCircle score={result.pageSpeed!.mobile.score} label="Mobile" />}
                    {result.pageSpeed!.desktop && <MiniCircle score={result.pageSpeed!.desktop.score} label="Desktop" />}
                  </div>

                  {/* Core Web Vitals */}
                  <p style={{ fontSize: 12, fontWeight: 700, color: G.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
                    Core Web Vitals {result.pageSpeed!.mobile && result.pageSpeed!.desktop ? '(Mobile)' : result.pageSpeed!.mobile ? '(Mobile)' : '(Desktop)'}
                  </p>
                  {activeStrategy && metrics.map(m => (
                    <CwvRow key={m.key} metric={m} val={activeStrategy[m.key] as number} />
                  ))}
                </div>
              );
            })()}

            {/* ─── FIX 1: AI-Trust — positiver Upsell statt Warnungs-Box ─── */}
            <div id="ai-trust-section" style={{
              background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
              border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: 16,
              padding: 24,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <img src="/energie.png" alt="AI-Trust" width={32} height={32} style={{ flexShrink: 0 }} />
                <h3 style={{ fontSize: 18, fontWeight: 700, color: G.text }}>AI-Trust Analyse</h3>
              </div>

              <p style={{ fontSize: 14, color: G.textSec, marginBottom: 16, lineHeight: 1.6 }}>
                {result.aiTrust.signals.length > 0 ? (
                  <>
                    Wir haben <strong style={{ color: G.text }}>{result.aiTrust.signals.length} KI-Signal(e)</strong> auf Ihrer Website erkannt.
                    Ab August 2026 verlangt der EU AI Act (Art. 50) eine Kennzeichnung von KI-Inhalten.
                    Mit dem AI-Trust Abo überwachen wir Ihre Website automatisch und halten Sie konform.
                  </>
                ) : (
                  <>Keine KI-Signale erkannt. Ihre Website ist in Bezug auf EU AI Act Art. 50 unauffällig.</>
                )}
              </p>

              {/* Erkannte Signale kurz auflisten */}
              {result.aiTrust.signals.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  {result.aiTrust.signals.map((signal, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <img src="/suche.png" alt="Signal" width={16} height={16} style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: 14, color: G.textSec }}>
                        {signal.detail} <span style={{ color: G.textMuted, fontSize: 12 }}>({Math.round(signal.confidence * 100)}% Konfidenz)</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Sightengine nicht verfügbar */}
              {!result.aiTrust.sightengineActive && (
                <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.25)', borderRadius: 10, fontSize: 13, color: G.textSec, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <img src="/warnung.png" alt="" width={16} height={16} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>Die KI-Bild-Analyse ist momentan nicht verfügbar. Die übrigen Prüfungen wurden durchgeführt. Bitte scannen Sie später erneut für die vollständige Analyse.</span>
                </div>
              )}

              {/* Sightengine-Statistiken (falls vorhanden) */}
              {result.aiTrust.sightengineActive && (
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
                  <div style={{ flex: 1, minWidth: 120, padding: '10px 14px', background: 'rgba(255,255,255,0.7)', borderRadius: 10, fontSize: 12 }}>
                    <span style={{ color: G.textMuted }}>Bilder gescannt</span>
                    <p style={{ fontWeight: 700, fontSize: 18, color: G.text, margin: '2px 0 0' }}>{result.aiTrust.imagesAnalysed}</p>
                  </div>
                  <div style={{ flex: 1, minWidth: 120, padding: '10px 14px', background: 'rgba(255,255,255,0.7)', borderRadius: 10, fontSize: 12 }}>
                    <span style={{ color: G.textMuted }}>KI-Bilder erkannt</span>
                    <p style={{ fontWeight: 700, fontSize: 18, color: result.aiTrust.aiImagesFound > 0 ? G.yellow : G.green, margin: '2px 0 0' }}>{result.aiTrust.aiImagesFound}</p>
                  </div>
                  <div style={{ flex: 1, minWidth: 120, padding: '10px 14px', background: 'rgba(255,255,255,0.7)', borderRadius: 10, fontSize: 12 }}>
                    <span style={{ color: G.textMuted }}>Deepfake-Risiko</span>
                    <p style={{ fontWeight: 700, fontSize: 16, color: result.aiTrust.deepfakeRisk === 'none' ? G.green : result.aiTrust.deepfakeRisk === 'low' ? G.yellow : G.red, margin: '2px 0 0', textTransform: 'capitalize' }}>{result.aiTrust.deepfakeRisk}</p>
                  </div>
                </div>
              )}

              {/* CTA — immer anzeigen als Upsell */}
              <Link href="/checkout?plan=ai-trust" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: '#22c55e',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: 14,
                padding: '10px 24px',
                borderRadius: 12,
                textDecoration: 'none',
              }}>
                <img src="/energie.png" alt="" width={16} height={16} />
                Professional – ab CHF 39/Mt. →
              </Link>
            </div>

            {/* KI-Bild-Analyse (Sightengine) */}
            {result.imageAnalysis && result.imageAnalysis.total_images_scanned > 0 && (
              <div style={{ ...card, borderTop: `3px solid ${G.violet}` }}>
                {/* FIX 6: suche.png statt Emoji */}
                <h2 style={{ fontSize: 13, fontWeight: 600, color: G.violet, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <img src="/suche.png" alt="KI-Bild-Analyse" width={16} height={16} /> KI-Bild-Analyse
                  <span style={{ fontSize: 11, fontWeight: 400, color: G.textMuted }}>
                    ({result.imageAnalysis.total_images_scanned} von {result.imageAnalysis.total_images_found} Bildern geprüft)
                  </span>
                </h2>
                {/* Upsell-Hinweis wenn mehr Bilder vorhanden als gescannt */}
                {result.imageAnalysis.total_images_found > 5 && (
                  <div style={{ marginBottom: 12, padding: '8px 12px', background: G.bgLight, border: `1px solid ${G.border}`, borderRadius: 8, fontSize: 12, color: G.textSec, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <IconWarn />
                    <span>
                      5 von {result.imageAnalysis.total_images_found} Bildern geprüft —{' '}
                      <Link href="/checkout?plan=starter" style={{ color: G.green, fontWeight: 600, textDecoration: 'none' }}>
                        für vollständigen Scan: Starter ab CHF 19/Mt.
                      </Link>
                    </span>
                  </div>
                )}
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
                        : (
                          <p style={{ margin: '0 0 2px', display: 'flex', justifyContent: 'center' }}>
                            {/* FIX 6: ✅/⚠️ → Icons */}
                            {result.imageAnalysis!.all_safe
                              ? <img src="/checkmark.png" alt="OK" width={22} height={22} />
                              : <img src="/warnung.png" alt="Warnung" width={22} height={22} />}
                          </p>
                        )
                      }
                      <span style={{ fontSize: 11, color: G.textMuted }}>{item.label}</span>
                    </div>
                  ))}
                </div>
                {result.imageAnalysis.ai_generated_count > 0 && (
                  <div style={{ padding: 10, background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: 10, fontSize: 12, color: '#92400e', marginBottom: 6 }}>
                    <strong style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <img src="/icon-recht.png" alt="Recht" width={14} height={14} style={{ display: 'inline-block', verticalAlign: 'middle' }} /> EU AI Act Art. 50:
                    </strong>{' '}
                    KI-generierte Bilder müssen als solche gekennzeichnet werden. {result.imageAnalysis.ai_generated_count} Bild(er) möglicherweise KI-generiert.
                  </div>
                )}
                {result.imageAnalysis.deepfake_count > 0 && (
                  <div style={{ padding: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, fontSize: 12, color: '#7f1d1d', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {/* FIX 6: 🚨 → fehler.png */}
                    <img src="/fehler.png" alt="Fehler" width={16} height={16} style={{ flexShrink: 0 }} />
                    <span><strong>Deepfake erkannt:</strong> {result.imageAnalysis.deepfake_count} Bild(er) weisen Deepfake-Merkmale auf – mögliche rechtliche Konsequenzen.</span>
                  </div>
                )}
              </div>
            )}

            {/* Aktions-Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <button onClick={() => { setResult(null); setUrl(''); }} style={{ display: 'flex', alignItems: 'center', gap: 6, background: G.bgLight, border: `1px solid ${G.border}`, color: G.text, padding: '10px 16px', borderRadius: 12, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                ← Neue Analyse
              </button>
              {/* FIX 6: 📄 → dokument.png */}
              <Link href={`/impressum-generator?domain=${encodeURIComponent(result.url)}&jurisdiction=${result.jurisdiction}`} style={{ display: 'flex', alignItems: 'center', gap: 6, background: G.bgLight, border: `1px solid ${G.border}`, color: G.text, padding: '10px 16px', borderRadius: 12, fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
                <img src="/dokument.png" alt="" width={14} height={14} /> Impressum generieren
              </Link>
              {/* FIX 6: 🍪 → ablage.png */}
              <Link href={`/cookie-banner-generator?domain=${encodeURIComponent(result.url)}&jurisdiction=${result.jurisdiction}&trackers=${result.findings.trackerCount > 0 ? 'google_analytics' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: 6, background: G.bgLight, border: `1px solid ${G.border}`, color: G.text, padding: '10px 16px', borderRadius: 12, fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
                <img src="/ablage.png" alt="" width={14} height={14} /> Cookie-Banner generieren
              </Link>
              <Link href="/checkout" style={{ display: 'flex', alignItems: 'center', gap: 6, background: G.green, color: '#fff', padding: '10px 16px', borderRadius: 12, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                <img src="/icon-sicherheit.png" alt="Datenschutz" width={14} height={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }} />Datenschutzerklärung – Starter ab CHF 19/Mt.
              </Link>
            </div>
          </div>
        )}
      </div>

    </PageWrapper>
  );
}
