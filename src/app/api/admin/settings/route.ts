import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/admin/settings — 전체 설정 조회
 * PATCH /api/admin/settings — 특정 key 값 업데이트
 */
export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  const supabase = createAdminClient()
  const { data, error: dbError } = await supabase
    .from('site_settings')
    .select('key, value, updated_at')

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  const settings = Object.fromEntries((data ?? []).map((row) => [row.key, row.value]))
  return NextResponse.json({ data: settings })
}

export async function PATCH(request: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  let body: { key: string; value: unknown }
  try { body = await request.json() } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다' }, { status: 400 })
  }

  if (!body.key || body.value === undefined) {
    return NextResponse.json({ error: 'key와 value가 필요합니다' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error: dbError } = await supabase
    .from('site_settings')
    .upsert({ key: body.key, value: body.value, updated_at: new Date().toISOString() })
    .select()
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ data })
}
