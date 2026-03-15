import Link from 'next/link';
import { PageWrapper } from '../components/PageWrapper';

export const metadata = {
  title: 'AGB – Dataquard',
  description: 'Allgemeine Geschäftsbedingungen von Dataquard – Datenschutz, Zahlung, Garantie und Haftung.',
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

export default function AGBPage() {
  return (
    <PageWrapper>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px' }}>

        <div style={{ marginBottom: 40 }}>
          <Link href="/" style={{ color: G.textMuted, fontSize: 13, textDecoration: 'none' }}>← Zurück zur Startseite</Link>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginTop: 20, marginBottom: 6, color: G.text }}>📋 Allgemeine Geschäftsbedingungen</h1>
          <p style={{ color: G.textMuted, fontSize: 13 }}>Stand: März 2026 · Dataquard, Reinach BL, Schweiz</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div style={{ background: G.bgWhite, border: `1px solid ${G.border}`, borderRadius: 16, padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 28 }}>🔒</span>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: G.text }}>1. Datenschutz</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, color: G.textSec, fontSize: 14, lineHeight: 1.7 }}>
              <p>Dataquard verarbeitet personenbezogene Daten ausschliesslich im Einklang mit dem Schweizer Datenschutzgesetz (nDSG) und der DSGVO.</p>
              <p>Ihre Daten werden ausschliesslich auf Schweizer Servern (Zürich) gespeichert und nie an Dritte weitergegeben oder für Werbezwecke verwendet.</p>
              <p>Wir erheben nur jene Daten, die zur Erbringung unserer Dienstleistungen notwendig sind (Domain, Unternehmensname, E-Mail-Adresse).</p>
              <p>Sie haben jederzeit das Recht auf Auskunft, Berichtigung und Löschung Ihrer Daten. Anfragen richten Sie bitte an: <span style={{ color: G.green }}>datenschutz@dataquard.ch</span></p>
            </div>
          </div>

          <div style={{ background: G.bgWhite, border: `1px solid ${G.border}`, borderRadius: 16, padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 28 }}>💳</span>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: G.text }}>2. Zahlung</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, color: G.textSec, fontSize: 14, lineHeight: 1.7 }}>
              <p>Alle Dataquard-Produkte werden als <strong style={{ color: G.text }}>Einmalkauf</strong> angeboten. Es entstehen keine automatischen Verlängerungen oder wiederkehrenden Gebühren.</p>
              <p>Die aktuellen Preise:</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li style={{ display: 'flex', gap: 8 }}><span style={{ color: G.green }}>·</span> Impressum Generator: CHF 19 (einmalig)</li>
                <li style={{ display: 'flex', gap: 8 }}><span style={{ color: G.green }}>·</span> Starter: CHF 79 (einmalig, 1 Domain)</li>
                <li style={{ display: 'flex', gap: 8 }}><span style={{ color: G.green }}>·</span> Professional: CHF 149 (einmalig, bis 5 Domains)</li>
              </ul>
              <p>Alle Preise verstehen sich in CHF inkl. MwSt. Die Zahlung erfolgt sicher über Stripe. Wir akzeptieren Kreditkarten und TWINT.</p>
              <p>Es gibt keine versteckten Kosten. Was Sie sehen, ist was Sie zahlen.</p>
            </div>
          </div>

          <div style={{ background: G.bgWhite, border: `1px solid ${G.border}`, borderRadius: 16, padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 28 }}>↩️</span>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: G.text }}>3. 30 Tage Geld-zurück-Garantie</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, color: G.textSec, fontSize: 14, lineHeight: 1.7 }}>
              <p>Wir sind von unseren Produkten überzeugt. Wenn Sie aus irgendeinem Grund nicht zufrieden sind, erstatten wir Ihnen den vollen Kaufpreis – ohne Angabe von Gründen – innerhalb von 30 Tagen nach dem Kauf.</p>
              <p>Für eine Rückerstattung wenden Sie sich einfach an: <span style={{ color: G.green }}>support@dataquard.ch</span></p>
              <p>Die Rückerstattung erfolgt auf das ursprüngliche Zahlungsmittel innerhalb von 5–10 Werktagen.</p>
            </div>
          </div>

          <div style={{ background: G.bgWhite, border: `1px solid ${G.border}`, borderRadius: 16, padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 28 }}>⚖️</span>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: G.text }}>4. Haftung</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, color: G.textSec, fontSize: 14, lineHeight: 1.7 }}>
              <p>Dataquard stellt Werkzeuge und Vorlagen zur Unterstützung bei der Datenschutz-Compliance bereit. Unsere generierten Dokumente basieren auf juristisch validierten Textbausteinen.</p>
              <p><strong style={{ color: G.text }}>Dataquard ersetzt keine individuelle Rechtsberatung.</strong> Für rechtsverbindliche Prüfungen und spezifische rechtliche Situationen empfehlen wir die Konsultation eines qualifizierten Datenschutzanwalts.</p>
              <p>Dataquard übernimmt keine Haftung für Schäden, die durch die Verwendung der generierten Dokumente entstehen, sofern diese nicht dem Schweizer Recht entsprechen sollten.</p>
              <p>Bei Fragen wenden Sie sich an: <span style={{ color: G.green }}>support@dataquard.ch</span></p>
            </div>
          </div>

          <div style={{ background: G.bgLight, border: `1px solid ${G.border}`, borderRadius: 12, padding: '20px 24px', fontSize: 13, color: G.textMuted }}>
            <p><strong style={{ color: G.textSec }}>Gerichtsstand & anwendbares Recht:</strong> Es gilt Schweizer Recht. Gerichtsstand ist Reinach BL, Schweiz.</p>
            <p style={{ marginTop: 6 }}><strong style={{ color: G.textSec }}>Kontakt:</strong> Dataquard · Reinach BL, Schweiz · <span style={{ color: G.green }}>support@dataquard.ch</span></p>
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
