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

  // auth.users는 service role로만 접근 가능
  // profiles 테이블 기준으로 조회하되, email은 auth.users에서 별도로 가져와야 함
  // 단순화: profiles에 email 컬럼 추가 없이 supabase admin API 활용
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers({
    page,
    perPage: limit,
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 })
  }

  // profiles 조회
  const userIds = authUsers.users.map((u) => u.id)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, provider, status, marketing_agreed, created_at, last_login_at, role')
    .in('id', userIds)

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]))

  let merged = authUsers.users.map((u) => ({
    id: u.id,
    email: u.email,
    ...profileMap.get(u.id),
    email_confirmed_at: u.email_confirmed_at,
  }))

  // 클라이언트 사이드 필터 (supabase admin API는 서버사이드 필터 제한적)
  if (keyword) {
    merged = merged.filter(
      (u) =>
        u.email?.toLowerCase().includes(keyword.toLowerCase()) ||
        (u as { name?: string }).name?.toLowerCase().includes(keyword.toLowerCase())
    )
  }
  if (provider) {
    merged = merged.filter((u) => (u as { provider?: string }).provider === provider)
  }
  if (status) {
    merged = merged.filter((u) => (u as { status?: string }).status === status)
  }

  return NextResponse.json({
    data: merged,
    meta: {
      page,
      limit,
      total: authUsers.total ?? merged.length,
      totalPages: Math.ceil((authUsers.total ?? merged.length) / limit),
    },
  })
}
