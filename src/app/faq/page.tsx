import type { Metadata } from 'next';
import { FaqPageSchema } from '@/components/seo/SchemaOrg';

export const metadata: Metadata = {
  title: 'FAQ – nDSG, DSGVO & EU AI Act für Schweizer KMU | Dataquard',
  description: 'Häufige Fragen zu Datenschutz, nDSG-Konformität und EU AI Act Art. 50 für Schweizer Unternehmen – beantwortet von Dataquard.',
  alternates: { canonical: 'https://www.dataquard.ch/faq' },
};

const FAQ_ITEMS = [
  { question: 'Was ist das nDSG und gilt es für mein Schweizer KMU?', answer: 'Das neue Datenschutzgesetz (nDSG) ist seit dem 1. September 2023 in Kraft. Es gilt für alle Unternehmen in der Schweiz, die Personendaten bearbeiten – also auch für jedes KMU mit einer Website. Ihre Website braucht eine aktuelle Datenschutzerklärung.' },
  { question: 'Brauche ich zwingend eine Datenschutzerklärung auf meiner Website?', answer: "Ja. Das nDSG verpflichtet jeden Websitebetreiber zur Transparenz über Personendatenbearbeitung. Eine fehlende Datenschutzerklärung kann zu Bussgeldern bis CHF 250'000 führen. Dataquard generiert automatisch eine nDSG-konforme Erklärung basierend auf dem Scan Ihrer Website." },
  { question: 'Was ist der Unterschied zwischen nDSG und DSGVO?', answer: 'Das nDSG ist das Schweizer Gesetz, die DSGVO die EU-Verordnung. Für Schweizer KMUs gilt primär das nDSG. Die DSGVO gilt zusätzlich, wenn Sie Besucher aus der EU ansprechen. Dataquard prüft automatisch, welche Jurisdiktion zutrifft.' },
  { question: 'Wie hoch sind die Bussgelder bei nDSG-Verstössen?', answer: "Das nDSG sieht Bussgelder bis CHF 250'000 bei vorsätzlichen Verstössen vor. Anders als die DSGVO richtet sich die Sanktion gegen natürliche Personen wie Geschäftsführer, nicht das Unternehmen." },
  { question: 'Was ist der EU AI Act Art. 50 und gilt er in der Schweiz?', answer: 'Art. 50 EU AI Act verpflichtet zur Transparenz bei KI-generierten Inhalten. Für Schweizer Unternehmen mit EU-Kunden ist Konformität dringend empfohlen. Dataquard erkennt automatisch KI-generierte Inhalte und fügt die entsprechende Klausel in Ihre Datenschutzerklärung ein.' },
  { question: 'Was ist eine Deepfake-Analyse und warum brauche ich sie?', answer: 'Eine Deepfake-Analyse prüft, ob Bilder auf Ihrer Website KI-generiert oder manipuliert wurden. Nach EU AI Act Art. 50 müssen solche Inhalte gekennzeichnet werden. Dataquard führt diesen Check automatisch bei jedem Scan durch.' },
  { question: 'Muss ich KI-generierte Inhalte auf meiner Website kennzeichnen?', answer: 'Ja, sofern die Inhalte für EU-Nutzer als echt erscheinen könnten. Art. 50 EU AI Act verlangt Kennzeichnung von KI-generierten Inhalten, die zur Täuschung geeignet sind. Dataquard erkennt solche Inhalte automatisch.' },
  { question: 'Wie funktioniert der automatische Compliance-Scan?', answer: 'Dataquard analysiert in drei Schritten: (1) Technischer Scan – Cookies, Tracker, Dienste. (2) Inhaltsanalyse – KI-Bilder, Deepfake-Verdacht. (3) Rechtliche Bewertung – nDSG, DSGVO, EU AI Act mit Ampel-Risikobewertung. Resultat: Eine sofort einsetzbare Datenschutzerklärung.' },
  { question: 'Speichert Dataquard meine Bilder nach dem Scan?', answer: 'Nein. Dataquard verarbeitet Bilddaten ausschliesslich flüchtig im Arbeitsspeicher (RAM-only). Es werden keine Bilder gespeichert oder an Dritte weitergegeben. Die Infrastruktur läuft auf Schweizer Servern (Supabase Zürich).' },
  { question: 'Was kostet Dataquard?', answer: "Der Basis-Scan ist kostenlos. Für die generierte Datenschutzerklärung, Deepfake-Check und EU AI Act Art. 50 Klausel: STARTER ab CHF 79 (Einmalkauf), PROFESSIONAL ab CHF 149 mit erweiterten Features. Das AI-Trust Abo für laufende Überwachung kostet CHF 99 pro Jahr." },
  { question: 'Was ist der EU AI Act Art. 50?', answer: 'Der EU AI Act ist das weltweit erste umfassende KI-Gesetz. Artikel 50 verlangt, dass KI-generierte Inhalte als solche gekennzeichnet werden müssen. Für Schweizer KMU mit EU-Kunden gilt: Wer KI-Bilder auf seiner Website verwendet, muss diese transparent kennzeichnen — sonst drohen Bussgelder.' },
  { question: 'Muss ich KI-Bilder auf meiner Website kennzeichnen?', answer: 'Ja, wenn Sie Kunden in der EU haben. Der EU AI Act Art. 50 schreibt vor, dass KI-generierte Inhalte erkennbar sein müssen. Viele KMU nutzen Tools wie Midjourney, DALL-E oder ChatGPT für Website-Bilder, ohne zu wissen, dass eine Kennzeichnungspflicht besteht. Dataquard erkennt automatisch, welche Bilder auf Ihrer Website KI-generiert sind.' },
  { question: 'Was ist ein Deepfake und warum ist das für mein KMU relevant?', answer: 'Ein Deepfake ist ein manipuliertes Bild oder Video, das täuschend echt aussieht. Für KMU relevant: Betrüger können Team-Fotos manipulieren, gefälschte Geschäftsführer-Videos erstellen oder Ihr Firmenimage missbrauchen. Der Dataquard AI-Trust Check erkennt solche Manipulationen und warnt Sie.' },
];

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

