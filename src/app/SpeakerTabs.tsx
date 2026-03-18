'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Speaker } from '@/types'

interface Props {
  speakers: Speaker[]
  fieldMap: Record<string, string>
}

const TABS = ['전체 보기', '주제로 찾기', '지금 뜨는']
const PAGE_SIZE = 6   // 3열 × 2행
const AUTO_MS  = 4000 // 4초마다 자동 롤링

const FIELD_COLORS: Record<string, string> = {
  leadership:       '#2c3e6b',
  org_culture:      '#4a5e3a',
  motivation:       '#c4724a',
  self_development: '#c4724a',
  marketing:        '#c49a2a',
  sales:            '#c49a2a',
  communication:    '#4a5e3a',
  ai_tech:          '#2c3e6b',
  hr:               '#c49a2a',
  finance:          '#2c3e6b',
}

function getFieldColor(fields: string[]): string {
  for (const f of fields) {
    if (FIELD_COLORS[f]) return FIELD_COLORS[f]
  }
  return '#2B4238'
}

export default function SpeakerTabs({ speakers, fieldMap }: Props) {
  const [activeTab, setActiveTab] = useState(0)
  const [filterField, setFilterField] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const filtered = (() => {
    if (activeTab === 1 && filterField) {
      return speakers.filter((s) => (s.fields ?? []).includes(filterField))
    }
    if (activeTab === 2) return speakers.slice(0, 18)
    return speakers
  })()

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const goNext = useCallback(() => {
    setPage((p) => (p + 1) % Math.max(1, totalPages))
  }, [totalPages])

  const goPrev = useCallback(() => {
    setPage((p) => (p - 1 + Math.max(1, totalPages)) % Math.max(1, totalPages))
  }, [totalPages])

  // 탭/필터 변경 시 페이지 초기화
  useEffect(() => {
    setPage(0)
  }, [activeTab, filterField])

  // 자동 롤링
  useEffect(() => {
    if (paused || totalPages <= 1) return
    timerRef.current = setInterval(goNext, AUTO_MS)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [paused, totalPages, goNext])

  const allFields = Array.from(new Set(speakers.flatMap((s) => s.fields ?? []))).filter(f => fieldMap[f])
  const border = '1px solid var(--color-border)'

  return (
    <>
      <style>{`
        .sub-tab-btn { background: none; border: none; font-family: var(--font-body); cursor: pointer; }

        /* ── 카드 그리드 (3열) ── */
        .sp-card-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: var(--color-border);
          min-height: 290px; /* 2행 확보 */
        }
        @media (max-width: 860px) {
          .sp-card-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .sp-card-grid { grid-template-columns: 1fr; }
        }

        /* ── 개별 카드 — 수평 레이아웃 ── */
        .sp-card {
          display: flex;
          flex-direction: row;
          align-items: stretch;
          text-decoration: none;
          color: inherit;
          background: var(--color-bg);
          position: relative;
          overflow: hidden;
          transition: background 0.15s ease;
          min-height: 144px;
        }
        .sp-card:hover { background: #f5f1ea; }

        /* 좌측 컬러바 */
        .sp-card-bar {
          width: 3px;
          flex-shrink: 0;
          align-self: stretch;
        }

        /* 사진 영역 */
        .sp-card-photo {
          position: relative;
          width: 120px;
          height: 120px;
          flex-shrink: 0;
          background: var(--color-surface);
          overflow: hidden;
          align-self: center;
          margin: 12px 0 12px 12px;
        }
        .sp-card-img { transition: transform 0.4s ease; }
        .sp-card:hover .sp-card-img { transform: scale(1.05); }
        .sp-card-placeholder {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
        }

        /* 정보 영역 */
        .sp-card-body {
          flex: 1;
          padding: 14px 16px 14px 14px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 4px;
          min-width: 0;
        }

        .sp-card-index {
          font-family: var(--font-english);
          font-size: 9px; font-weight: 400;
          color: var(--color-muted);
          letter-spacing: 0.08em;
          margin-bottom: 2px;
        }

        /* hover 오버레이 */
        .sp-card-hover-overlay {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 8px 16px;
          background: var(--color-ink); color: var(--color-bg);
          font-family: var(--font-body);
          font-size: 11px; font-weight: 600; letter-spacing: 0.06em;
          display: flex; align-items: center; justify-content: space-between;
          transform: translateY(100%);
          transition: transform 0.22s ease;
        }
        .sp-card:hover .sp-card-hover-overlay { transform: translateY(0); }

        /* ── 페이지네이션 바 ── */
        .sp-pager {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px;
          border-top: 1px solid var(--color-border);
        }
        .sp-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--color-border);
          border: none;
          cursor: pointer;
          padding: 0;
          transition: background 0.2s, transform 0.2s;
        }
        .sp-dot.active {
          background: var(--color-ink);
          transform: scale(1.4);
        }
        .sp-arrow {
          background: none;
          border: 1px solid var(--color-border);
          width: 28px; height: 28px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          font-size: 12px;
          color: var(--color-muted);
          transition: border-color 0.15s, color 0.15s;
          flex-shrink: 0;
        }
        .sp-arrow:hover { border-color: var(--color-ink); color: var(--color-ink); }

        /* 모바일 */
        @media (max-width: 480px) {
          .sp-card-photo { width: 90px; height: 90px; }
        }
      `}</style>

      {/* 서브 탭 */}
      <nav style={{ display: 'flex', borderBottom: border, padding: '0 var(--space-page)', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(i); setFilterField(null) }}
            className="sub-tab-btn"
            style={{
              fontSize: '11px', fontWeight: 600,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: activeTab === i ? 'var(--color-ink)' : 'var(--color-muted)',
              padding: '12px 0', marginRight: '24px', flexShrink: 0,
              borderBottom: activeTab === i ? '2px solid var(--color-ink)' : '2px solid transparent',
              transition: 'color 0.2s',
            }}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* 주제 필터 */}
      {activeTab === 1 && (
        <div style={{ padding: '12px var(--space-page)', borderBottom: border, display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {[{ value: null, label: '전체' }, ...allFields.map((f) => ({ value: f, label: fieldMap[f] ?? f }))].map(({ value, label }) => (
            <button
              key={label}
              onClick={() => setFilterField(value)}
              style={{
                fontSize: '10px', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase',
                border, padding: '4px 12px',
                background: filterField === value ? 'var(--color-ink)' : 'var(--color-surface)',
                color: filterField === value ? 'var(--color-bg)' : 'var(--color-muted)',
                transition: 'background 0.15s', fontFamily: 'var(--font-body)',
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* 카드 그리드 */}
      <div
        style={{ borderTop: border }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {filtered.length === 0 ? (
          <p style={{ padding: '40px var(--space-page)', textAlign: 'center', fontSize: '13px', color: 'var(--color-muted)' }}>
            해당 분야 강사가 없습니다.
          </p>
        ) : (
          <div className="sp-card-grid">
            {paged.map((speaker, i) => {
              const globalIndex = page * PAGE_SIZE + i
              const accentColor = getFieldColor(speaker.fields ?? [])
              const visibleFields = (speaker.fields ?? []).filter(f => fieldMap[f]).slice(0, 2)
              const subText = [speaker.title, speaker.company].filter(Boolean).join(' · ')

              return (
                <Link key={speaker.id} href={`/speakers/${speaker.id}`} className="sp-card">
                  <div className="sp-card-bar" style={{ background: accentColor }} />

                  <div className="sp-card-photo">
                    {speaker.photo_url ? (
                      <Image
                        src={speaker.photo_url}
                        alt={speaker.name}
                        fill
                        className="sp-card-img"
                        style={{ objectFit: 'cover', objectPosition: 'top center' }}
                        sizes="120px"
                      />
                    ) : (
                      <div className="sp-card-placeholder">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-border)" strokeWidth="1">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="sp-card-body">
                    <span className="sp-card-index">{String(globalIndex + 1).padStart(2, '0')}</span>

                    <div style={{
                      fontFamily: 'var(--font-display)', fontWeight: 800,
                      fontSize: '17px', letterSpacing: '-0.02em', lineHeight: 1.1,
                      color: 'var(--color-ink)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {speaker.name}
                    </div>

                    {subText && (
                      <div style={{
                        fontSize: '11px', fontWeight: 300,
                        color: 'var(--color-subtle)', lineHeight: 1.45,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {subText}
                      </div>
                    )}

                    {speaker.bio_short && (
                      <div style={{
                        fontSize: '11px', fontWeight: 400,
                        color: 'var(--color-muted)', lineHeight: 1.5,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        marginTop: '2px',
                      }}>
                        {speaker.bio_short}
                      </div>
                    )}

                    {visibleFields.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '2px' }}>
                        {visibleFields.map((f) => (
                          <span key={f} style={{
                            fontSize: '9px', fontWeight: 600, letterSpacing: '0.04em',
                            padding: '2px 6px',
                            border: `1px solid ${accentColor}40`,
                            color: accentColor,
                            whiteSpace: 'nowrap',
                          }}>
                            {fieldMap[f]}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="sp-card-hover-overlay">
                    <span>섭외 가능</span>
                    <span>→</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* 페이지네이션 — 2페이지 이상일 때만 표시 */}
      {totalPages > 1 && (
        <div className="sp-pager">
          <button className="sp-arrow" onClick={() => { goPrev(); setPaused(true) }} aria-label="이전">‹</button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`sp-dot${page === i ? ' active' : ''}`}
              onClick={() => { setPage(i); setPaused(true) }}
              aria-label={`${i + 1}페이지`}
            />
          ))}

          <button className="sp-arrow" onClick={() => { goNext(); setPaused(true) }} aria-label="다음">›</button>
        </div>
      )}
    </>
  )
}
