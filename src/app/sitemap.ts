import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://www.dataquard.ch';
  const now = new Date();
  return [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/scanner`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${base}/checkout`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/datenschutzerklaerung-generator`, lastModified: new Date('2026-04-17'), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/datenschutz`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/impressum`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/agb`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];
}