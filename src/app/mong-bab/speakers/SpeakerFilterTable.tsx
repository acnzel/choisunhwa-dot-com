'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Speaker } from '@/types'
import ToggleVisible from './ToggleVisible'
import ToggleBest from './ToggleBest'
import ToggleTrending from './ToggleTrending'
import ToggleFeatured from './ToggleFeatured'
import ClickableRow from '@/components/admin/ClickableRow'

interface Props {
  speakers: Speaker[]
  fieldMap: Record<string, string>
}

type VisibilityFilter = 'all' | 'visible' | 'hidden'
type BestFilter = 'all' | 'best' | 'normal'
type TrendFilter = 'all' | 'trending' | 'normal'

const ADMIN_PAGE_SIZE = 50

export default function SpeakerFilterTable({ speakers, fieldMap }: Props) {
  const [search, setSearch] = useState('')
  const [visFilter, setVisFilter] = useState<VisibilityFilter>('all')
  const [bestFilter, setBestFilter] = useState<BestFilter>('all')
  const [trendFilter, setTrendFilter] = useState<TrendFilter>('all')
  const [featuredIds, setFeaturedIds] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)

  // 에디터 픽 목록 로드
  const loadFeatured = useCallback(async () => {
    try {
      const res = await fetch('/api/featured-speakers?all=true&limit=100')
      const json = await res.json()
      const ids = (json.data ?? []).map((f: { speaker?: { id: string } }) => f.speaker?.id).filter(Boolean)
      setFeaturedIds(new Set(ids))
    } catch { /* 무시 */ }
  }, [])

  useEffect(() => { loadFeatured() }, [loadFeatured])

  function handleFeaturedToggle(speakerId: string, newValue: boolean) {
    setFeaturedIds(prev => {
      const next = new Set(prev)
      if (newValue) next.add(speakerId)
      else next.delete(speakerId)
      return next
    })
  }

  const filtered = useMemo(() => {
    setCurrentPage(1)
    const q = search.trim().toLowerCase()
    return speakers.filter((s) => {
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        (s.company ?? '').toLowerCase().includes(q) ||
        (s.title ?? '').toLowerCase().includes(q)

      const matchVis =
        visFilter === 'all' ||
        (visFilter === 'visible' && s.is_visible) ||
        (visFilter === 'hidden' && !s.is_visible)

      const matchBest =
        bestFilter === 'all' ||
        (bestFilter === 'best' && s.is_best) ||
        (bestFilter === 'normal' && !s.is_best)

      const spTrending = (s as Speaker & { is_trending?: boolean }).is_trending
      const matchTrend =
        trendFilter === 'all' ||
        (trendFilter === 'trending' && spTrending) ||
        (trendFilter === 'normal' && !spTrending)

      return matchSearch && matchVis && matchBest && matchTrend
    })
  }, [speakers, search, visFilter, bestFilter, trendFilter])

  const totalPages = Math.ceil(filtered.length / ADMIN_PAGE_SIZE)
  const paginated = filtered.slice(
    (currentPage - 1) * ADMIN_PAGE_SIZE,
    currentPage * ADMIN_PAGE_SIZE,
  )

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
            placeholder="이름, 소속, 직함으로 검색"
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
          {/* 공개 여부 */}
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

          {/* BEST */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mr-1">BEST</span>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              {(['all', 'best', 'normal'] as const).map((v, idx) => (
                <button
                  key={v}
                  onClick={() => setBestFilter(v)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${idx > 0 ? 'border-l border-gray-200' : ''} ${
                    bestFilter === v
                      ? 'bg-[#1a1a2e] text-white'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {v === 'all' ? '전체' : v === 'best' ? 'BEST만' : '일반'}
                </button>
              ))}
            </div>
          </div>

          {/* 지금 뜨는 */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mr-1">🔥지금뜨는</span>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              {(['all', 'trending', 'normal'] as const).map((v, idx) => (
                <button
                  key={v}
                  onClick={() => setTrendFilter(v)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${idx > 0 ? 'border-l border-gray-200' : ''} ${
                    trendFilter === v
                      ? 'bg-orange-600 text-white'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {v === 'all' ? '전체' : v === 'trending' ? '뜨는중' : '일반'}
                </button>
              ))}
            </div>
          </div>

          {/* 리셋 버튼 — 필터 활성화 시에만 노출 */}
          {(search || visFilter !== 'all' || bestFilter !== 'all' || trendFilter !== 'all') && (
            <button
              onClick={() => { setSearch(''); setVisFilter('all'); setBestFilter('all'); setTrendFilter('all') }}
              className="ml-auto text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
            >
              필터 초기화
            </button>
          )}
        </div>
      </div>

      {/* ── 결과 수 ── */}
      <p className="text-xs text-gray-400 mb-3 px-1">
        {filtered.length === speakers.length
          ? `전체 ${speakers.length}명`
          : `${filtered.length}명 검색됨 / 전체 ${speakers.length}명`}
        {totalPages > 1 && (
          <span className="ml-2 text-gray-300">
            ({(currentPage - 1) * ADMIN_PAGE_SIZE + 1}–{Math.min(currentPage * ADMIN_PAGE_SIZE, filtered.length)})
          </span>
        )}
      </p>

      {/* ── 테이블 ── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500">강사</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">분야</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 w-20">공개</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500 w-16">BEST</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500 w-16">🔥뜨는</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500 w-16">⭐에디터픽</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 w-20">순서</th>
                <th className="px-4 py-3 w-16" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    {search || visFilter !== 'all' || bestFilter !== 'all'
                      ? '검색 결과가 없습니다.'
                      : '등록된 강사가 없습니다.'}
                  </td>
                </tr>
              ) : (
                paginated.map((s) => (
                  <ClickableRow key={s.id} href={`/mong-bab/speakers/${s.id}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-9 h-9 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                          {s.photo_url ? (
                            <Image src={s.photo_url} alt={s.name} fill className="object-cover" sizes="36px" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-xs font-bold">
                              {s.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{s.name}</p>
                          <p className="text-xs text-gray-400">{s.title}{s.company ? ` · ${s.company}` : ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {s.fields.filter(f => !f.startsWith('~') && fieldMap[f]).slice(0, 2).map((f) => (
                          <span key={f} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
                            {fieldMap[f]}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <ToggleVisible speakerId={s.id} isVisible={s.is_visible} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ToggleBest speakerId={s.id} isBest={s.is_best ?? false} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ToggleTrending speakerId={s.id} isTrending={(s as Speaker & { is_trending?: boolean }).is_trending ?? false} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ToggleFeatured
                        speakerId={s.id}
                        isFeatured={featuredIds.has(s.id)}
                        onToggle={handleFeaturedToggle}
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-center">{s.sort_order}</td>
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

      {/* ── 페이지네이션 ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-5">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >‹</button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
            .reduce<(number | '…')[]>((acc, p, i, arr) => {
              if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('…')
              acc.push(p)
              return acc
            }, [])
            .map((p, i) =>
              p === '…' ? (
                <span key={`e${i}`} className="w-8 h-8 flex items-center justify-center text-gray-300 text-sm">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p as number)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    currentPage === p
                      ? 'bg-[#1a1a2e] text-white'
                      : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              )
            )}

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >›</button>
        </div>
      )}
    </>
  )
}
