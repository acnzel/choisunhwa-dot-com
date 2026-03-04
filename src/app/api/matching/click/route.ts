import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

const ClickSchema = z.object({
  session_id: z.string().uuid().optional(),
  speaker_id: z.string().uuid(),
  converted: z.boolean().default(false), // 문의까지 연결됐으면 true
})

/**
 * POST /api/matching/click
 * 추천 강사 클릭/문의 전환 추적
 */
export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다' }, { status: 400 })
  }

  const parsed = ClickSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: '입력값 오류' }, { status: 422 })
  }

  const { session_id, speaker_id, converted } = parsed.data
  const supabase = createAdminClient()

  if (session_id) {
    // 기존 세션에 클릭 정보 업데이트
    await supabase
      .from('matching_sessions')
      .update({ clicked_speaker: speaker_id, converted })
      .eq('id', session_id)
  }

  return NextResponse.json({ ok: true })
}
