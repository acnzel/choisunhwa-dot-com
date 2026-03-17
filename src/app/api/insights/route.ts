/**
 * GET  /api/insights       — 목록 조회 (type, status 필터)
 * POST /api/insights       — 생성 (어드민 전용)
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { InsightType, InsightStatus } from '@/types'

// ── GET ──────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const type = searchParams.get('type') as InsightType | null
  const status = searchParams.get('status') ?? 'published'
  const homeFeatured = searchParams.get('home_featured')
  const limit = parseInt(searchParams.get('limit') ?? '20', 10)
  const offset = parseInt(searchParams.get('offset') ?? '0', 10)

  const supabase = await createClient()

  let query = supabase
    .from('insights')
    .select('id, type, title, thumbnail_url, summary, status, published_at, home_featured, meta, created_at', { count: 'exact' })
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (type) query = query.eq('type', type)
  if (status && status !== 'all') query = query.eq('status', status as InsightStatus)
  if (homeFeatured === 'true') query = query.eq('home_featured', true)

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
    type, title, thumbnail_url, summary,
    content_json, content_html,
    status = 'draft', scheduled_at, home_featured = false, meta = {},
  } = body

  if (!type || !title) {
    return NextResponse.json({ error: 'type과 title은 필수입니다' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('insights')
    .insert({
      type, title, thumbnail_url, summary,
      content_json, content_html,
      status, scheduled_at, home_featured, meta,
      published_at: status === 'published' ? new Date().toISOString() : null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
