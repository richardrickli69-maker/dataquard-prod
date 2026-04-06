// src/app/ki-transparenz/page.tsx
// KI-Transparenz-Seite gemäss EU AI Act Art. 50

import Link from 'next/link';
import { PageWrapper } from '../components/PageWrapper';

export const metadata = {
  title: 'KI-Transparenz | Dataquard',
  description: 'Dataquard legt offen, wie und wo KI-Technologie eingesetzt wird — gemäss EU AI Act Art. 50.',
};

// Schema.org FAQ-Markup für KI-Transparenz
function KiTransparenzFaqSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Verwendet Dataquard KI-Technologie?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ja. Dataquard verwendet KI-Technologie für die Generierung von Datenschutzerklärungen, Scan-Analysen und Handlungsempfehlungen. Alle KI-generierten Inhalte werden manuell geprüft und freigegeben.',
        },
      },
      {
        '@type': 'Question',
        name: 'Was verlangt der EU AI Act Art. 50 bezüglich KI-Kennzeichnung?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'EU AI Act Art. 50 (gültig ab August 2026) verlangt, dass KI-generierte Texte, Bilder und andere Inhalte als solche erkennbar gemacht werden müssen. Dataquard setzt dies auf der eigenen Website vorbildlich um.',
        },
      },
      {
        '@type': 'Question',
        name: 'Wie kann ich meine Website auf KI-Compliance prüfen?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Mit dem kostenlosen Dataquard Website-Scanner prüfen Sie Ihre Website automatisch auf KI-Inhalte, Deepfakes und EU AI Act Art. 50 Konformität, in unter 60 Sekunden.',
        },
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

const G = {
  green: '#22c55e',
  border: '#e2e4ea',
  text: '#1a1a2e',
  textSec: '#555566',
  textMuted: '#888899',
  bgLight: '#f8f9fb',
  bgWhite: '#ffffff',
  violet: '#8B5CF6',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: 14, fontWeight: 700, color: G.green, marginBottom: '0.75rem', paddingBottom: '0.4rem', borderBottom: `1px solid ${G.border}` }}>
        {title}
      </h2>
      <div style={{ color: G.textSec, fontSize: 14, lineHeight: 1.75 }}>
        {children}
      </div>
    </section>
  );
}

