'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useMemo } from 'react'
import type { Lecture, Speaker } from '@/types'
import { SPEAKER_FIELDS, LECTURE_DURATIONS } from '@/constants'

type LectureWithSpeaker = Lecture & { speaker: Pick<Speaker, 'id' | 'name' | 'title'> }

const FIELD_MAP: Record<string, string> = Object.fromEntries(
  SPEAKER_FIELDS.map((f) => [f.value, f.label])
)
const DURATION_MAP: Record<string, string> = Object.fromEntries(
  LECTURE_DURATIONS.map((d) => [d.value, d.label])
)

interface Props {
  lectures: LectureWithSpeaker[]
}

export default function LectureList({ lectures }: Props) {
  const [search, setSearch] = useState('')
  const [selectedField, setSelectedField] = useState('all')

  const filtered = useMemo(() => {
    return lectures.filter((l) => {
      const matchField = selectedField === 'all' || l.fields.includes(selectedField)
      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        l.title.toLowerCase().includes(q) ||
        l.summary.toLowerCase().includes(q) ||
        (l.speaker?.name ?? '').toLowerCase().includes(q)
      return matchField && matchSearch
    })
  }, [lectures, search, selectedField])

  return (
    <div>
      {/* 검색 & 필터 */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="강연명, 강사명, 키워드 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:border-[#1a1a2e] bg-white"
            aria-label="강연 검색"
          />
        </div>
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

      <p className="text-sm text-gray-500 mb-5">
        총 <span className="font-semibold text-[#1a1a2e]">{filtered.length}</span>개의 강연
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-sm">해당 조건의 강연이 없습니다.</p>
          <p className="text-gray-400 text-sm mt-1">
            <Link href="/inquiry/lecture" className="text-[#1a1a2e] underline underline-offset-2">
              직접 강연을 문의
            </Link>
            해보세요.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((lecture) => (
            <Link
              key={lecture.id}
              href={`/lectures/${lecture.id}`}
              className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="relative aspect-video bg-gray-100">
                {lecture.thumbnail_url ? (
                  <Image
                    src={lecture.thumbnail_url}
                    alt={lecture.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.069A1 1 0 0121 8.882v6.236a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col flex-1">
                <div className="flex flex-wrap gap-1 mb-2">
                  {lecture.fields.slice(0, 2).map((f) => (
                    <span key={f} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                      {FIELD_MAP[f] ?? f}
                    </span>
                  ))}
                </div>
                <h2 className="font-semibold text-[#1a1a2e] group-hover:text-blue-800 transition-colors line-clamp-2">
                  {lecture.title}
                </h2>
                {lecture.speaker && (
                  <p className="text-xs text-gray-500 mt-0.5">{lecture.speaker.name}</p>
                )}
                <p className="text-sm text-gray-600 mt-2 line-clamp-2 flex-1">{lecture.summary}</p>
                <div className="flex gap-2 mt-3 text-xs text-gray-400">
                  <span>{DURATION_MAP[lecture.duration] ?? lecture.duration}</span>
                  {lecture.target && <span>· {lecture.target}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
