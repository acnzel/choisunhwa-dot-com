import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import PendingList from './PendingList'
import ManualTrigger from './ManualTrigger'
import { PENDING_BRIEFING } from '@/lib/trend-briefing/pending'
import { AdminListHeader, FilterBar, Pagination } from '@/components/admin/AdminList'
import { ADMIN_PAGE_SIZE, buildListHref, parsePage, sanitizeSearch } from '@/lib/admin-list'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '트렌드 브리핑 관리 | 어드민',
}

const BASE_PATH = '/mong-bab/trend-briefing/pending'

async function getPending(q: string, page: number) {
  const supabase = createAdminClient()
  let query = supabase
    .from('insights')
    .select('id, title, summary, source_name, source_url, created_at, meta', { count: 'exact' })
    .match(PENDING_BRIEFING)
    .order('created_at', { ascending: false })
  if (q) query = query.ilike('title', `%${q}%`)

  const from = (page - 1) * ADMIN_PAGE_SIZE
  const { data, count } = await query.range(from, from + ADMIN_PAGE_SIZE - 1)
  return {
    items: data ?? [],
    total: count ?? 0,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / ADMIN_PAGE_SIZE)),
  }
}

export default async function TrendBriefingPendingPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  const params = await searchParams
  const q = sanitizeSearch(params.q)
  const page = parsePage(params.page)
  const { items, total, totalPages } = await getPending(q, page)

  return (
    <div className="p-6">
      <AdminListHeader
        title="트렌드 브리핑 관리"
        count={total}
        unit="건 대기"
        action={
          <div className="flex gap-2">
            <ManualTrigger />
            <Link
              href="/mong-bab/insights"
              className="px-4 py-2 text-sm font-medium bg-[#1a1a2e] text-white rounded-xl hover:bg-[#16213e] transition-colors"
            >
              전체 인사이트 →
            </Link>
          </div>
        }
      />
      <p className="text-xs text-gray-400 -mt-4 mb-6">자동 수집된 인사이트를 검토한 뒤 게시합니다.</p>

      <FilterBar action={BASE_PATH} q={q} placeholder="제목 검색" />

      {/* 목록 상태를 클라이언트가 들고 있으므로 검색·페이지가 바뀌면 새로 마운트한다 */}
      <PendingList key={`${q}:${page}`} items={items} />

      <Pagination page={page} totalPages={totalPages} hrefFor={(p) => buildListHref(BASE_PATH, { q, page: p })} />
    </div>
  )
}
