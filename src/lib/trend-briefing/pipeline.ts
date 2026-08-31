import { createClient } from '@supabase/supabase-js'
import { collectArticles } from './collector'
import { summarizeArticle } from './summarizer'
import { fetchArticleImage } from './image'

// content_html 중간(H2 소제목들의 가운데 지점)에 <img>를 삽입한다.
// H2가 2개 미만이면 문단 중간에 삽입한다.
function insertImageMidway(html: string, imageUrl: string, alt: string): string {
  const imgTag = `<img src="${imageUrl}" alt="${alt.replace(/"/g, '&quot;')}" style="width:100%;height:auto;border-radius:12px;margin:24px 0;display:block;" loading="lazy" />`

  const h2Matches = [...html.matchAll(/<h2[^>]*>/g)]
  if (h2Matches.length >= 2) {
    const mid = h2Matches[Math.floor(h2Matches.length / 2)]
    const idx = mid.index!
    return html.slice(0, idx) + imgTag + html.slice(idx)
  }

  const paragraphEnds = [...html.matchAll(/<\/p>/g)]
  if (paragraphEnds.length > 0) {
    const mid = paragraphEnds[Math.floor(paragraphEnds.length / 2)]
    const idx = mid.index! + mid[0].length
    return html.slice(0, idx) + imgTag + html.slice(idx)
  }

  return html + imgTag
}

export interface PipelineResult {
  collected: number
  summarized: number
  saved: number
  errors: string[]
  message?: string
}

export async function runPipeline(): Promise<PipelineResult> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const results: PipelineResult = { collected: 0, summarized: 0, saved: 0, errors: [] }

  // 1. RSS 수집
  const articles = await collectArticles(4)
  results.collected = articles.length
  console.log(`[trend-briefing] 수집: ${articles.length}건`)

  if (articles.length === 0) return { ...results, message: '수집된 기사 없음' }

  // 2. 중복 제거 (최근 7일)
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: existing } = await supabase
    .from('insights')
    .select('source_url')
    .in('source_url', articles.map(a => a.link))
    .gte('created_at', since)

  const existingUrls = new Set((existing ?? []).map(r => r.source_url).filter(Boolean))
  const fresh = articles.filter(a => !existingUrls.has(a.link))
  console.log(`[trend-briefing] 중복 제거 후: ${fresh.length}건`)

  // 3. AI 요약 + DB 저장
  for (const article of fresh) {
    try {
      const processed = await summarizeArticle(article)
      if (!processed) { results.errors.push(`요약 실패: ${article.title}`); continue }
      results.summarized++

      const imageUrl = await fetchArticleImage(processed.image_query)
      const contentHtml = imageUrl
        ? insertImageMidway(processed.content_html, imageUrl, processed.title)
        : processed.content_html

      const { error } = await supabase.from('insights').insert({
        type: 'issue',
        title: processed.title,
        summary: processed.summary,
        content_html: contentHtml,
        thumbnail_url: imageUrl,
        status: 'draft',
        source_url: processed.source_url,
        source_name: processed.source_name,
        auto_generated: true,
        meta: { tags: processed.tags },
      })

      if (error) { results.errors.push(`저장 실패: ${processed.title}`); console.error(error) }
      else { results.saved++; console.log(`[trend-briefing] 저장: ${processed.title}`) }
    } catch (err) {
      results.errors.push(`오류: ${article.title}`)
      console.error('[trend-briefing]', err)
    }
  }

  return results
}
