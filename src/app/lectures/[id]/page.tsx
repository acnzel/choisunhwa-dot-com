import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import type { Lecture, Speaker } from '@/types'
import { LECTURE_DURATIONS } from '@/constants'

const DURATION_MAP: Record<string, string> = Object.fromEntries(
  LECTURE_DURATIONS.map((d) => [d.value, d.label])
)

type ArticleType = 'lecture' | 'editor_pick' | 'field_report' | 'behind' | 'monthly'
type LectureWithSpeaker = Lecture & { speaker: Speaker | null }

function getArticleType(lecture: Lecture): ArticleType {
  return ((lecture.content_json as Record<string, unknown>)?.article_type as ArticleType) ?? 'lecture'
}

const ARTICLE_TYPE_LABELS: Record<ArticleType, string> = {
  lecture:      '강연 커리큘럼',
  editor_pick:  '에디터 픽',
  field_report: '현장 리포트',
  behind:       '비하인드',
  monthly:      '이달의 강연',
}

interface Props {
  params: Promise<{ id: string }>
}

async function getLecture(id: string): Promise<LectureWithSpeaker | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('lectures')
    .select('*, speaker:speakers(*)')
    .eq('id', id)
    .eq('is_visible', true)
    .single()
  return (data as LectureWithSpeaker) ?? null
}

async function getRelatedLectures(lectureId: string, fields: string[]): Promise<Lecture[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('lectures')
    .select('*')
    .eq('is_visible', true)
    .neq('id', lectureId)
    .overlaps('fields', fields)
    .limit(4)
  return (data as Lecture[]) ?? []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const lecture = await getLecture(id)
  if (!lecture) return { title: '강연을 찾을 수 없습니다' }
  return {
    title: lecture.title,
    description: lecture.summary,
    openGraph: {
      title: lecture.title,
      description: lecture.summary ?? undefined,
      images: lecture.thumbnail_url ? [lecture.thumbnail_url] : [],
    },
  }
}

