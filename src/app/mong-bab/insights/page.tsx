import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import type { Insight } from '@/types'
import { NOT_PENDING_BRIEFING } from '@/lib/trend-briefing/pending'
import ClickableRow from '@/components/admin/ClickableRow'
import { AdminListHeader, FilterBar, Pagination, StatTiles, StatusBadge, type BadgeTone } from '@/components/admin/AdminList'
import { ADMIN_PAGE_SIZE, parsePage, sanitizeSearch } from '@/lib/admin-list'

const BASE_PATH = '/mong-bab/insights'

const TYPE_META: Record<string, { label: string; tone: BadgeTone }> = {
  issue: { label: '인사이트', tone: 'blue' },
  report: { label: '현장 스토리', tone: 'green' },
  pick: { label: '에디터 픽', tone: 'orange' },
}
type InsightStatus = 'draft' | 'pending' | 'published'
const STATUS_META: Record<InsightStatus, { label: string; tone: BadgeTone }> = {
  draft: { label: '임시저장', tone: 'gray' },
  pending: { label: '발행 대기', tone: 'yellow' },
  published: { label: '발행됨', tone: 'green' },
}
const STATUSES = Object.keys(STATUS_META) as InsightStatus[]

type TypeFilter = 'all' | 'issue' | 'report' | 'pick'
// 자동 수집 검수 대기(draft)는 트렌드 브리핑 메뉴에서 처리하므로 이 화면에서는 항상 뺀다
type SourceFilter = 'all' | 'manual' | 'auto'
const SOURCE_LABEL: Record<SourceFilter, string> = {
  all: '전체 출처', manual: '직접 작성', auto: '자동 수집',
}
type SortField = 'status' | 'home_featured' | 'created_at'
type SortDir = 'asc' | 'desc'

const SORTABLE_FIELDS: SortField[] = ['status', 'home_featured', 'created_at']
const SORT_LABEL: Record<SortField, string> = {
  status: '상태', home_featured: '홈 노출', created_at: '등록일',
}

interface Params {
  type?: string
  source?: string
  status?: string
  q?: string
  page?: string
  sort?: string
  dir?: string
}

interface UrlState {
  type: TypeFilter
  source: SourceFilter
  status: InsightStatus | 'all'
  q: string
  page?: number
  sort: SortField
  dir: SortDir
}

function buildUrl(s: UrlState) {
  const sp = new URLSearchParams()
  if (s.type !== 'all') sp.set('type', s.type)
  if (s.source !== 'all') sp.set('source', s.source)
  if (s.status !== 'all') sp.set('status', s.status)
  if (s.q) sp.set('q', s.q)
  if (s.page && s.page > 1) sp.set('page', String(s.page))
  if (s.sort !== 'created_at') sp.set('sort', s.sort)
  if (s.dir !== 'desc') sp.set('dir', s.dir)
  const qs = sp.toString()
  return qs ? `${BASE_PATH}?${qs}` : BASE_PATH
}

// 유형·출처·검색 조건을 건 기본 쿼리. 목록과 상태별 건수가 같은 조건을 쓴다.
function baseQuery(columns: string, head: boolean, type: TypeFilter, source: SourceFilter, q: string) {
  let query = createAdminClient().from('insights').select(columns, { count: 'exact', head })
  if (type !== 'all') query = query.eq('type', type)
  if (source === 'manual') query = query.eq('auto_generated', false)
  else if (source === 'auto') query = query.eq('auto_generated', true).neq('status', 'draft')
  else query = query.or(NOT_PENDING_BRIEFING)
  if (q) query = query.ilike('title', `%${q}%`)
  return query
}

async function getStatusCounts(type: TypeFilter, source: SourceFilter, q: string) {
  const results = await Promise.all(STATUSES.map((s) => baseQuery('id', true, type, source, q).eq('status', s)))
  const counts = Object.fromEntries(STATUSES.map((s, i) => [s, results[i].count ?? 0])) as Record<InsightStatus, number>
  return { counts, total: Object.values(counts).reduce((a, b) => a + b, 0) }
}

async function getInsights(s: UrlState & { page: number }) {
  let query = baseQuery(
    'id, type, title, status, home_featured, auto_generated, published_at, created_at',
    false,
    s.type,
    s.source,
    s.q,
  )
  if (s.status !== 'all') query = query.eq('status', s.status)

  const from = (s.page - 1) * ADMIN_PAGE_SIZE
  const { data, count } = await query
    .order(s.sort, { ascending: s.dir === 'asc' })
    .range(from, from + ADMIN_PAGE_SIZE - 1)

  return {
    items: (data as unknown as Insight[]) ?? [],
    totalPages: Math.max(1, Math.ceil((count ?? 0) / ADMIN_PAGE_SIZE)),
  }
}

