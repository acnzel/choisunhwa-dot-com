import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import Image from 'next/image'
import Link from 'next/link'
import type { Insight, InsightMetaPick, Speaker } from '@/types'

export const metadata: Metadata = {
  title: '이 강사 어때요?',
  description: '운영진이 직접 큐레이션한 이달의 강사 에디터 픽',
}

interface PickWithSpeaker extends Insight {
  speaker?: Speaker | null
}

async function getPicks(): Promise<PickWithSpeaker[]> {
  try {
    const admin = createAdminClient()
    const { data: picks, error } = await admin
      .from('insights')
      .select('*')
      .eq('type', 'pick')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
    if (error) throw error
    if (!picks?.length) return []

    // 관련 강사 데이터 로드
    const speakerIds = (picks as Insight[])
      .map(p => (p.meta as InsightMetaPick)?.speaker_id)
      .filter(Boolean) as string[]

    let speakers: Speaker[] = []
    if (speakerIds.length > 0) {
      const { data: spData } = await admin
        .from('speakers')
        .select('id, name, photo_url, title, company, fields')
        .in('id', speakerIds)
      speakers = (spData as Speaker[]) ?? []
    }

    return (picks as Insight[]).map(p => ({
      ...p,
      speaker: speakers.find(s => s.id === (p.meta as InsightMetaPick)?.speaker_id) ?? null,
    }))
  } catch {
    return []
  }
}

export default async function PickPage() {
  const items = await getPicks()

  if (items.length === 0) return null

  return (
    <section style={{ padding: 'clamp(28px, 4vw, 44px) var(--space-page)' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 24,
      }}>
        {items.map(item => {
          const meta = item.meta as InsightMetaPick
          const speaker = item.speaker

          return (
            <div key={item.id} style={{
              border: '1px solid var(--color-border)',
              overflow: 'hidden',
              background: 'var(--color-bg)',
            }}>
              {/* 강사 사진 + 이름 */}
              {speaker && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '20px 20px 16px',
                  borderBottom: '1px solid var(--color-border)',
                }}>
                  <div style={{
                    position: 'relative', width: 72, height: 72,
                    background: 'var(--color-surface)', flexShrink: 0,
                    overflow: 'hidden',
                  }}>
                    {speaker.photo_url && (
                      <Image
                        src={speaker.photo_url} alt={speaker.name}
                        fill style={{ objectFit: 'cover', objectPosition: 'top' }}
                        sizes="72px"
                      />
                    )}
                  </div>
                  <div>
                    <div style={{
                      fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
                      color: '#7e22ce', marginBottom: 4,
                    }}>
                      이달의 강사
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-display)', fontWeight: 800,
                      fontSize: 18, letterSpacing: '-0.02em',
                      color: 'var(--color-ink)',
                    }}>
                      {speaker.name}
                    </div>
                    {speaker.title && (
                      <div style={{ fontSize: 12, color: 'var(--color-subtle)', marginTop: 2 }}>
                        {speaker.title}{speaker.company ? ` · ${speaker.company}` : ''}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 선정 이유 */}
              <div style={{ padding: '16px 20px' }}>
                {meta?.reason && (
                  <p style={{
                    fontSize: 14, lineHeight: 1.7,
                    color: 'var(--color-ink)', marginBottom: 16,
                    fontStyle: 'italic',
                  }}>
                    &ldquo;{meta.reason}&rdquo;
                  </p>
                )}

                {/* 추천 강연 주제 */}
                {meta?.topics && meta.topics.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{
                      fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                      color: 'var(--color-muted)', marginBottom: 8,
                    }}>
                      추천 강연 주제
                    </div>
                    {meta.topics.map((t, i) => (
                      <div key={i} style={{
                        fontSize: 13, padding: '4px 0',
                        color: 'var(--color-subtle)',
                        borderBottom: '1px solid var(--color-border)',
                      }}>
                        · {t}
                      </div>
                    ))}
                  </div>
                )}

                {/* 문의 CTA */}
                {speaker && (
                  <Link
                    href={`/speakers/${speaker.id}`}
                    style={{
                      display: 'block', width: '100%',
                      padding: '10px', textAlign: 'center',
                      background: 'var(--color-ink)', color: 'var(--color-bg)',
                      fontSize: 12, fontWeight: 700, letterSpacing: '0.06em',
                      textDecoration: 'none',
                    }}
                  >
                    이 강사 보러가기 →
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
