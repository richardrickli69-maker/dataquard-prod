// src/app/datenschutz/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Datenschutzerklärung | Dataquard",
  description: "Datenschutzerklärung von Dataquard – dataquard.ch",
};

export default function DatenschutzPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#040c1c", fontFamily: "'DM Sans', sans-serif", color: "#e2eaf3" }}>
      <header style={{ borderBottom: "1px solid rgba(0,230,118,0.15)", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 19l-7-7 7-7" stroke="#00e676" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ color: "#9ab0c8", fontSize: "0.85rem" }}>Zurück</span>
        </Link>
        <span style={{ fontWeight: 700 }}>
          <span style={{ color: "#4d9fff" }}>Data</span>
          <span style={{ color: "#c0392b" }}>guard</span>
        </span>
        <div style={{ width: "60px" }} />
      </header>

      <main style={{ maxWidth: "760px", margin: "0 auto", padding: "3rem 2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.5rem" }}>Datenschutzerklärung</h1>
        <p style={{ color: "#6b8499", fontSize: "0.85rem", marginBottom: "2.5rem" }}>
          Stand: März 2026 · Dataquard, Richard Rickli, Basel-Region
        </p>

        <Section title="1. Verantwortlicher">
          <p>Verantwortlicher im Sinne des Schweizer Datenschutzgesetzes (nDSG) sowie der EU-Datenschutz-Grundverordnung (DSGVO):</p>
          <p><strong style={{ color: "#e2eaf3" }}>Richard Rickli</strong><br />
          Dataquard<br />
          Basel-Region, Schweiz<br />
          E-Mail: info@dataquard.ch<br />
          Website: dataquard.ch</p>
        </Section>

        <Section title="2. Erhobene Daten">
          <p>Wir erheben folgende Daten wenn Sie dataquard.ch nutzen:</p>
          <ul>
            <li><strong style={{ color: "#e2eaf3" }}>Konto-Daten:</strong> E-Mail-Adresse bei Registrierung (via Supabase Auth)</li>
            <li><strong style={{ color: "#e2eaf3" }}>Scan-Daten:</strong> Von Ihnen eingegebene URLs zur Website-Analyse</li>
            <li><strong style={{ color: "#e2eaf3" }}>Zahlungsdaten:</strong> Stripe verarbeitet Zahlungen – wir sehen nur Transaktions-IDs</li>
            <li><strong style={{ color: "#e2eaf3" }}>Technische Daten:</strong> IP-Adresse, Browser-Typ, Zugriffszeitpunkt (Vercel Logs)</li>
          </ul>
        </Section>

        <Section title="3. Zweck der Datenverarbeitung">
          <p>Wir verarbeiten Ihre Daten ausschliesslich zur:</p>
          <ul>
            <li>Bereitstellung des Website-Scan-Dienstes</li>
            <li>Generierung von Compliance-Dokumenten</li>
            <li>Zahlungsabwicklung via Stripe</li>
            <li>Verbesserung unseres Dienstes (anonyme Analyse)</li>
          </ul>
        </Section>

        <Section title="4. Drittanbieter">
          <p>Wir nutzen folgende Drittanbieter:</p>
          <ul>
            <li><strong style={{ color: "#e2eaf3" }}>Supabase</strong> – Datenbank und Authentifizierung (Server: Zürich, Schweiz)</li>
            <li><strong style={{ color: "#e2eaf3" }}>Vercel</strong> – Hosting (Daten können auf EU-Servern verarbeitet werden)</li>
            <li><strong style={{ color: "#e2eaf3" }}>Stripe</strong> – Zahlungsabwicklung (USA – Privacy Shield / SCCs)</li>
            <li><strong style={{ color: "#e2eaf3" }}>Anthropic Claude API</strong> – KI-Analyse (USA – SCCs)</li>
            <li><strong style={{ color: "#e2eaf3" }}>Resend</strong> – E-Mail-Versand (USA – SCCs)</li>
          </ul>
        </Section>

        <Section title="5. Datenspeicherung">
          <p>Ihre Konto- und Scan-Daten werden auf <strong style={{ color: "#e2eaf3" }}>Schweizer Servern (Supabase Zürich, eu-central-2)</strong> gespeichert. Wir geben Ihre Daten nicht an Dritte weiter, ausser es ist zur Leistungserbringung erforderlich (Stripe, Vercel).</p>
        </Section>

        <Section title="6. Cookies">
          <p>Wir verwenden folgende Cookies:</p>
          <ul>
            <li><strong style={{ color: "#e2eaf3" }}>Essenzielle Cookies:</strong> Session-Management, Sicherheit, Consent-Speicherung – immer aktiv</li>
            <li><strong style={{ color: "#e2eaf3" }}>Analyse-Cookies:</strong> Vercel Analytics (anonymisiert) – nur mit Ihrer Einwilligung</li>
            <li><strong style={{ color: "#e2eaf3" }}>Marketing-Cookies:</strong> Stripe Checkout – nur mit Ihrer Einwilligung</li>
          </ul>
          <p>Sie können Ihre Cookie-Einstellungen jederzeit über den Banner am Seitenrand ändern.</p>
        </Section>

        <Section title="7. Ihre Rechte (nDSG / DSGVO)">
          <p>Sie haben das Recht auf:</p>
          <ul>
            <li>Auskunft über Ihre gespeicherten Daten (Art. 25 nDSG / Art. 15 DSGVO)</li>
            <li>Berichtigung unrichtiger Daten (Art. 32 nDSG / Art. 16 DSGVO)</li>
            <li>Löschung Ihrer Daten (Art. 32 nDSG / Art. 17 DSGVO)</li>
            <li>Widerspruch gegen die Verarbeitung (Art. 30 nDSG / Art. 21 DSGVO)</li>
            <li>Datenübertragbarkeit (Art. 28 nDSG / Art. 20 DSGVO)</li>
          </ul>
          <p>Kontakt für Datenschutzanfragen: <a href="mailto:info@dataquard.ch" style={{ color: "#00e676" }}>info@dataquard.ch</a></p>
        </Section>

        <Section title="8. Aufbewahrungsdauer">
          <p>Konto-Daten werden gelöscht sobald Sie Ihr Konto schliessen. Scan-Daten werden nach 12 Monaten automatisch gelöscht. Zahlungsbelege werden gemäss gesetzlicher Aufbewahrungspflicht (10 Jahre) gespeichert.</p>
        </Section>

        <Section title="9. Änderungen">
          <p>Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf anzupassen. Die aktuelle Version ist stets unter dataquard.ch/datenschutz abrufbar.</p>
        </Section>

        <div style={{ marginTop: "3rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(154,176,200,0.1)", display: "flex", gap: "1rem" }}>
          <Link href="/impressum-generator" style={{ color: "#9ab0c8", fontSize: "0.82rem", textDecoration: "none" }}>Impressum</Link>
          <Link href="/agb" style={{ color: "#9ab0c8", fontSize: "0.82rem", textDecoration: "none" }}>AGB</Link>
          <Link href="/" style={{ color: "#9ab0c8", fontSize: "0.82rem", textDecoration: "none" }}>Startseite</Link>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: "2rem" }}>
      <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#00e676", marginBottom: "0.75rem", paddingBottom: "0.4rem", borderBottom: "1px solid rgba(0,230,118,0.15)" }}>
        {title}
      </h2>
      <div style={{ color: "#9ab0c8", fontSize: "0.875rem", lineHeight: 1.75 }}>
        {children}
      </div>
    </section>
  );
}
