'use client'

import { useState, useMemo } from 'react'
import type { Lecture, Speaker } from '@/types'
import ClickableRow from '@/components/admin/ClickableRow'

type LectureWithSpeaker = Lecture & { speaker: Pick<Speaker, 'name'> }
type VisibilityFilter = 'all' | 'visible' | 'hidden'

interface Props {
  lectures: LectureWithSpeaker[]
  fieldMap: Record<string, string>
  durationMap: Record<string, string>
}

export default function LectureFilterTable({ lectures, fieldMap, durationMap }: Props) {
  const [search, setSearch]       = useState('')
  const [visFilter, setVisFilter] = useState<VisibilityFilter>('all')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return lectures.filter((l) => {
      const matchSearch =
        !q ||
        l.title.toLowerCase().includes(q) ||
        (l.speaker?.name ?? '').toLowerCase().includes(q)

      const matchVis =
        visFilter === 'all' ||
        (visFilter === 'visible' && l.is_visible) ||
        (visFilter === 'hidden' && !l.is_visible)

      return matchSearch && matchVis
    })
  }, [lectures, search, visFilter])

  const isFiltered = !!search || visFilter !== 'all'

  return (
    <>
      {/* ── 검색 + 필터 툴바 ── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 space-y-3">
        {/* 검색창 */}
        <div className="relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="강연 제목 또는 강사 이름으로 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a1a2e] focus:ring-2 focus:ring-[#1a1a2e]/8 bg-gray-50 placeholder:text-gray-300 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-500 text-xs transition-colors"
              aria-label="검색어 지우기"
            >
              ✕
            </button>
          )}
        </div>

        {/* 필터 행 */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mr-1">공개</span>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              {(['all', 'visible', 'hidden'] as const).map((v, idx) => (
                <button
                  key={v}
                  onClick={() => setVisFilter(v)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${idx > 0 ? 'border-l border-gray-200' : ''} ${
                    visFilter === v
                      ? 'bg-[#1a1a2e] text-white'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {v === 'all' ? '전체' : v === 'visible' ? '공개' : '비공개'}
                </button>
              ))}
            </div>
          </div>

          {isFiltered && (
            <button
              onClick={() => { setSearch(''); setVisFilter('all') }}
              className="ml-auto text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
            >
              필터 초기화
            </button>
          )}
        </div>
      </div>

      {/* ── 결과 수 ── */}
      <p className="text-xs text-gray-400 mb-3 px-1">
        {filtered.length === lectures.length
          ? `전체 ${lectures.length}건`
          : `${filtered.length}건 검색됨 / 전체 ${lectures.length}건`}
      </p>

      {/* ── 테이블 ── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500">강연명</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">강사</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">분야</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">시간</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 w-20">공개</th>
                <th className="px-4 py-3 w-16" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    {isFiltered ? '검색 결과가 없습니다.' : '등록된 강연이 없습니다.'}
                  </td>
                </tr>
              ) : (
                filtered.map((l) => (
                  <ClickableRow key={l.id} href={`/mong-bab/lectures/${l.id}`}>
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-xs">
                      <p className="line-clamp-1">{l.title}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{l.speaker?.name ?? '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {l.fields.slice(0, 2).map((f) => (
                          <span key={f} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
                            {fieldMap[f] ?? f}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{durationMap[l.duration] ?? l.duration}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        l.is_visible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {l.is_visible ? '공개' : '비공개'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-[#1a1a2e]">→ 편집</span>
                    </td>
                  </ClickableRow>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