// ─── 공통 스타일 ───────────────────────────────────────────────────────────────
const S = {
  page:    { minHeight: '100vh', background: 'var(--color-bg)', fontFamily: 'var(--font-body)' } as const,
  inner:   { maxWidth: '1100px', margin: '0 auto', padding: '0 var(--space-page)' } as const,
  section: { background: 'white', border: '1px solid var(--color-border)', padding: '24px 28px', marginBottom: '16px' } as const,
  h2:      { fontSize: '15px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '14px' } as const,
}

export default async function LectureDetailPage({ params }: Props) {
  const { id } = await params
  const lecture = await getLecture(id)
  if (!lecture) notFound()

  const type = getArticleType(lecture)
  const isLecture = type === 'lecture'
  const related = await getRelatedLectures(id, lecture.fields)
  const inquiryHref = `/inquiry/lecture?lecture=${encodeURIComponent(lecture.title)}&speaker=${encodeURIComponent(lecture.speaker?.name ?? '')}`
  const body = (lecture.content_json as Record<string, unknown>)?.body as string | undefined

  return (
    <div style={S.page}>
      {/* ── 헤더 ──────────────────────────────────────────── */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--color-border)', padding: '40px 0 32px' }}>
        <div style={S.inner}>
          {/* 타입 뱃지 + 분야 태그 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px', alignItems: 'center' }}>
            <span style={{
              fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
              padding: '4px 10px',
              background: 'var(--color-surface)', color: 'var(--color-subtle)',
            }}>
              {ARTICLE_TYPE_LABELS[type]}
            </span>
            {lecture.fields.slice(0, 3).map((f) => (
              <span key={f} style={{
                fontSize: '11px', fontWeight: 600, padding: '3px 9px',
                border: '1px solid var(--color-border)', color: 'var(--color-muted)',
              }}>
                {f}
              </span>
            ))}
          </div>

          {/* 제목 */}
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: 'clamp(22px, 3vw, 34px)', lineHeight: 1.2, letterSpacing: '-0.02em',
            color: 'var(--color-ink)', maxWidth: '760px', marginBottom: '20px',
          }}>
            {lecture.title}
          </h1>

          {/* 강사 링크 (lecture 타입만) */}
          {isLecture && lecture.speaker && (
            <Link href={`/speakers/${lecture.speaker.id}`} style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              textDecoration: 'none', color: 'inherit',
            }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', background: 'var(--color-surface)', flexShrink: 0, position: 'relative' }}>
                {lecture.speaker.photo_url ? (
                  <Image src={lecture.speaker.photo_url} alt={lecture.speaker.name} fill style={{ objectFit: 'cover' }} sizes="36px" />
                ) : (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="18" height="18" fill="var(--color-border)" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink)' }}>{lecture.speaker.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--color-muted)' }}>{lecture.speaker.title}</p>
              </div>
            </Link>
          )}

          {/* 강연 메타 (lecture 타입만) */}
          {isLecture && (
            <div style={{ display: 'flex', gap: '16px', marginTop: '16px', fontSize: '13px', color: 'var(--color-muted)' }}>
              <span>강연 시간: {DURATION_MAP[lecture.duration] ?? lecture.duration}</span>
              {lecture.target && <span>대상: {lecture.target}</span>}
            </div>
          )}
        </div>
      </div>

      {/* ── 본문 ──────────────────────────────────────────── */}
      <div style={{ ...S.inner, padding: '40px var(--space-page)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isLecture ? '1fr 280px' : '1fr', gap: '32px', alignItems: 'start' }}
          className="lc-detail-grid"
        >
          <style>{`
            @media (max-width: 900px) { .lc-detail-grid { grid-template-columns: 1fr !important; } }
          `}</style>

          {/* 메인 컬럼 */}
          <div>
            {/* 썸네일 */}
            {lecture.thumbnail_url && (
              <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', marginBottom: '24px', overflow: 'hidden', background: 'var(--color-surface)' }}>
                <Image src={lecture.thumbnail_url} alt={lecture.title} fill style={{ objectFit: 'cover' }} sizes="(max-width: 900px) 100vw, 760px" />
              </div>
            )}

            {/* 에디토리얼: 본문 */}
            {!isLecture && body && (
              <section style={{ ...S.section, whiteSpace: 'pre-wrap', fontSize: '15px', lineHeight: 1.85, color: 'var(--color-ink)' }}>
                {body}
              </section>
            )}

            {/* 에디토리얼: 요약만 */}
            {!isLecture && !body && lecture.summary && (
              <section style={{ ...S.section, fontSize: '15px', lineHeight: 1.85, color: 'var(--color-ink)' }}>
                {lecture.summary}
              </section>
            )}

            {/* ── lecture 타입 전용 섹션 ── */}
            {isLecture && (
              <>
                {/* 강연 개요 */}
                {lecture.summary && (
                  <section style={S.section}>
                    <h2 style={S.h2}>강연 개요</h2>
                    <p style={{ fontSize: '14px', color: 'var(--color-subtle)', lineHeight: 1.8 }}>{lecture.summary}</p>
                  </section>
                )}

                {/* 강연 목표 */}
                {lecture.goals && lecture.goals.length > 0 && (
                  <section style={S.section}>
                    <h2 style={S.h2}>강연 목표</h2>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {lecture.goals.map((goal, idx) => (
                        <li key={idx} style={{ display: 'flex', gap: '12px', fontSize: '14px', color: 'var(--color-subtle)' }}>
                          <span style={{
                            flexShrink: 0, width: '22px', height: '22px',
                            background: 'var(--color-green)', color: 'white',
                            fontSize: '11px', fontWeight: 700,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginTop: '1px',
                          }}>{idx + 1}</span>
                          {goal}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* 프로그램 구성 */}
                {lecture.program && lecture.program.length > 0 && (
                  <section style={S.section}>
                    <h2 style={S.h2}>프로그램 구성</h2>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                          <th style={{ textAlign: 'left', padding: '8px 0', color: 'var(--color-muted)', fontWeight: 500, width: '100px' }}>시간</th>
                          <th style={{ textAlign: 'left', padding: '8px 0', color: 'var(--color-muted)', fontWeight: 500 }}>내용</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lecture.program.map((item, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--color-surface)' }}>
                            <td style={{ padding: '12px 0 12px 0', color: 'var(--color-subtle)', fontWeight: 500, verticalAlign: 'top' }}>{item.time}</td>
                            <td style={{ padding: '12px 0', color: 'var(--color-ink)' }}>{item.content}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </section>
                )}

                {/* 기대 효과 */}
                {lecture.effects && lecture.effects.length > 0 && (
                  <section style={S.section}>
                    <h2 style={S.h2}>기대 효과</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                      {lecture.effects.map((effect, idx) => (
                        <div key={idx} style={{
                          display: 'flex', gap: '10px', padding: '12px 14px',
                          background: 'var(--color-surface)',
                          fontSize: '13px', color: 'var(--color-ink)', lineHeight: 1.6,
                        }}>
                          <span style={{ color: 'var(--color-green)', flexShrink: 0, fontWeight: 700 }}>✓</span>
                          {effect}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 담당 강사 */}
                {lecture.speaker && (
                  <section style={S.section}>
                    <h2 style={S.h2}>담당 강사</h2>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ width: '64px', height: '64px', flexShrink: 0, overflow: 'hidden', background: 'var(--color-surface)', position: 'relative' }}>
                        {lecture.speaker.photo_url ? (
                          <Image src={lecture.speaker.photo_url} alt={lecture.speaker.name} fill style={{ objectFit: 'cover' }} sizes="64px" />
                        ) : (
                          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="28" height="28" fill="var(--color-border)" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '3px' }}>{lecture.speaker.name}</h3>
                        <p style={{ fontSize: '12px', color: 'var(--color-muted)', marginBottom: '8px' }}>{lecture.speaker.title}</p>
                        {lecture.speaker.bio_short && (
                          <p style={{ fontSize: '13px', color: 'var(--color-subtle)', lineHeight: 1.7 }}>{lecture.speaker.bio_short}</p>
                        )}
                        <Link href={`/speakers/${lecture.speaker.id}`} style={{ display: 'inline-block', marginTop: '8px', fontSize: '12px', color: 'var(--color-rust)', textDecoration: 'none', fontWeight: 600 }}>
                          강사 프로필 더보기 →
                        </Link>
                      </div>
                    </div>
                  </section>
                )}
              </>
            )}
          </div>

          {/* 사이드바 (lecture 타입만) */}
          {isLecture && (
            <aside>
              <div style={{ position: 'sticky', top: '80px' }}>
                <div style={{ background: 'white', border: '1px solid var(--color-border)', padding: '24px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '6px' }}>이 강연이 궁금하다면?</h3>
                  <p style={{ fontSize: '12px', color: 'var(--color-muted)', marginBottom: '20px', lineHeight: 1.6 }}>
                    담당자가 1~2 영업일 내 연락드립니다.
                  </p>
                  <Link
                    href={inquiryHref}
                    style={{
                      display: 'block', width: '100%', textAlign: 'center',
                      padding: '12px 0',
                      background: 'var(--color-rust)', color: 'white',
                      fontSize: '14px', fontWeight: 700, letterSpacing: '0.04em',
                      textDecoration: 'none',
                      transition: 'opacity 0.15s',
                    }}
                  >
                    강연 문의하기
                  </Link>
                  <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--color-muted)', lineHeight: 2 }}>
                    <p>· 강연 시간: {DURATION_MAP[lecture.duration] ?? lecture.duration}</p>
                    {lecture.target && <p>· 대상: {lecture.target}</p>}
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>

        {/* 에디토리얼 타입: 하단 문의 CTA */}
        {!isLecture && (
          <div style={{ marginTop: '40px', padding: '32px', background: 'white', border: '1px solid var(--color-border)', textAlign: 'center' }}>
            <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '8px' }}>관련 강사 섭외가 필요하신가요?</p>
            <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '20px' }}>최선화닷컴에서 최적의 강사를 추천해드립니다.</p>
            <Link href="/matching" style={{
              display: 'inline-block', padding: '12px 32px',
              background: 'var(--color-rust)', color: 'white',
              fontSize: '14px', fontWeight: 700, textDecoration: 'none',
            }}>
              강사 매칭 신청 →
            </Link>
          </div>
        )}

        {/* 관련 강연 */}
        {related.length > 0 && (
          <div style={{ marginTop: '48px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '24px' }}>관련 강연</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--color-border)' }}
              className="related-grid"
            >
              <style>{`
                @media (max-width: 900px) { .related-grid { grid-template-columns: repeat(2, 1fr) !important; } }
                @media (max-width: 480px) { .related-grid { grid-template-columns: 1fr !important; } }
              `}</style>
              {related.map((r) => {
                const rType = getArticleType(r)
                return (
                  <Link
                    key={r.id}
                    href={`/lectures/${r.id}`}
                    style={{ display: 'block', background: 'var(--color-bg)', padding: '16px', textDecoration: 'none', color: 'inherit' }}
                    className="lc-card"
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                      {r.fields.slice(0, 1).map((f) => (
                        <span key={f} style={{ fontSize: '10px', padding: '2px 7px', border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}>{f}</span>
                      ))}
                      <span style={{ fontSize: '10px', padding: '2px 7px', background: 'var(--color-surface)', color: 'var(--color-subtle)' }}>
                        {ARTICLE_TYPE_LABELS[rType]}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-ink)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {r.title}
                    </h3>
                    {r.summary && (
                      <p style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '6px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {r.summary}
                      </p>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
