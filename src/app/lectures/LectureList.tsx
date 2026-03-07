'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useMemo } from 'react'
import type { Lecture, Speaker } from '@/types'
import { SPEAKER_FIELDS, LECTURE_DURATIONS } from '@/constants'

type LectureWithSpeaker = Lecture & { speaker: Pick<Speaker, 'id' | 'name' | 'title'> | null }

type ArticleType = 'lecture' | 'editor_pick' | 'field_report' | 'behind' | 'monthly'

function getArticleType(lecture: Lecture): ArticleType {
  return ((lecture.content_json as Record<string, unknown>)?.article_type as ArticleType) ?? 'lecture'
}

const ARTICLE_TYPE_LABELS: Record<ArticleType, string> = {
  lecture:      '강연 커리큘럼',
  editor_pick:  '에디터 픽',
  field_report: '현장 리포트',
  behind:       '비하인드',
  monthly:      '이달의 강연',
}

const ARTICLE_TYPE_COLORS: Record<ArticleType, { bg: string; text: string }> = {
  lecture:      { bg: '#eaf1ee', text: '#2B4238' },
  editor_pick:  { bg: '#f5ebe8', text: '#9B4A35' },
  field_report: { bg: '#fdf3e3', text: '#C4933F' },
  behind:       { bg: '#eaf1ee', text: '#2B4238' },
  monthly:      { bg: '#f5ebe8', text: '#9B4A35' },
}

const DURATION_MAP: Record<string, string> = Object.fromEntries(
  LECTURE_DURATIONS.map((d) => [d.value, d.label])
)

interface Props {
  lectures: LectureWithSpeaker[]
}

