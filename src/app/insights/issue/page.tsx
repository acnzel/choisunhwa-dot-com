import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import Image from 'next/image'
import type { Insight } from '@/types'

export const metadata: Metadata = {
  title: '인사이트',
  description: '최선화닷컴이 큐레이션하는 인사이트 — 강연으로 연결되는 트렌드',
}

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

// 태그별 배경 컬러 (이미지 없을 때)
const TAG_BG: Record<string, string> = {
  HR:       '#1a1a2e', 리더십: '#16213e', 트렌드: '#0f3460',
  조직문화: '#1b1b2f', 커뮤니케이션: '#162447', 경영전략: '#1f4068',
  동기부여: '#2d132c', 창업: '#1b2a4a', ESG: '#0d2137',
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
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).replace(/\. /g, '.').replace(/\.$/, '')
}

export default async function IssuePage() {
  const items = await getIssues()

  return (
    <>
      <style>{`
        .insight-mag-card {
          display: block; text-decoration: none; color: inherit;
          cursor: pointer;
        }
        .insight-mag-card:hover .insight-mag-img { transform: scale(1.03); }
        .insight-mag-card:hover .insight-mag-title { color: var(--color-green); }
        .insight-mag-img { transition: transform 0.5s ease; }
        .insight-tag-chip {
          font-size: 12px; font-weight: 400;
          color: var(--color-subtle); text-decoration: none;
          transition: color 0.15s;
        }
        .insight-tag-chip:hover { color: var(--color-green); }
        @media (max-width: 640px) {
          .insight-mag-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ padding: 'clamp(32px, 5vw, 60px) var(--space-page)' }}>

        {/* ── 페이지 헤더 ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          marginBottom: 'clamp(32px, 5vw, 56px)',
          borderBottom: '2px solid var(--color-ink)',
          paddingBottom: 16,
        }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: 'clamp(36px, 6vw, 72px)',
            letterSpacing: '-0.04em', lineHeight: 1,
            color: 'var(--color-ink)',
          }}>
            Insight<span style={{ color: 'var(--color-green)' }}>.</span>
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted)', paddingBottom: 4 }}>
            총 {items.length}건
          </p>
        </div>

        {items.length === 0 ? (
          <p style={{ fontSize: 14, color: 'var(--color-muted)', padding: '60px 0', textAlign: 'center' }}>
            아직 등록된 인사이트가 없습니다.
          </p>
        ) : (
          <div
            className="insight-mag-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 'clamp(28px, 4vw, 48px) clamp(20px, 3vw, 40px)',
            }}
          >
            {items.map((item) => {
              const tags: string[] = (item.meta as Record<string, unknown>)?.tags as string[] ?? []
              const cardBg = getCardBg(tags)
              const month = item.published_at ? formatMonth(item.published_at) : ''
              const date  = item.published_at ? formatDate(item.published_at)  : ''

              return (
                <article key={item.id} className="insight-mag-card" style={{ display: 'block' }}>
                  <Link href={`/insights/issue/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  {/* 이미지 영역 */}
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '16 / 10',
                    overflow: 'hidden',
                    marginBottom: 18,
                    background: cardBg,
                  }}>
                    {item.thumbnail_url ? (
                      <Image
                        src={item.thumbnail_url}
                        alt={item.title}
                        fill
                        className="insight-mag-img"
                        style={{ objectFit: 'cover' }}
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />
                    ) : (
                      /* 이미지 없을 때 — 타이틀 텍스트 오버레이 */
                      <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'flex-end',
                        padding: 'clamp(16px, 3vw, 28px)',
                      }}>
                        <p style={{
                          fontFamily: 'var(--font-display)', fontWeight: 900,
                          fontSize: 'clamp(15px, 2vw, 20px)', letterSpacing: '-0.02em',
                          color: 'rgba(255,255,255,0.88)', lineHeight: 1.3,
                          display: '-webkit-box', WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>
                          {item.title}
                        </p>
                      </div>
                    )}

                    {/* 월 표시 — 우측 상단 */}
                    {month && (
                      <div style={{
                        position: 'absolute', top: 12, right: 16,
                        fontFamily: 'var(--font-english)', fontWeight: 700,
                        fontSize: 'clamp(16px, 2.5vw, 22px)',
                        color: 'rgba(255,255,255,0.75)',
                        letterSpacing: '-0.02em',
                        pointerEvents: 'none',
                      }}>
                        {month}
                      </div>
                    )}
                  </div>

                  {/* 텍스트 영역 */}
                  <div>
                    {/* 제목 */}
                    <h2
                      className="insight-mag-title"
                      style={{
                        fontFamily: 'var(--font-display)', fontWeight: 800,
                        fontSize: 'clamp(15px, 1.8vw, 18px)', letterSpacing: '-0.02em',
                        lineHeight: 1.35, color: 'var(--color-ink)',
                        marginBottom: 8,
                        display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        transition: 'color 0.2s',
                      }}
                    >
                      {item.title}
                    </h2>

                    {/* 날짜 */}
                    {date && (
                      <p style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 10 }}>
                        {date}
                      </p>
                    )}
                  </div>
                  </Link>

                  {/* 태그 — Link 밖에서 독립 렌더 (a inside a 방지) */}
                  {tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px 0', marginTop: 10 }}>
                      <span style={{ fontSize: 12, color: 'var(--color-muted)', marginRight: 8, fontWeight: 500 }}>
                        Tag |
                      </span>
                      {tags.map((tag, i) => (
                        <span key={tag} style={{ display: 'flex', alignItems: 'center' }}>
                          <Link href={`/speakers?field=${encodeURIComponent(tag)}`} className="insight-tag-chip">
                            {tag}
                          </Link>
                          {i < tags.length - 1 && (
                            <span style={{ color: 'var(--color-border)', margin: '0 6px', fontSize: 10 }}>·</span>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
