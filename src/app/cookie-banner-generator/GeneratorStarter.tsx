"use client";

// GeneratorStarter.tsx
// Starter-Plan: 1 Domain, vollständiger Banner-Generator mit Live-Vorschau

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  BannerConfig,
  TrackerKey,
  TRACKER_META,
  ALL_TRACKERS,
  JURISDICTION_LABELS,
  generateReactCode,
  generateVanillaCode,
} from "./types";

export default function GeneratorStarter() {
  const searchParams = useSearchParams();

  const rawDomain      = searchParams.get("domain") ?? "";
  const rawJurisdiction = (searchParams.get("jurisdiction") ?? "nDSG") as BannerConfig["jurisdiction"];
  const rawTrackers    = (searchParams.get("trackers") ?? "").split(",").filter(Boolean) as TrackerKey[];

  const [config, setConfig] = useState<BannerConfig>({
    domain:         rawDomain,
    companyName:    "",
    jurisdiction:   rawJurisdiction,
    language:       "de",
    trackers:       rawTrackers,
    primaryColor:   "#00e676",
    position:       "bottom",
    showCategories: true,
    privacyUrl:     rawDomain ? `https://${rawDomain}/datenschutz` : "/datenschutz",
    imprintUrl:     rawDomain ? `https://${rawDomain}/impressum`   : "/impressum",
  });

  const [activeTab, setActiveTab] = useState<"react" | "vanilla">("react");
  const [copied, setCopied]       = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  const set = <K extends keyof BannerConfig>(key: K, val: BannerConfig[K]) =>
    setConfig((c) => ({ ...c, [key]: val }));

  const toggleTracker = (t: TrackerKey) =>
    set("trackers", config.trackers.includes(t)
      ? config.trackers.filter((x) => x !== t)
      : [...config.trackers, t]);

  const code = activeTab === "react"
    ? generateReactCode(config)
    : generateVanillaCode(config);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#040c1c", fontFamily: "'DM Sans', sans-serif", color: "#e2eaf3" }}>

      {/* Header */}
      <header style={{
        borderBottom: "1px solid rgba(0,230,118,0.15)",
        padding: "0.875rem 2rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(4,12,28,0.9)", backdropFilter: "blur(12px)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "0.4rem", textDecoration: "none" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 19l-7-7 7-7" stroke="#00e676" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ color: "#9ab0c8", fontSize: "0.82rem" }}>Dashboard</span>
        </Link>
        <span style={{ fontWeight: 700 }}>
          <span style={{ color: "#22c55e" }}>Data</span>
          <span style={{ color: "#e2eaf3" }}>quard</span>
          <span style={{ color: "#9ab0c8", fontWeight: 400, fontSize: "0.85rem", marginLeft: "0.5rem" }}>
            Cookie-Banner Generator
          </span>
        </span>
        <Link href="/cookie-banner-generator?upgrade=professional" style={{
          fontSize: "0.75rem", color: "#a78bfa",
          border: "1px solid rgba(124,58,237,0.3)",
          padding: "0.3rem 0.75rem", borderRadius: "12px",
          textDecoration: "none", background: "rgba(124,58,237,0.08)",
        }}>
          ↑ Upgrade auf Professional
        </Link>
      </header>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem", display: "grid", gridTemplateColumns: "320px 1fr", gap: "2rem", alignItems: "start" }}>

        {/* Config Panel */}
        <aside style={{ display: "flex", flexDirection: "column", gap: "1rem", position: "sticky", top: "72px" }}>

          <SectionCard title="Website" icon="🌐">
            <Field label="Domain">
              <input value={config.domain} onChange={(e) => set("domain", e.target.value)} style={inputStyle} placeholder="example.ch" />
            </Field>
            <Field label="Firmenname">
              <input value={config.companyName} onChange={(e) => set("companyName", e.target.value)} style={inputStyle} placeholder="Muster GmbH" />
            </Field>
            <Field label="Jurisdiktion">
              <select value={config.jurisdiction} onChange={(e) => set("jurisdiction", e.target.value as BannerConfig["jurisdiction"])} style={inputStyle}>
                <option value="nDSG">🟢 nDSG (Schweiz)</option>
                <option value="DSGVO">🟡 DSGVO (EU/DE)</option>
                <option value="beides">🔴 nDSG + DSGVO</option>
              </select>
            </Field>
            <Field label="Sprache">
              <select value={config.language} onChange={(e) => set("language", e.target.value as BannerConfig["language"])} style={inputStyle}>
                <option value="de">Deutsch</option>
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </Field>
          </SectionCard>

          <SectionCard title="Tracker" icon="🔍">
            <p style={{ color: "#6b8499", fontSize: "0.75rem", margin: "0 0 0.5rem" }}>
              {rawTrackers.length > 0 ? "Vom Scanner erkannt:" : "Manuell wählen:"}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              {ALL_TRACKERS.map((t) => {
                const meta = TRACKER_META[t];
                const active = config.trackers.includes(t);
                return (
                  <label key={t} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                    <input type="checkbox" checked={active} onChange={() => toggleTracker(t)} style={{ accentColor: "#00e676" }} />
                    <span style={{ fontSize: "0.8rem", color: active ? "#e2eaf3" : "#6b8499" }}>{meta.label}</span>
                    <span style={{
                      marginLeft: "auto", fontSize: "0.63rem", padding: "1px 5px", borderRadius: "3px",
                      background: meta.category === "essential_external" ? "rgba(77,159,255,0.12)" : meta.category === "analytics" ? "rgba(255,183,77,0.12)" : "rgba(229,57,53,0.12)",
                      color: meta.category === "essential_external" ? "#4d9fff" : meta.category === "analytics" ? "#ffb74d" : "#ef5350",
                    }}>
                      {meta.category === "essential_external" ? "Essenziell" : meta.category === "analytics" ? "Analyse" : "Marketing"}
                    </span>
                  </label>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard title="Design" icon="🎨">
            <Field label="Farbe">
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input type="color" value={config.primaryColor} onChange={(e) => set("primaryColor", e.target.value)}
                  style={{ width: "36px", height: "32px", border: "none", background: "none", cursor: "pointer", padding: 0 }} />
                <input value={config.primaryColor} onChange={(e) => set("primaryColor", e.target.value)} style={{ ...inputStyle, flex: 1 }} />
              </div>
            </Field>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
              <input type="checkbox" checked={config.showCategories} onChange={(e) => set("showCategories", e.target.checked)} style={{ accentColor: "#00e676" }} />
              <span style={{ fontSize: "0.8rem", color: "#9ab0c8" }}>Kategorien anzeigen</span>
            </label>
          </SectionCard>

          <SectionCard title="Links" icon="🔗">
            <Field label="Datenschutz-URL">
              <input value={config.privacyUrl} onChange={(e) => set("privacyUrl", e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Impressum-URL">
              <input value={config.imprintUrl} onChange={(e) => set("imprintUrl", e.target.value)} style={inputStyle} />
            </Field>
          </SectionCard>
        </aside>

        {/* Output Panel */}
        <main style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* Compliance badge */}
          <div style={{
            background: "rgba(0,230,118,0.05)", border: "1px solid rgba(0,230,118,0.18)",
            borderRadius: "8px", padding: "0.7rem 1rem",
            display: "flex", alignItems: "center", gap: "0.75rem",
          }}>
            <span style={{ fontSize: "0.85rem", color: "#9ab0c8" }}>
              ✅ Konform mit <strong style={{ color: "#e2eaf3" }}>{JURISDICTION_LABELS[config.jurisdiction]}</strong>
              {config.trackers.length > 0 && (
                <> · <strong style={{ color: "#e2eaf3" }}>{config.trackers.length} Tracker</strong> erkannt</>
              )}
            </span>
          </div>

          {/* Preview */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#6b8499" }}>Vorschau</span>
              <button onClick={() => setShowPreview((v) => !v)} style={{ background: "none", border: "none", color: "#00e676", fontSize: "0.78rem", cursor: "pointer" }}>
                {showPreview ? "Ausblenden" : "Einblenden"}
              </button>
            </div>
            {showPreview && (
              <BannerPreview config={config} showDetails={showDetails} setShowDetails={setShowDetails} />
            )}
          </div>

          {/* Code */}
          <div style={{ background: "#07111e", border: "1px solid rgba(154,176,200,0.1)", borderRadius: "10px", overflow: "hidden" }}>
            <div style={{ display: "flex", borderBottom: "1px solid rgba(154,176,200,0.1)" }}>
              {(["react", "vanilla"] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  padding: "0.7rem 1.1rem", background: activeTab === tab ? "rgba(0,230,118,0.07)" : "none",
                  border: "none", borderBottom: activeTab === tab ? `2px solid ${config.primaryColor}` : "2px solid transparent",
                  color: activeTab === tab ? "#e2eaf3" : "#6b8499", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                }}>
                  {tab === "react" ? "React / Next.js" : "Vanilla JS"}
                </button>
              ))}
              <button onClick={handleCopy} style={{
                marginLeft: "auto", padding: "0.7rem 1.1rem", background: "none", border: "none",
                color: copied ? "#00e676" : "#9ab0c8", fontSize: "0.8rem", cursor: "pointer",
              }}>
                {copied ? "✓ Kopiert" : "📋 Kopieren"}
              </button>
            </div>
            <pre style={{ margin: 0, padding: "1.1rem", overflowX: "auto", fontSize: "0.75rem", lineHeight: 1.65, color: "#9ab0c8", maxHeight: "380px", overflowY: "auto" }}>
              <code>{code}</code>
            </pre>
          </div>
        </main>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        select option { background: #07111e; }
        input::placeholder { color: #4b6278; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-thumb { background: rgba(154,176,200,0.15); border-radius: 3px; }
      `}</style>
    </div>
  );
}

// ─── Banner Preview ───────────────────────────────────────────────────────────
function BannerPreview({ config, showDetails, setShowDetails }: {
  config: BannerConfig;
  showDetails: boolean;
  setShowDetails: (v: boolean) => void;
}) {
  const c = config.primaryColor;
  const analyticsTrackers = config.trackers.filter(t => TRACKER_META[t]?.category === "analytics").map(t => TRACKER_META[t].label);
  const marketingTrackers = config.trackers.filter(t => TRACKER_META[t]?.category === "marketing").map(t => TRACKER_META[t].label);

  return (
    <div style={{ background: "#0a0f1e", borderRadius: "10px", border: "1px solid rgba(154,176,200,0.1)", overflow: "hidden" }}>
      {/* Fake page */}
      <div style={{ padding: "1.25rem", opacity: 0.15 }}>
        {[90, 75, 85, 60].map((w, i) => (
          <div key={i} style={{ background: "rgba(154,176,200,0.2)", height: "9px", borderRadius: "4px", marginBottom: "8px", width: `${w}%` }} />
        ))}
      </div>
      {/* Banner */}
      <div style={{ background: "linear-gradient(135deg,#0b1829,#0d1f35)", borderTop: `1px solid ${c}33`, padding: "1rem 1.25rem" }}>
        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 200px" }}>
            <p style={{ color: "#9ab0c8", fontSize: "0.75rem", margin: "0 0 0.3rem", lineHeight: 1.55 }}>
              Wir verwenden Cookies auf <strong style={{ color: "#e2eaf3" }}>{config.domain || "ihrer-website.ch"}</strong>.{" "}
              <a href="#" style={{ color: c }}>Datenschutz</a> · <a href="#" style={{ color: c }}>Impressum</a>
            </p>
            {config.showCategories && (
              <button onClick={() => setShowDetails(!showDetails)} style={{ background: "none", border: "none", color: c, fontSize: "0.7rem", cursor: "pointer", padding: 0 }}>
                {showDetails ? "▲" : "▼"} Details
              </button>
            )}
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
            <button style={{ padding: "0.4rem 0.8rem", borderRadius: "5px", border: "1px solid rgba(154,176,200,0.3)", background: "transparent", color: "#9ab0c8", fontSize: "0.72rem", cursor: "pointer" }}>
              Nur Essenzielle
            </button>
            <button style={{ padding: "0.4rem 0.8rem", borderRadius: "5px", border: "none", background: `linear-gradient(135deg,${c},${c}cc)`, color: "#040c1c", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}>
              Alle akzeptieren
            </button>
          </div>
        </div>
        {showDetails && config.showCategories && (
          <div style={{ marginTop: "0.75rem", borderTop: "1px solid rgba(154,176,200,0.1)", paddingTop: "0.75rem", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: "0.5rem" }}>
            {[
              { label: "Essenziell", items: ["Session", "Sicherheit"], locked: true },
              ...(analyticsTrackers.length > 0 ? [{ label: "Analyse", items: analyticsTrackers, locked: false }] : []),
              ...(marketingTrackers.length > 0 ? [{ label: "Marketing", items: marketingTrackers, locked: false }] : []),
            ].map((cat) => (
              <div key={cat.label} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(154,176,200,0.08)", borderRadius: "6px", padding: "0.5rem 0.6rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.2rem" }}>
                  <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "#e2eaf3" }}>{cat.label}</span>
                  <span style={{ fontSize: "0.6rem", color: cat.locked ? c : "#9ab0c8" }}>{cat.locked ? "Immer" : "Optional"}</span>
                </div>
                <span style={{ fontSize: "0.65rem", color: "#6b8499" }}>{cat.items.slice(0, 2).join(", ")}{cat.items.length > 2 ? ` +${cat.items.length - 2}` : ""}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────
function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#07111e", border: "1px solid rgba(154,176,200,0.1)", borderRadius: "10px", overflow: "hidden" }}>
      <div style={{ padding: "0.65rem 1rem", borderBottom: "1px solid rgba(154,176,200,0.07)", display: "flex", gap: "0.4rem", alignItems: "center" }}>
        <span>{icon}</span>
        <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6b8499" }}>{title}</span>
      </div>
      <div style={{ padding: "0.875rem 1rem", display: "flex", flexDirection: "column", gap: "0.55rem" }}>{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.72rem", color: "#6b8499", marginBottom: "0.25rem", fontWeight: 500 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(154,176,200,0.18)",
  borderRadius: "6px",
  padding: "0.45rem 0.65rem",
  color: "#e2eaf3",
  fontSize: "0.82rem",
  outline: "none",
};
