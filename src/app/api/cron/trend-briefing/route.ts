import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { collectArticles } from '@/lib/trend-briefing/collector'
import { summarizeArticle } from '@/lib/trend-briefing/summarizer'

export const runtime = 'nodejs'
export const maxDuration = 120

// 공통 파이프라인
async function runPipeline() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const results = { collected: 0, summarized: 0, saved: 0, errors: [] as string[] }

  // 1. RSS 수집
  const articles = await collectArticles(4)
  results.collected = articles.length
  console.log(`[trend-briefing] 수집: ${articles.length}건`)

  if (articles.length === 0) return { ...results, message: '수집된 기사 없음' }

  // 2. 중복 제거 (최근 7일 내 동일 URL)
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

      const { error } = await supabase.from('insights').insert({
        type: 'issue',
        title: processed.title,
        summary: processed.summary,
        content_html: processed.content_html,
        status: 'draft',
        source_url: processed.source_url,
        source_name: processed.source_name,
        auto_generated: true,
        meta: { tags: processed.tags },
      })

      if (error) results.errors.push(`저장 실패: ${processed.title}`)
      else { results.saved++; console.log(`[trend-briefing] 저장: ${processed.title}`) }
    } catch (err) {
      results.errors.push(`오류: ${article.title}`)
      console.error('[trend-briefing]', err)
    }
  }

  return results
}

// GET: Vercel Cron 자동 실행 (CRON_SECRET Bearer 인증)
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const results = await runPipeline()
    return NextResponse.json({ ok: true, ...results })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}

// POST: 어드민 수동 실행 (로그인 세션 인증)
export async function POST(_req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const results = await runPipeline()
    return NextResponse.json({ ok: true, ...results })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
