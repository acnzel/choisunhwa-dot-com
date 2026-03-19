'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Speaker } from '@/types'
import { SPEAKER_FIELDS } from '@/constants'

interface Props {
  speakers: Speaker[]
  total: number
  page: number
  totalPages: number
  pageSize: number
  currentField: string
  currentQ: string
  fieldMap: Record<string, string>
}

function buildUrl(params: { page?: number; field?: string; q?: string }) {
  const sp = new URLSearchParams()
  if (params.page && params.page > 1) sp.set('page', String(params.page))
  if (params.field && params.field !== 'all') sp.set('field', params.field)
  if (params.q) sp.set('q', params.q)
  const qs = sp.toString()
  return qs ? `/speakers?${qs}` : '/speakers'
}

// 현재 페이지 기준 최대 10개 페이지 번호 표시
function getPaginationRange(current: number, total: number): (number | '…')[] {
  if (total <= 10) return Array.from({ length: total }, (_, i) => i + 1)

  let start = Math.max(1, current - 4)
  let end = start + 9
  if (end > total) {
    end = total
    start = Math.max(1, end - 9)
  }

  const pages: (number | '…')[] = []
  if (start > 1) {
    pages.push(1)
    if (start > 2) pages.push('…')
  }
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < total) {
    if (end < total - 1) pages.push('…')
    pages.push(total)
  }
  return pages
}

export default function SpeakerList({
  speakers,
  total,
  page,
  totalPages,
  pageSize,
  currentField,
  currentQ,
  fieldMap,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [searchValue, setSearchValue] = useState(currentQ)

  // URL 변경(뒤로가기 등) 시 검색 입력값 동기화
  useEffect(() => {
    setSearchValue(currentQ)
  }, [currentQ])

  // 검색 디바운스 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== currentQ) {
        startTransition(() => {
          router.push(buildUrl({ field: currentField, q: searchValue, page: 1 }))
        })
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [searchValue]) // eslint-disable-line react-hooks/exhaustive-deps

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <div>
      {/* 필터 & 검색 */}
      <div className={`flex flex-col gap-3 mb-8 transition-opacity ${isPending ? 'opacity-50' : 'opacity-100'}`}>
        {/* 검색창 */}
        <div className="relative max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="강사명, 키워드 검색"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:border-[#1a1a2e] bg-white"
            aria-label="강사 검색"
          />
        </div>

        {/* 분야 필터 */}
        <div className="flex gap-2 flex-wrap">
          {[{ value: 'all', label: '전체' }, ...SPEAKER_FIELDS].map(({ value, label }) => (
            <Link
              key={value}
              href={buildUrl({ field: value, q: currentQ, page: 1 })}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                currentField === value
                  ? 'bg-[#1a1a2e] text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* 결과 카운트 */}
      <p className="text-sm text-gray-500 mb-5">
        총 <span className="font-semibold text-[#1a1a2e]">{total.toLocaleString()}</span>명의 강사
        {total > 0 && (
          <span className="text-gray-400 text-xs ml-2">({from}–{to}번째 표시)</span>
        )}
        {isPending && <span className="text-gray-400 text-xs ml-3">검색 중…</span>}
      </p>

      {/* 카드 그리드 */}
      {speakers.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-sm">해당 조건의 강사가 없습니다.</p>
          <p className="text-gray-400 text-sm mt-1">
            직접{' '}
            <Link href="/inquiry/lecture" className="text-[#1a1a2e] underline underline-offset-2">
              강사 섭외를 문의
            </Link>
            해보세요.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {speakers.map((speaker) => {
            const fields = (speaker.fields ?? []).filter(f => !f.startsWith('~') && fieldMap[f])
            const subText = [speaker.title, speaker.company].filter(Boolean).join(' · ')
            return (
              <Link
                key={speaker.id}
                href={`/speakers/${speaker.id}`}
                className="group bg-white border border-[#ede9e3] hover:border-[#1D4229] hover:shadow-md transition-all overflow-hidden"
                style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
              >
                {/* 사진 — 정사각형 */}
                <div style={{
                  position: 'relative',
                  aspectRatio: '1 / 1',
                  overflow: 'hidden',
                  background: '#f0ede8',
                }}>
                  {speaker.photo_url ? (
                    <Image
                      src={speaker.photo_url}
                      alt={speaker.name}
                      fill
                      style={{ objectFit: 'cover', objectPosition: 'top center' }}
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* 딥그린 액센트 */}
                <div style={{ height: 3, background: '#1D4229' }} />

                {/* 텍스트 */}
                <div style={{ padding: '12px 13px 14px' }}>
                  {/* 이름 */}
                  <div style={{
                    fontFamily: 'var(--font-display, serif)', fontWeight: 800,
                    fontSize: 15, letterSpacing: '-0.02em', lineHeight: 1.2,
                    color: '#1a1a2e', marginBottom: 4,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {speaker.name}
                  </div>

                  {/* 직함 · 소속 */}
                  {subText && (
                    <div style={{
                      fontSize: 11, color: '#888', marginBottom: 8,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {subText}
                    </div>
                  )}

                  {/* 분야 태그 */}
                  {fields.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                      {fields.slice(0, 3).map(f => (
                        <span key={f} style={{
                          fontSize: 9, fontWeight: 600, padding: '2px 6px',
                          border: '1px solid #1D422930', color: '#1D4229',
                          whiteSpace: 'nowrap', letterSpacing: '0.03em',
                        }}>
                          {fieldMap[f]}
                        </span>
                      ))}
                      {fields.length > 3 && (
                        <span style={{ fontSize: 9, color: '#aaa', padding: '2px 0' }}>+{fields.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-1 flex-wrap">
          {/* 이전 */}
          {page > 1 ? (
            <Link
              href={buildUrl({ page: page - 1, field: currentField, q: currentQ })}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-9 h-9 flex items-center justify-center text-sm border border-gray-200 rounded-full text-gray-500 hover:border-[#1a1a2e] hover:text-[#1a1a2e] transition-colors"
            >
              ←
            </Link>
          ) : (
            <span className="w-9 h-9 flex items-center justify-center text-sm border border-gray-100 rounded-full text-gray-300 cursor-default">
              ←
            </span>
          )}

          {/* 페이지 번호 */}
          {getPaginationRange(page, totalPages).map((p, i) =>
            p === '…' ? (
              <span key={`e-${i}`} className="w-9 h-9 flex items-center justify-center text-xs text-gray-400">
                …
              </span>
            ) : (
              <Link
                key={p}
                href={buildUrl({ page: p as number, field: currentField, q: currentQ })}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className={`w-9 h-9 flex items-center justify-center text-sm rounded-full transition-colors ${
                  p === page
                    ? 'bg-[#1a1a2e] text-white font-semibold cursor-default pointer-events-none'
                    : 'border border-gray-200 text-gray-600 hover:border-[#1a1a2e] hover:text-[#1a1a2e]'
                }`}
              >
                {p}
              </Link>
            )
          )}

          {/* 다음 */}
          {page < totalPages ? (
            <Link
              href={buildUrl({ page: page + 1, field: currentField, q: currentQ })}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-9 h-9 flex items-center justify-center text-sm border border-gray-200 rounded-full text-gray-500 hover:border-[#1a1a2e] hover:text-[#1a1a2e] transition-colors"
            >
              →
            </Link>
          ) : (
            <span className="w-9 h-9 flex items-center justify-center text-sm border border-gray-100 rounded-full text-gray-300 cursor-default">
              →
            </span>
          )}
        </div>
      )}
    </div>
  )
}
