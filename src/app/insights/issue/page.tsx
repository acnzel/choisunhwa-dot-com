import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import Image from 'next/image'
import type { Insight } from '@/types'

export const metadata: Metadata = {
  title: '인사이트',
  description: '최선화닷컴이 큐레이션하는 인사이트 — 강연으로 연결되는 트렌드',
}

const FEATURED_COUNT = 3

async function getIssues(): Promise<Insight[]> {
  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('insights')
      .select('*')
      .eq('type', 'issue')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
    if (error) throw error
    return (data as Insight[]) ?? []
  } catch {
    return []
  }
}

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
function formatDate(dateStr: string): string {
  return new Date(dateStr)
    .toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
    .replace(/\. /g, '.').replace(/\.$/, '')
}
function formatMonth(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', { month: 'short' }) + '.'
}

export default async function IssuePage() {
  const items = await getIssues()
  const featuredItems = items.slice(0, FEATURED_COUNT)
  const listItems     = items.slice(FEATURED_COUNT)

  return (
    <>
      <style>{`
        /* ── 공통 호버 ── */
        .ig-feat-card:hover .ig-feat-img img { transform: scale(1.04); }
        .ig-feat-img img { transition: transform 0.4s ease; }
        .ig-feat-title { transition: color 0.2s; }
        .ig-feat-card:hover .ig-feat-title { color: var(--color-green); }

        .ig-list-title { transition: color 0.2s; }
        .ig-list-item:hover .ig-list-title { color: var(--color-green); }
        .ig-list-item:hover .ig-list-img img { transform: scale(1.04); }
        .ig-list-img img { transition: transform 0.4s ease; }

        .ig-tag { color: #888; text-decoration: none; font-size: 12px; transition: color 0.15s; }
        .ig-tag:hover { color: var(--color-green); text-decoration: underline; }

        /* ── 반응형 ── */
        @media (max-width: 900px) {
          .ig-feat-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .ig-list-row { grid-template-columns: 200px 1fr !important; }
        }
        @media (max-width: 600px) {
          .ig-feat-grid { grid-template-columns: 1fr !important; }
          .ig-list-row { grid-template-columns: 1fr !important; }
          .ig-list-row .ig-list-img { width: 100% !important; height: 200px !important; }
        }
      `}</style>

      <div style={{ paddingBottom: 'clamp(48px, 8vw, 96px)' }}>

        {/* ── 페이지 헤더 ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          borderBottom: '2px solid var(--color-ink)',
          padding: 'clamp(32px, 5vw, 56px) var(--space-page) 18px',
        }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: 'clamp(52px, 8vw, 96px)',
            letterSpacing: '-0.04em', lineHeight: 1,
            color: 'var(--color-ink)',
          }}>
            Insight<span style={{ color: 'var(--color-green)' }}>.</span>
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted)', paddingBottom: 8 }}>
            Total {items.length}
          </p>
        </div>

        {items.length === 0 ? (
          <p style={{ fontSize: 14, color: 'var(--color-muted)', padding: '60px var(--space-page)', textAlign: 'center' }}>
            아직 등록된 인사이트가 없습니다.
          </p>
        ) : (
          <>
            {/* ══════════════════════════════════════
                FEATURED — 최신 3개 카드 그리드
            ══════════════════════════════════════ */}
            {featuredItems.length > 0 && (
              <div style={{ padding: 'clamp(32px, 5vw, 48px) var(--space-page) 0' }}>
                <div
                  className="ig-feat-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 'clamp(24px, 3vw, 36px)',
                  }}
                >
                  {featuredItems.map((item) => {
                    const tags: string[] = (item.meta as Record<string, unknown>)?.tags as string[] ?? []
                    const bg    = getCardBg(tags)
                    const date  = item.published_at ? formatDate(item.published_at) : ''
                    const month = item.published_at ? formatMonth(item.published_at) : ''

                    return (
                      <article key={item.id} className="ig-feat-card" style={{ cursor: 'pointer' }}>

                        {/* 월 워터마크 */}
                        {month && (
                          <div aria-hidden style={{
                            fontFamily: 'var(--font-display)', fontWeight: 900,
                            fontSize: 'clamp(48px, 7vw, 80px)',
                            color: 'var(--color-border)',
                            lineHeight: 1, letterSpacing: '-2px',
                            marginBottom: -8,
                            userSelect: 'none',
                          }}>
                            {month}
                          </div>
                        )}

                        {/* 이미지 */}
                        <Link href={`/insights/issue/${item.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                          <div
                            className="ig-feat-img"
                            style={{
                              width: '100%', aspectRatio: '3 / 2',
                              position: 'relative', overflow: 'hidden',
                              background: bg, marginBottom: 16,
                            }}
                          >
                            {item.thumbnail_url ? (
                              <Image
                                src={item.thumbnail_url}
                                alt={item.title}
                                fill
                                style={{ objectFit: 'cover' }}
                                sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                              />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', padding: 20 }}>
                                <p style={{
                                  fontFamily: 'var(--font-display)', fontWeight: 800,
                                  fontSize: 16, color: 'rgba(255,255,255,0.85)', lineHeight: 1.4,
                                  display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                }}>
                                  {item.title}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* 제목 */}
                          <h2 className="ig-feat-title" style={{
                            fontSize: 'clamp(15px, 1.8vw, 18px)', fontWeight: 700,
                            color: 'var(--color-ink)', lineHeight: 1.45, letterSpacing: '-0.3px',
                            marginBottom: 8,
                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                          }}>
                            {item.title}
                          </h2>

                          {/* 날짜 */}
                          {date && (
                            <p style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 10 }}>
                              {date}
                            </p>
                          )}
                        </Link>

                        {/* 태그 (Link 밖 — a inside a 방지) */}
                        {tags.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 10px' }}>
                            {tags.map((tag) => (
                              <Link
                                key={tag}
                                href={`/speakers?category=${encodeURIComponent(tag)}`}
                                className="ig-tag"
                              >
                                {tag}
                              </Link>
                            ))}
                          </div>
                        )}
                      </article>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════
                LIST — 나머지 전체 아티클
            ══════════════════════════════════════ */}
            {listItems.length > 0 && (
              <div style={{ padding: '0 var(--space-page)', marginTop: 'clamp(48px, 7vw, 72px)' }}>

                {/* 섹션 헤더 */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                  borderTop: '1px solid var(--color-border)',
                  paddingTop: 20, marginBottom: 'clamp(24px, 4vw, 40px)',
                }}>
                  <h2 style={{
                    fontFamily: 'var(--font-display)', fontWeight: 400,
                    fontSize: 'clamp(18px, 2.5vw, 24px)', letterSpacing: '-0.3px',
                    color: 'var(--color-ink)',
                  }}>
                    전체 아티클
                  </h2>
                  <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>
                    {listItems.length}건
                  </span>
                </div>

                {/* 아티클 리스트 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {listItems.map((item) => {
                    const tags: string[] = (item.meta as Record<string, unknown>)?.tags as string[] ?? []
                    const bg      = getCardBg(tags)
                    const date    = item.published_at ? formatDate(item.published_at) : ''
                    const summary = item.summary ?? ''

                    return (
                      <article
                        key={item.id}
                        className="ig-list-item"
                        style={{
                          borderTop: '1px solid var(--color-border)',
                          padding: 'clamp(24px, 3.5vw, 36px) 0',
                        }}
                      >
                        <div
                          className="ig-list-row"
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'clamp(180px, 22vw, 280px) 1fr',
                            gap: 'clamp(20px, 3vw, 40px)',
                            alignItems: 'flex-start',
                          }}
                        >
                          {/* 이미지 */}
                          <Link href={`/insights/issue/${item.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                            <div
                              className="ig-list-img"
                              style={{
                                width: '100%', aspectRatio: '3 / 2',
                                position: 'relative', overflow: 'hidden',
                                background: bg, flexShrink: 0,
                              }}
                            >
                              {item.thumbnail_url ? (
                                <Image
                                  src={item.thumbnail_url}
                                  alt={item.title}
                                  fill
                                  style={{ objectFit: 'cover' }}
                                  sizes="(max-width: 600px) 100vw, 280px"
                                />
                              ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', padding: 16 }}>
                                  <p style={{
                                    fontFamily: 'var(--font-display)', fontWeight: 800,
                                    fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.4,
                                    display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                  }}>
                                    {item.title}
                                  </p>
                                </div>
                              )}
                            </div>
                          </Link>

                          {/* 텍스트 */}
                          <div>
                            <Link href={`/insights/issue/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                              <h3 className="ig-list-title" style={{
                                fontSize: 'clamp(16px, 2vw, 20px)', fontWeight: 700,
                                color: 'var(--color-ink)', lineHeight: 1.4, letterSpacing: '-0.3px',
                                marginBottom: 12,
                                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                              }}>
                                {item.title}
                              </h3>

                              {summary && (
                                <p style={{
                                  fontSize: 14, color: 'var(--color-muted)', lineHeight: 1.75,
                                  marginBottom: 14,
                                  display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                }}>
                                  {summary}
                                </p>
                              )}

                              {date && (
                                <p style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 12 }}>
                                  {date}
                                </p>
                              )}
                            </Link>

                            {/* 태그 (Link 밖 — a inside a 방지) */}
                            {tags.length > 0 && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 10px' }}>
                                {tags.map((tag) => (
                                  <Link
                                    key={tag}
                                    href={`/speakers?category=${encodeURIComponent(tag)}`}
                                    className="ig-tag"
                                  >
                                    {tag}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
