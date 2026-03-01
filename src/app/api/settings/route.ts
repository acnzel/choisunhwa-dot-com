import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/settings
 * 퍼블릭 사이트 설정값 (히어로 카피, 신뢰 지표, 프로세스, 매거진 탭)
 */
export async function GET() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const settings = Object.fromEntries((data ?? []).map((row) => [row.key, row.value]))
  return NextResponse.json({ data: settings })
}