export default function LectureList({ lectures }: Props) {
  const [search, setSearch] = useState('')
  const [selectedField, setSelectedField] = useState('all')

  const activeFields = useMemo(() => {
    const fieldSet = new Set<string>()
    lectures.forEach((l) => l.fields.forEach((f) => fieldSet.add(f)))
    return SPEAKER_FIELDS.filter((f) => fieldSet.has(f.value))
  }, [lectures])

  const filtered = useMemo(() => {
    return lectures.filter((l) => {
      const matchField = selectedField === 'all' || l.fields.includes(selectedField)
      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        l.title.toLowerCase().includes(q) ||
        (l.summary ?? '').toLowerCase().includes(q) ||
        (l.speaker?.name ?? '').toLowerCase().includes(q)
      return matchField && matchSearch
    })
  }, [lectures, search, selectedField])

  return (
    <div style={{ fontFamily: 'var(--font-body)' }}>
      {/* 검색 & 필터 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
        <div style={{ position: 'relative', maxWidth: '360px' }}>
          <svg
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }}
            width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="강연명, 강사명, 키워드 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '40px', paddingRight: '16px', paddingTop: '10px', paddingBottom: '10px',
              fontSize: '14px',
              border: '1px solid var(--color-border)',
              background: 'white',
              outline: 'none',
              color: 'var(--color-ink)',
            }}
            aria-label="강연 검색"
          />
        </div>
        {activeFields.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedField('all')}
              style={{
                padding: '4px 14px', fontSize: '11px', fontWeight: 600,
                letterSpacing: '0.07em', border: '1px solid var(--color-border)',
                background: selectedField === 'all' ? 'var(--color-ink)' : 'var(--color-surface)',
                color: selectedField === 'all' ? 'var(--color-bg)' : 'var(--color-subtle)',
                cursor: 'pointer', transition: 'background 0.15s',
              }}
            >전체</button>
            {activeFields.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setSelectedField(value)}
                style={{
                  padding: '4px 14px', fontSize: '11px', fontWeight: 600,
                  letterSpacing: '0.07em', border: '1px solid var(--color-border)',
                  background: selectedField === value ? 'var(--color-ink)' : 'var(--color-surface)',
                  color: selectedField === value ? 'var(--color-bg)' : 'var(--color-subtle)',
                  cursor: 'pointer', transition: 'background 0.15s',
                }}
              >{label}</button>
            ))}
          </div>
        )}
      </div>

      <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '24px' }}>
        총 <strong style={{ color: 'var(--color-ink)' }}>{filtered.length}</strong>개의 콘텐츠
      </p>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <p style={{ fontSize: '14px', color: 'var(--color-muted)' }}>해당 조건의 강연이 없습니다.</p>
          <p style={{ fontSize: '14px', color: 'var(--color-muted)', marginTop: '6px' }}>
            <Link href="/inquiry/lecture" style={{ color: 'var(--color-rust)', textDecoration: 'underline' }}>
              직접 강연을 문의
            </Link>해보세요.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--color-border)' }}
          className="lecture-grid"
        >
          <style>{`
            @media (max-width: 900px) { .lecture-grid { grid-template-columns: repeat(2, 1fr) !important; } }
            @media (max-width: 560px) { .lecture-grid { grid-template-columns: 1fr !important; } }
            .lc-card { transition: background 0.15s; }
            .lc-card:hover { background: #f5f1ea !important; }
          `}</style>
          {filtered.map((lecture) => {
            const type = getArticleType(lecture)
            const typeLabel = ARTICLE_TYPE_LABELS[type]
            const typeColor = ARTICLE_TYPE_COLORS[type]
            const isLecture = type === 'lecture'

            return (
              <Link
                key={lecture.id}
                href={`/lectures/${lecture.id}`}
                className="lc-card"
                style={{
                  display: 'flex', flexDirection: 'column',
                  textDecoration: 'none', color: 'inherit',
                  background: 'var(--color-bg)',
                  overflow: 'hidden',
                }}
              >
                {/* 썸네일 */}
                <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: 'var(--color-surface)', overflow: 'hidden' }}>
                  {lecture.thumbnail_url ? (
                    <Image
                      src={lecture.thumbnail_url}
                      alt={lecture.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 33vw"
                    />
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="40" height="40" fill="none" stroke="var(--color-border)" strokeWidth="1" viewBox="0 0 24 24">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M3 9h18M9 21V9" />
                      </svg>
                    </div>
                  )}
                  {/* 타입 뱃지 */}
                  <span style={{
                    position: 'absolute', top: '10px', left: '10px',
                    fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em',
                    padding: '3px 8px',
                    background: typeColor.bg, color: typeColor.text,
                  }}>
                    {typeLabel}
                  </span>
                </div>

                {/* 본문 */}
                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {/* 분야 태그 */}
                  {lecture.fields.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {lecture.fields.slice(0, 2).map((f) => (
                        <span key={f} style={{
                          fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em',
                          padding: '2px 7px',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-muted)',
                        }}>{f}</span>
                      ))}
                    </div>
                  )}

                  {/* 제목 */}
                  <h2 style={{
                    fontFamily: 'var(--font-display)', fontWeight: 900,
                    fontSize: 'clamp(14px, 1.5vw, 17px)', letterSpacing: '-0.02em', lineHeight: 1.25,
                    color: 'var(--color-ink)',
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {lecture.title}
                  </h2>

                  {/* 강사명 (lecture 타입만) */}
                  {isLecture && lecture.speaker && (
                    <p style={{ fontSize: '12px', color: 'var(--color-subtle)', fontWeight: 500 }}>
                      {lecture.speaker.name}
                    </p>
                  )}

                  {/* 요약 */}
                  {lecture.summary && (
                    <p style={{
                      fontSize: '12px', color: 'var(--color-muted)', lineHeight: 1.6,
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      flex: 1,
                    }}>
                      {lecture.summary}
                    </p>
                  )}

                  {/* 강연 메타 (lecture 타입만) */}
                  {isLecture && (
                    <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: 'var(--color-muted)', marginTop: '4px' }}>
                      <span>{DURATION_MAP[lecture.duration] ?? lecture.duration}</span>
                      {lecture.target && <span>· {lecture.target}</span>}
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
