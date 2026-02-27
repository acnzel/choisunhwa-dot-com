'use client'

interface Props {
  speakerCount: number
}

const TICKER_ITEMS = (count: number) => [
  { label: '등록 강사', value: `${count}명` },
  { label: '주목 분야', value: '조직문화 · 행복심리 · 리더십' },
  { label: '강연 의뢰 접수', value: '즉시 가능' },
  { label: '최근 업데이트', value: '2025.02' },
]

export default function HeroTicker({ speakerCount }: Props) {
  const items = TICKER_ITEMS(speakerCount)

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <style>{`
        .ticker-container::-webkit-scrollbar { display: none; }
        .ticker-item-hide { display: none; }
        @media (min-width: 640px) { .ticker-item-hide { display: flex; } }
        @keyframes ticker-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.25; }
        }
      `}</style>
      {items.map((item, i) => (
        <div
          key={i}
          className={i >= 2 ? 'ticker-item-hide' : undefined}
          style={{
            flexShrink: 0,
            flex: '1 0 auto',
            padding: '9px 16px',
            borderRight: '1px solid var(--color-border)',
            fontSize: '11px',
            letterSpacing: '0.07em',
            color: 'var(--color-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap',
          }}
        >
          <span
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: 'var(--color-ochre)',
              flexShrink: 0,
              animation: `ticker-blink 2.5s ease-in-out infinite`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
          {item.label}&nbsp;<strong style={{ color: 'var(--color-ink)', fontWeight: 600 }}>{item.value}</strong>
        </div>
      ))}
    </div>
  )
}
