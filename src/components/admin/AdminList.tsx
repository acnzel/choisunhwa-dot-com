import Link from 'next/link'

// 어드민 목록 화면 공통 부품: 헤더 → 현황 타일 → 필터·검색 바 → 목록 → 페이지 나누기.
// 필터 상태는 전부 URL 로 표현하므로 서버 컴포넌트로 동작한다.

export type BadgeTone = 'blue' | 'yellow' | 'orange' | 'green' | 'gray' | 'red'

const TONE_CLASS: Record<BadgeTone, string> = {
  blue: 'bg-blue-100 text-blue-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  orange: 'bg-orange-100 text-orange-700',
  green: 'bg-green-100 text-green-700',
  gray: 'bg-gray-100 text-gray-600',
  red: 'bg-red-100 text-red-700',
}

export function StatusBadge({ label, tone = 'gray' }: { label: string; tone?: BadgeTone }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${TONE_CLASS[tone]}`}>
      {label}
    </span>
  )
}

export function AdminListHeader({
  title,
  count,
  unit = '건',
  action,
}: {
  title: string
  count: number
  unit?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-baseline gap-3">
        <h1 className="text-2xl font-bold text-[#1a1a2e]">{title}</h1>
        <span className="text-sm text-gray-400">
          총 {count}
          {unit}
        </span>
      </div>
      {action}
    </div>
  )
}

export interface StatTile {
  label: string
  value: number
  href: string
  active?: boolean
  /** 값이 0보다 크면 눈에 띄게 표시 (예: 처리 안 된 신규 건) */
  highlight?: boolean
}

export function StatTiles({ tiles }: { tiles: StatTile[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-none lg:grid-flow-col lg:auto-cols-fr gap-3 mb-4">
      {tiles.map((t) => (
        <Link
          key={t.label}
          href={t.href}
          className={`rounded-2xl border p-4 transition-colors ${
            t.active ? 'border-[#1a1a2e] bg-white' : 'border-gray-100 bg-white hover:border-gray-300'
          }`}
        >
          <p
            className={`text-2xl font-bold ${
              t.highlight && t.value > 0 ? 'text-blue-600' : 'text-[#1a1a2e]'
            }`}
          >
            {t.value}
          </p>
          <p className="text-xs text-gray-500 mt-1">{t.label}</p>
        </Link>
      ))}
    </div>
  )
}

export interface FilterTab {
  label: string
  href: string
  active: boolean
  count?: number
}

/**
 * 필터 탭 + 검색창. 검색은 GET 폼이라 JS 없이 동작하고,
 * hidden 으로 넘긴 파라미터(현재 상태 등)는 검색 후에도 유지된다.
 * 상태 필터를 현황 타일이 맡는 화면은 tabs 를 비워 둔다.
 */
export function FilterBar({
  tabs = [],
  secondaryTabs = [],
  action,
  q,
  hidden = {},
  placeholder = '검색',
}: {
  tabs?: FilterTab[]
  /** 두 번째 기준의 필터(예: 출처). 테두리만 있는 탭으로 구분해 보여 준다. */
  secondaryTabs?: FilterTab[]
  action: string
  q: string
  hidden?: Record<string, string>
  placeholder?: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-3 mb-4 flex flex-col md:flex-row md:items-center gap-3">
      {tabs.length > 0 && (
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Link
            key={t.label}
            href={t.href}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              t.active
                ? 'bg-[#1a1a2e] text-white border-transparent font-semibold'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
            }`}
          >
            {t.label}
            {t.count != null && <span className="ml-1 opacity-70">{t.count}</span>}
          </Link>
        ))}
      </div>
      )}
      {secondaryTabs.length > 0 && (
        <div className="flex flex-wrap gap-2 md:border-l md:border-gray-100 md:pl-3">
          {secondaryTabs.map((t) => (
            <Link
              key={t.label}
              href={t.href}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                t.active
                  ? 'border-[#1a1a2e] text-[#1a1a2e] font-semibold'
                  : 'border-gray-200 text-gray-500 hover:border-gray-400'
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
      )}
      <form action={action} className="md:ml-auto">
        {Object.entries(hidden).map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder={placeholder}
          aria-label={placeholder}
          className="w-full md:w-64 border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
        />
      </form>
    </div>
  )
}

export function Pagination({
  page,
  totalPages,
  hrefFor,
}: {
  page: number
  totalPages: number
  hrefFor: (page: number) => string
}) {
  if (totalPages <= 1) return null
  const linkClass = 'px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:border-gray-400'
  const disabledClass = 'px-3 py-1.5 rounded-lg border border-gray-100 text-xs text-gray-300'
  return (
    <div className="flex items-center justify-center gap-3 mt-4">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={linkClass}>
          이전
        </Link>
      ) : (
        <span className={disabledClass}>이전</span>
      )}
      <span className="text-xs text-gray-500">
        {page} / {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className={linkClass}>
          다음
        </Link>
      ) : (
        <span className={disabledClass}>다음</span>
      )}
    </div>
  )
}
