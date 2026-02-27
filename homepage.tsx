'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// Animated counter hook
function useCounter(end: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, start]);
  return count;
}

export default function HomePage() {
  const [url, setUrl] = useState('');
  const [statsVisible, setStatsVisible] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  const kmu = useCounter(4800, 2200, statsVisible);
  const violations = useCounter(73, 1800, statsVisible);
  const minutes = useCounter(3, 1200, statsVisible);

  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 100);

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const handleScan = () => {
    if (url.trim()) {
      window.location.href = `/scanner?url=${encodeURIComponent(url)}`;
    } else {
      window.location.href = '/scanner';
    }
  };

  return (
    <div className="min-h-screen bg-[#080B14] text-white overflow-x-hidden" style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>

      {/* Grid background */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />

      {/* Glow top */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)' }} />

      {/* NAV */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-sm font-bold">D</div>
          <span className="font-bold text-white text-lg tracking-tight">Dataquard</span>
          <span className="text-xs text-indigo-400 border border-indigo-800 bg-indigo-950 px-2 py-0.5 rounded-full ml-1">CH</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
          <Link href="/scanner" className="hover:text-white transition-colors">Scanner</Link>
          <Link href="/datenschutz-generator" className="hover:text-white transition-colors">Datenschutz</Link>
          <Link href="/impressum-generator" className="hover:text-white transition-colors">Impressum</Link>
          <Link href="/checkout" className="hover:text-white transition-colors">Preise</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/scanner" className="hidden md:block text-sm text-gray-400 hover:text-white transition-colors">
            Kostenlos testen
          </Link>
          <Link href="/checkout" className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all">
            Starter – CHF 79 →
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative px-6 pt-24 pb-20 text-center max-w-5xl mx-auto">

        {/* Badge */}
        <div className={`inline-flex items-center gap-2 border border-indigo-800 bg-indigo-950 bg-opacity-60 text-indigo-300 text-xs font-medium px-4 py-2 rounded-full mb-8 transition-all duration-700 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          Neu: nDSG-konform seit September 2023
        </div>

        {/* Headline */}
        <h1 className={`text-5xl md:text-7xl font-black text-white mb-6 leading-[1.05] tracking-tight transition-all duration-700 delay-100 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          Ihre Website.
          <br />
          <span style={{ background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 40%, #4f46e5 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Rechtssicher.
          </span>
          <br />
          In 3 Minuten.
        </h1>

        <p className={`text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed transition-all duration-700 delay-200 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          Der einzige Schweizer Website-Check der Compliance, Performance und Security 
          gleichzeitig prüft – und direkt behebt.
        </p>

        {/* Scan Input */}
        <div className={`max-w-xl mx-auto transition-all duration-700 delay-300 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex gap-2 bg-white/5 border border-white/10 rounded-xl p-2 backdrop-blur-sm">
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleScan()}
              placeholder="https://ihre-website.ch"
              className="flex-1 bg-transparent text-white placeholder-gray-500 px-3 py-2 focus:outline-none text-sm"
            />
            <button
              onClick={handleScan}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-lg transition-all text-sm whitespace-nowrap"
            >
              Kostenlos scannen →
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-3">Kostenlos · Keine Anmeldung · Ergebnis in 10 Sekunden</p>
        </div>

        {/* Social proof row */}
        <div className={`flex items-center justify-center gap-6 mt-10 text-xs text-gray-500 transition-all duration-700 delay-500 ${heroVisible ? 'opacity-100' : 'opacity-0'}`}>
          <span className="flex items-center gap-1.5">🇨🇭 Schweizer Produkt</span>
          <span className="w-px h-4 bg-gray-800" />
          <span className="flex items-center gap-1.5">🔒 Daten in Zürich</span>
          <span className="w-px h-4 bg-gray-800" />
          <span className="flex items-center gap-1.5">⚖️ nDSG/DSGVO-konform</span>
        </div>
      </section>

      {/* THREE PILLARS */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3">Drei Säulen</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">Was wir für Sie prüfen</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: '⚖️',
              color: 'indigo',
              title: 'Compliance',
              sub: 'nDSG / DSGVO',
              desc: 'Datenschutzerklärung, Cookie Banner, Tracker-Erkennung, Impressum-Pflicht – alles was das Gesetz verlangt.',
              checks: ['Datenschutzerklärung vorhanden', 'Cookie-Banner konform', 'Tracker erkannt & dokumentiert', 'Impressum vollständig'],
            },
            {
              icon: '⚡',
              color: 'yellow',
              title: 'Performance',
              sub: 'Speed & Mobile',
              desc: 'Ladezeit, Mobile-Optimierung, SSL-Zertifikat, veraltete Scripts – alles was Ihre Besucher und Google bewertet.',
              checks: ['Ladezeit < 3 Sekunden', 'Mobile-freundlich', 'SSL aktiv & gültig', 'Keine veralteten Scripts'],
            },
            {
              icon: '🔒',
              color: 'green',
              title: 'Trust',
              sub: 'Vertrauen & Sicherheit',
              desc: 'Meta-Tags, Kontaktinfos, SSL-Gültigkeit, Sicherheitsindikatoren – was Besucher und Suchmaschinen vertrauen lässt.',
              checks: ['Meta-Tags vollständig', 'Kontaktinfos sichtbar', 'Keine broken Links', 'HTTPS überall'],
            },
          ].map((pillar) => (
            <div key={pillar.title}
              className="bg-white/3 border border-white/8 rounded-2xl p-6 hover:border-indigo-800 transition-all group">
              <div className="text-3xl mb-4">{pillar.icon}</div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-white font-bold text-lg">{pillar.title}</h3>
                <span className="text-xs text-gray-500 border border-gray-800 px-2 py-0.5 rounded-full">{pillar.sub}</span>
              </div>
              <p className="text-gray-400 text-sm mb-5 leading-relaxed">{pillar.desc}</p>
              <ul className="space-y-2">
                {pillar.checks.map(check => (
                  <li key={check} className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="text-green-500">✓</span>
                    {check}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section ref={statsRef} className="px-6 py-16 border-y border-white/5">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-5xl font-black text-white mb-2">{kmu.toLocaleString('de-CH')}+</div>
            <div className="text-sm text-gray-500">Schweizer KMUs betroffen<br/>von nDSG-Pflichten</div>
          </div>
          <div>
            <div className="text-5xl font-black text-indigo-400 mb-2">{violations}%</div>
            <div className="text-sm text-gray-500">der Schweizer Websites<br/>ohne korrekte Datenschutzerklärung</div>
          </div>
          <div>
            <div className="text-5xl font-black text-green-400 mb-2">{minutes} min</div>
            <div className="text-sm text-gray-500">bis Ihre Website<br/>vollständig geschützt ist</div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 py-20 max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3">So einfach</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">In 3 Schritten rechtssicher</h2>
        </div>

        <div className="space-y-4">
          {[
            {
              step: '01',
              title: 'Website scannen',
              desc: 'URL eingeben – in 10 Sekunden erhalten Sie einen vollständigen Bericht mit Compliance-, Performance- und Trust-Score.',
              cta: 'Jetzt scannen',
              href: '/scanner',
              color: 'indigo',
            },
            {
              step: '02',
              title: 'Dokumente generieren',
              desc: 'Datenschutzerklärung und Impressum werden automatisch auf Basis Ihres Scans ausgefüllt – individuell, rechtssicher, sofort.',
              cta: 'Datenschutz erstellen',
              href: '/datenschutz-generator',
              color: 'purple',
            },
            {
              step: '03',
              title: 'Einbinden & fertig',
              desc: 'HTML-Snippet kopieren, auf Ihrer Website einfügen. Dataquard informiert Sie bei Gesetzesänderungen automatisch.',
              cta: 'Starter kaufen',
              href: '/checkout',
              color: 'green',
            },
          ].map((item, i) => (
            <div key={i} className="flex gap-6 bg-white/3 border border-white/8 rounded-2xl p-6 hover:border-indigo-800 transition-all group">
              <div className="text-4xl font-black text-white/10 group-hover:text-indigo-900 transition-colors w-14 shrink-0 pt-1">
                {item.step}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
              <div className="shrink-0 flex items-center">
                <Link href={item.href}
                  className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold whitespace-nowrap transition-colors">
                  {item.cta} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3">Preise</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">Transparent. Fair. Schweizer Qualität.</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              name: 'Free',
              price: '0',
              period: 'immer kostenlos',
              desc: 'Für den ersten Überblick',
              features: ['Website-Scan', 'Ampel-Score', 'Compliance-Bericht', 'Performance-Check'],
              missing: ['Datenschutzerklärung', 'Impressum', 'Updates'],
              cta: 'Kostenlos scannen',
              href: '/scanner',
              highlight: false,
            },
            {
              name: 'Starter',
              price: '79',
              period: 'pro Jahr',
              desc: 'Für Schweizer KMUs',
              features: ['Alles aus Free', 'Datenschutzerklärung', 'Impressum Generator', 'Cookie-Analyse', 'Automatische Updates', '1 Domain'],
              missing: [],
              cta: 'Jetzt starten',
              href: '/checkout?product=starter',
              highlight: true,
            },
            {
              name: 'Professional',
              price: '199',
              period: 'pro Jahr',
              desc: 'Für wachsende Teams',
              features: ['Alles aus Starter', 'Bis zu 5 Domains', 'Monatliche Re-Scans', 'AGB-Vorlage', 'Priority Support', 'Rechtliche Alerts'],
              missing: [],
              cta: 'Professional wählen',
              href: '/checkout?product=professional',
              highlight: false,
            },
          ].map((plan) => (
            <div key={plan.name}
              className={`relative rounded-2xl p-6 border transition-all ${
                plan.highlight
                  ? 'bg-indigo-950 border-indigo-600 shadow-[0_0_40px_rgba(99,102,241,0.15)]'
                  : 'bg-white/3 border-white/8 hover:border-indigo-800'
              }`}>
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                  Empfohlen
                </div>
              )}
              <div className="mb-5">
                <div className="text-gray-400 text-sm mb-1">{plan.name}</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">CHF {plan.price}</span>
                  <span className="text-gray-500 text-sm">/{plan.period}</span>
                </div>
                <div className="text-gray-500 text-xs mt-1">{plan.desc}</div>
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="text-green-400 text-xs">✓</span>{f}
                  </li>
                ))}
                {plan.missing.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600 line-through">
                    <span className="text-gray-700 text-xs">✗</span>{f}
                  </li>
                ))}
              </ul>

              <Link href={plan.href}
                className={`block text-center font-bold py-3 rounded-xl transition-all text-sm ${
                  plan.highlight
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
                }`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          Alle Preise in CHF inkl. MwSt. · Jährliche Abrechnung · Keine versteckten Kosten
        </p>
      </section>

      {/* VS COMPETITOR */}
      <section className="px-6 py-16 max-w-3xl mx-auto">
        <div className="bg-white/3 border border-white/8 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Dataquard vs. andere Tools</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-gray-400 pb-3 font-medium">Feature</th>
                  <th className="text-center text-indigo-400 pb-3 font-bold">Dataquard</th>
                  <th className="text-center text-gray-500 pb-3 font-medium">PrivacyBee</th>
                  <th className="text-center text-gray-500 pb-3 font-medium">iubenda</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                {[
                  ['Compliance-Check', '✅', '✅', '✅'],
                  ['Performance-Check', '✅', '❌', '❌'],
                  ['Security-Check', '✅', '❌', '❌'],
                  ['Schweizer nDSG', '✅', '✅', '⚠️'],
                  ['Auto-Scan & Pre-fill', '✅', '✅', '❌'],
                  ['Preis/Jahr', 'CHF 79', 'CHF 55', '€ 144+'],
                  ['Daten in Schweiz', '✅', '⚠️', '❌'],
                ].map(([feature, dq, pb, iu]) => (
                  <tr key={feature} className="border-b border-white/5">
                    <td className="py-3 text-gray-400">{feature}</td>
                    <td className="py-3 text-center font-semibold text-white">{dq}</td>
                    <td className="py-3 text-center text-gray-500">{pb}</td>
                    <td className="py-3 text-center text-gray-500">{iu}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="px-6 py-24 text-center relative">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.08) 0%, transparent 70%)' }} />
        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            Ist Ihre Website<br />
            <span style={{ background: 'linear-gradient(135deg, #818cf8, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              wirklich rechtssicher?
            </span>
          </h2>
          <p className="text-gray-400 mb-10 text-lg">
            Finden Sie es in 10 Sekunden heraus – kostenlos und ohne Anmeldung.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/scanner"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all">
              Kostenlos scannen →
            </Link>
            <Link href="/checkout"
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-bold px-8 py-4 rounded-xl text-lg transition-all">
              Starter – CHF 79/Jahr
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 px-6 py-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-xs font-bold">D</div>
            <span className="text-gray-500 text-sm">Dataquard © 2026 · Basel, Schweiz</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-600">
            <Link href="/scanner" className="hover:text-gray-400 transition-colors">Scanner</Link>
            <Link href="/datenschutz-generator" className="hover:text-gray-400 transition-colors">Datenschutz</Link>
            <Link href="/impressum-generator" className="hover:text-gray-400 transition-colors">Impressum</Link>
            <Link href="/checkout" className="hover:text-gray-400 transition-colors">Preise</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
