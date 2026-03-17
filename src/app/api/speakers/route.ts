import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PAGINATION } from '@/constants'

// 리스트 페이지에서 필요한 컬럼만 (bio_full, careers, lecture_histories 등 제외)
const SPEAKER_LIST_COLUMNS = [
  'id', 'name', 'title', 'company', 'photo_url',
  'bio_short', 'fields', 'fee_range',
  'is_visible', 'is_best', 'sort_order', 'created_at',
].join(', ')

const MAX_LIMIT = 100

/**
 * GET /api/speakers
 * 공개 강사 리스트. 필터/페이지네이션 지원.
 *
 * Query params:
 *   page       number   (default: 1)
 *   limit      number   (default: 20, max: 100)
 *   fields     string[] (분야 필터, 복수 가능 ?fields=hr&fields=leadership)
 *   fee_range  string   (under_100 | 100_300 | over_300)
 *   q          string   (name / bio_short / company / title ilike 검색)
 *   sort       string   (recommended | name | latest, default: recommended)
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(searchParams.get('limit') ?? String(PAGINATION.DEFAULT_LIMIT), 10))
  )
  const fields = searchParams.getAll('fields')
  const feeRange = searchParams.get('fee_range')
  const keyword = searchParams.get('q')?.trim()
  const sort = searchParams.get('sort') ?? 'recommended'

  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('speakers')
    .select(SPEAKER_LIST_COLUMNS, { count: 'exact' })
    .eq('is_visible', true)

  if (fields.length > 0) {
    query = query.overlaps('fields', fields)
  }

  if (feeRange) {
    query = query.eq('fee_range', feeRange)
  }

  if (keyword) {
    // name, bio_short, company, title 모두 검색 (pg_trgm 인덱스 활용)
    query = query.or(
      `name.ilike.%${keyword}%,bio_short.ilike.%${keyword}%,company.ilike.%${keyword}%,title.ilike.%${keyword}%`
    )
  }

  switch (sort) {
    case 'name':
      query = query.order('name', { ascending: true })
      break
    case 'latest':
      query = query.order('created_at', { ascending: false })
      break
    default: // recommended
      query = query.order('sort_order', { ascending: true })
  }

  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    data: data ?? [],
    meta: {
      page,
      limit,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / limit),
    },
  })
}
