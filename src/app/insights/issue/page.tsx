import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '오늘의 이슈',
  description: '최선화닷컴이 큐레이션하는 오늘의 이슈 — 강연으로 연결되는 트렌드',
}

export default function IssuePage() {
  // TODO (I-B1 완료 후): Supabase에서 type='issue' 데이터 fetch
  const items: unknown[] = []

  if (items.length === 0) return null

  return (
    <section style={{ padding: 'clamp(28px, 4vw, 44px) var(--space-page)' }}>
      {/* 콘텐츠 렌더링 영역 */}
    </section>
  )
}
