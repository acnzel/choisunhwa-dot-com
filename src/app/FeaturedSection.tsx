import Link from 'next/link'
import type { FeaturedSpeakerItem } from '@/types'
import FeaturedSpeakerCard from '@/components/featured/FeaturedSpeakerCard'

interface Props {
  items: FeaturedSpeakerItem[]
}

export default function FeaturedSection({ items }: Props) {
  // home_visible=true인 항목이 없으면 섹션 자체 숨김
  if (items.length === 0) return null

  return (
    <section className="reveal" style={{ borderBottom: '1px solid var(--color-border)' }} id="featured">
      <style>{`
        @media (max-width: 700px) {
          .home-featured-grid { grid-template-columns: 1fr !important; }
          .home-featured-col { border-right: none !important; padding-right: 0 !important; padding-left: 0 !important; }
        }
      `}</style>

      {/* 섹션 헤더 */}
      <div className="section-hd" style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        padding: '28px var(--space-page) 22px',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontWeight: 900,
          fontSize: 'clamp(26px, 3vw, 44px)', letterSpacing: '-0.03em', lineHeight: 1,
        }}>
          에디터 픽{' '}
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: '13px', color: 'var(--color-muted)', marginLeft: '8px' }}>
            Editor's Pick
          </span>
        </h2>
        <Link href="/insights/featured" className="see-all-link">전체 보기 →</Link>
      </div>

      {/* 2열 그리드 */}
      <div className="home-featured-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '0',
        padding: '0 var(--space-page)',
      }}>
        {items.map((item, i) => (
          <div
            key={item.id}
            className="home-featured-col"
            style={{
              borderRight: i % 2 === 0 ? '1px solid var(--color-border)' : 'none',
              paddingRight: i % 2 === 0 ? 'clamp(24px, 3vw, 48px)' : '0',
              paddingLeft: i % 2 === 1 ? 'clamp(24px, 3vw, 48px)' : '0',
            }}
          >
            <FeaturedSpeakerCard item={item} />
          </div>
        ))}
      </div>
    </section>
  )
}
