import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PAGINATION } from '@/constants'

/**
 * GET /api/support/notices
 * 공개 공지사항 목록. 고정 공지 상단, 나머지 최신순.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const limit = parseInt(
    searchParams.get('limit') ?? String(PAGINATION.DEFAULT_LIMIT),
    10
  )

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await supabase
    .from('notices')
    .select('id, title, is_pinned, published_at, created_at', { count: 'exact' })
    .eq('is_visible', true)
    .lte('published_at', new Date().toISOString())
    .order('is_pinned', { ascending: false })
    .order('published_at', { ascending: false })
    .range(from, to)

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
