import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { FILE_UPLOAD } from '@/constants'

/**
 * POST /api/admin/upload
 * 이미지 업로드 (강사 프로필 사진, 강연 썸네일)
 * multipart/form-data: file + bucket (speakers | lectures)
 */
export async function POST(request: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const bucket = (formData.get('bucket') as string) ?? 'speakers'

  if (!file) {
    return NextResponse.json({ error: '파일을 선택해주세요' }, { status: 400 })
  }

  const allowed: readonly string[] = FILE_UPLOAD.PROFILE_IMAGE.accept
  if (!allowed.includes(file.type)) {
    return NextResponse.json(
      { error: '이미지 파일만 업로드 가능합니다 (JPG, PNG, WebP)' },
      { status: 400 }
    )
  }

  if (file.size > FILE_UPLOAD.PROFILE_IMAGE.maxSize) {
    return NextResponse.json({ error: '파일 크기는 2MB 이하여야 합니다' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const supabase = createAdminClient()

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, Buffer.from(arrayBuffer), {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    return NextResponse.json({ error: '업로드에 실패했습니다: ' + uploadError.message }, { status: 500 })
  }

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path)

  return NextResponse.json({ data: { url: publicUrlData.publicUrl } }, { status: 201 })
}
