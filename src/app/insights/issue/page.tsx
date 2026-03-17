import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import InsightCard from '@/components/insights/InsightCard'
import type { Insight } from '@/types'

export const metadata: Metadata = {
  title: '오늘의 이슈',
  description: '최선화닷컴이 큐레이션하는 오늘의 이슈 — 강연으로 연결되는 트렌드',
}

async function getIssues(): Promise<Insight[]> {
  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('insights')
      .select('*')
      .eq('type', 'issue')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
    if (error) throw error
    return (data as Insight[]) ?? []
  } catch {
    return []
  }
}

export default async function IssuePage() {
  const items = await getIssues()

  if (items.length === 0) return null

  return (
    <section style={{ padding: 'clamp(28px, 4vw, 44px) var(--space-page)' }}>
      {/* 상단 히어로 — 최신 1건 */}
      {items[0] && (
        <div style={{ marginBottom: 32 }}>
          <InsightCard insight={items[0]} href={`/insights/issue/${items[0].id}`} size="large" />
        </div>
      )}

      {/* 나머지 목록 — 3열 그리드 */}
      {items.length > 1 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 20,
        }}>
          {items.slice(1).map(item => (
            <InsightCard key={item.id} insight={item} href={`/insights/issue/${item.id}`} />
          ))}
        </div>
      )}
    </section>
  )
}
