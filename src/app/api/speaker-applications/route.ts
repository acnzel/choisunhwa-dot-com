/**
 * GET  /api/speaker-applications  — 목록 (어드민)
 * POST /api/speaker-applications  — 신청 (공개, 인증 불필요)
 */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

// ── GET (어드민) ──────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const status = searchParams.get('status') ?? 'pending'
  const limit  = parseInt(searchParams.get('limit') ?? '50', 10)
  const offset = parseInt(searchParams.get('offset') ?? '0', 10)

  const admin = createAdminClient()
  let q = admin
    .from('speaker_applications')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status !== 'all') q = q.eq('status', status)

  const { data, error, count } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data, meta: { total: count ?? 0, limit, offset } })
}

// ── POST (공개) ───────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, email, phone, title, company, fields,
          bio_short, bio_full, lecture_topics, career,
          education, photo_url, youtube_url, fee_range } = body

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: '이름과 이메일은 필수입니다' }, { status: 400 })
  }

  // 이메일 형식 검증
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: '이메일 형식이 올바르지 않습니다' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('speaker_applications')
    .insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone, title, company,
      fields: Array.isArray(fields) ? fields : [],
      bio_short, bio_full, lecture_topics,
      career, education, photo_url, youtube_url, fee_range,
      status: 'pending',
    })
    .select('id, name, email, status')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data, message: '신청이 완료되었습니다. 검토 후 연락드리겠습니다.' }, { status: 201 })
}
