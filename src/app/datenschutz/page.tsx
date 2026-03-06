// src/app/datenschutz/page.tsx
import Link from 'next/link';

export const metadata = {
  title: 'Datenschutzerklärung – Dataquard',
  description: 'Datenschutzerklärung von Dataquard gemäss nDSG und DSGVO',
};

export default function DatenschutzPage() {
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
        <h1 className="text-4xl font-bold mb-2">Datenschutzerklärung</h1>
        <p className="text-gray-400 mb-12 text-sm">
          Gemäss Schweizer Datenschutzgesetz (nDSG) und DSGVO · Stand: März 2026
        </p>

        {/* Verantwortlicher */}
        <section className="bg-indigo-900 bg-opacity-30 border border-indigo-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-indigo-300 mb-4">1. Verantwortlicher</h2>
          <div className="space-y-1 text-gray-300">
            <p className="font-semibold text-white">Richard Rickli</p>
            <p>Gstadstrasse 53, 4153 Reinach BL, Schweiz</p>
            <p>
              <a href="mailto:richard@dataquard.ch" className="text-indigo-400 hover:text-indigo-300 transition">
                richard@dataquard.ch
              </a>
            </p>
          </div>
        </section>

        {/* Erhobene Daten */}
        <section className="bg-indigo-900 bg-opacity-30 border border-indigo-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-indigo-300 mb-4">2. Erhobene Daten</h2>
          <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
            <div>
              <h3 className="font-semibold text-white mb-1">Website-Besuch</h3>
              <p>IP-Adresse, Browsertyp, Betriebssystem, Referrer-URL, Datum und Uhrzeit des Zugriffs. Rechtsgrundlage: berechtigtes Interesse (Betrieb der Website).</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Registrierung & Konto</h3>
              <p>E-Mail-Adresse und Passwort (verschlüsselt). Rechtsgrundlage: Vertragserfüllung.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Website-Scans</h3>
              <p>Die von Ihnen eingegebene URL sowie die Scan-Ergebnisse (Tracker, Compliance-Score, Ampelstatus). Rechtsgrundlage: Vertragserfüllung.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Zahlungsabwicklung</h3>
              <p>Zahlungsdaten werden direkt von Stripe verarbeitet. Dataquard erhält lediglich eine Bestätigung des Zahlungsstatus sowie eine Kunden-ID. Rechtsgrundlage: Vertragserfüllung.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">E-Mail-Kommunikation</h3>
              <p>E-Mail-Adresse für transaktionale E-Mails (Willkommens-E-Mail, Scan-Änderungsbenachrichtigungen). Rechtsgrundlage: Vertragserfüllung bzw. Einwilligung.</p>
            </div>
          </div>
        </section>

        {/* Drittanbieter */}
        <section className="bg-indigo-900 bg-opacity-30 border border-indigo-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-indigo-300 mb-4">3. Drittanbieter & Auftragsverarbeiter</h2>
          <div className="space-y-4 text-sm">
            {[
              {
                name: 'Vercel Inc.',
                purpose: 'Hosting & Deployment',
                location: 'USA (EU-Serverstandort verfügbar)',
                link: 'https://vercel.com/legal/privacy-policy',
              },
              {
                name: 'Supabase',
                purpose: 'Datenbank & Authentifizierung',
                location: 'Serverstandort: Zürich, Schweiz',
                link: 'https://supabase.com/privacy',
              },
              {
                name: 'Stripe Inc.',
                purpose: 'Zahlungsabwicklung',
                location: 'USA / Irland',
                link: 'https://stripe.com/ch/privacy',
              },
              {
                name: 'Resend',
                purpose: 'Transaktionale E-Mails',
                location: 'USA',
                link: 'https://resend.com/privacy',
              },
              {
                name: 'Anthropic (Claude API)',
                purpose: 'KI-gestützte Analyse & Empfehlungen',
                location: 'USA',
                link: 'https://www.anthropic.com/privacy',
              },
            ].map((provider) => (
              <div key={provider.name} className="border-b border-indigo-800 pb-4 last:border-0 last:pb-0">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-white">{provider.name}</span>
                  <span className="text-gray-400 text-xs">{provider.location}</span>
                </div>
                <p className="text-gray-300 mb-1">{provider.purpose}</p>
                <a href={provider.link} target="_blank" rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 text-xs transition">
                  Datenschutzerklärung →
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Cookies */}
        <section className="bg-indigo-900 bg-opacity-30 border border-indigo-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-indigo-300 mb-4">4. Cookies</h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-3">
            Dataquard verwendet ausschliesslich technisch notwendige Cookies. Es werden keine
            Tracking- oder Marketing-Cookies eingesetzt.
          </p>
          <div className="bg-indigo-800 bg-opacity-40 rounded-lg p-4 text-sm">
            <div className="flex justify-between text-gray-300 mb-1">
              <span className="font-semibold text-white">Supabase Auth Session</span>
              <span className="text-gray-400">Session-Cookie</span>
            </div>
            <p className="text-gray-400 text-xs">Speichert den Anmeldestatus. Wird nach Abmeldung oder Browser-Schliessen gelöscht.</p>
          </div>
        </section>

        {/* Speicherdauer */}
        <section className="bg-indigo-900 bg-opacity-30 border border-indigo-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-indigo-300 mb-4">5. Speicherdauer</h2>
          <div className="space-y-2 text-sm text-gray-300">
            <p>Kontodaten und Scan-Ergebnisse werden gespeichert, solange ein aktives Konto besteht.</p>
            <p>Nach Kündigung oder Löschungsanfrage werden alle personenbezogenen Daten innerhalb von <span className="text-white font-semibold">30 Tagen</span> vollständig gelöscht.</p>
            <p>Zahlungsbelege werden gemäss gesetzlicher Aufbewahrungspflicht (10 Jahre) aufbewahrt.</p>
          </div>
        </section>

        {/* Rechte */}
        <section className="bg-indigo-900 bg-opacity-30 border border-indigo-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-indigo-300 mb-4">6. Ihre Rechte</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {[
              { icon: '📋', right: 'Auskunft', desc: 'Welche Daten wir über Sie gespeichert haben' },
              { icon: '✏️', right: 'Berichtigung', desc: 'Korrektur unrichtiger Daten' },
              { icon: '🗑️', right: 'Löschung', desc: 'Löschung Ihrer personenbezogenen Daten' },
              { icon: '📦', right: 'Übertragbarkeit', desc: 'Ihre Daten in maschinenlesbarem Format' },
              { icon: '🚫', right: 'Widerspruch', desc: 'Widerspruch gegen die Datenverarbeitung' },
              { icon: '⏸️', right: 'Einschränkung', desc: 'Einschränkung der Verarbeitung' },
            ].map((item) => (
              <div key={item.right} className="bg-indigo-800 bg-opacity-30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span>{item.icon}</span>
                  <span className="font-semibold text-white">{item.right}</span>
                </div>
                <p className="text-gray-400 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-gray-400 text-sm mt-4">
            Zur Ausübung Ihrer Rechte wenden Sie sich an:{' '}
            <a href="mailto:richard@dataquard.ch" className="text-indigo-400 hover:text-indigo-300 transition">
              richard@dataquard.ch
            </a>
          </p>
        </section>

        {/* Beschwerde */}
        <section className="bg-indigo-900 bg-opacity-30 border border-indigo-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-indigo-300 mb-4">7. Beschwerderecht</h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            Sie haben das Recht, sich beim Eidgenössischen Datenschutz- und Öffentlichkeitsbeauftragten
            (EDÖB) zu beschweren, wenn Sie der Ansicht sind, dass die Verarbeitung Ihrer personenbezogenen
            Daten gegen das Datenschutzrecht verstösst.
          </p>
          <a href="https://www.edoeb.admin.ch" target="_blank" rel="noopener noreferrer"
            className="inline-block mt-3 text-indigo-400 hover:text-indigo-300 text-sm transition">
            www.edoeb.admin.ch →
          </a>
        </section>

        {/* Stand */}
        <p className="text-gray-500 text-xs text-center mt-8">
          Stand: März 2026 · Dataquard, Richard Rickli, Reinach BL
        </p>
      </main>

      {/* Footer */}
      <footer className="border-t border-indigo-800 px-6 py-8 mt-8">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <p>© 2026 Dataquard · Richard Rickli · Reinach BL</p>
          <div className="flex gap-6">
            <Link href="/impressum" className="hover:text-indigo-300 transition">Impressum</Link>
            <Link href="/datenschutz" className="text-indigo-400">Datenschutz</Link>
            <Link href="/" className="hover:text-indigo-300 transition">Startseite</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
