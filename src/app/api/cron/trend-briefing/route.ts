import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { collectArticles } from '@/lib/trend-briefing/collector'
import { summarizeArticle } from '@/lib/trend-briefing/summarizer'

// Vercel Cron: 매일 01:00 UTC (= 10:00 KST)
export const runtime = 'nodejs'
export const maxDuration = 120

export async function GET(req: NextRequest) {
  // Vercel Cron 인증 (Authorization: Bearer <CRON_SECRET>)
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const results = {
    collected: 0,
    summarized: 0,
    saved: 0,
    errors: [] as string[],
  }

  try {
    // 1. RSS 수집
    console.log('[trend-briefing] 수집 시작')
    const articles = await collectArticles(4)
    results.collected = articles.length
    console.log(`[trend-briefing] 수집 완료: ${articles.length}건`)

    if (articles.length === 0) {
      return NextResponse.json({ ok: true, message: '수집된 기사 없음', ...results })
    }

    // 2. 중복 URL 체크 (최근 7일 내 동일 URL 있으면 스킵)
    const urls = articles.map(a => a.link)
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data: existing } = await supabase
      .from('insights')
      .select('source_url')
      .in('source_url', urls)
      .gte('created_at', since)

    const existingUrls = new Set((existing ?? []).map(r => r.source_url).filter(Boolean))
    const fresh = articles.filter(a => !existingUrls.has(a.link))
    console.log(`[trend-briefing] 중복 제거 후: ${fresh.length}건`)

    // 3. OpenAI 요약 + DB 저장
    for (const article of fresh) {
      try {
        console.log(`[trend-briefing] 요약 중: ${article.title}`)
        const processed = await summarizeArticle(article)
        if (!processed) {
          results.errors.push(`요약 실패: ${article.title}`)
          continue
        }
        results.summarized++

        const { error: insertError } = await supabase.from('insights').insert({
          type: 'issue',
          title: processed.title,
          summary: processed.summary,
          content_html: processed.content_html,
          status: 'draft',
          source_url: processed.source_url,
          source_name: processed.source_name,
          auto_generated: true,
          meta: { tags: processed.tags },
          published_at: null,
        })

        if (insertError) {
          results.errors.push(`DB 저장 실패: ${processed.title} — ${insertError.message}`)
        } else {
          results.saved++
          console.log(`[trend-briefing] 저장 완료: ${processed.title}`)
        }
      } catch (err) {
        results.errors.push(`처리 중 오류: ${article.title}`)
        console.error('[trend-briefing] 오류:', err)
      }
    }

    console.log('[trend-briefing] 완료:', results)
    return NextResponse.json({ ok: true, ...results })
  } catch (err) {
    console.error('[trend-briefing] 전체 오류:', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
