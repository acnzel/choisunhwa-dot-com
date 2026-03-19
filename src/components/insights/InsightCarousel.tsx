'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Insight } from '@/types'

/* ── 태그별 이미지 없을 때 배경 ── */
const TAG_BG: Record<string, string> = {
  HR: '#1a1a2e', 리더십: '#16213e', 트렌드: '#0f3460',
  조직문화: '#1b1b2f', 커뮤니케이션: '#162447', 경영전략: '#1f4068',
  동기부여: '#2d132c', 창업: '#1b2a4a', ESG: '#0d2137',
  마케팅: '#1e3a5f', 심리: '#2e1a47', IT: '#0a2a40',
}
function getCardBg(tags: string[]): string {
  for (const t of tags) if (TAG_BG[t]) return TAG_BG[t]
  return '#111827'
}
function formatMonth(d: string) {
  return new Date(d).toLocaleString('en-US', { month: 'short' }) + '.'
}
function formatDate(d: string) {
  return new Date(d)
    .toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
    .replace(/\. /g, '.').replace(/\.$/, '')
}

interface Props {
  items: Insight[]
  totalCount: number
  spaceVar?: string // CSS var name, default '--space-page'
}

export default function InsightCarousel({ items, totalCount, spaceVar = '--space-page' }: Props) {
  const trackRef  = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd,   setAtEnd]   = useState(false)

  const CARD_W = 380
  const GAP    = 28

  function scroll(dir: 'prev' | 'next') {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'next' ? CARD_W + GAP : -(CARD_W + GAP), behavior: 'smooth' })
  }
  function onScroll() {
    const el = trackRef.current
    if (!el) return
    setAtStart(el.scrollLeft <= 4)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4)
  }

  return (
    <>
      <style>{`
        .ic-track::-webkit-scrollbar { display: none; }
        .ic-track { -ms-overflow-style: none; scrollbar-width: none; }
        .ic-card { flex: 0 0 ${CARD_W}px; scroll-snap-align: start; position: relative; cursor: pointer; }
        .ic-img img { transition: transform 0.45s ease; }
        .ic-card:hover .ic-img img { transform: scale(1.04); }
        .ic-title { transition: color 0.2s; color: var(--color-ink); }
        .ic-card:hover .ic-title { color: var(--color-green); }
        .ic-tag { color: #777; text-decoration: none; font-size: 13px; transition: color 0.15s; }
        .ic-tag:hover { color: var(--color-green); text-decoration: underline; }
      `}</style>

      {/* ── 헤더: Insight. 타이틀 + 화살표 ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        borderBottom: '2px solid var(--color-ink)',
        padding: `clamp(32px,5vw,56px) var(${spaceVar}) 18px`,
      }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 900,
          fontSize: 'clamp(56px, 9vw, 100px)',
          letterSpacing: '-0.04em', lineHeight: 1,
          color: 'var(--color-ink)',
        }}>
          Insight<span style={{ color: 'var(--color-green)' }}>.</span>
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--color-muted)', marginRight: 12 }}>
            Total {totalCount}
          </span>
          {(['prev', 'next'] as const).map((dir) => {
            const disabled = dir === 'prev' ? atStart : atEnd
            return (
              <button
                key={dir}
                onClick={() => scroll(dir)}
                disabled={disabled}
                aria-label={dir === 'prev' ? '이전' : '다음'}
                style={{
                  width: 44, height: 44, borderRadius: '50%', border: 'none',
                  cursor: disabled ? 'default' : 'pointer',
                  background: disabled ? '#CCCCCC' : 'var(--color-ink)',
                  color: disabled ? '#999' : '#fff',
                  fontSize: 17, lineHeight: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s',
                  flexShrink: 0,
                }}
              >
                {dir === 'prev' ? '←' : '→'}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── 캐러셀 트랙 ── */}
      <div
        ref={trackRef}
        className="ic-track"
        onScroll={onScroll}
        style={{
          display: 'flex',
          gap: GAP,
          overflowX: 'auto',
          paddingLeft: `var(${spaceVar})`,
          paddingRight: `var(${spaceVar})`,
          paddingTop: 'clamp(28px, 4vw, 40px)',
          paddingBottom: 4,
          scrollSnapType: 'x mandatory',
        }}
      >
        {items.map((item) => {
          const tags: string[]  = (item.meta as Record<string, unknown>)?.tags as string[] ?? []
          const bg    = getCardBg(tags)
          const month = item.published_at ? formatMonth(item.published_at) : ''
          const date  = item.published_at ? formatDate(item.published_at)  : ''

          return (
            <article key={item.id} className="ic-card">

              {/* 워터마크 월 */}
              {month && (
                <div aria-hidden style={{
                  fontFamily: 'var(--font-display)', fontWeight: 900,
                  fontSize: 'clamp(80px, 11vw, 140px)', lineHeight: 1,
                  color: '#EBEBEB', letterSpacing: '-3px',
                  position: 'absolute', top: -20, left: -4,
                  zIndex: 0, pointerEvents: 'none', userSelect: 'none',
                }}>
                  {month}
                </div>
              )}

              {/* 카드 이미지 + 텍스트 */}
              <Link
                href={`/insights/issue/${item.id}`}
                style={{ textDecoration: 'none', color: 'inherit', display: 'block', position: 'relative', zIndex: 1 }}
              >
                {/* 이미지 */}
                <div
                  className="ic-img"
                  style={{
                    width: '100%', height: 240,
                    overflow: 'hidden', background: bg, marginBottom: 16,
                    position: 'relative',
                  }}
                >
                  {item.thumbnail_url ? (
                    <Image
                      src={item.thumbnail_url}
                      alt={item.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes={`${CARD_W}px`}
                    />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%',
                      display: 'flex', alignItems: 'flex-end', padding: 22,
                    }}>
                      <p style={{
                        fontFamily: 'var(--font-display)', fontWeight: 800,
                        fontSize: 17, color: 'rgba(255,255,255,0.88)', lineHeight: 1.4,
                        display: '-webkit-box', WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {item.title}
                      </p>
                    </div>
                  )}
                </div>

                {/* 제목 */}
                <h2 className="ic-title" style={{
                  fontSize: 17, fontWeight: 700,
                  lineHeight: 1.45, letterSpacing: '-0.3px',
                  marginBottom: 9,
                  display: '-webkit-box', WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {item.title}
                </h2>

                {/* 날짜 */}
                {date && (
                  <p style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 10 }}>
                    {date}
                  </p>
                )}
              </Link>

              {/* 태그 — Link 밖 (a inside a 방지) */}
              {tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 10px', position: 'relative', zIndex: 1 }}>
                  {tags.map((tag) => (
                    <Link key={tag} href={`/speakers?category=${encodeURIComponent(tag)}`} className="ic-tag">
                      {tag}
                    </Link>
                  ))}
                </div>
              )}
            </article>
          )
        })}
      </div>
    </>
  )
}
