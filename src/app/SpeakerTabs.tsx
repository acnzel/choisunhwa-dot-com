'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Speaker } from '@/types'

interface Props {
  speakers: Speaker[]
  fieldMap: Record<string, string>
}

const TABS = ['전체 보기', '주제로 찾기', '지금 뜨는']

// 분야별 컬러 도트/보더 매핑
const FIELD_COLORS: Record<string, string> = {
  leadership:       '#2c3e6b', // 네이비
  org_culture:      '#4a5e3a', // 올리브 그린
  motivation:       '#c4724a', // 테라코타
  self_development: '#c4724a',
  marketing:        '#c49a2a', // 머스타드
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
  return 'var(--color-border)'
}

export default function SpeakerTabs({ speakers, fieldMap }: Props) {
  const [activeTab, setActiveTab] = useState(0)
  const [filterField, setFilterField] = useState<string | null>(null)

  const filtered = (() => {
    if (activeTab === 1 && filterField) {
      return speakers.filter((s) => s.fields.includes(filterField))
    }
    if (activeTab === 2) return speakers.slice(0, 2)
    return speakers
  })()

  // 필터 버튼은 fieldMap에 정의된 카테고리만 (raw 강연분야 키워드 제외)
  const allFields = Array.from(new Set(speakers.flatMap((s) => s.fields))).filter(f => fieldMap[f])
  const border = '1px solid var(--color-border)'

  return (
    <>
      <style>{`
        .sub-tab-btn { background: none; border: none; font-family: var(--font-body); }

        /* 데스크탑 5열: 번호+도트 / 이름+역할 / 태그 / 상태 / 화살표 */
        .sp-row {
          display: grid;
          grid-template-columns: 44px 1fr 200px 72px 24px;
          align-items: center;
          gap: 16px;
          padding: 18px 0;
          border-bottom: 1px solid var(--color-border);
          text-decoration: none;
          color: inherit;
          cursor: pointer;
          transition: background 0.15s ease, transform 0.1s ease;
          will-change: transform;
        }
        .sp-row:last-child { border-bottom: none; }
        .sp-row:hover {
          background: #f0ede6;
        }
        .sp-row:hover .sp-arrow {
          transform: translateX(5px);
          color: var(--color-ink);
        }
        .sp-row:active {
          background: #e5e1d9;
          transform: scale(0.995);
        }
        .sp-arrow {
          display: inline-flex;
          align-items: center;
          justify-content: flex-end;
          transition: transform 0.18s ease, color 0.15s;
          color: var(--color-muted);
          font-size: 16px;
        }

        /* 데스크탑: 별도 컬럼 태그 보임 / 인라인 태그 숨김 */
        .sp-col-tags   { display: flex; flex-wrap: wrap; gap: 4px; overflow: hidden; min-width: 0; }
        .sp-col-status { display: block; }
        .sp-inline-tags { display: none; }

        /* 768px 이하: 3열로 축소, 별도 컬럼 숨기고 인라인 태그 보임 */
        @media (max-width: 768px) {
          .sp-row {
            grid-template-columns: 40px 1fr 24px;
            gap: 12px;
          }
          .sp-col-tags, .sp-col-status { display: none; }
          .sp-inline-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 5px; }
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
              cursor: 'pointer', transition: 'color 0.2s',
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
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* 리스트 */}
      <div style={{ padding: '0 var(--space-page)' }}>
        {filtered.length === 0 ? (
          <p style={{ padding: '40px 0', textAlign: 'center', fontSize: '13px', color: 'var(--color-muted)' }}>
            해당 분야 강사가 없습니다.
          </p>
        ) : (
          filtered.map((speaker, i) => (
            <Link
              key={speaker.id}
              href={`/speakers/${speaker.id}`}
              className="sp-row"
            >

              {/* 01 번호 + 분야 도트 */}
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                <span style={{
                  width: '7px', height: '7px', borderRadius: '50%',
                  background: getFieldColor(speaker.fields ?? []),
                  display: 'inline-block', flexShrink: 0,
                }} />
                <span style={{ fontFamily: 'var(--font-english)', fontSize: '11px', color: 'var(--color-muted)' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
              </span>

              {/* 02 이름 + 역할 + (모바일용 인라인 태그) */}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {speaker.name}
                </div>
                <div style={{ fontSize: '11px', fontWeight: 300, color: 'var(--color-subtle)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {[speaker.title, speaker.company].filter(Boolean).join(' · ')}
                </div>
                {/* 모바일에서만 보이는 인라인 태그 */}
                {speaker.fields.length > 0 && (
                  <div className="sp-inline-tags">
                    {speaker.fields.filter(f => !f.startsWith('~') && fieldMap[f]).slice(0, 3).map((f) => (
                      <span key={f} style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.05em', border, padding: '2px 8px', color: 'var(--color-muted)', background: 'var(--color-surface)', whiteSpace: 'nowrap' }}>
                        {fieldMap[f]}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 03 태그 (데스크탑 전용 컬럼) */}
              <div className="sp-col-tags">
                {speaker.fields.filter(f => !f.startsWith('~') && fieldMap[f]).slice(0, 3).map((f) => (
                  <span key={f} style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.05em', border, padding: '2px 8px', color: 'var(--color-muted)', background: 'var(--color-surface)', whiteSpace: 'nowrap' }}>
                    {fieldMap[f]}
                  </span>
                ))}
              </div>

              {/* 04 상태 (데스크탑 전용) */}
              <span className="sp-col-status" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-green)', whiteSpace: 'nowrap' }}>
                섭외 가능
              </span>

              {/* 05 화살표 */}
              <span className="sp-arrow">→</span>
            </Link>
          ))
        )}
      </div>
    </>
  )
}
