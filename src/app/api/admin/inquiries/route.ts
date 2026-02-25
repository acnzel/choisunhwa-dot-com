import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { PAGINATION } from '@/constants'

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const supabase = createAdminClient()
  const { searchParams } = new URL(request.url)

  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const limit = parseInt(searchParams.get('limit') ?? String(PAGINATION.DEFAULT_LIMIT), 10)
  const type = searchParams.get('type')
  const status = searchParams.get('status')
  const keyword = searchParams.get('q')
  const dateFrom = searchParams.get('date_from')
  const dateTo = searchParams.get('date_to')
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('inquiries')
    .select('id, type, name, company, phone, email, status, assigned_admin_id, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (type) query = query.eq('type', type)
  if (status) query = query.eq('status', status)
  if (keyword) query = query.or(`name.ilike.%${keyword}%,company.ilike.%${keyword}%,phone.ilike.%${keyword}%`)
  if (dateFrom) query = query.gte('created_at', dateFrom)
  if (dateTo) query = query.lte('created_at', dateTo)
  query = query.range(from, to)

  const { data, error: dbError, count } = await query
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  return NextResponse.json({
    data,
    meta: { page, limit, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / limit) },
  })
}
