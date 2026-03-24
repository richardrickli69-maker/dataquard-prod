// src/app/datenschutz/page.tsx
import Link from 'next/link';
import { PageWrapper } from '../components/PageWrapper';

export const metadata = {
  title: 'Datenschutzerklärung | Dataquard',
  description: 'Datenschutzerklärung von Dataquard – dataquard.ch',
};

const G = {
  green: '#22c55e',
  border: '#e2e4ea',
  text: '#1a1a2e',
  textSec: '#555566',
  textMuted: '#888899',
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

export default function DatenschutzPage() {
  return (
    <PageWrapper>
      <main style={{ maxWidth: 760, margin: '0 auto', padding: '3rem 24px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6, color: G.text }}>Datenschutzerklärung</h1>
        <p style={{ color: G.textMuted, fontSize: 13, marginBottom: '2.5rem' }}>
          Stand: März 2026 · Dataquard, Richard Rickli, Basel-Region
        </p>

        <Section title="1. Verantwortlicher">
          <p>Verantwortlicher im Sinne des Schweizer Datenschutzgesetzes (nDSG) sowie der EU-Datenschutz-Grundverordnung (DSGVO):</p>
          <p style={{ marginTop: 8 }}>
            <strong style={{ color: G.text }}>Richard Rickli</strong><br />
            Dataquard<br />
            Basel-Region, Schweiz<br />
            E-Mail: datenschutz@dataquard.ch<br />
            Website: dataquard.ch
          </p>
        </Section>

        <Section title="2. Erhobene Daten">
          <p>Wir erheben folgende Daten wenn Sie dataquard.ch nutzen:</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li><strong style={{ color: G.text }}>Konto-Daten:</strong> E-Mail-Adresse bei Registrierung (via Supabase Auth)</li>
            <li><strong style={{ color: G.text }}>Scan-Daten:</strong> Von Ihnen eingegebene URLs zur Website-Analyse</li>
            <li><strong style={{ color: G.text }}>Zahlungsdaten:</strong> Stripe verarbeitet Zahlungen – wir sehen nur Transaktions-IDs</li>
            <li><strong style={{ color: G.text }}>Technische Daten:</strong> IP-Adresse, Browser-Typ, Zugriffszeitpunkt (Vercel Logs)</li>
          </ul>
        </Section>

        <Section title="3. Zweck der Datenverarbeitung">
          <p>Wir verarbeiten Ihre Daten ausschliesslich zur:</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li>Bereitstellung des Website-Scan-Dienstes</li>
            <li>Generierung von Compliance-Dokumenten</li>
            <li>Verwaltung von Jahresabos und wiederkehrender Zahlungsabwicklung via Stripe</li>
            <li>Versand von monatlichen Compliance-Reports per E-Mail</li>
            <li>Verbesserung unseres Dienstes (anonyme Analyse)</li>
          </ul>
        </Section>

        <Section title="4. Drittanbieter">
          <p>Wir nutzen folgende Drittanbieter:</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li><strong style={{ color: G.text }}>Supabase</strong> – Datenbank und Authentifizierung (Server: Zürich, Schweiz)</li>
            <li><strong style={{ color: G.text }}>Vercel</strong> – Hosting (Daten können auf EU-Servern verarbeitet werden)</li>
            <li><strong style={{ color: G.text }}>Stripe</strong> – Zahlungsabwicklung inkl. wiederkehrende Zahlungen (USA – SCCs)</li>
            <li><strong style={{ color: G.text }}>Anthropic Claude API</strong> – KI-Analyse (USA – SCCs)</li>
            <li><strong style={{ color: G.text }}>Resend</strong> – E-Mail-Versand (EU, Region eu-west-1)</li>
          </ul>
        </Section>

        <Section title="5. Datenspeicherung">
          <p>Ihre Konto- und Scan-Daten werden auf <strong style={{ color: G.text }}>Schweizer Servern (Supabase Zürich, eu-central-2)</strong> gespeichert. Wir geben Ihre Daten nicht an Dritte weiter, ausser es ist zur Leistungserbringung erforderlich (Stripe, Vercel).</p>
        </Section>

        <Section title="6. Cookies">
          <p>Wir verwenden folgende Cookies:</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li><strong style={{ color: G.text }}>Essenzielle Cookies:</strong> Session-Management, Sicherheit, Consent-Speicherung – immer aktiv</li>
            <li><strong style={{ color: G.text }}>Analyse-Cookies:</strong> Vercel Analytics (anonymisiert) – nur mit Ihrer Einwilligung</li>
            <li><strong style={{ color: G.text }}>Marketing-Cookies:</strong> Stripe Checkout – nur mit Ihrer Einwilligung</li>
          </ul>
          <p style={{ marginTop: 8 }}>Sie können Ihre Cookie-Einstellungen jederzeit über den Banner am Seitenrand ändern.</p>
        </Section>

        <Section title="7. Ihre Rechte (nDSG / DSGVO)">
          <p>Sie haben das Recht auf:</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li>Auskunft über Ihre gespeicherten Daten (Art. 25 nDSG / Art. 15 DSGVO)</li>
            <li>Berichtigung unrichtiger Daten (Art. 32 nDSG / Art. 16 DSGVO)</li>
            <li>Löschung Ihrer Daten (Art. 32 nDSG / Art. 17 DSGVO)</li>
            <li>Widerspruch gegen die Verarbeitung (Art. 30 nDSG / Art. 21 DSGVO)</li>
            <li>Datenübertragbarkeit (Art. 28 nDSG / Art. 20 DSGVO)</li>
          </ul>
          <p style={{ marginTop: 8 }}>Kontakt: <a href="mailto:datenschutz@dataquard.ch" style={{ color: G.green }}>datenschutz@dataquard.ch</a></p>
        </Section>

        <Section title="8. Aufbewahrungsdauer">
          <p>Konto-Daten werden gelöscht sobald Sie Ihr Konto schliessen. Scan-Daten werden nach 12 Monaten automatisch gelöscht. Zahlungsbelege werden gemäss gesetzlicher Aufbewahrungspflicht (10 Jahre) gespeichert.</p>
        </Section>

        <Section title="9. Änderungen">
          <p>Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf anzupassen. Die aktuelle Version ist stets unter dataquard.ch/datenschutz abrufbar.</p>
        </Section>

        <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: `1px solid ${G.border}`, display: 'flex', gap: '1.5rem' }}>
          <Link href="/impressum-generator" style={{ color: G.textMuted, fontSize: 13, textDecoration: 'none' }}>Impressum</Link>
          <Link href="/agb" style={{ color: G.textMuted, fontSize: 13, textDecoration: 'none' }}>AGB</Link>
          <Link href="/" style={{ color: G.textMuted, fontSize: 13, textDecoration: 'none' }}>Startseite</Link>
        </div>
      </main>
    </PageWrapper>
  );
}
