import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { WIZARD_FIELDS, WIZARD_TARGETS } from '@/constants/matching'

export const metadata: Metadata = {
  title: '매칭 결과 | 최선화닷컴',
  description: '조건에 맞는 추천 강사 결과입니다.',
}

interface Props {
  searchParams: Promise<{ fields?: string; topics?: string; targets?: string }>
}

// 분야 레이블
const FIELD_DB_MAP: Record<string, string[]> = {
  leadership:    ['leadership', 'org_culture'],
  motivation:    ['motivation', 'self_development'],
  marketing:     ['marketing', 'sales'],
  communication: ['communication'],
  ai:            ['ai_tech'],
  psychology:    ['motivation'],
  finance:       ['finance'],
  other:         [],
}

async function getScoredSpeakers(
  fields: string[],
  topics: string[],
  targets: string[],
) {
  const supabase = createAdminClient()
  const { data: speakers } = await supabase
    .from('speakers')
    .select('id, name, title, company, photo_url, bio_short, bio_full, fields, careers, sort_order, is_visible')
    .eq('is_visible', true)

  if (!speakers || speakers.length === 0) return []

  type RawSpeaker = typeof speakers[0]
  type Scored = RawSpeaker & { score: number; match_reasons: string[] }

  const scored: Scored[] = speakers.map((sp) => {
    let score = 0
    const reasons: string[] = []
    const spFields: string[] = Array.isArray(sp.fields) ? sp.fields as string[] : []
    const spCareers: Array<{ content: string }> = Array.isArray(sp.careers)
      ? (sp.careers as Array<{ content: string }>)
      : []

    // 분야 매칭: +3점/개
    fields.forEach((wizardFieldId) => {
      const dbFields = FIELD_DB_MAP[wizardFieldId] ?? []
      const fieldLabel = WIZARD_FIELDS.find(f => f.id === wizardFieldId)?.label ?? wizardFieldId
      if (dbFields.length === 0 || dbFields.some(db => spFields.includes(db))) {
        score += 3
        reasons.push(`${fieldLabel} 분야 일치`)
      }
    })

    // 주제 키워드: +2점/개
    const bioText = [
      sp.bio_full ?? '',
      sp.bio_short ?? '',
      ...spCareers.map((c) => c.content),
    ].join(' ').toLowerCase()

    topics.forEach((topic) => {
      if (bioText.includes(topic.toLowerCase())) {
        score += 2
        reasons.push(`${topic} 주제 포함`)
      }
    })

    // 대상 키워드: +1점/개
    const fullText = bioText + ' ' + spFields.join(' ')
    targets.forEach((targetId) => {
      const targetLabel = WIZARD_TARGETS.find(t => t.id === targetId)?.label ?? targetId
      if (fullText.includes(targetLabel.toLowerCase()) || fullText.includes(targetId)) {
        score += 1
        reasons.push(`${targetLabel} 대상 적합`)
      }
    })

    return { ...sp, score, match_reasons: reasons }
  })

  // 점수 내림차순, 동점 시 sort_order 오름차순
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return (a.sort_order ?? 99) - (b.sort_order ?? 99)
  })

  const filtered = scored.filter(s => s.score > 0).slice(0, 6)

  // fallback: 점수 0이면 sort_order 상위 6명
  if (filtered.length === 0) {
    return scored.slice(0, 6).map(s => ({
      ...s,
      match_reasons: ['추천 강사'],
    }))
  }

  return filtered
}

// 라벨 변환 헬퍼
function fieldLabel(id: string) {
  return WIZARD_FIELDS.find(f => f.id === id)?.label ?? id
}
function targetLabel(id: string) {
  return WIZARD_TARGETS.find(t => t.id === id)?.label ?? id
}

