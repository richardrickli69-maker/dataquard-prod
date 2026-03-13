import { auditImageUrl, type AiAuditResult } from './VisualAiService';

export interface ScanAiAudit {
  aiContentFound: boolean;
  imagesAudited: number;
  lowestRealityScore: number;
  highestDeepfakeRisk: AiAuditResult['deepfakeRisk'];
  requiresAiClause: boolean;
  imageResults: Array<{ url: string; audit: AiAuditResult }>;
}

export async function runAiAuditOnImages(imageUrls: string[]): Promise<ScanAiAudit> {
  const MAX_IMAGES = 10;
  const urlsToCheck = imageUrls.slice(0, MAX_IMAGES);
  const imageResults: ScanAiAudit['imageResults'] = [];
  const chunkSize = 3;
  for (let i = 0; i < urlsToCheck.length; i += chunkSize) {
    const chunk = urlsToCheck.slice(i, i + chunkSize);
    const settled = await Promise.allSettled(
      chunk.map(async (url) => ({ url, audit: await auditImageUrl(url) }))
    );
    for (const r of settled) {
      if (r.status === 'fulfilled') imageResults.push(r.value);
    }
  }
  const aiContentFound = imageResults.some((r) => r.audit.aiContentDetected);
  const lowestRealityScore = imageResults.length
    ? Math.min(...imageResults.map((r) => r.audit.realityScore))
    : 100;
  const riskOrder: AiAuditResult['deepfakeRisk'][] = ['none', 'low', 'medium', 'high'];
  const highestDeepfakeRisk = imageResults.reduce<AiAuditResult['deepfakeRisk']>(
    (worst, r) =>
      riskOrder.indexOf(r.audit.deepfakeRisk) > riskOrder.indexOf(worst)
        ? r.audit.deepfakeRisk
        : worst,
    'none'
  );
  return {
    aiContentFound,
    imagesAudited: imageResults.length,
    lowestRealityScore,
    highestDeepfakeRisk,
    requiresAiClause: aiContentFound,
    imageResults,
  };
}
