import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { LectureSchema } from '@/lib/validations'
import { PAGINATION } from '@/constants'

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const supabase = createAdminClient()
  const { searchParams } = new URL(request.url)

  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const limit = parseInt(searchParams.get('limit') ?? String(PAGINATION.DEFAULT_LIMIT), 10)
  const keyword = searchParams.get('q')
  const speakerId = searchParams.get('speaker_id')
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('lectures')
    .select(
      'id, title, thumbnail_url, fields, duration, is_visible, created_at, speakers(id, name)',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })

  if (keyword) query = query.ilike('title', `%${keyword}%`)
  if (speakerId) query = query.eq('speaker_id', speakerId)
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

  const parsed = LectureSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: '입력값을 확인해주세요', details: parsed.error.flatten() }, { status: 422 })
  }

  const supabase = createAdminClient()
  const { data, error: dbError } = await supabase
    .from('lectures')
    .insert(parsed.data)
    .select()
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
