import Link from 'next/link';
import { PageWrapper } from '../components/PageWrapper';

export const metadata = {
  title: 'AGB – Dataquard',
  description: 'Allgemeine Geschäftsbedingungen von Dataquard – Geltungsbereich, Datenschutz, Preise, Kündigung, Garantie und Haftung.',
};

const G = {
  green: '#22c55e',
  bg: '#f8f9fb',
  bgWhite: '#ffffff',
  bgLight: '#f1f2f6',
  border: '#e2e4ea',
  text: '#1a1a2e',
  textSec: '#555566',
  textMuted: '#888899',
};

// Wiederverwendbarer Bullet-Eintrag fuer Preislisten
function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li style={{ display: 'flex', gap: 8 }}>
      <span style={{ color: G.green }}>·</span>
      <span>{children}</span>
    </li>
  );
}

export default function AGBPage() {
  return (
    <PageWrapper>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px' }}>

        {/* Titel */}
        <div style={{ marginBottom: 40 }}>
          <Link href="/" style={{ color: G.textMuted, fontSize: 13, textDecoration: 'none' }}>← Zurück zur Startseite</Link>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginTop: 20, marginBottom: 6, color: G.text }}>Allgemeine Geschäftsbedingungen</h1>
          <p style={{ color: G.textMuted, fontSize: 13 }}>Stand: April 2026 · Dataquard, Reinach BL, Schweiz</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ─── 1. Geltungsbereich ─── */}
          <div style={{ background: G.bgWhite, border: `1px solid ${G.border}`, borderRadius: 16, padding: '32px' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: G.text, marginBottom: 16 }}>1. Geltungsbereich</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, color: G.textSec, fontSize: 14, lineHeight: 1.7 }}>
              <p>Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Dienstleistungen von Dataquard, Reinach BL, Schweiz. Mit der Registrierung oder dem Abschluss eines Abonnements akzeptieren Sie diese AGB.</p>
              <p>Dataquard bietet automatisierte Website-Compliance-Analysen, die Generierung von Datenschutzerklärungen, Impressum und Cookie-Bannern sowie die Erkennung von KI-generierten Bildern an.</p>
            </div>
          </div>

          {/* ─── 2. Datenschutz ─── */}
          <div style={{ background: G.bgWhite, border: `1px solid ${G.border}`, borderRadius: 16, padding: '32px' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: G.text, marginBottom: 16 }}>2. Datenschutz</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, color: G.textSec, fontSize: 14, lineHeight: 1.7 }}>
              <p>Dataquard verarbeitet personenbezogene Daten ausschliesslich im Einklang mit dem Schweizer Datenschutzgesetz (nDSG) und der DSGVO.</p>
              <p>Ihre Daten werden ausschliesslich auf Schweizer Servern (Zürich) gespeichert und nie an Dritte weitergegeben oder für Werbezwecke verwendet.</p>
              <p>Wir erheben nur jene Daten, die zur Erbringung unserer Dienstleistungen notwendig sind (Domain, Unternehmensname, E-Mail-Adresse).</p>
              <p>Für den Versand von Transaktions-E-Mails, Compliance-Reports und Sicherheits-Alerts nutzen wir den Dienst Resend (Serverstandort: EU). Ihre E-Mail-Adresse wird zu diesem Zweck an Resend übermittelt.</p>
              <p>Sie haben jederzeit das Recht auf Auskunft, Berichtigung und Löschung Ihrer Daten. Anfragen richten Sie bitte an: <span style={{ color: G.green }}>datenschutz@dataquard.ch</span></p>
            </div>
          </div>

          {/* ─── 3. Leistungsumfang & Preise ─── */}
          <div style={{ background: G.bgWhite, border: `1px solid ${G.border}`, borderRadius: 16, padding: '32px' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: G.text, marginBottom: 16 }}>3. Leistungsumfang &amp; Preise</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, color: G.textSec, fontSize: 14, lineHeight: 1.7 }}>
              <p>Dataquard bietet folgende Abonnements an:</p>

              <div>
                <p style={{ fontWeight: 700, color: G.text, marginBottom: 6 }}>KMU-Pläne (jährliche Abrechnung):</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Bullet>FREE: CHF 0.– — Website-Scan, Ampel-Score, Vorschau für 5 KI-Bilder</Bullet>
                  <Bullet>Starter: CHF 19.–/Mt. (CHF 228.–/Jahr) — 1 Domain, DSE, Impressum, Cookie-Banner, 50 KI-Bilder, monatlicher Compliance-Report</Bullet>
                  <Bullet>Professional: CHF 39.–/Mt. (CHF 468.–/Jahr) — bis 5 Domains, 250 KI-Bilder, Deepfake-Schutz, Echtzeit-Alerts, AI-Shield Badge, wöchentlicher Compliance-Report, automatische DSE-Aktualisierung</Bullet>
                </ul>
              </div>

              <div>
                <p style={{ fontWeight: 700, color: G.text, marginBottom: 6 }}>Agency-Pläne (monatliche Abrechnung):</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Bullet>Agency Basic: CHF 79.–/Mt. — bis 15 Domains, monatlicher AI-Compliance-Scan, Dashboard, PDF-Reports</Bullet>
                  <Bullet>Agency Pro: CHF 179.–/Mt. — bis 50 Domains, wöchentliche Scans, White-Label-Reports, AI-Shield Badge, Bulk-CSV, Priority Support</Bullet>
                </ul>
              </div>

              <div>
                <p style={{ fontWeight: 700, color: G.text, marginBottom: 6 }}>Optionaler Agency Add-on:</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Bullet>Document Pack: CHF 9.–/Domain/Mt. (DSE, Impressum, Cookie-Banner pro Domain)</Bullet>
                </ul>
              </div>

              <div>
                <p style={{ fontWeight: 700, color: G.text, marginBottom: 6 }}>Advokatur-Plan — Kanzlei-Partnerschaft (monatliche Abrechnung):</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Bullet>CHF 149.–/Mt. — bis 30 Mandanten-Domains, automatisierter 4-Säulen-Scan (Compliance, Performance, Security, KI-Sicherheit), White-Label PDF-Reports mit Kanzlei-Branding, wöchentliche Re-Scans, Echtzeit-Alerts bei neuen Trackern oder SSL-Problemen, Dashboard mit Ampel-Übersicht pro Mandant, persönlicher Onboarding-Call, Daten in der Schweiz</Bullet>
                </ul>
              </div>

              <p>Alle Preise verstehen sich in CHF inkl. MwSt. Die Zahlung erfolgt sicher über Stripe. Wir akzeptieren Kreditkarten. Es gibt keine versteckten Kosten.</p>
            </div>
          </div>

          {/* ─── 4. Zahlungsbedingungen ─── */}
          <div style={{ background: G.bgWhite, border: `1px solid ${G.border}`, borderRadius: 16, padding: '32px' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: G.text, marginBottom: 16 }}>4. Zahlungsbedingungen</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, color: G.textSec, fontSize: 14, lineHeight: 1.7 }}>
              <p>KMU-Pläne (Starter, Professional) werden <strong style={{ color: G.text }}>jährlich im Voraus</strong> abgerechnet.</p>
              <p>Agency-Pläne (Basic, Pro) und der Advokatur-Plan (Kanzlei-Partnerschaft) werden <strong style={{ color: G.text }}>monatlich</strong> abgerechnet.</p>
              <p>Die Zahlungsmethode wird bei Stripe hinterlegt. Bei wiederkehrenden Abonnements wird die Zahlung automatisch zum jeweiligen Fälligkeitsdatum eingezogen.</p>
              <p>Bei Zahlungsausfall wird der Kunde per E-Mail benachrichtigt. Bleibt die Zahlung nach 14 Tagen aus, wird der Zugang vorübergehend gesperrt.</p>
            </div>
          </div>

          {/* ─── 5. Kündigung ─── */}
          <div style={{ background: G.bgWhite, border: `1px solid ${G.border}`, borderRadius: 16, padding: '32px' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: G.text, marginBottom: 16 }}>5. Kündigung</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, color: G.textSec, fontSize: 14, lineHeight: 1.7 }}>
              <p>Eine Kündigung ist jederzeit möglich — direkt im Dashboard unter «Abrechnung» oder per E-Mail an <span style={{ color: G.green }}>support@dataquard.ch</span>.</p>
              <p>Die Kündigung wird zum Ende der bezahlten Laufzeit wirksam. Bis dahin behalten Sie vollen Zugang zu allen Funktionen Ihres Plans. Nach der Kündigung werden keine weiteren Zahlungen eingezogen.</p>
              <p>Nach Ablauf Ihres Abonnements bleiben Ihre Scan-Daten noch 30 Tage gespeichert. Danach werden sie unwiderruflich gelöscht.</p>
              <p>Sie erhalten eine Bestätigungs-E-Mail, sobald Ihre Kündigung verarbeitet wurde.</p>
              <p>Sie können jederzeit wieder einsteigen und ein neues Abonnement abschliessen.</p>
            </div>
          </div>

          {/* ─── 6. Automatische Verlängerung ─── */}
          <div style={{ background: G.bgWhite, border: `1px solid ${G.border}`, borderRadius: 16, padding: '32px' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: G.text, marginBottom: 16 }}>6. Automatische Verlängerung</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, color: G.textSec, fontSize: 14, lineHeight: 1.7 }}>
              <p><strong style={{ color: G.text }}>KMU-Pläne (jährlich):</strong> 30 Tage vor Ablauf erhalten Sie eine E-Mail-Erinnerung. Das Abonnement verlängert sich automatisch um ein weiteres Jahr, sofern nicht vor Ablauf gekündigt wird.</p>
              <p><strong style={{ color: G.text }}>Agency- und Advokatur-Pläne (monatlich):</strong> Das Abonnement verlängert sich automatisch um einen weiteren Monat, sofern nicht vor Ablauf gekündigt wird.</p>
            </div>
          </div>

          {/* ─── 7. Geld-zurück-Garantie ─── */}
          <div style={{ background: G.bgWhite, border: `1px solid ${G.border}`, borderRadius: 16, padding: '32px' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: G.text, marginBottom: 16 }}>7. Geld-zurück-Garantie</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, color: G.textSec, fontSize: 14, lineHeight: 1.7 }}>
              <p>Innerhalb der ersten 14 Tage nach Abschluss eines kostenpflichtigen Abonnements können Sie ohne Angabe von Gründen kündigen und erhalten eine volle Rückerstattung.</p>
              <p>Für eine Rückerstattung wenden Sie sich an: <span style={{ color: G.green }}>support@dataquard.ch</span></p>
              <p>Die Rückerstattung erfolgt auf das ursprüngliche Zahlungsmittel innerhalb von 5–10 Werktagen.</p>
              <p>Nach Ablauf der 14-Tage-Frist ist keine Rückerstattung mehr möglich. Das Abonnement läuft bis zum Ende der bezahlten Laufzeit weiter.</p>
            </div>
          </div>

          {/* ─── 8. Haftung ─── */}
          <div style={{ background: G.bgWhite, border: `1px solid ${G.border}`, borderRadius: 16, padding: '32px' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: G.text, marginBottom: 16 }}>8. Haftung</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, color: G.textSec, fontSize: 14, lineHeight: 1.7 }}>
              <p>Dataquard stellt Werkzeuge und Vorlagen zur Unterstützung bei der Datenschutz-Compliance bereit. Unsere generierten Dokumente basieren auf juristisch validierten Textbausteinen.</p>
              <p><strong style={{ color: G.text }}>Dataquard ersetzt keine individuelle Rechtsberatung. Für rechtsverbindliche Prüfungen und spezifische rechtliche Situationen empfehlen wir die Konsultation eines qualifizierten Datenschutzanwalts.</strong></p>
              <p>Dataquard übernimmt keine Haftung für Schäden, die durch die Verwendung der generierten Dokumente entstehen, sofern diese nicht dem Schweizer Recht entsprechen sollten.</p>
              <p><strong style={{ color: G.text }}>Die KI-Bild-Erkennung erfolgt mit einer Genauigkeit von ca. 90%.</strong> Dataquard übernimmt keine Garantie für die vollständige Erkennung aller KI-generierten Inhalte.</p>
            </div>
          </div>

          {/* ─── 9. Gerichtsstand & anwendbares Recht ─── */}
          <div style={{ background: G.bgWhite, border: `1px solid ${G.border}`, borderRadius: 16, padding: '32px' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: G.text, marginBottom: 16 }}>9. Gerichtsstand &amp; anwendbares Recht</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, color: G.textSec, fontSize: 14, lineHeight: 1.7 }}>
              <p>Es gilt Schweizer Recht. Gerichtsstand ist Reinach BL, Schweiz.</p>
            </div>
          </div>

          {/* ─── 10. Kontakt ─── */}
          <div style={{ background: G.bgWhite, border: `1px solid ${G.border}`, borderRadius: 16, padding: '32px' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: G.text, marginBottom: 16 }}>10. Kontakt</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, color: G.textSec, fontSize: 14, lineHeight: 1.7 }}>
              <p>Dataquard · Reinach BL, Schweiz</p>
              <p>Allgemein: <span style={{ color: G.green }}>info@dataquard.ch</span></p>
              <p>Support &amp; Kündigungen: <span style={{ color: G.green }}>support@dataquard.ch</span></p>
              <p>Datenschutz: <span style={{ color: G.green }}>datenschutz@dataquard.ch</span></p>
            </div>
          </div>

          {/* Stand-Angabe */}
          <div style={{ background: G.bgLight, border: `1px solid ${G.border}`, borderRadius: 12, padding: '20px 24px', fontSize: 13, color: G.textMuted }}>
            <p><strong style={{ color: G.textSec }}>Stand: April 2026</strong> · Diese AGB können jederzeit angepasst werden. Die jeweils aktuelle Version ist unter dataquard.ch/agb abrufbar.</p>
          </div>

        </div>

        <div style={{ marginTop: 48, textAlign: 'center' }}>
          <Link href="/" style={{ padding: '10px 28px', border: `2px solid ${G.green}`, color: G.green, borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            ← Zurück zur Startseite
          </Link>
        </div>

      </div>
    </PageWrapper>
  );
}
