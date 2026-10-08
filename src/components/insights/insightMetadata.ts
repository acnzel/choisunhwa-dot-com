import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { pageMeta } from '@/lib/seo'
import type { InsightType } from '@/types'

// 인사이트 상세 공통 메타데이터. 본문과 같은 조건(type·published)으로 조회해 초안 제목이 head 에 새지 않게 한다.
export async function insightMetadata(id: string, type: InsightType, fallbackTitle: string): Promise<Metadata> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('insights')
    .select('title, summary, thumbnail_url, published_at, updated_at')
    .eq('id', id)
    .eq('type', type)
    .eq('status', 'published')
    .single()
  if (!data) return { title: fallbackTitle }
  return pageMeta({
    title: data.title,
    description: data.summary ?? undefined,
    path: `/insights/${type}/${id}`,
    images: [data.thumbnail_url],
    type: 'article',
    publishedTime: data.published_at,
    modifiedTime: data.updated_at,
  })
}
