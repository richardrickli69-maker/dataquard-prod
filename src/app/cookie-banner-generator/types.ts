// types.ts
// Geteilte Typen und Hilfsfunktionen für Cookie-Banner Generator

export type Jurisdiction = "nDSG" | "DSGVO" | "beides";
export type Language = "de" | "fr" | "en";
export type TrackerKey =
  | "google_analytics"
  | "google_fonts"
  | "google_maps"
  | "meta_pixel"
  | "youtube"
  | "stripe"
  | "hotjar"
  | "linkedin"
  | "intercom"
  | "cloudflare";

export type TrackerCategory = "analytics" | "marketing" | "essential_external";

export type BannerConfig = {
  domain: string;
  companyName: string;
  jurisdiction: Jurisdiction;
  language: Language;
  trackers: TrackerKey[];
  primaryColor: string;
  position: "bottom" | "bottom-left" | "bottom-right";
  showCategories: boolean;
  privacyUrl: string;
  imprintUrl: string;
};

export type DomainBanner = BannerConfig & {
  id: string;
  createdAt: string;
  status: "active" | "draft";
};

export const TRACKER_META: Record<
  TrackerKey,
  { label: string; category: TrackerCategory }
> = {
  google_analytics: { label: "Google Analytics", category: "analytics" },
  google_fonts:     { label: "Google Fonts",     category: "analytics" },
  google_maps:      { label: "Google Maps",       category: "marketing" },
  meta_pixel:       { label: "Meta Pixel",        category: "marketing" },
  youtube:          { label: "YouTube",           category: "marketing" },
  stripe:           { label: "Stripe",            category: "essential_external" },
  hotjar:           { label: "Hotjar",            category: "analytics" },
  linkedin:         { label: "LinkedIn Insight",  category: "marketing" },
  intercom:         { label: "Intercom",          category: "analytics" },
  cloudflare:       { label: "Cloudflare",        category: "essential_external" },
};

export const ALL_TRACKERS = Object.keys(TRACKER_META) as TrackerKey[];

export const JURISDICTION_LABELS: Record<Jurisdiction, string> = {
  nDSG:   "🟢 nDSG (Schweiz)",
  DSGVO:  "🟡 DSGVO (EU/DE)",
  beides: "🔴 nDSG + DSGVO",
};

export const MAX_DOMAINS = 5;

// ─── Code Generators ──────────────────────────────────────────────────────────