export default async function InsightsAdminPage({
  searchParams,
}: {
  searchParams: Promise<Params>
}) {
  const params = await searchParams
  const rawType = params.type ?? 'all'
  const state: UrlState & { page: number } = {
    type: rawType === 'issue' || rawType === 'report' || rawType === 'pick' ? rawType : 'all',
    source: params.source === 'manual' || params.source === 'auto' ? params.source : 'all',
    status: STATUSES.includes(params.status as InsightStatus) ? (params.status as InsightStatus) : 'all',
    q: sanitizeSearch(params.q),
    page: parsePage(params.page),
    sort: SORTABLE_FIELDS.includes(params.sort as SortField) ? (params.sort as SortField) : 'created_at',
    dir: params.dir === 'asc' ? 'asc' : 'desc',
  }
  // 필터를 바꾸면 1페이지로 돌아간다
  const link = (patch: Partial<UrlState>) => buildUrl({ ...state, page: undefined, ...patch })

  const [{ counts, total }, { items, totalPages }] = await Promise.all([
    getStatusCounts(state.type, state.source, state.q),
    getInsights(state),
  ])

  const tiles = [
    { label: '전체', value: total, href: link({ status: 'all' }), active: state.status === 'all' },
    ...STATUSES.map((s) => ({
      label: STATUS_META[s].label,
      value: counts[s],
      href: link({ status: s }),
      active: state.status === s,
    })),
  ]

  const hidden: Record<string, string> = {}
  if (state.type !== 'all') hidden.type = state.type
  if (state.source !== 'all') hidden.source = state.source
  if (state.status !== 'all') hidden.status = state.status
  if (state.sort !== 'created_at') hidden.sort = state.sort
  if (state.dir !== 'desc') hidden.dir = state.dir

  const filtered = state.q || state.type !== 'all' || state.source !== 'all' || state.status !== 'all'

  return (
    <div className="p-6">
      <AdminListHeader
        title="인사이트 관리"
        count={total}
        action={
          <Link
            href="/mong-bab/insights/new"
            className="px-4 py-2 bg-[#1a1a2e] text-white text-sm font-medium rounded-xl hover:bg-[#16213e] transition-colors"
          >
            + 새 콘텐츠
          </Link>
        }
      />

      <StatTiles tiles={tiles} />

      <FilterBar
        tabs={(['all', 'issue', 'report', 'pick'] as const).map((t) => ({
          label: t === 'all' ? '전체 유형' : TYPE_META[t].label,
          href: link({ type: t }),
          active: state.type === t,
        }))}
        secondaryTabs={(['all', 'manual', 'auto'] as const).map((src) => ({
          label: SOURCE_LABEL[src],
          href: link({ source: src }),
          active: state.source === src,
        }))}
        action={BASE_PATH}
        q={state.q}
        hidden={hidden}
        placeholder="제목 검색"
      />

      <p className="text-xs text-gray-400 mb-3 text-right">
        <Link href="/mong-bab/trend-briefing/pending" className="hover:text-gray-600">
          검수 대기 중인 자동 수집 기사는 트렌드 브리핑에서 처리합니다 →
        </Link>
      </p>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">유형</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">제목</th>
                {SORTABLE_FIELDS.map((field) => {
                  const active = state.sort === field
                  const nextDir: SortDir = active && state.dir === 'desc' ? 'asc' : 'desc'
                  return (
                    <th key={field} className="text-left px-4 py-3 font-medium whitespace-nowrap">
                      <Link
                        href={link({ sort: field, dir: nextDir })}
                        className={`inline-flex items-center gap-1 ${active ? 'text-[#1a1a2e]' : 'text-gray-500'}`}
                      >
                        {SORT_LABEL[field]}
                        <span className={`text-[10px] ${active ? 'text-[#1a1a2e]' : 'text-gray-300'}`}>
                          {active ? (state.dir === 'desc' ? '▼' : '▲') : '▲▼'}
                        </span>
                      </Link>
                    </th>
                  )
                })}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    {filtered || state.page > 1 ? (
                      '해당 조건의 인사이트가 없습니다.'
                    ) : (
                      <>
                        아직 등록된 인사이트가 없습니다.
                        <br />
                        <Link href="/mong-bab/insights/new" className="text-[#1a1a2e] mt-2 inline-block">
                          첫 콘텐츠 등록하기 →
                        </Link>
                      </>
                    )}
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const type = TYPE_META[item.type]
                  const status = STATUS_META[item.status as InsightStatus]
                  return (
                    <ClickableRow key={item.id} href={`${BASE_PATH}/${item.id}/edit`}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge label={type?.label ?? item.type} tone={type?.tone} />
                      </td>
                      <td className="px-4 py-3 max-w-md">
                        <p className="font-medium text-gray-800 truncate">
                          {item.auto_generated && (
                            <span className="mr-1.5 px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 text-[10px] font-semibold align-middle">
                              자동
                            </span>
                          )}
                          {item.title}
                        </p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge label={status?.label ?? item.status} tone={status?.tone} />
                      </td>
                      <td className="px-4 py-3 text-center text-gray-500">{item.home_featured ? '✅' : '—'}</td>
                      <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">
                        {new Date(item.created_at).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-[#1a1a2e]">→ 수정</span>
                      </td>
                    </ClickableRow>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={state.page} totalPages={totalPages} hrefFor={(p) => buildUrl({ ...state, page: p })} />
    </div>
  )
}
