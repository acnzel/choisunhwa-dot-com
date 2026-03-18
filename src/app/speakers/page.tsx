import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import type { Speaker } from '@/types'
import { buildFieldMap, getFieldWithAliases } from '@/constants'
import SpeakerList from './SpeakerList'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '강사 소개',
  description: '최선화닷컴의 검증된 전문 강사들을 만나보세요.',
}

const PAGE_SIZE = 20
const FIELD_MAP = buildFieldMap()

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
    <div className="min-h-screen">
      {/* 페이지 헤더 */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-bold text-[#1a1a2e]">강사 소개</h1>
          <p className="mt-2 text-gray-500 text-sm">
            최선화닷컴이 직접 검증한 전문 강사들을 만나보세요.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
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
