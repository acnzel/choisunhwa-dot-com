import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/magazine
 * 공개 매거진 아티클. 탭별 필터 지원.
 * ?tab=editor_pick|field_report|off_stage|coming_up
 */
export async function GET(request: NextRequest) {
  const supabase = createAdminClient()
  const { searchParams } = new URL(request.url)
  const tab = searchParams.get('tab')
  const limit = parseInt(searchParams.get('limit') ?? '20', 10)

  let query = supabase
    .from('magazine_articles')
    .select('id, tab, title, summary, thumbnail_url, author, read_minutes, event_date, sort_order, created_at')
    .eq('is_visible', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (tab) query = query.eq('tab', tab)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data: data ?? [] })
}
