'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Insight } from '@/types'

/* ── 태그별 배경 컬러 (이미지 없을 때 폴백) ── */
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

function formatMonth(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleString('en-US', { month: 'short' }) + '.'
}
function formatDate(dateStr: string): string {
  return new Date(dateStr)
    .toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
    .replace(/\. /g, '.')
    .replace(/\.$/, '')
}

interface Props {
  items: Insight[]
}

export default function InsightCarousel({ items }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const CARD_W = 400
  const GAP = 32

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
        .ic-card-img img { transition: transform 0.45s ease; }
        .ic-card:hover .ic-card-img img { transform: scale(1.04); }
        .ic-card-title { transition: color 0.2s; }
        .ic-card:hover .ic-card-title { color: var(--color-green); }
        .ic-tag-kw { color: #777; text-decoration: none; font-size: 13px; white-space: nowrap; transition: color 0.15s; }
        .ic-tag-kw:hover { color: var(--color-green); text-decoration: underline; }
      `}</style>

      {/* ── 캐러셀 트랙 ── */}
      <div
        ref={trackRef}
        className="ic-track"
        onScroll={onScroll}
        style={{
          display: 'flex',
          gap: GAP,
          overflowX: 'auto',
          paddingRight: 'var(--space-page)',
          scrollSnapType: 'x mandatory',
        }}
      >
        {items.map((item) => {
          const tags: string[] = (item.meta as Record<string, unknown>)?.tags as string[] ?? []
          const bg   = getCardBg(tags)
          const month = item.published_at ? formatMonth(item.published_at) : ''
          const date  = item.published_at ? formatDate(item.published_at) : ''

          return (
            <article
              key={item.id}
              className="ic-card"
              style={{ flex: `0 0 ${CARD_W}px`, scrollSnapAlign: 'start', position: 'relative' }}
            >
              {/* 워터마크 월 */}
              {month && (
                <div aria-hidden style={{
                  fontFamily: 'var(--font-display)', fontWeight: 900,
                  fontSize: 120, lineHeight: 1,
                  color: '#EBEBEB',
                  position: 'absolute', top: -18, left: -4,
                  zIndex: 0, pointerEvents: 'none', userSelect: 'none',
                  letterSpacing: '-3px',
                }}>
                  {month}
                </div>
              )}

              {/* 카드 본문 (Link) */}
              <Link href={`/insights/issue/${item.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', position: 'relative', zIndex: 1 }}>
                {/* 이미지 */}
                <div
                  className="ic-card-img"
                  style={{ width: '100%', height: 170, overflow: 'hidden', background: bg, marginBottom: 14, position: 'relative' }}
                >
                  {item.thumbnail_url ? (
                    <Image
                      src={item.thumbnail_url}
                      alt={item.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="400px"
                    />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%',
                      display: 'flex', alignItems: 'flex-end',
                      padding: 24,
                    }}>
                      <p style={{
                        fontFamily: 'var(--font-display)', fontWeight: 800,
                        fontSize: 18, color: 'rgba(255,255,255,0.85)', lineHeight: 1.35,
                        display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {item.title}
                      </p>
                    </div>
                  )}
                </div>

                {/* 제목 */}
                <h2 className="ic-card-title" style={{
                  fontSize: 17, fontWeight: 700,
                  color: 'var(--color-ink)', lineHeight: 1.45, letterSpacing: '-0.3px',
                  marginBottom: 9,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
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
                <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px 6px', position: 'relative', zIndex: 1 }}>
                  {tags.map((tag) => (
                    <Link key={tag} href={`/speakers?category=${encodeURIComponent(tag)}`} className="ic-tag-kw">
                      {tag}
                    </Link>
                  ))}
                </div>
              )}
            </article>
          )
        })}
      </div>

      {/* ── ← → 화살표 (트랙 아래) ── */}
      <div style={{ display: 'flex', gap: 10, marginTop: 32 }}>
        <button
          onClick={() => scroll('prev')}
          disabled={atStart}
          style={{
            width: 50, height: 50, borderRadius: '50%', border: 'none', cursor: atStart ? 'default' : 'pointer',
            background: atStart ? '#CCCCCC' : 'var(--color-ink)',
            color: atStart ? '#999' : '#fff',
            fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s',
          }}
          aria-label="이전"
        >
          ←
        </button>
        <button
          onClick={() => scroll('next')}
          disabled={atEnd}
          style={{
            width: 50, height: 50, borderRadius: '50%', border: 'none', cursor: atEnd ? 'default' : 'pointer',
            background: atEnd ? '#CCCCCC' : 'var(--color-ink)',
            color: atEnd ? '#999' : '#fff',
            fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s',
          }}
          aria-label="다음"
        >
          →
        </button>
      </div>
    </>
  )
}
