import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import type { Insight } from '@/types'

const TYPE_LABEL: Record<string, string> = {
  issue:  '인사이트',
  report: '현장 스토리',
  pick:   '에디터 픽',
}
const STATUS_LABEL: Record<string, string> = {
  draft:     '임시저장',
  pending:   '발행 대기',
  published: '발행됨',
}
const STATUS_COLOR: Record<string, string> = {
  draft:     '#9ca3af',
  pending:   '#f59e0b',
  published: '#10b981',
}

type TypeFilter = 'all' | 'issue' | 'report' | 'pick'
type SortField = 'status' | 'home_featured' | 'created_at'
type SortDir = 'asc' | 'desc'

const PAGE_SIZE = 20
const SORTABLE_FIELDS: SortField[] = ['status', 'home_featured', 'created_at']
const SORT_LABEL: Record<SortField, string> = {
  status: '상태', home_featured: '홈 노출', created_at: '등록일',
}

interface Params {
  type?: string
  page?: string
  sort?: string
  dir?: string
}

function buildUrl(params: { type?: TypeFilter; page?: number; sort?: SortField; dir?: SortDir }) {
  const sp = new URLSearchParams()
  if (params.type && params.type !== 'all') sp.set('type', params.type)
  if (params.page && params.page > 1) sp.set('page', String(params.page))
  if (params.sort && params.sort !== 'created_at') sp.set('sort', params.sort)
  if (params.dir && params.dir !== 'desc') sp.set('dir', params.dir)
  const qs = sp.toString()
  return qs ? `/mong-bab/insights?${qs}` : '/mong-bab/insights'
}

async function getInsights(type: TypeFilter, page: number, sort: SortField, dir: SortDir) {
  const admin = createAdminClient()
  let query = admin
    .from('insights')
    .select('id, type, title, status, home_featured, published_at, created_at', { count: 'exact' })
    .order(sort, { ascending: dir === 'asc' })

  if (type !== 'all') query = query.eq('type', type)

  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1
  const { data, count } = await query.range(from, to)

  return {
    items: (data as Insight[]) ?? [],
    total: count ?? 0,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE)),
  }
}

export default async function InsightsAdminPage({
  searchParams,
}: {
  searchParams: Promise<Params>
}) {
  const params = await searchParams
  const rawType = params.type ?? 'all'
  const currentType: TypeFilter =
    rawType === 'issue' || rawType === 'report' || rawType === 'pick' ? rawType : 'all'
  const currentPage = Math.max(1, Number(params.page ?? 1) || 1)
  const currentSort: SortField = SORTABLE_FIELDS.includes(params.sort as SortField)
    ? (params.sort as SortField)
    : 'created_at'
  const currentDir: SortDir = params.dir === 'asc' ? 'asc' : 'desc'

  const { items: insights, total, totalPages } = await getInsights(currentType, currentPage, currentSort, currentDir)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e' }}>인사이트 관리</h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
            인사이트 · 현장 스토리 · 에디터 픽
          </p>
        </div>
        <Link
          href="/mong-bab/insights/new"
          style={{
            padding: '8px 18px', background: '#1a1a2e', color: '#fff',
            borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none',
          }}
        >
          + 새 콘텐츠
        </Link>
      </div>

      {/* 필터 탭 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['all', 'issue', 'report', 'pick'] as const).map(t => (
          <Link key={t} href={buildUrl({ type: t, sort: currentSort, dir: currentDir })} style={{
            padding: '4px 14px', borderRadius: 20,
            background: t === currentType ? '#1a1a2e' : '#f3f4f6',
            color: t === currentType ? '#fff' : '#374151',
            fontSize: 12, fontWeight: 500, textDecoration: 'none',
          }}>
            {t === 'all' ? '전체' : TYPE_LABEL[t]}
          </Link>
        ))}
      </div>

      {insights.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 0',
          color: '#9ca3af', fontSize: 14,
        }}>
          {total === 0 && currentPage === 1 ? (
            <>
              아직 등록된 인사이트가 없습니다.<br />
              <Link href="/mong-bab/insights/new" style={{ color: '#1a1a2e', marginTop: 8, display: 'inline-block' }}>
                첫 콘텐츠 등록하기 →
              </Link>
            </>
          ) : (
            '해당 조건의 인사이트가 없습니다.'
          )}
        </div>
      ) : (
        <>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  {(['유형', '제목', 'status', 'home_featured', 'created_at', ''] as const).map(h => {
                    if (h === '유형' || h === '제목' || h === '') {
                      return (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>
                          {h === '' ? '' : h}
                        </th>
                      )
                    }
                    const field = h as SortField
                    const active = currentSort === field
                    const nextDir: SortDir = active && currentDir === 'desc' ? 'asc' : 'desc'
                    return (
                      <th key={field} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>
                        <Link
                          href={buildUrl({ type: currentType, sort: field, dir: nextDir })}
                          style={{ color: active ? '#1a1a2e' : '#374151', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        >
                          {SORT_LABEL[field]}
                          <span style={{ fontSize: 10, color: active ? '#1a1a2e' : '#d1d5db' }}>
                            {active ? (currentDir === 'desc' ? '▼' : '▲') : '▲▼'}
                          </span>
                        </Link>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {insights.map((item, idx) => (
                  <tr key={item.id} style={{ borderBottom: idx < insights.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                        background: item.type === 'issue' ? '#eff6ff' : item.type === 'report' ? '#f0fdf4' : '#fdf4ff',
                        color: item.type === 'issue' ? '#1d4ed8' : item.type === 'report' ? '#15803d' : '#7e22ce',
                      }}>
                        {TYPE_LABEL[item.type]}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 500, color: '#1a1a2e', maxWidth: 300 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.title}
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ color: STATUS_COLOR[item.status], fontWeight: 600, fontSize: 12 }}>
                        ● {STATUS_LABEL[item.status]}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      {item.home_featured ? '✅' : '—'}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#6b7280', fontSize: 12 }}>
                      {new Date(item.created_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <Link
                        href={`/mong-bab/insights/${item.id}/edit`}
                        style={{ color: '#1a1a2e', fontSize: 12, fontWeight: 600 }}
                      >
                        수정
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 20 }}>
              {currentPage > 1 ? (
                <Link href={buildUrl({ type: currentType, page: currentPage - 1, sort: currentSort, dir: currentDir })}
                  style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #e5e7eb', color: '#374151', fontSize: 12, textDecoration: 'none' }}>
                  이전
                </Link>
              ) : (
                <span style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #f3f4f6', color: '#d1d5db', fontSize: 12 }}>이전</span>
              )}
              <span style={{ fontSize: 12, color: '#6b7280', padding: '0 8px' }}>
                {currentPage} / {totalPages} · 총 {total}건
              </span>
              {currentPage < totalPages ? (
                <Link href={buildUrl({ type: currentType, page: currentPage + 1, sort: currentSort, dir: currentDir })}
                  style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #e5e7eb', color: '#374151', fontSize: 12, textDecoration: 'none' }}>
                  다음
                </Link>
              ) : (
                <span style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #f3f4f6', color: '#d1d5db', fontSize: 12 }}>다음</span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
