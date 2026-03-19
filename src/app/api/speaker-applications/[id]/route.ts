/**
 * PATCH /api/speaker-applications/[id]  — 승인(approve) or 반려(reject)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { action, admin_note } = body // action: 'approve' | 'reject'

  if (!['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'action은 approve 또는 reject이어야 합니다' }, { status: 400 })
  }

  const admin = createAdminClient()

  // 현재 신청서 조회
  const { data: app, error: fetchErr } = await admin
    .from('speaker_applications')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchErr || !app) return NextResponse.json({ error: '신청서를 찾을 수 없습니다' }, { status: 404 })

  const newStatus = action === 'approve' ? 'approved' : 'rejected'

  // 상태 업데이트
  const { error: updateErr } = await admin
    .from('speaker_applications')
    .update({
      status: newStatus,
      admin_note: admin_note || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

  // 승인 시 speakers 테이블에 자동 등록
  if (action === 'approve') {
    const { error: insertErr } = await admin
      .from('speakers')
      .insert({
        name: app.name,
        title: app.title,
        company: app.company,
        bio_short: app.bio_short,
        bio_full: app.bio_full || null,
        fields: app.fields || [],
        photo_url: app.photo_url || null,
        is_visible: true,
        is_best: false,
        is_trending: false,
      })

    if (insertErr) {
      return NextResponse.json({
        warning: `상태는 변경되었으나 speakers 등록 실패: ${insertErr.message}`,
        status: newStatus,
      }, { status: 207 })
    }
  }

  return NextResponse.json({ status: newStatus, message: action === 'approve' ? '승인 완료. 연사 라인업에 등록되었습니다.' : '반려 처리되었습니다.' })
}