export function generateReactCode(c: BannerConfig | DomainBanner): string {
  const analyticsTrackers = c.trackers
    .filter((t) => TRACKER_META[t]?.category === "analytics")
    .map((t) => TRACKER_META[t].label);
  const marketingTrackers = c.trackers
    .filter((t) => TRACKER_META[t]?.category === "marketing")
    .map((t) => TRACKER_META[t].label);
  const storageKey = `consent_${c.domain.replace(/\./g, "_")}`;
  const jurisdictionComment =
    c.jurisdiction === "nDSG"
      ? "Konform mit Schweizer nDSG (Art. 45b DSG)"
      : c.jurisdiction === "DSGVO"
      ? "Konform mit EU DSGVO (Art. 7)"
      : "Konform mit nDSG (CH) + DSGVO (EU)";

  return `"use client";
// ${jurisdictionComment}
// Generiert von Dataquard – dataquard.ch
// Domain: ${c.domain} | ${c.jurisdiction} | ${new Date().toLocaleDateString("de-CH")}

import { useState, useEffect } from "react";

const KEY = "${storageKey}";
const PRIMARY = "${c.primaryColor}";

export default function CookieBanner() {
  const [show, setShow] = useState(false);
  const [open, setOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(KEY)) {
      setTimeout(() => setShow(true), 800);
    }
  }, []);

  const save = (a: boolean, m: boolean) => {
    localStorage.setItem(KEY, JSON.stringify({
      essential: true, analytics: a, marketing: m,
      timestamp: new Date().toISOString(),
    }));
    setShow(false);
    // ↓ Hier Tracking initialisieren je nach Einwilligung
    if (a) { /* initAnalytics(); ${analyticsTrackers.join(", ") || "—"} */ }
    if (m) { /* initMarketing(); ${marketingTrackers.join(", ") || "—"} */ }
  };

  if (!show) return null;

  return (
    <>
      <div style={{ position: "fixed", inset: 0, background: "rgba(4,12,28,.5)",
        backdropFilter: "blur(3px)", zIndex: 9998 }} />
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9999,
        background: "linear-gradient(135deg,#0b1829,#0d1f35)",
        borderTop: \`1px solid \${PRIMARY}33\`,
        boxShadow: "0 -12px 40px rgba(0,0,0,.5)",
        padding: "1.25rem 1.5rem",
        fontFamily: "system-ui, sans-serif",
        animation: "slideUp .4s cubic-bezier(.22,1,.36,1)" }}>

        <div style={{ maxWidth:"1200px", margin:"0 auto", display:"flex",
          gap:"1.5rem", flexWrap:"wrap", alignItems:"flex-start" }}>

          <div style={{ flex:"1 1 280px" }}>
            <p style={{ color:"#9ab0c8", fontSize:".875rem", margin:"0 0 .4rem", lineHeight:1.6 }}>
              Wir verwenden Cookies auf{" "}
              <strong style={{ color:"#e2eaf3" }}>${c.domain}</strong>.{" "}
              <a href="${c.privacyUrl}" style={{ color:PRIMARY }}>Datenschutz</a>
              {" · "}
              <a href="${c.imprintUrl}" style={{ color:PRIMARY }}>Impressum</a>
            </p>
            ${c.showCategories ? `<button onClick={() => setOpen(o => !o)}
              style={{ background:"none", border:"none", color:PRIMARY,
                fontSize:".78rem", cursor:"pointer", padding:0 }}>
              {open ? "▲" : "▼"} Details {open ? "ausblenden" : "anzeigen"}
            </button>` : ""}
          </div>

          <div style={{ display:"flex", gap:".65rem", alignItems:"center", flexShrink:0 }}>
            <button onClick={() => save(false, false)}
              style={{ padding:".55rem 1rem", borderRadius:"6px",
                border:"1px solid rgba(154,176,200,.3)", background:"transparent",
                color:"#9ab0c8", fontSize:".82rem", cursor:"pointer" }}>
              Nur Essenzielle
            </button>
            {open && (
              <button onClick={() => save(analytics, marketing)}
                style={{ padding:".55rem 1rem", borderRadius:"6px",
                  border:\`1px solid \${PRIMARY}55\`, background:\`\${PRIMARY}11\`,
                  color:PRIMARY, fontSize:".82rem", cursor:"pointer" }}>
                Auswahl speichern
              </button>
            )}
            <button onClick={() => save(true, true)}
              style={{ padding:".55rem 1.2rem", borderRadius:"6px", border:"none",
                background:\`linear-gradient(135deg,\${PRIMARY},\${PRIMARY}cc)\`,
                color:"#040c1c", fontSize:".82rem", fontWeight:700, cursor:"pointer" }}>
              Alle akzeptieren
            </button>
          </div>
        </div>

        ${c.showCategories ? `{open && (
          <div style={{ maxWidth:"1200px", margin:".75rem auto 0",
            borderTop:"1px solid rgba(154,176,200,.1)", paddingTop:".75rem",
            display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:".6rem" }}>
            <CatCard title="Essenziell" desc="Session, Sicherheit, Consent" locked />
            ${analyticsTrackers.length > 0 ? `<CatCard title="Analyse" desc="${analyticsTrackers.join(", ")}"
              checked={analytics} onChange={setAnalytics} />` : ""}
            ${marketingTrackers.length > 0 ? `<CatCard title="Marketing" desc="${marketingTrackers.join(", ")}"
              checked={marketing} onChange={setMarketing} />` : ""}
          </div>
        )}` : ""}
      </div>
      <style>{\`
        @keyframes slideUp { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
      \`}</style>
    </>
  );
}

function CatCard({ title, desc, checked, locked, onChange }: any) {
  const C = PRIMARY;
  return (
    <div style={{ background:"rgba(255,255,255,.03)",
      border:\`1px solid \${checked||locked?C+"33":"rgba(154,176,200,.1)"}\`,
      borderRadius:"7px", padding:".7rem" }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:".3rem" }}>
        <span style={{ color:"#e2eaf3", fontWeight:600, fontSize:".82rem" }}>{title}</span>
        {locked ? (
          <span style={{ fontSize:".65rem", color:C }}>Immer aktiv</span>
        ) : (
          <label style={{ position:"relative", display:"inline-block", width:"30px", height:"16px", cursor:"pointer" }}>
            <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
              style={{ opacity:0, width:0, height:0, position:"absolute" }} />
            <span style={{ position:"absolute", inset:0, borderRadius:"16px",
              background:checked?\`linear-gradient(135deg,\${C},\${C}cc)\`:"rgba(154,176,200,.2)",
              transition:"background .3s" }} />
            <span style={{ position:"absolute", top:"2px", left:checked?"16px":"2px",
              width:"12px", height:"12px", borderRadius:"50%", background:"#fff",
              transition:"left .25s" }} />
          </label>
        )}
      </div>
      <p style={{ color:"#6b8499", fontSize:".72rem", margin:0, lineHeight:1.5 }}>{desc}</p>
    </div>
  );
}
`;
}

