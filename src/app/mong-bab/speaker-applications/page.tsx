import { createAdminClient } from '@/lib/supabase/admin'
import { AdminListHeader, FilterBar, Pagination, StatTiles } from '@/components/admin/AdminList'
import { ADMIN_PAGE_SIZE, buildListHref, parsePage, sanitizeSearch } from '@/lib/admin-list'
import ApplicationList from './ApplicationList'
import { APPLICATION_STATUS, type Application, type ApplicationStatus } from './status'

const BASE_PATH = '/mong-bab/speaker-applications'
const STATUSES = Object.keys(APPLICATION_STATUS) as ApplicationStatus[]

interface Params {
  status?: string
  q?: string
  page?: string
}

function searchFilter(q: string) {
  const like = `%${q}%`
  return `name.ilike.${like},company.ilike.${like},email.ilike.${like}`
}

// 건수는 검색어를 반영한다 (검색 결과가 상태별로 몇 건인지 보이도록)
async function getStatusCounts(q: string) {
  const admin = createAdminClient()
  const results = await Promise.all(
    STATUSES.map((s) => {
      const query = admin.from('speaker_applications').select('id', { count: 'exact', head: true }).eq('status', s)
      return q ? query.or(searchFilter(q)) : query
    }),
  )
  const counts = Object.fromEntries(STATUSES.map((s, i) => [s, results[i].count ?? 0])) as Record<ApplicationStatus, number>
  return { counts, total: Object.values(counts).reduce((a, b) => a + b, 0) }
}

async function getApplications(status: ApplicationStatus | 'all', q: string, page: number) {
  const admin = createAdminClient()
  let query = admin
    .from('speaker_applications')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (status !== 'all') query = query.eq('status', status)
  if (q) query = query.or(searchFilter(q))

  const from = (page - 1) * ADMIN_PAGE_SIZE
  const { data, count } = await query.range(from, from + ADMIN_PAGE_SIZE - 1)
  return {
    items: (data as Application[]) ?? [],
    totalPages: Math.max(1, Math.ceil((count ?? 0) / ADMIN_PAGE_SIZE)),
  }
}

export default async function SpeakerApplicationsPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams
  // 처리할 일이 먼저 보이도록 기본 필터는 검토 대기
  const status: ApplicationStatus | 'all' =
    params.status === 'all' ? 'all' : STATUSES.includes(params.status as ApplicationStatus) ? (params.status as ApplicationStatus) : 'pending'
  const q = sanitizeSearch(params.q)
  const page = parsePage(params.page)

  const [{ counts, total }, { items, totalPages }] = await Promise.all([
    getStatusCounts(q),
    getApplications(status, q, page),
  ])

  // pending 이 기본값이라 '전체'는 URL 에 status=all 로 명시한다
  const href = (s: ApplicationStatus | 'all', p?: number) =>
    s === 'pending'
      ? buildListHref(BASE_PATH, { q, page: p })
      : `${BASE_PATH}?${new URLSearchParams({ status: s, ...(q ? { q } : {}), ...(p && p > 1 ? { page: String(p) } : {}) })}`

  const tiles = [
    ...STATUSES.map((s) => ({
      label: APPLICATION_STATUS[s].label,
      value: counts[s],
      href: href(s),
      active: status === s,
      highlight: s === 'pending',
    })),
    { label: '전체', value: total, href: href('all'), active: status === 'all' },
  ]

  return (
    <div className="p-6">
      <AdminListHeader title="강사 신청 검토" count={total} />
      <p className="text-xs text-gray-400 -mt-4 mb-6">승인하면 강사 DB에 비공개(is_visible=false)로 등록됩니다.</p>

      <StatTiles tiles={tiles} />

      <FilterBar
        action={BASE_PATH}
        q={q}
        hidden={status !== 'pending' ? { status } : {}}
        placeholder="이름·소속·이메일 검색"
      />

      <ApplicationList
        items={items}
        emptyText={q ? '조건에 맞는 신청서가 없습니다.' : status === 'pending' ? '검토 대기 신청서가 없습니다.' : '해당 항목이 없습니다.'}
      />

      <Pagination page={page} totalPages={totalPages} hrefFor={(p) => href(status, p)} />
    </div>
  )
}
