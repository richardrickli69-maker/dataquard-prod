// Placeholder — wird in Teil B mit Vergleichstabelle und vollständigen Preisen befüllt
import { PageWrapper } from '../components/PageWrapper';
import Link from 'next/link';

export const metadata = {
  title: 'Preise – Dataquard',
  description: 'Dataquard Jahresabos: Starter CHF 19.–/Mt. und Professional CHF 39.–/Mt. Jährliche Abrechnung, jederzeit kündbar.',
};

export default function PreisePage() {
  return (
    <PageWrapper>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)', fontSize: 11, fontWeight: 700, padding: '5px 14px', borderRadius: 20, color: '#22c55e', letterSpacing: 0.5, marginBottom: 24 }}>
          Seite in Kürze verfügbar
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 16, color: '#1a1a2e' }}>Preise &amp; Pläne</h1>
        <p style={{ color: '#555566', fontSize: 16, lineHeight: 1.7, marginBottom: 32 }}>
          Diese Seite wird gerade ausgebaut. In der Zwischenzeit finden Sie alle Preise direkt auf der{' '}
          <Link href="/#preise" style={{ color: '#22c55e', textDecoration: 'none', fontWeight: 600 }}>Startseite</Link>.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/#preise" style={{ padding: '12px 28px', background: '#22c55e', color: '#fff', fontWeight: 700, borderRadius: 10, fontSize: 14, textDecoration: 'none' }}>
            Preise ansehen →
          </Link>
          <Link href="/" style={{ padding: '12px 28px', border: '2px solid #22c55e', color: '#22c55e', fontWeight: 700, borderRadius: 10, fontSize: 14, textDecoration: 'none' }}>
            ← Zurück
          </Link>
        </div>
      </div>
    </PageWrapper>
  );
}
