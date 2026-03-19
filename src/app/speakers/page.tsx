import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import type { Speaker } from '@/types'
import { buildFieldMap, getFieldWithAliases, FIELD_ALIASES } from '@/constants'
import SpeakerList from './SpeakerList'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '강사 라인업',
  description: '최선화닷컴의 검증된 전문 강사들을 만나보세요.',
}

const PAGE_SIZE = 25
const FIELD_MAP = buildFieldMap()

interface SearchParams {
  page?: string
  field?: string
  category?: string
  q?: string
}

async function getSpeakers(params: SearchParams) {
  const supabase = await createClient()
  const page = Math.max(1, Number(params.page ?? 1))
  const rawField = params.field ?? params.category ?? 'all'
  const field = rawField !== 'all' ? (FIELD_ALIASES[rawField] ?? rawField) : 'all'
  const q = (params.q ?? '').trim()

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

export default async function SpeakersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const { speakers, total, page, totalPages, field, q } = await getSpeakers(params)

  return (
    <div style={{ minHeight: '100vh', background: '#F7F3EE', paddingTop: 'var(--nav-height)' }}>

      {/* ── 페이지 헤더 ── */}
      <div style={{
        background: '#EDE6DC',
        borderBottom: '1px solid #DDD5C8',
        padding: '52px clamp(20px, 4vw, 48px) 40px',
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
