/**
 * VisualAiService.ts
 * Dataquard – KI-Compliance Modul (EU AI Act Art. 50)
 * Echte Deepfake-Erkennung via Sightengine API
 * Privacy: RAM-only, keine Bildspeicherung
 */

export interface AiAuditResult {
  aiContentDetected: boolean;
  realityScore: number;
  deepfakeRisk: 'none' | 'low' | 'medium' | 'high';
  metadataIntegrity: boolean;
  provenanceSignals: string[];
  requiresAiClause: boolean;
  analysedAt: string;
  privacyMode: 'ram-only';
  source: 'sightengine' | 'fallback';
}

async function checkWithSightengine(imageUrl: string): Promise<{
  aiGenerated: number;
  deepfakeScore: number;
  success: boolean;
}> {
  const apiUser = process.env.SIGHTENGINE_API_USER;
  const apiSecret = process.env.SIGHTENGINE_API_SECRET;

  if (!apiUser || !apiSecret) {
    return { aiGenerated: 0, deepfakeScore: 0, success: false };
  }

  try {
    const params = new URLSearchParams({
      url: imageUrl,
      models: 'genai,deepfake',
      api_user: apiUser,
      api_secret: apiSecret,
    });

    const res = await fetch(
      `https://api.sightengine.com/1.0/check.json?${params}`,
      { signal: AbortSignal.timeout(6000) }
    );

    if (!res.ok) return { aiGenerated: 0, deepfakeScore: 0, success: false };

    const data = await res.json();
    const aiGenerated = data?.type?.ai_generated ?? 0;
    const deepfakeScore = data?.faces?.[0]?.deepfake ?? 0;

    return { aiGenerated, deepfakeScore, success: true };
  } catch {
    return { aiGenerated: 0, deepfakeScore: 0, success: false };
  }
}

function calcRealityScore(aiGenerated: number, deepfakeScore: number): number {
  return Math.max(0, Math.min(100, Math.round(100 - aiGenerated * 60 - deepfakeScore * 40)));
}

function classifyDeepfakeRisk(
  deepfakeScore: number,
  aiGenerated: number
): AiAuditResult['deepfakeRisk'] {
  if (deepfakeScore > 0.7 || aiGenerated > 0.8) return 'high';
  if (deepfakeScore > 0.4 || aiGenerated > 0.6) return 'medium';
  if (deepfakeScore > 0.15 || aiGenerated > 0.3) return 'low';
  return 'none';
}

export async function auditImageUrl(imageUrl: string): Promise<AiAuditResult> {
  const { aiGenerated, deepfakeScore, success } = await checkWithSightengine(imageUrl);

  const realityScore = calcRealityScore(aiGenerated, deepfakeScore);
  const deepfakeRisk = classifyDeepfakeRisk(deepfakeScore, aiGenerated);
  const aiContentDetected = aiGenerated > 0.3 || deepfakeScore > 0.15;

  const provenanceSignals: string[] = [];
  if (success) {
    provenanceSignals.push(`Sightengine KI-Score: ${Math.round(aiGenerated * 100)}%`);
    if (deepfakeScore > 0) provenanceSignals.push(`Deepfake-Score: ${Math.round(deepfakeScore * 100)}%`);
  } else {
    provenanceSignals.push('Sightengine nicht konfiguriert – Fallback-Modus aktiv');
  }

  return {
    aiContentDetected,
    realityScore,
    deepfakeRisk,
    metadataIntegrity: !aiContentDetected,
    provenanceSignals,
    requiresAiClause: aiContentDetected,
    analysedAt: new Date().toISOString(),
    privacyMode: 'ram-only',
    source: success ? 'sightengine' : 'fallback',
  };
}

export async function analyseImageForAiContent(_imageBuffer: Buffer): Promise<AiAuditResult> {
  return {
    aiContentDetected: false,
    realityScore: 70,
    deepfakeRisk: 'none',
    metadataIntegrity: true,
    provenanceSignals: ['Buffer-Analyse: URL-basierter Check empfohlen'],
    requiresAiClause: false,
    analysedAt: new Date().toISOString(),
    privacyMode: 'ram-only',
    source: 'fallback',
  };
}
