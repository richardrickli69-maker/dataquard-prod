// src/app/faq/page.tsx
// FAQ-Seite — 4 Kategorien, keine Duplikate, Schema.org FAQPage Markup

import type { Metadata } from 'next';
import Link from 'next/link';
import { FaqPageSchema } from '@/components/seo/SchemaOrg';
import { PageWrapper } from '../components/PageWrapper';

export const metadata: Metadata = {
  title: 'FAQ – nDSG, DSGVO & EU AI Act für Schweizer KMU | Dataquard',
  description: 'Häufige Fragen zu Datenschutz, nDSG-Konformität und EU AI Act Art. 50 für Schweizer Unternehmen – beantwortet von Dataquard.',
  alternates: { canonical: 'https://www.dataquard.ch/faq' },
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
        answer: 'Nein. Dataquard ist für KMUs ohne IT-Abteilung entwickelt. Sie geben Ihre Website-URL ein — der Rest läuft automatisch. Keine Installation, kein Code, keine technischen Vorkenntnisse nötig.',
      },
      {
        question: 'Wie lange dauert die Policy-Generierung?',
        answer: 'Der Scan dauert typischerweise 30–60 Sekunden. Die Datenschutzerklärung wird unmittelbar danach generiert und steht sofort als PDF und HTML zum Download bereit.',
      },
      {
        question: 'Ist die generierte Policy wirklich nDSG/DSGVO-konform?',
        answer: 'Ja. Die Texte werden basierend auf den aktuellen Anforderungen des nDSG (in Kraft seit 1.9.2023) und der DSGVO generiert — angepasst an die Dienste, die auf Ihrer spezifischen Website erkannt werden. Bei Gesetzesänderungen aktualisiert Dataquard die Vorlage entsprechend.',
      },
      {
        question: 'Was ist im Professional-Plan anders als im Starter?',
        answer: 'Der Professional-Plan (CHF 39.–/Mt.) beinhaltet alles aus Starter plus: bis zu 5 Domains gleichzeitig, Deepfake-Check & Echtzeit-Alerts, AI-Shield Badge (EU AI Act konform), wöchentliche Compliance-Reports und automatische DSE-Aktualisierung bei neuen KI-Inhalten.',
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
        answer: 'Ja, Ihr Abo läuft bis zum Ende der bezahlten Laufzeit und verlängert sich nur mit Ihrer Zustimmung. Eine Kündigung ist jederzeit möglich — direkt im Dashboard oder per E-Mail an support@dataquard.ch.',
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

// ─── Accordion-Komponente ────────────────────────────────────────────────────

function FaqAccordion({ faq }: { faq: { question: string; answer: string } }) {
  return (
    <details className="group rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm transition hover:border-gray-300">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-semibold text-gray-900">
        <span>{faq.question}</span>
        <span className="mt-0.5 flex-shrink-0 text-gray-400 transition group-open:rotate-180">▾</span>
      </summary>
      <p className="mt-4 text-sm leading-relaxed text-gray-600">{faq.answer}</p>
    </details>
  );
}

// ─── Seite ───────────────────────────────────────────────────────────────────

export default function FaqPage() {
  return (
    <>
      <FaqPageSchema faqs={ALL_FAQ_ITEMS} />
      <PageWrapper>
        {/* Hero */}
        <section className="border-b border-gray-200 bg-white px-4 py-16 text-center">
          <div className="mx-auto max-w-2xl">
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
              Häufige Fragen
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900">
              Datenschutz & KI-Compliance<br />
              <span className="text-gray-500">für Schweizer KMU</span>
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Alles zu nDSG, DSGVO und EU AI Act Art. 50 – klar erklärt, ohne Juristendeutsch.
            </p>
          </div>
        </section>

        {/* FAQ Kategorien */}
        <section className="mx-auto max-w-3xl px-4 py-16">
          {FAQ_CATEGORIES.map((cat, ci) => (
            <div key={cat.title} className={ci < FAQ_CATEGORIES.length - 1 ? 'mb-12' : 'mb-16'}>
              <h2 className="mb-6 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-gray-400">
                <img src={cat.icon} alt="" width={16} height={16} style={{ opacity: 0.7 }} />
                {cat.title}
              </h2>
              <div className="space-y-4">
                {cat.items.map((faq, i) => <FaqAccordion key={i} faq={faq} />)}
              </div>
            </div>
          ))}

          {/* Bottom CTA */}
          <div className="rounded-2xl bg-gray-900 p-8 text-center">
            <h3 className="text-2xl font-bold text-white">Ihre Website jetzt prüfen</h3>
            <p className="mt-2 text-gray-400">Kostenloser Scan – Ergebnis in 60 Sekunden.</p>
            <Link
              href="/scanner"
              className="mt-6 inline-block rounded-xl bg-green-500 px-8 py-3 font-bold text-white transition hover:bg-green-400"
            >
              Jetzt kostenlos scannen →
            </Link>
          </div>
        </section>
      </PageWrapper>
    </>
  );
}
