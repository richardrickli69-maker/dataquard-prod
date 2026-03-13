// src/app/cookie-banner-generator/UpsellGate.task.tsx
// ÄNDERUNG: Dunkles #040c1c Theme → Light Theme (#f8f9fb)
import Link from "next/link";

export default function UpsellGate() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#f8f9fb",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      padding: "24px",
    }}>
      <div style={{
        background: "#ffffff",
        border: "1px solid #e2e4ea",
        borderRadius: 18,
        padding: "40px 32px",
        textAlign: "center",
        maxWidth: 460,
        width: "100%",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🔒</div>
        <h2 style={{ color: "#1a1a2e", marginBottom: "0.75rem", fontSize: 22, fontWeight: 800 }}>
          Starter-Plan erforderlich
        </h2>
        <p style={{ color: "#555566", fontSize: 14, lineHeight: 1.65, marginBottom: "0.5rem" }}>
          Der Cookie-Banner Generator ist ab dem{" "}
          <strong style={{ color: "#1a1a2e" }}>STARTER-Plan (CHF 79 Einmalkauf)</strong>{" "}
          verfügbar.
        </p>
        <p style={{ color: "#888899", fontSize: 13, marginBottom: "1.75rem" }}>
          nDSG + DSGVO konform · React & Vanilla JS Export · Automatisch aus Scanner-Daten
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/checkout?plan=starter"
            style={{
              padding: "0.7rem 1.5rem",
              borderRadius: 8,
              background: "#22c55e",
              color: "#ffffff",
              fontSize: 14,
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(34,197,94,0.25)",
            }}
          >
            Jetzt kaufen – CHF 79 Einmalkauf
          </Link>
          <Link
            href="/checkout?plan=professional"
            style={{
              padding: "0.7rem 1.5rem",
              borderRadius: 8,
              border: "2px solid #22c55e",
              color: "#22c55e",
              fontSize: 14,
              fontWeight: 700,
              textDecoration: "none",
              background: "transparent",
            }}
          >
            Professional – CHF 149 Einmalkauf
          </Link>
        </div>
      </div>
    </div>
  );
}
