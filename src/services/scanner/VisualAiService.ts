/**
 * VisualAiService.ts
 * Dataquard – KI-Compliance Modul (EU AI Act Art. 50)
 * Flüchtige RAM-Verarbeitung – keine Bildspeicherung, keine Logs.
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
}

async function extractMetadata(buffer: Buffer): Promise<Record<string, string>> {
  const hexHeader = buffer.slice(0, 16).toString('hex');
  const hasMeta = hexHeader.startsWith('ffd8') || hexHeader.startsWith('89504e47');
  return hasMeta ? { source: 'unknown', software: '', c2paPresent: 'false' } : {};
}

function calcRealityScore(meta: Record<string, string>): number {
  let score = 70;
  if (meta.c2paPresent === 'true') score += 20;
  if (meta.software?.includes('Midjourney')) score -= 50;
  if (meta.software?.includes('DALL-E')) score -= 50;
  if (meta.software?.includes('Stable Diffusion')) score -= 45;
  if (meta.software?.includes('Adobe Firefly')) score -= 30;
  if (!meta.source || meta.source === 'unknown') score -= 10;
  return Math.max(0, Math.min(100, score));
}

function classifyDeepfakeRisk(
  realityScore: number,
  meta: Record<string, string>
): AiAuditResult['deepfakeRisk'] {
  const hasFaceKeyword =
    meta.description?.toLowerCase().includes('face') ||
    meta.subject?.toLowerCase().includes('person');
  if (realityScore < 20) return 'high';
  if (realityScore < 40 && hasFaceKeyword) return 'high';
  if (realityScore < 40) return 'medium';
  if (realityScore < 60) return 'low';
  return 'none';
}

function extractProvenanceSignals(meta: Record<string, string>): string[] {
  const signals: string[] = [];
  if (meta.c2paPresent === 'true') signals.push('C2PA-Manifest vorhanden');
  if (meta.software) signals.push(`Erstellt mit: ${meta.software}`);
  if (meta.creator) signals.push(`Urheber: ${meta.creator}`);
  if (meta.dateCreated) signals.push(`Erstelldatum: ${meta.dateCreated}`);
  if (signals.length === 0) signals.push('Keine Provenance-Metadaten gefunden');
  return signals;
}

export async function analyseImageForAiContent(imageBuffer: Buffer): Promise<AiAuditResult> {
  const meta = await extractMetadata(imageBuffer);
  const realityScore = calcRealityScore(meta);
  const deepfakeRisk = classifyDeepfakeRisk(realityScore, meta);
  const aiContentDetected = realityScore < 60 || deepfakeRisk !== 'none';
  return {
    aiContentDetected,
    realityScore,
    deepfakeRisk,
    metadataIntegrity: meta.c2paPresent === 'true',
    provenanceSignals: extractProvenanceSignals(meta),
    requiresAiClause: aiContentDetected,
    analysedAt: new Date().toISOString(),
    privacyMode: 'ram-only',
  };
}

export async function auditImageUrl(imageUrl: string): Promise<AiAuditResult> {
  const mockBuffer = Buffer.from('demo');
  const result = await analyseImageForAiContent(mockBuffer);
  return {
    ...result,
    provenanceSignals: [
      'URL-Scan (Demo-Modus)',
      `Geprüfte URL: ${imageUrl.slice(0, 60)}...`,
    ],
  };
}
