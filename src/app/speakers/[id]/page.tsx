import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import type { Speaker, Lecture } from '@/types'
import { SPEAKER_FIELDS } from '@/constants'
import { normalizeSpeaker } from '@/lib/utils/speaker'
import ShareButton from './ShareButton'
import ScrollToTop from './ScrollToTop'
import RevealOnScroll from '@/components/RevealOnScroll'

const FIELD_MAP: Record<string, string> = Object.fromEntries(
  SPEAKER_FIELDS.map((f) => [f.value, f.label])
)

interface Props {
  params: Promise<{ id: string }>
}

async function getSpeaker(id: string): Promise<Speaker | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('speakers')
    .select('*')
    .eq('id', id)
    .eq('is_visible', true)
    .single()
  if (!data) return null
  return normalizeSpeaker(data as Speaker)
}

async function getSpeakerLectures(speakerId: string): Promise<Lecture[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('lectures')
    .select('*')
    .eq('speaker_id', speakerId)
    .eq('is_visible', true)
  return (data as Lecture[]) ?? []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const speaker = await getSpeaker(id)
  if (!speaker) return { title: '강사를 찾을 수 없습니다' }
  return {
    title: `${speaker.name} — ${speaker.title} | 최선화닷컴`,
    description: speaker.bio_short,
    openGraph: {
      title: `${speaker.name} | 최선화닷컴`,
      description: speaker.bio_short,
      images: speaker.photo_url ? [speaker.photo_url] : [],
    },
  }
}

