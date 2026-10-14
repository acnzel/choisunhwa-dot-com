import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import type { Faq, Notice } from '@/types'
import { AdminListHeader, FilterBar, Pagination, StatTiles, StatusBadge } from '@/components/admin/AdminList'
import { ADMIN_PAGE_SIZE, parsePage, sanitizeSearch } from '@/lib/admin-list'

const BASE_PATH = '/mong-bab/support'

type Tab = 'faq' | 'notice'
type Visibility = 'all' | 'visible' | 'hidden'

interface UrlState {
  tab: Tab
  visibility: Visibility
  q: string
  page?: number
}

function buildUrl(s: UrlState) {
  const sp = new URLSearchParams()
  if (s.tab !== 'faq') sp.set('tab', s.tab)
  if (s.visibility !== 'all') sp.set('visibility', s.visibility)
  if (s.q) sp.set('q', s.q)
  if (s.page && s.page > 1) sp.set('page', String(s.page))
  const qs = sp.toString()
  return qs ? `${BASE_PATH}?${qs}` : BASE_PATH
}

// FAQ 는 질문, 공지는 제목으로 검색한다
const SEARCH_COLUMN: Record<Tab, string> = { faq: 'question', notice: 'title' }
const TABLE: Record<Tab, 'faqs' | 'notices'> = { faq: 'faqs', notice: 'notices' }

function countQuery(tab: Tab, q: string, visible?: boolean) {
  let query = createAdminClient().from(TABLE[tab]).select('id', { count: 'exact', head: true })
  if (visible !== undefined) query = query.eq('is_visible', visible)
  if (q) query = query.ilike(SEARCH_COLUMN[tab], `%${q}%`)
  return query
}

async function getData(s: UrlState & { page: number }) {
  const supabase = createAdminClient()
  const from = (s.page - 1) * ADMIN_PAGE_SIZE
  const to = from + ADMIN_PAGE_SIZE - 1

  let list =
    s.tab === 'faq'
      ? supabase
          .from('faqs')
          .select('*, category:faq_categories(name)', { count: 'exact' })
          .order('sort_order', { ascending: true })
      : supabase
          .from('notices')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
  if (s.visibility !== 'all') list = list.eq('is_visible', s.visibility === 'visible')
  if (s.q) list = list.ilike(SEARCH_COLUMN[s.tab], `%${s.q}%`)

  const [rows, faqTotal, noticeTotal, visible, hidden] = await Promise.all([
    list.range(from, to),
    countQuery('faq', ''),
    countQuery('notice', ''),
    countQuery(s.tab, s.q, true),
    countQuery(s.tab, s.q, false),
  ])

  return {
    rows: rows.data ?? [],
    totalPages: Math.max(1, Math.ceil((rows.count ?? 0) / ADMIN_PAGE_SIZE)),
    tabCounts: { faq: faqTotal.count ?? 0, notice: noticeTotal.count ?? 0 },
    visibilityCounts: { visible: visible.count ?? 0, hidden: hidden.count ?? 0 },
  }
}

