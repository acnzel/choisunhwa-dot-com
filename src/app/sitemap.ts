import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://choisunhwa-dot-com.vercel.app'
  const supabase = await createClient()

  const [{ data: speakers }, { data: lectures }] = await Promise.all([
    supabase.from('speakers').select('id, created_at').eq('is_visible', true),
    supabase.from('lectures').select('id, created_at').eq('is_visible', true),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/speakers`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/lectures`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/inquiry`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/support/faq`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/support/notice`, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${base}/support/about`, changeFrequency: 'yearly', priority: 0.4 },
  ]

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
    priority: 0.8,
  }))

  return [...staticRoutes, ...speakerRoutes, ...lectureRoutes]
}
