'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Speaker } from '@/types'
import ToggleVisible from './ToggleVisible'
import ToggleBest from './ToggleBest'
import ClickableRow from '@/components/admin/ClickableRow'

const FIELD_MAP_PROP = 'fieldMap'

interface Props {
  speakers: Speaker[]
  fieldMap: Record<string, string>
}

type VisibilityFilter = 'all' | 'visible' | 'hidden'
type BestFilter = 'all' | 'best' | 'normal'

export default function SpeakerFilterTable({ speakers, fieldMap }: Props) {
  const [search, setSearch] = useState('')
  const [visFilter, setVisFilter] = useState<VisibilityFilter>('all')
  const [bestFilter, setBestFilter] = useState<BestFilter>('all')

  const filtered = useMemo(() => {
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

      return matchSearch && matchVis && matchBest
    })
  }, [speakers, search, visFilter, bestFilter])

  const filterBtnClass = (active: boolean) =>
    `px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
      active
        ? 'bg-[#1a1a2e] text-white'
        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
    }`

  return (
    <>
      {/* ── 검색 + 필터 바 ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* 검색창 */}
        <div className="relative flex-1 max-w-sm">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="이름, 소속, 직함 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-9 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a1a2e] bg-white"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
            >
              ✕
            </button>
          )}
        </div>

        {/* 공개 필터 */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400 mr-1">공개</span>
          <button className={filterBtnClass(visFilter === 'all')}    onClick={() => setVisFilter('all')}>전체</button>
          <button className={filterBtnClass(visFilter === 'visible')} onClick={() => setVisFilter('visible')}>공개</button>
          <button className={filterBtnClass(visFilter === 'hidden')}  onClick={() => setVisFilter('hidden')}>비공개</button>
        </div>

        {/* BEST 필터 */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400 mr-1">BEST</span>
          <button className={filterBtnClass(bestFilter === 'all')}    onClick={() => setBestFilter('all')}>전체</button>
          <button className={filterBtnClass(bestFilter === 'best')}   onClick={() => setBestFilter('best')}>BEST만</button>
          <button className={filterBtnClass(bestFilter === 'normal')} onClick={() => setBestFilter('normal')}>일반</button>
        </div>
      </div>

      {/* ── 결과 수 ── */}
      <p className="text-xs text-gray-400 mb-3">
        {filtered.length === speakers.length
          ? `전체 ${speakers.length}명`
          : `${filtered.length}명 / 전체 ${speakers.length}명`}
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
                <th className="text-left px-4 py-3 font-medium text-gray-500 w-20">순서</th>
                <th className="px-4 py-3 w-16" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    {search || visFilter !== 'all' || bestFilter !== 'all'
                      ? '검색 결과가 없습니다.'
                      : '등록된 강사가 없습니다.'}
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
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
                        {s.fields.slice(0, 2).map((f) => (
                          <span key={f} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
                            {fieldMap[f] ?? f}
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
    </>
  )
}
