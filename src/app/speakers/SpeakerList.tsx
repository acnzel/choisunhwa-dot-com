'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useMemo } from 'react'
import type { Speaker } from '@/types'
import { SPEAKER_FIELDS } from '@/constants'

const FIELD_MAP: Record<string, string> = Object.fromEntries(
  SPEAKER_FIELDS.map((f) => [f.value, f.label])
)

interface Props {
  speakers: Speaker[]
}

export default function SpeakerList({ speakers }: Props) {
  const [search, setSearch] = useState('')
  const [selectedField, setSelectedField] = useState<string>('all')

  const filtered = useMemo(() => {
    return speakers.filter((s) => {
      const matchField = selectedField === 'all' || s.fields.includes(selectedField)
      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.bio_short.toLowerCase().includes(q) ||
        s.company.toLowerCase().includes(q)
      return matchField && matchSearch
    })
  }, [speakers, search, selectedField])

  return (
    <div>
      {/* 필터 & 검색 */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {/* 검색 */}
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="강사명, 키워드 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:border-[#1a1a2e] bg-white"
            aria-label="강사 검색"
          />
        </div>

        {/* 분야 필터 */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedField('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              selectedField === 'all'
                ? 'bg-[#1a1a2e] text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
          >
            전체
          </button>
          {SPEAKER_FIELDS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setSelectedField(value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                selectedField === value
                  ? 'bg-[#1a1a2e] text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 결과 카운트 */}
      <p className="text-sm text-gray-500 mb-5">
        총 <span className="font-semibold text-[#1a1a2e]">{filtered.length}</span>명의 강사
      </p>

      {/* 카드 그리드 */}
      {filtered.length === 0 ? (
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map((speaker) => (
            <div key={speaker.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              <Link href={`/speakers/${speaker.id}`}>
                <div className="relative aspect-[4/3] bg-gray-100">
                  {speaker.photo_url ? (
                    <Image
                      src={speaker.photo_url}
                      alt={speaker.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-200">
                      <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </Link>
              <div className="p-4 flex flex-col flex-1">
                <div className="flex flex-wrap gap-1 mb-2">
                  {speaker.fields.slice(0, 3).map((f) => (
                    <span key={f} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                      {FIELD_MAP[f] ?? f}
                    </span>
                  ))}
                </div>
                <Link href={`/speakers/${speaker.id}`}>
                  <h2 className="font-semibold text-[#1a1a2e] group-hover:text-blue-800 transition-colors">
                    {speaker.name}
                  </h2>
                </Link>
                <p className="text-xs text-gray-500 mt-0.5">{speaker.title} · {speaker.company}</p>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2 flex-1">{speaker.bio_short}</p>
                <Link
                  href={`/inquiry/lecture?speaker=${encodeURIComponent(speaker.name)}`}
                  className="mt-4 w-full text-center text-xs font-medium py-2 border border-gray-200 rounded-full text-gray-600 hover:bg-[#1a1a2e] hover:text-white hover:border-[#1a1a2e] transition-colors"
                >
                  문의하기
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
