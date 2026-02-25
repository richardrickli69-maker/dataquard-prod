export interface GeneratedPolicy {
  id: string;
  type: string;
  content: string;
  format: string;
  generatedAt: string;
}

export async function generatePrivacyPolicy(
  jurisdiction: 'nDSG' | 'GDPR' | 'BOTH',
  domain: string,
  companyName?: string
): Promise<GeneratedPolicy> {
  try {
    const prompt = buildPrompt(jurisdiction, domain, companyName);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
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
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    const policyContent =
      data.content[0]?.type === 'text' ? data.content[0].text : '';

    return {
      id: `policy_${Date.now()}`,
      type:
        jurisdiction === 'nDSG'
          ? 'nDSG Privacy Policy'
          : jurisdiction === 'GDPR'
            ? 'GDPR Privacy Policy'
            : 'nDSG + GDPR Privacy Policy',
      content: policyContent,
      format: 'markdown',
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Policy generation error:', error);
    return generateBasicPolicy(jurisdiction, domain, companyName);
  }
}

function buildPrompt(
  jurisdiction: 'nDSG' | 'GDPR' | 'BOTH',
  domain: string,
  companyName?: string
): string {
  const company = companyName || domain;

  if (jurisdiction === 'nDSG') {
    return `Generate a comprehensive Swiss nDSG compliant privacy policy for ${company} (${domain}). Include: overview, legal basis, data types, purposes, retention, third-parties, user rights, cookies disclosure, contact info. Format as Markdown.`;
  }

  if (jurisdiction === 'GDPR') {
    return `Generate a comprehensive GDPR compliant privacy policy for ${company} (${domain}). Include: overview, controller info, legal basis, data types, purposes, retention, processors, user rights, cookies, DPA contact. Format as Markdown.`;
  }

  return `Generate a privacy policy for ${company} (${domain}) that complies with BOTH nDSG (Swiss) and GDPR (EU). Must satisfy both! Include all required sections for both jurisdictions. Format as Markdown.`;
}

function generateBasicPolicy(
  jurisdiction: 'nDSG' | 'GDPR' | 'BOTH',
  domain: string,
  companyName?: string
): GeneratedPolicy {
  const company = companyName || domain;

  const basicContent = `# Privacy Policy

## 1. Overview
This privacy policy explains how ${company} collects and protects your data.

## 2. Data Collection
We collect data through:
- Forms
- Registration
- Cookies
- Third-party services

## 3. Your Rights
You have the right to:
- Access your data
- Correct inaccurate data
- Request deletion
- Object to processing

## 4. Contact
Email: privacy@${domain}

---
Last Updated: ${new Date().toLocaleDateString()}`;

  return {
    id: `policy_${Date.now()}`,
    type:
      jurisdiction === 'nDSG'
        ? 'nDSG Privacy Policy'
        : jurisdiction === 'GDPR'
          ? 'GDPR Privacy Policy'
          : 'nDSG + GDPR Privacy Policy',
    content: basicContent,
    format: 'markdown',
    generatedAt: new Date().toISOString(),
  };
}

export function markdownToHtml(markdown: string): string {
  return markdown
    .replace(/# (.*?)\n/g, '<h1>$1</h1>')
    .replace(/## (.*?)\n/g, '<h2>$1</h2>')
    .replace(/### (.*?)\n/g, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

export function getPolicyAsText(policy: GeneratedPolicy): string {
  return policy.content;
}