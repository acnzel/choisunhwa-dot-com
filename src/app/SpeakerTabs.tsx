'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Speaker } from '@/types'

interface Props {
  speakers: Speaker[]
  fieldMap: Record<string, string>
}

const TABS = ['전체 보기', '주제로 찾기', '지금 뜨는']

// 분야별 상단 컬러바 매핑
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
  return '#2B4238' // --color-green 기본
}

export default function SpeakerTabs({ speakers, fieldMap }: Props) {
  const [activeTab, setActiveTab] = useState(0)
  const [filterField, setFilterField] = useState<string | null>(null)

  const filtered = (() => {
    if (activeTab === 1 && filterField) {
      return speakers.filter((s) => (s.fields ?? []).includes(filterField))
    }
    if (activeTab === 2) return speakers.slice(0, 6)
    return speakers
  })()

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
          min-height: 120px;
        }
        .sp-card:hover { background: #f5f1ea; }

        /* 좌측 컬러바 */
        .sp-card-bar {
          width: 3px;
          flex-shrink: 0;
          align-self: stretch;
        }

        /* 사진 영역 — 고정 정사각형, 작게 */
        .sp-card-photo {
          position: relative;
          width: 100px;
          height: 100px;
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

        /* 정보 영역 — 우측, 텍스트 중심 */
        .sp-card-body {
          flex: 1;
          padding: 14px 16px 14px 14px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 4px;
          min-width: 0;
        }

        /* 번호 */
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

        /* 모바일 조정 */
        @media (max-width: 480px) {
          .sp-card-photo { width: 80px; height: 80px; }
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
      <div style={{ borderTop: border }}>
        {filtered.length === 0 ? (
          <p style={{ padding: '40px var(--space-page)', textAlign: 'center', fontSize: '13px', color: 'var(--color-muted)' }}>
            해당 분야 강사가 없습니다.
          </p>
        ) : (
          <div className="sp-card-grid">
            {filtered.map((speaker, i) => {
              const accentColor = getFieldColor(speaker.fields ?? [])
              const visibleFields = (speaker.fields ?? []).filter(f => fieldMap[f]).slice(0, 5)
              const subText = [speaker.title, speaker.company].filter(Boolean).join(' · ')

              return (
                <Link key={speaker.id} href={`/speakers/${speaker.id}`} className="sp-card">
                  {/* 좌측 컬러바 */}
                  <div className="sp-card-bar" style={{ background: accentColor }} />

                  {/* 사진 — 100×100 정사각형 */}
                  <div className="sp-card-photo">
                    {speaker.photo_url ? (
                      <Image
                        src={speaker.photo_url}
                        alt={speaker.name}
                        fill
                        className="sp-card-img"
                        style={{ objectFit: 'cover', objectPosition: 'top center' }}
                        sizes="100px"
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

                  {/* 정보 영역 */}
                  <div className="sp-card-body">
                    {/* 번호 */}
                    <span className="sp-card-index">{String(i + 1).padStart(2, '0')}</span>

                    {/* 이름 */}
                    <div style={{
                      fontFamily: 'var(--font-display)', fontWeight: 800,
                      fontSize: '17px', letterSpacing: '-0.02em', lineHeight: 1.1,
                      color: 'var(--color-ink)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {speaker.name}
                    </div>

                    {/* 직함 · 소속 */}
                    {subText && (
                      <div style={{
                        fontSize: '11px', fontWeight: 300,
                        color: 'var(--color-subtle)', lineHeight: 1.45,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {subText}
                      </div>
                    )}

                    {/* 강의 분야 태그 */}
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
    </>
  )
}
