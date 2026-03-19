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

/* ── 태그별 배경 컬러 (이미지 없을 때) ── */
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
    .replace(/\. /g, '.')
    .replace(/\.$/, '')
}

export default async function IssuePage() {
  const items = await getIssues()
  const carouselItems = items.slice(0, CAROUSEL_COUNT)
  const gridItems     = items.slice(CAROUSEL_COUNT)

  return (
    <>
      <style>{`
        .ig-card { cursor: pointer; }
        .ig-card-img img { transition: transform 0.4s; }
        .ig-card:hover .ig-card-img img { transform: scale(1.04); }
        .ig-card-title { transition: color 0.2s; }
        .ig-card:hover .ig-card-title { color: var(--color-green); }
        .ig-tag-kw { color: #777; text-decoration: none; font-size: 12px; white-space: nowrap; transition: color 0.15s; }
        .ig-tag-kw:hover { color: var(--color-green); text-decoration: underline; }
        @media (max-width: 900px) {
          .ig-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .ig-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ padding: 'clamp(32px, 5vw, 60px) 0' }}>

        {/* ── 페이지 헤더 ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          borderBottom: '2px solid var(--color-ink)',
          paddingBottom: 16,
          marginBottom: 'clamp(24px, 4vw, 40px)',
          padding: '0 var(--space-page) 16px',
        }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: 'clamp(56px, 8vw, 100px)',
            letterSpacing: '-0.04em', lineHeight: 1,
            color: 'var(--color-ink)',
          }}>
            Insight<span style={{ color: 'var(--color-green)' }}>.</span>
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted)', paddingBottom: 6 }}>
            총 {items.length}건
          </p>
        </div>

        {items.length === 0 ? (
          <p style={{ fontSize: 14, color: 'var(--color-muted)', padding: '60px var(--space-page)', textAlign: 'center' }}>
            아직 등록된 인사이트가 없습니다.
          </p>
        ) : (
          <>
            {/* ── 최신 캐러셀 ── */}
            <div style={{ paddingLeft: 'var(--space-page)', marginBottom: 'clamp(40px, 6vw, 64px)' }}>
              <InsightCarousel items={carouselItems} />
            </div>

            {/* ── 구분선 ── */}
            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '0 var(--space-page) clamp(32px, 5vw, 48px)' }} />

            {/* ── 전체 그리드 (캐러셀 제외) ── */}
            {gridItems.length > 0 && (
              <div style={{ padding: '0 var(--space-page)' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 'clamp(24px, 4vw, 40px)' }}>
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

                <div
                  className="ig-grid"
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'clamp(32px, 5vw, 48px) clamp(16px, 2.5vw, 28px)' }}
                >
                  {gridItems.map((item) => {
                    const tags: string[] = (item.meta as Record<string, unknown>)?.tags as string[] ?? []
                    const bg   = getCardBg(tags)
                    const date = item.published_at ? formatDate(item.published_at) : ''

                    return (
                      <article key={item.id} className="ig-card">
                        {/* 이미지 Link */}
                        <Link href={`/insights/issue/${item.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                          <div
                            className="ig-card-img"
                            style={{ width: '100%', aspectRatio: '16 / 10', overflow: 'hidden', background: bg, marginBottom: 14, position: 'relative' }}
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
                                  fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 1.4,
                                  display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                }}>
                                  {item.title}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* 제목 */}
                          <h3 className="ig-card-title" style={{
                            fontSize: 15, fontWeight: 700,
                            color: 'var(--color-ink)', lineHeight: 1.5, letterSpacing: '-0.2px',
                            marginBottom: 7,
                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
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
                          <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px 0' }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-ink)', marginRight: 8 }}>Tag</span>
                            <span style={{ color: '#CCC', marginRight: 8, fontSize: 12 }}>|</span>
                            {tags.map((tag) => (
                              <Link key={tag} href={`/speakers?category=${encodeURIComponent(tag)}`} className="ig-tag-kw" style={{ marginRight: 8 }}>
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
          </>
        )}
      </div>
    </>
  )
}