export default function FaqPage() {
  return (
    <>
      <FaqPageSchema faqs={FAQ_ITEMS} />
      <main className="min-h-screen bg-gray-50">
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

        <section className="mx-auto max-w-3xl px-4 py-16">
          <div className="mb-12">
            <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-gray-400">
              Schweizer Datenschutzgesetz (nDSG)
            </h2>
            <div className="space-y-4">
              {FAQ_ITEMS.slice(0, 4).map((faq, i) => <FaqAccordion key={i} faq={faq} />)}
            </div>
          </div>

          <div className="mb-12">
            <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-gray-400">
              EU AI Act & KI-Kennzeichnung
            </h2>
            <div className="space-y-4">
              {FAQ_ITEMS.slice(4, 10).map((faq, i) => <FaqAccordion key={i} faq={faq} />)}
            </div>
          </div>

          <div className="mb-16">
            <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-gray-400">
              Dataquard Plattform
            </h2>
            <div className="space-y-4">
              {FAQ_ITEMS.slice(10).map((faq, i) => <FaqAccordion key={i} faq={faq} />)}
            </div>
          </div>

          <div className="rounded-2xl bg-gray-900 p-8 text-center">
            <h3 className="text-2xl font-bold text-white">Ihre Website jetzt prüfen</h3>
            <p className="mt-2 text-gray-400">Kostenloser Scan – Ergebnis in 60 Sekunden.</p>
            <a
              href="/"
              className="mt-6 inline-block rounded-xl bg-green-500 px-8 py-3 font-bold text-white transition hover:bg-green-400"
            >
              Jetzt kostenlos scannen →
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
