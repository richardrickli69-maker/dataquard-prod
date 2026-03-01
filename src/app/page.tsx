// src/app/page.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function HomePage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqs = [
    { question: 'Wie lange dauert die Policy-Generierung?', answer: 'Die Website-Analyse dauert wenige Sekunden. Die Policy wird durch unsere KI generiert und ist typischerweise innerhalb von 30-60 Sekunden verfügbar.' },
    { question: 'Ist die generierte Policy wirklich GDPR-konform?', answer: 'Ja! Unsere Policies werden von einer KI generiert, die speziell auf GDPR- und nDSG-Compliance trainiert wurde.' },
    { question: 'Brauche ich technische Fähigkeiten?', answer: 'Nein! Sie brauchen nur Ihre Domain-Adresse. Der Rest ist vollautomatisch.' },
    { question: 'Welche Daten sammelt Dataquard?', answer: 'Wir sammeln nur die Informationen, die Sie uns geben (Domain, Unternehmensname). Ihre Daten sind in der Schweiz sicher.' },
    { question: 'Wie viel Bußgeld droht bei GDPR-Verstößen?', answer: 'Bis zu CHF 20 Millionen oder 4% des globalen Jahresumsatzes. Mit Dataquard sind Sie in Minuten konform.' },
    { question: 'Kann ich die Policy später bearbeiten?', answer: 'Ja! Sie erhalten eine Markdown/HTML-Version, die Sie problemlos bearbeiten können.' },
    { question: 'Gibt es eine Geld-zurück-Garantie?', answer: 'Ja! 30 Tage volle Rückerstattung, wenn Sie mit der Policy nicht zufrieden sind.' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white">
      <nav className="border-b border-indigo-700 bg-black bg-opacity-50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">🔐 Dataquard</h1>
          <div className="flex gap-4">
            <Link href="/auth" className="px-4 py-2 text-indigo-300 hover:text-indigo-100">Sign In</Link>
            <Link href="/checkout" className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">Get Started</Link>
          </div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          GDPR & nDSG Compliance –<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-pink-300">Automatisiert in Minuten</span>
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">Ihre Website scannt automatisch, unsere KI generiert eine professionelle Datenschutzerklärung – alles in weniger als 5 Minuten.</p>
        <div className="flex gap-4 justify-center mb-12">
          <Link href="/checkout" className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-lg hover:shadow-lg transition text-lg">🚀 Jetzt starten – CHF 159</Link>
          <Link href="#faq" className="px-8 py-4 border-2 border-indigo-400 text-indigo-300 font-bold rounded-lg hover:border-indigo-200 transition text-lg">Mehr erfahren</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto text-sm">
          <div className="bg-indigo-900 bg-opacity-50 p-4 rounded-lg border border-indigo-700"><div className="text-2xl mb-2">✅</div><p>GDPR & nDSG Konform</p></div>
          <div className="bg-indigo-900 bg-opacity-50 p-4 rounded-lg border border-indigo-700"><div className="text-2xl mb-2">🔒</div><p>Schweizer Datenschutz (Zurich Region)</p></div>
          <div className="bg-indigo-900 bg-opacity-50 p-4 rounded-lg border border-indigo-700"><div className="text-2xl mb-2">⏱️</div><p>Keine Subscription – Kauf & Fertig</p></div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16 border-t border-indigo-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Compliance ist kein Problem – es ist ein Risiko!</h2>
            <div className="space-y-4">
              <div className="flex gap-4"><div className="text-2xl">⚠️</div><div><p className="font-bold">CHF 20 Millionen Bußgelder drohen</p><p className="text-gray-400 text-sm">Bei GDPR-Verstößen: Bis zu 20 Mio CHF oder 4% Jahresumsatz</p></div></div>
              <div className="flex gap-4"><div className="text-2xl">😰</div><div><p className="font-bold">73% der KMUs bestehen erste Audit nicht</p><p className="text-gray-400 text-sm">Manuelle Compliance ist teuer und anfällig für Fehler</p></div></div>
              <div className="flex gap-4"><div className="text-2xl">📋</div><div><p className="font-bold">Datenschutzerklärung pflicht</p><p className="text-gray-400 text-sm">Seit GDPR (2018): Jede Website MUSS eine haben</p></div></div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-8 rounded-lg border border-indigo-700">
            <h3 className="text-xl font-bold mb-4">✅ Mit Dataquard:</h3>
            <ul className="space-y-3">
              {['Professionelle Policy in Minuten', 'Vollständig GDPR & nDSG konform', 'KI-generiert, juristisch korrekt', 'Keine versteckten Gebühren', '30 Tage Geld-zurück-Garantie'].map((item) => (
                <li key={item} className="flex gap-3"><span className="text-indigo-300">✓</span><span>{item}</span></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center">Was Sie bekommen:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { icon: '🔍', title: 'Website Scanner', desc: 'Analysieren Sie Ihre Website automatisch auf Compliance-Lücken, Tracking-Code und Datenschutz-Probleme.' },
            { icon: '🤖', title: 'KI Policy Generator', desc: 'Unsere KI generiert eine maßgeschneiderte Datenschutzerklärung – professionell und juristisch korrekt.' },
            { icon: '📊', title: 'Compliance Score', desc: 'Erhalten Sie einen Compliance-Score und konkrete Empfehlungen zur Optimierung.' },
            { icon: '📥', title: 'Sofort downloadbar', desc: 'Die fertige Policy als HTML und Markdown – ready to copy-paste auf Ihrer Website.' },
          ].map((f) => (
            <div key={f.title} className="bg-indigo-900 bg-opacity-30 p-8 rounded-lg border border-indigo-700">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-bold mb-3">{f.title}</h3>
              <p className="text-gray-300">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16 border-t border-indigo-700">
        <h2 className="text-3xl font-bold mb-12 text-center">Einfache Preise</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-8 rounded-lg border-2 border-indigo-500">
            <h3 className="text-2xl font-bold mb-2">PROFESSIONAL</h3>
            <p className="text-gray-300 mb-6">Für SMEs & Einzelunternehmer</p>
            <div className="text-4xl font-bold mb-2">CHF 159</div>
            <p className="text-gray-400 mb-6">Einmaliger Kauf – Keine Subscription</p>
            <ul className="space-y-3 mb-8">
              {['AI Policy Generator', 'Website Scanning', 'Compliance Score', 'GDPR + nDSG Support', '30-Tage Geld-zurück'].map((item) => (
                <li key={item} className="flex gap-3"><span className="text-indigo-300">✓</span><span>{item}</span></li>
              ))}
            </ul>
            <Link href="/checkout" className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-lg hover:shadow-lg transition block text-center">Jetzt kaufen</Link>
          </div>
          <div className="bg-indigo-900 bg-opacity-30 p-8 rounded-lg border-2 border-indigo-700">
            <h3 className="text-2xl font-bold mb-2">ENTERPRISE</h3>
            <p className="text-gray-300 mb-6">Für größere Organisationen</p>
            <div className="text-4xl font-bold mb-2">Individuell</div>
            <p className="text-gray-400 mb-6">Kontaktieren Sie uns für Angebot</p>
            <ul className="space-y-3 mb-8">
              {['Alles aus PROFESSIONAL', 'API Access', 'White-Label Option', 'Priority Support', 'Custom Integrations'].map((item) => (
                <li key={item} className="flex gap-3"><span className="text-indigo-300">✓</span><span>{item}</span></li>
              ))}
            </ul>
            <button onClick={() => window.location.href = 'mailto:support@dataquard.ch?subject=Enterprise%20Inquiry'} className="w-full px-6 py-3 border-2 border-indigo-400 text-indigo-300 font-bold rounded-lg hover:border-indigo-200 transition">Kontaktieren Sie uns</button>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-16 border-t border-indigo-700" id="faq">
        <h2 className="text-3xl font-bold mb-12 text-center">Häufig gestellte Fragen</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-indigo-900 bg-opacity-30 rounded-lg border border-indigo-700 overflow-hidden">
              <button onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)} className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-indigo-900 hover:bg-opacity-50 transition">
                <span className="font-bold">{faq.question}</span>
                <span className="text-xl">{openFAQ === idx ? '−' : '+'}</span>
              </button>
              {openFAQ === idx && <div className="px-6 py-4 bg-indigo-900 bg-opacity-20 border-t border-indigo-700 text-gray-300">{faq.answer}</div>}
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-16 text-center border-t border-indigo-700">
        <h2 className="text-3xl font-bold mb-6">Bereit für volle Compliance?</h2>
        <p className="text-xl text-gray-300 mb-8">Starten Sie in 2 Minuten. Kein Risiko mit 30-Tage Geld-zurück-Garantie.</p>
        <Link href="/checkout" className="inline-block px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-lg hover:shadow-lg transition text-lg">🚀 Jetzt beginnen – CHF 159</Link>
      </section>

      <footer className="border-t border-indigo-700 bg-black bg-opacity-50 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-400 text-sm">
          <p>© 2026 Dataquard. GDPR & nDSG compliant privacy solutions.</p>
          <p className="mt-2">Fragen? <a href="mailto:support@dataquard.ch" className="text-indigo-400 hover:text-indigo-300">support@dataquard.ch</a></p>
        </div>
      </footer>
    </div>
  );
}