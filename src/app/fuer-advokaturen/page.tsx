// src/app/fuer-advokaturen/page.tsx
// Landingpage fuer Anwaltskanzleien — Advokatur-Partnerschaft CHF 149/Mt.

import type { Metadata } from 'next';
import { PageWrapper } from '../components/PageWrapper';
import AgencyCheckoutButton from '../fuer-agenturen/AgencyCheckoutButton';

export const metadata: Metadata = {
  title: 'Dataquard für Advokaturen — Automatisierte Website-Compliance für Ihre Mandanten',
  description: 'Prüfen Sie Mandanten-Websites in 30 Sekunden auf nDSG, DSGVO und EU AI Act — unter Ihrem eigenen Branding. CHF 149.–/Mt., monatlich kündbar.',
  alternates: { canonical: 'https://www.dataquard.ch/fuer-advokaturen' },
};

// Farben konsistent mit /fuer-agenturen
const G = {
  green: '#22c55e',
  greenHover: '#16a34a',
  greenBg: 'rgba(34,197,94,0.10)',
  greenBorder: 'rgba(34,197,94,0.30)',
  navy: '#1a1a2e',
  navyLight: '#232340',
  navyCard: 'rgba(255,255,255,0.06)',
  navyBorder: 'rgba(255,255,255,0.12)',
  white: '#ffffff',
  gray: 'rgba(255,255,255,0.72)',
  grayMuted: 'rgba(255,255,255,0.45)',
};

// Scan-Säulen (Section 3)
const SCAN_ITEMS = [
  {
    icon: '/icon-recht.png',
    title: 'Compliance',
    desc: 'nDSG/DSGVO-Konformität, Datenschutzerklärung, Impressum, Cookie-Banner',
  },
  {
    icon: '/suche.png',
    title: 'Tracker',
    desc: '100+ Drittanbieter-Fingerprints inkl. versteckte Pixel automatisch erkannt',
  },
  {
    icon: '/icon-sicherheit.png',
    title: 'Security',
    desc: 'SSL-Zertifikat, Sicherheits-Header, kritische Schwachstellen',
  },
  {
    icon: '/badge-ai-trust.svg',
    title: 'KI-Sicherheit',
    desc: 'KI-generierte Bilder und Deepfakes erkennen — EU AI Act Art. 50',
  },
  {
    icon: '/diagramm.png',
    title: 'Performance',
    desc: 'Ladezeiten, Core Web Vitals, PageSpeed-Analyse',
  },
];

// White-Label-Vorteile (Section 4)
const WHITE_LABEL_ITEMS = [
  { icon: '/dokument.png', text: 'PDF-Reports mit Kanzlei-Logo' },
  { icon: '/diagramm.png', text: 'Eigene Farbgebung im Report' },
  { icon: '/suche.png', text: 'Kein Hinweis auf Dataquard gegenüber Ihren Mandanten' },
  { icon: '/icon-recht.png', text: 'Direkt als Beratungsleistung verrechenbar' },
];

// FAQ (Section 7)
const FAQ_ITEMS = [
  {
    q: 'Sehen meine Mandanten den Namen Dataquard?',
    a: 'Nein. Reports tragen Ihr Kanzlei-Logo und Ihre Farben. Dataquard bleibt im Hintergrund.',
  },
  {
    q: 'Kann ich die Scan-Ergebnisse als Beratungsleistung verrechnen?',
    a: 'Ja. Der Report ist Ihre Arbeitsgrundlage. Sie entscheiden, welche Empfehlungen Sie daraus ableiten und wie Sie diese fakturieren.',
  },
  {
    q: 'Was passiert, wenn ein Mandant mehr als 30 Domains hat?',
    a: 'Kontaktieren Sie uns für ein individuelles Angebot unter info@dataquard.ch.',
  },
  {
    q: 'Ersetzt Dataquard meine Rechtsberatung?',
    a: 'Nein. Dataquard ist ein technisches Analyse-Tool. Die rechtliche Bewertung und Beratung bleibt Ihre Kernkompetenz.',
  },
];

