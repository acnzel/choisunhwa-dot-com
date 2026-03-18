import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import type { FeaturedSpeakerItem } from '@/types'
import FeaturedSpeakerCard from '@/components/featured/FeaturedSpeakerCard'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '이달의 강사',
  description: '최선화닷컴이 직접 엄선한 이달의 추천 강사를 만나보세요.',
}

async function getFeaturedSpeakers(): Promise<FeaturedSpeakerItem[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('featured_speakers')
      .select(`
        id, intro, tags, is_visible, home_visible,
        start_date, end_date, sort_order, created_at,
        speaker:speakers ( id, name, title, company, photo_url, bio_short, fields )
      `)
      .eq('is_visible', true)
      .order('sort_order', { ascending: true })

    if (error) return []
    return (data as unknown as FeaturedSpeakerItem[]) ?? []
  } catch {
    return []
  }
}

export default async function FeaturedSpeakersPage() {
  const items = await getFeaturedSpeakers()

  return (
    <div style={{ padding: 'clamp(36px, 5vw, 60px) var(--space-page)' }}>
      {/* 섹션 헤더 */}
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        marginBottom: 'clamp(28px, 4vw, 44px)',
        paddingBottom: '20px',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: 'clamp(24px, 3vw, 40px)',
            letterSpacing: '-0.03em', lineHeight: 1,
          }}>
            이달의 강사
          </h2>
          <p style={{
            fontSize: '13px', fontWeight: 300, color: 'var(--color-subtle)',
            marginTop: '8px', lineHeight: 1.6,
          }}>
            최선화닷컴이 직접 엄선한 이달의 추천 강사입니다.
          </p>
        </div>
        <span style={{
          fontFamily: 'var(--font-english)',
          fontSize: '11px', letterSpacing: '0.12em',
          color: 'var(--color-muted)',
        }}>
          FEATURED
        </span>
      </div>

      {/* 결과 없음 */}
      {items.length === 0 && (
        <div style={{ textAlign: 'center', padding: 'clamp(60px, 10vw, 100px) 0' }}>
          <p style={{
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: '14px', color: 'var(--color-muted)',
            letterSpacing: '0.04em',
          }}>
            아직 등록된 이달의 강사가 없습니다.
          </p>
        </div>
      )}

      {/* 2열 그리드 */}
      {items.length > 0 && (
        <>
          <style>{`
            @media (max-width: 700px) {
              .featured-grid { grid-template-columns: 1fr !important; }
            }
          `}</style>
          <div className="featured-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0 clamp(32px, 5vw, 64px)',
          }}>
            {items.map((item, i) => (
              <FeaturedSpeakerCard key={item.id} item={item} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
