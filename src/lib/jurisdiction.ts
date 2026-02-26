/**
 * Jurisdiction Detection Logic
 * Determines if website needs nDSG or DSGVO or BOTH
 */

export interface JurisdictionResult {
  jurisdiction: 'nDSG' | 'DSGVO' | 'BOTH';
  ampel: '🟢' | '🟡' | '🔴';
  confidence: number;
  reasons: string[];
}

export async function detectJurisdiction(
  url: string,
  websiteData?: {
    domain?: string;
    country?: string;
    language?: string;
    content?: string;
    impressum?: string;
  }
): Promise<JurisdictionResult> {
  // Scoring System
  let ndsScore = 0;
  let dsgvoScore = 0;

  const domain = websiteData?.domain || extractDomain(url);
  const country = websiteData?.country || guessCountryFromDomain(domain);
  const language = websiteData?.language || 'unknown';

  // Check 1: Domain Extension
  if (domain.endsWith('.ch')) {
    ndsScore += 40;
  } else if (
    domain.endsWith('.de') ||
    domain.endsWith('.at') ||
    domain.endsWith('.eu') ||
    domain.endsWith('.fr') ||
    domain.endsWith('.it') ||
    domain.endsWith('.es') ||
    domain.endsWith('.nl') ||
    domain.endsWith('.be') ||
    domain.endsWith('.se')
  ) {
    dsgvoScore += 40;
  }

  // Check 2: Country Detection
  if (country === 'CH') {
    ndsScore += 30;
  } else if (
    [
      'DE',
      'AT',
      'FR',
      'IT',
      'ES',
      'NL',
      'BE',
      'SE',
      'DK',
      'NO',
      'FI',
      'PL',
      'CZ',
    ].includes(country)
  ) {
    dsgvoScore += 30;
  }

  // Check 3: Language Detection
  if (language.includes('de-CH') || language.includes('fr-CH')) {
    ndsScore += 15;
  } else if (
    language.includes('de') ||
    language.includes('fr') ||
    language.includes('it')
  ) {
    dsgvoScore += 15;
  }

  // Check 4: Impressum/Address Pattern
  if (websiteData?.impressum) {
    const impressum = websiteData.impressum.toLowerCase();
    if (
      impressum.includes('schweiz') ||
      impressum.includes('switzerland') ||
      impressum.match(/plz|postal code.*8\d{3}|9\d{3}/)
    ) {
      ndsScore += 10;
    }
    if (
      impressum.includes('deutschland') ||
      impressum.includes('germany') ||
      impressum.match(/plz|postal code.*[1-9]\d{4}[^8-9]/)
    ) {
      dsgvoScore += 10;
    }
  }

  // Determine result
  let jurisdiction: 'nDSG' | 'DSGVO' | 'BOTH';
  let ampel: '🟢' | '🟡' | '🔴';

  if (ndsScore > dsgvoScore + 20) {
    jurisdiction = 'nDSG';
    ampel = '🟢';
  } else if (dsgvoScore > ndsScore + 20) {
    jurisdiction = 'DSGVO';
    ampel = '🟡';
  } else {
    jurisdiction = 'BOTH';
    ampel = '🔴';
  }

  const confidence = Math.min(
    Math.max((Math.abs(ndsScore - dsgvoScore) / 100) * 100, 0),
    100
  );

  const reasons: string[] = [];
  if (domain.endsWith('.ch')) reasons.push(`Domain: .ch (Schweiz)`);
  if (domain.endsWith('.de')) reasons.push(`Domain: .de (Deutschland)`);
  if (country === 'CH') reasons.push(`Server Location: Schweiz`);
  if (country && ['DE', 'AT', 'FR'].includes(country))
    reasons.push(`Server Location: ${country}`);
  if (language.includes('de-CH'))
    reasons.push(`Language: Deutsch (Schweiz)`);
  if (language.includes('de') && !language.includes('de-CH'))
    reasons.push(`Language: Deutsch (nicht Schweiz)`);

  return {
    jurisdiction,
    ampel,
    confidence: Math.round(confidence),
    reasons:
      reasons.length > 0
        ? reasons
        : ['Analyse abgeschlossen - Standard-Erkennung'],
  };
}

function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url.replace('www.', '');
  }
}

function guessCountryFromDomain(domain: string): string {
  const ext = domain.split('.').pop()?.toUpperCase() || '';

  const countryMap: Record<string, string> = {
    CH: 'CH',
    DE: 'DE',
    AT: 'AT',
    FR: 'FR',
    IT: 'IT',
    ES: 'ES',
    NL: 'NL',
    BE: 'BE',
    SE: 'SE',
    DK: 'DK',
    NO: 'NO',
    FI: 'FI',
    PL: 'PL',
    CZ: 'CZ',
    EU: 'EU',
  };

  return countryMap[ext] || 'UNKNOWN';
}