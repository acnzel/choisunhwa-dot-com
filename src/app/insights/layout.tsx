import type { Metadata } from 'next'
import InsightsTabs from './InsightsTabs'
import RevealOnScroll from '@/components/RevealOnScroll'

export const metadata: Metadata = {
  title: {
    default: '강연 인사이트',
    template: '%s | 강연 인사이트 | 최선화닷컴',
  },
  description: '강연 트렌드, 현장 리포트, 에디터 픽까지 — 최선화닷컴이 큐레이션하는 강연 인사이트',
}

export default function InsightsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        .insights-hero-watermark {
          position: absolute; top: 50%; right: var(--space-page);
          transform: translateY(-50%);
          font-family: var(--font-english);
          font-size: clamp(64px, 11vw, 170px);
          color: var(--color-border); opacity: 0.5;
          z-index: 0; pointer-events: none; user-select: none;
          line-height: 1; letter-spacing: -0.02em;
        }
      `}</style>

      <div className="page-max-wrap" style={{ paddingTop: 'var(--nav-height)', minHeight: '100dvh' }}>
        <RevealOnScroll />

        {/* ── HERO ── */}
        <section style={{
          minHeight: 'clamp(180px, 26dvh, 320px)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: 'clamp(36px, 6vw, 72px) var(--space-page) clamp(28px, 4vw, 44px)',
          borderBottom: '1px solid var(--color-border)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div aria-hidden className="insights-hero-watermark">INSIGHT</div>

          <div style={{ position: 'relative', zIndex: 1, maxWidth: '480px' }}>
            <p style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              fontSize: '11px', fontWeight: 500, letterSpacing: '0.14em',
              color: 'var(--color-muted)', marginBottom: '14px', textTransform: 'uppercase',
            }}>
              <span style={{ display: 'block', width: '20px', height: '1px', background: 'var(--color-muted)' }} />
              강연 인사이트
            </p>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 900,
              fontSize: 'clamp(28px, 4.5vw, 64px)',
              lineHeight: 1.1, letterSpacing: '-0.03em',
            }}>
              트렌드를 읽고,<br />
              <span style={{ color: 'var(--color-rust)', fontWeight: 400 }}>강연으로 답한다.</span>
            </h1>
          </div>
        </section>

        {/* ── 탭 네비게이션 ── */}
        <InsightsTabs />

        {/* ── 페이지 콘텐츠 ── */}
        {children}
      </div>
    </>
  )
}
