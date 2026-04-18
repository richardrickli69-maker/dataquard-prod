// Rendert ausschliesslich JSON-LD FAQPage-Schema für Suchmaschinen — kein sichtbares UI
import Script from 'next/script'

interface Question {
  question: string
  answer: string
}

interface Props {
  questions: Question[]
}

export default function FaqSchema({ questions }: Props) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map(q => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  }

  return (
    <Script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
