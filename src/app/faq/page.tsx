// src/app/faq/page.tsx
// FAQ-Seite — 4 Kategorien, keine Duplikate, Styling wie /preise, Schema.org FAQPage

import type { Metadata } from 'next';
import Link from 'next/link';
import { FaqPageSchema } from '@/components/seo/SchemaOrg';
import { PageWrapper } from '../components/PageWrapper';

export const metadata: Metadata = {
  title: 'FAQ – nDSG, DSGVO & EU AI Act für Schweizer KMU | Dataquard',
  description: 'Häufige Fragen zu Datenschutz, nDSG-Konformität und EU AI Act Art. 50 für Schweizer Unternehmen – beantwortet von Dataquard.',
  alternates: { canonical: 'https://www.dataquard.ch/faq' },
};

// Design Tokens — identisch zu /preise
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

// ─── FAQ-Daten in 4 Kategorien ───────────────────────────────────────────────

const FAQ_CATEGORIES = [
  {
    title: 'Schweizer Datenschutzgesetz (nDSG)',
    icon: '/icon-recht.png',
    items: [
      {
        question: 'Was ist das nDSG und gilt es für mein Schweizer KMU?',
        answer: 'Das neue Datenschutzgesetz (nDSG) ist seit dem 1. September 2023 in Kraft. Es gilt für alle Unternehmen in der Schweiz, die Personendaten bearbeiten – also auch für jedes KMU mit einer Website. Ihre Website braucht eine aktuelle Datenschutzerklärung.',
      },
      {
        question: 'Brauche ich zwingend eine Datenschutzerklärung auf meiner Website?',
        answer: "Ja. Das nDSG verpflichtet jeden Websitebetreiber zur Transparenz über Personendatenbearbeitung. Eine fehlende Datenschutzerklärung kann zu Bussgeldern bis CHF 250'000 führen. Dataquard generiert automatisch eine nDSG-konforme Erklärung basierend auf dem Scan Ihrer Website.",
      },
      {
        question: 'Was ist der Unterschied zwischen nDSG und DSGVO?',
        answer: 'Das nDSG ist das Schweizer Gesetz, die DSGVO die EU-Verordnung. Für Schweizer KMUs gilt primär das nDSG. Die DSGVO gilt zusätzlich, wenn Sie Besucher aus der EU ansprechen. Dataquard prüft automatisch, welche Jurisdiktion zutrifft.',
      },
      {
        question: 'Wie hoch sind die Bussgelder bei nDSG-Verstössen?',
        answer: "Das nDSG sieht Bussgelder bis CHF 250'000 bei vorsätzlichen Verstössen vor. Anders als die DSGVO richtet sich die Sanktion gegen natürliche Personen wie Geschäftsführer, nicht das Unternehmen.",
      },
    ],
  },
  {
    title: 'EU AI Act & KI-Kennzeichnung',
    icon: '/badge-ai-trust.svg',
    items: [
      {
        question: 'Was ist der EU AI Act Art. 50 und gilt er in der Schweiz?',
        answer: 'Art. 50 EU AI Act verpflichtet zur Transparenz bei KI-generierten Inhalten. Für Schweizer Unternehmen mit EU-Kunden ist Konformität dringend empfohlen. Dataquard erkennt automatisch KI-generierte Inhalte und fügt die entsprechende Klausel in Ihre Datenschutzerklärung ein.',
      },
      {
        question: 'Muss ich KI-generierte Inhalte auf meiner Website kennzeichnen?',
        answer: 'Ja, sofern die Inhalte für EU-Nutzer als echt erscheinen könnten. Art. 50 EU AI Act verlangt Kennzeichnung von KI-generierten Inhalten, die zur Täuschung geeignet sind. Dataquard erkennt solche Inhalte automatisch.',
      },
      {
        question: 'Was ist eine Deepfake-Analyse und warum brauche ich sie?',
        answer: 'Eine Deepfake-Analyse prüft, ob Bilder auf Ihrer Website KI-generiert oder manipuliert wurden. Nach EU AI Act Art. 50 müssen solche Inhalte gekennzeichnet werden. Dataquard führt diesen Check automatisch bei jedem Scan durch.',
      },
      {
        question: 'Speichert Dataquard meine Bilder nach dem Scan?',
        answer: 'Nein. Dataquard verarbeitet Bilddaten ausschliesslich flüchtig im Arbeitsspeicher (RAM-only). Es werden keine Bilder gespeichert oder an Dritte weitergegeben. Die Infrastruktur läuft auf Schweizer Servern (Supabase Zürich).',
      },
    ],
  },
  {
    title: 'Dataquard Plattform',
    icon: '/icon-schutz.png',
    items: [
      {
        question: 'Wie funktioniert der automatische Compliance-Scan?',
        answer: 'Dataquard analysiert in drei Schritten: (1) Technischer Scan – Cookies, Tracker, Dienste. (2) Inhaltsanalyse – KI-Bilder, Deepfake-Verdacht. (3) Rechtliche Bewertung – nDSG, DSGVO, EU AI Act mit Ampel-Risikobewertung. Resultat: Eine sofort einsetzbare Datenschutzerklärung.',
      },
      {
        question: 'Brauche ich technische Fähigkeiten?',
        answer: 'Nein. Dataquard ist für KMUs ohne IT-Abteilung entwickelt. Sie geben Ihre Website-URL ein, der Rest läuft automatisch. Keine Installation, kein Code, keine technischen Vorkenntnisse nötig.',
      },
      {
        question: 'Wie lange dauert die Policy-Generierung?',
        answer: 'Der Scan dauert typischerweise 30–60 Sekunden. Die Datenschutzerklärung wird unmittelbar danach generiert und steht sofort als PDF und HTML zum Download bereit.',
      },
      {
        question: 'Ist die generierte Policy wirklich nDSG/DSGVO-konform?',
        answer: 'Ja. Die Texte werden basierend auf den aktuellen Anforderungen des nDSG (in Kraft seit 1.9.2023) und der DSGVO generiert, angepasst an die Dienste, die auf Ihrer spezifischen Website erkannt werden. Bei Gesetzesänderungen aktualisiert Dataquard die Vorlage entsprechend.',
      },
      {
        question: 'Was ist im Professional-Plan anders als im Starter?',
        answer: 'Der Professional-Plan (CHF 39.–/Mt.) beinhaltet alles aus Starter plus: bis zu 5 Domains gleichzeitig, Deepfake-Check & Alerts in Echtzeit, AI-Shield Badge (EU AI Act konform), wöchentliche Compliance-Reports und automatische DSE-Aktualisierung bei neuen KI-Inhalten.',
      },
    ],
  },
  {
    title: 'Preise & Abo',
    icon: '/icon-zahlung.png',
    items: [
      {
        question: 'Was kostet Dataquard?',
        answer: 'Der Basis-Scan ist kostenlos. Für die vollständigen Features (Datenschutzerklärung, Deepfake-Check, EU AI Act Art. 50 Klausel, monatlicher Compliance-Report) bieten wir zwei Jahresabos an: STARTER für CHF 19.–/Mt. (CHF 228.–/Jahr) und PROFESSIONAL für CHF 39.–/Mt. (CHF 468.–/Jahr). Jederzeit kündbar.',
      },
      {
        question: 'Kann ich mein Abo jederzeit kündigen?',
        answer: 'Ja, Ihr Abo läuft bis zum Ende der bezahlten Laufzeit und verlängert sich nur mit Ihrer Zustimmung. Eine Kündigung ist jederzeit möglich, direkt im Dashboard oder per E-Mail an support@dataquard.ch.',
      },
      {
        question: 'Gibt es eine Geld-zurück-Garantie?',
        answer: 'Ja! Innerhalb der ersten 14 Tage nach Abschluss können Sie Ihr Abo ohne Angabe von Gründen kündigen und erhalten eine volle Rückerstattung. Nach Ablauf der 14 Tage läuft Ihr Abo bis zum Ende der bezahlten Laufzeit.',
      },
      {
        question: 'Was passiert nach Ablauf meines Abos?',
        answer: 'Nach Ablauf verlieren Sie den Zugang zu den generierten Dokumenten und E-Mail-Alerts. Ihre Scan-Daten bleiben 30 Tage gespeichert. Sie können jederzeit wieder einsteigen.',
      },
      {
        question: 'Verlängert sich mein Abo automatisch?',
        answer: 'Ihr Abo verlängert sich nur mit Ihrer Zustimmung. 30 Tage vor Ablauf erhalten Sie eine E-Mail-Erinnerung. Ohne aktive Verlängerung endet Ihr Zugang automatisch.',
      },
    ],
  },
];

