import { createAdminClient } from '@/lib/supabase/admin'
import type { Inquiry, InquiryStatus } from '@/types'
import { INQUIRY_STATUSES, INQUIRY_TYPES } from '@/constants'
import ClickableRow from '@/components/admin/ClickableRow'
import { AdminListHeader, FilterBar, Pagination, StatTiles, StatusBadge } from '@/components/admin/AdminList'
import { ADMIN_PAGE_SIZE, buildListHref, daysSince, parsePage, sanitizeSearch } from '@/lib/admin-list'

const BASE_PATH = '/mong-bab/inquiries'
// 신규 상태로 이 일수 이상 남아 있으면 목록에서 경과일을 강조한다
const STALE_DAYS = 2

type ListRow = Pick<Inquiry, 'id' | 'type' | 'name' | 'company' | 'phone' | 'status' | 'content' | 'created_at'>

interface Params {
  status?: string
  q?: string
  page?: string
}

async function getStatusCounts() {
  const supabase = createAdminClient()
  const results = await Promise.all(
    INQUIRY_STATUSES.map((s) =>
      supabase.from('inquiries').select('id', { count: 'exact', head: true }).eq('status', s.value),
    ),
  )
  const counts = Object.fromEntries(INQUIRY_STATUSES.map((s, i) => [s.value, results[i].count ?? 0]))
  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  return { counts: counts as Record<InquiryStatus, number>, total }
}

async function getInquiries(status: InquiryStatus | 'all', q: string, page: number) {
  const supabase = createAdminClient()
  let query = supabase
    .from('inquiries')
    .select('id, type, name, company, phone, status, content, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (status !== 'all') query = query.eq('status', status)
  if (q) {
    const like = `%${q}%`
    query = query.or(`name.ilike.${like},company.ilike.${like},email.ilike.${like},content.ilike.${like}`)
  }

  const from = (page - 1) * ADMIN_PAGE_SIZE
  const { data, count } = await query.range(from, from + ADMIN_PAGE_SIZE - 1)
  return {
    items: (data as ListRow[]) ?? [],
    totalPages: Math.max(1, Math.ceil((count ?? 0) / ADMIN_PAGE_SIZE)),
  }
}

export default async function AdminInquiriesPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams
  const status: InquiryStatus | 'all' = INQUIRY_STATUSES.some((s) => s.value === params.status)
    ? (params.status as InquiryStatus)
    : 'all'
  const q = sanitizeSearch(params.q)
  const page = parsePage(params.page)

  const [{ counts, total }, { items, totalPages }] = await Promise.all([
    getStatusCounts(),
    getInquiries(status, q, page),
  ])

  const typeMap = Object.fromEntries(INQUIRY_TYPES.map((t) => [t.value, t.label]))
  const statusMeta = Object.fromEntries(INQUIRY_STATUSES.map((s) => [s.value, s]))

  const tiles = [
    { label: '전체', value: total, href: buildListHref(BASE_PATH, { q }), active: status === 'all' },
    ...INQUIRY_STATUSES.map((s) => ({
      label: s.label,
      value: counts[s.value],
      href: buildListHref(BASE_PATH, { status: s.value, q }),
      active: status === s.value,
      highlight: s.value === 'new',
    })),
  ]

  return (
    <div className="p-6">
      <AdminListHeader title="문의 관리" count={total} />

      <StatTiles tiles={tiles} />

      <FilterBar
        action={BASE_PATH}
        q={q}
        hidden={status !== 'all' ? { status } : {}}
        placeholder="이름·소속·이메일·내용 검색"
      />

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">유형</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">이름 · 내용</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">소속</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">연락처</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">상태</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">접수일</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    {q || status !== 'all' ? '조건에 맞는 문의가 없습니다.' : '접수된 문의가 없습니다.'}
                  </td>
                </tr>
              ) : (
                items.map((inquiry) => {
                  const meta = statusMeta[inquiry.status]
                  const elapsed = inquiry.status === 'new' ? daysSince(inquiry.created_at) : 0
                  return (
                    <ClickableRow key={inquiry.id} href={`${BASE_PATH}/${inquiry.id}`}>
                      <td className="px-4 py-3 whitespace-nowrap align-top">
                        <StatusBadge label={typeMap[inquiry.type] ?? inquiry.type} />
                      </td>
                      <td className="px-4 py-3 max-w-md align-top">
                        <p className="font-medium text-gray-800">{inquiry.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{inquiry.content?.split('\n')[0]}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-500 align-top">{inquiry.company}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap align-top">{inquiry.phone}</td>
                      <td className="px-4 py-3 whitespace-nowrap align-top">
                        <StatusBadge label={meta?.label ?? inquiry.status} tone={meta?.color} />
                        {elapsed >= STALE_DAYS && (
                          <span className="ml-1.5 text-xs font-medium text-red-600">{elapsed}일 경과</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-xs align-top">
                        {inquiry.created_at ? new Date(inquiry.created_at).toLocaleDateString('ko-KR') : '-'}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span className="text-xs text-[#1a1a2e]">→ 상세</span>
                      </td>
                    </ClickableRow>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        hrefFor={(p) => buildListHref(BASE_PATH, { status, q, page: p })}
      />
    </div>
  )
}
