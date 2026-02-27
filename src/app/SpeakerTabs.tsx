'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Speaker } from '@/types'

interface Props {
  speakers: Speaker[]
  fieldMap: Record<string, string>
}

const TABS = ['전체 보기', '주제로 찾기', '지금 뜨는 강연']

export default function SpeakerTabs({ speakers, fieldMap }: Props) {
  const [activeTab, setActiveTab] = useState(0)
  const [filterField, setFilterField] = useState<string | null>(null)

  // 탭별 필터링
  const filtered = (() => {
    if (activeTab === 1 && filterField) {
      return speakers.filter((s) => s.fields.includes(filterField))
    }
    if (activeTab === 2) {
      // 지금 뜨는 = 첫 2명 (sort_order 기준으로 이미 정렬됨)
      return speakers.slice(0, 2)
    }
    return speakers
  })()

  // 전체 분야 목록 (중복 제거)
  const allFields = Array.from(new Set(speakers.flatMap((s) => s.fields)))

  const border = '1px solid var(--color-border)'

  return (
    <>
      {/* 서브 탭 */}
      <nav
        style={{
          display: 'flex',
          gap: 0,
          borderBottom: border,
          padding: '0 var(--space-page)',
        }}
      >
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            style={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: activeTab === i ? 'var(--color-ink)' : 'var(--color-muted)',
              padding: '12px 0',
              marginRight: '28px',
              borderBottom: activeTab === i ? '2px solid var(--color-ink)' : '2px solid transparent',
              background: 'none',
              border: 'none',
              borderBottomStyle: 'solid',
              borderBottomWidth: '2px',
              borderBottomColor: activeTab === i ? 'var(--color-ink)' : 'transparent',
              cursor: 'pointer',
              transition: 'color 0.2s, border-color 0.2s',
              fontFamily: 'var(--font-body)',
            }}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* 주제로 찾기 탭 필터 */}
      {activeTab === 1 && (
        <div
          style={{
            padding: '12px var(--space-page)',
            borderBottom: border,
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <button
            onClick={() => setFilterField(null)}
            style={{
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              border: border,
              padding: '4px 12px',
              cursor: 'pointer',
              background: !filterField ? 'var(--color-ink)' : 'var(--color-surface)',
              color: !filterField ? 'var(--color-bg)' : 'var(--color-muted)',
              transition: 'background 0.15s',
              fontFamily: 'var(--font-body)',
            }}
          >
            전체
          </button>
          {allFields.map((field) => (
            <button
              key={field}
              onClick={() => setFilterField(field === filterField ? null : field)}
              style={{
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                border: border,
                padding: '4px 12px',
                cursor: 'pointer',
                background: filterField === field ? 'var(--color-ink)' : 'var(--color-surface)',
                color: filterField === field ? 'var(--color-bg)' : 'var(--color-muted)',
                transition: 'background 0.15s',
                fontFamily: 'var(--font-body)',
              }}
            >
              {fieldMap[field] ?? field}
            </button>
          ))}
        </div>
      )}

      {/* 테이블 */}
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
              style={{
                display: 'grid',
                gridTemplateColumns: '36px 1fr 200px 100px 28px',
                alignItems: 'center',
                gap: '20px',
                padding: '18px 0',
                borderBottom: border,
                cursor: 'pointer',
                transition: 'background 0.15s, padding 0.15s',
                color: 'inherit',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--color-surface)'
                e.currentTarget.style.paddingLeft = '16px'
                e.currentTarget.style.paddingRight = '16px'
                e.currentTarget.style.margin = '0 -16px'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.paddingLeft = '0'
                e.currentTarget.style.paddingRight = '0'
                e.currentTarget.style.margin = '0'
              }}
              className="speaker-row-link"
            >
              {/* 번호 */}
              <span
                style={{
                  fontFamily: 'var(--font-english)',
                  fontSize: '14px',
                  color: 'var(--color-muted)',
                  letterSpacing: '0.04em',
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>

              {/* 이름 + 직함 */}
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '16px',
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    marginBottom: '2px',
                  }}
                >
                  {speaker.name}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 300,
                    color: 'var(--color-subtle)',
                    lineHeight: 1.4,
                  }}
                >
                  {speaker.title}{speaker.company ? ` · ${speaker.company}` : ''}
                </div>
              </div>

              {/* 태그 */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {speaker.fields.slice(0, 2).map((f) => (
                  <span
                    key={f}
                    style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      letterSpacing: '0.07em',
                      textTransform: 'uppercase',
                      border: '1px solid var(--color-border)',
                      padding: '3px 9px',
                      color: 'var(--color-muted)',
                      background: 'var(--color-surface)',
                    }}
                  >
                    {fieldMap[f] ?? f}
                  </span>
                ))}
              </div>

              {/* 상태 */}
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  color: 'var(--color-green)',
                }}
              >
                섭외 가능
              </span>

              {/* 화살표 */}
              <span
                style={{
                  color: 'var(--color-muted)',
                  fontSize: '16px',
                  transition: 'transform 0.2s',
                }}
              >
                →
              </span>
            </Link>
          ))
        )}

        {/* 스텁 Coming Soon row */}
        {filtered.length > 0 && filtered.length < 3 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '36px 1fr 200px 100px 28px',
              alignItems: 'center',
              gap: '20px',
              padding: '18px 0',
              opacity: 0.35,
              pointerEvents: 'none',
            }}
          >
            <span style={{ fontFamily: 'var(--font-english)', fontSize: '14px', color: 'var(--color-muted)' }}>
              {String(filtered.length + 1).padStart(2, '0')}
            </span>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 800, letterSpacing: '-0.02em' }}>
                Coming Soon
              </div>
              <div style={{ fontSize: '12px', fontWeight: 300, color: 'var(--color-subtle)' }}>강사 등록 중</div>
            </div>
            <div><span style={{ fontSize: '10px', border: '1px solid var(--color-border)', padding: '3px 9px', color: 'var(--color-muted)', background: 'var(--color-surface)' }}>미정</span></div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-muted)' }}>—</span>
            <span style={{ color: 'var(--color-muted)', fontSize: '16px' }}>→</span>
          </div>
        )}
      </div>

      {/* 모바일: 좁은 화면에서 태그/상태 숨김 */}
      <style>{`
        @media (max-width: 640px) {
          .speaker-row-link {
            grid-template-columns: 28px 1fr 28px !important;
          }
        }
      `}</style>
    </>
  )
}
