/**
 * PATCH  /api/featured-speakers/[id]  — 수정 (어드민)
 * DELETE /api/featured-speakers/[id]  — 삭제 (어드민)
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const SPEAKER_COLS = 'id, name, title, company, photo_url, bio_short, fields'

type Params = { params: Promise<{ id: string }> }

// ── PATCH ─────────────────────────────────────────────────────
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 })

  const body = await req.json()

  // intro 길이 검증
  if (body.intro !== undefined && body.intro.length > 80) {
    return NextResponse.json({ error: '한줄 소개는 80자 이내여야 합니다' }, { status: 400 })
  }

  const allowed = ['intro', 'tags', 'is_visible', 'home_visible', 'start_date', 'end_date', 'sort_order']
  const patch: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) patch[key] = body[key]
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('featured_speakers')
    .update(patch)
    .eq('id', id)
    .select(`id, intro, tags, is_visible, home_visible, start_date, end_date, sort_order, speaker:speaker_id (${SPEAKER_COLS})`)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: '항목 없음' }, { status: 404 })
  return NextResponse.json({ data })
}

// ── DELETE ────────────────────────────────────────────────────
export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 })

  const admin = createAdminClient()
  const { error } = await admin
    .from('featured_speakers')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
