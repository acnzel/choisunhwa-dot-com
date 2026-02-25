import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/lectures/:id
 * 강연 상세 (강사 정보, 관련 강연 포함)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: lecture, error } = await supabase
    .from('lectures')
    .select(
      `
      *,
      speakers(id, name, title, company, photo_url, bio_short, fields)
    `
    )
    .eq('id', id)
    .eq('is_visible', true)
    .single()

  if (error || !lecture) {
    return NextResponse.json({ error: '강연을 찾을 수 없습니다' }, { status: 404 })
  }

  // 같은 분야 관련 강연 (최대 4개, 본인 제외)
  const related = lecture.fields?.length > 0
    ? await supabase
        .from('lectures')
        .select('id, title, thumbnail_url, fields, duration, summary, speakers(id, name)')
        .eq('is_visible', true)
        .neq('id', id)
        .overlaps('fields', lecture.fields)
        .limit(4)
    : { data: [] }

  return NextResponse.json({
    data: {
      ...lecture,
      related_lectures: related.data ?? [],
    },
  })
}
