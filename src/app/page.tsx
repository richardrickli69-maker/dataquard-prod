// src/app/page.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function HomePage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqs = [
    { question: 'Wie lange dauert die Policy-Generierung?', answer: 'Die Website-Analyse dauert wenige Sekunden. Die Policy ist typischerweise innerhalb von 30-60 Sekunden verfügbar.' },
    {
  question: 'Ist die generierte Policy wirklich nDSG/DSGVO-konform?',
  answer: 'Ja. Unsere Datenschutzerklärungen basieren auf über 40 juristisch validierten Textbausteinen (Module P1–P7, W1–W8, D1–D12, C1–C5, Z1–Z3, HR1–HR5, T1–T2), die speziell für das Schweizer Datenschutzgesetz (nDSG) und die DSGVO entwickelt wurden. Der entscheidende Unterschied: Wir generieren keine generischen KI-Texte. Unser Scanner erkennt Ihre konkrete Website-Situation und setzt nur die Textbausteine ein, die für Ihr Unternehmen tatsächlich relevant sind – präzise, vollständig und rechtssicher.',
},
    { question: 'Brauche ich technische Fähigkeiten?', answer: 'Nein! Sie brauchen nur Ihre Domain-Adresse. Der Rest ist vollautomatisch.' },
    { question: 'Welche Daten sammelt Dataquard?', answer: 'Wir sammeln nur die Informationen, die Sie uns geben (Domain, Unternehmensname). Ihre Daten sind in der Schweiz sicher.' },
    { question: 'Wie viel Bußgeld droht bei DSGVO/nDSG-Verstößen?', answer: 'Bis zu CHF 50\'000 bei nDSG-Verstößen und bis zu € 20 Millionen bei DSGVO-Verstößen. Mit Dataquard sind Sie in Minuten konform.' },
    { question: 'Kann ich die Policy später bearbeiten?', answer: 'Ja! Sie erhalten eine Markdown/HTML-Version, die Sie problemlos bearbeiten können.' },
    { question: 'Gibt es eine Geld-zurück-Garantie?', answer: 'Ja! 30 Tage volle Rückerstattung, wenn Sie mit der Policy nicht zufrieden sind.' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white">

      {/* Navbar – Logo zentriert, weisser Hintergrund */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-16 flex justify-center items-center">
          <Image src="/logo.png" alt="Dataquard" width={256} height={256} className="h-64 w-auto" />
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Ihre Website. Rechtssicher.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-pink-300">In 3 Minuten.</span>
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Der einzige Schweizer All-in-One-Check: Compliance, Performance, Security und Impressum – automatisch geprüft, sofort behoben. Nur von Dataquard.
        </p>
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <Link href="/scanner" className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-lg hover:shadow-lg transition text-lg">Kostenlos scannen →</Link>
          <Link href="/checkout" className="px-8 py-4 border-2 border-indigo-400 text-indigo-300 font-bold rounded-lg hover:border-indigo-200 transition text-lg">Starter – CHF 79/Jahr</Link>
          <Link href="/impressum-generator" className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold rounded-lg hover:shadow-lg transition text-lg">📄 Impressum – CHF 19</Link>
        </div>
        <p className="text-sm text-gray-400 mb-12">Kostenlos · Keine Anmeldung · Ergebnis in 10 Sekunden</p>
        <div className="flex justify-center gap-6 text-sm">
          <span className="text-gray-300">🇨🇭 Schweizer Produkt</span>
          <span className="text-gray-300">🔒 Daten in Zürich</span>
          <span className="text-gray-300">⚖️ nDSG/DSGVO-konform</span>
        </div>
      </section>

      {/* 3 Säulen */}
      <section className="max-w-6xl mx-auto px-4 py-16 border-t border-indigo-700">
        <h2 className="text-3xl font-bold mb-4 text-center">Was wir für Sie prüfen</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {[
            { icon: '⚖️', title: 'Compliance', sub: 'nDSG / DSGVO', items: ['Datenschutzerklärung vorhanden', 'Cookie-Banner konform', 'Tracker erkannt & dokumentiert', 'Impressum vollständig'] },
            { icon: '⚡', title: 'Performance', sub: 'Speed & Mobile', items: ['Ladezeit < 3 Sekunden', 'Mobile-freundlich', 'SSL aktiv & gültig', 'Keine veralteten Scripts'] },
            { icon: '🔒', title: 'Trust', sub: 'Vertrauen & Sicherheit', items: ['Meta-Tags vollständig', 'Kontaktinfos sichtbar', 'Keine broken Links', 'HTTPS überall'] },
          ].map((s) => (
            <div key={s.title} className="bg-indigo-900 bg-opacity-30 p-8 rounded-lg border border-indigo-700">
              <div className="text-3xl mb-2">{s.icon}</div>
              <h3 className="text-xl font-bold">{s.title}</h3>
              <p className="text-indigo-300 text-sm mb-4">{s.sub}</p>
              <ul className="space-y-2">
                {s.items.map((item) => <li key={item} className="text-gray-300 text-sm flex gap-2"><span className="text-green-400">✓</span>{item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Impressum CTA Block */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-red-900 to-red-800 border border-red-600 rounded-xl p-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">📄</span>
              <h3 className="text-2xl font-bold">Impressum fehlt auf Ihrer Website?</h3>
            </div>
            <p className="text-red-200">Ein fehlendes Impressum ist eine Ordnungswidrigkeit – bis CHF 50'000 Bußgeld möglich.</p>
            <div className="flex gap-4 mt-3 text-sm text-red-200">
              <span>✓ Schweiz (nDSG)</span>
              <span>✓ Deutschland (DSGVO)</span>
              <span>✓ Sofort einsatzbereit</span>
            </div>
          </div>
          <div className="text-center flex-shrink-0">
            <div className="text-3xl font-bold text-white mb-1">CHF 19</div>
            <div className="text-red-300 text-sm mb-3">Einmalkauf · kein Abo</div>
            <Link href="/impressum-generator" className="block px-8 py-3 bg-white text-red-700 font-bold rounded-lg hover:bg-red-50 transition">
              Jetzt Impressum erstellen →
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div><div className="text-4xl font-bold text-indigo-300">4'800+</div><p className="text-gray-400 mt-2">Schweizer KMUs betroffen von nDSG-Pflichten</p></div>
          <div><div className="text-4xl font-bold text-indigo-300">73%</div><p className="text-gray-400 mt-2">der Schweizer Websites ohne korrekte Datenschutzerklärung</p></div>
          <div><div className="text-4xl font-bold text-indigo-300">3 min</div><p className="text-gray-400 mt-2">bis Ihre Website vollständig geschützt ist</p></div>
        </div>
      </section>

      {/* In 3 Schritten */}
      <section className="max-w-6xl mx-auto px-4 py-16 border-t border-indigo-700">
        <h2 className="text-3xl font-bold mb-12 text-center">In 3 Schritten rechtssicher</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { num: '01', title: 'Website scannen', desc: 'URL eingeben – in 10 Sekunden erhalten Sie einen vollständigen Bericht mit Compliance-, Performance- und Trust-Score.', link: '/scanner', cta: 'Jetzt scannen →' },
            { num: '02', title: 'Dokumente generieren', desc: 'Datenschutzerklärung und Impressum werden automatisch auf Basis Ihres Scans ausgefüllt – individuell, rechtssicher, sofort.', link: '/datenschutz-generator', cta: 'Datenschutz erstellen →' },
            { num: '03', title: 'Einbinden & fertig', desc: 'HTML-Snippet kopieren, auf Ihrer Website einfügen. Dataquard informiert Sie bei Gesetzesänderungen automatisch.', link: '/checkout', cta: 'Starter kaufen →' },
          ].map((s) => (
            <div key={s.num} className="bg-indigo-900 bg-opacity-30 p-8 rounded-lg border border-indigo-700">
              <div className="text-4xl font-bold text-indigo-700 mb-4">{s.num}</div>
              <h3 className="text-xl font-bold mb-3">{s.title}</h3>
              <p className="text-gray-300 mb-4">{s.desc}</p>
              <Link href={s.link} className="text-indigo-400 hover:text-indigo-300">{s.cta}</Link>
            </div>
          ))}
        </div>
      </section>

      {/* AGB */}
      <section className="max-w-6xl mx-auto px-4 py-16 border-t border-indigo-700">
        <div className="bg-indigo-900 bg-opacity-30 border border-indigo-700 rounded-xl p-10 text-center">
          <h2 className="text-3xl font-bold mb-4">📋 Allgemeine Geschäftsbedingungen</h2>
          <p className="text-gray-300 max-w-xl mx-auto mb-8">Transparenz ist uns wichtig. Unsere AGB regeln die Nutzung klar und fair – ohne Kleingedrucktes.</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 text-left">
            {[
              { icon: '🔒', title: 'Datenschutz', desc: 'Ihre Daten werden ausschliesslich auf Schweizer Servern gespeichert und nie an Dritte weitergegeben.' },
              { icon: '💳', title: 'Zahlung', desc: 'Jahresabo, automatische Verlängerung. Kündigung jederzeit möglich. Keine versteckten Kosten.' },
              { icon: '↩️', title: '30 Tage Garantie', desc: 'Geld-zurück-Garantie ohne Angabe von Gründen innerhalb von 30 Tagen.' },
              { icon: '⚖️', title: 'Haftung', desc: 'Dataquard ersetzt keine Rechtsberatung. Für rechtsverbindliche Prüfung empfehlen wir einen Anwalt.' },
            ].map((item) => (
              <div key={item.title} className="bg-indigo-800 bg-opacity-40 border border-indigo-700 rounded-lg p-5">
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="font-bold mb-1">{item.title}</div>
                <div className="text-gray-300 text-sm">{item.desc}</div>
              </div>
            ))}
          </div>
          <Link href="#" className="inline-block px-8 py-3 border border-indigo-500 text-indigo-300 rounded-lg hover:bg-indigo-900 transition text-sm">Vollständige AGB lesen →</Link>
        </div>
      </section>

      {/* Preise */}
      <section className="max-w-7xl mx-auto px-4 py-16 border-t border-indigo-700" id="preise">
        <h2 className="text-3xl font-bold mb-4 text-center">Transparent. Fair. Schweizer Qualität.</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-12">
          {[
            { name: 'Impressum', price: 'CHF 19', sub: 'Einmalkauf', desc: 'Nur das Impressum', features: ['Impressum Generator', 'Schweiz + Deutschland', 'Sofort downloadbar'], missing: [], cta: 'Impressum erstellen', link: '/impressum-generator', highlight: false },
            { name: 'Free', price: 'CHF 0', sub: 'immer kostenlos', desc: 'Für den ersten Überblick', features: ['Website-Scan', 'Ampel-Score', 'Compliance-Bericht', 'Performance-Check'], missing: ['Datenschutzerklärung', 'Impressum', 'Updates'], cta: 'Kostenlos scannen', link: '/scanner', highlight: false },
            { name: 'Starter', price: 'CHF 79', sub: 'pro Jahr', desc: 'Für Schweizer KMUs', features: ['Alles aus Free', 'Datenschutzerklärung', 'Impressum Generator', 'Cookie-Analyse', 'Automatische Updates', '1 Domain'], missing: [], cta: 'Jetzt starten', link: '/checkout', highlight: true },
            { name: 'Professional', price: 'CHF 149', sub: 'pro Jahr', desc: 'Für wachsende Teams', features: ['Datenschutzerklärung', 'Impressum Generator', 'Cookie-Analyse', 'Auto-Updates', 'Bis zu 5 Domains', 'Monatliche Re-Scans', 'Priority Support'], missing: [], cta: 'Professional wählen', link: '/checkout', highlight: false },
          ].map((plan) => (
            <div key={plan.name} className={`p-5 rounded-lg border-2 ${plan.highlight ? 'border-indigo-500 bg-indigo-900 bg-opacity-50' : 'border-indigo-700 bg-indigo-900 bg-opacity-20'}`}>
              {plan.highlight && <div className="text-xs text-indigo-300 font-bold mb-2">EMPFOHLEN</div>}
              <h3 className="text-lg font-bold">{plan.name}</h3>
              <div className="text-xl font-bold text-indigo-300 mt-2">{plan.price}<span className="text-xs text-gray-400"> /{plan.sub}</span></div>
              <p className="text-gray-400 text-xs mt-1 mb-4">{plan.desc}</p>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => <li key={f} className="text-gray-300 text-xs flex gap-2"><span className="text-green-400">✓</span>{f}</li>)}
                {plan.missing.map((f) => <li key={f} className="text-gray-500 text-xs flex gap-2"><span>✗</span>{f}</li>)}
              </ul>
              <Link href={plan.link} className={`block text-center px-3 py-2 rounded-lg font-bold text-xs ${plan.highlight ? 'bg-indigo-500 hover:bg-indigo-600 text-white' : 'border border-indigo-500 text-indigo-300 hover:bg-indigo-900'}`}>{plan.cta}</Link>
            </div>
          ))}
        </div>
        <p className="text-center text-gray-400 text-sm mt-6">Alle Preise in CHF inkl. MwSt. · Jährliche Abrechnung · Keine versteckten Kosten</p>
      </section>

      {/* Konkurrenz-Vergleich */}
      <section className="max-w-6xl mx-auto px-4 py-16 border-t border-indigo-700">
        <h2 className="text-3xl font-bold mb-12 text-center">Dataquard vs. andere Tools</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-indigo-700">
                <th className="text-left py-4 px-4 text-gray-400">Feature</th>
                <th className="py-4 px-4 text-indigo-300 font-bold">Dataquard</th>
                <th className="py-4 px-4 text-gray-400">PrivacyBee</th>
                <th className="py-4 px-4 text-gray-400">iubenda</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Compliance-Check', '✅', '✅', '✅'],
                ['Performance-Check', '✅', '❌', '❌'],
                ['Security-Check', '✅', '❌', '❌'],
                ['Schweizer nDSG', '✅', '✅', '⚠️'],
                ['Auto-Scan & Pre-fill', '✅', '✅', '❌'],
                ['Preis/Jahr', 'CHF 79', 'CHF 55', '€ 144+'],
                ['Daten in Schweiz', '✅', '⚠️', '❌'],
              ].map(([feature, dq, pb, iu]) => (
                <tr key={feature} className="border-b border-indigo-900 hover:bg-indigo-900 hover:bg-opacity-20">
                  <td className="py-3 px-4 text-gray-300">{feature}</td>
                  <td className="py-3 px-4 text-center font-bold text-indigo-300">{dq}</td>
                  <td className="py-3 px-4 text-center text-gray-400">{pb}</td>
                  <td className="py-3 px-4 text-center text-gray-400">{iu}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 py-16 border-t border-indigo-700" id="faq">
        <h2 className="text-3xl font-bold mb-12 text-center">Häufig gestellte Fragen</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-indigo-900 bg-opacity-30 rounded-lg border border-indigo-700 overflow-hidden">
              <button onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)} className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-indigo-900 hover:bg-opacity-50 transition">
                <span className="font-bold">{faq.question}</span>
                <span className="text-xl">{openFAQ === idx ? '−' : '+'}</span>
              </button>
              {openFAQ === idx && <div className="px-6 py-4 border-t border-indigo-700 text-gray-300">{faq.answer}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center border-t border-indigo-700">
        <h2 className="text-3xl font-bold mb-6">Ist Ihre Website wirklich rechtssicher?</h2>
        <p className="text-xl text-gray-300 mb-8">Finden Sie es in 10 Sekunden heraus – kostenlos und ohne Anmeldung.</p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/scanner" className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-lg hover:shadow-lg transition text-lg">Kostenlos scannen →</Link>
          <Link href="/checkout" className="px-8 py-4 border-2 border-indigo-400 text-indigo-300 font-bold rounded-lg hover:border-indigo-200 transition text-lg">Starter – CHF 79/Jahr</Link>
          <Link href="/impressum-generator" className="px-8 py-4 border-2 border-red-500 text-red-300 font-bold rounded-lg hover:border-red-300 transition text-lg">Impressum – CHF 19</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-indigo-700 bg-black bg-opacity-50 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
          <span className="mb-4 md:mb-0">© 2026 · Basel, Schweiz</span>
          <div className="flex gap-6 items-center">
            <Link href="/scanner" className="hover:text-white">Scanner</Link>
            <Link href="/datenschutz-generator" className="hover:text-white">Datenschutz</Link>
            <Link href="/impressum-generator" className="hover:text-white">Impressum</Link>
            <Link href="#preise" className="hover:text-white">Preise</Link>
            <Link href="#" className="hover:text-white">AGB</Link>
            <Link href="/auth" className="px-4 py-1.5 border border-indigo-700 text-indigo-400 rounded-lg hover:bg-indigo-900 hover:text-white transition">Anmelden</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}