// src/app/impressum/page.task.tsx
// ÄNDERUNG: Dunkles Indigo-Theme → PageWrapper + Light Theme
import { PageWrapper } from '../components/PageWrapper';

export const metadata = {
  title: 'Impressum – Dataquard',
  description: 'Impressum und rechtliche Angaben zu Dataquard',
};

const card = {
  background: '#ffffff',
  border: '1px solid #e2e4ea',
  borderRadius: 12,
  padding: '24px 28px',
  marginBottom: 16,
};

export default function ImpressumPage() {
  return (
    <PageWrapper>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 4, color: '#1a1a2e' }}>Impressum</h1>
        <p style={{ color: '#888899', marginBottom: 36, fontSize: 13 }}>Angaben gemäss Art. 3 UWG und § 5 TMG</p>

        <div style={card}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#22c55e', marginBottom: 12 }}>Verantwortlicher</h2>
          <div style={{ color: '#555566', lineHeight: 1.9, fontSize: 14 }}>
            <p style={{ fontWeight: 700, color: '#1a1a2e' }}>Richard Rickli</p>
            <p>Gstadstrasse 53</p>
            <p>4153 Reinach BL</p>
            <p>Schweiz</p>
          </div>
        </div>

        <div style={card}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#22c55e', marginBottom: 12 }}>Kontakt</h2>
          <div style={{ color: '#555566', lineHeight: 1.9, fontSize: 14 }}>
            <p><span style={{ color: '#888899' }}>E-Mail: </span>
              <a href="mailto:richard@dataquard.ch" style={{ color: '#22c55e', textDecoration: 'none' }}>richard@dataquard.ch</a>
            </p>
            <p><span style={{ color: '#888899' }}>Website: </span>
              <a href="https://dataquard.ch" style={{ color: '#22c55e', textDecoration: 'none' }}>https://dataquard.ch</a>
            </p>
          </div>
        </div>

        <div style={card}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#22c55e', marginBottom: 12 }}>Unternehmensform</h2>
          <p style={{ color: '#555566', fontSize: 14 }}>Einzelunternehmen (nicht im Handelsregister eingetragen)</p>
        </div>

        <div style={card}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#22c55e', marginBottom: 12 }}>Haftungsausschluss</h2>
          <div style={{ color: '#555566', fontSize: 13, lineHeight: 1.8 }}>
            <h3 style={{ fontWeight: 700, color: '#1a1a2e', marginBottom: 6, fontSize: 14 }}>Haftung für Inhalte</h3>
            <p style={{ marginBottom: 14 }}>Die Inhalte dieser Website wurden mit grösster Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann jedoch keine Gewähr übernommen werden. Als Dienstanbieter bin ich gemäss Art. 19 ff. DSG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.</p>
            <h3 style={{ fontWeight: 700, color: '#1a1a2e', marginBottom: 6, fontSize: 14 }}>Haftung für Links</h3>
            <p>Diese Website enthält Links zu externen Websites Dritter, auf deren Inhalte kein Einfluss besteht. Deshalb kann für diese fremden Inhalte auch keine Gewähr übernommen werden.</p>
          </div>
        </div>

        <div style={card}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#22c55e', marginBottom: 12 }}>Urheberrecht</h2>
          <p style={{ color: '#555566', fontSize: 13, lineHeight: 1.8 }}>Die durch den Seitenbetreiber erstellten Inhalte und Werke unterliegen dem schweizerischen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung ausserhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors.</p>
        </div>

        <div style={card}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#22c55e', marginBottom: 12 }}>Streitbeilegung</h2>
          <div style={{ color: '#555566', fontSize: 13, lineHeight: 1.8 }}>
            <p style={{ marginBottom: 8 }}>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
            <p><span style={{ fontWeight: 700, color: '#1a1a2e' }}>Gerichtsstand:</span> Kanton Basel-Landschaft, Schweiz. Es gilt schweizerisches Recht.</p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
