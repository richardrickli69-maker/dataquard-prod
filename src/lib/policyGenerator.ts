/**
 * Policy Generator - Server-side only!
 * NEVER expose ANTHROPIC_API_KEY to client!
 */

export interface GeneratedPolicy {
  id: string;
  type: string;
  content: string;
  format: string;
  generatedAt: string;
}

/**
 * Build prompt based on jurisdiction
 */
function buildPrompt(jurisdiction: string, domain: string, companyName: string): string {
  if (jurisdiction === 'nDSG') {
    return `Generate a Swiss nDSG (Bundesgesetz über den Datenschutz) compliant privacy policy for:
    
Domain: ${domain}
Company: ${companyName}

Include these 10 required sections:
1. Introduction and scope
2. Data controller information
3. Categories of personal data
4. Legal basis for processing
5. Recipients of data
6. Data retention periods
7. Individual rights
8. Data security measures
9. Cookies and tracking
10. Contact information

Format as markdown. Make it clear and professional.`;
  }

  if (jurisdiction === 'GDPR') {
    return `Generate a GDPR (EU General Data Protection Regulation) compliant privacy policy for:
    
Domain: ${domain}
Company: ${companyName}

Include these 10 required sections:
1. Controller and contact
2. Legal basis
3. Types of data processed
4. Recipients and transfers
5. Retention periods
6. Data subject rights
7. Automated decision making
8. Security measures
9. Cookies and tracking
10. Updates to this policy

Format as markdown. Make it legally accurate and comprehensive.`;
  }

  return `Generate a GDPR + nDSG dual-compliant privacy policy for:
  
Domain: ${domain}
Company: ${companyName}

Create two sections:
SECTION 1: GDPR Compliance (EU requirements)
SECTION 2: nDSG Compliance (Swiss requirements)

Each section should have 10 key points.
Format as markdown.`;
}

/**
 * Fallback template if API fails
 */
function generateFallbackPolicy(jurisdiction: string, domain: string, companyName: string): string {
  return `# Privacy Policy

## Introduction
This privacy policy explains how ${companyName} collects, uses, and protects personal data on ${domain}.

## Data Controller
Company: ${companyName}
Domain: ${domain}

## Types of Data Collected
- Visitor IP addresses
- Browsing behavior
- Contact information (if submitted)
- Cookies and tracking data

## Legal Basis (${jurisdiction === 'nDSG' ? 'nDSG' : 'GDPR'})
We process personal data based on your consent and legitimate business interests.

## Data Retention
Data is retained for the duration necessary to provide our services.

## Your Rights
You have the right to:
- Access your data
- Correct inaccuracies
- Request deletion
- Opt-out of processing

## Security
We implement appropriate security measures to protect your data.

## Contact
For privacy questions: privacy@${domain}

---
Last updated: ${new Date().toLocaleDateString()}
`;
}

/**
 * Generate privacy policy using Claude API (Server-side only!)
 * This function should ONLY be called from API routes!
 */
export async function generatePrivacyPolicy(
  jurisdiction: string,
  domain: string,
  companyName: string
): Promise<GeneratedPolicy> {
  try {
    // API Key must be server-side environment variable!
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      console.warn('ANTHROPIC_API_KEY not set - using fallback template');
      return {
        id: `policy_${Date.now()}`,
        type: jurisdiction,
        content: generateFallbackPolicy(jurisdiction, domain, companyName),
        format: 'markdown',
        generatedAt: new Date().toISOString(),
      };
    }

    const prompt = buildPrompt(jurisdiction, domain, companyName);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Claude API error:', error);
      return {
        id: `policy_${Date.now()}`,
        type: jurisdiction,
        content: generateFallbackPolicy(jurisdiction, domain, companyName),
        format: 'markdown',
        generatedAt: new Date().toISOString(),
      };
    }

    const data = await response.json();
    const generatedContent = data.content[0].text;

    return {
      id: `policy_${Date.now()}`,
      type: jurisdiction,
      content: generatedContent,
      format: 'markdown',
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Policy generation error:', error);
    return {
      id: `policy_${Date.now()}`,
      type: jurisdiction,
      content: generateFallbackPolicy(jurisdiction, domain, companyName),
      format: 'markdown',
      generatedAt: new Date().toISOString(),
    };
  }
}

/**
 * Convert markdown to HTML
 */
export function markdownToHtml(markdown: string): string {
  return markdown
    .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');
}

/**
 * Export policy as different formats
 */
export function exportPolicy(policy: GeneratedPolicy, format: 'text' | 'html' | 'markdown' = 'markdown'): string {
  if (format === 'html') {
    return markdownToHtml(policy.content);
  }
  return policy.content;
}