import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import Image from 'next/image'
import type { Insight } from '@/types'
import InsightCarousel from '@/components/insights/InsightCarousel'

export const metadata: Metadata = {
  title: '인사이트',
  description: '최선화닷컴이 큐레이션하는 인사이트 — 강연으로 연결되는 트렌드',
}

const CAROUSEL_COUNT = 4

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

/* ── 태그별 배경 (이미지 없을 때) ── */
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
function formatDate(d: string) {
  return new Date(d)
    .toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
    .replace(/\. /g, '.').replace(/\.$/, '')
}

export default async function IssuePage() {
  const items = await getIssues()
  const carouselItems = items.slice(0, CAROUSEL_COUNT)
  const gridItems     = items.slice(CAROUSEL_COUNT)

  if (items.length === 0) {
    return (
      <div style={{ padding: 'clamp(60px,10vw,120px) var(--space-page)', textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: 'var(--color-muted)' }}>아직 등록된 인사이트가 없습니다.</p>
      </div>
    )
  }

  return (
    <>
      <style>{`
        .ig-grid-card { cursor: pointer; }
        .ig-grid-img img { transition: transform 0.4s ease; }
        .ig-grid-card:hover .ig-grid-img img { transform: scale(1.04); }
        .ig-grid-title { transition: color 0.2s; color: var(--color-ink); }
        .ig-grid-card:hover .ig-grid-title { color: var(--color-green); }
        .ig-grid-tag { color: #777; text-decoration: none; font-size: 12px; transition: color 0.15s; }
        .ig-grid-tag:hover { color: var(--color-green); text-decoration: underline; }
        @media (max-width: 900px) {
          .ig-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .ig-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ paddingBottom: 'clamp(60px, 10vw, 96px)' }}>

        {/* ── 캐러셀 (헤더 포함) ── */}
        <InsightCarousel items={carouselItems} totalCount={items.length} />

        {/* ── 구분선 ── */}
        <hr style={{
          border: 'none', borderTop: '1px solid var(--color-border)',
          margin: 'clamp(40px, 6vw, 64px) var(--space-page) 0',
        }} />

        {/* ── 전체 아티클 그리드 ── */}
        {gridItems.length > 0 && (
          <div style={{ padding: '0 var(--space-page)', marginTop: 'clamp(36px, 5vw, 52px)' }}>

            {/* 섹션 헤더 */}
            <div style={{
              display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
              marginBottom: 'clamp(24px, 4vw, 40px)',
            }}>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontWeight: 400,
                fontSize: 'clamp(20px, 3vw, 26px)', letterSpacing: '-0.5px',
                color: 'var(--color-ink)',
              }}>
                전체 아티클
              </h2>
              <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>
                총 {items.length}건 · 최신 {CAROUSEL_COUNT}개 제외
              </span>
            </div>

            {/* 3열 그리드 */}
            <div
              className="ig-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 'clamp(36px, 5vw, 52px) clamp(16px, 2.5vw, 28px)',
              }}
            >
              {gridItems.map((item) => {
                const tags: string[] = (item.meta as Record<string, unknown>)?.tags as string[] ?? []
                const bg   = getCardBg(tags)
                const date = item.published_at ? formatDate(item.published_at) : ''

                return (
                  <article key={item.id} className="ig-grid-card">
                    {/* 이미지 Link */}
                    <Link
                      href={`/insights/issue/${item.id}`}
                      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                    >
                      <div
                        className="ig-grid-img"
                        style={{
                          width: '100%', aspectRatio: '16 / 10',
                          position: 'relative', overflow: 'hidden',
                          background: bg, marginBottom: 14,
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
                          <div style={{
                            width: '100%', height: '100%',
                            display: 'flex', alignItems: 'flex-end', padding: 18,
                          }}>
                            <p style={{
                              fontFamily: 'var(--font-display)', fontWeight: 800,
                              fontSize: 14, color: 'rgba(255,255,255,0.88)', lineHeight: 1.4,
                              display: '-webkit-box', WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical', overflow: 'hidden',
                            }}>
                              {item.title}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* 제목 */}
                      <h3 className="ig-grid-title" style={{
                        fontSize: 15, fontWeight: 700,
                        lineHeight: 1.5, letterSpacing: '-0.2px',
                        marginBottom: 7,
                        display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {item.title}
                      </h3>

                      {/* 날짜 */}
                      {date && (
                        <p style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 10 }}>
                          {date}
                        </p>
                      )}
                    </Link>

                    {/* 태그 — Link 밖 */}
                    {tags.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 8px' }}>
                        {tags.map((tag) => (
                          <Link
                            key={tag}
                            href={`/speakers?category=${encodeURIComponent(tag)}`}
                            className="ig-grid-tag"
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
      </div>
    </>
  )
}
