import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import type { Speaker } from '@/types'
import { buildFieldMap, getFieldWithAliases, FIELD_ALIASES } from '@/constants'
import SpeakerList from './SpeakerList'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '강사 소개',
  description: '최선화닷컴의 검증된 전문 강사들을 만나보세요.',
}

const PAGE_SIZE = 25
const FIELD_MAP = buildFieldMap()

interface SearchParams {
  page?: string
  field?: string
  category?: string  // 인사이트 태그 링크용 alias (/speakers?category=리더십)
  q?: string
}

async function getSpeakers(params: SearchParams) {
  const supabase = await createClient()
  const page = Math.max(1, Number(params.page ?? 1))
  // category는 field의 alias — 인사이트 태그 클릭 시 사용
  // FIELD_ALIASES로 resolve: 예) category=AI → IT, 번아웃 → 심리
  const rawField = params.field ?? params.category ?? 'all'
  const field = rawField !== 'all' ? (FIELD_ALIASES[rawField] ?? rawField) : 'all'
  const q = (params.q ?? '').trim()

  let query = supabase
    .from('speakers')
    .select('id, name, title, company, photo_url, fields, bio_short', { count: 'exact' })
    .eq('is_visible', true)
    .order('sort_order', { ascending: true })

  if (field !== 'all') {
    // overlaps: 별칭 포함 (예: 'HR' 필터 시 '성과관리', '조직관리'도 매치)
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

      {/* ── 페이지 헤더 (딥그린) ── */}
      <div style={{
        background: '#1E3A2F',
        padding: 'clamp(28px, 4vw, 44px) clamp(20px, 5vw, 60px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '3px', color: '#1D4229', textTransform: 'uppercase', marginBottom: 8 }}>
            Speaker Lineup · 2026
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display, serif)',
            fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: 900,
            color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.15,
          }}>
            강사 라인업
          </h1>
        </div>
        <div style={{
          fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 900,
          color: 'rgba(255,255,255,0.07)', letterSpacing: '-3px', lineHeight: 1,
          whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          {total.toLocaleString()}
        </div>
      </div>

      {/* ── 콘텐츠 ── */}
      <div style={{ padding: 'clamp(24px, 3vw, 40px) clamp(20px, 5vw, 60px) 80px' }}>
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
    </div>
  )
}
