import { createClient } from '@/lib/supabase/server'
import type { Speaker, Notice } from '@/types'
import { SPEAKER_FIELDS } from '@/constants'
import Link from 'next/link'
import HeroTicker from './HeroTicker'
import SpeakerTabs from './SpeakerTabs'

const FIELD_MAP = Object.fromEntries(SPEAKER_FIELDS.map((f) => [f.value, f.label]))

async function getData() {
  const supabase = await createClient()
  const [{ data: speakers }, { data: notices }] = await Promise.all([
    supabase
      .from('speakers')
      .select('id, name, title, company, photo_url, fields, is_visible')
      .eq('is_visible', true)
      .order('sort_order', { ascending: true })
      .limit(8),
    supabase
      .from('notices')
      .select('id, title, content, is_pinned, published_at')
      .eq('is_visible', true)
      .order('published_at', { ascending: false })
      .limit(4),
  ])
  return {
    speakers: (speakers as Speaker[]) ?? [],
    notices: (notices as Notice[]) ?? [],
  }
}

// ── 신뢰 지표 (추후 DB/어드민 연동 예정) ──────────────────
const TRUST_STATS = [
  { number: '500건+', label: '누적 강연 기획' },
  { number: '200곳+', label: '파트너 기업/기관' },
  { number: '98%',   label: '고객 만족도' },
]

// ── 프로세스 4단계 (추후 DB/어드민 연동 예정) ──────────────
const PROCESS_STEPS = [
  { step: '01', icon: '📝', title: '의뢰 접수',      desc: '강연 목적, 대상, 예산을 간단히 알려주세요' },
  { step: '02', icon: '☎️', title: '24시간 내 연락', desc: '담당자가 직접 연락해 요구사항을 확인합니다' },
  { step: '03', icon: '🎯', title: '맞춤 강사 제안', desc: '조직에 딱 맞는 강사 2~3명을 추천드립니다' },
  { step: '04', icon: '✅', title: '계약 & 진행',    desc: '일정, 장소, 내용 조율 후 강연이 시작됩니다' },
]

