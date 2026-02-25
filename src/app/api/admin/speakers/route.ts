import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { SpeakerSchema } from '@/lib/validations'
import { PAGINATION } from '@/constants'

/**
 * GET /api/admin/speakers — 전체 강사 목록 (비공개 포함)
 * POST /api/admin/speakers — 강사 추가
 */
export async function GET(request: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const supabase = createAdminClient()
  const { searchParams } = new URL(request.url)

  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const limit = parseInt(searchParams.get('limit') ?? String(PAGINATION.DEFAULT_LIMIT), 10)
  const keyword = searchParams.get('q')
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('speakers')
    .select(
      'id, name, title, company, photo_url, fields, is_visible, sort_order, created_at',
      { count: 'exact' }
    )
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (keyword) {
    query = query.or(`name.ilike.%${keyword}%,fields.cs.{${keyword}}`)
  }

  query = query.range(from, to)

  const { data, error: dbError, count } = await query
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  return NextResponse.json({
    data,
    meta: { page, limit, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / limit) },
  })
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다' }, { status: 400 })
  }

  const parsed = SpeakerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: '입력값을 확인해주세요', details: parsed.error.flatten() }, { status: 422 })
  }

  const supabase = createAdminClient()
  const { data, error: dbError } = await supabase
    .from('speakers')
    .insert(parsed.data)
    .select()
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
