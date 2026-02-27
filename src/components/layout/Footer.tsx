import Link from 'next/link'

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: 'var(--color-ink)',
        padding: 'clamp(40px, 6vw, 60px) var(--space-page) clamp(32px, 4vw, 44px)',
      }}
    >
      {/* 상단: 로고 + 링크 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          alignItems: 'flex-end',
          gap: '40px',
          marginBottom: '48px',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-english)',
            fontSize: 'clamp(36px, 6vw, 60px)',
            letterSpacing: '0.02em',
            lineHeight: 1,
            color: '#2D2720',
            userSelect: 'none',
          }}
        >
          CHOISUNHWA<br />.COM
        </div>

        <div style={{ textAlign: 'right' }}>
          <nav style={{ display: 'flex', gap: '20px', justifyContent: 'flex-end', marginBottom: '16px' }}>
            {[
              { href: '/speakers', label: '연사 라인업' },
              { href: '/inquiry', label: '강연 의뢰하기' },
              { href: '/support/about', label: '소개' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 500,
                  letterSpacing: '0.08em',
                  color: 'rgba(247,243,238,0.35)',
                  transition: 'color 0.2s',
                }}
              >
                {label}
              </Link>
            ))}
          </nav>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              fontWeight: 300,
              color: 'rgba(247,243,238,0.25)',
              lineHeight: 2,
              letterSpacing: '0.04em',
            }}
          >
            강연 기획의 새로운 기준<br />
            © {new Date().getFullYear()} 최선화닷컴<br />
            contact@choisunhwa.com
          </p>
        </div>
      </div>

      {/* 하단: 구분선 + 법적 정보 */}
      <div
        style={{
          borderTop: '1px solid rgba(212,207,200,0.12)',
          paddingTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '10px',
            color: 'rgba(247,243,238,0.18)',
            letterSpacing: '0.04em',
          }}
        >
          사업자 정보 | 이용약관 | 개인정보처리방침
        </p>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '10px',
            color: 'rgba(247,243,238,0.18)',
            letterSpacing: '0.04em',
          }}
        >
          Designed with care.
        </p>
      </div>
    </footer>
  )
}
