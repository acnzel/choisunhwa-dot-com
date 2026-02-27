import Link from 'next/link'

export default function Footer() {
  return (
    <>
      <style>{`
        .footer-grid {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: flex-end;
          gap: 40px;
          margin-bottom: 48px;
        }
        .footer-right { text-align: right; }
        .footer-nav {
          display: flex;
          gap: 20px;
          justify-content: flex-end;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .footer-logo {
          font-family: var(--font-english);
          font-size: clamp(36px, 6vw, 60px);
          letter-spacing: 0.02em;
          line-height: 1;
          color: #2D2720;
          user-select: none;
          white-space: nowrap;
        }
        @media (max-width: 640px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 28px;
          }
          .footer-right { text-align: left; }
          .footer-nav {
            justify-content: flex-start;
            gap: 12px 16px;
          }
          .footer-logo {
            font-size: 40px;
          }
        }
      `}</style>

      <footer
        style={{
          backgroundColor: 'var(--color-ink)',
          padding: 'clamp(40px, 6vw, 60px) var(--space-page) clamp(32px, 4vw, 44px)',
        }}
      >
        {/* 상단: 로고 + 링크 */}
        <div className="footer-grid">
          {/* 로고 */}
          <div className="footer-logo">
            CHOISUNHWA.COM
          </div>

          {/* 링크 + 정보 */}
          <div className="footer-right">
            <nav className="footer-nav">
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
    </>
  )
}
