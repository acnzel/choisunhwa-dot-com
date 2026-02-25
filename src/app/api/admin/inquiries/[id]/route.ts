import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendInquiryStatusUpdate } from '@/lib/email'
import { z } from 'zod'

type Params = { params: Promise<{ id: string }> }

const PatchSchema = z.object({
  status: z.enum(['new', 'confirmed', 'processing', 'done']).optional(),
  assigned_admin_id: z.string().uuid().nullable().optional(),
  notify_message: z.string().optional(), // 이메일 알림 메시지 (선택)
})

export async function GET(_req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const supabase = createAdminClient()

  const { data: inquiry, error: dbError } = await supabase
    .from('inquiries')
    .select('*')
    .eq('id', id)
    .single()

  if (dbError || !inquiry) return NextResponse.json({ error: '문의를 찾을 수 없습니다' }, { status: 404 })

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
  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다' }, { status: 400 })
  }

  const parsed = PatchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: '입력값을 확인해주세요', details: parsed.error.flatten() }, { status: 422 })
  }

  const { notify_message, ...updateData } = parsed.data
  const supabase = createAdminClient()

  const { data, error: dbError } = await supabase
    .from('inquiries')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  // 상태 변경 시 고객에게 이메일 알림 (notify_message가 있을 때만)
  if (data && updateData.status && notify_message) {
    sendInquiryStatusUpdate({
      to: data.email,
      name: data.name,
      status: updateData.status,
      message: notify_message,
    }).catch((err) => console.error('[Resend] status update error:', err))
  }

  return NextResponse.json({ data })
}
