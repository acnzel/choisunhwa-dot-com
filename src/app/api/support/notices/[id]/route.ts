import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/support/notices/:id
 * 공지사항 상세 + 이전/다음 공지
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: notice, error } = await supabase
    .from('notices')
    .select('*')
    .eq('id', id)
    .eq('is_visible', true)
    .lte('published_at', new Date().toISOString())
    .single()

  if (error || !notice) {
    return NextResponse.json({ error: '공지사항을 찾을 수 없습니다' }, { status: 404 })
  }

  // 이전 공지
  const { data: prev } = await supabase
    .from('notices')
    .select('id, title')
    .eq('is_visible', true)
    .lt('published_at', notice.published_at)
    .order('published_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // 다음 공지
  const { data: next } = await supabase
    .from('notices')
    .select('id, title')
    .eq('is_visible', true)
    .gt('published_at', notice.published_at)
    .order('published_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  return NextResponse.json({
    data: { ...notice, prev: prev ?? null, next: next ?? null },
  })
}
