// src/app/ki-sicherheit/page.tsx
// AI-Trust Seite — EU AI Act Art. 50, KI-Bild-Erkennung, Deepfake-Check, AI-Shield Badge

import type { Metadata } from 'next';
import Link from 'next/link';
import { PageWrapper } from '../components/PageWrapper';

export const metadata: Metadata = {
  title: 'KI-Bilder erkennen & Deepfakes stoppen | Dataquard KI-Sicherheit',
  description: 'Dataquard prüft Ihre Website zuverlässig auf KI-generierte Bilder und Deepfakes. Für Schweizer KMUs mit und ohne EU-Kunden. Kostenloser Scan.',
  alternates: { canonical: 'https://www.dataquard.ch/ki-sicherheit' },
};

const G = {
  green: '#22c55e',
  greenBg: 'rgba(34,197,94,0.08)',
  greenBorder: 'rgba(34,197,94,0.25)',
  bg: '#f8f9fb',
  bgWhite: '#ffffff',
  bgLight: '#f1f2f6',
  border: '#e2e4ea',
  text: '#1a1a2e',
  textSec: '#555566',
  textMuted: '#888899',
  violet: '#8B5CF6',
  violetBg: 'rgba(139,92,246,0.08)',
  violetBorder: 'rgba(139,92,246,0.25)',
};

// Icon-Mapping: Emoji → Custom PNG aus /public/
const ICON_MAP: Record<string, string> = {
  '🤖': '/badge-ai-trust.svg',
  '⚖️': '/icon-recht.png',
  '🛡️': '/icon-schutz.png',
  '🎭': '/icon-schutz.png',
  '✅': '/checkmark.png',
  '🔒': '/icon-sicherheit.png',
  '🔄': '/icon-rueckfuehrung.png',
  '💳': '/icon-zahlung.png',
};

function IconEl({ ic, size = 24 }: { ic: string; size?: number }) {
  const src = ICON_MAP[ic];
  if (!src) return <span style={{ fontSize: size * 0.87 }}>{ic}</span>;
  return <img src={src} alt="" width={size} height={size} style={{ display: 'inline-block', verticalAlign: 'middle' }} />;
}

