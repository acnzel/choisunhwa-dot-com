import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendInquiryConfirmation } from '@/lib/email'
import { InquiryFormSchema } from '@/lib/validations'

/**
 * POST /api/inquiries
 * 문의 접수. service role로 삽입 (RLS 우회).
 */
export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다' }, { status: 400 })
  }

  const parsed = InquiryFormSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: '입력값을 확인해주세요', details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('inquiries')
    .insert(parsed.data)
    .select('id')
    .single()

  if (error) {
    console.error('[POST /api/inquiries]', error)
    return NextResponse.json({ error: '문의 접수에 실패했습니다' }, { status: 500 })
  }

  // 접수 확인 이메일 발송 (실패해도 응답은 200)
  sendInquiryConfirmation({
    to: parsed.data.email,
    name: parsed.data.name,
    inquiryType: parsed.data.type,
  }).catch((err) => console.error('[Resend] inquiry confirmation error:', err))

  return NextResponse.json({ data: { id: data.id } }, { status: 201 })
}
