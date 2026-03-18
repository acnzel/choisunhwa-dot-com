import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import Image from 'next/image'
import Link from 'next/link'
import type { Insight, InsightMetaPick, Speaker } from '@/types'

export const metadata: Metadata = {
  title: '이 강사 어때요?',
  description: '운영진이 직접 큐레이션한 이 달의 강사 에디터 픽',
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

    const speakerIds = (picks as Insight[])
      .map(p => (p.meta as InsightMetaPick)?.speaker_id)
      .filter(Boolean) as string[]

    let speakers: Speaker[] = []
    if (speakerIds.length > 0) {
      const { data: spData } = await admin
        .from('speakers')
        .select('id, name, photo_url, title, company, fields, bio_short')
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

  return (
    <>
      <style>{`
        .pick-card {
          display: grid;
          grid-template-columns: 340px 1fr;
          border-bottom: 1px solid var(--color-border);
          overflow: hidden;
          transition: background 0.15s;
        }
        .pick-card:hover { background: var(--color-surface); }
        .pick-photo {
          position: relative;
          background: var(--color-surface);
          overflow: hidden;
          aspect-ratio: 3/4;
        }
        .pick-body {
          padding: clamp(28px, 4vw, 48px) clamp(24px, 3vw, 40px);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 20px;
          border-left: 1px solid var(--color-border);
        }
        .pick-topics-item {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 10px 0;
          border-bottom: 1px solid var(--color-border);
          font-size: 13px; color: var(--color-subtle); line-height: 1.5;
        }
        .pick-cta {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 28px;
          background: var(--color-ink); color: var(--color-bg);
          font-size: 12px; font-weight: 700; letter-spacing: 0.08em;
          text-decoration: none;
          transition: background 0.2s;
          align-self: flex-start;
        }
        .pick-cta:hover { background: var(--color-rust); }
        .pick-empty {
          padding: clamp(60px, 10vw, 120px) var(--space-page);
          text-align: center;
          color: var(--color-muted);
          font-size: 14px;
        }
        @media (max-width: 760px) {
          .pick-card {
            grid-template-columns: 1fr;
          }
          .pick-photo {
            aspect-ratio: 4/3;
          }
          .pick-body {
            border-left: none;
            border-top: 1px solid var(--color-border);
          }
        }
      `}</style>

      <div>
        {items.length === 0 ? (
          <div className="pick-empty">
            <p style={{ marginBottom: 8 }}>아직 등록된 에디터 픽이 없습니다.</p>
            <p style={{ fontSize: 12 }}>곧 운영진이 엄선한 강사를 소개해 드릴게요.</p>
          </div>
        ) : (
          <div>
            {items.map((item, idx) => {
              const meta = item.meta as InsightMetaPick
              const speaker = item.speaker
              const isFirst = idx === 0

              return (
                <div key={item.id} className="pick-card">
                  {/* 좌측: 강사 사진 */}
                  <div className="pick-photo">
                    {/* 에디터 픽 배지 */}
                    <div style={{
                      position: 'absolute', top: 16, left: 16, zIndex: 2,
                      background: '#7e22ce', color: '#fff',
                      fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
                      padding: '4px 12px',
                    }}>
                      EDITOR&apos;S PICK
                    </div>

                    {speaker?.photo_url ? (
                      <Image
                        src={speaker.photo_url}
                        alt={speaker.name ?? '강사'}
                        fill
                        style={{ objectFit: 'cover', objectPosition: 'top center' }}
                        sizes="(max-width: 760px) 100vw, 340px"
                        priority={isFirst}
                      />
                    ) : (
                      <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: '#f5f0ff',
                      }}>
                        <span style={{ fontSize: 48, opacity: 0.3 }}>✨</span>
                      </div>
                    )}
                  </div>

                  {/* 우측: 콘텐츠 */}
                  <div className="pick-body">
                    {/* 상단: 강사 정보 */}
                    <div>
                      {/* 강사 이름 + 직함 */}
                      {speaker && (
                        <div style={{ marginBottom: 20 }}>
                          <div style={{
                            fontSize: 11, fontWeight: 600, letterSpacing: '0.1em',
                            color: '#7e22ce', marginBottom: 8,
                            textTransform: 'uppercase',
                          }}>
                            이 강사 어때요?
                          </div>
                          <h2 style={{
                            fontFamily: 'var(--font-display)', fontWeight: 900,
                            fontSize: 'clamp(28px, 3.5vw, 42px)',
                            letterSpacing: '-0.03em', lineHeight: 1.1,
                            color: 'var(--color-ink)', marginBottom: 8,
                          }}>
                            {speaker.name}
                          </h2>
                          {(speaker.title || speaker.company) && (
                            <p style={{
                              fontSize: 13, color: 'var(--color-subtle)', fontWeight: 400,
                            }}>
                              {[speaker.title, speaker.company].filter(Boolean).join(' · ')}
                            </p>
                          )}
                        </div>
                      )}

                      {/* 선정 이유 */}
                      {meta?.reason && (
                        <blockquote style={{
                          margin: '0 0 20px',
                          paddingLeft: 16,
                          borderLeft: '3px solid #7e22ce',
                        }}>
                          <p style={{
                            fontSize: 'clamp(14px, 1.6vw, 16px)',
                            fontWeight: 300, lineHeight: 1.8,
                            color: 'var(--color-ink)',
                            fontStyle: 'italic',
                          }}>
                            &ldquo;{meta.reason}&rdquo;
                          </p>
                        </blockquote>
                      )}

                      {/* 강사 한줄 소개 */}
                      {speaker?.bio_short && !meta?.reason && (
                        <p style={{
                          fontSize: 14, fontWeight: 300,
                          color: 'var(--color-subtle)', lineHeight: 1.8,
                          marginBottom: 20,
                        }}>
                          {speaker.bio_short}
                        </p>
                      )}

                      {/* 추천 강연 주제 */}
                      {meta?.topics && meta.topics.length > 0 && (
                        <div style={{ marginBottom: 4 }}>
                          <div style={{
                            fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
                            color: 'var(--color-muted)', marginBottom: 4,
                            textTransform: 'uppercase',
                          }}>
                            추천 강연 주제
                          </div>
                          {meta.topics.map((t, i) => (
                            <div key={i} className="pick-topics-item">
                              <span style={{
                                width: 18, height: 18, background: '#f5f0ff',
                                color: '#7e22ce', fontSize: 9, fontWeight: 700,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0, marginTop: 1,
                              }}>
                                {String(i + 1).padStart(2, '0')}
                              </span>
                              {t}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 분야 태그 */}
                      {speaker?.fields && speaker.fields.length > 0 && (
                        <div style={{
                          display: 'flex', flexWrap: 'wrap', gap: 6,
                          marginTop: 16,
                        }}>
                          {speaker.fields
                            .filter((f: string) => !f.startsWith('~'))
                            .slice(0, 4)
                            .map((f: string) => (
                              <span key={f} style={{
                                fontSize: 11, padding: '3px 10px',
                                background: '#f5f0ff', color: '#7e22ce',
                                fontWeight: 500,
                              }}>
                                {f}
                              </span>
                            ))}
                        </div>
                      )}
                    </div>

                    {/* 하단: CTA */}
                    {speaker && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 16,
                        flexWrap: 'wrap',
                      }}>
                        <Link href={`/speakers/${speaker.id}`} className="pick-cta">
                          강사 프로필 보기 →
                        </Link>
                        <Link
                          href="/inquiry/lecture"
                          style={{
                            fontSize: 12, fontWeight: 600, color: 'var(--color-muted)',
                            textDecoration: 'underline',
                            textUnderlineOffset: 3,
                          }}
                        >
                          이 강사로 문의하기
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
