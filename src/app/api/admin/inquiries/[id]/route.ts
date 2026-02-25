import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendInquiryStatusUpdate } from '@/lib/email'
import { z } from 'zod'

type Params = { params: Promise<{ id: string }> }

const UpdateSchema = z.object({
  status: z.enum(['new', 'confirmed', 'processing', 'done']).optional(),
  assigned_admin_id: z.string().uuid().nullable().optional(),
  notify_customer: z.boolean().optional(), // true면 고객에게 이메일 발송
  notify_message: z.string().optional(),
})

export async function GET(_request: NextRequest, { params }: Params) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const supabase = createAdminClient()

  const { data: inquiry, error: dbError } = await supabase
    .from('inquiries')
    .select('*')
    .eq('id', id)
    .single()

  if (dbError || !inquiry) {
    return NextResponse.json({ error: '문의를 찾을 수 없습니다' }, { status: 404 })
  }

  const { data: memos } = await supabase
    .from('inquiry_memos')
    .select('*')
    .eq('inquiry_id', id)
    .order('created_at', { ascending: true })

  return NextResponse.json({ data: { ...inquiry, memos: memos ?? [] } })
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const body = await request.json()
  const parsed = UpdateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: '입력값을 확인해주세요', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { notify_customer, notify_message, ...updateData } = parsed.data

  const supabase = createAdminClient()
  const { data, error: dbError } = await supabase
    .from('inquiries')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  // 고객 이메일 알림 발송
  if (notify_customer && data.status && data.status !== 'new') {
    try {
      await sendInquiryStatusUpdate({
        to: data.email,
        name: data.name,
        status: data.status,
        message: notify_message,
      })
    } catch (emailError) {
      console.error('[email] 상태 업데이트 이메일 발송 실패:', emailError)
    }
  }

  return NextResponse.json({ data })
}
