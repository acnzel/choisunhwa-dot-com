import { cache } from 'react'
import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { pageMeta } from '@/lib/seo'
import { INSIGHT_TYPE_LABEL } from '@/constants'
import type { Insight, InsightType } from '@/types'

// 공개 인사이트 조회 공통 조건. sitemap·RSS·llms.txt 는 상세 페이지가 있는 issue·report 만 노출한다.
export function listPublishedInsights(select: string, limit?: number) {
  const query = createAdminClient()
    .from('insights')
    .select(select)
    .eq('status', 'published')
    .in('type', ['issue', 'report'])
    .order('published_at', { ascending: false })
  return limit ? query.limit(limit) : query
}

// generateMetadata 와 페이지가 같은 요청 안에서 한 번만 조회하도록 cache 로 감싼다.
// published 조건을 함께 걸어 초안 제목이 head 에 새지 않게 한다.
export const getPublishedInsight = cache(async (id: string, type: InsightType): Promise<Insight | null> => {
  const { data } = await createAdminClient()
    .from('insights')
    .select('*')
    .eq('id', id)
    .eq('type', type)
    .eq('status', 'published')
    .single()
  return (data as Insight) ?? null
})

export async function insightMetadata(id: string, type: InsightType): Promise<Metadata> {
  const insight = await getPublishedInsight(id, type)
  if (!insight) return { title: INSIGHT_TYPE_LABEL[type] }
  return pageMeta({
    title: insight.title,
    description: insight.summary ?? undefined,
    path: `/insights/${type}/${id}`,
    images: [insight.thumbnail_url],
    type: 'article',
    publishedTime: insight.published_at,
    modifiedTime: insight.updated_at,
  })
}
