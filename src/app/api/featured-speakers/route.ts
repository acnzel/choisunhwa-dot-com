/**
 * GET  /api/featured-speakers       — 이달의 강사 목록 조회 (공개)
 * POST /api/featured-speakers       — 등록 (어드민 전용)
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// 강사 조인 컬럼
const SPEAKER_COLS = 'id, name, title, company, photo_url, bio_short, fields'

// ── GET ──────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const homeOnly = searchParams.get('home') === 'true'
  const all = searchParams.get('all') === 'true'   // 어드민: 비활성 포함
  const limit = parseInt(searchParams.get('limit') ?? '20', 10)
  const offset = parseInt(searchParams.get('offset') ?? '0', 10)

  const supabase = await createClient()

  let query = supabase
    .from('featured_speakers')
    .select(
      `id, intro, tags, is_visible, home_visible, start_date, end_date, sort_order, created_at,
       speaker:speaker_id (${SPEAKER_COLS})`,
      { count: 'exact' }
    )
    .order('sort_order', { ascending: true })

  // 공개 필터
  if (!all) {
    query = query.eq('is_visible', true)
    const today = new Date().toISOString().split('T')[0]
    query = query.or(`start_date.is.null,start_date.lte.${today}`)
    query = query.or(`end_date.is.null,end_date.gte.${today}`)
  }

  // 홈 전용
  if (homeOnly) {
    query = query.eq('home_visible', true).limit(4)
  } else {
    query = query.range(offset, offset + limit - 1)
  }

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data, meta: { total: count ?? 0, limit, offset } })
}

// ── POST ─────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 })

  const body = await req.json()
  const {
    speaker_id,
    intro = '',
    tags = [],
    is_visible = true,
    home_visible = true,
    start_date = null,
    end_date = null,
    sort_order = 0,
  } = body

  if (!speaker_id) {
    return NextResponse.json({ error: 'speaker_id는 필수입니다' }, { status: 400 })
  }
  if (intro.length > 80) {
    return NextResponse.json({ error: '한줄 소개는 80자 이내여야 합니다' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('featured_speakers')
    .insert({ speaker_id, intro, tags, is_visible, home_visible, start_date, end_date, sort_order })
    .select(`id, intro, tags, is_visible, home_visible, start_date, end_date, sort_order, speaker:speaker_id (${SPEAKER_COLS})`)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
