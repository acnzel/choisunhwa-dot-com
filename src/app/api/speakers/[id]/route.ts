import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/speakers/:id
 * 강사 상세 정보 (강연 목록, 후기 포함)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: speaker, error } = await supabase
    .from('speakers')
    .select('*')
    .eq('id', id)
    .eq('is_visible', true)
    .single()

  if (error || !speaker) {
    return NextResponse.json({ error: '강사를 찾을 수 없습니다' }, { status: 404 })
  }

  // 해당 강사의 공개 강연 목록
  const { data: lectures } = await supabase
    .from('lectures')
    .select('id, title, fields, duration, target, summary, thumbnail_url')
    .eq('speaker_id', id)
    .eq('is_visible', true)

  // 공개 후기
  const { data: reviews } = await supabase
    .from('speaker_reviews')
    .select('id, company, rating, content, reviewed_at')
    .eq('speaker_id', id)
    .eq('is_visible', true)
    .order('sort_order', { ascending: true })

  return NextResponse.json({
    data: {
      ...speaker,
      lectures: lectures ?? [],
      reviews: reviews ?? [],
    },
  })
}
