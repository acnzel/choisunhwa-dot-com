import Image from 'next/image'
import Link from 'next/link'
import type { Insight } from '@/types'

const TYPE_LABEL: Record<string, string> = {
  issue:  '트렌드 브리핑',
  report: '강연 현장',
  pick:   '에디터 추천 강사',
}
const TYPE_COLOR: Record<string, string> = {
  issue:  '#1d4ed8',
  report: '#15803d',
  pick:   '#7e22ce',
}
const TYPE_BG: Record<string, string> = {
  issue:  '#eff6ff',
  report: '#f0fdf4',
  pick:   '#fdf4ff',
}

interface Props {
  insight: Insight
  href: string
  size?: 'large' | 'normal'
}

export default function InsightCard({ insight, href, size = 'normal' }: Props) {
  const isLarge = size === 'large'
  const labelColor = TYPE_COLOR[insight.type] ?? '#374151'
  const labelBg = TYPE_BG[insight.type] ?? '#f3f4f6'

  return (
    <Link
      href={href}
      style={{
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
        background: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      className="insight-card"
    >
      {/* 썸네일 */}
      <div style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 9',
        background: 'var(--color-surface)',
        overflow: 'hidden',
      }}>
        {insight.thumbnail_url ? (
          <Image
            src={insight.thumbnail_url}
            alt={insight.title}
            fill
            style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }}
            className="insight-card-img"
            sizes={isLarge ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 640px) 100vw, 33vw'}
          />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'var(--color-surface)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 32, opacity: 0.3 }}>
              {insight.type === 'issue' ? '📰' : insight.type === 'report' ? '📸' : '✨'}
            </span>
          </div>
        )}
      </div>

      {/* 본문 */}
      <div style={{ padding: isLarge ? '20px 24px 24px' : '14px 16px 18px' }}>
        {/* 타입 뱃지 */}
        <span style={{
          display: 'inline-block',
          fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
          padding: '2px 10px', marginBottom: 10,
          background: labelBg, color: labelColor,
          borderRadius: 2,
        }}>
          {TYPE_LABEL[insight.type]}
        </span>

        {/* 제목 */}
        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: isLarge ? 'clamp(15px, 1.6vw, 19px)' : 'clamp(13px, 1.3vw, 16px)',
          letterSpacing: '-0.02em',
          lineHeight: 1.3,
          color: 'var(--color-ink)',
          marginBottom: 8,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {insight.title}
        </div>

        {/* 요약 */}
        {insight.summary && (
          <div style={{
            fontSize: 13, fontWeight: 300,
            color: 'var(--color-subtle)',
            lineHeight: 1.6,
            display: '-webkit-box',
            WebkitLineClamp: isLarge ? 3 : 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {insight.summary}
          </div>
        )}

        {/* 날짜 */}
        {insight.published_at && (
          <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 12 }}>
            {new Date(insight.published_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        )}
      </div>
    </Link>
  )
}
