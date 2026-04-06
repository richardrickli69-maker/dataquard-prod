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

// src/app/page.tsx
// Homepage v3 — 6 Abschnitte (Hero, Trust, Ampel, 3 Schritte, Testimonials, Pricing) + Footer
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageWrapper } from './components/PageWrapper';

// Mapping: Emoji → Custom Icon Pfad (alle neuen Icons eingebunden)
const ICON_MAP: Record<string, string> = {
  '⚖️': '/icon-recht.png',
  '🛡️': '/icon-schutz.png',
  '🤖': '/badge-ai-trust.svg',
  '✅': '/checkmark.png',
  '🔒': '/icon-sicherheit.png',
  '🔄': '/icon-rueckfuehrung.png',
  '↩️': '/icon-rueckfuehrung.png',
  '💳': '/icon-zahlung.png',
  '⚡': '/flug.png',
  '🔍': '/suche.png',
  '🚦': '/verkehr.png',
  '⚠️': '/warnung.png',
  '📊': '/diagramm.png',
  '📄': '/dokument.png',
  '🎯': '/ziel.png',
  '🏠': '/haus.png',
  '⏱': '/uhr.png',
  '🟢': '/gruener-kreis.png',
  '🟡': '/gelber-kreis.png',
  '🔴': '/roter-kreis.png',
  '📋': '/ablage.png',
};

function IconEl({ ic, size = 24 }: { ic: string; size?: number }) {
  if (ic === '🇨🇭') {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
        <rect width="32" height="32" rx="4" fill="#FF0000"/>
        <rect x="8" y="13" width="16" height="6" fill="white"/>
        <rect x="13" y="8" width="6" height="16" fill="white"/>
      </svg>
    );
  }
  const src = ICON_MAP[ic];
  if (!src) return <span style={{ fontSize: size * 0.87 }}>{ic}</span>;
  return <img src={src} alt="" width={size} height={size} style={{ display: 'inline-block', verticalAlign: 'middle' }} />;
}

const G = {
  green: '#22c55e',
  greenBright: '#39FF14',
  greenBg: 'rgba(34,197,94,0.08)',
  greenBorder: 'rgba(34,197,94,0.25)',
  greenGlow: 'rgba(57,255,20,0.12)',
  bg: '#f8f9fb',
  bgWhite: '#ffffff',
  bgLight: '#f1f2f6',
  bgDark: '#1a1a2e',
  border: '#e2e4ea',
  borderLight: '#ecedf2',
  text: '#1a1a2e',
  textSec: '#555566',
  textMuted: '#888899',
  textLight: '#aaaabc',
  red: '#dc2626',
  redBg: 'rgba(220,38,38,0.06)',
  redBorder: 'rgba(220,38,38,0.15)',
  yellow: '#eab308',
  violet: '#8B5CF6',
  violetBg: 'rgba(139,92,246,0.08)',
  violetBorder: 'rgba(139,92,246,0.25)',
};

