'use client'

interface Props {
  speakerCount: number
}

const TICKER_ITEMS = (count: number) => [
  { label: '등록 강사', value: `${count}명` },
  { label: '주목 분야', value: '조직문화 · 행복심리 · 리더십' },
  { label: '강연 의뢰 접수', value: '즉시 가능' },
  { label: '최근 업데이트', value: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit' }).replace('. ', '.').replace('.', '') },
]

export default function HeroTicker({ speakerCount }: Props) {
  const items = TICKER_ITEMS(speakerCount)

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        overflow: 'hidden',
      }}
    >
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            padding: '9px 20px',
            borderRight: i < items.length - 1 ? '1px solid var(--color-border)' : 'none',
            fontSize: '11px',
            letterSpacing: '0.07em',
            color: 'var(--color-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap',
            minWidth: 0,
          }}
        >
          <span
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: 'var(--color-ochre)',
              flexShrink: 0,
              animation: 'ticker-blink 2.5s ease-in-out infinite',
              animationDelay: `${i * 0.4}s`,
            }}
          />
          {item.label}&nbsp;<strong style={{ color: 'var(--color-ink)', fontWeight: 600 }}>{item.value}</strong>
        </div>
      ))}
      <style>{`
        @keyframes ticker-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.25; }
        }
        @media (max-width: 640px) {
          .ticker-wrap { overflow-x: auto; }
          .ticker-wrap > div { min-width: max-content; }
        }
      `}</style>
    </div>
  )
}
