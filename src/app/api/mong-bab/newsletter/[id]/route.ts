import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { NewsletterContent } from '@/lib/newsletter/generate'

// 미들웨어에서 admin 인증 완료 후 도달 — 별도 인증 불필요

// PATCH: 초안 수정. 글(제목·요약·각 부 주제와 연결 이유)과 최선화의 한 마디만 바꾼다.
// 강사와 강의 제목은 생성 시 검증한 값을 유지한다 (실제 강의 목록에 있는 값이어야 하므로).
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json().catch(() => null)
  const edit = body?.content as Partial<NewsletterContent> | undefined
  if (!body || typeof body.comment !== 'string' || !edit || typeof edit !== 'object') {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: current, error: readError } = await admin
    .from('newsletter_drafts')
    .select('content')
    .eq('id', id)
    .single()
  if (readError || !current) return NextResponse.json({ error: '초안을 찾을 수 없습니다.' }, { status: 404 })

  const prev = current.content as NewsletterContent
  const str = (v: unknown, fallback: string) => (typeof v === 'string' ? v : fallback)
  const content: NewsletterContent = {
    subject: str(edit.subject, prev.subject),
    issue_summary: Array.isArray(edit.issue_summary) ? edit.issue_summary.map(String) : prev.issue_summary,
    why_now: str(edit.why_now, prev.why_now),
    program_title: str(edit.program_title, prev.program_title),
    target: str(edit.target, prev.target),
    format: str(edit.format, prev.format),
    modules: prev.modules.map((m, i) => ({
      ...m,
      theme: str(edit.modules?.[i]?.theme, m.theme),
      connection: str(edit.modules?.[i]?.connection, m.connection),
    })),
  }

  const { error } = await admin
    .from('newsletter_drafts')
    .update({ content, comment: body.comment, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// DELETE: 삭제
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const admin = createAdminClient()

  const { error } = await admin.from('newsletter_drafts').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
