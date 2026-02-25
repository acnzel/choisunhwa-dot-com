import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PAGINATION } from '@/constants'

/**
 * GET /api/lectures
 * 공개 강연 커리큘럼 리스트
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const limit = parseInt(
    searchParams.get('limit') ?? String(PAGINATION.DEFAULT_LIMIT),
    10
  )
  const fields = searchParams.getAll('fields')
  const keyword = searchParams.get('q')
  const speakerId = searchParams.get('speaker_id')

  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('lectures')
    .select(
      `
      id, title, thumbnail_url, fields, duration, target, summary, created_at,
      speakers:speaker_id (id, name, photo_url)
    `,
      { count: 'exact' }
    )
    .eq('is_visible', true)

  if (fields.length > 0) {
    query = query.overlaps('fields', fields)
  }

  if (keyword) {
    query = query.or(`title.ilike.%${keyword}%,summary.ilike.%${keyword}%`)
  }

  if (speakerId) {
    query = query.eq('speaker_id', speakerId)
  }

  query = query.order('created_at', { ascending: false }).range(from, to)

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    data,
    meta: {
      page,
      limit,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / limit),
    },
  })
}
