import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PAGINATION } from '@/constants'

/**
 * GET /api/speakers
 * 공개 강사 리스트. 필터/페이지네이션 지원.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const limit = parseInt(
    searchParams.get('limit') ?? String(PAGINATION.DEFAULT_LIMIT),
    10
  )
  const fields = searchParams.getAll('fields') // ?fields=leadership&fields=marketing
  const feeRange = searchParams.get('fee_range')
  const keyword = searchParams.get('q')
  const sort = searchParams.get('sort') ?? 'recommended' // recommended | name | latest

  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('speakers')
    .select('*', { count: 'exact' })
    .eq('is_visible', true)

  if (fields.length > 0) {
    query = query.overlaps('fields', fields)
  }

  if (feeRange) {
    query = query.eq('fee_range', feeRange)
  }

  if (keyword) {
    query = query.or(
      `name.ilike.%${keyword}%,bio_short.ilike.%${keyword}%`
    )
  }

  switch (sort) {
    case 'name':
      query = query.order('name', { ascending: true })
      break
    case 'latest':
      query = query.order('created_at', { ascending: false })
      break
    default:
      query = query.order('sort_order', { ascending: true })
  }

  query = query.range(from, to)

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
