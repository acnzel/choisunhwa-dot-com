import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import type { Speaker } from '@/types'
import { SPEAKER_FIELDS } from '@/constants'
import RevealOnScroll from '@/components/RevealOnScroll'
import SpeakerList from './SpeakerList'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '연사 라인업',
  description: '최선화닷컴이 직접 검증한 전문 강사들을 만나보세요.',
}

const PAGE_SIZE = 20

const FIELD_MAP: Record<string, string> = Object.fromEntries(
  SPEAKER_FIELDS.map((f) => [f.value, f.label])
)

interface SearchParams {
  page?: string
  field?: string
  q?: string
}

async function getSpeakers(params: SearchParams) {
  const supabase = await createClient()
  const page = Math.max(1, Number(params.page ?? 1))
  const field = params.field ?? 'all'
  const q = (params.q ?? '').trim()

  let query = supabase
    .from('speakers')
    .select('id, name, title, company, photo_url, fields, bio_short', { count: 'exact' })
    .eq('is_visible', true)
    .order('sort_order', { ascending: true })

  if (field !== 'all') {
    query = query.contains('fields', [field])
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
    <div className="page-max-wrap" style={{ paddingTop: 'var(--nav-height)', minHeight: '100dvh' }}>
      <RevealOnScroll />

      {/* ── 히어로 헤더 ── */}
      <section style={{
        padding: 'clamp(48px, 8vw, 80px) var(--space-page) clamp(32px, 5vw, 48px)',
        borderBottom: '1px solid var(--color-border)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* SPEAKER 워터마크 */}
        <div aria-hidden style={{
          position: 'absolute', top: '50%', right: '-1%',
          transform: 'translateY(-50%)',
          fontFamily: 'var(--font-english)',
          fontSize: 'clamp(72px, 13vw, 180px)',
          color: 'var(--color-border)',
          opacity: 0.55, zIndex: 0,
          pointerEvents: 'none', userSelect: 'none',
          lineHeight: 1, letterSpacing: '-0.02em', whiteSpace: 'nowrap',
        }}>SPEAKER</div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{
            fontSize: '11px', fontWeight: 500, letterSpacing: '0.14em',
            color: 'var(--color-muted)', marginBottom: '16px',
            textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <span style={{ display: 'block', width: '20px', height: '1px', background: 'var(--color-muted)' }} />
            Speaker Lineup
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: 'clamp(36px, 5vw, 72px)',
            letterSpacing: '-0.03em', lineHeight: 1.1,
          }}>
            연사 라인업
          </h1>
          <p style={{
            fontSize: '14px', fontWeight: 300, color: 'var(--color-subtle)',
            marginTop: '16px', lineHeight: 1.8, maxWidth: '480px',
          }}>
            이력과 현장 경험을 직접 확인한 강사만 등록됩니다.
          </p>
        </div>
      </section>

      {/* ── 강사 목록 (필터 + 검색 + 그리드 + 페이지네이션) ── */}
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
