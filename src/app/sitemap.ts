import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { SITE_URL as base } from '@/lib/seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const admin = createAdminClient()

  const [{ data: speakers }, { data: lectures }, { data: insights }] = await Promise.all([
    supabase.from('speakers').select('id, created_at').eq('is_visible', true),
    supabase.from('lectures').select('id, created_at').eq('is_visible', true),
    // insights 는 목록·상세 페이지와 같이 admin 클라이언트로 조회한다
    admin
      .from('insights')
      .select('id, type, published_at, updated_at')
      .eq('status', 'published')
      .in('type', ['issue', 'report'])
      .order('published_at', { ascending: false }),
  ])

  const latestInsight = insights?.[0]?.updated_at ?? insights?.[0]?.published_at ?? undefined

  // /lectures 는 /insights/issue 로 영구 리다이렉트되므로 넣지 않는다
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/speakers`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/insights/issue`, lastModified: latestInsight, changeFrequency: 'daily', priority: 0.8 },
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

  const insightRoutes: MetadataRoute.Sitemap = (insights ?? []).map((i) => ({
    url: `${base}/insights/${i.type}/${i.id}`,
    lastModified: i.updated_at ?? i.published_at ?? undefined,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...speakerRoutes, ...lectureRoutes, ...insightRoutes]
}