export default function KiTransparenzPage() {
  return (
    <PageWrapper>
      <KiTransparenzFaqSchema />
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px' }}>

        {/* Breadcrumb */}
        <div style={{ fontSize: 12, color: G.textMuted, marginBottom: 24 }}>
          <Link href="/" style={{ color: G.textMuted, textDecoration: 'none' }}>Startseite</Link>
          {' / '}
          <span>KI-Transparenz</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <img src="/energie.png" alt="KI-Transparenz" width={36} height={36} />
            <h1 style={{ fontSize: 28, fontWeight: 800, color: G.text }}>KI-Transparenz</h1>
          </div>
          <p style={{ fontSize: 14, color: G.textSec, lineHeight: 1.7, maxWidth: 600 }}>
            Dataquard setzt den EU AI Act Art. 50 vorbildlich um und legt offen,
            wo und wie KI-Technologie auf dieser Website eingesetzt wird.
          </p>
          {/* Gesetzliche Grundlage Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 12, padding: '6px 14px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 20, fontSize: 12, fontWeight: 600, color: G.green }}>
            <img src="/checkmark.png" alt="" width={14} height={14} />
            Konform gemäss EU AI Act Art. 50 (gültig ab August 2026)
          </div>
        </div>

        <div style={{ background: G.bgWhite, border: `1px solid ${G.border}`, borderRadius: 16, padding: '32px 28px' }}>

          <Section title="1. Gesetzliche Grundlage">
            <p>
              Der <strong style={{ color: G.text }}>EU AI Act Artikel 50</strong> verpflichtet Anbieter
              von KI-Systemen, KI-generierte Inhalte (insbesondere Texte, Bilder und Audioaufnahmen)
              klar erkennbar zu kennzeichnen. Diese Pflicht gilt für alle Unternehmen, die Kunden in der
              EU betreuen, unabhängig vom Firmensitz.
            </p>
            <p style={{ marginTop: 8 }}>
              Als Schweizer Unternehmen mit EU-Kundschaft setzt Dataquard diese Anforderung freiwillig
              und transparent bereits vor dem offiziellen Inkrafttreten (August 2026) um.
            </p>
          </Section>

          <Section title="2. Welche KI-Technologie verwenden wir?">
            <p>Dataquard setzt auf bewährte KI-Technologie aus Europa und den USA:</p>
            <div style={{ marginTop: 12 }}>
              {[
                {
                  name: 'Dokumenten-Generierung',
                  use: 'Unsere KI erstellt Datenschutzerklärungen, Impressum-Texte, Scan-Analysen und Handlungsempfehlungen, basierend auf aktuellen Schweizer und europäischen Rechtsgrundlagen.',
                },
                {
                  name: 'Bild-Analyse',
                  use: 'Für die KI-Bilderkennung und den Deepfake-Check verwenden wir eine EU-konforme Analyse-Technologie mit einer Erkennungsrate von über 90% bei gängigen KI-Tools wie Midjourney, DALL-E und Stable Diffusion.',
                },
              ].map(tool => (
                <div key={tool.name} style={{ padding: '12px 16px', background: G.bgLight, borderRadius: 10, marginBottom: 8, display: 'flex', gap: 12 }}>
                  <img src="/energie.png" alt="" width={20} height={20} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontWeight: 700, color: G.text, fontSize: 14 }}>{tool.name}</div>
                    <div style={{ fontSize: 13, color: G.textSec, marginTop: 2 }}>{tool.use}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="3. Welche Inhalte wurden KI-unterstützt erstellt?">
            <p>Folgende Bereiche der Dataquard-Plattform nutzen KI-Unterstützung:</p>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Datenschutzerklärungen', detail: 'Automatisch generiert auf Basis des Website-Scans, manuell geprüft und juristisch validiert.' },
                { label: 'Scan-Analysen & Empfehlungen', detail: 'KI-gestützte Auswertung von Website-Daten mit konkreten Handlungsempfehlungen.' },
                { label: 'Website-Texte (Marketing)', detail: 'Teile der Homepage- und Landingpage-Texte wurden mit KI-Unterstützung verfasst und redaktionell überarbeitet.' },
                { label: 'AI-Trust Bild-Analyse', detail: 'Automatische Erkennung von KI-generierten Bildern und Deepfakes auf Kunden-Websites mit EU-konformer Analyse-Technologie.' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: `1px solid ${G.border}` }}>
                  <img src="/checkmark.png" alt="" width={16} height={16} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontWeight: 600, color: G.text, fontSize: 14 }}>{item.label}</div>
                    <div style={{ fontSize: 13, color: G.textSec, marginTop: 2 }}>{item.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="4. Qualitätssicherung">
            <p>
              Alle KI-generierten Inhalte bei Dataquard durchlaufen einen manuellen Prüfprozess:
            </p>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                'Inhaltliche Überprüfung auf Richtigkeit und Vollständigkeit',
                'Juristische Validierung aller Rechtstexte (nDSG/DSGVO-Konformität)',
                'Stilistische Anpassung und redaktionelle Überarbeitung',
                'Regelmässige Aktualisierung bei Gesetzesänderungen',
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ flexShrink: 0, width: 20, height: 20, background: 'rgba(34,197,94,0.08)', color: G.green, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{i + 1}</span>
                  <span style={{ fontSize: 14, color: G.textSec }}>{step}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="5. Technische KI-Kennzeichnung">
            <p>
              Dataquard kennzeichnet KI-Inhalte auf mehreren Ebenen technisch nachweisbar:
            </p>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'Schema.org JSON-LD', detail: 'WebPage + CreativeWork mit conditionsOfAccess und usageInfo, maschinenlesbar im HTML-Quellcode.' },
                { label: 'Meta-Tags', detail: 'ai-content-declaration und ai-policy Meta-Tags im HTML-Head erkennbar für Scanner und Crawler.' },
                { label: 'Footer-Hinweis', detail: 'Sichtbarer KI-Transparenz-Hinweis auf jeder Seite der Dataquard-Plattform.' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: `1px solid ${G.border}` }}>
                  <img src="/diagramm.png" alt="" width={16} height={16} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontWeight: 600, color: G.text, fontSize: 14 }}>{item.label}</div>
                    <div style={{ fontSize: 13, color: G.textSec, marginTop: 2 }}>{item.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="6. Datenschutz bei KI-Anfragen">
            <p>
              Wenn Dataquard KI-Technologie für die Policy-Generierung nutzt, werden folgende Daten übermittelt:
            </p>
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li>Domain-Name der zu analysierenden Website</li>
              <li>Erkannte Drittanbieter-Dienste (anonym)</li>
              <li>Jurisdiktion (nDSG/DSGVO)</li>
            </ul>
            <p style={{ marginTop: 8 }}>
              Es werden <strong style={{ color: G.text }}>keine personenbezogenen Daten</strong> an
              KI-Dienste weitergegeben. Weitere Informationen finden Sie in unserer{' '}
              <Link href="/datenschutz" style={{ color: G.green, textDecoration: 'none' }}>Datenschutzerklärung</Link>.
            </p>
          </Section>

          <Section title="7. Kontakt bei Fragen zur KI-Nutzung">
            <p>
              Bei Fragen zu unserer KI-Nutzung oder EU AI Act Art. 50 Konformität:
            </p>
            <div style={{ marginTop: 10, padding: '12px 16px', background: G.bgLight, borderRadius: 10 }}>
              <div style={{ fontSize: 14, color: G.text }}>
                <strong>Dataquard</strong><br />
                Reinach BL, Schweiz<br />
                <a href="mailto:datenschutz@dataquard.ch" style={{ color: G.green, textDecoration: 'none' }}>datenschutz@dataquard.ch</a>
              </div>
            </div>
          </Section>

          {/* CTA — AI-Trust Produkt */}
          <div style={{ marginTop: 32, padding: '24px', background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <img src="/badge-ai-trust.svg" alt="AI-Trust" width={28} height={28} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: G.text }}>
                Ihre Website auch EU AI Act Art. 50 konform machen?
              </h3>
            </div>
            <p style={{ fontSize: 14, color: G.textSec, marginBottom: 14, lineHeight: 1.6 }}>
              Mit dem Dataquard AI-Trust Scanner prüfen Sie Ihre Website automatisch auf KI-Bilder
              und Deepfakes und erhalten alle nötigen Kennzeichnungs-Klauseln für Ihre Datenschutzerklärung.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link href="/scanner" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: G.green, color: '#fff', fontWeight: 600, fontSize: 14, padding: '10px 22px', borderRadius: 10, textDecoration: 'none' }}>
                <img src="/suche.png" alt="" width={16} height={16} />
                Kostenlos scannen
              </Link>
              <Link href="/checkout?plan=ai-trust" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: `2px solid ${G.green}`, color: G.green, fontWeight: 600, fontSize: 14, padding: '10px 22px', borderRadius: 10, textDecoration: 'none', background: 'transparent' }}>
                Jetzt upgraden: ab CHF 19.–/Mt.
              </Link>
            </div>
          </div>

          {/* Letzte Aktualisierung */}
          <p style={{ marginTop: 28, fontSize: 12, color: G.textMuted }}>
            Letzte Aktualisierung: März 2026 · Gültig ab: sofort
          </p>

        </div>
      </div>
    </PageWrapper>
  );
}
