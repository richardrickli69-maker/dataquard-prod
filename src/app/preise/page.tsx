// src/app/preise/page.tsx
// Preise-Seite — Pricing Cards, Wettbewerbsvergleich, Preis-FAQ

import type { Metadata } from 'next';
import Link from 'next/link';
import { PageWrapper } from '../components/PageWrapper';

export const metadata: Metadata = {
  title: 'Preise — Dataquard ab CHF 19.–/Mt. | Website Compliance Schweiz',
  description: 'Dataquard Preise: Free (kostenlos), Starter CHF 19.–/Mt., Professional CHF 39.–/Mt. Jährliche Abrechnung, jederzeit kündbar, 14 Tage Geld-zurück-Garantie.',
  alternates: { canonical: 'https://www.dataquard.ch/preise' },
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
};

const PLANS = [
  {
    n: 'Free', sub: 'Check', badge: null as string | null,
    hl: false, best: false,
    p: 'CHF 0.–', pMt: null as string | null, pYear: null as string | null,
    pNote: 'immer kostenlos',
    d: 'Für den ersten Überblick',
    f: ['Website-Scan & Compliance-Bericht (Ampel-System)', 'Performance & Security-Check', 'Vorschau für 5 KI-Bilder'],
    m: ['nDSG-Datenschutzerklärung & Impressum', 'Monatlicher Compliance-Report'],
    c: 'Kostenlos scannen', l: '/scanner',
  },
  {
    n: 'Starter', sub: 'Basis', badge: 'EMPFOHLEN' as string | null,
    hl: true, best: false,
    p: 'CHF 19.–', pMt: '/Mt.' as string | null, pYear: '(CHF 228.– / Jahr)' as string | null,
    pNote: 'Jährliche Abrechnung — jederzeit kündbar',
    d: 'Für Schweizer KMUs',
    f: ['Website-Scan & Compliance-Bericht', 'nDSG-Datenschutzerklärung & Impressum', 'Cookie-Banner inklusive', 'Autom. Scan für 50 KI-Bilder', 'Monatlicher Compliance-Report per E-Mail', 'SSL-Ablauf Warnung'],
    m: [],
    c: 'Jetzt starten', l: '/checkout',
  },
  {
    n: 'Professional', sub: 'Sorglos', badge: 'BESTSELLER' as string | null,
    hl: false, best: true,
    p: 'CHF 39.–', pMt: '/Mt.' as string | null, pYear: '(CHF 468.– / Jahr)' as string | null,
    pNote: 'Jährliche Abrechnung — jederzeit kündbar',
    d: 'Unser Bestseller',
    f: ['Alles aus Starter', 'Bis zu 5 Domains & Full AI-Scan (250 Bilder)', 'Schutz vor Deepfakes & Alerts in Echtzeit', 'AI-Shield Badge (EU AI Act)', 'Wöchentlicher Compliance-Report per E-Mail', 'Autom. Update der DSE bei neuen KI-Inhalten', 'Alert bei neuen KI-Bildern ohne Kennzeichnung'],
    m: [],
    c: 'Professional wählen', l: '/checkout',
  },
];

const PRICE_FAQS = [
  { q: 'Kann ich mein Abo jederzeit kündigen?', a: 'Ja. Die Kündigung ist jederzeit im Dashboard unter «Abrechnung» möglich. Sie bleibt aktiv bis zum Ende der bereits bezahlten Laufzeit. Sie behalten den Zugang bis zum letzten bezahlten Tag.' },
  { q: 'Gibt es eine Geld-zurück-Garantie?', a: 'Ja — 14 Tage ohne Angabe von Gründen. Wenn Sie nicht zufrieden sind, erstatten wir Ihnen den vollen Betrag. Einfach eine E-Mail an support@dataquard.ch genügt.' },
  { q: 'Verlängert sich mein Abo automatisch?', a: 'Ja. Jahresabos verlängern sich automatisch um ein weiteres Jahr, sofern Sie nicht vorher kündigen. Sie erhalten 30 Tage vor der Verlängerung eine E-Mail-Erinnerung.' },
  { q: 'Was passiert nach dem Abo-Ablauf?', a: 'Wenn Sie kündigen, behalten Sie Ihren Zugang bis zum Ende der bezahlten Laufzeit. Danach werden Ihre generierten Dokumente gespeichert, aber keine neuen Scans oder Generierungen mehr möglich.' },
  { q: 'Welche Zahlungsmittel akzeptieren Sie?', a: 'Wir akzeptieren alle gängigen Kreditkarten (Visa, Mastercard, Amex) über Stripe. Die Zahlung erfolgt sicher und verschlüsselt. Es gibt keine versteckten Kosten.' },
  { q: 'Kann ich von Starter auf Professional upgraden?', a: 'Ja, jederzeit. Das Upgrade ist sofort aktiv und Sie zahlen nur die Differenz für die verbleibende Laufzeit. Kontaktieren Sie uns unter support@dataquard.ch.' },
];