export default function FuerAdvokaturen() {
  return (
    <PageWrapper>
      <style>{`
        @media (max-width: 900px) {
          .adv-scan-grid   { grid-template-columns: 1fr 1fr !important; }
          .adv-wl-grid     { grid-template-columns: 1fr !important; }
          .adv-cta-btns    { flex-direction: column !important; align-items: stretch !important; }
        }
        @media (max-width: 768px) {
          .adv-wl-outer    { grid-template-columns: 1fr !important; }
          .adv-calc-grid   { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 560px) {
          .adv-scan-grid   { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ═══ SECTION 1: HERO ═══ */}
      <section style={{
        background: `linear-gradient(135deg, ${G.navy} 0%, #0f0f23 100%)`,
        padding: '80px 24px 72px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Dekorativer Hintergrund-Kreis */}
        <div style={{
          position: 'absolute', top: '-120px', right: '-120px',
          width: '480px', height: '480px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '780px', margin: '0 auto', position: 'relative' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-block',
            background: G.greenBg,
            border: `1px solid ${G.greenBorder}`,
            borderRadius: '20px',
            padding: '6px 16px',
            fontSize: '12px',
            fontWeight: 700,
            color: G.green,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '24px',
          }}>
            Für Anwaltskanzleien &amp; Advokaturen
          </div>

          <h1 style={{
            fontSize: 'clamp(28px, 5vw, 46px)',
            fontWeight: 900,
            color: G.white,
            lineHeight: 1.15,
            margin: '0 0 20px',
            fontFamily: '"DM Serif Display", Georgia, serif',
          }}>
            Automatisierte Website-Compliance{' '}
            <span style={{ color: G.green }}>für Ihre Mandanten</span>
          </h1>

          <p style={{
            fontSize: '18px',
            color: G.gray,
            lineHeight: 1.6,
            margin: '0 0 40px',
            maxWidth: '620px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            Prüfen Sie Mandanten-Websites in 30 Sekunden auf nDSG, DSGVO und EU AI Act —
            unter Ihrem eigenen Branding.
          </p>

          {/* CTA */}
          <div style={{ maxWidth: '320px', margin: '0 auto' }}>
            <AgencyCheckoutButton
              plan="advokatur"
              label="Jetzt starten — CHF 149.–/Mt."
              highlight
              green={G.green}
              white={G.white}
            />
          </div>

          <p style={{ color: G.grayMuted, fontSize: '13px', marginTop: '14px' }}>
            Monatlich kündbar · Keine Mindestlaufzeit · Daten in der Schweiz
          </p>
        </div>
      </section>

      {/* ═══ SECTION 2: DAS PROBLEM ═══ */}
      <section style={{ background: '#f8f9fb', padding: '72px 24px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{
              display: 'inline-block',
              background: 'rgba(220,38,38,0.08)',
              border: '1px solid rgba(220,38,38,0.25)',
              borderRadius: '20px',
              padding: '5px 14px',
              fontSize: '11px',
              fontWeight: 700,
              color: '#dc2626',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}>
              Das Problem heute
            </div>
            <h2 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 800, color: G.navy, margin: 0 }}>
              Advokaturen prüfen Mandanten-Websites manuell
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
            {[
              { icon: '/suche.png', title: 'Tracker suchen', desc: 'Mühsam, zeitaufwändig — ohne Tool nicht vollständig möglich.' },
              { icon: '/dokument.png', title: 'DSE prüfen', desc: 'Datenschutzerklärung gegen Website abgleichen: fehleranfällig und langsam.' },
              { icon: '/badge-ai-trust.svg', title: 'KI erkennen', desc: 'KI-generierte Inhalte erkennen: ohne technisches Tool schlicht unmöglich.' },
              { icon: '/warnung.png', title: 'Stunden pro Mandant', desc: 'Ergebnis: mehrere Stunden Aufwand pro Website, oft trotzdem unvollständig.' },
            ].map((item) => (
              <div key={item.title} style={{
                background: '#ffffff',
                border: '1px solid #e2e4ea',
                borderRadius: '12px',
                padding: '24px',
              }}>
                <img src={item.icon} alt="" width={28} height={28} style={{ marginBottom: '12px', opacity: 0.7 }} />
                <div style={{ fontWeight: 700, fontSize: '15px', color: G.navy, marginBottom: '8px' }}>{item.title}</div>
                <div style={{ fontSize: '14px', color: '#555566', lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 3: DIE LÖSUNG ═══ */}
      <section style={{ background: `linear-gradient(135deg, ${G.navy} 0%, #0f0f23 100%)`, padding: '72px 24px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{
              display: 'inline-block',
              background: G.greenBg,
              border: `1px solid ${G.greenBorder}`,
              borderRadius: '20px',
              padding: '5px 14px',
              fontSize: '11px',
              fontWeight: 700,
              color: G.green,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}>
              Die Lösung
            </div>
            <h2 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 800, color: G.white, margin: '0 0 12px' }}>
              Was Dataquard in 30 Sekunden automatisch prüft
            </h2>
            <p style={{ fontSize: '16px', color: G.gray, margin: 0 }}>
              4-Säulen-Analyse — gleichzeitig, ohne manuellen Aufwand.
            </p>
          </div>

          <div className="adv-scan-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {SCAN_ITEMS.map((item) => (
              <div key={item.title} style={{
                background: G.navyCard,
                border: `1px solid ${G.navyBorder}`,
                borderRadius: '12px',
                padding: '24px',
              }}>
                <img src={item.icon} alt="" width={28} height={28} style={{ marginBottom: '12px' }} />
                <div style={{ fontWeight: 700, fontSize: '15px', color: G.green, marginBottom: '8px' }}>{item.title}</div>
                <div style={{ fontSize: '14px', color: G.gray, lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 4: WHITE-LABEL ═══ */}
      <section style={{ background: '#f8f9fb', padding: '72px 24px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div className="adv-wl-outer" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
            <div>
              <div style={{
                display: 'inline-block',
                background: G.greenBg,
                border: `1px solid ${G.greenBorder}`,
                borderRadius: '20px',
                padding: '5px 14px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#16a34a',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '16px',
              }}>
                White-Label
              </div>
              <h2 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 800, color: G.navy, margin: '0 0 16px' }}>
                Ihr Name, Ihre Farben, Ihr Branding
              </h2>
              <p style={{ fontSize: '16px', color: '#555566', lineHeight: 1.6, marginBottom: '32px' }}>
                Kein Hinweis auf Dataquard gegenüber Ihren Mandanten.
                Die Reports erscheinen unter Ihrem Kanzlei-Logo — professionell und diskret.
              </p>
              <div className="adv-wl-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
                {WHITE_LABEL_ITEMS.map((item) => (
                  <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '8px',
                      background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <img src={item.icon} alt="" width={18} height={18} />
                    </div>
                    <span style={{ fontSize: '15px', color: G.navy, fontWeight: 500 }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Visuelles Element */}
            <div style={{
              background: `linear-gradient(135deg, ${G.navy} 0%, #0f0f23 100%)`,
              borderRadius: '16px',
              padding: '32px',
              textAlign: 'center',
            }}>
              <div style={{
                background: 'rgba(34,197,94,0.12)',
                border: '1px solid rgba(34,197,94,0.30)',
                borderRadius: '10px',
                padding: '20px',
                marginBottom: '16px',
              }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: G.green, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Compliance-Report
                </div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: G.white, marginBottom: '4px' }}>
                  Müller &amp; Partner Rechtsanwälte
                </div>
                <div style={{ fontSize: '12px', color: G.grayMuted }}>Mandanten-Website-Analyse · 2026</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { label: 'Compliance', score: '92', color: '#22c55e' },
                  { label: 'Security', score: '88', color: '#22c55e' },
                  { label: 'Performance', score: '76', color: '#f59e0b' },
                  { label: 'AI-Trust', score: '95', color: '#22c55e' },
                ].map((s) => (
                  <div key={s.label} style={{
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: '8px',
                    padding: '12px',
                  }}>
                    <div style={{ fontSize: '11px', color: G.grayMuted, marginBottom: '4px' }}>{s.label}</div>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: s.color }}>{s.score}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 5: PRICING ═══ */}
      <section id="preise" style={{ background: `linear-gradient(135deg, ${G.navy} 0%, #0f0f23 100%)`, padding: '72px 24px' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-block',
            background: G.greenBg,
            border: `1px solid ${G.greenBorder}`,
            borderRadius: '20px',
            padding: '5px 14px',
            fontSize: '11px',
            fontWeight: 700,
            color: G.green,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}>
            Einfaches Pricing
          </div>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 800, color: G.white, margin: '0 0 40px' }}>
            Ein Angebot. Klar und fair.
          </h2>

          {/* Pricing Card */}
          <div style={{
            background: 'rgba(255,255,255,0.06)',
            border: `2px solid ${G.green}`,
            borderRadius: '20px',
            padding: '40px 36px',
            position: 'relative',
          }}>
            {/* Bestseller-Badge */}
            <div style={{
              position: 'absolute',
              top: '-14px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: G.green,
              color: '#040c1c',
              fontWeight: 800,
              fontSize: '11px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '4px 16px',
              borderRadius: '20px',
              whiteSpace: 'nowrap',
            }}>
              Advokatur-Partnerschaft
            </div>

            {/* Preis */}
            <div style={{ marginTop: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '52px', fontWeight: 900, color: G.white, lineHeight: 1 }}>CHF 149.–</span>
              <span style={{ fontSize: '20px', color: G.grayMuted, marginLeft: '4px' }}>/Mt.</span>
            </div>
            <div style={{ fontSize: '13px', color: G.grayMuted, marginBottom: '32px' }}>
              monatlich kündbar · keine Mindestlaufzeit
            </div>

            {/* Features */}
            <div style={{ textAlign: 'left', marginBottom: '32px' }}>
              {[
                'Bis 30 Mandanten-Domains',
                'Automatisierter 4-Säulen-Scan',
                'White-Label PDF-Reports mit Kanzlei-Logo',
                'Wöchentliche Re-Scans aller Domains',
                'Echtzeit-Alerts bei neuen Trackern oder SSL-Problemen',
                'Dashboard mit Ampel-Übersicht pro Mandant',
                'Persönlicher Onboarding-Call',
                'Daten in der Schweiz (Supabase Zürich)',
              ].map((f) => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <img src="/diagramm.png" alt="" width={16} height={16} style={{ flexShrink: 0, filter: 'hue-rotate(90deg)' }} />
                  <span style={{ fontSize: '14px', color: G.gray }}>{f}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <AgencyCheckoutButton
              plan="advokatur"
              label="Jetzt starten"
              highlight
              green={G.green}
              white={G.white}
            />
          </div>
        </div>
      </section>

      {/* ═══ SECTION 6: RECHENBEISPIEL ═══ */}
      <section style={{ background: '#f8f9fb', padding: '72px 24px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-block',
            background: G.greenBg,
            border: `1px solid ${G.greenBorder}`,
            borderRadius: '20px',
            padding: '5px 14px',
            fontSize: '11px',
            fontWeight: 700,
            color: '#16a34a',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}>
            Ihre Marge
          </div>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 800, color: G.navy, margin: '0 0 40px' }}>
            Rechnen Sie selbst
          </h2>

          <div style={{
            background: `linear-gradient(135deg, ${G.navy} 0%, #0f0f23 100%)`,
            borderRadius: '16px',
            padding: '40px 36px',
            textAlign: 'left',
          }}>
            <div className="adv-calc-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '32px' }}>
              {[
                { label: 'Ihr Honorar pro Audit', value: 'CHF 200–500', sub: 'Pro Mandanten-Website' },
                { label: 'Ihr Aufwand mit Dataquard', value: '< CHF 5', sub: 'Pro Website (30 für CHF 149/Mt.)' },
                { label: 'Ihre Marge', value: 'CHF 195–495', sub: 'Pro Website, pro Audit' },
              ].map((item) => (
                <div key={item.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: G.grayMuted, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: G.green, marginBottom: '4px' }}>{item.value}</div>
                  <div style={{ fontSize: '12px', color: G.grayMuted }}>{item.sub}</div>
                </div>
              ))}
            </div>
            <div style={{
              borderTop: `1px solid ${G.navyBorder}`,
              paddingTop: '24px',
              fontSize: '15px',
              color: G.gray,
              lineHeight: 1.6,
              textAlign: 'center',
            }}>
              Sie berechnen Ihren Mandanten <strong style={{ color: G.white }}>CHF 200–500 pro Website-Audit</strong>.
              Mit Dataquard scannen Sie 30 Websites für{' '}
              <strong style={{ color: G.green }}>CHF 149/Mt.</strong> —
              das sind unter CHF 5 pro Audit. <strong style={{ color: G.white }}>Der Rest ist Ihre Marge.</strong>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 7: FAQ ═══ */}
      <section style={{ background: `linear-gradient(135deg, ${G.navy} 0%, #0f0f23 100%)`, padding: '72px 24px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 800, color: G.white, margin: 0 }}>
              Häufige Fragen
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {FAQ_ITEMS.map((item) => (
              <div key={item.q} style={{
                background: G.navyCard,
                border: `1px solid ${G.navyBorder}`,
                borderRadius: '12px',
                padding: '24px',
              }}>
                <div style={{ fontWeight: 700, fontSize: '16px', color: G.white, marginBottom: '10px' }}>
                  {item.q}
                </div>
                <div style={{ fontSize: '15px', color: G.gray, lineHeight: 1.6 }}>
                  {item.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 8: CTA-FOOTER ═══ */}
      <section style={{ background: '#f8f9fb', padding: '80px 24px 88px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-block',
            background: G.greenBg,
            border: `1px solid ${G.greenBorder}`,
            borderRadius: '20px',
            padding: '5px 14px',
            fontSize: '11px',
            fontWeight: 700,
            color: '#16a34a',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}>
            Lassen Sie uns sprechen
          </div>

          <h2 style={{ fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: 800, color: G.navy, margin: '0 0 16px' }}>
            15 Minuten. Live-Demo. Kein Risiko.
          </h2>
          <p style={{ fontSize: '17px', color: '#555566', lineHeight: 1.6, margin: '0 0 40px' }}>
            Wir zeigen Ihnen Dataquard in einem 15-Minuten-Call —
            inklusive Live-Scan Ihrer Kanzlei-Website.
          </p>

          <div className="adv-cta-btns" style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '24px' }}>
            <div style={{ minWidth: '260px' }}>
              <AgencyCheckoutButton
                plan="advokatur"
                label="Jetzt starten — CHF 149.–/Mt."
                highlight
                green={G.green}
                white={G.white}
              />
            </div>
            <a
              href="mailto:info@dataquard.ch?subject=Advokatur Demo Anfrage"
              style={{
                display: 'inline-block',
                border: `2px solid #d1d5db`,
                color: G.navy,
                fontWeight: 600,
                fontSize: '15px',
                padding: '13px 28px',
                borderRadius: '12px',
                textDecoration: 'none',
              }}
            >
              Demo anfragen
            </a>
          </div>

          <p style={{ fontSize: '13px', color: '#888899' }}>
            Fragen?{' '}
            <a href="mailto:info@dataquard.ch" style={{ color: '#16a34a', textDecoration: 'none' }}>
              info@dataquard.ch
            </a>
          </p>
        </div>
      </section>
    </PageWrapper>
  );
}
