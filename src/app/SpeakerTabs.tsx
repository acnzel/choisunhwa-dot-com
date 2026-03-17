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

        /* ── 리스트 행 ── */
        .sp-list { width: 100%; }

        .sp-row {
          display: grid;
          grid-template-columns: 40px 80px 1fr auto 32px;
          align-items: center;
          gap: 0 16px;
          padding: 12px var(--space-page);
          text-decoration: none;
          color: inherit;
          border-bottom: 1px solid var(--color-border);
          transition: background 0.15s ease;
        }
        .sp-row:hover { background: #f5f1ea; }
        .sp-row:last-child { border-bottom: none; }

        /* 번호 */
        .sp-row-num {
          font-family: var(--font-english);
          font-size: 11px; font-weight: 400;
          color: var(--color-muted);
          letter-spacing: 0.06em;
          flex-shrink: 0;
        }

        /* 사진 (정사각형 썸네일) */
        .sp-row-photo {
          position: relative;
          width: 80px; height: 80px;
          background: var(--color-surface);
          overflow: hidden;
          flex-shrink: 0;
        }
        .sp-row-photo-img { transition: transform 0.3s ease; }
        .sp-row:hover .sp-row-photo-img { transform: scale(1.05); }

        /* 이름+소속 영역 */
        .sp-row-info {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .sp-row-name {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 16px;
          letter-spacing: -0.02em;
          color: var(--color-ink);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sp-row-sub {
          font-size: 12px; font-weight: 300;
          color: var(--color-subtle);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        /* 태그 영역 (한 줄 고정) */
        .sp-row-tags {
          display: flex;
          gap: 4px;
          flex-wrap: nowrap;
          overflow: hidden;
          flex-shrink: 0;
          max-width: 260px;
        }
        .sp-row-tag {
          font-size: 10px; font-weight: 600;
          letter-spacing: 0.04em;
          padding: 3px 8px;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .sp-row-tag-more {
          font-size: 10px; font-weight: 600;
          color: var(--color-muted);
          padding: 3px 0;
          flex-shrink: 0;
        }

        /* 화살표 */
        .sp-row-arrow {
          font-size: 14px; color: var(--color-muted);
          transition: transform 0.2s, color 0.2s;
          flex-shrink: 0;
          text-align: right;
        }
        .sp-row:hover .sp-row-arrow { transform: translateX(4px); color: var(--color-ink); }

        /* 모바일: 사진 숨기고 3열 */
        @media (max-width: 640px) {
          .sp-row {
            grid-template-columns: 32px 1fr auto 24px;
            gap: 0 12px;
            padding: 10px 16px;
          }
          .sp-row-photo { display: none; }
          .sp-row-name { font-size: 14px; }
          .sp-row-tags { max-width: 140px; }
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

      {/* 연사 리스트 */}
      <div style={{ borderTop: border }}>
        {filtered.length === 0 ? (
          <p style={{ padding: '40px var(--space-page)', textAlign: 'center', fontSize: '13px', color: 'var(--color-muted)' }}>
            해당 분야 강사가 없습니다.
          </p>
        ) : (
          <div className="sp-list">
            {filtered.map((speaker, i) => {
              const accentColor = getFieldColor(speaker.fields ?? [])
              const allTagFields = (speaker.fields ?? []).filter(f => fieldMap[f])
              const visibleTags = allTagFields.slice(0, 3)
              const extraCount = allTagFields.length - visibleTags.length
              const subText = [speaker.title, speaker.company].filter(Boolean).join(' · ')

              return (
                <Link key={speaker.id} href={`/speakers/${speaker.id}`} className="sp-row">
                  {/* 번호 */}
                  <span className="sp-row-num">{String(i + 1).padStart(2, '0')}</span>

                  {/* 사진 (정사각형 썸네일) */}
                  <div className="sp-row-photo">
                    {speaker.photo_url ? (
                      <Image
                        src={speaker.photo_url}
                        alt={speaker.name}
                        fill
                        className="sp-row-photo-img"
                        style={{ objectFit: 'cover', objectPosition: 'top center' }}
                        sizes="80px"
                      />
                    ) : (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-border)" strokeWidth="1">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                    )}
                    {/* 좌측 컬러 라인 */}
                    <div style={{
                      position: 'absolute', left: 0, top: 0, bottom: 0,
                      width: 3, background: accentColor,
                    }} />
                  </div>

                  {/* 이름+소속 */}
                  <div className="sp-row-info">
                    <span className="sp-row-name">{speaker.name}</span>
                    {subText && <span className="sp-row-sub">{subText}</span>}
                  </div>

                  {/* 분야 태그 (한 줄, 초과 시 +N) */}
                  <div className="sp-row-tags">
                    {visibleTags.map((f) => (
                      <span key={f} className="sp-row-tag" style={{
                        border: `1px solid ${accentColor}50`,
                        color: accentColor,
                        background: `${accentColor}08`,
                      }}>
                        {fieldMap[f]}
                      </span>
                    ))}
                    {extraCount > 0 && (
                      <span className="sp-row-tag-more">+{extraCount}</span>
                    )}
                  </div>

                  {/* 화살표 */}
                  <span className="sp-row-arrow">→</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
