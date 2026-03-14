"use client";

// GeneratorPro.tsx
// Professional-Plan: Multi-Domain Manager (bis 5 Domains)

import { useState } from "react";
import Link from "next/link";
import {
  DomainBanner,
  TrackerKey,
  TRACKER_META,
  ALL_TRACKERS,
  JURISDICTION_LABELS,
  MAX_DOMAINS,
  generateReactCode,
  generateVanillaCode,
} from "./types";

const MOCK_DOMAINS: DomainBanner[] = [
  {
    id: "1",
    domain: "muster-gmbh.ch",
    companyName: "Muster GmbH",
    jurisdiction: "nDSG",
    trackers: ["google_analytics", "stripe"],
    language: "de",
    primaryColor: "#00e676",
    position: "bottom",
    showCategories: true,
    privacyUrl: "https://muster-gmbh.ch/datenschutz",
    imprintUrl: "https://muster-gmbh.ch/impressum",
    createdAt: "2026-01-15",
    status: "active",
  },
];

export default function GeneratorPro() {
  const [domains, setDomains]               = useState<DomainBanner[]>(MOCK_DOMAINS);
  const [activeDomainId, setActiveDomainId] = useState<string | null>(MOCK_DOMAINS[0]?.id ?? null);
  const [showAddForm, setShowAddForm]       = useState(false);
  const [activeTab, setActiveTab]           = useState<"react" | "vanilla">("react");
  const [copied, setCopied]                 = useState(false);
  const [deleteConfirm, setDeleteConfirm]   = useState<string | null>(null);

  const activeDomain = domains.find((d) => d.id === activeDomainId) ?? null;

  const update = <K extends keyof DomainBanner>(id: string, key: K, val: DomainBanner[K]) =>
    setDomains((ds) => ds.map((d) => (d.id === id ? { ...d, [key]: val } : d)));

  const toggleTracker = (id: string, t: TrackerKey) => {
    const d = domains.find((x) => x.id === id);
    if (!d) return;
    update(id, "trackers", d.trackers.includes(t) ? d.trackers.filter((x) => x !== t) : [...d.trackers, t]);
  };

  const addDomain = (data: Omit<DomainBanner, "id" | "createdAt" | "status">) => {
    const newD: DomainBanner = {
      ...data,
      id: Math.random().toString(36).slice(2),
      createdAt: new Date().toISOString().slice(0, 10),
      status: "draft",
    };
    setDomains((ds) => [...ds, newD]);
    setActiveDomainId(newD.id);
    setShowAddForm(false);
  };

  const deleteDomain = (id: string) => {
    setDomains((ds) => ds.filter((d) => d.id !== id));
    setActiveDomainId(domains.find((d) => d.id !== id)?.id ?? null);
    setDeleteConfirm(null);
  };

  const handleCopy = () => {
    if (!activeDomain) return;
    navigator.clipboard.writeText(
      activeTab === "react" ? generateReactCode(activeDomain) : generateVanillaCode(activeDomain)
    );
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
        position: "sticky", top: 0, zIndex: 200,
      }}>
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "0.4rem", textDecoration: "none" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 19l-7-7 7-7" stroke="#00e676" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ color: "#9ab0c8", fontSize: "0.82rem" }}>Dashboard</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <span style={{ fontWeight: 700 }}>
            <span style={{ color: "#22c55e" }}>Data</span>
            <span style={{ color: "#e2eaf3" }}>quard</span>
            <span style={{ color: "#9ab0c8", fontWeight: 400, fontSize: "0.85rem", marginLeft: "0.5rem" }}>Cookie-Banner</span>
          </span>
          <span style={{
            background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.35)",
            color: "#a78bfa", fontSize: "0.63rem", fontWeight: 700,
            letterSpacing: "0.08em", padding: "2px 8px", borderRadius: "12px", textTransform: "uppercase",
          }}>
            Professional
          </span>
        </div>
        <span style={{ fontSize: "0.78rem", color: "#6b8499" }}>{domains.length}/{MAX_DOMAINS} Domains</span>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", minHeight: "calc(100vh - 57px)" }}>

        {/* Sidebar */}
        <aside style={{ borderRight: "1px solid rgba(154,176,200,0.1)", background: "#06101e", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "1rem", flex: 1 }}>
            <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#4b6278", marginBottom: "0.75rem" }}>
              Meine Domains
            </div>

            {domains.map((d) => (
              <div key={d.id} onClick={() => { setActiveDomainId(d.id); setShowAddForm(false); }} style={{
                padding: "0.6rem 0.75rem", borderRadius: "7px", marginBottom: "0.2rem", cursor: "pointer",
                background: activeDomainId === d.id ? "rgba(0,230,118,0.07)" : "transparent",
                border: `1px solid ${activeDomainId === d.id ? "rgba(0,230,118,0.2)" : "transparent"}`,
                transition: "all 0.15s",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.15rem" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 600, color: activeDomainId === d.id ? "#e2eaf3" : "#9ab0c8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "140px" }}>
                    {d.domain || "Neue Domain"}
                  </span>
                  <span style={{ fontSize: "0.6rem", padding: "1px 5px", borderRadius: "4px", flexShrink: 0,
                    background: d.status === "active" ? "rgba(0,230,118,0.12)" : "rgba(154,176,200,0.08)",
                    color: d.status === "active" ? "#00e676" : "#6b8499", fontWeight: 600,
                  }}>
                    {d.status === "active" ? "Aktiv" : "Entwurf"}
                  </span>
                </div>
                <span style={{ fontSize: "0.68rem", color: "#4b6278" }}>
                  {JURISDICTION_LABELS[d.jurisdiction]} · {d.trackers.length} Tracker
                </span>
              </div>
            ))}

            {domains.length < MAX_DOMAINS ? (
              <button onClick={() => { setShowAddForm(true); setActiveDomainId(null); }} style={{
                width: "100%", marginTop: "0.5rem", padding: "0.55rem",
                borderRadius: "7px", border: "1px dashed rgba(0,230,118,0.2)",
                background: showAddForm ? "rgba(0,230,118,0.05)" : "transparent",
                color: "#00e676", fontSize: "0.78rem", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem",
              }}>
                + Domain hinzufügen
              </button>
            ) : (
              <div style={{ padding: "0.5rem", fontSize: "0.72rem", color: "#4b6278", textAlign: "center", marginTop: "0.5rem" }}>
                Maximum ({MAX_DOMAINS}) erreicht
              </div>
            )}
          </div>

          {/* Usage bar */}
          <div style={{ padding: "0.875rem 1rem", borderTop: "1px solid rgba(154,176,200,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
              <span style={{ fontSize: "0.7rem", color: "#4b6278" }}>Domains</span>
              <span style={{ fontSize: "0.7rem", color: "#9ab0c8" }}>{domains.length}/{MAX_DOMAINS}</span>
            </div>
            <div style={{ height: "3px", background: "rgba(154,176,200,0.1)", borderRadius: "2px", overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${(domains.length / MAX_DOMAINS) * 100}%`,
                background: domains.length >= MAX_DOMAINS ? "linear-gradient(90deg,#ff6b6b,#ee5a24)" : "linear-gradient(90deg,#00e676,#00c853)",
                transition: "width 0.3s",
              }} />
            </div>
          </div>
        </aside>

        {/* Main */}
        <main style={{ overflow: "auto" }}>
          {showAddForm ? (
            <AddForm onAdd={addDomain} onCancel={() => setShowAddForm(false)} />
          ) : activeDomain ? (
            <DomainEditor
              domain={activeDomain}
              update={update}
              toggleTracker={toggleTracker}
              deleteDomain={deleteDomain}
              deleteConfirm={deleteConfirm}
              setDeleteConfirm={setDeleteConfirm}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              copied={copied}
              handleCopy={handleCopy}
            />
          ) : (
            <EmptyState onAdd={() => setShowAddForm(true)} />
          )}
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

// ─── Domain Editor ────────────────────────────────────────────────────────────
function DomainEditor({ domain, update, toggleTracker, deleteDomain, deleteConfirm, setDeleteConfirm, activeTab, setActiveTab, copied, handleCopy }: any) {
  const code = activeTab === "react" ? generateReactCode(domain) : generateVanillaCode(domain);

  return (
    <div style={{ padding: "1.5rem 2rem", display: "flex", flexDirection: "column", gap: "1.25rem", maxWidth: "860px" }}>

      {/* Title row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ margin: "0 0 0.2rem", fontSize: "1.05rem", fontWeight: 700 }}>{domain.domain || "Domain"}</h2>
          <span style={{ fontSize: "0.75rem", color: "#6b8499" }}>
            Erstellt {domain.createdAt} · {JURISDICTION_LABELS[domain.jurisdiction as import("./types").Jurisdiction]} · {domain.trackers.length} Tracker
          </span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={() => update(domain.id, "status", domain.status === "active" ? "draft" : "active")} style={{
            padding: "0.4rem 0.85rem", borderRadius: "6px",
            border: `1px solid ${domain.status === "active" ? "rgba(0,230,118,0.3)" : "rgba(154,176,200,0.2)"}`,
            background: domain.status === "active" ? "rgba(0,230,118,0.07)" : "transparent",
            color: domain.status === "active" ? "#00e676" : "#9ab0c8",
            fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
          }}>
            {domain.status === "active" ? "✓ Aktiv" : "Aktivieren"}
          </button>
          <button onClick={() => setDeleteConfirm(domain.id)} style={{ padding: "0.4rem 0.75rem", borderRadius: "6px", border: "1px solid rgba(229,57,53,0.2)", background: "transparent", color: "#ef5350", fontSize: "0.78rem", cursor: "pointer" }}>
            Löschen
          </button>
        </div>
      </div>

      {deleteConfirm === domain.id && (
        <div style={{ background: "rgba(229,57,53,0.07)", border: "1px solid rgba(229,57,53,0.2)", borderRadius: "8px", padding: "0.875rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.85rem", color: "#ef9a9a" }}>
            <strong style={{ color: "#ef5350" }}>{domain.domain}</strong> wirklich löschen?
          </span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={() => setDeleteConfirm(null)} style={{ padding: "0.35rem 0.75rem", borderRadius: "5px", border: "1px solid rgba(154,176,200,0.2)", background: "transparent", color: "#9ab0c8", fontSize: "0.78rem", cursor: "pointer" }}>Abbrechen</button>
            <button onClick={() => deleteDomain(domain.id)} style={{ padding: "0.35rem 0.75rem", borderRadius: "5px", border: "none", background: "#ef5350", color: "#fff", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}>Löschen</button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <Card title="Website" icon="🌐">
          <Field label="Domain"><input value={domain.domain} onChange={(e) => update(domain.id, "domain", e.target.value)} style={inputStyle} /></Field>
          <Field label="Firmenname"><input value={domain.companyName} onChange={(e) => update(domain.id, "companyName", e.target.value)} style={inputStyle} placeholder="Muster GmbH" /></Field>
          <Field label="Jurisdiktion">
            <select value={domain.jurisdiction} onChange={(e) => update(domain.id, "jurisdiction", e.target.value)} style={inputStyle}>
              <option value="nDSG">🟢 nDSG</option>
              <option value="DSGVO">🟡 DSGVO</option>
              <option value="beides">🔴 Beides</option>
            </select>
          </Field>
          <Field label="Sprache">
            <select value={domain.language} onChange={(e) => update(domain.id, "language", e.target.value)} style={inputStyle}>
              <option value="de">Deutsch</option>
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </Field>
        </Card>

        <Card title="Design & Links" icon="🎨">
          <Field label="Farbe">
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input type="color" value={domain.primaryColor} onChange={(e) => update(domain.id, "primaryColor", e.target.value)} style={{ width: "36px", height: "32px", border: "none", background: "none", cursor: "pointer", padding: 0 }} />
              <input value={domain.primaryColor} onChange={(e) => update(domain.id, "primaryColor", e.target.value)} style={{ ...inputStyle, flex: 1 }} />
            </div>
          </Field>
          <Field label="Datenschutz-URL"><input value={domain.privacyUrl} onChange={(e) => update(domain.id, "privacyUrl", e.target.value)} style={inputStyle} /></Field>
          <Field label="Impressum-URL"><input value={domain.imprintUrl} onChange={(e) => update(domain.id, "imprintUrl", e.target.value)} style={inputStyle} /></Field>
        </Card>
      </div>

      <Card title="Tracker" icon="🔍">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: "0.35rem" }}>
          {ALL_TRACKERS.map((t) => {
            const meta = TRACKER_META[t];
            const active = domain.trackers.includes(t);
            return (
              <label key={t} style={{ display: "flex", alignItems: "center", gap: "0.45rem", cursor: "pointer", padding: "0.4rem 0.6rem", borderRadius: "6px", background: active ? "rgba(0,230,118,0.04)" : "transparent", border: `1px solid ${active ? "rgba(0,230,118,0.15)" : "rgba(154,176,200,0.07)"}`, transition: "all 0.15s" }}>
                <input type="checkbox" checked={active} onChange={() => toggleTracker(domain.id, t)} style={{ accentColor: "#00e676", flexShrink: 0 }} />
                <span style={{ fontSize: "0.78rem", color: active ? "#e2eaf3" : "#6b8499", flex: 1 }}>{meta.label}</span>
                <span style={{ fontSize: "0.6rem", padding: "1px 4px", borderRadius: "3px", flexShrink: 0,
                  background: meta.category === "essential_external" ? "rgba(77,159,255,0.1)" : meta.category === "analytics" ? "rgba(255,183,77,0.1)" : "rgba(229,57,53,0.1)",
                  color: meta.category === "essential_external" ? "#4d9fff" : meta.category === "analytics" ? "#ffb74d" : "#ef5350",
                }}>
                  {meta.category === "essential_external" ? "Ess." : meta.category === "analytics" ? "Anal." : "Mktg."}
                </span>
              </label>
            );
          })}
        </div>
      </Card>

      {/* Code */}
      <div style={{ background: "#07111e", border: "1px solid rgba(154,176,200,0.1)", borderRadius: "10px", overflow: "hidden" }}>
        <div style={{ display: "flex", borderBottom: "1px solid rgba(154,176,200,0.08)" }}>
          {(["react", "vanilla"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "0.65rem 1rem", background: activeTab === tab ? "rgba(0,230,118,0.06)" : "none",
              border: "none", borderBottom: activeTab === tab ? `2px solid ${domain.primaryColor}` : "2px solid transparent",
              color: activeTab === tab ? "#e2eaf3" : "#6b8499", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
            }}>
              {tab === "react" ? "React / Next.js" : "Vanilla JS"}
            </button>
          ))}
          <button onClick={handleCopy} style={{ marginLeft: "auto", padding: "0.65rem 1rem", background: "none", border: "none", color: copied ? "#00e676" : "#9ab0c8", fontSize: "0.78rem", cursor: "pointer" }}>
            {copied ? "✓ Kopiert" : "📋 Kopieren"}
          </button>
        </div>
        <pre style={{ margin: 0, padding: "1rem", overflowX: "auto", fontSize: "0.73rem", lineHeight: 1.65, color: "#9ab0c8", maxHeight: "320px", overflowY: "auto" }}>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

// ─── Add Form ─────────────────────────────────────────────────────────────────
function AddForm({ onAdd, onCancel }: { onAdd: (d: any) => void; onCancel: () => void }) {
  const [domain, setDomain]           = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jurisdiction, setJurisdiction] = useState<"nDSG" | "DSGVO" | "beides">("nDSG");
  const [language, setLanguage]       = useState<"de" | "fr" | "en">("de");
  const [primaryColor, setPrimaryColor] = useState("#00e676");

  const handleAdd = () => {
    if (!domain) return;
    onAdd({
      domain, companyName, jurisdiction, language, primaryColor,
      trackers: [], position: "bottom", showCategories: true,
      privacyUrl: `https://${domain}/datenschutz`,
      imprintUrl: `https://${domain}/impressum`,
    });
  };

  return (
    <div style={{ padding: "1.5rem 2rem", maxWidth: "520px" }}>
      <h2 style={{ margin: "0 0 1.25rem", fontSize: "1rem", fontWeight: 700 }}>Neue Domain</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
        <Field label="Domain *"><input value={domain} onChange={(e) => setDomain(e.target.value)} style={inputStyle} placeholder="example.ch" autoFocus /></Field>
        <Field label="Firmenname"><input value={companyName} onChange={(e) => setCompanyName(e.target.value)} style={inputStyle} placeholder="Muster GmbH" /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <Field label="Jurisdiktion">
            <select value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value as any)} style={inputStyle}>
              <option value="nDSG">🟢 nDSG</option>
              <option value="DSGVO">🟡 DSGVO</option>
              <option value="beides">🔴 Beides</option>
            </select>
          </Field>
          <Field label="Sprache">
            <select value={language} onChange={(e) => setLanguage(e.target.value as any)} style={inputStyle}>
              <option value="de">Deutsch</option>
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </Field>
        </div>
        <Field label="Farbe">
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} style={{ width: "36px", height: "32px", border: "none", background: "none", cursor: "pointer", padding: 0 }} />
            <input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
          </div>
        </Field>
      </div>
      <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
        <button onClick={onCancel} style={{ padding: "0.55rem 1.1rem", borderRadius: "6px", border: "1px solid rgba(154,176,200,0.2)", background: "transparent", color: "#9ab0c8", fontSize: "0.85rem", cursor: "pointer" }}>Abbrechen</button>
        <button onClick={handleAdd} disabled={!domain} style={{
          padding: "0.55rem 1.4rem", borderRadius: "6px", border: "none",
          background: domain ? "linear-gradient(135deg,#00e676,#00c853)" : "rgba(154,176,200,0.1)",
          color: domain ? "#040c1c" : "#4b6278", fontSize: "0.85rem", fontWeight: 700,
          cursor: domain ? "pointer" : "not-allowed",
        }}>
          Domain erstellen
        </button>
      </div>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "3rem", textAlign: "center" }}>
      <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🌐</div>
      <h3 style={{ color: "#e2eaf3", margin: "0 0 0.5rem" }}>Erste Domain hinzufügen</h3>
      <p style={{ color: "#6b8499", fontSize: "0.85rem", maxWidth: "280px", lineHeight: 1.6, marginBottom: "1.25rem" }}>
        Verwalte Cookie-Banner für bis zu {MAX_DOMAINS} Domains.
      </p>
      <button onClick={onAdd} style={{ padding: "0.65rem 1.5rem", borderRadius: "7px", border: "none", background: "linear-gradient(135deg,#00e676,#00c853)", color: "#040c1c", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer" }}>
        Domain hinzufügen
      </button>
    </div>
  );
}

function Card({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#07111e", border: "1px solid rgba(154,176,200,0.1)", borderRadius: "10px", overflow: "hidden" }}>
      <div style={{ padding: "0.6rem 1rem", borderBottom: "1px solid rgba(154,176,200,0.07)", display: "flex", gap: "0.4rem", alignItems: "center" }}>
        <span>{icon}</span>
        <span style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6b8499" }}>{title}</span>
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
  width: "100%", background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(154,176,200,0.18)", borderRadius: "6px",
  padding: "0.45rem 0.65rem", color: "#e2eaf3", fontSize: "0.82rem", outline: "none",
};