export function generateVanillaCode(c: BannerConfig | DomainBanner): string {
  return `// Cookie Banner – Vanilla JS
// Generiert von Dataquard – dataquard.ch
// Domain: ${c.domain} | ${c.jurisdiction} | ${new Date().toLocaleDateString("de-CH")}

(function () {
  const KEY = "${c.domain.replace(/\./g, "_")}_consent";
  const C   = "${c.primaryColor}";

  if (localStorage.getItem(KEY)) return;

  const save = (analytics, marketing) => {
    localStorage.setItem(KEY, JSON.stringify({
      essential: true, analytics, marketing,
      timestamp: new Date().toISOString(),
    }));
    banner.remove();
    backdrop.remove();
    if (analytics) { /* initAnalytics() */ }
    if (marketing)  { /* initMarketing() */ }
  };

  const backdrop = document.createElement("div");
  Object.assign(backdrop.style, {
    position: "fixed", inset: "0",
    background: "rgba(4,12,28,.5)",
    backdropFilter: "blur(3px)",
    zIndex: "9998",
  });
  document.body.appendChild(backdrop);

  const banner = document.createElement("div");
  banner.innerHTML = \`
    <div style="background:linear-gradient(135deg,#0b1829,#0d1f35);
      border-top:1px solid \${C}33;
      box-shadow:0 -12px 40px rgba(0,0,0,.5);
      padding:1.25rem 1.5rem;font-family:system-ui,sans-serif;">
      <div style="max-width:1200px;margin:0 auto;display:flex;gap:1.5rem;flex-wrap:wrap;align-items:center;">
        <p style="flex:1;color:#9ab0c8;font-size:.875rem;margin:0;line-height:1.6;">
          Wir verwenden Cookies auf
          <strong style="color:#e2eaf3">${c.domain}</strong>.
          <a href="${c.privacyUrl}" style="color:\${C}">Datenschutz</a> ·
          <a href="${c.imprintUrl}" style="color:\${C}">Impressum</a>
        </p>
        <div style="display:flex;gap:.65rem;flex-shrink:0">
          <button id="dq-reject"
            style="padding:.55rem 1rem;border-radius:6px;
            border:1px solid rgba(154,176,200,.3);background:transparent;
            color:#9ab0c8;font-size:.82rem;cursor:pointer">
            Nur Essenzielle
          </button>
          <button id="dq-accept"
            style="padding:.55rem 1.2rem;border-radius:6px;border:none;
            background:linear-gradient(135deg,\${C},\${C}cc);
            color:#040c1c;font-size:.82rem;font-weight:700;cursor:pointer">
            Alle akzeptieren
          </button>
        </div>
      </div>
    </div>
    <style>
      @keyframes slideUp {
        from { transform: translateY(100%); opacity: 0; }
        to   { transform: translateY(0);    opacity: 1; }
      }
    </style>
  \`;
  Object.assign(banner.style, {
    position: "fixed", bottom: "0", left: "0", right: "0",
    zIndex: "9999",
    animation: "slideUp .4s cubic-bezier(.22,1,.36,1)",
  });
  document.body.appendChild(banner);

  document.getElementById("dq-reject").onclick = () => save(false, false);
  document.getElementById("dq-accept").onclick = () => save(true, true);
})();
`;
}
