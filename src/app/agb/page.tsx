import Link from 'next/link';

export const metadata = {
  title: 'AGB – Dataquard',
  description: 'Allgemeine Geschäftsbedingungen von Dataquard – Datenschutz, Zahlung, Garantie und Haftung.',
};

export default function AGBPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white py-16 px-4">
      <div className="max-w-4xl mx-auto">

        <div className="mb-12">
          <Link href="/" className="text-indigo-400 hover:text-indigo-300 text-sm">← Zurück zur Startseite</Link>
          <h1 className="text-4xl font-bold mt-6 mb-2">📋 Allgemeine Geschäftsbedingungen</h1>
          <p className="text-gray-400">Stand: März 2026 · Dataquard, Basel, Schweiz</p>
        </div>

        <div className="space-y-8">

          {/* Datenschutz */}
          <div className="bg-indigo-900 bg-opacity-30 border border-indigo-700 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🔒</span>
              <h2 className="text-2xl font-bold">1. Datenschutz</h2>
            </div>
            <div className="space-y-3 text-gray-300">
              <p>Dataquard verarbeitet personenbezogene Daten ausschliesslich im Einklang mit dem Schweizer Datenschutzgesetz (nDSG) und der DSGVO.</p>
              <p>Ihre Daten werden ausschliesslich auf Schweizer Servern (Zürich) gespeichert und nie an Dritte weitergegeben oder für Werbezwecke verwendet.</p>
              <p>Wir erheben nur jene Daten, die zur Erbringung unserer Dienstleistungen notwendig sind (Domain, Unternehmensname, E-Mail-Adresse).</p>
              <p>Sie haben jederzeit das Recht auf Auskunft, Berichtigung und Löschung Ihrer Daten. Anfragen richten Sie bitte an: <span className="text-indigo-300">datenschutz@dataquard.ch</span></p>
            </div>
          </div>

          {/* Zahlung */}
          <div className="bg-indigo-900 bg-opacity-30 border border-indigo-700 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">💳</span>
              <h2 className="text-2xl font-bold">2. Zahlung</h2>
            </div>
            <div className="space-y-3 text-gray-300">
              <p>Alle Dataquard-Produkte werden als <strong className="text-white">Einmalkauf</strong> angeboten. Es entstehen keine automatischen Verlängerungen oder wiederkehrenden Gebühren.</p>
              <p>Die aktuellen Preise:</p>
              <ul className="list-none space-y-2 ml-4">
                <li className="flex gap-2"><span className="text-indigo-300">·</span> Impressum Generator: CHF 19 (einmalig)</li>
                <li className="flex gap-2"><span className="text-indigo-300">·</span> Starter: CHF 79 (einmalig, 1 Domain)</li>
                <li className="flex gap-2"><span className="text-indigo-300">·</span> Professional: CHF 149 (einmalig, bis 5 Domains)</li>
              </ul>
              <p>Alle Preise verstehen sich in CHF inkl. MwSt. Die Zahlung erfolgt sicher über Stripe. Wir akzeptieren Kreditkarten und TWINT.</p>
              <p>Es gibt keine versteckten Kosten. Was Sie sehen, ist was Sie zahlen.</p>
            </div>
          </div>

          {/* 30 Tage Garantie */}
          <div className="bg-indigo-900 bg-opacity-30 border border-indigo-700 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">↩️</span>
              <h2 className="text-2xl font-bold">3. 30 Tage Geld-zurück-Garantie</h2>
            </div>
            <div className="space-y-3 text-gray-300">
              <p>Wir sind von unseren Produkten überzeugt. Wenn Sie aus irgendeinem Grund nicht zufrieden sind, erstatten wir Ihnen den vollen Kaufpreis – ohne Angabe von Gründen – innerhalb von 30 Tagen nach dem Kauf.</p>
              <p>Für eine Rückerstattung wenden Sie sich einfach an: <span className="text-indigo-300">support@dataquard.ch</span></p>
              <p>Die Rückerstattung erfolgt auf das ursprüngliche Zahlungsmittel innerhalb von 5–10 Werktagen.</p>
            </div>
          </div>

          {/* Haftung */}
          <div className="bg-indigo-900 bg-opacity-30 border border-indigo-700 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">⚖️</span>
              <h2 className="text-2xl font-bold">4. Haftung</h2>
            </div>
            <div className="space-y-3 text-gray-300">
              <p>Dataquard stellt Werkzeuge und Vorlagen zur Unterstützung bei der Datenschutz-Compliance bereit. Unsere generierten Dokumente basieren auf juristisch validierten Textbausteinen.</p>
              <p><strong className="text-white">Dataquard ersetzt keine individuelle Rechtsberatung.</strong> Für rechtsverbindliche Prüfungen und spezifische rechtliche Situationen empfehlen wir die Konsultation eines qualifizierten Datenschutzanwalts.</p>
              <p>Dataquard übernimmt keine Haftung für Schäden, die durch die Verwendung der generierten Dokumente entstehen, sofern diese nicht dem Schweizer Recht entsprechen sollten.</p>
              <p>Bei Fragen wenden Sie sich an: <span className="text-indigo-300">legal@dataquard.ch</span></p>
            </div>
          </div>

          {/* Gerichtsstand */}
          <div className="bg-indigo-900 bg-opacity-20 border border-indigo-800 rounded-xl p-6 text-sm text-gray-400">
            <p><strong className="text-gray-300">Gerichtsstand & anwendbares Recht:</strong> Es gilt Schweizer Recht. Gerichtsstand ist Basel, Schweiz.</p>
            <p className="mt-2"><strong className="text-gray-300">Kontakt:</strong> Dataquard · Basel, Schweiz · <span className="text-indigo-400">support@dataquard.ch</span></p>
          </div>

        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="px-8 py-3 border border-indigo-500 text-indigo-300 rounded-lg hover:bg-indigo-900 transition text-sm">
            ← Zurück zur Startseite
          </Link>
        </div>

      </div>
    </div>
  );
}