export default function PreisePage() {
  return (
    <PageWrapper>
      <style>{`
        @media (max-width: 768px) {
          .preise-grid-3 { grid-template-columns: 1fr !important; }
          .table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .table-scroll table { min-width: 520px; }
        }
      `}</style>

      {/* ═══ HERO ═══ */}
      <section style={{ textAlign: 'center', padding: '56px 24px 40px', maxWidth: 700, margin: '0 auto' }}>
        <span style={{ display: 'inline-block', background: G.greenBg, border: `1px solid ${G.greenBorder}`, color: G.green, fontSize: 11, fontWeight: 700, padding: '5px 14px', borderRadius: 20, letterSpacing: 0.5, marginBottom: 20 }}>
          PREISE & PLÄNE
        </span>
        <h1 style={{ fontSize: 40, fontWeight: 900, lineHeight: 1.12, marginBottom: 14, letterSpacing: -1, color: G.text }}>
          Transparent. Fair. <span style={{ color: G.green }}>Schweizer Qualität.</span>
        </h1>
        <p style={{ fontSize: 16, color: G.textSec, lineHeight: 1.7 }}>
          Alle Preise in CHF · Jährliche Abrechnung · Jederzeit kündbar · 14 Tage Geld-zurück-Garantie
        </p>
      </section>

      {/* ═══ PRICING CARDS ═══ */}
      <section style={{ maxWidth: 920, margin: '0 auto', padding: '0 24px 50px' }}>
        <div className="preise-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {PLANS.map(pl => (
            <div key={pl.n} style={{ padding: 22, borderRadius: 14, border: (pl.hl || pl.best) ? `2px solid ${G.green}` : `1px solid ${G.border}`, background: G.bgWhite, position: 'relative', boxShadow: (pl.hl || pl.best) ? `0 4px 20px ${G.greenBg}` : '0 2px 8px rgba(0,0,0,0.03)' }}>
              {pl.badge && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: G.green, color: '#fff', fontSize: 9, fontWeight: 800, padding: '3px 12px', borderRadius: 20, letterSpacing: 1, whiteSpace: 'nowrap' }}>{pl.badge}</div>
              )}
              <h3 style={{ fontSize: 18, fontWeight: 700, color: G.text }}>{pl.n}</h3>
              <div style={{ fontSize: 11, color: (pl.hl || pl.best) ? G.green : G.textMuted, marginBottom: 6 }}>{pl.sub}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, margin: '8px 0 0' }}>
                <span style={{ fontSize: pl.pMt ? 30 : 24, fontWeight: 900, color: (pl.hl || pl.best) ? G.green : G.text }}>{pl.p}</span>
                {pl.pMt && <span style={{ fontSize: 13, color: G.textMuted }}>{pl.pMt}</span>}
              </div>
              {pl.pYear && <div style={{ fontSize: 12, color: G.textMuted, marginBottom: 2 }}>{pl.pYear}</div>}
              <div style={{ fontSize: 10, color: G.textMuted, marginBottom: 14 }}>{pl.pNote}</div>
              <div style={{ fontSize: 11, color: G.textSec, marginBottom: 14 }}>{pl.d}</div>
              {pl.f.map(f => (
                <div key={f} style={{ fontSize: 14, color: G.text, padding: '2px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <img src="/checkmark.png" alt="Verfügbar" width={14} height={14} style={{ flexShrink: 0 }} />{f}
                </div>
              ))}
              {pl.m.map(f => (
                <div key={f} style={{ fontSize: 14, color: G.textMuted, padding: '2px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <img src="/fehler.png" alt="Nicht verfügbar" width={14} height={14} style={{ flexShrink: 0, opacity: 0.45 }} />{f}
                </div>
              ))}
              <Link href={pl.l} style={{ display: 'block', textAlign: 'center', marginTop: 16, padding: '10px 0', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none', background: (pl.hl || pl.best) ? G.green : 'transparent', color: (pl.hl || pl.best) ? '#fff' : G.green, border: (pl.hl || pl.best) ? 'none' : `2px solid ${G.green}` }}>{pl.c}</Link>
            </div>
          ))}
        </div>
        <p style={{ textAlign: 'center', fontSize: 11, color: G.textMuted, marginTop: 16 }}>
          Alle Preise in CHF inkl. MwSt. · Jährliche Abrechnung · Jederzeit kündbar
        </p>
      </section>

      {/* ═══ PREIS-FAQ ═══ */}
      <section style={{ maxWidth: 700, margin: '0 auto', padding: '50px 24px', borderTop: `1px solid ${G.border}` }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <span style={{ color: G.green, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>FAQ</span>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginTop: 6, color: G.text }}>Häufige Fragen zu Preisen</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {PRICE_FAQS.map(faq => (
            <details key={faq.q} style={{ background: G.bgWhite, borderRadius: 12, border: `1px solid ${G.border}`, overflow: 'hidden' }}>
              <summary style={{ padding: '16px 18px', fontWeight: 600, fontSize: 14, color: G.text, cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{faq.q}</span>
                <span style={{ color: G.green, fontSize: 18, flexShrink: 0, marginLeft: 12 }}>▾</span>
              </summary>
              <div style={{ padding: '12px 18px 16px', fontSize: 14, color: G.textSec, lineHeight: 1.7, borderTop: `1px solid ${G.border}` }}>
                {faq.a}
              </div>
            </details>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link href="/faq" style={{ color: G.green, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            Alle FAQ ansehen →
          </Link>
        </div>
      </section>

      {/* ═══ BOTTOM CTA ═══ */}
      <section style={{ padding: '56px 24px', textAlign: 'center', borderTop: `1px solid ${G.border}` }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: G.text, marginBottom: 10 }}>
          Starten Sie kostenlos — upgraden Sie wenn Sie bereit sind.
        </h2>
        <p style={{ color: G.textSec, fontSize: 15, marginBottom: 28 }}>
          Kein Risiko. 14 Tage Geld-zurück-Garantie.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/scanner" style={{ padding: '12px 28px', border: `2px solid ${G.green}`, color: G.green, fontWeight: 700, borderRadius: 10, fontSize: 15, textDecoration: 'none' }}>
            Kostenlos scannen →
          </Link>
          <Link href="/checkout" style={{ padding: '12px 28px', background: G.green, color: '#fff', fontWeight: 700, borderRadius: 10, fontSize: 15, textDecoration: 'none', boxShadow: '0 4px 12px rgba(34,197,94,0.3)' }}>
            Starter wählen →
          </Link>
        </div>
      </section>

    </PageWrapper>
  );
}
