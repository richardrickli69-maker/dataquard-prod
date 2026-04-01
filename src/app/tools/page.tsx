// src/app/tools/page.tsx
// Tools-Seite — 4-Säulen-Analyse, Scanner-Demo, Copy-Paste-Vergleich, Statistiken

import type { Metadata } from 'next';
import Link from 'next/link';
import { PageWrapper } from '../components/PageWrapper';

export const metadata: Metadata = {
  title: 'Digitale Lösungen | Dataquard',
  description: 'Dataquard prüft Ihre Website auf Compliance, Performance, Security und AI-Trust gleichzeitig. Der einzige 4-Säulen-Check der Schweiz für KMUs.',
  alternates: { canonical: 'https://www.dataquard.ch/tools' },
};

const G = {
  green: '#22c55e',
  greenBg: 'rgba(34,197,94,0.08)',
  greenBorder: 'rgba(34,197,94,0.25)',
  bg: '#f8f9fb',
  bgWhite: '#ffffff',
  bgLight: '#f1f2f6',
  bgDark: '#1a1a2e',
  border: '#e2e4ea',
  text: '#1a1a2e',
  textSec: '#555566',
  textMuted: '#888899',
  red: '#dc2626',
  violet: '#8B5CF6',
};

const ICON_MAP: Record<string, string> = {
  '⚖️': '/icon-recht.png',
  '🛡️': '/icon-schutz.png',
  '🤖': '/badge-ai-trust.svg',
  '✅': '/checkmark.png',
  '🔒': '/icon-sicherheit.png',
  '⚡': '/flug.png',
  '🔍': '/suche.png',
  '🚦': '/verkehr.png',
  '⚠️': '/warnung.png',
  '📊': '/diagramm.png',
  '📄': '/dokument.png',
  '🔄': '/icon-rueckfuehrung.png',
};

function IconEl({ ic, size = 24 }: { ic: string; size?: number }) {
  const src = ICON_MAP[ic];
  if (!src) return <span style={{ fontSize: size * 0.87 }}>{ic}</span>;
  return <img src={src} alt="" width={size} height={size} style={{ display: 'inline-block', verticalAlign: 'middle' }} />;
}

