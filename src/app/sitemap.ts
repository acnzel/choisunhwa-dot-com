import type { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { listPublishedInsights } from '@/lib/insights'
import { SITE_URL as base } from '@/lib/seo'
import type { Insight } from '@/types'

// 쿠키를 읽지 않는 admin 클라이언트로 조회해 크롤러 요청마다 DB 를 치지 않고 1시간 캐시한다
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const admin = createAdminClient()

  const [{ data: speakers }, { data: lectures }, { data: insights }] = await Promise.all([
    admin.from('speakers').select('id, created_at').eq('is_visible', true),
    admin.from('lectures').select('id, created_at').eq('is_visible', true),
    listPublishedInsights('id, type, published_at, updated_at'),
  ])

  // speakers·lectures 테이블에는 updated_at 이 없어 created_at 을 쓴다
  const speakerRoutes: MetadataRoute.Sitemap = (speakers ?? []).map((s) => ({
    url: `${base}/speakers/${s.id}`,
    lastModified: s.created_at,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const lectureRoutes: MetadataRoute.Sitemap = (lectures ?? []).map((l) => ({
    url: `${base}/lectures/${l.id}`,
    lastModified: l.created_at,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  const insightRoutes: MetadataRoute.Sitemap = ((insights ?? []) as unknown as Insight[]).map((i) => ({
    url: `${base}/insights/${i.type}/${i.id}`,
    lastModified: i.updated_at ?? i.published_at ?? undefined,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  // /lectures 는 /insights/issue 로 영구 리다이렉트되므로 넣지 않는다
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/speakers`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/insights/issue`, lastModified: insightRoutes[0]?.lastModified, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/insights/report`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/insights/featured`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/matching`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/inquiry`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/inquiry/lecture`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/speakers/apply`, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${base}/support/faq`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/support/notice`, changeFrequency: 'weekly', priority: 0.4 },
    { url: `${base}/support/about`, changeFrequency: 'yearly', priority: 0.5 },
  ]

  return [...staticRoutes, ...speakerRoutes, ...lectureRoutes, ...insightRoutes]
}
