import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { MemoSchema } from '@/lib/validations'

type Params = { params: Promise<{ id: string }> }

/**
 * POST /api/admin/inquiries/:id/memos
 * 내부 메모 추가
 */
export async function POST(request: NextRequest, { params }: Params) {
  const { error, user } = await requireAdmin()
  if (error) return error

  const { id: inquiry_id } = await params
  const body = await request.json()
  const parsed = MemoSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: '입력값을 확인해주세요', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()
  const { data, error: dbError } = await supabase
    .from('inquiry_memos')
    .insert({
      inquiry_id,
      admin_id: user!.id,
      admin_name: parsed.data.admin_name,
      content: parsed.data.content,
    })
    .select()
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
