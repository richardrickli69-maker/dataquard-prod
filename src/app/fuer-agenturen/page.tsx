// src/app/fuer-agenturen/page.tsx
// Agentur-Landingpage — White-Label Compliance für Digitalagenturen

import type { Metadata } from 'next';
import Link from 'next/link';
import { PageWrapper } from '../components/PageWrapper';

export const metadata: Metadata = {
  title: 'Dataquard für Agenturen — Compliance als Dienstleistung',
  description: 'Bieten Sie Ihren Kunden vollständige Website-Compliance: nDSG, DSGVO, EU AI Act. White-Label-fähig, Bulk-Scan, eigenes Agentur-Dashboard. Ab CHF 79.–/Mt.',
  alternates: { canonical: 'https://www.dataquard.ch/fuer-agenturen' },
};

const G = {
  green: '#22c55e',
  greenHover: '#16a34a',
  greenBg: 'rgba(34,197,94,0.10)',
  greenBorder: 'rgba(34,197,94,0.30)',
  navy: '#1a1a2e',
  navyLight: '#232340',
  navyCard: 'rgba(255,255,255,0.06)',
  navyBorder: 'rgba(255,255,255,0.12)',
  bg: '#f8f9fb',
  bgWhite: '#ffffff',
  bgLight: '#f1f2f6',
  border: '#e2e4ea',
  text: '#1a1a2e',
  textSec: '#555566',
  textMuted: '#888899',
  white: '#ffffff',
};

const STEPS = [
  {
    nr: '01',
    title: 'Agentur-Account erstellen',
    desc: 'Registrieren Sie sich als Agentur-Partner. Ihr persönliches Dashboard ist sofort einsatzbereit.',
    icon: '/suche.png',
  },
  {
    nr: '02',
    title: 'Kunden anlegen & scannen',
    desc: 'Fügen Sie Kundendomains hinzu und starten Sie den Compliance-Scan. Alle Ergebnisse zentral im Agentur-Dashboard.',
    icon: '/diagramm.png',
  },
  {
    nr: '03',
    title: 'Berichte liefern & fakturieren',
    desc: 'Laden Sie White-Label-PDFs herunter oder teilen Sie Berichte direkt mit Ihren Kunden. Compliance wird zum Umsatz.',
    icon: '/dokument.png',
  },
];

const FEATURES = [
  { icon: '/diagramm.png', title: 'Zentrales Agentur-Dashboard', desc: 'Alle Kundendaten, Scan-Ergebnisse und Dokumente auf einer Oberfläche — übersichtlich und effizient.' },
  { icon: '/suche.png', title: 'Bulk-Scan', desc: 'Scannen Sie mehrere Kunden-Websites gleichzeitig. Kein manuelles Starten einzelner Scans.' },
  { icon: '/dokument.png', title: 'White-Label-Berichte', desc: 'PDFs mit Ihrem Logo und Ihren Farben. Der Kunde sieht Ihre Marke, nicht Dataquard.' },
  { icon: '/icon-recht.png', title: 'Dokument-Pack', desc: 'Automatisch generierte Datenschutzerklärungen, Impressum und Cookie-Policy für jeden Kunden.' },
  { icon: '/badge-ai-trust.svg', title: 'EU AI Act Compliance (Art. 50)', desc: 'KI-Bild-Erkennung und Deepfake-Check für alle Kunden-Websites. Stärkster Differenzierer am Markt.' },
  { icon: '/diagramm.png', title: 'Monatliche Reports per E-Mail', desc: 'Automatisierte Compliance-Reports für alle Kunden. Sie informieren proaktiv, ohne Aufwand.' },
  { icon: '/warnung.png', title: 'Echtzeit-Alerts', desc: 'Sofort benachrichtigt bei neuen Compliance-Problemen oder SSL-Ablauf — für jeden Kunden separat.' },
  { icon: '/icon-sicherheit.png', title: 'nDSG + DSGVO + EU AI Act', desc: 'Vollständige Abdeckung aller relevanten Schweizer und europäischen Datenschutzgesetze.' },
];

