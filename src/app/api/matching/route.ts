import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/matching
 * 강사 매칭 추천 API
 *
 * Query params:
 *   fields  — 분야 (comma-separated): leadership,motivation,...
 *   topics  — 강연 주제 키워드 (comma-separated)
 *   targets — 강연 대상 키워드 (comma-separated)
 *
 * Response: { data: ScoredSpeaker[], total: number }
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const fields = searchParams.get('fields')?.split(',').filter(Boolean) ?? []
  const topics = searchParams.get('topics')?.split(',').filter(Boolean) ?? []
  const targets = searchParams.get('targets')?.split(',').filter(Boolean) ?? []

  if (fields.length === 0 && topics.length === 0 && targets.length === 0) {
    return NextResponse.json(
      { error: '검색 조건을 1개 이상 선택해주세요' },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()

  // 공개 강사 전체 조회 (매칭 점수 계산을 위해 전체 데이터 필요)
  const { data: speakers, error } = await supabase
    .from('speakers')
    .select('id, name, title, company, photo_url, bio_short, bio_full, fields, careers, sort_order, is_visible')
    .eq('is_visible', true)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!speakers || speakers.length === 0) {
    return NextResponse.json({ data: [], total: 0 })
  }

  // ─── 점수 계산 ─────────────────────────────────────────
  type ScoredSpeaker = typeof speakers[0] & {
    score: number
    match_reasons: string[]
  }

  const scored: ScoredSpeaker[] = speakers.map((sp) => {
    let score = 0
    const reasons: string[] = []
    const spFields: string[] = Array.isArray(sp.fields) ? sp.fields : []
    const spCareers: Array<{ content: string }> = Array.isArray(sp.careers) ? sp.careers : []

    // 분야 매칭: +3점/개
    fields.forEach((f) => {
      if (spFields.includes(f)) {
        score += 3
        reasons.push(`분야 일치: ${fieldLabel(f)}`)
      }
    })

    // 주제 키워드: careers + bio_full 에서 검색 → +2점/개
    const bioText = [
      sp.bio_full ?? '',
      sp.bio_short ?? '',
      ...spCareers.map((c) => c.content),
    ]
      .join(' ')
      .toLowerCase()

    topics.forEach((topic) => {
      if (bioText.includes(topic.toLowerCase())) {
        score += 2
        reasons.push(`주제 관련: ${topic}`)
      }
    })

    // 대상 키워드: fields + bio 에서 검색 → +1점/개
    const fullText = bioText + ' ' + spFields.join(' ')
    targets.forEach((target) => {
      if (fullText.includes(target.toLowerCase())) {
        score += 1
        reasons.push(`대상 관련: ${target}`)
      }
    })

    return { ...sp, score, match_reasons: reasons }
  })

  // 점수 내림차순 → 동점 시 sort_order 오름차순
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return (a.sort_order ?? 99) - (b.sort_order ?? 99)
  })

  // 점수 0점은 제외, 최대 6명 반환
  const results = scored.filter((s) => s.score > 0).slice(0, 6)

  // 점수 없으면 best 강사 fallback (sort_order 상위 6명)
  const fallback = results.length === 0
  const finalResults = fallback
    ? scored.slice(0, 6).map((s) => ({
        ...s,
        match_reasons: ['추천 강사'],
      }))
    : results

  // ─── 매칭 세션 로그 저장 (실패해도 응답엔 영향 없음) ──────
  supabase
    .from('matching_sessions')
    .insert({
      step1_fields: fields,
      step2_topics: topics,
      step3_targets: targets,
      result_count: finalResults.length,
    })
    .then(({ error: logErr }) => {
      if (logErr) console.error('[matching_sessions log]', logErr.message)
    })

  return NextResponse.json({
    data: finalResults.map((s) => ({
      id: s.id,
      name: s.name,
      title: s.title,
      company: s.company,
      photo_url: s.photo_url,
      bio_short: s.bio_short,
      fields: s.fields,
      match_reasons: s.match_reasons,
      score: s.score,
    })),
    total: finalResults.length,
    fallback,
  })
}

// ─── 분야 레이블 ─────────────────────────────────────────
function fieldLabel(field: string): string {
  const map: Record<string, string> = {
    leadership: '리더십',
    motivation: '동기부여',
    marketing: '마케팅',
    org_culture: '조직문화',
    ai_tech: 'AI/기술',
    communication: '소통/커뮤니케이션',
    sales: '영업',
    self_development: '자기계발/심리',
    hr: '인사/교육',
    finance: '재무/경영전략',
  }
  return map[field] ?? field
}