export default async function MatchingResultPage({ searchParams }: Props) {
  const { fields = '', topics = '', targets = '' } = await searchParams

  const fieldArr  = fields.split(',').filter(Boolean)
  const topicArr  = topics.split(',').filter(Boolean)
  const targetArr = targets.split(',').filter(Boolean)

  const hasConditions = fieldArr.length > 0 || topicArr.length > 0 || targetArr.length > 0
  const results = hasConditions
    ? await getScoredSpeakers(fieldArr, topicArr, targetArr)
    : []

  // 문의 폼 자동 채움 파라미터 빌더
  function buildInquiryUrl(speakerName: string) {
    const p = new URLSearchParams()
    p.set('speaker', speakerName)
    if (topicArr[0]) p.set('lecture', topicArr[0])
    return `/inquiry/lecture?${p.toString()}`
  }

  const resetUrl = '/matching?step=1'
  const isFallback = hasConditions && results.every(r => r.match_reasons[0] === '추천 강사')

  return (
    <div style={{ minHeight: '100vh', paddingTop: 'var(--nav-height)', background: 'var(--color-bg)' }}>

      {/* ── 결과 헤더 ── */}
      <div style={{ borderBottom: '1px solid var(--color-border)', padding: 'clamp(28px, 4vw, 44px) var(--space-page)' }}>
        <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '10px' }}>
          MATCHING RESULT
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 900,
          fontSize: 'clamp(24px, 3.5vw, 40px)', letterSpacing: '-0.03em',
          color: 'var(--color-ink)', marginBottom: '14px', lineHeight: 1.2,
        }}>
          {!hasConditions
            ? '조건을 선택해주세요.'
            : isFallback
              ? <>현재 조건에 맞는 강사가 없어, <span style={{ color: 'var(--color-rust)' }}>추천 강사</span>를 보여드립니다.</>
              : results.length > 0
                ? <>조건에 맞는 강사 <span style={{ color: 'var(--color-rust)' }}>{results.length}명</span>을 찾았습니다.</>
                : '조건에 딱 맞는 강사가 아직 없습니다.'
          }
        </h1>

        {/* 선택 조건 뱃지 */}
        {hasConditions && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            {fieldArr.map(f => (
              <span key={f} style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-subtle)' }}>
                {fieldLabel(f)}
              </span>
            ))}
            {topicArr.map(t => (
              <span key={t} style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-subtle)' }}>
                {t}
              </span>
            ))}
            {targetArr.map(t => (
              <span key={t} style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-subtle)' }}>
                {targetLabel(t)}
              </span>
            ))}
          </div>
        )}

        <Link href={resetUrl} style={{ fontSize: '12px', color: 'var(--color-muted)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
          조건 다시 설정하기 →
        </Link>
      </div>

      {/* ── 결과 목록 ── */}
      <div style={{ padding: 'clamp(24px, 4vw, 44px) var(--space-page)', maxWidth: '900px', margin: '0 auto' }}>

        {results.length === 0 ? (
          /* ── Fallback ── */
          <div style={{
            textAlign: 'center', padding: 'clamp(48px, 8vw, 80px) var(--space-page)',
            border: '1px solid var(--color-border)',
          }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🔍</div>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '18px', letterSpacing: '-0.02em', color: 'var(--color-ink)', marginBottom: '8px' }}>
              조건에 딱 맞는 강사가 아직 없습니다.
            </p>
            <p style={{ fontSize: '13px', color: 'var(--color-subtle)', lineHeight: 1.8, marginBottom: '28px' }}>
              직접 문의하시면 최적의 강사를 찾아드립니다.
            </p>
            <Link
              href="/inquiry/lecture"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em',
                color: 'var(--color-bg)', background: 'var(--color-green)',
                padding: '13px 26px',
              }}
            >
              문의하기 →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', border: '1px solid var(--color-border)' }}>
            {results.map((r) => (
              <div
                key={r.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr',
                  gap: '24px',
                  padding: 'clamp(20px, 3vw, 32px)',
                  background: 'var(--color-bg)',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                {/* 프로필 사진 */}
                <div style={{
                  position: 'relative', width: '100%', aspectRatio: '1',
                  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                  flexShrink: 0,
                }}>
                  {r.photo_url ? (
                    <Image src={r.photo_url} alt={r.name} fill style={{ objectFit: 'cover' }} sizes="120px" />
                  ) : (
                    <div style={{
                      position: 'absolute', inset: 0, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-english)', fontSize: '40px', color: 'var(--color-border)',
                    }}>
                      {r.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* 정보 */}
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontWeight: 900,
                    fontSize: 'clamp(18px, 2.5vw, 24px)', letterSpacing: '-0.02em',
                    color: 'var(--color-ink)', marginBottom: '4px',
                  }}>
                    {r.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginBottom: '14px' }}>
                    {[r.title, r.company].filter(Boolean).join(' · ')}
                  </div>

                  {/* 매칭 이유 뱃지 */}
                  {r.match_reasons.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                      {r.match_reasons.map((reason) => (
                        <span key={reason} style={{
                          fontSize: '10px', fontWeight: 700, padding: '3px 9px',
                          background: 'rgba(43,66,56,0.08)',
                          color: 'var(--color-green)',
                          letterSpacing: '0.04em',
                        }}>
                          {reason}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 소개 한줄 */}
                  {r.bio_short && (
                    <div style={{
                      background: 'var(--color-surface)', padding: '10px 14px',
                      borderLeft: '2px solid var(--color-green)',
                      fontSize: '12px', color: 'var(--color-subtle)', lineHeight: 1.7,
                      marginBottom: '16px',
                    }}>
                      {r.bio_short}
                    </div>
                  )}

                  {/* 버튼 */}
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <Link
                      href={`/speakers/${r.id}`}
                      style={{
                        fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em',
                        color: 'var(--color-ink)', border: '1px solid var(--color-border)',
                        padding: '8px 16px', display: 'inline-block',
                        transition: 'background 0.15s',
                      }}
                    >
                      강사 프로필 보기
                    </Link>
                    <Link
                      href={buildInquiryUrl(r.name)}
                      style={{
                        fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em',
                        color: 'var(--color-bg)', background: 'var(--color-green)',
                        padding: '8px 16px', display: 'inline-block',
                        transition: 'background 0.15s',
                      }}
                    >
                      이 강사로 문의하기 →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 결과가 있어도 문의 유도 */}
        {results.length > 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', borderTop: '1px solid var(--color-border)', marginTop: '0' }}>
            <p style={{ fontSize: '12px', color: 'var(--color-muted)', marginBottom: '12px' }}>
              원하는 강사가 없으신가요?
            </p>
            <Link
              href="/inquiry/lecture"
              style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-subtle)', textDecoration: 'underline', textUnderlineOffset: '3px' }}
            >
              직접 문의하기 →
            </Link>
          </div>
        )}
      </div>

    </div>
  )
}
