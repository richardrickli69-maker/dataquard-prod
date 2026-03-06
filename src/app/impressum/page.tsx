// src/app/impressum/page.tsx
import Link from 'next/link';

export const metadata = {
  title: 'Impressum – Dataquard',
  description: 'Impressum und rechtliche Angaben zu Dataquard',
};

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white">

      {/* Header */}
      <header className="border-b border-indigo-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-white hover:text-indigo-300 transition">
            🛡️ Dataquard
          </Link>
          <Link href="/" className="text-indigo-400 hover:text-indigo-300 text-sm transition">
            ← Zurück zur Startseite
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-2">Impressum</h1>
        <p className="text-gray-400 mb-12 text-sm">Angaben gemäss Art. 3 UWG und § 5 TMG</p>

        {/* Verantwortlicher */}
        <section className="bg-indigo-900 bg-opacity-30 border border-indigo-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-indigo-300 mb-4">Verantwortlicher</h2>
          <div className="space-y-2 text-gray-300">
            <p className="font-semibold text-white">Richard Rickli</p>
            <p>Gstadstrasse 53</p>
            <p>4153 Reinach BL</p>
            <p>Schweiz</p>
          </div>
        </section>

        {/* Kontakt */}
        <section className="bg-indigo-900 bg-opacity-30 border border-indigo-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-indigo-300 mb-4">Kontakt</h2>
          <div className="space-y-2 text-gray-300">
            <p>
              <span className="text-gray-400">E-Mail: </span>
              <a href="mailto:richard@dataquard.ch" className="text-indigo-400 hover:text-indigo-300 transition">
                richard@dataquard.ch
              </a>
            </p>
            <p>
              <span className="text-gray-400">Website: </span>
              <a href="https://dataquard.ch" className="text-indigo-400 hover:text-indigo-300 transition">
                https://dataquard.ch
              </a>
            </p>
          </div>
        </section>

        {/* Unternehmensform */}
        <section className="bg-indigo-900 bg-opacity-30 border border-indigo-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-indigo-300 mb-4">Unternehmensform</h2>
          <p className="text-gray-300">Einzelunternehmen (nicht im Handelsregister eingetragen)</p>
        </section>

        {/* Haftungsausschluss */}
        <section className="bg-indigo-900 bg-opacity-30 border border-indigo-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-indigo-300 mb-4">Haftungsausschluss</h2>
          <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
            <div>
              <h3 className="font-semibold text-white mb-2">Haftung für Inhalte</h3>
              <p>
                Die Inhalte dieser Website wurden mit grösster Sorgfalt erstellt. Für die Richtigkeit,
                Vollständigkeit und Aktualität der Inhalte kann jedoch keine Gewähr übernommen werden.
                Als Dienstanbieter bin ich gemäss Art. 19 ff. DSG für eigene Inhalte auf diesen Seiten
                nach den allgemeinen Gesetzen verantwortlich.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Haftung für Links</h3>
              <p>
                Diese Website enthält Links zu externen Websites Dritter, auf deren Inhalte kein Einfluss
                besteht. Deshalb kann für diese fremden Inhalte auch keine Gewähr übernommen werden.
                Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber
                der Seiten verantwortlich.
              </p>
            </div>
          </div>
        </section>

        {/* Urheberrecht */}
        <section className="bg-indigo-900 bg-opacity-30 border border-indigo-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-indigo-300 mb-4">Urheberrecht</h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
            dem schweizerischen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und
            jede Art der Verwertung ausserhalb der Grenzen des Urheberrechtes bedürfen der
            schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
          </p>
        </section>

        {/* Streitbeilegung */}
        <section className="bg-indigo-900 bg-opacity-30 border border-indigo-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-indigo-300 mb-4">Streitbeilegung</h2>
          <div className="space-y-3 text-gray-300 text-sm leading-relaxed">
            <p>
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
            <p>
              <span className="font-semibold text-white">Gerichtsstand:</span> Kanton Basel-Landschaft, Schweiz.
              Es gilt schweizerisches Recht.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-indigo-800 px-6 py-8 mt-8">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <p>© 2026 Dataquard · Richard Rickli · Reinach BL</p>
          <div className="flex gap-6">
            <Link href="/impressum" className="text-indigo-400">Impressum</Link>
            <Link href="/datenschutz" className="hover:text-indigo-300 transition">Datenschutz</Link>
            <Link href="/" className="hover:text-indigo-300 transition">Startseite</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
