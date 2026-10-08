import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import type { Speaker } from '@/types'
import { buildFieldMap, getFieldWithAliases, FIELD_ALIASES } from '@/constants'
import SpeakerList from './SpeakerList'
import { pageMeta, NOINDEX } from '@/lib/seo'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 20
const FIELD_MAP = buildFieldMap()

interface SearchParams {
  page?: string
  field?: string
  category?: string
  q?: string
}

// 목록 조회와 메타데이터(canonical)가 같은 해석을 쓰도록 한 곳에서 파싱한다
function parseSpeakerParams(params: SearchParams) {
  const page = Math.max(1, Number(params.page ?? 1) || 1)
  const rawField = params.field ?? params.category ?? 'all'
  const field = rawField !== 'all' ? (FIELD_ALIASES[rawField] ?? rawField) : 'all'
  const q = (params.q ?? '').trim()
  return { page, field, q }
}

async function getSpeakers(params: SearchParams) {
  const supabase = await createClient()
  const { page, field, q } = parseSpeakerParams(params)

  let query = supabase
    .from('speakers')
    .select('id, name, title, company, photo_url, fields, bio_short', { count: 'exact' })
    .eq('is_visible', true)
    .order('sort_order', { ascending: true })

  if (field !== 'all') {
    query = query.overlaps('fields', getFieldWithAliases(field))
  }
  if (q) {
    query = query.or(
      `name.ilike.%${q}%,bio_short.ilike.%${q}%,company.ilike.%${q}%,title.ilike.%${q}%`
    )
  }

  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1
  const { data, count } = await query.range(from, to)

  return {
    speakers: (data as Speaker[]) ?? [],
    total: count ?? 0,
    page,
    totalPages: Math.ceil((count ?? 0) / PAGE_SIZE),
    field,
    q,
  }
}

// 분야 필터는 주제별 랜딩으로 색인하고, 검색어(q) 결과는 noindex 로 둔다.
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}): Promise<Metadata> {
  const { page, field, q } = parseSpeakerParams(await searchParams)
  const fieldLabel = field !== 'all' ? FIELD_MAP[field] : undefined

  const query = new URLSearchParams()
  if (fieldLabel) query.set('field', field)
  if (page > 1) query.set('page', String(page))
  const qs = query.toString()
  const path = qs ? `/speakers?${qs}` : '/speakers'

  const title = fieldLabel ? `${fieldLabel} 분야 강사` : '강사 라인업'
  const description = fieldLabel
    ? `최선화닷컴에서 ${fieldLabel} 분야 강연이 가능한 검증된 강사를 찾아보세요. 기업 교육·특강·세미나 강사 섭외를 도와드립니다.`
    : '최선화닷컴의 검증된 전문 강사 라인업. 리더십, 조직문화, 경제, IT, 심리 등 분야별로 기업 교육·특강 강사를 찾아보세요.'

  return {
    ...pageMeta({ title: page > 1 ? `${title} (${page}페이지)` : title, description, path }),
    ...(q ? NOINDEX : {}),
  }
}

export default async function SpeakersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const { speakers, total, page, totalPages, field, q } = await getSpeakers(params)

  return (
    <div style={{ minHeight: '100vh', background: '#F7F3EE' }}>

      {/* ── 페이지 헤더 — paddingTop으로 nav 높이 처리 (흰 띠 방지) ── */}
      <div style={{
        background: '#EDE6DC',
        borderBottom: '1px solid #DDD5C8',
        padding: 'calc(var(--nav-height) + 36px) clamp(20px, 4vw, 48px) 40px',
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <p style={{
            fontSize: 12, fontWeight: 600, letterSpacing: '2px',
            color: '#9C8570', textTransform: 'uppercase', marginBottom: 10,
          }}>
            Speaker Lineup
          </p>
          <h1 style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(26px, 3.5vw, 34px)', fontWeight: 800,
            color: '#1F1007', letterSpacing: '-1px', marginBottom: 8,
          }}>
            강사 라인업
          </h1>
          <p style={{ fontSize: 15, color: '#7A6A5A', fontWeight: 400 }}>
            검증된 전문 강사진과 최선화닷컴을 통해 연결하세요
          </p>
          <div style={{ display: 'flex', gap: 32, marginTop: 24 }}>
            {[
              { num: total.toLocaleString(), label: '등록 강사' },
              { num: String(Object.keys(FIELD_MAP).length), label: '강연 분야' },
              { num: '1,200+', label: '누적 강연' },
            ].map(({ num, label }) => (
              <div key={label}>
                <div style={{
                  fontSize: 'clamp(20px, 2.2vw, 26px)', fontWeight: 800,
                  color: '#2C6B5A', letterSpacing: '-1px',
                }}>
                  {num}
                </div>
                <div style={{ fontSize: 12, color: '#9C8570', fontWeight: 500, marginTop: 2 }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SpeakerList (검색바 + 본문 포함) ── */}
      <SpeakerList
        speakers={speakers}
        total={total}
        page={page}
        totalPages={totalPages}
        pageSize={PAGE_SIZE}
        currentField={field}
        currentQ={q}
        fieldMap={FIELD_MAP}
      />
    </div>
  )
}
