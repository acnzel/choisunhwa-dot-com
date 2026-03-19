'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Speaker } from '@/types'

interface Props {
  speakers: Speaker[]
  fieldMap: Record<string, string>
  trendingSpeakers?: Speaker[]  // '지금 뜨는' — is_trending=true, migration 010 필요
}

const TABS = ['전체 보기', '주제로 찾기', '지금 뜨는']
const PAGE_SIZE = 10  // 5열 × 2행 = 10 (globals.css @1400px+ 5열 고정)
const AUTO_MS  = 8000 // 8초마다 자동 롤링

// ── 사진 폴백 컴포넌트 (broken URL → 이니셜 아바타) ──
function SpeakerAvatar({ photoUrl, name }: { photoUrl: string | null; name: string }) {
  const [error, setError] = useState(false)
  const initial = (name ?? '?').charAt(0)

  if (!photoUrl || error) {
    return (
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#eae5db',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: '#1D4229',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{ color: '#fff', fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-body)' }}>
            {initial}
          </span>
        </div>
      </div>
    )
  }

  return (
    <Image
      src={photoUrl}
      alt={name}
      fill
      className="sp-card-img"
      style={{ objectFit: 'cover', objectPosition: 'top center' }}
      sizes="138px"
      onError={() => setError(true)}
    />
  )
}

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

export default function SpeakerTabs({ speakers, fieldMap, trendingSpeakers = [] }: Props) {
  const searchParams = useSearchParams()
  const viewParam = searchParams?.get('view')
  const initTab = viewParam === 'field' ? 1 : viewParam === 'trending' ? 2 : 0

  const [activeTab, setActiveTab] = useState(initTab)
  const [filterField, setFilterField] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const filtered = (() => {
    if (activeTab === 1 && filterField) {
      return speakers.filter((s) => (s.fields ?? []).includes(filterField))
    }
    if (activeTab === 2) return trendingSpeakers.length > 0 ? trendingSpeakers : speakers.slice(0, 18)
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
          column-gap: 20px;
          row-gap: 24px;
          background: transparent;
          min-height: 340px;
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
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          transition: background 0.15s ease, box-shadow 0.2s ease, transform 0.2s ease;
          min-height: 160px;
        }
        .sp-card:hover { background: #f5f1ea; box-shadow: 0 6px 20px rgba(0,0,0,0.13); transform: translateY(-2px); }

        /* 좌측 컬러바 */
        .sp-card-bar {
          width: 3px;
          flex-shrink: 0;
          align-self: stretch;
        }

        /* 사진 영역 */
        .sp-card-photo {
          position: relative;
          width: 138px;
          height: 138px;
          flex-shrink: 0;
          background: var(--color-surface);
          overflow: hidden;
          align-self: center;
          margin: 8px 0 8px 8px;
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
          padding: 20px 16px;
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
          .sp-card-photo { width: 110px; height: 110px; }
        }
      `}</style>

      {/* 서브 탭 */}
      <nav style={{ display: 'flex', gap: '32px', padding: '0 var(--space-page)', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(i); setFilterField(null) }}
            className="sub-tab-btn"
            style={{
              fontSize: '15px', fontWeight: 600,
              color: activeTab === i ? '#1D4229' : '#666',
              padding: '14px 0', flexShrink: 0,
              borderBottom: activeTab === i ? '2px solid #1D4229' : '2px solid transparent',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => { if (activeTab !== i) (e.currentTarget as HTMLButtonElement).style.color = '#1D4229' }}
            onMouseLeave={e => { if (activeTab !== i) (e.currentTarget as HTMLButtonElement).style.color = '#666' }}
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
        style={{ padding: '16px var(--space-page) 24px' }}
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
              const visibleFields = (speaker.fields ?? []).filter(f => fieldMap[f]).slice(0, 1)
              const subText = [speaker.title, speaker.company].filter(Boolean).join(' · ')

              return (
                <Link key={speaker.id} href={`/speakers/${speaker.id}`} className="sp-card">
                  <div className="sp-card-bar" style={{ background: accentColor }} />

                  <div className="sp-card-photo">
                    <SpeakerAvatar photoUrl={speaker.photo_url ?? null} name={speaker.name} />
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

                    {visibleFields.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '2px' }}>
                        {visibleFields.map((f) => (
                          <span key={f} style={{
                            fontSize: '12px', fontWeight: 400,
                            padding: '3px 10px',
                            background: '#F2EDDF',
                            color: '#444',
                            borderRadius: '20px',
                            whiteSpace: 'nowrap',
                          }}>
                            {fieldMap[f]}
                          </span>
                        ))}
                      </div>
                    )}

                    {speaker.bio_short && (
                      <div style={{
                        fontSize: '11.5px', fontWeight: 400,
                        color: 'var(--color-subtle)', lineHeight: 1.55,
                        marginTop: '4px',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 2,
                      }}>
                        {speaker.bio_short}
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
