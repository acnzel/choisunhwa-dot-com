import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateNewsletter, type NewsletterTrigger } from '@/lib/newsletter/generate'
import { SEASON_TRIGGERS } from '@/lib/newsletter/seasons'

export const runtime = 'nodejs'
// 검증 실패 재생성(최대 3회)과 모델 전환까지 감안한 상한
export const maxDuration = 60

// 미들웨어에서 admin 인증 완료 후 도달 — 별도 인증 불필요

// POST: 이슈 1건으로 뉴스레터 초안 생성 후 저장
// body: { trigger_type: 'article', insight_id } | { trigger_type: 'season', season_key }
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const admin = createAdminClient()

  let trigger: NewsletterTrigger
  let row: { trigger_type: string; insight_id?: string; season_key?: string }

  if (body?.trigger_type === 'article' && typeof body.insight_id === 'string') {
    const { data, error } = await admin
      .from('insights')
      .select('id, title, summary, meta')
      .eq('id', body.insight_id)
      .single()
    if (error || !data) return NextResponse.json({ error: '기사를 찾을 수 없습니다.' }, { status: 404 })
    trigger = { title: data.title, body: data.summary ?? '', tags: data.meta?.tags ?? [] }
    row = { trigger_type: 'article', insight_id: data.id }
  } else if (body?.trigger_type === 'season' && typeof body.season_key === 'string') {
    const season = SEASON_TRIGGERS.find(t => t.key === body.season_key)
    if (!season) return NextResponse.json({ error: '알 수 없는 계절 이슈입니다.' }, { status: 400 })
    trigger = { title: season.title, body: season.description, tags: season.fields }
    row = { trigger_type: 'season', season_key: season.key }
  } else {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }

  try {
    const content = await generateNewsletter(admin, trigger)
    const { data, error } = await admin
      .from('newsletter_drafts')
      .insert({ ...row, trigger_title: trigger.title, content })
      .select('id')
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ id: data.id })
  } catch (err) {
    console.error('[newsletter] 생성 실패', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 })
  }
}