export default async function HomePage() {
  const { speakers, notices } = await getData()

  // ── Insight 카드: 실제 데이터가 있는 것만 사용 ──
  const hero   = notices[0] ?? null
  const subs   = notices.slice(1, 4).filter(Boolean) as Notice[]
  const showInsight = hero !== null || subs.length > 0

  return (
    <>
      <style>{`
        .btn-fill-green {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 12px; font-weight: 700; letter-spacing: 0.08em;
          color: var(--color-bg); background: var(--color-green);
          padding: 13px 26px; transition: background 0.2s;
        }
        .btn-fill-green:hover { background: var(--color-rust); }
        .btn-ghost-ink {
          font-size: 12px; font-weight: 500; letter-spacing: 0.06em;
          color: var(--color-ink);
          display: inline-flex; align-items: center; gap: 6px;
          transition: gap 0.2s;
        }
        .btn-ghost-ink:hover { gap: 12px; }
        .see-all-link {
          font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
          color: var(--color-subtle); text-transform: uppercase;
          display: flex; align-items: center; gap: 6px;
          transition: color 0.2s, gap 0.2s;
        }
        .see-all-link:hover { color: var(--color-ink); gap: 10px; }
        .insight-hero-card { background: var(--color-green); transition: background 0.15s; }
        .insight-hero-card:hover { background: #223630; }
        .insight-card-plain { transition: background 0.15s; }
        .insight-card-plain:hover { background: var(--color-surface); }

        /* ── 신뢰 배너 ── */
        .trust-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
        }
        .trust-item {
          padding: clamp(28px, 4vw, 44px) var(--space-page);
          border-right: 1px solid var(--color-border);
          text-align: center;
        }
        .trust-item:last-child { border-right: none; }

        /* ── 프로세스 그리드 ── */
        .process-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border-left: 1px solid var(--color-border);
        }
        .process-item {
          padding: clamp(24px, 3.5vw, 40px) clamp(20px, 2.5vw, 32px);
          border-right: 1px solid var(--color-border);
          border-bottom: 1px solid var(--color-border);
          position: relative;
        }
        .process-arrow {
          position: absolute; right: -10px; top: 50%;
          transform: translateY(-50%);
          font-size: 14px; color: var(--color-border);
          z-index: 1;
        }
        .process-item:last-child .process-arrow { display: none; }

        /* ── 모바일 전반 ── */
        @media (max-width: 768px) {
          .inquiry-grid { grid-template-columns: 1fr !important; min-height: auto !important; }
          .about-grid   { grid-template-columns: 1fr !important; }
          .insight-grid { grid-template-columns: 1fr !important; }
          .insight-hero-card { grid-column: span 1 !important; min-height: 200px !important; }
          .hero-actions { flex-direction: column !important; align-items: flex-start !important; gap: 16px !important; }
          .about-left-col { border-right: none !important; border-bottom: 1px solid var(--color-border) !important; }
          .inquiry-panel-l, .inquiry-panel-r, .about-panel-l, .about-panel-r {
            padding-top: 28px !important; padding-bottom: 28px !important;
          }
          /* 신뢰 배너: 모바일 세로 나열 */
          .trust-grid {
            grid-template-columns: 1fr;
          }
          .trust-item {
            border-right: none;
            border-bottom: 1px solid var(--color-border);
            text-align: left;
            display: flex; align-items: center; gap: 16px;
          }
          .trust-item:last-child { border-bottom: none; }
          /* 프로세스: 모바일 타임라인 세로 */
          .process-grid {
            grid-template-columns: 1fr;
          }
          .process-item {
            padding-left: var(--space-page);
            padding-right: var(--space-page);
          }
          .process-arrow { display: none; }
        }
      `}</style>

      <div style={{ paddingTop: 'var(--nav-height)' }}>

        {/* ── TICKER ── */}
        <HeroTicker speakerCount={speakers.length} />

        {/* ── HERO (F-A: 카피 교체) ── */}
        <section style={{
          minHeight: 'clamp(360px, 60vh, calc(100vh - var(--nav-height) - 38px))',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 'clamp(48px, 8vw, 96px) var(--space-page) clamp(40px,6vw,56px)',
          borderBottom: '1px solid var(--color-border)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* SPEAK 워터마크 */}
          <div aria-hidden style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            fontFamily: 'var(--font-english)',
            fontSize: 'clamp(100px, 18vw, 260px)',
            color: 'var(--color-border)',
            opacity: 0.55, zIndex: 0,
            pointerEvents: 'none', userSelect: 'none',
            lineHeight: 1, letterSpacing: '-0.02em', whiteSpace: 'nowrap',
          }}>SPEAK</div>

          <div style={{ position: 'relative', zIndex: 1, maxWidth: '860px' }}>
            <p style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              fontSize: '11px', fontWeight: 500, letterSpacing: '0.14em',
              color: 'var(--color-muted)', marginBottom: '20px', textTransform: 'uppercase',
            }}>
              <span style={{ display: 'block', width: '20px', height: '1px', background: 'var(--color-muted)' }} />
              강연 기획의 새로운 기준
            </p>

            {/* F-A: 헤드라인 교체 */}
            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 900,
              fontSize: 'clamp(40px, 6vw, 88px)',
              lineHeight: 1.12, letterSpacing: '-0.03em', marginBottom: '28px',
            }}>
              사람이 바뀌는 강연,
              <span style={{ color: 'var(--color-rust)', fontWeight: 400, display: 'block' }}>여기서 시작됩니다.</span>
            </h1>

            {/* F-A: 서브카피 교체 */}
            <p style={{
              fontSize: '14px', fontWeight: 300,
              color: 'var(--color-subtle)', lineHeight: 1.9,
              maxWidth: '440px', marginBottom: '44px',
              whiteSpace: 'pre-line',
            }}>
              {`최선화닷컴은 단순한 소개가 아닙니다.\n기획부터 현장까지, 서로 끌리는 강사와 기업을 연결합니다.`}
            </p>

            <div className="hero-actions" style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
              <Link href="/speakers" className="btn-fill-green">연사 라인업 보기 →</Link>
              <Link href="/inquiry" className="btn-ghost-ink">강연 의뢰하기 →</Link>
            </div>
          </div>

          <span aria-hidden style={{
            position: 'absolute', right: 'var(--space-page)',
            bottom: 'clamp(24px, 4vw, 40px)',
            writingMode: 'vertical-rl', fontSize: '10px', letterSpacing: '0.16em',
            color: 'var(--color-muted)', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            Scroll
            <span style={{ width: '1px', height: '44px', background: 'var(--color-muted)', display: 'block' }} />
          </span>
        </section>

        {/* ── F-B: 신뢰 지표 배너 ── */}
        <section style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
          <div className="trust-grid">
            {TRUST_STATS.map(({ number, label }, i) => (
              <div key={i} className="trust-item">
                <div style={{
                  fontFamily: 'var(--font-display)', fontWeight: 900,
                  fontSize: 'clamp(36px, 4.5vw, 64px)',
                  letterSpacing: '-0.03em', lineHeight: 1,
                  color: i % 2 === 0 ? 'var(--color-green)' : 'var(--color-rust)',
                  marginBottom: '8px',
                }}>
                  {number}
                </div>
                <div style={{
                  fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 400,
                  color: 'var(--color-subtle)', letterSpacing: '0.04em',
                }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── SPEAKERS ── */}
        <section style={{ borderBottom: '1px solid var(--color-border)' }} id="speakers">
          <div style={{
            display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
            padding: '28px var(--space-page) 22px',
            borderBottom: '1px solid var(--color-border)',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 900,
              fontSize: 'clamp(26px, 3vw, 44px)', letterSpacing: '-0.03em', lineHeight: 1,
            }}>
              연사 라인업{' '}
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: '13px', color: 'var(--color-muted)', marginLeft: '8px' }}>
                Speaker Lineup
              </span>
            </h2>
            <Link href="/speakers" className="see-all-link">전체 보기 →</Link>
          </div>
          <SpeakerTabs speakers={speakers} fieldMap={FIELD_MAP} />
        </section>

        {/* ── F-D/E: INSIGHT — 데이터 있을 때만 렌더링 ── */}
        {showInsight && (
          <section style={{ borderBottom: '1px solid var(--color-border)' }} id="insight">
            <div style={{
              display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
              padding: '28px var(--space-page) 22px',
              borderBottom: '1px solid var(--color-border)',
            }}>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontWeight: 900,
                fontSize: 'clamp(26px, 3vw, 44px)', letterSpacing: '-0.03em', lineHeight: 1,
              }}>
                인사이트{' '}
                <span style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: '13px', color: 'var(--color-muted)', marginLeft: '8px' }}>Insight</span>
              </h2>
              <Link href="/support/notice" className="see-all-link">전체 보기 →</Link>
            </div>

            <div className="insight-grid" style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              borderLeft: '1px solid var(--color-border)',
            }}>
              {/* 히어로 카드 (데이터 있을 때만) */}
              {hero && (
                <Link
                  href={`/support/notice/${hero.id}`}
                  className="insight-hero-card"
                  style={{
                    gridColumn: 'span 2',
                    padding: 'clamp(24px, 3vw, 36px)',
                    borderRight: '1px solid var(--color-border)',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                    minHeight: '280px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-ochre)', marginBottom: '12px' }}>
                      {hero.is_pinned ? '📌 공지' : '에디터 픽'}
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(18px, 2.5vw, 26px)', letterSpacing: '-0.02em', lineHeight: 1.3, marginBottom: '10px', color: 'var(--color-bg)' }}>
                      {hero.title}
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: 300, color: 'rgba(247,243,238,0.65)', lineHeight: 1.75 }}>
                      {hero.content ? hero.content.substring(0, 80) + (hero.content.length > 80 ? '…' : '') : ''}
                    </p>
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(247,243,238,0.45)', letterSpacing: '0.04em', marginTop: '16px' }}>
                    {new Date(hero.published_at).toLocaleDateString('ko-KR')} · Editor&apos;s Pick
                  </div>
                </Link>
              )}

              {/* 서브 카드: 실제 데이터만 렌더링 (F-D/E: 빈 카드 숨김) */}
              {subs.map((notice) => (
                <Link
                  key={notice.id}
                  href={`/support/notice/${notice.id}`}
                  className="insight-card-plain"
                  style={{
                    padding: 'clamp(20px, 2.5vw, 28px)',
                    borderRight: '1px solid var(--color-border)',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex', flexDirection: 'column', gap: '10px',
                  }}
                >
                  <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
                    인사이트
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '16px', letterSpacing: '-0.02em', lineHeight: 1.45, color: 'var(--color-ink)' }}>
                    {notice.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-muted)', letterSpacing: '0.04em', marginTop: 'auto' }}>
                    {new Date(notice.published_at).toLocaleDateString('ko-KR')}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── F-C: 프로세스 4단계 ── */}
        <section style={{ borderBottom: '1px solid var(--color-border)' }} id="process">
          <div style={{
            display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
            padding: '28px var(--space-page) 22px', borderBottom: '1px solid var(--color-border)',
          }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(26px, 3vw, 44px)', letterSpacing: '-0.03em', lineHeight: 1 }}>
              의뢰하면 이렇게 됩니다{' '}
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: '13px', color: 'var(--color-muted)', marginLeft: '8px' }}>How it works</span>
            </h2>
          </div>

          <div className="process-grid">
            {PROCESS_STEPS.map(({ step, icon, title, desc }, i) => (
              <div key={step} className="process-item">
                {/* 단계 간 화살표 (PC) */}
                {i < PROCESS_STEPS.length - 1 && (
                  <span className="process-arrow">→</span>
                )}
                <div style={{ fontFamily: 'var(--font-english)', fontSize: '11px', fontWeight: 400, letterSpacing: '0.12em', color: 'var(--color-muted)', marginBottom: '12px' }}>
                  STEP {step}
                </div>
                <div style={{ fontSize: '20px', marginBottom: '10px', lineHeight: 1 }}>{icon}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(15px, 1.8vw, 18px)', letterSpacing: '-0.02em', color: 'var(--color-ink)', marginBottom: '8px', lineHeight: 1.3 }}>
                  {title}
                </div>
                <p style={{ fontSize: '12px', fontWeight: 300, color: 'var(--color-subtle)', lineHeight: 1.75 }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── INQUIRY ── */}
        <section style={{ borderBottom: '1px solid var(--color-border)' }} id="inquiry">
          <div style={{
            display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
            padding: '28px var(--space-page) 22px', borderBottom: '1px solid var(--color-border)',
          }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(26px, 3vw, 44px)', letterSpacing: '-0.03em', lineHeight: 1 }}>
              강연 의뢰하기{' '}
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: '13px', color: 'var(--color-muted)', marginLeft: '8px' }}>Inquiry</span>
            </h2>
          </div>

          <div className="inquiry-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '480px' }}>
            {/* 좌측 다크 */}
            <div className="inquiry-panel-l" style={{
              background: 'var(--color-ink)',
              padding: 'clamp(40px, 6vw, 60px) var(--space-page)',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              borderRight: '1px solid var(--color-border)',
            }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(48px, 6.5vw, 96px)', lineHeight: 0.95, letterSpacing: '-0.02em', color: 'var(--color-bg)' }}>
                강연,<br />
                <em style={{ display: 'block', color: 'var(--color-rust)', fontStyle: 'normal' }}>지금<br />시작.</em>
              </div>
              <p style={{ fontSize: '12px', fontWeight: 300, color: 'rgba(247,243,238,0.45)', letterSpacing: '0.06em', lineHeight: 1.8 }}>
                강연 주제 · 대상 · 예산을 알려주시면<br />1–2 영업일 내 맞춤 강사를 제안드립니다.
              </p>
            </div>

            {/* 우측 CTA */}
            <div className="inquiry-panel-r" style={{ padding: 'clamp(36px, 5vw, 48px) var(--space-page)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 300, color: 'var(--color-subtle)', lineHeight: 1.9, marginBottom: '36px' }}>
                  복잡하게 생각하지 않아도 됩니다.<br />
                  어떤 강연이 필요한지 간단히 알려주시면<br />
                  나머지는 최선화닷컴이 함께 설계합니다.
                </p>
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '24px', marginBottom: '40px' }}>
                  <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-ink)', marginBottom: '6px' }}>강연 의뢰 연락처</p>
                  <p style={{ fontSize: '13px', fontWeight: 300, color: 'var(--color-subtle)' }}>contact@choisunhwa.com</p>
                </div>
              </div>
              <Link href="/inquiry/lecture" className="btn-fill-green" style={{ alignSelf: 'flex-start' }}>
                프로젝트 시작하기 →
              </Link>
            </div>
          </div>
        </section>

        {/* ── ABOUT ── */}
        <section style={{ borderBottom: '1px solid var(--color-border)' }} id="about">
          <div style={{ padding: '28px var(--space-page) 22px', borderBottom: '1px solid var(--color-border)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(26px, 3vw, 44px)', letterSpacing: '-0.03em', lineHeight: 1 }}>
              최선화닷컴 이야기{' '}
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: '13px', color: 'var(--color-muted)', marginLeft: '8px' }}>About</span>
            </h2>
          </div>

          <div className="about-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <div className="about-left-col about-panel-l" style={{ padding: 'clamp(36px, 5vw, 52px) var(--space-page)', borderRight: '1px solid var(--color-border)' }}>
              <p style={{ fontSize: '14px', fontWeight: 300, color: 'var(--color-subtle)', lineHeight: 2 }}>
                강연 기획은 <strong style={{ color: 'var(--color-ink)', fontWeight: 600 }}>단순한 섭외가 아닙니다.</strong><br />
                기업의 목적을 이해하고, 그에 맞는 강사를 찾고,<br />
                현장에서 실제로 작동하는 강연을 만드는 일입니다.<br /><br />
                최선화닷컴은 <strong style={{ color: 'var(--color-ink)', fontWeight: 600 }}>그 과정 전체를 함께합니다.</strong><br />
                강연 기획부터 강사 섭외, 현장 운영, 사후 관리까지 —<br />
                한 팀이 처음부터 끝까지.
              </p>
            </div>
            <div className="about-panel-r" style={{ padding: 'clamp(36px, 5vw, 52px) var(--space-page)' }}>
              <ol style={{ listStyle: 'none' }}>
                {[
                  { step: '01', title: '강연 목적 및 대상 분석', desc: '기업의 니즈를 먼저 이해합니다' },
                  { step: '02', title: '검증된 강사 매칭 및 제안', desc: '직접 검증한 강사 풀에서 최적안 추출' },
                  { step: '03', title: '섭외 협의 및 계약 진행', desc: '커뮤니케이션 전담 처리' },
                  { step: '04', title: '현장 운영 지원', desc: '당일 현장까지 함께합니다' },
                  { step: '05', title: '사후 피드백 및 성과 분석', desc: '강연 후 데이터로 다음을 준비합니다' },
                ].map(({ step, title, desc }, i, arr) => (
                  <li key={step} style={{
                    display: 'grid', gridTemplateColumns: '36px 1fr', gap: '16px',
                    padding: '16px 0',
                    borderBottom: i < arr.length - 1 ? '1px solid var(--color-border)' : 'none',
                    alignItems: 'flex-start',
                  }}>
                    <span style={{ fontFamily: 'var(--font-english)', fontSize: '15px', color: 'var(--color-ochre)', paddingTop: '1px' }}>{step}</span>
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 500, letterSpacing: '-0.01em', display: 'block', lineHeight: 1.5 }}>{title}</span>
                      <small style={{ display: 'block', fontSize: '12px', fontWeight: 300, color: 'var(--color-muted)', marginTop: '2px' }}>{desc}</small>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

      </div>
    </>
  )
}
