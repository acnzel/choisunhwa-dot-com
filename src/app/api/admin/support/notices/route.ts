import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { NoticeSchema } from '@/lib/validations'
import { PAGINATION } from '@/constants'

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const supabase = createAdminClient()
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const limit = parseInt(searchParams.get('limit') ?? String(PAGINATION.DEFAULT_LIMIT), 10)
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error: dbError, count } = await supabase
    .from('notices')
    .select('id, title, is_pinned, is_visible, published_at, created_at', { count: 'exact' })
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  return NextResponse.json({
    data,
    meta: { page, limit, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / limit) },
  })
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const body = await request.json()
  const parsed = NoticeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: '입력값을 확인해주세요', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()
  const { data, error: dbError } = await supabase
    .from('notices')
    .insert({
      ...parsed.data,
      published_at: parsed.data.published_at ?? new Date().toISOString(),
    })
    .select()
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
