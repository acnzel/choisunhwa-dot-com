import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/matching
 * 강사 매칭 추천 API
 *
 * Query params:
 *   fields  — 분야 (comma-separated): leadership,motivation,...
 *   topics  — 강연 주제 키워드 (comma-separated)
 *   targets — 강연 대상 키워드 (comma-separated): executive,manager,junior,...
 *
 * Response:
 *   { data: Speaker[], match_reasons: string[][], fallback: boolean }
 */

// 대상 → 관련 분야 매핑
const TARGET_FIELD_MAP: Record<string, string[]> = {
  executive:   ['leadership', 'finance', 'org_culture'],   // 임원/경영진
  manager:     ['leadership', 'communication', 'hr'],       // 팀장/중간관리자
  all_staff:   ['motivation', 'communication', 'org_culture'],
  junior:      ['motivation', 'self_development', 'communication'], // 신입/주니어
  sales_team:  ['sales', 'marketing', 'communication'],
  public:      ['leadership', 'hr', 'self_development'],    // 공공기관/공무원
  youth:       ['motivation', 'self_development', 'ai_tech'],
  // 한국어 직접 입력도 지원
  '임원':      ['leadership', 'finance', 'org_culture'],
  '경영진':    ['leadership', 'finance'],
  '팀장':      ['leadership', 'communication', 'hr'],
  '중간관리자': ['leadership', 'communication'],
  '신입':      ['motivation', 'self_development'],
  '주니어':    ['motivation', 'self_development'],
  '전체직원':  ['motivation', 'communication', 'org_culture'],
  '영업팀':    ['sales', 'marketing'],
  '마케팅팀':  ['marketing', 'communication'],
}

function getTargetFields(targets: string[]): string[] {
  const result = new Set<string>()
  targets.forEach((t) => {
    const mapped = TARGET_FIELD_MAP[t] ?? []
    mapped.forEach((f) => result.add(f))
  })
  return Array.from(result)
}

function fieldLabel(field: string): string {
  const map: Record<string, string> = {
    leadership:       '리더십',
    motivation:       '동기부여',
    marketing:        '마케팅',
    org_culture:      '조직문화',
    ai_tech:          'AI/기술',
    communication:    '소통/커뮤니케이션',
    sales:            '영업',
    self_development: '자기계발/심리',
    hr:               '인사/교육',
    finance:          '재무/경영전략',
  }
  return map[field] ?? field
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const fields  = searchParams.get('fields')?.split(',').filter(Boolean)  ?? []
  const topics  = searchParams.get('topics')?.split(',').filter(Boolean)  ?? []
  const targets = searchParams.get('targets')?.split(',').filter(Boolean) ?? []

  if (fields.length === 0 && topics.length === 0 && targets.length === 0) {
    return NextResponse.json(
      { error: '검색 조건을 1개 이상 선택해주세요' },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()

  const { data: speakers, error } = await supabase
    .from('speakers')
    .select('id, name, title, company, photo_url, bio_short, bio_full, fields, careers, sort_order, is_visible')
    .eq('is_visible', true)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!speakers || speakers.length === 0) {
    return NextResponse.json({ data: [], match_reasons: [], fallback: false })
  }

  // target → 관련 fields 변환
  const targetFields = getTargetFields(targets)

  // ─── 점수 계산 ─────────────────────────────────────────
  const scored = speakers.map((sp) => {
    let score = 0
    const reasons: string[] = []
    const spFields: string[] = Array.isArray(sp.fields) ? sp.fields : []
    const spCareers: Array<{ content: string }> = Array.isArray(sp.careers) ? sp.careers : []

    // ① 분야 매칭: query fields ∩ speaker fields → +3점/개
    fields.forEach((f) => {
      if (spFields.includes(f)) {
        score += 3
        reasons.push(`${fieldLabel(f)} 전문 강사`)
      }
    })

    // ② 주제 키워드: careers + bio_full 텍스트 매칭 → +2점/개
    const bioText = [
      sp.bio_full ?? '',
      sp.bio_short ?? '',
      ...spCareers.map((c) => c.content),
    ].join(' ').toLowerCase()

    topics.forEach((topic) => {
      if (bioText.includes(topic.toLowerCase())) {
        score += 2
        reasons.push(`"${topic}" 관련 강연 경험`)
      }
    })

    // ③ 대상 기반 분야 매핑 → +1점/개
    targetFields.forEach((tf) => {
      if (spFields.includes(tf)) {
        score += 1
        reasons.push(`대상 맞춤: ${fieldLabel(tf)}`)
      }
    })

    return { sp, score, reasons }
  })

  // 점수 내림차순 → 동점 시 sort_order 오름차순
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return (a.sp.sort_order ?? 99) - (b.sp.sort_order ?? 99)
  })

  // 점수 > 0인 것만, 최대 6명
  const matched = scored.filter((s) => s.score > 0).slice(0, 6)

  // fallback: 매칭 결과 없으면 sort_order 상위 6명
  const fallback = matched.length === 0
  const finalList = fallback
    ? scored.slice(0, 6).map((s) => ({ ...s, reasons: ['추천 강사'] }))
    : matched

  // ─── Response 구성 ────────────────────────────────────
  const data = finalList.map(({ sp }) => ({
    id:        sp.id,
    name:      sp.name,
    title:     sp.title,
    company:   sp.company,
    photo_url: sp.photo_url,
    bio_short: sp.bio_short,
    fields:    sp.fields,
  }))

  // match_reasons: data와 같은 인덱스로 대응하는 string[] 배열
  const match_reasons = finalList.map(({ reasons }) =>
    [...new Set(reasons)] // 중복 제거
  )

  // ─── 매칭 세션 로그 저장 ─────────────────────────────
  supabase
    .from('matching_sessions')
    .insert({
      step1_fields:  fields,
      step2_topics:  topics,
      step3_targets: targets,
      result_count:  finalList.length,
    })
    .then(({ error: logErr }) => {
      if (logErr) console.error('[matching_sessions log]', logErr.message)
    })

  return NextResponse.json({ data, match_reasons, fallback })
}
