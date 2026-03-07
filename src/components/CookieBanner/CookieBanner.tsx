"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "dataquard_cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const save = (a: boolean, m: boolean) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ essential: true, analytics: a, marketing: m, timestamp: new Date().toISOString() })
    );
    setVisible(false);
  };

  if (!visible) return null;

  const C = "#00e676";

  return (
    <>
      <div style={{ position: "fixed", inset: 0, background: "rgba(4,12,28,0.5)", backdropFilter: "blur(3px)", zIndex: 9998, animation: "fadeIn 0.3s ease" }} />
      <div role="dialog" aria-modal="true" aria-label="Cookie-Einstellungen" style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9999, animation: "slideUp 0.4s cubic-bezier(0.22,1,0.36,1)", fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ background: "linear-gradient(135deg,#0b1829,#0d1f35)", borderTop: `1px solid ${C}33`, boxShadow: "0 -12px 48px rgba(0,0,0,0.5)", padding: "1.25rem 1.5rem" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", gap: "1.5rem", alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 320px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L3 6v6c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V6L12 2z" stroke={C} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
                  <path d="M9 12l2 2 4-4" stroke={C} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C }}>
                  Dataquard · Cookie-Einstellungen
                </span>
              </div>
              <p style={{ color: "#9ab0c8", fontSize: "0.85rem", margin: 0, lineHeight: 1.6 }}>
                Wir verwenden Cookies um dataquard.ch zu betreiben und zu verbessern.{" "}
                <a href="/datenschutz" style={{ color: C, textDecoration: "none" }}>Datenschutz</a>
                {" · "}
                <a href="/impressum-generator" style={{ color: C, textDecoration: "none" }}>Impressum</a>
              </p>
              <button onClick={() => setShowDetails(s => !s)} style={{ background: "none", border: "none", color: C, fontSize: "0.78rem", cursor: "pointer", padding: "0.35rem 0 0", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <svg width="10" height="10" viewBox="0 0 12 12" style={{ transform: showDetails ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>
                  <path d="M2 4l4 4 4-4" stroke={C} strokeWidth="1.5" fill="none" strokeLinecap="round" />
                </svg>
                {showDetails ? "Details ausblenden" : "Details anzeigen"}
              </button>
            </div>
            <div style={{ display: "flex", gap: "0.65rem", alignItems: "center", flexShrink: 0 }}>
              <button onClick={() => save(false, false)} style={{ padding: "0.55rem 1rem", borderRadius: "6px", border: "1px solid rgba(154,176,200,0.3)", background: "transparent", color: "#9ab0c8", fontSize: "0.82rem", cursor: "pointer" }}>
                Nur Essenzielle
              </button>
              {showDetails && (
                <button onClick={() => save(analytics, marketing)} style={{ padding: "0.55rem 1rem", borderRadius: "6px", border: `1px solid ${C}55`, background: `${C}11`, color: C, fontSize: "0.82rem", cursor: "pointer" }}>
                  Auswahl speichern
                </button>
              )}
              <button onClick={() => save(true, true)} style={{ padding: "0.55rem 1.25rem", borderRadius: "6px", border: "none", background: `linear-gradient(135deg,${C},${C}cc)`, color: "#040c1c", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", boxShadow: `0 0 16px ${C}44` }}>
                Alle akzeptieren
              </button>
            </div>
          </div>

          {showDetails && (
            <div style={{ maxWidth: "1200px", margin: "1rem auto 0", borderTop: "1px solid rgba(154,176,200,0.1)", paddingTop: "1rem", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "0.75rem" }}>
              {[
                { title: "Essenziell", desc: "Session-Cookies, Sicherheit, Consent-Speicherung", locked: true, checked: true, onChange: () => {} },
                { title: "Analyse", desc: "Vercel Analytics – anonyme Nutzungsstatistiken", locked: false, checked: analytics, onChange: setAnalytics },
                { title: "Marketing", desc: "Stripe Checkout-Optimierung", locked: false, checked: marketing, onChange: setMarketing },
              ].map((cat) => (
                <div key={cat.title} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${cat.checked || cat.locked ? C + "22" : "rgba(154,176,200,0.1)"}`, borderRadius: "8px", padding: "0.875rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                    <span style={{ color: "#e2eaf3", fontWeight: 600, fontSize: "0.83rem" }}>{cat.title}</span>
                    {cat.locked ? (
                      <span style={{ fontSize: "0.68rem", color: C }}>Immer aktiv</span>
                    ) : (
                      <label style={{ position: "relative", display: "inline-block", width: "32px", height: "17px", cursor: "pointer" }}>
                        <input type="checkbox" checked={cat.checked} onChange={(e) => cat.onChange(e.target.checked)} style={{ opacity: 0, width: 0, height: 0, position: "absolute" }} />
                        <span style={{ position: "absolute", inset: 0, borderRadius: "17px", background: cat.checked ? `linear-gradient(135deg,${C},${C}cc)` : "rgba(154,176,200,0.2)", transition: "background 0.3s" }} />
                        <span style={{ position: "absolute", top: "2px", left: cat.checked ? "17px" : "2px", width: "13px", height: "13px", borderRadius: "50%", background: "#fff", transition: "left 0.25s" }} />
                      </label>
                    )}
                  </div>
                  <p style={{ color: "#6b8499", fontSize: "0.76rem", margin: 0, lineHeight: 1.5 }}>{cat.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes slideUp { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
      `}</style>
    </>
  );
}