export default function KiSicherheitPage() {
  return (
    <PageWrapper>
      <style>{`
        @media (max-width: 768px) {
          .ai-grid-3 { grid-template-columns: 1fr !important; }
          .ai-grid-2 { grid-template-columns: 1fr !important; }
          .ai-grid-4 { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ═══ HERO ═══ */}
      <section style={{ textAlign: 'center', padding: '56px 24px 48px', maxWidth: 760, margin: '0 auto' }}>
        <span style={{ display: 'inline-block', background: G.violetBg, border: `1px solid ${G.violetBorder}`, color: G.violet, fontSize: 11, fontWeight: 700, padding: '5px 14px', borderRadius: 20, letterSpacing: 0.5, marginBottom: 20 }}>
          Dataquard AI-Trust
        </span>
        <h1 style={{ fontSize: 40, fontWeight: 900, lineHeight: 1.12, marginBottom: 16, letterSpacing: -1, color: G.text }}>
          KI-Bilder erkennen.<br />
          <span style={{ color: G.violet }}>Deepfakes stoppen.</span><br />
          EU AI Act konform.
        </h1>
        <p style={{ fontSize: 16, color: G.textSec, maxWidth: 580, margin: '0 auto 28px', lineHeight: 1.7 }}>
          Dataquard ist das einzige Schweizer Tool das Ihre Website automatisch auf KI-generierte Inhalte prüft — und Sie bei der gesetzlichen Kennzeichnung unterstützt.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/scanner" style={{ display: 'inline-block', padding: '14px 32px', background: G.violet, color: '#fff', fontWeight: 800, borderRadius: 12, fontSize: 15, textDecoration: 'none', boxShadow: `0 4px 16px ${G.violet}40` }}>
            Website auf KI-Bilder prüfen →
          </Link>
          <Link href="/ki-transparenz" style={{ display: 'inline-block', padding: '14px 28px', border: `2px solid ${G.border}`, color: G.textSec, fontWeight: 600, borderRadius: 12, fontSize: 15, textDecoration: 'none' }}>
            KI-Transparenz ansehen
          </Link>
        </div>
      </section>

      {/* ═══ 4-SÄULEN-ANALYSE ═══ */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '50px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <span style={{ color: G.green, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>Unser Ansatz</span>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginTop: 6, color: G.text }}>Die Vier-Säulen-Analyse für Ihre Compliance</h2>
          <p style={{ color: G.textSec, fontSize: 15, marginTop: 12, maxWidth: 660, margin: '12px auto 0', lineHeight: 1.7 }}>
            Vergessen Sie komplexe Insellösungen. Unsere Vier-Säulen-Analyse ist ein methodischer Ansatz, der Datenschutz und Informationssicherheit in eine klare Struktur bringt. Wir kombinieren digitale Präzision mit fachlicher Expertise, um Ihr Unternehmen rechtssicher und zukunftsfest aufzustellen.
          </p>
          <p style={{ color: G.textSec, fontSize: 15, marginTop: 12, maxWidth: 660, margin: '12px auto 0', lineHeight: 1.7 }}>
            Statt mühsamer Handarbeit nutzen wir intelligente Assistenten und automatisierte Prüfverfahren, die Sie Schritt für Schritt durch die regulatorischen Anforderungen führen — effizient, verständlich und ohne technisches Vorwissen.
          </p>
        </div>
        <div className="ai-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
          {[
            { icon: '/icon-recht.png', title: 'Compliance', desc: 'nDSG und DSGVO Konformität — automatisch geprüft, lückenlos dokumentiert.' },
            { icon: '/icon-sicherheit.png', title: 'Sicherheit', desc: 'SSL, Impressum, Cookie-Banner — die Vertrauensbasis für Ihre Besucher.' },
            { icon: '/diagramm.png', title: 'Performance', desc: 'Versteckte Datentransfers und technische Schwachstellen aufdecken.' },
            { icon: '/badge-ai-trust.svg', title: 'KI-Sicherheit', desc: 'KI-Bilder und Deepfakes erkennen — einzigartig in der Schweiz.' },
          ].map(item => (
            <div key={item.title} style={{ background: G.bgWhite, border: `1px solid ${G.border}`, borderRadius: 14, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ marginBottom: 14 }}><img src={item.icon} alt="" width={48} height={48} /></div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: G.text, marginBottom: 8 }}>{item.title}</h3>
              <p style={{ fontSize: 13, color: G.textSec, lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ WAS IST AI-TRUST? ═══ */}
      <section style={{ background: G.bgWhite, borderTop: `1px solid ${G.border}`, borderBottom: `1px solid ${G.border}` }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '50px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span style={{ color: G.violet, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>Rechtlicher Hintergrund</span>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginTop: 6, color: G.text }}>Warum KI-Bilder auf Websites ein Thema sind</h2>
            <p style={{ color: G.textSec, fontSize: 14, marginTop: 8, maxWidth: 600, margin: '8px auto 0', lineHeight: 1.7 }}>
              Die EU hat mit dem AI Act das weltweit erste KI-Gesetz verabschiedet. Ab August 2026 gilt: KI-generierte Bilder, Texte und Videos müssen als solche erkennbar gemacht werden (Art. 50). Für Schweizer KMUs mit Kunden in der EU wird das direkt relevant. Und auch ohne EU-Geschäft gilt: Transparenz bei KI-Inhalten stärkt das Vertrauen Ihrer Kunden und Besucher.
            </p>
          </div>

          <div className="ai-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {[
              { icon: '🤖', title: 'KI-generierte Bilder', desc: 'Tools wie Midjourney, DALL-E oder Stable Diffusion erzeugen Bilder die täuschend echt wirken. Viele KMUs nutzen diese ohne zu wissen, dass eine Kennzeichnungspflicht besteht.' },
              { icon: '🎭', title: 'Deepfakes', desc: 'KI-manipulierte Fotos und Videos die echte Personen zeigen. Für Team-Fotos, CEO-Bilder oder Produktpräsentationen besonders riskant — und rechtlich heikel.' },
              { icon: '⚖️', title: 'Die Lösung', desc: 'Dataquard prüft Ihre Website auf beide Risiken und ergänzt bei Bedarf die korrekte Klausel in Ihrer Datenschutzerklärung — automatisch im Professional-Plan oder manuell im Starter.' },
            ].map(item => (
              <div key={item.title} style={{ background: G.bg, borderRadius: 14, padding: 24, border: `1px solid ${G.border}` }}>
                <div style={{ marginBottom: 12 }}><IconEl ic={item.icon} size={48} /></div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: G.text, marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: 13, color: G.textSec, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WIE FUNKTIONIERT'S ═══ */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '50px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <span style={{ color: G.green, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>Technologie</span>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginTop: 6, color: G.text }}>So erkennt Dataquard KI-Bilder</h2>
        </div>
        <div className="ai-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {[
            { n: '1', title: 'Scan startet', desc: 'Dataquard lädt alle Bilder von Ihrer Website. Die Analyse läuft vollständig automatisch — kein manueller Aufwand.' },
            { n: '2', title: 'KI-Analyse', desc: 'Jedes Bild wird mit einer EU-konformen KI-Analyse auf KI-Merkmale und Deepfake-Indikatoren geprüft — mit einer Erkennungsrate von über 90% bei gängigen KI-Tools wie Midjourney, DALL-E und Stable Diffusion.' },
            { n: '3', title: 'Ergebnis & Klausel', desc: 'Erkannte KI-Bilder werden im Bericht markiert. Ihre Datenschutzerklärung kann automatisch mit der passenden Transparenzklausel ergänzt werden.' },
          ].map(s => (
            <div key={s.n} style={{ textAlign: 'center', padding: 20 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: G.violetBg, border: `2px solid ${G.violet}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 18, fontWeight: 900, color: G.violet }}>{s.n}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: G.text, marginBottom: 8 }}>{s.title}</h3>
              <p style={{ fontSize: 13, color: G.textSec, lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ AI-SHIELD BADGE ═══ */}
      <section style={{ background: G.bgWhite, borderTop: `1px solid ${G.border}`, borderBottom: `1px solid ${G.border}` }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '50px 24px' }}>
          <div className="ai-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
            <div>
              <span style={{ display: 'inline-block', background: G.violetBg, border: `1px solid ${G.violetBorder}`, color: G.violet, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, marginBottom: 16 }}>
                AI-SHIELD BADGE
              </span>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: G.text, marginBottom: 12 }}>
                Zeigen Sie Ihren Kunden:<br />
                <span style={{ color: G.violet }}>KI-konform geprüft.</span>
              </h2>
              <p style={{ fontSize: 14, color: G.textSec, lineHeight: 1.7, marginBottom: 20 }}>
                Mit dem AI-Shield Badge von Dataquard zeigen Sie aktiv, dass Ihre Website regelmässig auf KI-Bilder geprüft wird und EU AI Act Art. 50 konform ist. Nur für Professional-Plan Kunden.
              </p>
              {[
                'Verifizierbarer Badge für Ihre Website',
                'Automatische Ablaufdatum-Anzeige',
                'QR-Code für Besucher zur Verifikation',
                'Nur im Professional-Plan verfügbar',
              ].map(f => (
                <div key={f} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  <img src="/checkmark.png" alt="" width={16} height={16} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: G.text }}>{f}</span>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'inline-block', background: `linear-gradient(135deg, ${G.violetBg}, rgba(139,92,246,0.15))`, border: `2px solid ${G.violetBorder}`, borderRadius: 20, padding: '32px 40px' }}>
                <img src="/badge-ai-trust.svg" alt="AI-Trust Badge" width={120} height={120} style={{ display: 'block', margin: '0 auto 16px' }} />
                <div style={{ fontSize: 14, fontWeight: 700, color: G.violet }}>AI-Trust Verified</div>
                <div style={{ fontSize: 12, color: G.textMuted, marginTop: 4 }}>by Dataquard</div>
                <div style={{ fontSize: 10, color: G.textMuted, marginTop: 8, padding: '6px 12px', background: G.bgWhite, borderRadius: 8 }}>
                  EU AI Act Art. 50 konform
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PLAN-VERGLEICH (AI-TRUST FOKUS) ═══ */}
      <section style={{ maxWidth: 820, margin: '0 auto', padding: '50px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{ color: G.green, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>Pläne</span>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginTop: 6, color: G.text }}>AI-Trust in jedem Plan</h2>
        </div>
        <div className="ai-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {[
            {
              name: 'Free',
              price: 'CHF 0.–',
              badge: null as string | null,
              highlight: false,
              features: ['5 KI-Bilder Vorschau', 'Basis-Report'],
              missing: ['Deepfake-Check', 'Vollständiger KI-Scan', 'AI-Shield Badge', 'EU AI Act Klausel in DSE'],
            },
            {
              name: 'Starter',
              price: 'CHF 19.–/Mt.',
              badge: 'EMPFOHLEN' as string | null,
              highlight: true,
              features: ['50 KI-Bilder pro Jahr', 'EU AI Act Art. 50 Klausel in DSE', 'Monatlicher AI-Trust Bericht', 'Warnung bei neuen KI-Bildern'],
              missing: ['Deepfake-Check', 'AI-Shield Badge'],
            },
            {
              name: 'Professional',
              price: 'CHF 39.–/Mt.',
              badge: 'VOLLSTÄNDIG' as string | null,
              highlight: false,
              features: ['250 KI-Bilder pro Jahr', 'Deepfake-Check & Erkennung', 'AI-Shield Badge (verifizierbar)', 'Alerts in Echtzeit bei neuen KI-Inhalten', 'Auto-Update der DSE bei KI-Änderungen', 'Wöchentlicher AI-Trust Bericht'],
              missing: [],
            },
          ].map(pl => (
            <div key={pl.name} style={{ padding: 20, borderRadius: 14, border: pl.highlight ? `2px solid ${G.green}` : `1px solid ${G.border}`, background: G.bgWhite, position: 'relative', boxShadow: pl.highlight ? `0 4px 20px ${G.greenBg}` : '0 2px 8px rgba(0,0,0,0.03)' }}>
              {pl.badge && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: pl.highlight ? G.green : G.violet, color: '#fff', fontSize: 9, fontWeight: 800, padding: '3px 12px', borderRadius: 20, letterSpacing: 1, whiteSpace: 'nowrap' }}>{pl.badge}</div>
              )}
              <h3 style={{ fontSize: 16, fontWeight: 700, color: G.text }}>{pl.name}</h3>
              <div style={{ fontSize: 13, fontWeight: 800, color: pl.highlight ? G.green : G.textSec, marginBottom: 14, marginTop: 4 }}>{pl.price}</div>
              {pl.features.map(f => (
                <div key={f} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                  <img src="/checkmark.png" alt="" width={14} height={14} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: G.text }}>{f}</span>
                </div>
              ))}
              {pl.missing.map(f => (
                <div key={f} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                  <img src="/fehler.png" alt="" width={14} height={14} style={{ flexShrink: 0, opacity: 0.4 }} />
                  <span style={{ fontSize: 13, color: G.textMuted }}>{f}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link href="/preise" style={{ color: G.green, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            Vollständige Preisübersicht ansehen →
          </Link>
        </div>
      </section>

      {/* ═══ BOTTOM CTA ═══ */}
      <section style={{ padding: '56px 24px', textAlign: 'center', borderTop: `1px solid ${G.border}` }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: G.text, marginBottom: 10 }}>
          Sind KI-Bilder auf Ihrer Website?
        </h2>
        <p style={{ color: G.textSec, fontSize: 15, marginBottom: 28, maxWidth: 480, margin: '0 auto 28px' }}>
          Finden Sie es in 60 Sekunden heraus — kostenlos, ohne Anmeldung.
        </p>
        <Link href="/scanner" style={{ display: 'inline-block', padding: '14px 36px', background: G.violet, color: '#fff', fontWeight: 800, borderRadius: 12, fontSize: 16, textDecoration: 'none', boxShadow: `0 4px 16px ${G.violet}40` }}>
          Website jetzt auf KI-Bilder prüfen →
        </Link>
      </section>

    </PageWrapper>
  );
}
