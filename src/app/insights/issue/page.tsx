import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import Image from 'next/image'
import type { Insight } from '@/types'

export const metadata: Metadata = {
  title: '인사이트',
  description: '최선화닷컴이 큐레이션하는 인사이트 — 강연으로 연결되는 트렌드',
}

export const revalidate = 60

const PAGE_SIZE = 12

interface SearchParams {
  page?: string
}

async function getIssues(params: SearchParams) {
  const page = Math.max(1, Number(params.page ?? 1) || 1)
  try {
    const admin = createAdminClient()
    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1
    const { data, error, count } = await admin
      .from('insights')
      .select('*', { count: 'exact' })
      .eq('type', 'issue')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(from, to)
    if (error) throw error
    return {
      items: (data as Insight[]) ?? [],
      total: count ?? 0,
      page,
      totalPages: Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE)),
    }
  } catch {
    return { items: [], total: 0, page, totalPages: 1 }
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

/* ── 페이지네이션 범위 계산 (현재 페이지 주변 ±4 + 처음/끝) ── */
function getPaginationRange(current: number, total: number): (number | '…')[] {
  if (total <= 10) return Array.from({ length: total }, (_, i) => i + 1)
  let start = Math.max(1, current - 4)
  let end = start + 9
  if (end > total) { end = total; start = Math.max(1, end - 9) }
  const pages: (number | '…')[] = []
  if (start > 1) { pages.push(1); if (start > 2) pages.push('…') }
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < total) { if (end < total - 1) pages.push('…'); pages.push(total) }
  return pages
}
function pageHref(page: number) {
  return page > 1 ? `/insights/issue?page=${page}` : '/insights/issue'
}

export default async function IssuePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const { items, total, page, totalPages } = await getIssues(params)

  if (total === 0) {
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
        .ig-page-btn { width: 36px; height: 36px; border-radius: 8px; border: 1px solid var(--color-border);
          background: var(--color-bg); font-size: 14px; color: var(--color-subtle);
          display: inline-flex; align-items: center; justify-content: center;
          text-decoration: none; font-weight: 500; transition: background .15s, color .15s, border-color .15s; }
        .ig-page-btn:hover { background: var(--color-surface); }
        .ig-page-btn.active { background: var(--color-ink); color: #fff; border-color: var(--color-ink); font-weight: 700; }
        .ig-page-btn.disabled { color: var(--color-muted); border-color: var(--color-border); opacity: 0.4; pointer-events: none; }
      `}</style>

      <div style={{ padding: '0 var(--space-page)', paddingTop: 'clamp(28px, 4vw, 40px)', paddingBottom: 'clamp(60px, 10vw, 96px)' }}>

        {/* ── 헤더 ── */}
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
            총 {total}건
          </span>
        </div>

        {/* ── 3열 타일 그리드 ── */}
        <div
          className="ig-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'clamp(36px, 5vw, 52px) clamp(16px, 2.5vw, 28px)',
          }}
        >
          {items.map((item) => {
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

        {/* ── 페이지네이션 ── */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 'clamp(40px, 6vw, 64px)', flexWrap: 'wrap' }}>
            {page > 1 ? (
              <Link href={pageHref(page - 1)} className="ig-page-btn">‹</Link>
            ) : (
              <span className="ig-page-btn disabled">‹</span>
            )}
            {getPaginationRange(page, totalPages).map((p, i) =>
              p === '…' ? (
                <span key={`e-${i}`} className="ig-page-btn" style={{ border: 'none', background: 'transparent' }}>…</span>
              ) : (
                <Link key={p} href={pageHref(p as number)} className={`ig-page-btn${p === page ? ' active' : ''}`}>
                  {p}
                </Link>
              )
            )}
            {page < totalPages ? (
              <Link href={pageHref(page + 1)} className="ig-page-btn">›</Link>
            ) : (
              <span className="ig-page-btn disabled">›</span>
            )}
          </div>
        )}
      </div>
    </>
  )
}
