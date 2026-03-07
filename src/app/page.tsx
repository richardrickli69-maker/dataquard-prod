// src/app/page.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [heroUrl, setHeroUrl] = useState('');
  const [heroScanning, setHeroScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('');
  const [scanProgress, setScanProgress] = useState(0);
  const router = useRouter();

  const handleHeroScan = async () => {
    if (!heroUrl.trim()) return;
    let url = heroUrl.trim();
    if (!url.startsWith('http')) url = 'https://' + url;

    setHeroScanning(true);
    setScanProgress(0);

    const steps = [
      { msg: 'Prüfe SSL & HTTPS…', progress: 20 },
      { msg: 'Erkenne Drittanbieter & Tracker…', progress: 45 },
      { msg: 'Analysiere Impressum & Datenschutz…', progress: 70 },
      { msg: 'Berechne Compliance-Score…', progress: 90 },
    ];

    for (const step of steps) {
      setScanStatus(step.msg);
      setScanProgress(step.progress);
      await new Promise(r => setTimeout(r, 600));
    }

    setScanProgress(100);
    setScanStatus('Analyse abgeschlossen – leite weiter…');
    await new Promise(r => setTimeout(r, 400));

    setHeroScanning(false);
    router.push(`/scanner?url=${encodeURIComponent(url)}`);
  };

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
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-center items-center">
          <Image src="/logo.png" alt="Dataquard" width={256} height={256} className="h-10 w-auto" />
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        {/* Urgency Badge */}
        <div className="inline-flex items-center gap-2 bg-red-600/90 border border-red-400/50 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-8">
          <span>⚠</span>
          <span>nDSG seit 01.09.2023 in Kraft – Bussen bis CHF 250&apos;000</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Keine Busse. Kein Anwalt.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-pink-300">Fertig in 3 Min.</span>
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Das neue Schweizer nDSG gilt seit 2023. Dataquard scannt Ihre Website kostenlos und erstellt die rechtssichere Datenschutzerklärung – automatisch, ohne Rechtskenntnisse.
        </p>

        {/* Hero Scanner-Eingabe */}
        <div className="mt-2 mb-8 max-w-xl mx-auto">
          <div className="flex gap-3 bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-2 shadow-xl">
            <input
              type="text"
              value={heroUrl}
              onChange={e => setHeroUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleHeroScan()}
              placeholder="https://ihre-website.ch"
              className="flex-1 bg-transparent px-4 py-3 text-white placeholder-white/50 focus:outline-none text-sm"
            />
            <button
              onClick={handleHeroScan}
              className="bg-red-500 hover:bg-red-400 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all whitespace-nowrap"
            >
              Jetzt kostenlos prüfen →
            </button>
          </div>
        </div>

        {heroScanning && (
          <div className="mt-6 max-w-xl mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                <span className="text-sm text-white/70">{scanStatus}</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <div
                  className="bg-blue-400 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        <p className="text-sm text-gray-400 mb-8">
          <Link href="#preise" className="text-indigo-400 hover:text-indigo-300 underline">Preise ansehen ↓</Link>
        </p>
      </section>

      {/* Trust Badges Strip */}
      <div style={{ background: '#0D1B2A' }} className="border-y border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-5 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
          <div className="flex items-center justify-center gap-3 py-4 md:py-0">
            <span className="text-2xl">🇨🇭</span>
            <div className="text-left">
              <div className="text-sm font-semibold text-white">Daten in der Schweiz</div>
              <div className="text-xs text-gray-400">Sicher auf Schweizer Servern</div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 py-4 md:py-0">
            <span className="text-2xl">✅</span>
            <div className="text-left">
              <div className="text-sm font-semibold text-white">EDÖB-konform</div>
              <div className="text-xs text-gray-400">nDSG 2023 erfüllt</div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 py-4 md:py-0">
            <span className="text-2xl">🔒</span>
            <div className="text-left">
              <div className="text-sm font-semibold text-white">Keine Kreditkarte</div>
              <div className="text-xs text-gray-400">Kostenlos starten</div>
            </div>
          </div>
        </div>
      </div>

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

      {/* Scan Preview */}
      <section className="max-w-6xl mx-auto px-4 py-16 border-t border-indigo-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Mock-up */}
          <div className="bg-[#0D1B2A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            {/* Browser Bar */}
            <div className="bg-[#1A2A3A] px-4 py-3 flex items-center gap-3 border-b border-white/10">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <div className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-1 text-xs text-gray-400 font-mono">
                muster-kmu.ch
              </div>
            </div>
            {/* Scan Result */}
            <div className="p-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-4">Scan-Ergebnis</div>
              <div className="space-y-3">
                {[
                  { label: 'Datenschutzerklärung', icon: '❌', color: 'text-red-400' },
                  { label: 'Cookie-Banner', icon: '⚠️', color: 'text-yellow-400' },
                  { label: 'Google Analytics', icon: '❌', color: 'text-red-400' },
                  { label: 'SSL-Zertifikat', icon: '✅', color: 'text-green-400' },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-2.5 px-3 bg-white/5 rounded-lg border border-white/5">
                    <span className="text-sm text-gray-300">{row.label}</span>
                    <span className={`text-sm font-semibold ${row.color}`}>{row.icon}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/10">
                <span className="text-xs text-gray-500">Compliance-Score</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-white/10 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '28%' }} />
                  </div>
                  <span className="text-lg font-bold text-red-400">28/100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Text */}
          <div>
            <h2 className="text-3xl font-bold mb-4">So sieht Ihr Ergebnis aus</h2>
            <p className="text-gray-400 mb-8">In Sekunden sehen Sie, wo Ihre Website rechtliche Risiken hat – klar, verständlich, ohne Fachjargon.</p>
            <ul className="space-y-5">
              {[
                { icon: '🔍', title: 'Alle Tracker werden erkannt', desc: 'Google Analytics, Facebook Pixel, Hotjar – wir finden jeden Drittanbieter auf Ihrer Seite.' },
                { icon: '🚦', title: 'Ampel zeigt Handlungsbedarf', desc: 'Rot, Gelb, Grün – auf einen Blick sehen Sie, was sofort behoben werden muss.' },
                { icon: '⚡', title: 'Policy mit einem Klick generieren', desc: 'Direkt aus dem Ergebnis: Datenschutzerklärung erstellen, herunterladen, einbinden. Fertig.' },
              ].map((point) => (
                <li key={point.title} className="flex gap-4">
                  <span className="text-2xl flex-shrink-0">{point.icon}</span>
                  <div>
                    <div className="font-semibold text-white mb-1">{point.title}</div>
                    <div className="text-gray-400 text-sm leading-relaxed">{point.desc}</div>
                  </div>
                </li>
              ))}
            </ul>
            <button
              onClick={handleHeroScan}
              className="mt-8 px-8 py-3 bg-red-500 hover:bg-red-400 text-white font-semibold rounded-xl transition-all text-sm"
            >
              Jetzt kostenlos prüfen →
            </button>
          </div>
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

      {/* So funktioniert's */}
      <section className="py-16 border-t border-indigo-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-12">In 3 Schritten zu Ihrer Datenschutzerklärung</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: '1', icon: '🔍', title: 'Website scannen', desc: 'URL eingeben – kostenlos, ohne Anmeldung. Wir erkennen automatisch alle Drittanbieter.' },
              { num: '2', icon: '📊', title: 'Report erhalten', desc: 'Compliance-Score, Jurisdiktion (nDSG/DSGVO) und konkrete Handlungsempfehlungen.' },
              { num: '3', icon: '📄', title: 'Dokument herunterladen', desc: 'Datenschutzerklärung + Impressum + Cookie-Banner generiert, als PDF herunterladbar. Fertig in Minuten.' },
            ].map((step) => (
              <div key={step.num} className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg font-mono">
                  {step.num}
                </div>
                <div className="text-3xl">{step.icon}</div>
                <h3 className="font-bold text-white">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
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
              { icon: '💳', title: 'Zahlung', desc: 'Einmalkauf. Keine Verlängerung. Keine versteckten Kosten.' },
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
          <Link href="/agb" className="inline-block px-8 py-3 border border-indigo-500 text-indigo-300 rounded-lg hover:bg-indigo-900 transition text-sm">Vollständige AGB lesen →</Link>
        </div>
      </section>

      {/* Preise */}
      <section className="max-w-7xl mx-auto px-4 py-16 border-t border-indigo-700" id="preise">
        <h2 className="text-3xl font-bold mb-4 text-center">Transparent. Fair. Schweizer Qualität.</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-12">
          {[
            { name: 'Impressum', price: 'CHF 19', sub: 'Einmalkauf', desc: 'Nur das Impressum', features: ['Impressum Generator', 'Schweiz + Deutschland', 'Sofort downloadbar'], missing: [], cta: 'Impressum erstellen', link: '/impressum-generator', highlight: false },
            { name: 'Free', price: 'CHF 0', sub: 'immer kostenlos', desc: 'Für den ersten Überblick', features: ['Website-Scan', 'Ampel-Score', 'Compliance-Bericht', 'Performance-Check'], missing: ['Datenschutzerklärung', 'Impressum'], cta: 'Kostenlos scannen', link: '/scanner', highlight: false },
            { name: 'Starter', price: 'CHF 79', sub: 'Einmalkauf', desc: 'Für Schweizer KMUs', features: ['Alles aus Free', 'Datenschutzerklärung', 'Impressum Generator', 'Cookie-Banner Generator', '1 Domain'], missing: [], cta: 'Jetzt starten', link: '/checkout', highlight: true },
            { name: 'Professional', price: 'CHF 149', sub: 'Einmalkauf', desc: 'Für wachsende Teams', features: ['Datenschutzerklärung', 'Impressum Generator', 'Cookie-Banner Generator (5 Domains)', 'Priority Support'], missing: [], cta: 'Professional wählen', link: '/checkout', highlight: false },
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
        <p className="text-center text-gray-400 text-sm mt-6">Alle Preise in CHF inkl. MwSt. · Einmalkauf · Keine versteckten Kosten</p>
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
                ['Cookie-Banner Generator', '✅', '❌', '⚠️'],
                ['Preis', 'CHF 79', 'CHF 55', '€ 144+'],
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
        <p className="text-xl text-gray-300 mb-6">Finden Sie es in 10 Sekunden heraus – kostenlos und ohne Anmeldung.</p>
        <p className="text-sm text-amber-300/80 mb-6">
          ⚖️ Das Schweizer nDSG ist seit 01.09.2023 in Kraft – ist Ihre Website konform?
        </p>
        <div className="flex justify-center">
          <Link href="/scanner" className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-lg hover:shadow-lg transition text-lg">Jetzt kostenlos scannen →</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-indigo-700 bg-black bg-opacity-50 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center text-gray-400 text-sm">
          <div className="flex flex-wrap justify-center gap-4 mb-4 text-xs text-slate-500">
            <span>🇨🇭 Server in Zürich</span>
            <span>🔒 SSL-verschlüsselt</span>
            <span>⚖️ nDSG-konform</span>
            <span>🛡️ Keine Datenweitergabe</span>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center w-full text-gray-400 text-sm">
          <span className="mb-4 md:mb-0">© 2026 · Basel, Schweiz</span>
          <div className="flex gap-6 items-center">
            <Link href="/scanner" className="hover:text-white">Scanner</Link>
            <Link href="/datenschutz" className="hover:text-white">Datenschutz</Link>
            <Link href="/impressum-generator" className="hover:text-white">Impressum</Link>
            <Link href="#preise" className="hover:text-white">Preise</Link>
            <Link href="/agb" className="hover:text-white">AGB</Link>
            <Link href="/auth" className="px-4 py-1.5 border border-indigo-700 text-indigo-400 rounded-lg hover:bg-indigo-900 hover:text-white transition">Anmelden</Link>
          </div>
          </div>
        </div>
      </footer>

    </div>
  );
}