const PLANS = [
  {
    name: 'Agency Basic',
    badge: null as string | null,
    highlight: false,
    price: 'CHF 79.–',
    pricePer: '/Mt.',
    priceYear: '(CHF 948.– / Jahr)',
    desc: 'Für Agenturen mit ersten Compliance-Mandaten',
    features: [
      'Bis zu 5 Kunden-Websites',
      'Bulk-Scan (alle Kunden gleichzeitig)',
      'Zentrales Agentur-Dashboard',
      'White-Label-PDFs mit Agentur-Logo',
      'nDSG + DSGVO Dokumente pro Kunde',
      'Monatlicher Compliance-Report',
    ],
    missing: [
      'EU AI Act Scan (AI-Trust)',
      'White-Label E-Mail-Versand',
      'Priority Support',
    ],
    cta: 'Basic anfragen',
    href: 'mailto:info@dataquard.ch?subject=Agency Basic Anfrage',
  },
  {
    name: 'Agency Pro',
    badge: 'BESTSELLER',
    highlight: true,
    price: 'CHF 179.–',
    pricePer: '/Mt.',
    priceYear: '(CHF 2\'148.– / Jahr)',
    desc: 'Für wachsende Agenturen mit regelmässigem Compliance-Bedarf',
    features: [
      'Bis zu 15 Kunden-Websites',
      'Alles aus Starter',
      'EU AI Act Scan (AI-Trust) pro Kunde',
      'Deepfake-Check & Echtzeit-Alerts',
      'White-Label E-Mail-Reports an Kunden',
      'Wöchentlicher Compliance-Report',
      'Autom. DSE-Update bei neuen KI-Inhalten',
    ],
    missing: [
      'Unbegrenzte Kunden',
      'Custom Domain (White-Label Portal)',
    ],
    cta: 'Pro anfragen',
    href: 'mailto:info@dataquard.ch?subject=Agency Pro Anfrage',
  },
  {
    name: 'Agency Enterprise',
    badge: null as string | null,
    highlight: false,
    price: 'ab CHF 349.–',
    pricePer: '/Mt.',
    priceYear: '(ab CHF 4\'188.– / Jahr)',
    desc: 'Für grosse Agenturen und Managed-Service-Provider',
    features: [
      'Unbegrenzte Kunden-Websites',
      'Alles aus Professional',
      'Custom Domain (compliance.ihreagentur.ch)',
      'Kunden-Self-Service-Portal',
      'Dedizierter Account Manager',
      'SLA mit 4h Reaktionszeit',
      'API-Zugang für eigene Integrationen',
    ],
    missing: [],
    cta: 'Kontakt aufnehmen',
    href: 'mailto:info@dataquard.ch?subject=Agency Enterprise Anfrage',
  },
];

const COMPARE_ROWS = [
  { feature: 'Anzahl Kunden-Websites', starter: '5', professional: '15', enterprise: 'Unbegrenzt', competitors: '1–3' },
  { feature: 'Bulk-Scan', starter: '✓', professional: '✓', enterprise: '✓', competitors: '✗' },
  { feature: 'White-Label-PDFs', starter: '✓', professional: '✓', enterprise: '✓', competitors: 'Teilweise' },
  { feature: 'nDSG Schweiz', starter: '✓', professional: '✓', enterprise: '✓', competitors: 'Selten' },
  { feature: 'EU AI Act Art. 50 Check', starter: '✗', professional: '✓', enterprise: '✓', competitors: '✗' },
  { feature: 'Deepfake-Erkennung', starter: '✗', professional: '✓', enterprise: '✓', competitors: '✗' },
  { feature: 'White-Label E-Mail', starter: '✗', professional: '✓', enterprise: '✓', competitors: '✗' },
  { feature: 'API-Zugang', starter: '✗', professional: '✗', enterprise: '✓', competitors: 'Teilweise' },
  { feature: 'Daten in der Schweiz', starter: '✓', professional: '✓', enterprise: '✓', competitors: '✗' },
];

