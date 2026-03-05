import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '페이지를 찾을 수 없습니다',
  description: '요청하신 페이지가 존재하지 않습니다.',
}

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      paddingTop: 'var(--nav-height)',
      background: 'var(--color-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ textAlign: 'center', padding: '0 var(--space-page)', maxWidth: '480px' }}>

        {/* 404 워터마크 */}
        <div style={{
          fontFamily: 'var(--font-english)',
          fontSize: 'clamp(80px, 16vw, 160px)',
          fontWeight: 700,
          color: 'var(--color-border)',
          lineHeight: 1,
          letterSpacing: '-0.04em',
          marginBottom: '8px',
          userSelect: 'none',
        }}>
          404
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          fontSize: 'clamp(20px, 3vw, 28px)',
          letterSpacing: '-0.03em',
          color: 'var(--color-ink)',
          marginBottom: '12px',
          lineHeight: 1.2,
        }}>
          페이지를 찾을 수 없습니다.
        </h1>

        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          fontWeight: 300,
          color: 'var(--color-muted)',
          lineHeight: 1.9,
          marginBottom: '36px',
        }}>
          요청하신 주소가 변경되었거나<br />
          존재하지 않는 페이지입니다.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em',
              color: 'var(--color-bg)', background: 'var(--color-green)',
              padding: '12px 24px',
              fontFamily: 'var(--font-body)',
            }}
          >
            홈으로 →
          </Link>
          <Link
            href="/speakers"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              fontSize: '12px', fontWeight: 500, letterSpacing: '0.06em',
              color: 'var(--color-subtle)',
              border: '1px solid var(--color-border)',
              padding: '12px 24px',
              fontFamily: 'var(--font-body)',
            }}
          >
            강사 보기
          </Link>
        </div>

      </div>
    </div>
  )
}
