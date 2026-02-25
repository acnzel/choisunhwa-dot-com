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
  const keyword = searchParams.get('q')
  const provider = searchParams.get('provider')
  const status = searchParams.get('status')
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('profiles')
    .select('id, name, provider, status, marketing_agreed, created_at, last_login_at', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (keyword) query = query.or(`name.ilike.%${keyword}%`)
  if (provider) query = query.eq('provider', provider)
  if (status) query = query.eq('status', status)
  query = query.range(from, to)

  const { data: profiles, error: dbError, count } = await query
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  // auth.users에서 이메일 가져오기 (admin API)
  const userIds = (profiles ?? []).map((p) => p.id)
  let emailMap: Record<string, string> = {}

  if (userIds.length > 0) {
    const { data: { users } } = await supabase.auth.admin.listUsers()
    emailMap = Object.fromEntries(
      (users ?? []).filter((u) => userIds.includes(u.id)).map((u) => [u.id, u.email ?? ''])
    )
  }

  const data = (profiles ?? []).map((p) => ({ ...p, email: emailMap[p.id] ?? '' }))

  return NextResponse.json({
    data,
    meta: { page, limit, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / limit) },
  })
}