export default function ToolsPage() {
  return (
    <PageWrapper>
      <style>{`
        @media (max-width: 768px) {
          .tools-grid-2 { grid-template-columns: 1fr !important; }
          .tools-grid-4 { grid-template-columns: 1fr !important; }
          .tools-saeulen-grid { grid-template-columns: 1fr !important; }
          .table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .table-scroll table { min-width: 520px; }
        }
      `}</style>

      {/* ═══ HERO ═══ */}
      <section style={{ textAlign: 'center', padding: '56px 24px 40px', maxWidth: 760, margin: '0 auto' }}>
        <span style={{ display: 'inline-block', background: G.greenBg, border: `1px solid ${G.greenBorder}`, color: G.green, fontSize: 11, fontWeight: 700, padding: '5px 14px', borderRadius: 20, letterSpacing: 0.5, marginBottom: 20 }}>
          4-SÄULEN-ANALYSE
        </span>
        <h1 style={{ fontSize: 42, fontWeight: 900, lineHeight: 1.12, marginBottom: 16, letterSpacing: -1, color: G.text }}>
          Die einzige <span style={{ color: G.green }}>Vier-Säulen-Analyse</span> der Schweiz
        </h1>
        <p style={{ fontSize: 16, color: G.textSec, maxWidth: 580, margin: '0 auto 28px', lineHeight: 1.7 }}>
          Compliance, Performance, Security und AI-Trust — gleichzeitig geprüft, direkt behoben. Kein anderes Schweizer Tool bietet alle vier Säulen in einem Scan.
        </p>
        <Link href="/scanner" style={{ display: 'inline-block', padding: '14px 32px', background: G.green, color: '#fff', fontWeight: 800, borderRadius: 12, fontSize: 16, textDecoration: 'none', boxShadow: '0 4px 16px rgba(34,197,94,0.3)' }}>
          Jetzt kostenlos prüfen →
        </Link>
      </section>

      {/* ═══ DIGITALE LÖSUNGEN ÜBERBLICK ═══ */}
      <section style={{ background: '#0a0f1e', padding: '56px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{ color: '#888899', fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>Unsere digitalen Lösungen</span>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginTop: 8, color: '#ffffff' }}>Für jedes Compliance-Problem das richtige Werkzeug</h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', maxWidth: 580, margin: '12px auto 0', lineHeight: 1.7 }}>
              Dataquard ist kein einzelnes Tool — sondern ein komplettes System aus Scanner, Dokumenten-Generator und Monitoring. Alle Werkzeuge arbeiten zusammen und basieren auf unserer Vier-Säulen-Analyse.
            </p>
          </div>
          <div className="tools-saeulen-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
            {[
              { icon: '/icon-recht.png', title: 'Compliance', desc: 'Automatischer Website-Scan, Datenschutzerklärung, Impressum und Cookie-Banner — generiert in Minuten.' },
              { icon: '/icon-sicherheit.png', title: 'Sicherheit', desc: 'SSL-Überwachung, Impressum-Check und Cookie-Banner-Erkennung mit Alerts in Echtzeit.' },
              { icon: '/diagramm.png', title: 'Performance', desc: 'Tracker-Erkennung, Drittanbieter-Analyse und Handlungsempfehlungen für schnellere Ladezeiten.' },
              { icon: '/badge-ai-trust.svg', title: 'KI-Sicherheit', desc: 'KI-Bilderkennung, Deepfake-Check und automatische Kennzeichnung nach EU-Vorgaben.' },
            ].map(item => (
              <div key={item.title} style={{ background: '#1e293b', borderRadius: 14, padding: 24, border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ marginBottom: 14 }}><img src={item.icon} alt="" width={48} height={48} /></div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 1. VIER SÄULEN DETAIL ═══ */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '50px 24px', borderTop: `1px solid ${G.border}` }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <span style={{ color: G.green, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>Vier-Säulen-Analyse</span>
          <h2 style={{ fontSize: 30, fontWeight: 800, marginTop: 6 }}>Mehr als nur ein Compliance-Check</h2>
          <p style={{ color: G.textSec, fontSize: 14, marginTop: 6 }}>73% der Schweizer KMU-Websites sind nicht nDSG-konform. Und niemand prüft KI-Inhalte. Wir schon.</p>
        </div>
        <div className="tools-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
          {[
            { ic: '⚖️', tag: 'RECHTSSICHERHEIT', t: 'Compliance-Check', s: 'nDSG + DSGVO', d: 'Automatische Prüfung aller rechtlichen Anforderungen. Ampel-System zeigt sofort, wo Handlungsbedarf besteht.', ch: ['Datenschutzerklärung vorhanden', 'Cookie-Banner konform', 'Tracker erkannt & dokumentiert', 'Impressum vollständig'], accent: G.green },
            { ic: '⚡', tag: 'GESCHWINDIGKEIT', t: 'Performance-Scan', s: 'Speed & Technik', d: 'Ladezeit, externe Scripts, Google Fonts — alles was bremst und rechtlich riskant ist.', ch: ['Ladezeit < 3 Sekunden', 'Mobile-freundlich', 'SSL aktiv & gültig', 'Keine veralteten Scripts'], accent: G.green },
            { ic: '🛡️', tag: 'VERTRAUEN', t: 'Trust-Score', s: 'Sicherheit & Vertrauen', d: 'SSL, Impressum, Cookie-Handling, Datentransfer. Ihr Vertrauens-Profil auf einen Blick.', ch: ['Meta-Tags vollständig', 'Kontaktinfos sichtbar', 'Keine broken Links', 'HTTPS überall'], accent: G.green },
            { ic: '🤖', tag: 'KI-SICHERHEIT', t: 'AI-Trust Check', s: 'KI-Erkennung & Deepfakes', d: 'Automatische Erkennung von KI-generierten Bildern und Deepfakes. EU AI Act Art. 50 Konformität auf Knopfdruck.', ch: ['KI-generierte Bilder erkannt', 'Deepfake-Warnung', 'EU AI Act Art. 50 konform', 'Transparenz-Badge verfügbar'], accent: G.violet },
          ].map(c => (
            <div key={c.t} style={{ background: G.bgWhite, borderRadius: 16, padding: 26, border: `1px solid ${G.border}`, position: 'relative', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${c.accent}, transparent)` }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: c.accent, letterSpacing: 2 }}>{c.tag}</span>
              <div style={{ margin: '10px 0 6px' }}><IconEl ic={c.ic} size={48} /></div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: G.text }}>{c.t}</h3>
              <div style={{ fontSize: 14, color: c.accent, marginBottom: 12, fontWeight: 600 }}>{c.s}</div>
              <p style={{ fontSize: 14, color: G.textSec, lineHeight: 1.6, marginBottom: 14 }}>{c.d}</p>
              <div style={{ borderTop: `1px solid ${G.border}`, paddingTop: 10 }}>
                {c.ch.map(x => (
                  <div key={x} style={{ fontSize: 14, color: G.text, padding: '3px 0', display: 'flex', gap: 6, alignItems: 'center' }}>
                    <img src="/checkmark.png" alt="" width={16} height={16} style={{ flexShrink: 0 }} />{x}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ 2. SCAN-ERGEBNIS-DEMO ═══ */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '50px 24px', borderTop: `1px solid ${G.border}` }}>
        <div className="tools-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'center' }}>
          {/* Dark-Mode Mock-Ergebnis */}
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
                { l: 'Datenschutzerklärung', ic: '/fehler.png', extra: '', c: '#ef4444' },
                { l: 'Cookie-Banner', ic: '/warnung.png', extra: '', c: '#eab308' },
                { l: 'Google Analytics', ic: '/fehler.png', extra: '', c: '#ef4444' },
                { l: 'SSL-Zertifikat', ic: '/checkmark.png', extra: '', c: '#22c55e' },
                { l: 'KI-Bilder erkannt', ic: '/warnung.png', extra: '3/5', c: '#eab308' },
              ].map(r => (
                <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 12px', background: '#14142a', borderRadius: 8, marginBottom: 4, border: '1px solid #2a2a44' }}>
                  <span style={{ fontSize: 12, color: '#ccc' }}>{r.l}</span>
                  <span style={{ fontSize: 12, color: r.c, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <img src={r.ic} alt="" width={13} height={13} style={{ flexShrink: 0 }} />{r.extra}
                  </span>
                </div>
              ))}
              <div style={{ marginTop: 14, borderTop: '1px solid #2a2a44', paddingTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 10, color: '#666' }}>Compliance-Score</span>
                  <span style={{ fontSize: 16, fontWeight: 900, color: '#ef4444' }}>28<span style={{ fontSize: 10, color: '#666' }}>/100</span></span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: '#666' }}>AI-Trust Score</span>
                  <span style={{ fontSize: 16, fontWeight: 900, color: '#8B5CF6' }}>45<span style={{ fontSize: 10, color: '#666' }}>/100</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature-Erklärung */}
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 10, color: G.text }}>So sieht Ihr Ergebnis aus</h2>
            <p style={{ fontSize: 13, color: G.textSec, marginBottom: 20, lineHeight: 1.6 }}>In Sekunden sehen Sie, wo Ihre Website rechtliche Risiken hat – klar, verständlich, ohne Fachjargon.</p>
            {[
              { ic: '🔍', t: 'Alle Tracker werden erkannt', d: 'Google Analytics, Facebook Pixel, Hotjar – wir finden jeden Drittanbieter.' },
              { ic: '🚦', t: 'Ampel zeigt Handlungsbedarf', d: 'Rot, Gelb, Grün – auf einen Blick sehen Sie, was behoben werden muss.' },
              { ic: '⚡', t: 'Policy mit einem Klick generieren', d: 'Datenschutzerklärung erstellen, herunterladen, einbinden. Fertig.' },
              { ic: '🤖', t: 'KI-Bilder automatisch erkennen', d: 'Deepfakes und KI-generierte Inhalte auf Ihrer Website finden — EU AI Act konform.' },
            ].map(p => (
              <div key={p.t} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                <span style={{ flexShrink: 0 }}><IconEl ic={p.ic} size={22} /></span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2, color: G.text }}>{p.t}</div>
                  <div style={{ fontSize: 12, color: G.textSec, lineHeight: 1.5 }}>{p.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 3. COPY-PASTE VERGLEICH ═══ */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '50px 24px', borderTop: `1px solid ${G.border}` }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{ color: G.red, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>HÄUFIGSTER FEHLER</span>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginTop: 6, color: G.text }}>
            &laquo;Ich kopiere einfach eine Datenschutzerklärung von einer anderen Website.&raquo;
          </h2>
          <p style={{ color: G.textSec, fontSize: 14, marginTop: 8 }}>Das machen 90% der KMUs. Und genau deshalb sind 73% nicht rechtskonform.</p>
        </div>

        <div className="tools-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Links: Copy-Paste Risiken */}
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 16, padding: 26, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #ef4444, transparent)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <img src="/fehler.png" alt="Fehler" width={24} height={24} />
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#991b1b' }}>Copy-Paste Datenschutzerklärung</h3>
            </div>
            {[
              { ic: '⚠️', t: 'Falsche Drittanbieter', d: 'Enthält Google Analytics, obwohl Sie es nicht nutzen — aber Ihr Stripe fehlt komplett.' },
              { ic: '⚠️', t: 'Falsche Jurisdiktion', d: 'Kopiert von einer .de-Website? Dann fehlt der nDSG-Teil. Kopiert von .ch? Dann fehlt DSGVO für deutsche Kunden.' },
              { ic: '⚠️', t: 'Veraltet ab Tag 1', d: 'Sie fügen ein Kontaktformular hinzu, wechseln den Hoster — die kopierte Policy weiss nichts davon.' },
              { ic: '⚠️', t: 'Rechtlich angreifbar', d: 'Eine falsche DSE ist schlimmer als keine — sie beweist, dass Sie es versucht aber falsch gemacht haben.' },
            ].map(r => (
              <div key={r.t} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <span style={{ flexShrink: 0, marginTop: 2 }}><IconEl ic={r.ic} size={18} /></span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#991b1b', marginBottom: 2 }}>{r.t}</div>
                  <div style={{ fontSize: 12, color: '#7f1d1d', lineHeight: 1.6, opacity: 0.85 }}>{r.d}</div>
                </div>
              </div>
            ))}
            <div style={{ marginTop: 16, padding: '12px 14px', background: '#fee2e2', borderRadius: 10, fontSize: 12, color: '#991b1b', fontWeight: 600, textAlign: 'center' }}>
              <img src="/warnung.png" alt="" width={14} height={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 6 }} />
              Bussgeld: bis CHF 250&apos;000 (nDSG) · bis €20 Mio. oder 4% (DSGVO)
            </div>
          </div>

          {/* Rechts: Dataquard Lösung */}
          <div style={{ background: 'rgba(34,197,94,0.04)', border: `1px solid ${G.green}33`, borderRadius: 16, padding: 26, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${G.green}, transparent)` }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <IconEl ic="✅" size={24} />
              <h3 style={{ fontSize: 16, fontWeight: 800, color: G.green }}>Dataquard — automatisch korrekt</h3>
            </div>
            {[
              { ic: '🔍', t: 'Echte Drittanbieter erkannt', d: 'Dataquard scannt Ihre Website und erkennt automatisch welche Dienste Sie wirklich nutzen — von Google Analytics über Meta Pixel bis zu versteckten Tracking-Pixeln.' },
              { ic: '🚦', t: 'Richtige Jurisdiktion', d: 'Automatische Erkennung: nDSG, DSGVO oder beides — basierend auf Ihrer Domain, Ihrem Server und Ihren Besuchern.' },
              { ic: '🔄', t: 'Immer aktuell', d: 'Neuer Tracker? Neues Plugin? Dataquard erkennt Änderungen automatisch. Im Starter-Plan: monatliche Compliance-Reports.' },
              { ic: '🛡️', t: 'Rechtlich fundiert', d: 'Generiert nach nDSG Art. 19 und DSGVO Art. 13/14. Zusätzlich: EU AI Act Art. 50 Konformität für KI-generierte Bilder.' },
            ].map(r => (
              <div key={r.t} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <span style={{ flexShrink: 0, marginTop: 2 }}><IconEl ic={r.ic} size={18} /></span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: G.green, marginBottom: 2 }}>{r.t}</div>
                  <div style={{ fontSize: 12, color: G.textSec, lineHeight: 1.6 }}>{r.d}</div>
                </div>
              </div>
            ))}
            <div style={{ marginTop: 16, padding: '12px 14px', background: `${G.green}12`, borderRadius: 10, fontSize: 12, color: G.green, fontWeight: 600, textAlign: 'center' }}>
              ✓ Ab CHF 19.–/Mt. · Jährliche Abrechnung · Rechtssicher · In 3 Minuten fertig
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 4. STATISTIKEN ═══ */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '50px 24px', borderTop: `1px solid ${G.border}` }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <span style={{ color: G.green, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>Zahlen & Fakten</span>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginTop: 6, color: G.text }}>Die Lage in der Schweiz</h2>
        </div>
        <div className="tools-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, textAlign: 'center' }}>
          {[
            { ic: '📊', n: "4\u2019800+", l: 'Schweizer KMUs betroffen von nDSG-Pflichten' },
            { ic: '⚠️', n: '73%', l: 'der Schweizer Websites ohne korrekte DSE' },
            { ic: '🤖', n: '0%', l: 'der Schweizer Compliance-Tools prüfen KI-Inhalte' },
            { ic: '⚡', n: '3 min', l: 'bis Ihre Website vollständig geschützt ist' },
          ].map(s => (
            <div key={s.n} style={{ background: G.bgWhite, borderRadius: 14, padding: 24, border: `1px solid ${G.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ marginBottom: 6 }}><IconEl ic={s.ic} size={22} /></div>
              <div style={{ fontSize: 28, fontWeight: 900, color: G.green }}>{s.n}</div>
              <div style={{ fontSize: 12, color: G.textMuted, marginTop: 6, lineHeight: 1.5 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ BOTTOM CTA ═══ */}
      <section style={{ padding: '56px 24px', textAlign: 'center', borderTop: `1px solid ${G.border}` }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: G.text, marginBottom: 10 }}>
          Bereit? Scannen Sie Ihre Website — kostenlos.
        </h2>
        <p style={{ color: G.textSec, fontSize: 15, marginBottom: 28 }}>
          Ergebnis in 60 Sekunden. Ohne Anmeldung. Ohne Kreditkarte.
        </p>
        <Link href="/" style={{ display: 'inline-block', padding: '14px 36px', background: G.green, color: '#fff', fontWeight: 800, borderRadius: 12, fontSize: 16, textDecoration: 'none', boxShadow: '0 4px 16px rgba(34,197,94,0.3)' }}>
          Jetzt kostenlos prüfen →
        </Link>
      </section>

    </PageWrapper>
  );
}
