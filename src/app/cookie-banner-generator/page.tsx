// app/cookie-banner-generator/page.tsx
// Einzige Route – rendert je nach Plan die richtige Ansicht
// Plan-Check via Supabase, kein direkter Zugriff auf Pro-Features möglich

import { Suspense } from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import UpsellGate       from "./UpsellGate";
import GeneratorStarter from "./GeneratorStarter";
import GeneratorPro     from "./GeneratorPro";

// ─── Plan-Check (Server Component) ───────────────────────────────────────────
async function getUserPlan(): Promise<"free" | "starter" | "professional"> {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return "free";

  // subscription_tier aus users-Tabelle lesen
  const { data, error } = await supabase
    .from("users")
    .select("subscription_tier")
    .eq("id", user.id)
    .single();

  if (error || !data) return "free";

  const tier = data.subscription_tier as string;

  if (tier === "professional") return "professional";
  if (tier === "starter")      return "starter";
  return "free";
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function CookieBannerGeneratorPage() {
  const plan = await getUserPlan();

  return (
    <Suspense fallback={<LoadingScreen />}>
      {plan === "professional" && <GeneratorPro />}
      {plan === "starter"      && <GeneratorStarter />}
      {plan === "free"         && <UpsellGate />}
    </Suspense>
  );
}

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata = {
  title: "Cookie-Banner Generator | Dataquard",
  description:
    "Generiere einen nDSG- und DSGVO-konformen Cookie-Banner für deine Website – automatisch aus deinem Scan-Ergebnis.",
};

// ─── Loading ──────────────────────────────────────────────────────────────────
function LoadingScreen() {
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
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#9ab0c8" }}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          style={{ animation: "spin 1s linear infinite" }}
        >
          <circle cx="12" cy="12" r="10" stroke="rgba(154,176,200,0.2)" strokeWidth="2" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="#00e676" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span style={{ fontSize: "0.875rem" }}>Wird geladen…</span>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
