// UpsellGate.tsx
// Wird angezeigt wenn User FREE-Plan hat

import Link from "next/link";

export default function UpsellGate() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#040c1c",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "440px", padding: "2rem" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
        <h2 style={{ color: "#e2eaf3", marginBottom: "0.75rem" }}>
          Starter-Plan erforderlich
        </h2>
        <p
          style={{
            color: "#9ab0c8",
            fontSize: "0.875rem",
            lineHeight: 1.6,
            marginBottom: "0.5rem",
          }}
        >
          Der Cookie-Banner Generator ist ab dem{" "}
          <strong style={{ color: "#e2eaf3" }}>STARTER-Plan (CHF 79/Jahr)</strong>{" "}
          verfügbar.
        </p>
        <p
          style={{
            color: "#6b8499",
            fontSize: "0.8rem",
            marginBottom: "1.5rem",
          }}
        >
          nDSG + DSGVO konform · React & Vanilla JS Export · Automatisch aus
          Scanner-Daten
        </p>
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/checkout?plan=starter"
            style={{
              padding: "0.65rem 1.5rem",
              borderRadius: "7px",
              border: "none",
              background: "linear-gradient(135deg, #00e676, #00c853)",
              color: "#040c1c",
              fontSize: "0.875rem",
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 0 20px rgba(0,230,118,0.3)",
            }}
          >
            Starter – CHF 79/Jahr
          </Link>
          <Link
            href="/checkout?plan=professional"
            style={{
              padding: "0.65rem 1.5rem",
              borderRadius: "7px",
              border: "none",
              background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
              color: "#fff",
              fontSize: "0.875rem",
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 0 20px rgba(124,58,237,0.3)",
            }}
          >
            Professional – CHF 149/Jahr
          </Link>
        </div>
      </div>
    </div>
  );
}
