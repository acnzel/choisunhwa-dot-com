'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Speaker } from '@/types'

interface Props {
  speakers: Speaker[]
  fieldMap: Record<string, string>
}

const TABS = ['전체 보기', '주제로 찾기', '지금 뜨는']

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

  const allFields = Array.from(new Set(speakers.flatMap((s) => s.fields)))
  const border = '1px solid var(--color-border)'

  return (
    <>
      <style>{`
        /* 탭 */
        .sub-tab-btn { background: none; border: none; font-family: var(--font-body); }

        /* 테이블 열 */
        .sp-row {
          display: grid;
          grid-template-columns: 32px 1fr 24px;
          align-items: center;
          gap: 16px;
          padding: 18px 0;
          border-bottom: 1px solid var(--color-border);
          text-decoration: none;
          color: inherit;
          transition: background 0.15s;
        }
        .sp-row:last-child { border-bottom: none; }
        .sp-row:hover { background: var(--color-surface); padding-left: 12px; padding-right: 12px; margin: 0 -12px; }
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
              padding: '12px 0',
              marginRight: '24px',
              flexShrink: 0,
              borderBottom: activeTab === i ? '2px solid var(--color-ink)' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'color 0.2s',
            }}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* 주제 필터 */}
      {activeTab === 1 && (
        <div style={{
          padding: '12px var(--space-page)',
          borderBottom: border,
          display: 'flex', flexWrap: 'wrap', gap: '8px',
        }}>
          {[{ value: null, label: '전체' }, ...allFields.map((f) => ({ value: f, label: fieldMap[f] ?? f }))].map(({ value, label }) => (
            <button
              key={label}
              onClick={() => setFilterField(value)}
              style={{
                fontSize: '10px', fontWeight: 600,
                letterSpacing: '0.07em', textTransform: 'uppercase',
                border: border, padding: '4px 12px',
                background: filterField === value ? 'var(--color-ink)' : 'var(--color-surface)',
                color: filterField === value ? 'var(--color-bg)' : 'var(--color-muted)',
                transition: 'background 0.15s',
                fontFamily: 'var(--font-body)',
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
            <Link key={speaker.id} href={`/speakers/${speaker.id}`} className="sp-row">
              {/* 번호 */}
              <span style={{ fontFamily: 'var(--font-english)', fontSize: '13px', color: 'var(--color-muted)', flexShrink: 0 }}>
                {String(i + 1).padStart(2, '0')}
              </span>

              {/* 이름 + 직함 + 태그 (한 컬럼) */}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {speaker.name}
                </div>
                <div style={{ fontSize: '11px', fontWeight: 300, color: 'var(--color-subtle)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: speaker.fields.length > 0 ? '6px' : 0 }}>
                  {speaker.title}{speaker.company ? ` · ${speaker.company}` : ''}
                </div>
                {/* 태그: 이름 컬럼 안에, 줄바꿈 허용 */}
                {speaker.fields.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {speaker.fields.slice(0, 3).map((f) => (
                      <span key={f} style={{
                        fontSize: '10px', fontWeight: 600, letterSpacing: '0.05em',
                        border: '1px solid var(--color-border)',
                        padding: '2px 8px',
                        color: 'var(--color-muted)',
                        background: 'var(--color-surface)',
                        whiteSpace: 'nowrap',
                      }}>
                        {fieldMap[f] ?? f}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 화살표 */}
              <span style={{ color: 'var(--color-muted)', fontSize: '14px', flexShrink: 0 }}>→</span>
            </Link>
          ))
        )}
      </div>
    </>
  )
}