export default function FuerAgenturenPage() {
  return (
    <PageWrapper>
      <style>{`
        @media (max-width: 900px) {
          .agency-hero-grid { flex-direction: column !important; }
          .agency-hero-ctas { flex-direction: column !important; align-items: stretch !important; }
          .agency-steps-grid { grid-template-columns: 1fr !important; }
          .agency-features-grid { grid-template-columns: 1fr 1fr !important; }
          .agency-plans-grid { grid-template-columns: 1fr !important; }
          .agency-compare-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .agency-compare-scroll table { min-width: 600px; }
        }
        @media (max-width: 560px) {
          .agency-features-grid { grid-template-columns: 1fr !important; }
          .agency-problem-grid { grid-template-columns: 1fr !important; }
          .agency-cta-btns { flex-direction: column !important; align-items: stretch !important; }
        }
      `}</style>

      {/* ═══ HERO (dark navy) ═══ */}
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
            Für Digitalagenturen & MSP
          </div>

          <h1 style={{
            fontSize: 'clamp(30px, 5vw, 48px)',
            fontWeight: 900,
            color: G.white,
            lineHeight: 1.15,
            margin: '0 0 20px',
            fontFamily: '"DM Serif Display", Georgia, serif',
          }}>
            Compliance als Dienstleistung — <span style={{ color: G.green }}>skalierbar für Ihre Agentur</span>
          </h1>

          <p style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.72)',
            lineHeight: 1.6,
            margin: '0 0 36px',
            maxWidth: '620px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            Bieten Sie Ihren Kunden vollständige Website-Compliance: nDSG, DSGVO, EU AI Act Art. 50.
            White-Label-fähig, Bulk-Scan, ein zentrales Dashboard.
          </p>

          <div className="agency-hero-ctas" style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="mailto:info@dataquard.ch?subject=Agentur Demo Anfrage" style={{
              display: 'inline-block',
              background: G.green,
              color: G.white,
              fontWeight: 700,
              fontSize: '16px',
              padding: '14px 32px',
              borderRadius: '12px',
              textDecoration: 'none',
              transition: 'background 0.15s',
            }}>
              Demo anfragen →
            </a>
            <Link href="#preise" style={{
              display: 'inline-block',
              border: `2px solid rgba(255,255,255,0.25)`,
              color: 'rgba(255,255,255,0.85)',
              fontWeight: 600,
              fontSize: '16px',
              padding: '14px 32px',
              borderRadius: '12px',
              textDecoration: 'none',
            }}>
              Preise ansehen
            </Link>
          </div>

          {/* Trust-Signale */}
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '40px' }}>
            {[
              { icon: '/icon-sicherheit.png', label: 'Daten in Zürich' },
              { icon: '/badge-ai-trust.svg',  label: 'EU AI Act Art. 50' },
              { icon: '/icon-recht.png',       label: 'nDSG + DSGVO' },
              { icon: '/checkmark.png',        label: 'White-Label' },
            ].map(item => (
              <span key={item.label} style={{
                fontSize: '13px',
                color: 'rgba(255,255,255,0.55)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <img src={item.icon} alt="" width={24} height={24} style={{ display: 'inline-block', verticalAlign: 'middle', opacity: 0.75 }} />
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PROBLEM / LÖSUNG ═══ */}
      <section style={{ background: G.bg, padding: '72px 24px' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: G.green, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>Das Problem</div>
            <h2 style={{ fontSize: '32px', fontWeight: 800, color: G.text, margin: 0 }}>
              Compliance kostet Zeit — die Ihre Agentur nicht hat
            </h2>
          </div>

          <div className="agency-problem-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Problem */}
            <div style={{
              background: G.bgWhite,
              border: `1px solid ${G.border}`,
              borderRadius: '16px',
              padding: '32px',
            }}>
              <img src="/fehler.png" alt="" width={36} height={36} style={{ marginBottom: '16px', display: 'block' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: G.text, margin: '0 0 16px' }}>Ohne Dataquard</h3>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  'Manuelle Compliance-Prüfung für jeden Kunden',
                  'Kein Überblick über nDSG/DSGVO-Status aller Kunden',
                  'EU AI Act Art. 50? Kaum ein Tool prüft das',
                  'PDFs selbst erstellen, anpassen, versenden',
                  'Kunden melden sich wegen Abmahnungen',
                  'Kein skalierbares Angebot für Compliance',
                ].map(item => (
                  <li key={item} style={{ display: 'flex', gap: '10px', fontSize: '14px', color: G.textSec, alignItems: 'flex-start' }}>
                    <img src="/fehler.png" alt="" style={{ width: '16px', height: '16px', marginTop: '2px', flexShrink: 0 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Lösung */}
            <div style={{
              background: G.bgWhite,
              border: `2px solid ${G.greenBorder}`,
              borderRadius: '16px',
              padding: '32px',
            }}>
              <img src="/checkmark.png" alt="" width={36} height={36} style={{ marginBottom: '16px', display: 'block' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: G.text, margin: '0 0 16px' }}>Mit Dataquard</h3>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  'Ein Klick — alle Kunden gleichzeitig gescannt',
                  'Compliance-Dashboard für alle Kunden auf einen Blick',
                  'EU AI Act Art. 50 automatisch geprüft',
                  'White-Label-PDFs in Minuten generiert',
                  'Echtzeit-Alerts bei neuen Problemen',
                  'Compliance als neues Umsatz-Standbein',
                ].map(item => (
                  <li key={item} style={{ display: 'flex', gap: '10px', fontSize: '14px', color: G.textSec, alignItems: 'flex-start' }}>
                    <img src="/checkmark.png" alt="" style={{ width: '16px', height: '16px', marginTop: '2px', flexShrink: 0 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 3 SCHRITTE ═══ */}
      <section style={{ background: G.bgWhite, padding: '72px 24px' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: G.green, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>So einfach</div>
            <h2 style={{ fontSize: '32px', fontWeight: 800, color: G.text, margin: 0 }}>
              In 3 Schritten zur Agentur-Compliance
            </h2>
          </div>

          <div className="agency-steps-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
            {STEPS.map((step, i) => (
              <div key={step.nr} style={{
                background: G.bg,
                border: `1px solid ${G.border}`,
                borderRadius: '16px',
                padding: '32px',
                position: 'relative',
              }}>
                {/* Verbindungslinie */}
                {i < STEPS.length - 1 && (
                  <div style={{
                    display: 'none', // wird per CSS auf Desktop gezeigt (vereinfacht)
                  }} />
                )}
                <img src={step.icon} alt="" width={48} height={48} style={{ marginBottom: '12px', display: 'block' }} />
                <div style={{
                  fontSize: '11px', fontWeight: 700, color: G.green,
                  letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px',
                }}>
                  Schritt {step.nr}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: G.text, margin: '0 0 10px' }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: '14px', color: G.textSec, lineHeight: 1.6, margin: 0 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section style={{ background: G.bg, padding: '72px 24px' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: G.green, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>Features</div>
            <h2 style={{ fontSize: '32px', fontWeight: 800, color: G.text, margin: '0 0 12px' }}>
              Alles, was Ihre Agentur braucht
            </h2>
            <p style={{ fontSize: '16px', color: G.textSec, margin: 0 }}>
              Das einzige Schweizer Compliance-Tool mit EU AI Act Art. 50 — und White-Label für Agenturen.
            </p>
          </div>

          <div className="agency-features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            {FEATURES.map(feat => (
              <div key={feat.title} style={{
                background: G.bgWhite,
                border: `1px solid ${G.border}`,
                borderRadius: '14px',
                padding: '24px',
              }}>
                <img src={feat.icon} alt="" width={48} height={48} style={{ marginBottom: '12px', display: 'block' }} />
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: G.text, margin: '0 0 8px' }}>
                  {feat.title}
                </h3>
                <p style={{ fontSize: '13px', color: G.textSec, lineHeight: 1.55, margin: 0 }}>
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PREISE ═══ */}
      <section id="preise" style={{ background: G.bgWhite, padding: '72px 24px' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: G.green, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>Preise</div>
            <h2 style={{ fontSize: '32px', fontWeight: 800, color: G.text, margin: '0 0 12px' }}>
              Transparente Agentur-Preise
            </h2>
            <p style={{ fontSize: '16px', color: G.textSec, margin: 0 }}>
              Jährliche Abrechnung — jederzeit kündbar — 14 Tage Geld-zurück-Garantie
            </p>
          </div>

          <div className="agency-plans-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
            {PLANS.map(plan => (
              <div key={plan.name} style={{
                background: plan.highlight ? G.navy : G.bgWhite,
                border: plan.highlight ? `2px solid ${G.green}` : `1px solid ${G.border}`,
                borderRadius: '20px',
                padding: '32px',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
              }}>
                {plan.badge && (
                  <div style={{
                    position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)',
                    background: G.green, color: G.white,
                    fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em',
                    padding: '4px 14px', borderRadius: '20px',
                    whiteSpace: 'nowrap',
                  }}>
                    {plan.badge}
                  </div>
                )}

                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: plan.highlight ? G.white : G.text, margin: '0 0 4px' }}>
                    {plan.name}
                  </h3>
                  <p style={{ fontSize: '13px', color: plan.highlight ? 'rgba(255,255,255,0.6)' : G.textMuted, margin: 0 }}>
                    {plan.desc}
                  </p>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <span style={{ fontSize: '36px', fontWeight: 900, color: plan.highlight ? G.white : G.text }}>
                    {plan.price}
                  </span>
                  <span style={{ fontSize: '16px', color: plan.highlight ? 'rgba(255,255,255,0.6)' : G.textMuted }}>
                    {plan.pricePer}
                  </span>
                  <div style={{ fontSize: '12px', color: plan.highlight ? 'rgba(255,255,255,0.5)' : G.textMuted, marginTop: '4px' }}>
                    {plan.priceYear}
                  </div>
                </div>

                <ul style={{ margin: '0 0 20px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: plan.highlight ? 'rgba(255,255,255,0.85)' : G.textSec, alignItems: 'flex-start' }}>
                      <img src="/checkmark.png" alt="" style={{ width: '15px', height: '15px', marginTop: '2px', flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                  {plan.missing.map(f => (
                    <li key={f} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: plan.highlight ? 'rgba(255,255,255,0.35)' : G.textMuted, alignItems: 'flex-start' }}>
                      <img src="/fehler.png" alt="" style={{ width: '15px', height: '15px', marginTop: '2px', flexShrink: 0, opacity: 0.5 }} />
                      {f}
                    </li>
                  ))}
                </ul>

                <a href={plan.href} style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '13px',
                  background: plan.highlight ? G.green : 'transparent',
                  border: plan.highlight ? 'none' : `2px solid ${G.green}`,
                  color: plan.highlight ? G.white : G.green,
                  fontWeight: 700,
                  fontSize: '15px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  marginTop: 'auto',
                }}>
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>

          {/* Document Pack Add-on Banner */}
          <div style={{
            background: `linear-gradient(135deg, ${G.navy} 0%, #232350 100%)`,
            border: `1px solid rgba(34,197,94,0.25)`,
            borderRadius: '16px',
            padding: '28px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
            flexWrap: 'wrap',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <img src="/dokument.png" alt="" width={24} height={24} style={{ display: 'inline-block', verticalAlign: 'middle' }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: G.green, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Add-on</span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: G.white, margin: '0 0 6px' }}>
                Document Pack — CHF 9.– / Domain / Mt.
              </h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                Automatisch generierte und aktuell gehaltene Datenschutzerklärung, Impressum und Cookie-Policy — individuell für jeden Kunden, mit Ihrem Logo.
              </p>
            </div>
            <a href="mailto:info@dataquard.ch?subject=Document Pack Anfrage" style={{
              display: 'inline-block',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: G.white,
              fontWeight: 700,
              fontSize: '14px',
              padding: '11px 24px',
              borderRadius: '10px',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}>
              Mehr erfahren
            </a>
          </div>
        </div>
      </section>

      {/* ═══ VERGLEICHSTABELLE ═══ */}
      <section style={{ background: G.bg, padding: '72px 24px' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: G.green, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>Warum Dataquard</div>
            <h2 style={{ fontSize: '32px', fontWeight: 800, color: G.text, margin: 0 }}>
              Dataquard vs. andere Tools
            </h2>
          </div>

          <div className="agency-compare-scroll">
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              background: G.bgWhite,
              borderRadius: '16px',
              overflow: 'hidden',
              border: `1px solid ${G.border}`,
            }}>
              <thead>
                <tr style={{ background: G.navy }}>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>Feature</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>Basic</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '13px', fontWeight: 800, color: G.green, background: 'rgba(34,197,94,0.1)' }}>Pro</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>Enterprise</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>Andere Tools</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row, i) => (
                  <tr key={row.feature} style={{ background: i % 2 === 0 ? G.bgWhite : G.bg }}>
                    <td style={{ padding: '12px 20px', fontSize: '13px', color: G.text, fontWeight: 500, borderBottom: `1px solid ${G.border}` }}>
                      {row.feature}
                    </td>
                    {[row.starter, row.professional, row.enterprise, row.competitors].map((val, j) => (
                      <td key={j} style={{
                        padding: '12px 16px',
                        textAlign: 'center',
                        fontSize: '13px',
                        fontWeight: 600,
                        borderBottom: `1px solid ${G.border}`,
                        background: j === 1 ? 'rgba(34,197,94,0.04)' : 'transparent',
                        color: G.textSec,
                      }}>
                        {val === '✓'
                          ? <img src="/checkmark.png" alt="Ja" width={16} height={16} style={{ display: 'inline-block', verticalAlign: 'middle' }} />
                          : val === '✗'
                          ? <img src="/fehler.png" alt="Nein" width={16} height={16} style={{ display: 'inline-block', verticalAlign: 'middle', opacity: 0.5 }} />
                          : val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══ CTA / KONTAKT ═══ */}
      <section style={{
        background: `linear-gradient(135deg, ${G.navy} 0%, #0f0f23 100%)`,
        padding: '80px 24px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <img src="/checkmark.png" alt="" width={48} height={48} style={{ marginBottom: '20px', display: 'inline-block' }} />
          <h2 style={{
            fontSize: 'clamp(24px, 4vw, 36px)',
            fontWeight: 800,
            color: G.white,
            margin: '0 0 16px',
            fontFamily: '"DM Serif Display", Georgia, serif',
          }}>
            Bereit, Compliance anzubieten?
          </h2>
          <p style={{
            fontSize: '16px',
            color: 'rgba(255,255,255,0.65)',
            lineHeight: 1.65,
            margin: '0 0 36px',
          }}>
            Kontaktieren Sie uns für eine persönliche Demo oder starten Sie direkt mit einer 14-tägigen Testphase.
            Kein Kreditkarte nötig für das erste Gespräch.
          </p>

          <div className="agency-cta-btns" style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="mailto:info@dataquard.ch?subject=Agentur Demo Anfrage" style={{
              display: 'inline-block',
              background: G.green,
              color: G.white,
              fontWeight: 700,
              fontSize: '16px',
              padding: '14px 32px',
              borderRadius: '12px',
              textDecoration: 'none',
            }}>
              Demo anfragen →
            </a>
            <a href="mailto:info@dataquard.ch" style={{
              display: 'inline-block',
              border: '2px solid rgba(255,255,255,0.25)',
              color: 'rgba(255,255,255,0.85)',
              fontWeight: 600,
              fontSize: '16px',
              padding: '14px 32px',
              borderRadius: '12px',
              textDecoration: 'none',
            }}>
              info@dataquard.ch
            </a>
          </div>

          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', marginTop: '24px' }}>
            Reinach BL, Schweiz · Daten in Zürich (Supabase) · nDSG-konform
          </p>
        </div>
      </section>
    </PageWrapper>
  );
}
