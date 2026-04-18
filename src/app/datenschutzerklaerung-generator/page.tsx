import type { Metadata } from 'next'
import { PageWrapper } from '../components/PageWrapper'
import Article from '@/content/articles/datenschutzerklaerung-generator.mdx'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.dataquard.ch'),
  title: 'Datenschutzerklärung Schweiz: Generator-Vergleich und nDSG-Leitfaden für KMU',
  description: 'Welcher Datenschutzerklärung-Generator ist für Schweizer KMU wirklich nDSG-konform? Ehrlicher Vergleich, rechtlicher Kontext und ein scan-basierter Weg.',
  keywords: 'datenschutzerklärung generator schweiz, nDSG datenschutzerklärung, datenschutzerklärung kmu schweiz',
  alternates: {
    canonical: 'https://www.dataquard.ch/datenschutzerklaerung-generator',
  },
  openGraph: {
    title: 'Datenschutzerklärung Schweiz: Welcher Generator wirklich passt',
    description: 'nDSG-konform, scan-basiert, für Schweizer KMU gebaut.',
    url: 'https://www.dataquard.ch/datenschutzerklaerung-generator',
    siteName: 'Dataquard',
    locale: 'de_CH',
    type: 'article',
    publishedTime: '2026-04-17T00:00:00.000Z',
    authors: ['Richard Rickli'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Datenschutzerklärung Schweiz: Generator-Vergleich',
    description: 'nDSG-konform, scan-basiert, für Schweizer KMU gebaut.',
  },
}

export default function Page() {
  return (
    <PageWrapper>
      <article className="mx-auto max-w-3xl px-6 py-16 prose prose-lg prose-headings:font-serif prose-a:text-[#22c55e] prose-a:no-underline hover:prose-a:underline">
        <Article />
      </article>
    </PageWrapper>
  )
}