export default function HomePage() {
  const [heroUrl, setHeroUrl] = useState('');
  const [heroScanning, setHeroScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('');
  const [scanProgress, setScanProgress] = useState(0);
  const [serviceStatus, setServiceStatus] = useState<'loading' | 'ok' | 'degraded' | 'down'>('loading');
  const router = useRouter();

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

  const handleHeroScan = async () => {
    if (!heroUrl.trim()) return;
    let url = heroUrl.trim();
    if (!url.startsWith('http')) url = 'https://' + url;
    setHeroScanning(true);
    setScanProgress(0);
    const steps = [
      { msg: 'Prüfe SSL & HTTPS…', progress: 20 },
      { msg: 'Erkenne Drittanbieter & Tracker…', progress: 40 },
      { msg: 'Analysiere Impressum & Datenschutz…', progress: 60 },
      { msg: 'AI-Trust: Prüfe KI-Bilder & Deepfakes…', progress: 80 },
      { msg: 'Berechne 4-Säulen-Score…', progress: 90 },
    ];
    for (const step of steps) {
      setScanStatus(step.msg);
      setScanProgress(step.progress);
      await new Promise(r => setTimeout(r, 600));
    }
    setScanProgress(100);
    setScanStatus('Analyse abgeschlossen – leite weiter…');
    await new Promise(r => setTimeout(r, 400));
    setHeroScanning(false);
    router.push(`/scanner?url=${encodeURIComponent(url)}`);
  };

  return (
    <PageWrapper>
      {/* Mobile Responsive Styles */}
      <style>{`
        @media (max-width: 768px) {
          .grid-3col { grid-template-columns: 1fr !important; }
          .grid-2col { grid-template-columns: 1fr !important; }
          .grid-4col { grid-template-columns: 1fr !important; }
          .grid-trust { grid-template-columns: 1fr !important; }
          .grid-trust > div { border-right: none !important; border-bottom: 1px solid #e2e4ea; }
          .grid-trust > div:last-child { border-bottom: none; }
          .hero-input-row { flex-direction: column !important; }
          .hero-input-row button { border-radius: 0 0 12px 12px !important; }
          .footer-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* ═══ 1. HERO + SCANNER ═══ */}
      <section id="hero-scanner" style={{ position: 'relative', padding: '56px 24px 40px', textAlign: 'center', maxWidth: 860, margin: '0 auto' }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: G.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
          Der Schweizer Website-Check für KMU
        </p>
        <h1 lang="de" style={{ fontSize: 46, fontWeight: 900, lineHeight: 1.12, marginBottom: 18, letterSpacing: -1.5, color: G.text, wordBreak: 'break-word', overflowWrap: 'break-word', hyphens: 'auto' }}>
          DSE, <span style={{ hyphens: 'none' }}>Impressum</span> und Cookie-Banner:{' '}
          <span style={{ color: G.green }}>fertig in 3 Minuten.</span>
        </h1>
        <p style={{ fontSize: 16, color: G.textSec, maxWidth: 640, margin: '0 auto 28px', lineHeight: 1.7 }}>
          Eine URL eingeben — Dataquard prüft Ihre Website <strong style={{ color: G.text }}>sofort</strong> auf Compliance, Performance, Security und KI-Sicherheit. Schwachstellen werden erkannt, Dokumente automatisch erstellt: DSE (Datenschutzerklärung), Impressum und Cookie-Banner — rechtssicher nach nDSG und DSGVO. <strong style={{ color: G.text }}>Plus: Erkennung von KI-generierten Bildern und Deepfakes.</strong> So einfach war Website-Compliance noch nie. Einzigartig in der Schweiz.
        </p>
        {/* Status-Banner (nur bei Problemen) */}
        {serviceStatus === 'down' && (
          <div style={{ maxWidth: 520, margin: '0 auto 12px', padding: '10px 16px', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <img src="/fehler.png" alt="" width={14} height={14} style={{ flexShrink: 0 }} />
            <p style={{ color: G.red, fontSize: 13, fontWeight: 600, margin: 0 }}>
              Der Scanner ist momentan nicht verfügbar. Bitte versuchen Sie es später erneut.
            </p>
          </div>
        )}
        {serviceStatus === 'degraded' && (
          <div style={{ maxWidth: 520, margin: '0 auto 12px', padding: '10px 16px', background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.25)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src="/warnung.png" alt="" width={14} height={14} style={{ flexShrink: 0 }} />
            <p style={{ color: '#92400e', fontSize: 13, margin: 0 }}>
              Eingeschränkter Betrieb: KI-Bild-Analyse momentan nicht verfügbar. Compliance, Performance und Security werden normal geprüft.
            </p>
          </div>
        )}
        <div className="hero-input-row" style={{ maxWidth: 520, margin: '0 auto 12px', display: 'flex', background: G.bgWhite, borderRadius: 14, border: `2px solid ${serviceStatus === 'down' ? 'rgba(220,38,38,0.3)' : G.border}`, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <input id="hero-url-input" type="text" value={heroUrl} onChange={e => setHeroUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && !heroScanning && serviceStatus !== 'down' && handleHeroScan()} placeholder="https://ihre-website.ch" style={{ flex: 1, padding: '15px 18px', background: 'transparent', border: 'none', color: G.text, fontSize: 14, outline: 'none' }} disabled={serviceStatus === 'down'} />
          <button onClick={handleHeroScan} disabled={heroScanning || serviceStatus === 'down'} style={{ padding: '15px 24px', background: (heroScanning || serviceStatus === 'down') ? G.bgLight : G.green, color: (heroScanning || serviceStatus === 'down') ? G.textMuted : '#fff', fontWeight: 800, border: 'none', cursor: (heroScanning || serviceStatus === 'down') ? 'not-allowed' : 'pointer', fontSize: 13, opacity: serviceStatus === 'down' ? 0.5 : 1 }}>Jetzt kostenlos scannen →</button>
        </div>
        {heroScanning && (
          <div style={{ maxWidth: 520, margin: '14px auto 0' }}>
            <div style={{ background: G.bgWhite, border: `1px solid ${G.border}`, borderRadius: 12, padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 14, height: 14, border: `2px solid ${G.green}`, borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: 12, color: G.textSec }}>{scanStatus}</span>
              </div>
              <div style={{ width: '100%', background: G.bgLight, borderRadius: 8, height: 4 }}>
                <div style={{ background: G.green, height: 4, borderRadius: 8, transition: 'width 0.5s', width: `${scanProgress}%` }} />
              </div>
            </div>
          </div>
        )}
        {/* Trust-Badges */}
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 20, fontSize: 14, color: G.textMuted, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconEl ic="🇨🇭" size={24} /> Schweizer Produkt</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconEl ic="🔒" size={24} /> Daten in Zürich</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconEl ic="⚖️" size={24} /> nDSG/DSGVO</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconEl ic="🤖" size={24} /> KI-Bilderkennung</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconEl ic="⏱" size={24} /> Ergebnis in 60 Sek.</span>
          <Link href="/ki-sicherheit" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: G.textMuted, textDecoration: 'none' }}><img src="/checkmark.png" alt="" width={24} height={24} /> EU AI Act Art. 50 konform</Link>
        </div>
      </section>

      {/* ═══ 2. TRUST STRIP ═══ */}
      <div style={{ background: G.bgWhite, borderTop: `1px solid ${G.border}`, borderBottom: `1px solid ${G.border}` }}>
        <div className="grid-trust" style={{ maxWidth: 860, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', padding: '18px 0' }}>
          {[
            { i: '🇨🇭', t: 'Daten in der Schweiz', s: 'Sicher auf Schweizer Servern' },
            { i: '✅', t: 'EDÖB-konform', s: 'nDSG 2023 erfüllt' },
            { i: '🔒', t: 'Keine Kreditkarte', s: 'Kostenlos starten' },
            { i: '🤖', t: 'AI-Trust', s: 'KI-Bilder & Deepfake-Check' },
          ].map((b, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', padding: '8px 16px', borderRight: idx < 3 ? `1px solid ${G.border}` : 'none' }}>
              <IconEl ic={b.i} size={48} />
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: G.text }}>{b.t}</div>
                <div style={{ fontSize: 14, color: G.textMuted }}>{b.s}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ WAS WIR PRÜFEN ═══ */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '56px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <span style={{ color: G.green, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>4 Bereiche. 1 Scan. Volle Übersicht.</span>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginTop: 6, color: G.text }}>Was Dataquard auf Ihrer Website prüft</h2>
        </div>
        <div className="grid-4col" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
          {[
            { icon: '/icon-recht.png', title: 'Datenschutz & Compliance', desc: 'Ist Ihre Datenschutzerklärung auf dem Stand des nDSG 2023? Wir prüfen automatisch, ob alle Pflichtangaben vorhanden sind, erkennen Drittanbieter und generieren Ihre DSE, Impressum und Cookie-Banner.' },
            { icon: '/icon-sicherheit.png', title: 'Sicherheit & Vertrauen', desc: 'SSL-Zertifikat gültig? Impressum vollständig? Cookie-Banner vorhanden? Die Grundlagen, die Besucher und Suchmaschinen erwarten, auf einen Blick geprüft.' },
            { icon: '/badge-ai-trust.svg', title: 'KI-Bilder & Deepfakes', desc: 'Nutzen Sie Bilder von Midjourney, DALL-E oder ChatGPT? Die EU macht KI-Kennzeichnung zur Pflicht. Dataquard erkennt KI-generierte Bilder zuverlässig. Das kann kein anderes Schweizer Tool.' },
            { icon: '/diagramm.png', title: 'Performance & Technik', desc: 'Laden externe Dienste wie Google Fonts heimlich Daten Ihrer Besucher nach? Wir erkennen versteckte Datentransfers und technische Schwachstellen.' },
          ].map(item => (
            <div key={item.title} style={{ background: G.bgWhite, border: `1px solid ${G.border}`, borderRadius: 14, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ marginBottom: 14 }}><img src={item.icon} alt="" width={48} height={48} /></div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: G.text, marginBottom: 8 }}>{item.title}</h3>
              <p style={{ fontSize: 13, color: G.textSec, lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ 3. AMPEL-SYSTEM ═══ */}
      <section style={{ maxWidth: 700, margin: '0 auto', padding: '56px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <span style={{ color: G.green, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>Live-Vorschau</span>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginTop: 6 }}>Das Dataquard <span style={{ color: G.green }}>Ampel-System</span></h2>
          <p style={{ color: G.textSec, fontSize: 14, marginTop: 6 }}>So sieht Ihr Ergebnis aus, auf einen Blick verständlich</p>
        </div>
        <div style={{ maxWidth: 520, margin: '0 auto', background: G.bgWhite, borderRadius: 20, padding: '32px 28px', border: `1px solid ${G.border}`, boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
          <div style={{ textAlign: 'center', fontSize: 13, color: G.textMuted, marginBottom: 20 }}>beispiel-kmu.ch</div>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
            {[
              { label: 'Compliance', score: 'A', color: '#22c55e' },
              { label: 'Performance', score: 'B', color: '#eab308' },
              { label: 'Security', score: 'C', color: '#dc2626' },
              { label: 'AI-Trust', score: 'D', color: '#8B5CF6' },
            ].map(a => (
              <div key={a.label} style={{ textAlign: 'center' }}>
                <div style={{ width: 62, height: 62, borderRadius: '50%', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `3px solid ${a.color}`, background: `${a.color}12`, boxShadow: `0 0 20px ${a.color}20` }}>
                  <span style={{ fontSize: 22, fontWeight: 900, color: a.color }}>{a.score}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: G.text }}>{a.label}</div>
                <div style={{ width: 12, height: 12, borderRadius: '50%', margin: '6px auto 0', background: a.color, boxShadow: `0 0 8px ${a.color}` }} />
              </div>
            ))}
          </div>
          <div style={{ background: G.bgLight, borderRadius: 12, padding: '14px 16px', fontSize: 14, color: G.textSec, lineHeight: 1.8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}><img src="/gruener-kreis.png" alt="OK" width={14} height={14} /><strong style={{ color: '#22c55e' }}>Compliance:</strong>{' '}nDSG-konform, Datenschutzerklärung vorhanden</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}><img src="/gelber-kreis.png" alt="Warnung" width={14} height={14} /><strong style={{ color: '#eab308' }}>Performance:</strong>{' '}Google Fonts extern geladen (Datentransfer USA)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}><img src="/roter-kreis.png" alt="Fehler" width={14} height={14} /><strong style={{ color: '#dc2626' }}>Security:</strong>{' '}Kein Impressum gefunden, SSL läuft in 14 Tagen ab</div>
            {/* Violetter Punkt als AI-Trust Markenfarbe */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 14, height: 14, borderRadius: '50%', background: '#8B5CF6', flexShrink: 0, boxShadow: '0 0 6px #8B5CF660' }} /><strong style={{ color: '#8B5CF6' }}>AI-Trust:</strong>{' '}3 KI-generierte Bilder erkannt, keine Kennzeichnung vorhanden</div>
          </div>
        </div>
      </section>

      {/* ═══ KI-BILDER SPOTLIGHT ═══ */}
      <section style={{ background: '#0d1425', padding: '56px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{ color: G.green, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>Einzigartig in der Schweiz</span>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginTop: 8, color: '#ffffff' }}>KI-Bilder auf Ihrer Website? Wir erkennen sie.</h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', maxWidth: 580, margin: '12px auto 0', lineHeight: 1.7 }}>
              Immer mehr KMUs nutzen KI-generierte Bilder, oft ohne zu wissen, dass in der EU bereits eine Kennzeichnungspflicht gilt. Für Schweizer Unternehmen mit EU-Kunden wird das direkt relevant. Und auch ohne EU-Geschäft: Transparenz bei KI-Inhalten schafft Vertrauen.
            </p>
          </div>
          <div className="grid-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 28, marginBottom: 32 }}>
            {[
              { title: 'Zuverlässige Erkennung', desc: 'Bilder von Midjourney, DALL-E, Stable Diffusion und anderen KI-Tools werden mit über 90% Genauigkeit erkannt.' },
              { title: 'Schutz vor Deepfakes', desc: 'Manipulierte Fotos von echten Personen (etwa Team-Bilder oder Porträts) werden separat auf Deepfake-Indikatoren geprüft.' },
              { title: 'Automatische Kennzeichnung', desc: 'Im Professional-Plan erhalten Sie ein AI-Shield Badge für Ihre Website und automatische Updates Ihrer Datenschutzerklärung.' },
            ].map(item => (
              <div key={item.title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <img src="/checkmark.png" alt="" width={24} height={24} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#ffffff', marginBottom: 6 }}>{item.title}</h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', textAlign: 'center', marginBottom: 28 }}>
            Die Erkennungsrate variiert je nach Bildtyp und KI-Tool. Dataquard nutzt eine EU-konforme KI-Analyse-Technologie für die Bilderkennung.
          </p>
          <div style={{ textAlign: 'center', display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/scanner" style={{ display: 'inline-block', padding: '13px 28px', background: G.green, color: '#fff', fontWeight: 800, borderRadius: 12, fontSize: 14, textDecoration: 'none' }}>
              Ihre Website auf KI-Bilder prüfen →
            </Link>
            <Link href="/ki-sicherheit" style={{ display: 'inline-block', padding: '13px 24px', border: '2px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)', fontWeight: 600, borderRadius: 12, fontSize: 14, textDecoration: 'none' }}>
              Mehr über KI-Kennzeichnung erfahren →
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ 4. 3 SCHRITTE ═══ */}
      <section style={{ padding: '50px 24px', background: G.bgWhite, borderTop: `1px solid ${G.border}`, borderBottom: `1px solid ${G.border}` }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ color: G.green, fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>SO EINFACH GEHT&apos;S</span>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginTop: 6, marginBottom: 36 }}>In 3 Schritten zu Ihren Compliance-Dokumenten</h2>
          <div className="grid-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {[
              { n: '1', ic: '🔍', t: 'Website scannen', d: 'URL eingeben, kostenlos und ohne Anmeldung. Dataquard erkennt automatisch Drittanbieter, prüft Sicherheit und analysiert Ihre Bilder auf KI-Inhalte.' },
              { n: '2', ic: '📊', t: 'Report erhalten', d: 'Übersichtlicher Report über 4 Bereiche: Datenschutz, Sicherheit, Performance und KI-Bilder. Mit konkreten Handlungsempfehlungen.' },
              { n: '3', ic: '📄', t: 'Dokument herunterladen', d: 'Datenschutzerklärung, Impressum und Cookie-Banner, fertig generiert als PDF. In Minuten statt Stunden.' },
            ].map(s => (
              <div key={s.n} style={{ textAlign: 'center' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: G.greenBg, border: `2px solid ${G.green}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 18, fontWeight: 900, color: G.green }}>{s.n}</div>
                <div style={{ marginBottom: 8 }}><IconEl ic={s.ic} size={48} /></div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{s.t}</h3>
                <p style={{ fontSize: 14, color: G.textSec, lineHeight: 1.6 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 5. TESTIMONIALS ═══ */}
      <section style={{ maxWidth: 920, margin: '0 auto', padding: '50px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <span style={{ color: G.green, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>Kundenstimmen</span>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginTop: 6 }}>Was Schweizer KMUs sagen</h2>
        </div>
        <div className="grid-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          {[
            { init: 'MH', bg: '#22c55e', name: 'Markus H.', role: 'Schreinerei, Liestal', text: 'In 5 Minuten war alles erledigt. Hatte es seit Monaten aufgeschoben – hätte ich viel früher machen sollen.' },
            { init: 'SK', bg: '#eab308', name: 'Sandra K.', role: 'Physiotherapie, Basel', text: 'Der Ampel-Bericht hat sofort gezeigt wo das Problem liegt. Für jemanden ohne Rechtskenntnisse perfekt.' },
            { init: 'TW', bg: '#3b82f6', name: 'Thomas W.', role: 'Treubüro, Münchenbuchsee', text: 'Empfehle Dataquard aktiv unseren KMU-Kunden. Einfach, günstig, rechtskonform.' },
          ].map(t => (
            <div key={t.name} style={{ background: G.bgWhite, border: `1px solid ${G.border}`, borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: 32, color: G.green, opacity: 0.3, fontWeight: 900, marginBottom: 4 }}>&ldquo;</div>
              <p style={{ fontSize: 13, color: G.textSec, lineHeight: 1.7, fontStyle: 'italic', marginBottom: 16 }}>&ldquo;{t.text}&rdquo;</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${t.bg}18`, border: `2px solid ${t.bg}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: t.bg }}>{t.init}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: G.text }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: G.textMuted }}>{t.role}</div>
                </div>
              </div>
              <div style={{ color: '#eab308', fontSize: 12, marginTop: 10 }}>★★★★★</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ 6. PRICING ═══ */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '50px 24px', borderTop: `1px solid ${G.border}` }} id="preise">
        <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', marginBottom: 6 }}>Transparent. Fair. Schweizer Qualität.</h2>
        <p style={{ textAlign: 'center', color: G.textSec, fontSize: 13, marginBottom: 36 }}>Alle Preise in CHF · Jährliche Abrechnung · Jederzeit kündbar</p>
        <div className="grid-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {([
            {
              n: 'Free', sub: 'Check', badge: null as string | null,
              hl: false, best: false,
              p: 'CHF 0.–', pMt: null as string | null, pYear: null as string | null,
              pNote: 'immer kostenlos',
              d: 'Für den ersten Überblick',
              f: ['Website-Scan & Compliance-Bericht (Ampel-System)', 'Performance & Security-Check', 'Vorschau für 5 KI-Bilder'],
              m: ['nDSG-Datenschutzerklärung & Impressum', 'Monatlicher Compliance-Report'],
              c: 'Kostenlos scannen', l: '/scanner',
            },
            {
              n: 'Starter', sub: 'Basis', badge: 'EMPFOHLEN' as string | null,
              hl: true, best: false,
              p: 'CHF 19.–', pMt: '/Mt.' as string | null, pYear: '(CHF 228.– / Jahr)' as string | null,
              pNote: 'Jährliche Abrechnung, jederzeit kündbar',
              d: 'Für Schweizer KMUs',
              f: ['Website-Scan & Compliance-Bericht', 'nDSG-Datenschutzerklärung & Impressum', 'Cookie-Banner inklusive', 'Autom. Scan für 50 KI-Bilder', 'Monatlicher Compliance-Report per E-Mail', 'SSL-Ablauf Warnung'],
              m: [],
              c: 'Jetzt starten', l: '/checkout',
            },
            {
              n: 'Professional', sub: 'Sorglos', badge: 'BESTSELLER' as string | null,
              hl: false, best: true,
              p: 'CHF 39.–', pMt: '/Mt.' as string | null, pYear: '(CHF 468.– / Jahr)' as string | null,
              pNote: 'Jährliche Abrechnung, jederzeit kündbar',
              d: 'Unser Bestseller',
              f: ['Alles aus Starter', 'Bis zu 5 Domains & Full AI-Scan (250 Bilder)', 'Schutz vor Deepfakes & Alerts in Echtzeit', 'AI-Shield Badge (EU AI Act)', 'Wöchentlicher Compliance-Report per E-Mail', 'Autom. Update der DSE bei neuen KI-Inhalten', 'Alert bei neuen KI-Bildern ohne Kennzeichnung'],
              m: [],
              c: 'Professional wählen', l: '/checkout',
            },
          ] as Array<{ n: string; sub: string; badge: string | null; hl: boolean; best: boolean; p: string; pMt: string | null; pYear: string | null; pNote: string; d: string; f: string[]; m: string[]; c: string; l: string }>).map(pl => (
            <div key={pl.n} style={{ padding: 22, borderRadius: 14, border: (pl.hl || pl.best) ? `2px solid ${G.green}` : `1px solid ${G.border}`, background: G.bgWhite, position: 'relative', boxShadow: (pl.hl || pl.best) ? `0 4px 20px ${G.greenBg}` : '0 2px 8px rgba(0,0,0,0.03)' }}>
              {/* Badge: EMPFOHLEN oder BESTSELLER */}
              {pl.badge && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: G.green, color: '#fff', fontSize: 9, fontWeight: 800, padding: '3px 12px', borderRadius: 20, letterSpacing: 1, whiteSpace: 'nowrap' }}>{pl.badge}</div>
              )}
              {/* Plan-Name + Sub-Label */}
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>{pl.n}</h3>
              <div style={{ fontSize: 11, color: (pl.hl || pl.best) ? G.green : G.textMuted, marginBottom: 6 }}>{pl.sub}</div>
              {/* Preisanzeige: grosse Zahl + /Mt. inline + Jahrespreis darunter */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, margin: '8px 0 0' }}>
                <span style={{ fontSize: pl.pMt ? 30 : 24, fontWeight: 900, color: (pl.hl || pl.best) ? G.green : G.text }}>{pl.p}</span>
                {pl.pMt && <span style={{ fontSize: 13, color: G.textMuted }}>{pl.pMt}</span>}
              </div>
              {pl.pYear && <div style={{ fontSize: 12, color: G.textMuted, marginBottom: 2 }}>{pl.pYear}</div>}
              <div style={{ fontSize: 10, color: G.textMuted, marginBottom: 14 }}>{pl.pNote}</div>
              <div style={{ fontSize: 11, color: G.textSec, marginBottom: 14 }}>{pl.d}</div>
              {pl.f.map(f => <div key={f} style={{ fontSize: 14, color: G.text, padding: '2px 0', display: 'flex', alignItems: 'center', gap: 6 }}><img src="/checkmark.png" alt="Verfügbar" width={14} height={14} style={{ flexShrink: 0 }} />{f}</div>)}
              {pl.m.map(f => <div key={f} style={{ fontSize: 14, color: G.textMuted, padding: '2px 0', display: 'flex', alignItems: 'center', gap: 6 }}><img src="/fehler.png" alt="Nicht verfügbar" width={14} height={14} style={{ flexShrink: 0, opacity: 0.45 }} />{f}</div>)}
              <Link href={pl.l} style={{ display: 'block', textAlign: 'center', marginTop: 16, padding: '10px 0', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none', background: (pl.hl || pl.best) ? G.green : 'transparent', color: (pl.hl || pl.best) ? '#fff' : G.green, border: (pl.hl || pl.best) ? 'none' : `2px solid ${G.green}` }}>{pl.c}</Link>
            </div>
          ))}
        </div>
        <p style={{ textAlign: 'center', fontSize: 11, color: G.textMuted, marginTop: 16 }}>Alle Preise in CHF inkl. MwSt. · Jährliche Abrechnung · Jederzeit kündbar</p>
      </section>

      {/* ═══ BOTTOM CTA ═══ */}
      <section style={{ padding: '56px 24px', textAlign: 'center', borderTop: `1px solid ${G.border}` }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: G.text, marginBottom: 12 }}>
          Ist Ihre Website auf dem neuesten Stand?
        </h2>
        <p style={{ color: G.textSec, fontSize: 16, marginBottom: 28, maxWidth: 480, margin: '0 auto 28px' }}>
          Finden Sie es in 60 Sekunden heraus, kostenlos und ohne Anmeldung.
        </p>
        <button
          onClick={() => {
            document.getElementById('hero-scanner')?.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => document.getElementById('hero-url-input')?.focus(), 500);
          }}
          style={{ padding: '14px 36px', background: G.green, color: '#fff', fontWeight: 800, borderRadius: 12, border: 'none', fontSize: 16, cursor: 'pointer', boxShadow: `0 4px 16px rgba(34,197,94,0.3)`, transition: 'background 0.15s' }}
        >
          Jetzt kostenlos scannen →
        </button>
      </section>

    </PageWrapper>
  );
}