export default async function SpeakerDetailPage({ params }: Props) {
  const { id } = await params
  const [speaker, lectures] = await Promise.all([
    getSpeaker(id),
    getSpeakerLectures(id),
  ])

  if (!speaker) notFound()

  type Career = { year?: string; content: string }
  const rawCareers = (speaker.careers as (string | Career)[]) ?? []
  const allCareers: Career[] = rawCareers.map((c) =>
    typeof c === 'string' ? { year: '', content: c } : { year: c.year ?? '', content: c.content ?? '' }
  )
  const careers   = allCareers.filter((c) => !c.content.startsWith('[학력]'))
  const education = allCareers
    .filter((c) => c.content.startsWith('[학력]'))
    .map((c) => ({ ...c, content: c.content.replace(/^\[학력\]\s*/, '') }))

  const books = (speaker.news_links ?? []).filter(Boolean)

  // 강연주제: lecture_histories를 재활용 (각 항목의 org_name이 강연주제 한 줄)
  const lectureTopics = (speaker.lecture_histories ?? [])
    .map((h) => (typeof h === 'string' ? h : h.org_name))
    .filter(Boolean)

  const mediaLinks = (speaker.media_links ?? []).filter((m) => m.url)

  const bioText = speaker.bio_full?.trim() || speaker.bio_short?.trim() || ''
  const hasContent = {
    bio:           !!bioText,
    careers:       careers.length > 0,
    education:     education.length > 0,
    lectureTopics: lectureTopics.length > 0,
    books:         books.length > 0,
    media:         mediaLinks.length > 0,
    lectures:      lectures.length > 0,
  }

  return (
    <>
      <style>{`
        /* 브레드크럼 */
        .breadcrumb-link { transition: color 0.15s; }
        .breadcrumb-link:hover { color: var(--color-ink) !important; }
        /* ── 강사 상세 레이아웃 ── */
        .sp-detail-grid {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 0;
        }
        @media (max-width: 860px) {
          .sp-detail-grid {
            grid-template-columns: 1fr;
          }
          .sp-detail-sidebar {
            border-left: none !important;
            border-top: 1px solid var(--color-border) !important;
          }
        }
        /* 강연 카드 호버 */
        .lec-card:hover {
          background: var(--color-surface) !important;
        }
        /* 미디어 링크 */
        .media-link:hover { color: var(--color-rust) !important; }
      `}</style>

      <div className="page-max-wrap" style={{ minHeight: '100dvh', paddingTop: 'var(--nav-height)', background: 'var(--color-bg)' }}>
        <ScrollToTop />
        <RevealOnScroll />

        {/* ── 뒤로가기 브레드크럼 ── */}
        <div style={{
          padding: '12px var(--space-page)',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', gap: '8px',
          fontSize: '11px', color: 'var(--color-muted)',
        }}>
          <Link href="/speakers" className="breadcrumb-link" style={{ color: 'var(--color-muted)' }}>
            ← 연사 라인업
          </Link>
          <span>·</span>
          <span>{speaker.name}</span>
        </div>

        {/* ── 히어로 헤더 ── */}
        <header style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: 'clamp(24px, 4vw, 56px)',
            padding: 'clamp(28px, 5vw, 56px) var(--space-page)',
            alignItems: 'flex-start',
          }}>

            {/* 프로필 사진 — 텍스트가 주인공, 사진은 보조 */}
            <div style={{
              position: 'relative',
              width: 'clamp(72px, 8vw, 100px)',
              aspectRatio: '3 / 4',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              flexShrink: 0,
              overflow: 'hidden',
            }}>
              {speaker.photo_url ? (
                <Image
                  src={speaker.photo_url}
                  alt={speaker.name}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="180px"
                  priority
                />
              ) : (
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-english)',
                  fontSize: 'clamp(32px, 5vw, 64px)', color: 'var(--color-border)',
                }}>
                  {speaker.name.charAt(0)}
                </div>
              )}
            </div>

            {/* 기본 정보 */}
            <div>
              {/* 분야 태그 — 엑셀 강연분야(~접두어) 원본 표시 */}
              {speaker.fields.some(f => f.startsWith('~')) && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                  {speaker.fields
                    .filter(f => f.startsWith('~'))
                    .map(f => f.slice(1))
                    .map((topic) => (
                      <span key={topic} style={{
                        fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em',
                        padding: '3px 10px',
                        background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                        color: 'var(--color-subtle)',
                      }}>
                        {topic}
                      </span>
                    ))}
                </div>
              )}

              {/* 이름 */}
              <h1 style={{
                fontFamily: 'var(--font-display)', fontWeight: 900,
                fontSize: 'clamp(28px, 4.5vw, 64px)',
                letterSpacing: '-0.03em', lineHeight: 1.05,
                color: 'var(--color-ink)', marginBottom: '10px',
              }}>
                {speaker.name}
              </h1>

              {/* 직함 + 소속 — 크고 진하게, 하나만 표시 */}
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: 'clamp(15px, 1.8vw, 18px)',
                fontWeight: 500, color: 'var(--color-ink)',
                marginBottom: '24px', lineHeight: 1.5,
                letterSpacing: '-0.01em',
              }}>
                {[speaker.title, speaker.company].filter(Boolean).join(' · ')}
              </p>

              {/* CTA 버튼 */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                <Link
                  href={`/inquiry/lecture?speaker=${encodeURIComponent(speaker.name)}`}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em',
                    color: 'var(--color-bg)', background: 'var(--color-green)',
                    padding: '12px 24px',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  강사 섭외 문의 →
                </Link>
                <ShareButton />
              </div>
            </div>
          </div>
        </header>

        {/* ── 본문 2열 그리드 ── */}
        <div className="sp-detail-grid">

          {/* ── 메인 콘텐츠 ── */}
          <main style={{ borderRight: '1px solid var(--color-border)' }}>

            {/* 강사 소개 */}
            {hasContent.bio && (
              <DetailSection title="강사 소개">
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 300,
                  color: 'var(--color-subtle)', lineHeight: 1.9,
                  whiteSpace: 'pre-line',
                  wordBreak: 'keep-all',
                  overflowWrap: 'break-word',
                }}>
                  {bioText}
                </p>
              </DetailSection>
            )}

            {/* 약력 */}
            {hasContent.careers && (
              <DetailSection title="약력">
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {careers.map((career, idx) => (
                    <li key={idx} style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
                      {career.year && (
                        <span style={{
                          fontFamily: 'var(--font-english)', fontWeight: 700,
                          fontSize: '11px', letterSpacing: '0.06em',
                          color: 'var(--color-muted)', whiteSpace: 'nowrap',
                          width: '52px', flexShrink: 0, paddingTop: '2px',
                        }}>
                          {career.year}
                        </span>
                      )}
                      <span style={{ color: 'var(--color-subtle)', lineHeight: 1.7 }}>
                        {career.content}
                      </span>
                    </li>
                  ))}
                </ul>
              </DetailSection>
            )}

            {/* 학력 */}
            {hasContent.education && (
              <DetailSection title="학력">
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {education.map((edu, idx) => (
                    <li key={idx} style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
                      {edu.year && (
                        <span style={{
                          fontFamily: 'var(--font-english)', fontWeight: 700,
                          fontSize: '11px', letterSpacing: '0.06em',
                          color: 'var(--color-muted)', whiteSpace: 'nowrap',
                          width: '52px', flexShrink: 0, paddingTop: '2px',
                        }}>
                          {edu.year}
                        </span>
                      )}
                      <span style={{ color: 'var(--color-subtle)', lineHeight: 1.7 }}>{edu.content}</span>
                    </li>
                  ))}
                </ul>
              </DetailSection>
            )}

            {/* 강연 주제 */}
            {hasContent.lectureTopics && (
              <DetailSection title="강연 주제">
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {lectureTopics.map((topic, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px' }}>
                      <span style={{ color: 'var(--color-green)', flexShrink: 0, lineHeight: 1.8 }}>›</span>
                      <span style={{ color: 'var(--color-subtle)', lineHeight: 1.7 }}>{topic}</span>
                    </li>
                  ))}
                </ul>
              </DetailSection>
            )}

            {/* 저서 */}
            {hasContent.books && (
              <DetailSection title="저서">
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {books.map((book, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px' }}>
                      <span style={{ color: 'var(--color-ochre)', flexShrink: 0, lineHeight: 1.8 }}>―</span>
                      <span style={{ color: 'var(--color-subtle)', lineHeight: 1.7 }}>{book}</span>
                    </li>
                  ))}
                </ul>
              </DetailSection>
            )}

            {/* 참고영상 */}
            {hasContent.media && (
              <DetailSection title="참고영상">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {mediaLinks.map((item, idx) => (
                    <a
                      key={idx}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="media-link"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        fontSize: '12px', color: 'var(--color-subtle)', textDecoration: 'none',
                        transition: 'color 0.15s',
                      }}
                    >
                      <span style={{
                        width: '28px', height: '28px', borderRadius: '50%',
                        background: '#e53535',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="white">
                          <polygon points="2,1 9,5 2,9" />
                        </svg>
                      </span>
                      {item.title}
                    </a>
                  ))}
                </div>
              </DetailSection>
            )}

            {/* 보유 커리큘럼 */}
            {hasContent.lectures && (
              <DetailSection title="보유 커리큘럼">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                  {lectures.map((lecture) => (
                    <Link
                      key={lecture.id}
                      href={`/lectures/${lecture.id}`}
                      className="lec-card"
                      style={{
                        display: 'block', padding: '18px 0',
                        borderBottom: '1px solid var(--color-border)',
                        textDecoration: 'none', transition: 'background 0.15s',
                      }}
                    >
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                        {lecture.fields.slice(0, 2).map((f) => (
                          <span key={f} style={{
                            fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em',
                            padding: '2px 8px', textTransform: 'uppercase',
                            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                            color: 'var(--color-muted)',
                          }}>
                            {FIELD_MAP[f] ?? f}
                          </span>
                        ))}
                      </div>
                      <h3 style={{
                        fontFamily: 'var(--font-display)', fontWeight: 800,
                        fontSize: 'clamp(14px, 1.8vw, 18px)', letterSpacing: '-0.02em',
                        color: 'var(--color-ink)', lineHeight: 1.3, marginBottom: '6px',
                      }}>
                        {lecture.title}
                      </h3>
                      {lecture.summary && (
                        <p style={{
                          fontSize: '12px', color: 'var(--color-muted)', lineHeight: 1.7,
                          display: '-webkit-box', WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>
                          {lecture.summary}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </DetailSection>
            )}

          </main>

          {/* ── 사이드바 ── */}
          <aside
            className="sp-detail-sidebar"
            style={{ borderLeft: '1px solid var(--color-border)' }}
          >
            <div style={{ position: 'sticky', top: 'calc(var(--nav-height) + 24px)' }}>

              {/* 섭외 문의 카드 */}
              <div style={{ padding: 'clamp(20px, 3vw, 32px)', borderBottom: '1px solid var(--color-border)' }}>
                <p style={{
                  fontFamily: 'var(--font-english)', fontWeight: 700,
                  fontSize: '10px', letterSpacing: '0.12em', color: 'var(--color-muted)',
                  textTransform: 'uppercase', marginBottom: '10px',
                }}>
                  REQUEST
                </p>
                <h3 style={{
                  fontFamily: 'var(--font-display)', fontWeight: 900,
                  fontSize: 'clamp(16px, 2vw, 20px)', letterSpacing: '-0.02em',
                  color: 'var(--color-ink)', marginBottom: '6px', lineHeight: 1.2,
                }}>
                  {speaker.name} 강사 섭외
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--color-muted)', marginBottom: '20px', lineHeight: 1.6 }}>
                  문의 후 1~2 영업일 내에<br />담당자가 연락드립니다.
                </p>
                <Link
                  href={`/inquiry/lecture?speaker=${encodeURIComponent(speaker.name)}`}
                  style={{
                    display: 'block', textAlign: 'center',
                    padding: '12px 0',
                    background: 'var(--color-green)', color: 'var(--color-bg)',
                    fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em',
                    fontFamily: 'var(--font-body)',
                    textDecoration: 'none',
                  }}
                >
                  섭외 문의하기 →
                </Link>
              </div>

              {/* 분야 — 카테고리(SPEAKER_FIELDS) 표시, 강연분야 raw값 제외 */}
              {speaker.fields.some(f => !f.startsWith('~') && FIELD_MAP[f]) && (
                <div style={{ padding: 'clamp(16px, 2.5vw, 24px)' }}>
                  <p style={{
                    fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em',
                    textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '10px',
                  }}>
                    강연 분야
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {speaker.fields
                      .filter(f => !f.startsWith('~') && FIELD_MAP[f])
                      .map((f) => (
                        <span key={f} style={{
                          fontSize: '10px', fontWeight: 600,
                          padding: '4px 10px',
                          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                          color: 'var(--color-subtle)',
                        }}>
                          {FIELD_MAP[f]}
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {/* 매칭으로 다른 강사 보기 */}
              <div style={{ padding: 'clamp(16px, 2.5vw, 24px)', borderTop: '1px solid var(--color-border)' }}>
                <p style={{ fontSize: '11px', color: 'var(--color-muted)', lineHeight: 1.7, marginBottom: '12px' }}>
                  다른 조건으로 강사를 찾고 싶으신가요?
                </p>
                <Link
                  href="/matching?step=1"
                  style={{
                    fontSize: '11px', fontWeight: 600, color: 'var(--color-green)',
                    textDecoration: 'underline', textUnderlineOffset: '3px',
                    display: 'flex', alignItems: 'center', gap: '4px',
                  }}
                >
                  강사 매칭 시작 →
                </Link>
              </div>

            </div>
          </aside>
        </div>

      </div>
    </>
  )
}

// ── 섹션 래퍼 ──────────────────────────────────────────────
function DetailSection({
  title,
  children,
  className = 'reveal',
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={className}
      style={{ borderBottom: '1px solid var(--color-border)', padding: 'clamp(24px, 4vw, 40px) var(--space-page)' }}
    >
      <h2 style={{
        fontFamily: 'var(--font-english)', fontWeight: 700,
        fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase',
        color: 'var(--color-muted)', marginBottom: '20px',
      }}>
        {title}
      </h2>
      {children}
    </section>
  )
}