export default async function AdminSupportPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; visibility?: string; q?: string; page?: string }>
}) {
  const params = await searchParams
  const state: UrlState & { page: number } = {
    tab: params.tab === 'notice' ? 'notice' : 'faq',
    visibility: params.visibility === 'visible' || params.visibility === 'hidden' ? params.visibility : 'all',
    q: sanitizeSearch(params.q),
    page: parsePage(params.page),
  }
  const link = (patch: Partial<UrlState>) => buildUrl({ ...state, page: undefined, ...patch })

  const { rows, totalPages, tabCounts, visibilityCounts } = await getData(state)
  const isFaq = state.tab === 'faq'

  const tiles = [
    { label: '전체', value: visibilityCounts.visible + visibilityCounts.hidden, href: link({ visibility: 'all' }), active: state.visibility === 'all' },
    { label: '공개', value: visibilityCounts.visible, href: link({ visibility: 'visible' }), active: state.visibility === 'visible' },
    { label: '비공개', value: visibilityCounts.hidden, href: link({ visibility: 'hidden' }), active: state.visibility === 'hidden' },
  ]

  const hidden: Record<string, string> = {}
  if (state.tab !== 'faq') hidden.tab = state.tab
  if (state.visibility !== 'all') hidden.visibility = state.visibility

  return (
    <div className="p-6">
      <AdminListHeader
        title="FAQ & 공지사항 관리"
        count={tabCounts.faq + tabCounts.notice}
        action={
          <Link
            href={isFaq ? '/mong-bab/support/faq/new' : '/mong-bab/support/notice/new'}
            className="px-4 py-2 bg-[#1a1a2e] text-white text-sm font-medium rounded-xl hover:bg-[#16213e] transition-colors"
          >
            {isFaq ? '+ FAQ 추가' : '+ 공지 추가'}
          </Link>
        }
      />

      <StatTiles tiles={tiles} />

      <FilterBar
        tabs={[
          { label: 'FAQ', href: buildUrl({ tab: 'faq', visibility: 'all', q: '' }), active: isFaq, count: tabCounts.faq },
          { label: '공지사항', href: buildUrl({ tab: 'notice', visibility: 'all', q: '' }), active: !isFaq, count: tabCounts.notice },
        ]}
        action={BASE_PATH}
        q={state.q}
        hidden={hidden}
        placeholder={isFaq ? '질문 검색' : '제목 검색'}
      />

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {rows.length === 0 ? (
          <p className="text-center py-12 text-sm text-gray-400">
            {state.q || state.visibility !== 'all'
              ? '조건에 맞는 항목이 없습니다.'
              : isFaq
                ? '등록된 FAQ가 없습니다.'
                : '등록된 공지사항이 없습니다.'}
          </p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {isFaq
              ? (rows as (Faq & { category: { name: string } | null })[]).map((faq) => (
                  <li key={faq.id}>
                    <Link
                      href={`/mong-bab/support/faq/${faq.id}`}
                      className="flex items-center gap-4 px-5 py-3 hover:bg-blue-50/60 transition-colors"
                    >
                      <p className="flex-1 min-w-0 text-sm text-gray-700 truncate">
                        <span className="text-xs text-gray-400 mr-2">[{faq.category?.name ?? '미분류'}]</span>
                        {faq.question}
                      </p>
                      <StatusBadge label={faq.is_visible ? '공개' : '비공개'} tone={faq.is_visible ? 'green' : 'gray'} />
                      <span className="text-xs text-[#1a1a2e] whitespace-nowrap">→ 편집</span>
                    </Link>
                  </li>
                ))
              : (rows as Notice[]).map((n) => (
                  <li key={n.id}>
                    <Link
                      href={`/mong-bab/support/notice/${n.id}`}
                      className="flex items-center gap-4 px-5 py-3 hover:bg-blue-50/60 transition-colors"
                    >
                      <p className="flex-1 min-w-0 text-sm text-gray-700 truncate">
                        {n.is_pinned && (
                          <span className="text-xs font-bold text-white bg-[#1a1a2e] px-1.5 py-0.5 rounded mr-2">공지</span>
                        )}
                        {n.title}
                      </p>
                      <StatusBadge label={n.is_visible ? '공개' : '비공개'} tone={n.is_visible ? 'green' : 'gray'} />
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {new Date(n.published_at).toLocaleDateString('ko-KR')}
                      </span>
                      <span className="text-xs text-[#1a1a2e] whitespace-nowrap">→ 편집</span>
                    </Link>
                  </li>
                ))}
          </ul>
        )}
      </div>

      <Pagination page={state.page} totalPages={totalPages} hrefFor={(p) => buildUrl({ ...state, page: p })} />
    </div>
  )
}
