/**
 * PATCH /api/speaker-applications/[id]  — 강사 신청 승인(approve) / 거절(reject)
 *
 * 요청: { action: 'approve', admin_note?: string } | { action: 'reject', admin_note: string(사유, 필수) }
 * 응답:
 *   200 { data: { status: 'approved', speaker_id }, message }  — 비공개 강사로 등록됨. 어드민이 검수 후 공개한다.
 *   200 { data: { status: 'rejected' }, message }
 *   400 { error }               — action 또는 거절 사유가 잘못됨
 *   401 / 403 { error }         — 인증·권한 없음
 *   404 { error }               — 신청서 없음
 *   409 { error, status }       — 이미 처리된 신청서 (status 는 현재 상태)
 *   500 { error }               — DB 오류. 승인 중 실패하면 만든 강사 행을 지우고 신청서는 대기 상태로 남긴다.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'
import { SpeakerApplicationReviewSchema } from '@/lib/validations'
import { applicationToSpeaker } from '@/lib/speaker-application'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError, user } = await requireAdmin()
  if (authError) return authError

  const { id } = await params
  const parsed = SpeakerApplicationReviewSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? '잘못된 요청입니다' }, { status: 400 })
  }
  const { action, admin_note } = parsed.data

  const admin = createAdminClient()

  const { data: app } = await admin
    .from('speaker_applications')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!app) return NextResponse.json({ error: '신청서를 찾을 수 없습니다' }, { status: 404 })
  if (app.status !== 'pending') {
    return NextResponse.json({ error: '이미 처리된 신청서입니다', status: app.status }, { status: 409 })
  }

  const review = {
    admin_note: admin_note || null,
    reviewed_at: new Date().toISOString(),
    reviewed_by: user?.id ?? null,
  }

  // 대기 상태일 때만 바꾼다. 두 어드민이 동시에 처리해도 한 번만 반영된다.
  async function markReviewed(status: 'approved' | 'rejected', speakerId?: string) {
    return admin
      .from('speaker_applications')
      .update({ status, ...review, ...(speakerId ? { speaker_id: speakerId } : {}) })
      .eq('id', id)
      .eq('status', 'pending')
      .select('id')
  }

  if (action === 'reject') {
    const { data: updated, error } = await markReviewed('rejected')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!updated?.length) return NextResponse.json({ error: '이미 처리된 신청서입니다' }, { status: 409 })
    return NextResponse.json({ data: { status: 'rejected' }, message: '거절했습니다.' })
  }

  // 승인: 강사 행을 먼저 만들고 신청서 상태를 바꾼다. 상태 변경이 실패하면 강사 행을 지워 되돌린다.
  const { data: speaker, error: insertErr } = await admin
    .from('speakers')
    .insert(applicationToSpeaker(app))
    .select('id')
    .single()
  if (insertErr || !speaker) {
    return NextResponse.json({ error: `강사 등록 실패: ${insertErr?.message ?? '알 수 없는 오류'}` }, { status: 500 })
  }

  const { data: updated, error: updateErr } = await markReviewed('approved', speaker.id)
  if (updateErr || !updated?.length) {
    await admin.from('speakers').delete().eq('id', speaker.id)
    return updateErr
      ? NextResponse.json({ error: updateErr.message }, { status: 500 })
      : NextResponse.json({ error: '이미 처리된 신청서입니다' }, { status: 409 })
  }

  // 비공개로 등록하므로 공개 페이지 캐시는 건드리지 않는다
  return NextResponse.json({
    data: { status: 'approved', speaker_id: speaker.id },
    message: '비공개 강사로 등록했습니다. 검수 후 공개해주세요.',
  })
}
