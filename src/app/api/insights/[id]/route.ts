/**
 * GET    /api/insights/[id]  — 단건 조회
 * PATCH  /api/insights/[id]  — 수정 (어드민)
 * DELETE /api/insights/[id]  — 삭제 (어드민)
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

type Params = { params: Promise<{ id: string }> }

// ── GET ──────────────────────────────────────────────────────
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('insights')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: '인사이트를 찾을 수 없습니다' }, { status: 404 })
  }
  return NextResponse.json({ data })
}

// ── PATCH ────────────────────────────────────────────────────
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 })

  const body = await req.json()
  const admin = createAdminClient()

  // status → published 전환 시 published_at 자동 설정
  if (body.status === 'published' && !body.published_at) {
    body.published_at = new Date().toISOString()
  }

  const { data, error } = await admin
    .from('insights')
    .update(body)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// ── DELETE ───────────────────────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 })

  // report 타입은 images 삭제 시 Storage도 정리
  const admin = createAdminClient()
  const { data: existing } = await admin
    .from('insights')
    .select('type, meta, thumbnail_url')
    .eq('id', id)
    .single()

  if (existing) {
    const urlsToDelete: string[] = []
    if (existing.thumbnail_url) urlsToDelete.push(existing.thumbnail_url)
    if (existing.type === 'report') {
      const images = (existing.meta as { images?: { url: string }[] })?.images ?? []
      images.forEach(img => urlsToDelete.push(img.url))
    }
    // URL에서 Storage path 추출 후 삭제
    if (urlsToDelete.length > 0) {
      const paths = urlsToDelete
        .map(url => url.split('/storage/v1/object/public/insights/')[1])
        .filter(Boolean)
      if (paths.length > 0) {
        await admin.storage.from('insights').remove(paths)
      }
    }
  }

  const { error } = await admin.from('insights').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