// Alle Items flach für Schema.org
const ALL_FAQ_ITEMS = FAQ_CATEGORIES.flatMap(c => c.items);

// ─── Seite ───────────────────────────────────────────────────────────────────

export default function FaqPage() {
  return (
    <>
      <FaqPageSchema faqs={ALL_FAQ_ITEMS} />
      <PageWrapper>
        <style>{`
          @media (max-width: 640px) {
            .faq-mobile-padding { padding-left: 16px !important; padding-right: 16px !important; }
          }
        `}</style>

        {/* ═══ HERO ═══ */}
        <section style={{ textAlign: 'center', padding: '56px 24px 40px', maxWidth: 700, margin: '0 auto' }}>
          <span style={{ display: 'inline-block', background: G.greenBg, border: `1px solid ${G.greenBorder}`, color: G.green, fontSize: 11, fontWeight: 700, padding: '5px 14px', borderRadius: 20, letterSpacing: 0.5, marginBottom: 20 }}>
            HÄUFIGE FRAGEN
          </span>
          <h1 style={{ fontSize: 40, fontWeight: 900, lineHeight: 1.12, marginBottom: 14, letterSpacing: -1, color: G.text }}>
            Datenschutz & KI-Compliance{' '}
            <span style={{ color: G.green }}>für Schweizer KMU.</span>
          </h1>
          <p style={{ fontSize: 16, color: G.textSec, lineHeight: 1.7 }}>
            Alles zu nDSG, DSGVO und EU AI Act Art. 50 – klar erklärt, ohne Juristendeutsch.
          </p>
        </section>

        {/* ═══ FAQ KATEGORIEN ═══ */}
        <section className="faq-mobile-padding" style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px 56px' }}>
          {FAQ_CATEGORIES.map((cat, ci) => (
            <div key={cat.title} style={{ marginBottom: ci < FAQ_CATEGORIES.length - 1 ? 48 : 0, borderTop: `1px solid ${G.border}`, paddingTop: 40 }}>

              {/* Kategorie-Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <img src={cat.icon} alt="" width={16} height={16} style={{ opacity: 0.75, flexShrink: 0 }} />
                <span style={{ color: G.green, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
                  {cat.title}
                </span>
              </div>

              {/* Accordion Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {cat.items.map(faq => (
                  <details
                    key={faq.question}
                    style={{ background: G.bgWhite, borderRadius: 12, border: `1px solid ${G.border}`, overflow: 'hidden' }}
                  >
                    <summary style={{ padding: '16px 18px', fontWeight: 600, fontSize: 14, color: G.text, cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{faq.question}</span>
                      <span style={{ color: G.green, fontSize: 18, flexShrink: 0, marginLeft: 12 }}>▾</span>
                    </summary>
                    <div style={{ padding: '12px 18px 16px', fontSize: 14, color: G.textSec, lineHeight: 1.7, borderTop: `1px solid ${G.border}` }}>
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* ═══ BOTTOM CTA ═══ */}
        <section style={{ padding: '56px 24px', textAlign: 'center', borderTop: `1px solid ${G.border}` }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: G.text, marginBottom: 10 }}>
            Ihre Website jetzt prüfen, kostenlos.
          </h2>
          <p style={{ color: G.textSec, fontSize: 15, marginBottom: 28 }}>
            Ergebnis in 60 Sekunden. Ohne Anmeldung. Ohne Kreditkarte.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/scanner" style={{ padding: '12px 28px', background: G.green, color: '#fff', fontWeight: 700, borderRadius: 10, fontSize: 15, textDecoration: 'none', boxShadow: '0 4px 12px rgba(34,197,94,0.3)' }}>
              Jetzt kostenlos scannen →
            </Link>
            <Link href="/preise" style={{ padding: '12px 28px', border: `2px solid ${G.green}`, color: G.green, fontWeight: 700, borderRadius: 10, fontSize: 15, textDecoration: 'none' }}>
              Preise ansehen →
            </Link>
          </div>
        </section>

      </PageWrapper>
    </>
  );
}
