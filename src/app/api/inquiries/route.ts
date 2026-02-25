import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendInquiryConfirmation } from '@/lib/email'
import { InquiryFormSchema } from '@/lib/validations'
import { FILE_UPLOAD } from '@/constants'

/**
 * POST /api/inquiries
 * 문의 접수 (multipart/form-data 또는 JSON)
 * - 파일 첨부 있으면 Supabase Storage에 업로드 후 URL 저장
 * - 접수 확인 이메일 자동 발송 (Resend)
 */
export async function POST(request: NextRequest) {
  const contentType = request.headers.get('content-type') ?? ''
  let body: Record<string, unknown>
  let fileUrl: string | undefined

  if (contentType.includes('multipart/form-data')) {
    // 파일 업로드 포함
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (file) {
      // 파일 유효성 검증
      const allowed: readonly string[] = FILE_UPLOAD.SPEAKER_DOCUMENT.accept
      if (!allowed.includes(file.type)) {
        return NextResponse.json(
          { error: '허용되지 않는 파일 형식입니다 (PDF, PPT, Word만 가능)' },
          { status: 400 }
        )
      }
      if (file.size > FILE_UPLOAD.SPEAKER_DOCUMENT.maxSize) {
        return NextResponse.json(
          { error: '파일 크기는 10MB 이하여야 합니다' },
          { status: 400 }
        )
      }

      const supabaseAdmin = createAdminClient()
      const ext = file.name.split('.').pop()
      const path = `inquiries/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const arrayBuffer = await file.arrayBuffer()
      const { error: uploadError } = await supabaseAdmin.storage
        .from('uploads')
        .upload(path, Buffer.from(arrayBuffer), {
          contentType: file.type,
          upsert: false,
        })

      if (uploadError) {
        return NextResponse.json(
          { error: '파일 업로드에 실패했습니다' },
          { status: 500 }
        )
      }

      const { data: publicUrl } = supabaseAdmin.storage
        .from('uploads')
        .getPublicUrl(path)

      fileUrl = publicUrl.publicUrl
    }

    // FormData → plain object
    body = Object.fromEntries(
      Array.from(formData.entries()).filter(([k]) => k !== 'file')
    )
    if (body.attendee_count) {
      body.attendee_count = Number(body.attendee_count)
    }
  } else {
    body = await request.json()
  }

  const parsed = InquiryFormSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: '입력값을 확인해주세요', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const supabaseAdmin = createAdminClient()
  const { data: inquiry, error: insertError } = await supabaseAdmin
    .from('inquiries')
    .insert({
      ...parsed.data,
      file_url: fileUrl ?? undefined,
    })
    .select()
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // 접수 확인 이메일 발송 (실패해도 문의 접수는 성공 처리)
  try {
    await sendInquiryConfirmation({
      to: parsed.data.email,
      name: parsed.data.name,
      inquiryType: parsed.data.type,
    })
  } catch (emailError) {
    console.error('[email] 문의 접수 확인 이메일 발송 실패:', emailError)
  }

  return NextResponse.json({ data: inquiry }, { status: 201 })
}
