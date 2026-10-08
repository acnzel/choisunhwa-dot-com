import { listPublishedInsights } from '@/lib/insights'
import { INSIGHT_TYPE_LABEL } from '@/constants'
import { SITE_URL, SITE_NAME, RSS_PATH, absoluteUrl } from '@/lib/seo'
import type { Insight } from '@/types'

// 강연 인사이트 RSS 2.0 피드 — 네이버 서치어드바이저 RSS 제출, 피드 리더용
export const revalidate = 3600

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export async function GET() {
  const { data } = await listPublishedInsights('id, type, title, summary, thumbnail_url, published_at', 50)

  const items = ((data ?? []) as unknown as Insight[]).map((i) => {
    const url = absoluteUrl(`/insights/${i.type}/${i.id}`)
    return `    <item>
      <title>${esc(i.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <category>${INSIGHT_TYPE_LABEL[i.type]}</category>
      ${i.published_at ? `<pubDate>${new Date(i.published_at).toUTCString()}</pubDate>` : ''}
      ${i.summary ? `<description>${esc(i.summary)}</description>` : ''}
      ${i.thumbnail_url ? `<enclosure url="${esc(i.thumbnail_url)}" type="${/\.png(\?|$)/i.test(i.thumbnail_url) ? 'image/png' : 'image/jpeg'}" length="0" />` : ''}
    </item>`
  }).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME} 강연 인사이트</title>
    <link>${SITE_URL}/insights/issue</link>
    <atom:link href="${absoluteUrl(RSS_PATH)}" rel="self" type="application/rss+xml" />
    <description>조직문화, HR, 리더십, 경제·산업 트렌드를 강연 관점에서 정리한 ${SITE_NAME} 인사이트</description>
    <language>ko</language>
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
