/**
 * PATCH  /api/speaker-applications/[id]  — 승인/거절/메모 (어드민)
 * DELETE /api/speaker-applications/[id]  — 삭제 (어드민)
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

type Params = { params: Promise<{ id: string }> }

// ── PATCH ─────────────────────────────────────────────────────
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 })

  const body = await req.json()
  const { status, admin_note } = body

  if (status && !['pending', 'approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: '유효하지 않은 상태값' }, { status: 400 })
  }

  const patch: Record<string, unknown> = {}
  if (status !== undefined) {
    patch.status = status
    patch.reviewed_at = new Date().toISOString()
    patch.reviewed_by = user.id
  }
  if (admin_note !== undefined) patch.admin_note = admin_note

  const admin = createAdminClient()

  // 승인 시 speakers 테이블에도 복사
  if (status === 'approved') {
    const { data: app } = await admin
      .from('speaker_applications')
      .select('*')
      .eq('id', id)
      .single()

    if (app) {
      await admin.from('speakers').insert({
        name: app.name,
        title: app.title,
        company: app.company,
        fields: app.fields ?? [],
        bio_short: app.bio_short,
        bio_full: app.bio_full,
        photo_url: app.photo_url,
        media_links: app.youtube_url ? [app.youtube_url] : [],
        is_visible: false, // 어드민이 최종 검토 후 is_visible=true로 변경
        sort_order: 9999,
      })
    }
  }

  const { data, error } = await admin
    .from('speaker_applications')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// ── DELETE ────────────────────────────────────────────────────
export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 })

  const admin = createAdminClient()
  const { error } = await admin.from('speaker_applications').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
