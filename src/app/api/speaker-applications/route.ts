/**
 * GET  /api/speaker-applications   — 어드민 전용: 신청 목록
 * POST /api/speaker-applications   — 공개: 강사 등록 신청 제출
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// ── GET — 어드민 목록 (인증 필요) ─────────────────────────────
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const status = searchParams.get('status') ?? 'pending'
  const limit  = parseInt(searchParams.get('limit') ?? '50', 10)
  const offset = parseInt(searchParams.get('offset') ?? '0', 10)

  const admin = createAdminClient()
  const query = admin
    .from('speaker_applications')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status !== 'all') query.eq('status', status)

  const { data, count, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data, total: count ?? 0, limit, offset })
}

// ── POST — 공개 신청 제출 ────────────────────────────────────
export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    name, email, title, company, fields = [],
    bio_short, bio_full, lecture_topics, career, education,
    photo_url, youtube_url, fee_range,
  } = body

  if (!name || name.length < 2)  return NextResponse.json({ error: '이름을 입력해주세요' }, { status: 400 })
  if (!email || !email.includes('@')) return NextResponse.json({ error: '이메일 형식이 올바르지 않습니다' }, { status: 400 })
  if (!title)    return NextResponse.json({ error: '직함을 입력해주세요' }, { status: 400 })
  if (!company)  return NextResponse.json({ error: '소속을 입력해주세요' }, { status: 400 })
  if (!bio_short) return NextResponse.json({ error: '강사 소개를 입력해주세요' }, { status: 400 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('speaker_applications')
    .insert({
      name, email, title, company, fields,
      bio_short, bio_full: bio_full || null,
      lecture_topics: lecture_topics || null,
      career: career || null,
      education: education || null,
      photo_url: photo_url || null,
      youtube_url: youtube_url || null,
      fee_range: fee_range || null,
      status: 'pending',
    })
    .select('id, name, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data, message: '신청이 접수되었습니다' }, { status: 201 })
}
