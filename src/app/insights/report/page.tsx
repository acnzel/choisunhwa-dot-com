import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '강연 현장',
  description: '실제 진행된 강연의 현장 리포트 — 최선화닷컴이 함께한 강연 현장',
}

export default function ReportPage() {
  // TODO (I-B1 완료 후): Supabase에서 type='report' 데이터 fetch
  const items: unknown[] = []

  if (items.length === 0) return null

  return (
    <section style={{ padding: 'clamp(28px, 4vw, 44px) var(--space-page)' }}>
      {/* 콘텐츠 렌더링 영역 */}
    </section>
  )
}
