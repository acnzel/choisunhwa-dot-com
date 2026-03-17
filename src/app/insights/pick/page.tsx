import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '이 강사 어때요?',
  description: '운영진이 직접 큐레이션한 이달의 강사 에디터 픽',
}

export default function PickPage() {
  // TODO (I-B1 완료 후): Supabase에서 type='pick' 데이터 fetch
  const items: unknown[] = []

  if (items.length === 0) return null

  return (
    <section style={{ padding: 'clamp(28px, 4vw, 44px) var(--space-page)' }}>
      {/* 콘텐츠 렌더링 영역 */}
    </section>
  )
}
