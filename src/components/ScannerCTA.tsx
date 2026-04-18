// Wiederverwendbarer Scanner-CTA in 3 Varianten für Artikel-Seiten
// Design-Tokens identisch mit Homepage (page.tsx): weisse/grün-getönte Hintergründe, grüner Akzent
interface Props {
  variant: 'compact' | 'inline' | 'full'
  headline: string
  subline: string
  buttonText?: string
}

function ScannerButton({ text }: { text: string }) {
  return (
    <a
      href="/scanner"
      className="inline-block bg-[#22c55e] hover:bg-[#16a34a] text-white font-extrabold rounded-xl px-6 py-3 no-underline transition-colors duration-150 whitespace-nowrap text-sm"
      style={{ boxShadow: '0 4px 16px rgba(34,197,94,0.3)' }}
    >
      {text}
    </a>
  )
}

export default function ScannerCTA({ variant, headline, subline, buttonText = 'Jetzt kostenlos scannen →' }: Props) {
  // compact: dezente grün-getönte Box, einzeilig — analog zur Vergleichs-Box "Dataquard: automatisch korrekt"
  if (variant === 'compact') {
    return (
      <div style={{
        margin: '24px 0',
        background: 'rgba(34,197,94,0.04)',
        border: '1px solid rgba(34,197,94,0.25)',
        borderRadius: 12,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ color: '#1a1a2e', fontWeight: 700, fontSize: 15 }}>{headline}</div>
          <div style={{ color: '#555566', fontSize: 13, marginTop: 2 }}>{subline}</div>
        </div>
        <ScannerButton text={buttonText} />
      </div>
    )
  }

  // inline: weisse Card mit grünem Top-Akzent, 2-spaltig — analog zu den Feature-Cards auf der Homepage
  if (variant === 'inline') {
    return (
      <div style={{
        margin: '32px 0',
        background: '#ffffff',
        border: '1px solid #e2e4ea',
        borderRadius: 14,
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        overflow: 'hidden',
      }}>
        <div style={{ height: 3, background: 'linear-gradient(90deg, #22c55e, transparent)' }} />
        <div style={{
          padding: '24px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ color: '#1a1a2e', fontWeight: 700, fontSize: 17 }}>{headline}</div>
            <div style={{ color: '#555566', fontSize: 14, marginTop: 4 }}>{subline}</div>
          </div>
          <ScannerButton text={buttonText} />
        </div>
      </div>
    )
  }

  // full: grosse CTA-Sektion, zentriert — analog zum Bottom CTA der Homepage
  return (
    <div style={{
      margin: '48px 0',
      padding: '40px 32px',
      background: 'rgba(34,197,94,0.04)',
      border: '1px solid rgba(34,197,94,0.25)',
      borderRadius: 16,
      boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
      textAlign: 'center',
    }}>
      <div style={{ color: '#1a1a2e', fontWeight: 800, fontSize: 22, marginBottom: 8 }}>{headline}</div>
      <div style={{ color: '#555566', fontSize: 15, marginBottom: 24, maxWidth: 480, margin: '0 auto 24px' }}>{subline}</div>
      <ScannerButton text={buttonText} />
    </div>
  )
}
