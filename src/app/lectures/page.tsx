import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import type { Lecture, Speaker } from '@/types'
import LectureList from './LectureList'
import RevealOnScroll from '@/components/RevealOnScroll'

export const metadata: Metadata = {
  title: '강연 매거진',
  description: '최선화닷컴이 엄선한 강연 매거진 — 에디터 픽부터 현장 리포트까지.',
}

type LectureWithSpeaker = Lecture & { speaker: Pick<Speaker, 'id' | 'name' | 'title'> }

async function getLectures(): Promise<LectureWithSpeaker[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('lectures')
    .select('*, speaker:speakers(id, name, title)')
    .eq('is_visible', true)
    .order('created_at', { ascending: false })
  return (data as LectureWithSpeaker[]) ?? []
}

export default async function LecturesPage() {
  const lectures = await getLectures()

  return (
    <>
      <style>{`
        .lectures-hero-watermark {
          position: absolute; top: 50%; right: var(--space-page);
          transform: translateY(-50%);
          font-family: var(--font-english);
          font-size: clamp(72px, 12vw, 180px);
          color: var(--color-border); opacity: 0.5;
          z-index: 0; pointer-events: none; user-select: none;
          line-height: 1; letter-spacing: -0.02em;
        }
      `}</style>

      <div className="page-max-wrap" style={{ paddingTop: 'var(--nav-height)', minHeight: '100dvh' }}>
        <RevealOnScroll />

        {/* ── HERO ── */}
        <section style={{
          minHeight: 'clamp(200px, 30dvh, 360px)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: 'clamp(40px, 7vw, 80px) var(--space-page) clamp(32px, 5vw, 48px)',
          borderBottom: '1px solid var(--color-border)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div aria-hidden className="lectures-hero-watermark">LECTURE</div>

          <div style={{ position: 'relative', zIndex: 1, maxWidth: '560px' }}>
            <p style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              fontSize: '11px', fontWeight: 500, letterSpacing: '0.14em',
              color: 'var(--color-muted)', marginBottom: '16px', textTransform: 'uppercase',
            }}>
              <span style={{ display: 'block', width: '20px', height: '1px', background: 'var(--color-muted)' }} />
              강연 매거진
            </p>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 900,
              fontSize: 'clamp(32px, 5vw, 72px)',
              lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '16px',
            }}>
              검증된 강연,<br />
              <span style={{ color: 'var(--color-rust)', fontWeight: 400 }}>직접 고르세요.</span>
            </h1>
            <p style={{
              fontSize: '13px', fontWeight: 300,
              color: 'var(--color-subtle)', lineHeight: 1.9,
            }}>
              기업이 선택하는 강연 커리큘럼부터 에디터 픽까지.
            </p>
          </div>
        </section>

        {/* ── 강연 목록 ── */}
        <section className="reveal" style={{ padding: 'clamp(28px, 4vw, 44px) var(--space-page)' }}>
          <LectureList lectures={lectures} />
        </section>

      </div>
    </>
  )
}
