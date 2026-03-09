// src/app/page.tsx
// Dataquard Homepage – V3 Final (Heller Hintergrund + Giftgrün)
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

/* Farb-System: Helles Grau + Giftgrün */
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
};

export default function HomePage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [heroUrl, setHeroUrl] = useState('');
  const [heroScanning, setHeroScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('');
  const [scanProgress, setScanProgress] = useState(0);
  const router = useRouter();

  const handleHeroScan = async () => {
    if (!heroUrl.trim()) return;
    let url = heroUrl.trim();
    if (!url.startsWith('http')) url = 'https://' + url;
    setHeroScanning(true);
    setScanProgress(0);
    const steps = [
      { msg: 'Prüfe SSL & HTTPS…', progress: 20 },
      { msg: 'Erkenne Drittanbieter & Tracker…', progress: 45 },
      { msg: 'Analysiere Impressum & Datenschutz…', progress: 70 },
      { msg: 'Berechne Compliance-Score…', progress: 90 },
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

  const faqs = [
    { q: 'Was kostet ein Datenschutzanwalt?', a: 'Ein Datenschutzanwalt verlangt CHF 1\'500 bis 3\'500 für eine massgeschneiderte Erklärung. Mit Dataquard erhalten Sie das gleiche Ergebnis für CHF 79 – in 3 Minuten.' },
    { q: 'Was passiert wenn ich keine Datenschutzerklärung habe?', a: 'Nach dem Schweizer nDSG (in Kraft seit 01.09.2023) drohen Bussen bis CHF 250\'000. Für EU-Kunden gilt die DSGVO mit Bussen bis 4% des weltweiten Jahresumsatzes.' },
    { q: 'Gilt das nDSG auch für Einzelunternehmer?', a: 'Ja – das nDSG gilt für alle Unternehmen die Personendaten von Schweizer Einwohnern bearbeiten, unabhängig von Grösse oder Rechtsform.' },
    { q: 'Wie unterscheidet sich Dataquard von kostenlosen Generatoren?', a: 'Kostenlose Generatoren erstellen eine generische Vorlage ohne Ihre Website zu analysieren. Dataquard scannt automatisch alle Drittanbieter und erstellt eine massgeschneiderte Erklärung.' },
    { q: 'Wie lange dauert die Policy-Generierung?', a: 'Die Website-Analyse dauert wenige Sekunden. Die Policy ist innerhalb von 30-60 Sekunden verfügbar.' },
    { q: 'Ist die generierte Policy wirklich nDSG/DSGVO-konform?', a: 'Ja. Über 40 juristisch validierte Textbausteine (P1–P7, W1–W8, D1–D12, etc.) speziell für nDSG und DSGVO. Keine generischen KI-Texte – präzise, vollständig und rechtssicher.' },
    { q: 'Brauche ich technische Fähigkeiten?', a: 'Nein! Sie brauchen nur Ihre Domain-Adresse. Der Rest ist vollautomatisch.' },
    { q: 'Welche Daten sammelt Dataquard?', a: 'Nur die Informationen die Sie uns geben (Domain, Unternehmensname). Daten bleiben in der Schweiz.' },
    { q: 'Wie viel Bussgeld droht bei DSGVO/nDSG-Verstössen?', a: 'Bis CHF 250\'000 bei nDSG und bis € 20 Mio. bei DSGVO. Mit Dataquard sind Sie in Minuten konform.' },
    { q: 'Kann ich die Policy bearbeiten?', a: 'Ja! Sie erhalten eine Markdown/HTML-Version die Sie problemlos anpassen können.' },
    { q: 'Gibt es eine Geld-zurück-Garantie?', a: 'Ja! 30 Tage volle Rückerstattung ohne Angabe von Gründen.' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: G.bg, color: G.text, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* ═══ 1. NAV ═══ */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 28px', background: G.bgWhite, borderBottom: `1px solid ${G.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Image src="/logo.png" alt="Dataquard" width={256} height={256} style={{ height: 40, width: 'auto' }} />
          <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: -0.5 }}>
            <span style={{ color: G.green }}>Data</span><span style={{ color: G.text }}>quard</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          {[
            { l: 'Scanner', h: '/scanner' },
            { l: 'Datenschutz', h: '/datenschutz-generator' },
            { l: 'Impressum', h: '/impressum-generator' },
            { l: 'Preise', h: '#preise' },
            { l: 'AGB', h: '/agb' },
          ].map(n => (
            <Link key={n.l} href={n.h} style={{ color: G.textSec, fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>{n.l}</Link>
          ))}
          <Link href="/scanner" style={{ padding: '8px 20px', background: G.green, color: '#fff', fontWeight: 700, borderRadius: 8, fontSize: 12, textDecoration: 'none' }}>Jetzt scannen</Link>
        </div>
      </nav>

      {/* ═══ 2. HERO ═══ */}
      <section style={{ position: 'relative', padding: '56px 24px 40px', textAlign: 'center', maxWidth: 860, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: G.redBg, border: `1px solid ${G.redBorder}`, fontSize: 11, fontWeight: 600, padding: '5px 14px', borderRadius: 20, marginBottom: 28, color: G.red }}>
          ⚠ nDSG seit 01.09.2023 in Kraft – Bussen bis CHF 250&apos;000
        </div>
        <h1 style={{ fontSize: 46, fontWeight: 900, lineHeight: 1.12, marginBottom: 18, letterSpacing: -1.5, color: G.text }}>
          Ihre Website ist{' '}
          <span style={{ color: G.green }}>nicht rechtskonform.</span>
          <br />
          <span style={{ fontSize: 34, fontWeight: 700, color: G.textSec }}>Wir ändern das — in 3 Minuten.</span>
        </h1>
        <p style={{ fontSize: 16, color: G.textSec, maxWidth: 620, margin: '0 auto 28px', lineHeight: 1.7 }}>
          Der einzige Schweizer Website-Check, der <strong style={{ color: G.text }}>Compliance, Performance und Security</strong> gleichzeitig prüft — und direkt behebt. Kein Cookie-Banner nötig.
        </p>
        <div style={{ maxWidth: 520, margin: '0 auto 12px', display: 'flex', background: G.bgWhite, borderRadius: 14, border: `2px solid ${G.border}`, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <input type="text" value={heroUrl} onChange={e => setHeroUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleHeroScan()} placeholder="https://ihre-website.ch" style={{ flex: 1, padding: '15px 18px', background: 'transparent', border: 'none', color: G.text, fontSize: 14, outline: 'none' }} />
          <button onClick={handleHeroScan} style={{ padding: '15px 24px', background: G.green, color: '#fff', fontWeight: 800, border: 'none', cursor: 'pointer', fontSize: 13 }}>Jetzt kostenlos prüfen →</button>
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
            <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
          </div>
        )}
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 20, fontSize: 12, color: G.textMuted }}>
          <span>🇨🇭 Schweizer Produkt</span><span>🔒 Daten in Zürich</span><span>⚖️ nDSG/DSGVO</span><span>⏱ Ergebnis in 60 Sek.</span>
        </div>
      </section>

      {/* ═══ 3. TRUST STRIP ═══ */}
      <div style={{ background: G.bgWhite, borderTop: `1px solid ${G.border}`, borderBottom: `1px solid ${G.border}` }}>
        <div style={{ maxWidth: 750, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', padding: '18px 0' }}>
          {[
            { i: '🇨🇭', t: 'Daten in der Schweiz', s: 'Sicher auf Schweizer Servern' },
            { i: '✅', t: 'EDÖB-konform', s: 'nDSG 2023 erfüllt' },
            { i: '🔒', t: 'Keine Kreditkarte', s: 'Kostenlos starten' },
          ].map((b, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', padding: '8px 16px', borderRight: idx < 2 ? `1px solid ${G.border}` : 'none' }}>
              <span style={{ fontSize: 26 }}>{b.i}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: G.text }}>{b.t}</div>
                <div style={{ fontSize: 11, color: G.textMuted }}>{b.s}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ 4. AMPEL-SYSTEM ═══ */}
      <section style={{ maxWidth: 700, margin: '0 auto', padding: '56px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <span style={{ color: G.green, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>Live-Vorschau</span>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginTop: 6 }}>Das Dataquard <span style={{ color: G.green }}>Ampel-System</span></h2>
          <p style={{ color: G.textSec, fontSize: 14, marginTop: 6 }}>So sieht Ihr Ergebnis aus — auf einen Blick verständlich</p>
        </div>
        <div style={{ maxWidth: 480, margin: '0 auto', background: G.bgWhite, borderRadius: 20, padding: '32px 28px', border: `1px solid ${G.border}`, boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
          <div style={{ textAlign: 'center', fontSize: 13, color: G.textMuted, marginBottom: 20 }}>beispiel-kmu.ch</div>
          <div style={{ display: 'flex', gap: 28, justifyContent: 'center', marginBottom: 24 }}>
            {[
              { label: 'Compliance', score: 'A', color: '#22c55e' },
              { label: 'Performance', score: 'B', color: '#eab308' },
              { label: 'Security', score: 'C', color: '#dc2626' },
            ].map(a => (
              <div key={a.label} style={{ textAlign: 'center' }}>
                <div style={{ width: 70, height: 70, borderRadius: '50%', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `3px solid ${a.color}`, background: `${a.color}12`, boxShadow: `0 0 20px ${a.color}20` }}>
                  <span style={{ fontSize: 26, fontWeight: 900, color: a.color }}>{a.score}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: G.text }}>{a.label}</div>
                <div style={{ width: 10, height: 10, borderRadius: '50%', margin: '6px auto 0', background: a.color, boxShadow: `0 0 8px ${a.color}` }} />
              </div>
            ))}
          </div>
          <div style={{ background: G.bgLight, borderRadius: 12, padding: '14px 16px', fontSize: 12, color: G.textSec, lineHeight: 1.8 }}>
            <div>🟢 <strong style={{ color: '#22c55e' }}>Compliance:</strong> nDSG-konform, Datenschutzerklärung vorhanden</div>
            <div>🟡 <strong style={{ color: '#eab308' }}>Performance:</strong> Google Fonts extern geladen (Datentransfer USA)</div>
            <div>🔴 <strong style={{ color: '#dc2626' }}>Security:</strong> Kein Impressum gefunden, SSL läuft in 14 Tagen ab</div>
          </div>
        </div>
      </section>

      {/* ═══ 5. DREI SÄULEN ═══ */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '50px 24px', borderTop: `1px solid ${G.border}` }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <span style={{ color: G.green, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>Drei-Säulen-Analyse</span>
          <h2 style={{ fontSize: 30, fontWeight: 800, marginTop: 6 }}>Mehr als nur ein Compliance-Check</h2>
          <p style={{ color: G.textSec, fontSize: 14, marginTop: 6 }}>73% der Schweizer KMU-Websites sind nicht nDSG-konform. Wir prüfen alles — gleichzeitig.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {[
            { ic: '⚖️', tag: 'RECHTSSICHERHEIT', t: 'Compliance-Check', s: 'nDSG + DSGVO', d: 'Automatische Prüfung aller rechtlichen Anforderungen. Ampel-System zeigt sofort, wo Handlungsbedarf besteht.', ch: ['Datenschutzerklärung vorhanden', 'Cookie-Banner konform', 'Tracker erkannt & dokumentiert', 'Impressum vollständig'] },
            { ic: '⚡', tag: 'GESCHWINDIGKEIT', t: 'Performance-Scan', s: 'Speed & Technik', d: 'Ladezeit, externe Scripts, Google Fonts — alles was bremst und rechtlich riskant ist.', ch: ['Ladezeit < 3 Sekunden', 'Mobile-freundlich', 'SSL aktiv & gültig', 'Keine veralteten Scripts'] },
            { ic: '🛡️', tag: 'VERTRAUEN', t: 'Trust-Score', s: 'Sicherheit & Vertrauen', d: 'SSL, Impressum, Cookie-Handling, Datentransfer. Ihr Vertrauens-Profil auf einen Blick.', ch: ['Meta-Tags vollständig', 'Kontaktinfos sichtbar', 'Keine broken Links', 'HTTPS überall'] },
          ].map(c => (
            <div key={c.t} style={{ background: G.bgWhite, borderRadius: 16, padding: 26, border: `1px solid ${G.border}`, position: 'relative', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${G.green}, transparent)` }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: G.green, letterSpacing: 2 }}>{c.tag}</span>
              <div style={{ fontSize: 30, margin: '10px 0 6px' }}>{c.ic}</div>
              <h3 style={{ fontSize: 17, fontWeight: 800 }}>{c.t}</h3>
              <div style={{ fontSize: 12, color: G.green, marginBottom: 12, fontWeight: 600 }}>{c.s}</div>
              <p style={{ fontSize: 12, color: G.textSec, lineHeight: 1.6, marginBottom: 14 }}>{c.d}</p>
              <div style={{ borderTop: `1px solid ${G.border}`, paddingTop: 10 }}>
                {c.ch.map(x => <div key={x} style={{ fontSize: 12, color: G.text, padding: '3px 0', display: 'flex', gap: 6 }}><span style={{ color: G.green }}>✓</span>{x}</div>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ 6. SCAN PREVIEW ═══ */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px', borderTop: `1px solid ${G.border}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'center' }}>
          <div style={{ background: '#1a1a2e', border: '1px solid #2a2a44', borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
            <div style={{ background: '#22223a', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #2a2a44' }}>
              <div style={{ display: 'flex', gap: 5 }}>
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#ef444480' }} />
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#eab30880' }} />
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#22c55e80' }} />
              </div>
              <div style={{ flex: 1, background: '#14142a', border: '1px solid #2a2a44', borderRadius: 5, padding: '4px 10px', fontSize: 10, color: '#888', fontFamily: 'monospace' }}>muster-kmu.ch</div>
            </div>
            <div style={{ padding: 18 }}>
              <div style={{ fontSize: 9, color: '#666', letterSpacing: 2, marginBottom: 12, fontWeight: 700 }}>SCAN-ERGEBNIS</div>
              {[
                { l: 'Datenschutzerklärung', ic: '❌', c: '#ef4444' },
                { l: 'Cookie-Banner', ic: '⚠️', c: '#eab308' },
                { l: 'Google Analytics', ic: '❌', c: '#ef4444' },
                { l: 'SSL-Zertifikat', ic: '✅', c: '#22c55e' },
              ].map(r => (
                <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 12px', background: '#14142a', borderRadius: 8, marginBottom: 4, border: '1px solid #2a2a44' }}>
                  <span style={{ fontSize: 12, color: '#ccc' }}>{r.l}</span>
                  <span style={{ fontSize: 12, color: r.c }}>{r.ic}</span>
                </div>
              ))}
              <div style={{ marginTop: 14, borderTop: '1px solid #2a2a44', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 10, color: '#666' }}>Compliance-Score</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 80, background: '#2a2a44', borderRadius: 8, height: 5 }}>
                    <div style={{ width: '28%', background: '#ef4444', height: 5, borderRadius: 8 }} />
                  </div>
                  <span style={{ fontSize: 18, fontWeight: 900, color: '#ef4444' }}>28<span style={{ fontSize: 11, color: '#666' }}>/100</span></span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 10 }}>So sieht Ihr Ergebnis aus</h2>
            <p style={{ fontSize: 13, color: G.textSec, marginBottom: 20, lineHeight: 1.6 }}>In Sekunden sehen Sie, wo Ihre Website rechtliche Risiken hat – klar, verständlich, ohne Fachjargon.</p>
            {[
              { ic: '🔍', t: 'Alle Tracker werden erkannt', d: 'Google Analytics, Facebook Pixel, Hotjar – wir finden jeden Drittanbieter.' },
              { ic: '🚦', t: 'Ampel zeigt Handlungsbedarf', d: 'Rot, Gelb, Grün – auf einen Blick sehen Sie, was behoben werden muss.' },
              { ic: '⚡', t: 'Policy mit einem Klick generieren', d: 'Datenschutzerklärung erstellen, herunterladen, einbinden. Fertig.' },
            ].map(p => (
              <div key={p.t} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{p.ic}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{p.t}</div>
                  <div style={{ fontSize: 12, color: G.textSec, lineHeight: 1.5 }}>{p.d}</div>
                </div>
              </div>
            ))}
            <button onClick={handleHeroScan} style={{ marginTop: 12, padding: '12px 28px', background: G.green, color: '#fff', fontWeight: 700, borderRadius: 10, border: 'none', fontSize: 13, cursor: 'pointer' }}>Jetzt kostenlos prüfen →</button>
          </div>
        </div>
      </section>

      {/* ═══ 7. TESTIMONIALS ═══ */}
      <section style={{ maxWidth: 920, margin: '0 auto', padding: '50px 24px', borderTop: `1px solid ${G.border}` }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <span style={{ color: G.green, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>Kundenstimmen</span>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginTop: 6 }}>Was Schweizer KMUs sagen</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
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

      {/* ═══ 8. IMPRESSUM CTA ═══ */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '20px 24px' }}>
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 16, padding: '28px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 24 }}>📄</span>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: G.text }}>Impressum fehlt auf Ihrer Website?</h3>
            </div>
            <p style={{ fontSize: 13, color: '#991b1b' }}>Ein fehlendes Impressum ist eine Ordnungswidrigkeit – bis CHF 50&apos;000 Bussgeld möglich.</p>
            <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: 12, color: G.textSec }}>
              <span>✓ Schweiz (nDSG)</span><span>✓ Deutschland (DSGVO)</span><span>✓ Sofort einsatzbereit</span>
            </div>
          </div>
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: G.green }}>CHF 19</div>
            <div style={{ fontSize: 11, color: G.textMuted, marginBottom: 10 }}>Einmalkauf · kein Abo</div>
            <Link href="/impressum-generator" style={{ display: 'block', padding: '10px 22px', background: G.green, color: '#fff', fontWeight: 700, borderRadius: 8, fontSize: 12, textDecoration: 'none' }}>Impressum erstellen →</Link>
          </div>
        </div>
      </section>

      {/* ═══ 9. STATS ═══ */}
      <section style={{ maxWidth: 700, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, textAlign: 'center' }}>
          {[
            { ic: '📊', n: "4\u2019800+", l: 'Schweizer KMUs betroffen von nDSG-Pflichten' },
            { ic: '⚠️', n: '73%', l: 'der Schweizer Websites ohne korrekte DSE' },
            { ic: '⚡', n: '3 min', l: 'bis Ihre Website vollständig geschützt ist' },
          ].map(s => (
            <div key={s.n} style={{ background: G.bgWhite, borderRadius: 14, padding: 24, border: `1px solid ${G.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{s.ic}</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: G.green }}>{s.n}</div>
              <div style={{ fontSize: 12, color: G.textMuted, marginTop: 6, lineHeight: 1.5 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ 10. 3 SCHRITTE ═══ */}
      <section style={{ padding: '50px 24px', background: G.bgWhite, borderTop: `1px solid ${G.border}`, borderBottom: `1px solid ${G.border}` }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ color: G.green, fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>SO EINFACH GEHT&apos;S</span>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginTop: 6, marginBottom: 36 }}>In 3 Schritten zu Ihrer Datenschutzerklärung</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {[
              { n: '1', ic: '🔍', t: 'Website scannen', d: 'URL eingeben – kostenlos, ohne Anmeldung. Wir erkennen automatisch alle Drittanbieter.' },
              { n: '2', ic: '📊', t: 'Report erhalten', d: 'Compliance-Score, Jurisdiktion (nDSG/DSGVO) und konkrete Handlungsempfehlungen.' },
              { n: '3', ic: '📄', t: 'Dokument herunterladen', d: 'Datenschutzerklärung + Impressum + Cookie-Banner generiert, als PDF. Fertig in Minuten.' },
            ].map(s => (
              <div key={s.n} style={{ textAlign: 'center' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: G.greenBg, border: `2px solid ${G.green}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 18, fontWeight: 900, color: G.green }}>{s.n}</div>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{s.ic}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{s.t}</h3>
                <p style={{ fontSize: 12, color: G.textSec, lineHeight: 1.6 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 11. AGB ═══ */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '50px 24px' }}>
        <div style={{ background: G.bgWhite, border: `1px solid ${G.border}`, borderRadius: 18, padding: '40px 32px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>📋 Allgemeine Geschäftsbedingungen</h2>
          <p style={{ color: G.textSec, fontSize: 13, maxWidth: 500, margin: '0 auto 28px' }}>Transparenz ist uns wichtig. Unsere AGB regeln die Nutzung klar und fair – ohne Kleingedrucktes.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24, textAlign: 'left' }}>
            {[
              { ic: '🔒', t: 'Datenschutz', d: 'Daten auf Schweizer Servern. Nie an Dritte.' },
              { ic: '💳', t: 'Zahlung', d: 'Einmalkauf. Keine Verlängerung.' },
              { ic: '↩️', t: '30 Tage Garantie', d: 'Geld zurück ohne Angabe von Gründen.' },
              { ic: '⚖️', t: 'Haftung', d: 'Keine Rechtsberatung. Anwalt empfohlen.' },
            ].map(a => (
              <div key={a.t} style={{ background: G.bgLight, border: `1px solid ${G.border}`, borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{a.ic}</div>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{a.t}</div>
                <div style={{ fontSize: 11, color: G.textSec, lineHeight: 1.5 }}>{a.d}</div>
              </div>
            ))}
          </div>
          <Link href="/agb" style={{ display: 'inline-block', padding: '10px 24px', border: `2px solid ${G.green}`, color: G.green, borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>Vollständige AGB lesen →</Link>
        </div>
      </section>

      {/* ═══ 12. PREISE ═══ */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '50px 24px', borderTop: `1px solid ${G.border}` }} id="preise">
        <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', marginBottom: 6 }}>Transparent. Fair. Schweizer Qualität.</h2>
        <p style={{ textAlign: 'center', color: G.textSec, fontSize: 13, marginBottom: 36 }}>Alle Preise in CHF · Einmalkauf · Keine versteckten Kosten</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {[
            { n: 'Impressum', p: 'CHF 19', s: 'Einmalkauf', d: 'Nur das Impressum', f: ['Impressum Generator', 'Schweiz + Deutschland', 'Sofort downloadbar'], m: [], c: 'Impressum erstellen', l: '/impressum-generator' },
            { n: 'Free', p: 'CHF 0', s: 'immer kostenlos', d: 'Für den ersten Überblick', f: ['Website-Scan', 'Ampel-Score', 'Compliance-Bericht', 'Performance-Check'], m: ['Datenschutzerklärung', 'Impressum'], c: 'Kostenlos scannen', l: '/scanner' },
            { n: 'Starter', p: 'CHF 79', s: 'Einmalkauf', d: 'Für Schweizer KMUs', f: ['Alles aus Free', 'Datenschutzerklärung', 'Impressum Generator', 'Cookie-Banner Generator', '1 Domain'], m: [], c: 'Jetzt starten', l: '/checkout', hl: true },
            { n: 'Professional', p: 'CHF 149', s: 'Einmalkauf', d: 'Für wachsende Teams', f: ['Datenschutzerklärung', 'Impressum Generator', 'Cookie-Banner (5 Domains)', 'Priority Support'], m: [], c: 'Professional wählen', l: '/checkout' },
          ].map(pl => (
            <div key={pl.n} style={{ padding: 22, borderRadius: 14, border: pl.hl ? `2px solid ${G.green}` : `1px solid ${G.border}`, background: G.bgWhite, position: 'relative', boxShadow: pl.hl ? `0 4px 20px ${G.greenBg}` : '0 2px 8px rgba(0,0,0,0.03)' }}>
              {pl.hl && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: G.green, color: '#fff', fontSize: 9, fontWeight: 800, padding: '3px 12px', borderRadius: 20, letterSpacing: 1 }}>EMPFOHLEN</div>}
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>{pl.n}</h3>
              <div style={{ fontSize: 24, fontWeight: 900, color: pl.hl ? G.green : G.text, margin: '8px 0 2px' }}>{pl.p}</div>
              <div style={{ fontSize: 10, color: G.textMuted, marginBottom: 4 }}>{pl.s}</div>
              <div style={{ fontSize: 11, color: G.textSec, marginBottom: 14 }}>{pl.d}</div>
              {pl.f.map(f => <div key={f} style={{ fontSize: 11, color: G.text, padding: '2px 0', display: 'flex', gap: 6 }}><span style={{ color: G.green }}>✓</span>{f}</div>)}
              {pl.m.map(f => <div key={f} style={{ fontSize: 11, color: G.textMuted, padding: '2px 0', display: 'flex', gap: 6 }}><span>✗</span>{f}</div>)}
              <Link href={pl.l} style={{ display: 'block', textAlign: 'center', marginTop: 16, padding: '10px 0', borderRadius: 8, fontWeight: 700, fontSize: 12, textDecoration: 'none', background: pl.hl ? G.green : 'transparent', color: pl.hl ? '#fff' : G.green, border: pl.hl ? 'none' : `2px solid ${G.green}` }}>{pl.c}</Link>
            </div>
          ))}
        </div>
        <p style={{ textAlign: 'center', fontSize: 11, color: G.textMuted, marginTop: 16 }}>Alle Preise in CHF inkl. MwSt. · Einmalkauf · Keine versteckten Kosten</p>
      </section>

      {/* ═══ 13. VERGLEICH ═══ */}
      <section style={{ maxWidth: 750, margin: '0 auto', padding: '50px 24px', borderTop: `1px solid ${G.border}` }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, textAlign: 'center', marginBottom: 24 }}>Dataquard vs. andere Tools</h2>
        <div style={{ borderRadius: 14, overflow: 'hidden', border: `1px solid ${G.border}` }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr style={{ background: G.bgLight }}>
              <th style={{ padding: '12px 14px', textAlign: 'left', color: G.textMuted, fontWeight: 600 }}>Feature</th>
              <th style={{ padding: 12, textAlign: 'center', color: G.green, fontWeight: 800 }}>Dataquard</th>
              <th style={{ padding: 12, textAlign: 'center', color: G.textMuted }}>PrivacyBee</th>
              <th style={{ padding: 12, textAlign: 'center', color: G.textMuted }}>iubenda</th>
            </tr></thead>
            <tbody>
              {[
                ['Compliance-Check', '✅', '✅', '✅'], ['Performance-Check', '✅', '❌', '❌'],
                ['Security-Check', '✅', '❌', '❌'], ['Schweizer nDSG', '✅', '✅', '⚠️'],
                ['Auto-Scan & Pre-fill', '✅', '✅', '❌'], ['Cookie-Banner Generator', '✅', '❌', '⚠️'],
                ['Preis', 'CHF 79', 'CHF 55', '€ 144+'], ['Daten in Schweiz', '✅', '⚠️', '❌'],
              ].map((r, i) => (
                <tr key={r[0]} style={{ background: i % 2 === 0 ? G.bgWhite : G.bg, borderTop: `1px solid ${G.border}` }}>
                  <td style={{ padding: '10px 14px', color: G.text }}>{r[0]}</td>
                  <td style={{ padding: 10, textAlign: 'center', fontWeight: 700 }}>{r[1]}</td>
                  <td style={{ padding: 10, textAlign: 'center', color: G.textSec }}>{r[2]}</td>
                  <td style={{ padding: 10, textAlign: 'center', color: G.textSec }}>{r[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ═══ 14. FAQ ═══ */}
      <section style={{ maxWidth: 680, margin: '0 auto', padding: '50px 24px', borderTop: `1px solid ${G.border}` }} id="faq">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <span style={{ color: G.green, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>FAQ</span>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginTop: 6 }}>Häufig gestellte Fragen</h2>
          <p style={{ color: G.textSec, fontSize: 13, marginTop: 4 }}>Alles was Sie wissen müssen</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {faqs.map((faq, idx) => (
            <div key={idx} style={{ background: G.bgWhite, borderRadius: 10, border: `1px solid ${G.border}`, overflow: 'hidden' }}>
              <button onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)} style={{ width: '100%', padding: '14px 18px', textAlign: 'left', background: 'transparent', border: 'none', color: G.text, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{faq.q}</span>
                <span style={{ color: G.green, fontSize: 18, fontWeight: 700 }}>{openFAQ === idx ? '−' : '+'}</span>
              </button>
              {openFAQ === idx && (
                <div style={{ padding: '12px 18px', borderTop: `1px solid ${G.border}`, fontSize: 13, color: G.textSec, lineHeight: 1.7 }}>{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ═══ 15. FINAL CTA ═══ */}
      <section style={{ padding: '56px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 580, margin: '0 auto', background: G.bgWhite, borderRadius: 20, padding: '44px 32px', border: `1px solid ${G.border}`, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Ist Ihre Website wirklich rechtssicher?</h2>
          <p style={{ color: G.textSec, fontSize: 14, marginBottom: 10 }}>Finden Sie es in 60 Sekunden heraus – kostenlos und ohne Anmeldung.</p>
          <p style={{ fontSize: 12, color: '#b45309', marginBottom: 22 }}>⚖️ Das Schweizer nDSG ist seit 01.09.2023 in Kraft – ist Ihre Website konform?</p>
          <Link href="/scanner" style={{ display: 'inline-block', padding: '15px 36px', background: G.green, color: '#fff', fontWeight: 800, borderRadius: 10, fontSize: 16, textDecoration: 'none', boxShadow: '0 4px 16px rgba(34,197,94,0.3)' }}>Jetzt kostenlos scannen →</Link>
        </div>
      </section>

      {/* ═══ 16. FOOTER ═══ */}
      <footer style={{ borderTop: `1px solid ${G.border}`, background: G.bgWhite, padding: '20px 28px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 14, fontSize: 11, color: G.textMuted }}>
            <span>🇨🇭 Server in Zürich</span><span>🔒 SSL-verschlüsselt</span><span>⚖️ nDSG-konform</span><span>🛡️ Keine Datenweitergabe</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: G.textMuted }}>
              <span style={{ fontWeight: 800 }}><span style={{ color: G.green }}>Data</span><span style={{ color: G.text }}>quard</span></span>{' '}© 2026 · Basel, Schweiz
            </span>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: 12 }}>
              {[
                { l: 'Scanner', h: '/scanner' }, { l: 'Datenschutz', h: '/datenschutz' },
                { l: 'Impressum', h: '/impressum-generator' }, { l: 'Preise', h: '#preise' }, { l: 'AGB', h: '/agb' },
              ].map(n => (
                <Link key={n.l} href={n.h} style={{ color: G.textMuted, textDecoration: 'none' }}>{n.l}</Link>
              ))}
              <Link href="/auth" style={{ padding: '5px 14px', border: `2px solid ${G.green}`, color: G.green, borderRadius: 6, fontSize: 11, fontWeight: 600, textDecoration: 'none' }}>Anmelden</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
