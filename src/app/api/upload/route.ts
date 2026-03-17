/**
 * POST /api/upload
 * 이미지 업로드 API — WebP 변환 + Supabase Storage
 *
 * Body: multipart/form-data
 *   file:   Image file (JPG/PNG/WebP, max 5MB)
 *   bucket: 'insights' | 'speakers' | 'lectures' (default: 'insights')
 *   width:  max width px (default: 1200)
 *   crop:   '16:9' | '1:1' | 'none' (default: 'none')
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import sharp from 'sharp'

const ALLOWED_BUCKETS = ['insights', 'speakers', 'lectures'] as const
type Bucket = typeof ALLOWED_BUCKETS[number]

const CROP_RATIOS: Record<string, [number, number]> = {
  '16:9': [16, 9],
  '1:1':  [1, 1],
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // 어드민 인증 확인
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const bucket = (formData.get('bucket') as Bucket) || 'insights'
    const maxWidth = parseInt(formData.get('width') as string || '1200', 10)
    const crop = (formData.get('crop') as string) || 'none'

    if (!file) {
      return NextResponse.json({ error: '파일이 없습니다' }, { status: 400 })
    }
    if (!ALLOWED_BUCKETS.includes(bucket)) {
      return NextResponse.json({ error: '잘못된 버킷' }, { status: 400 })
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: '파일 크기는 5MB 이하여야 합니다' }, { status: 400 })
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return NextResponse.json({ error: 'JPG, PNG, WebP만 업로드 가능합니다' }, { status: 400 })
    }

    // Buffer 변환
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Sharp 파이프라인: resize → crop → WebP 변환
    let pipeline = sharp(buffer)

    const meta = await pipeline.metadata()
    const origW = meta.width ?? maxWidth
    const origH = meta.height ?? maxWidth

    if (crop !== 'none' && CROP_RATIOS[crop]) {
      const [rw, rh] = CROP_RATIOS[crop]
      // 원본 기준 crop 영역 계산
      const cropH = Math.round(origW * rh / rw)
      if (cropH <= origH) {
        pipeline = pipeline.extract({
          left: 0,
          top: Math.round((origH - cropH) / 2),
          width: origW,
          height: cropH,
        })
      }
    }

    const webpBuffer = await pipeline
      .resize(maxWidth, undefined, { withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer()

    // 파일명: {timestamp}_{random}.webp
    const timestamp = Date.now()
    const random = Math.random().toString(36).slice(2, 8)
    const fileName = `${timestamp}_${random}.webp`
    const filePath = `${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${fileName}`

    // Supabase Storage 업로드 (service role key 필요 → server-side)
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const serviceSupabase = createAdminClient()

    const { error: uploadError } = await serviceSupabase.storage
      .from(bucket)
      .upload(filePath, webpBuffer, {
        contentType: 'image/webp',
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: '업로드 실패: ' + uploadError.message }, { status: 500 })
    }

    // Public URL 반환
    const { data: { publicUrl } } = serviceSupabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return NextResponse.json({
      url: publicUrl,
      path: filePath,
      bucket,
      size: webpBuffer.length,
    })
  } catch (err) {
    console.error('Upload API error:', err)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
