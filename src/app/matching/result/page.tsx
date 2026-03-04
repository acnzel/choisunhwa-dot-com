import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { WIZARD_FIELDS, WIZARD_TARGETS } from '@/constants/matching'
interface MatchResult {
  speaker: {
    id: string; name: string; title: string; company: string
    photo_url: string | null; bio_short: string; fields: string[]
  }
  score: number
  reason: string
  recommendedTopics: string[]
}

export const metadata: Metadata = {
  title: '매칭 결과 | 최선화닷컴',
  description: '조건에 맞는 추천 강사 결과입니다.',
}

interface Props {
  searchParams: Promise<{ fields?: string; topics?: string; targets?: string }>
}

async function fetchResults(fields: string, topics: string, targets: string): Promise<MatchResult[]> {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://choisunhwa-dot-com.vercel.app'
    const params = new URLSearchParams()
    if (fields)  params.set('fields', fields)
    if (topics)  params.set('topics', topics)
    if (targets) params.set('targets', targets)

    const res = await fetch(`${base}/api/matching?${params.toString()}`, { cache: 'no-store' })
    if (!res.ok) return []
    const json = await res.json()
    return json.results ?? []
  } catch {
    return []
  }
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

  const results = await fetchResults(fields, topics, targets)

  // 문의 폼 자동 채움 파라미터 빌더
  function buildInquiryUrl(speakerName: string) {
    const p = new URLSearchParams()
    p.set('speaker', speakerName)
    if (topicArr[0]) p.set('topic', topicArr[0])
    if (fieldArr[0]) p.set('field', fieldArr[0])
    if (targetArr.length) p.set('target', targetArr.join(','))
    return `/inquiry/lecture?${p.toString()}`
  }

  const resetUrl = '/matching?step=1'

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
          {results.length > 0
            ? <>조건에 맞는 강사 <span style={{ color: 'var(--color-rust)' }}>{results.length}명</span>을 찾았습니다.</>
            : '조건에 딱 맞는 강사가 아직 없습니다.'
          }
        </h1>

        {/* 선택 조건 표시 */}
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
                key={r.speaker.id}
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
                <div style={{ position: 'relative', width: '100%', aspectRatio: '1', background: 'var(--color-surface)', border: '1px solid var(--color-border)', flexShrink: 0 }}>
                  {r.speaker.photo_url ? (
                    <Image src={r.speaker.photo_url} alt={r.speaker.name} fill style={{ objectFit: 'cover' }} sizes="120px" />
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-english)', fontSize: '40px', color: 'var(--color-border)' }}>
                      {r.speaker.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* 정보 */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(18px, 2.5vw, 24px)', letterSpacing: '-0.02em', color: 'var(--color-ink)', marginBottom: '4px' }}>
                    {r.speaker.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginBottom: '14px' }}>
                    {[r.speaker.title, r.speaker.company].filter(Boolean).join(' · ')}
                  </div>

                  {/* 추천 이유 */}
                  <div style={{
                    background: 'var(--color-surface)', padding: '10px 14px',
                    borderLeft: '2px solid var(--color-green)',
                    fontSize: '12px', color: 'var(--color-subtle)', lineHeight: 1.7,
                    marginBottom: '14px',
                  }}>
                    💡 {r.reason}
                  </div>

                  {/* 추천 강연 주제 */}
                  {r.recommendedTopics.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '6px' }}>
                        추천 강연 주제
                      </p>
                      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {r.recommendedTopics.map((t) => (
                          <li key={t} style={{ fontSize: '12px', color: 'var(--color-subtle)' }}>
                            · {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 버튼 */}
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <Link
                      href={`/speakers/${r.speaker.id}`}
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
                      href={buildInquiryUrl(r.speaker.name)}
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
