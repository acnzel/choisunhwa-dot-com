import type { Metadata } from 'next'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { seasonTriggersFor } from '@/lib/newsletter/seasons'
import TriggerPicker from './TriggerPicker'
import { AdminListHeader, FilterBar, Pagination, StatTiles, StatusBadge } from '@/components/admin/AdminList'
import { ADMIN_PAGE_SIZE, buildListHref, parsePage, sanitizeSearch } from '@/lib/admin-list'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '이슈 뉴스레터 | 어드민',
}

const RECENT_DAYS = 14
const BASE_PATH = '/mong-bab/newsletter'

// 초안 상태는 저장값이 아니라 '한 마디(comment)' 입력 여부로 정한다. comment 는 NOT NULL DEFAULT ''.
type DraftStatus = 'need' | 'ready'
const DRAFT_STATUS: Record<DraftStatus, { label: string; tone: 'yellow' | 'green' }> = {
  need: { label: '한 마디 필요', tone: 'yellow' },
  ready: { label: '내보내기 가능', tone: 'green' },
}

function draftsQuery(columns: string, head: boolean, status: DraftStatus | 'all', q: string) {
  let query = createAdminClient().from('newsletter_drafts').select(columns, { count: 'exact', head })
  if (status === 'need') query = query.eq('comment', '')
  if (status === 'ready') query = query.neq('comment', '')
  if (q) query = query.or(`trigger_title.ilike.%${q}%,content->>subject.ilike.%${q}%`)
  return query
}

interface DraftRow {
  id: string
  trigger_title: string
  content: { subject?: string } | null
  comment: string
  created_at: string
}

async function getData(status: DraftStatus | 'all', q: string, page: number) {
  const supabase = createAdminClient()
  const since = new Date(Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000).toISOString()
  const from = (page - 1) * ADMIN_PAGE_SIZE
  const [articles, drafts, need, ready] = await Promise.all([
    supabase
      .from('insights')
      .select('id, title, summary, source_name, created_at, meta')
      .eq('auto_generated', true)
      .gte('created_at', since)
      .order('created_at', { ascending: false }),
    draftsQuery('id, trigger_title, content, comment, created_at', false, status, q)
      .order('created_at', { ascending: false })
      .range(from, from + ADMIN_PAGE_SIZE - 1),
    draftsQuery('id', true, 'need', q),
    draftsQuery('id', true, 'ready', q),
  ])
  return {
    articles: articles.data ?? [],
    drafts: (drafts.data as unknown as DraftRow[]) ?? [],
    totalPages: Math.max(1, Math.ceil((drafts.count ?? 0) / ADMIN_PAGE_SIZE)),
    counts: { need: need.count ?? 0, ready: ready.count ?? 0 },
  }
}

export default async function NewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>
}) {
  const params = await searchParams
  const status: DraftStatus | 'all' = params.status === 'need' || params.status === 'ready' ? params.status : 'all'
  const q = sanitizeSearch(params.q)
  const page = parsePage(params.page)

  const { articles, drafts, totalPages, counts } = await getData(status, q, page)
  const total = counts.need + counts.ready
  const month = Number(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Seoul', month: 'numeric' }).format(new Date()))
  const seasons = seasonTriggersFor(month).map(({ key, title, description }) => ({ key, title, description }))

  const tiles = [
    { label: '전체 초안', value: total, href: buildListHref(BASE_PATH, { q }), active: status === 'all' },
    ...(['need', 'ready'] as const).map((s) => ({
      label: DRAFT_STATUS[s].label,
      value: counts[s],
      href: buildListHref(BASE_PATH, { status: s, q }),
      active: status === s,
      highlight: s === 'need',
    })),
  ]

  return (
    <div className="p-6">
      <AdminListHeader title="이슈 뉴스레터" count={total} unit="건" />
      <p className="text-xs text-gray-400 -mt-4 mb-6">
        이슈 하나를 고르면 강사 3명의 실제 강의를 이어 붙인 3부 프로그램 초안을 만듭니다.
      </p>

      <StatTiles tiles={tiles} />

      <FilterBar
        action={BASE_PATH}
        q={q}
        hidden={status !== 'all' ? { status } : {}}
        placeholder="제목·이슈 검색"
      />

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {drafts.length === 0 ? (
          <p className="text-center py-12 text-sm text-gray-400">
            {q || status !== 'all' ? '조건에 맞는 초안이 없습니다.' : '아직 만든 초안이 없습니다. 아래에서 이슈를 골라 만들어 보세요.'}
          </p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {drafts.map((d) => {
              const meta = DRAFT_STATUS[d.comment ? 'ready' : 'need']
              return (
                <li key={d.id}>
                  <Link
                    href={`${BASE_PATH}/${d.id}`}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-blue-50/60 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{d.content?.subject}</p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{d.trigger_title}</p>
                    </div>
                    <StatusBadge label={meta.label} tone={meta.tone} />
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {new Date(d.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} hrefFor={(p) => buildListHref(BASE_PATH, { status, q, page: p })} />

      <section className="mt-10 max-w-3xl">
        <h2 className="text-lg font-bold text-[#1a1a2e] mb-4">새 초안 만들기</h2>
        <TriggerPicker articles={articles} seasons={seasons} />
      </section>
    </div>
  )
}
