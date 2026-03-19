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

interface Props {
  insight: Insight
}

export default function InsightDetail({ insight }: Props) {
  const labelColor = TYPE_COLOR[insight.type] ?? '#374151'
  const backHref = `/insights/${insight.type}`

  return (
    <article style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(28px, 5vw, 60px) var(--space-page)' }}>

      {/* 뒤로가기 */}
      <Link
        href={backHref}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 13,
          color: 'var(--color-subtle)',
          textDecoration: 'none',
          marginBottom: 32,
        }}
      >
        ← {TYPE_LABEL[insight.type]} 목록으로
      </Link>

      {/* 타입 뱃지 */}
      <div style={{ marginBottom: 16 }}>
        <span style={{
          display: 'inline-block',
          fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
          padding: '4px 12px',
          background: labelColor + '18',
          color: labelColor,
          borderRadius: 2,
          textTransform: 'uppercase',
        }}>
          {TYPE_LABEL[insight.type]}
        </span>
      </div>

      {/* 제목 */}
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(22px, 4vw, 36px)',
        fontWeight: 800,
        letterSpacing: '-0.03em',
        lineHeight: 1.25,
        color: 'var(--color-ink)',
        marginBottom: 20,
      }}>
        {insight.title}
      </h1>

      {/* 요약 */}
      {insight.summary && (
        <p style={{
          fontSize: 'clamp(15px, 2vw, 18px)',
          fontWeight: 400,
          color: 'var(--color-subtle)',
          lineHeight: 1.7,
          marginBottom: 20,
          borderLeft: `3px solid ${labelColor}`,
          paddingLeft: 16,
        }}>
          {insight.summary}
        </p>
      )}

      {/* 날짜 */}
      {insight.published_at && (
        <div style={{
          fontSize: 12,
          color: 'var(--color-muted)',
          marginBottom: 32,
          paddingBottom: 24,
          borderBottom: '1px solid var(--color-border)',
        }}>
          {new Date(insight.published_at).toLocaleDateString('ko-KR', {
            year: 'numeric', month: 'long', day: 'numeric',
          })}
          {'  ·  '}
          {insight.meta && 'read_time' in (insight.meta as Record<string, unknown>)
            ? `약 ${(insight.meta as Record<string, unknown>).read_time}분 읽기`
            : '5분 읽기'}
        </div>
      )}

      {/* 썸네일 */}
      {insight.thumbnail_url && (
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          borderRadius: 4,
          overflow: 'hidden',
          marginBottom: 40,
        }}>
          <Image
            src={insight.thumbnail_url}
            alt={insight.title}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, 760px"
            priority
          />
        </div>
      )}

      {/* 본문 HTML */}
      {insight.content_html && (
        <div
          className="insight-body"
          dangerouslySetInnerHTML={{ __html: insight.content_html }}
          style={{
            fontSize: 'clamp(15px, 2vw, 17px)',
            lineHeight: 1.85,
            color: 'var(--color-ink)',
          }}
        />
      )}

      {/* 하단 구분 + 목록 버튼 */}
      <div style={{
        marginTop: 64,
        paddingTop: 32,
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <Link
          href={backHref}
          style={{
            display: 'inline-block',
            padding: '10px 24px',
            background: 'transparent',
            border: '1px solid var(--color-border)',
            color: 'var(--color-ink)',
            fontSize: 13,
            fontWeight: 600,
            textDecoration: 'none',
            borderRadius: 2,
          }}
        >
          ← 목록으로
        </Link>
        <Link
          href="/inquiry/lecture"
          style={{
            display: 'inline-block',
            padding: '10px 24px',
            background: 'var(--color-ink)',
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            textDecoration: 'none',
            borderRadius: 2,
          }}
        >
          강연 의뢰하기 →
        </Link>
      </div>

    </article>
  )
}
