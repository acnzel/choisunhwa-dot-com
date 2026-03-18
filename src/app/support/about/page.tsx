import type { Metadata } from 'next'
import Link from 'next/link'
import RevealOnScroll from '@/components/RevealOnScroll'

export const metadata: Metadata = {
  title: '최선화닷컴 이야기',
  description: '저희는 강사를 소개하는 것이 아니라, 조직의 필요에 맞는 강연을 설계합니다.',
}

const PROCESS_STEPS = [
  {
    num: '01',
    title: '의뢰 접수',
    desc: '강연 목적, 대상, 예산을 간단히 알려주세요.\n온라인 폼 또는 전화 문의 모두 가능합니다.',
  },
  {
    num: '02',
    title: '24시간 내 연락',
    desc: '담당자가 직접 연락드립니다.\n더 자세한 상황을 파악하고 방향을 잡아드립니다.',
  },
  {
    num: '03',
    title: '맞춤 강사 제안',
    desc: '조직에 딱 맞는 강사 2~3명을 제안드립니다.\n강사 소개 자료와 강연 주제를 함께 드립니다.',
  },
  {
    num: '04',
    title: '일정 조율 & 계약',
    desc: '강연 일정, 장소, 세부 내용을 협의합니다.\n계약 후 강연 당일까지 꼼꼼히 준비합니다.',
  },
  {
    num: '05',
    title: '강연 진행 & 사후 관리',
    desc: '강연 당일 현장 지원부터 종료 후 피드백까지.\n필요하면 후속 강연도 함께 기획합니다.',
  },
]

const VALUES = [
  {
    icon: '◆',
    title: '정직한 제안',
    desc: '잘 맞지 않는 강사를 섭외하지 않습니다.\n모르면 모른다고, 어려우면 어렵다고 말합니다.',
  },
  {
    icon: '◆',
    title: '긴 안목의 파트너십',
    desc: '한 번 거래가 아닌, 오래 함께하는 관계를 목표로 합니다.\n고객이 필요할 때 먼저 연락하는 파트너가 되겠습니다.',
  },
  {
    icon: '◆',
    title: '강사를 소중히',
    desc: '저희와 함께하는 강사분들은 엄선된 분들입니다.\n강사의 전문성과 시간이 제대로 존중받을 수 있도록 관리합니다.',
  },
]

export default function AboutPage() {
  return (
    <>
      <style>{`
        .about-process-list {
          border-left: 1px solid var(--color-border);
        }
        .about-process-item {
          display: grid;
          grid-template-columns: 80px 1fr;
          gap: 0;
          border-right: 1px solid var(--color-border);
          border-bottom: 1px solid var(--color-border);
        }
        .about-process-num {
          padding: clamp(24px, 3vw, 36px) clamp(16px, 2vw, 24px);
          border-right: 1px solid var(--color-border);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: clamp(28px, 3.5vw, 42px);
        }
        .about-process-body {
          padding: clamp(24px, 3vw, 36px) var(--space-page);
        }
        .about-values-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border-left: 1px solid var(--color-border);
        }
        .about-value-item {
          padding: clamp(28px, 4vw, 52px) var(--space-page);
          border-right: 1px solid var(--color-border);
          border-bottom: 1px solid var(--color-border);
        }
        .about-copy-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
        .about-contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
        .contact-link { transition: color 0.15s; }
        .contact-link:hover { color: var(--color-rust) !important; }
        .about-cta:hover { background: var(--color-rust) !important; }

        @media (max-width: 760px) {
          .about-values-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .about-process-item { grid-template-columns: 52px 1fr; }
          .about-copy-grid    { grid-template-columns: 1fr; }
          .about-contact-grid { grid-template-columns: 1fr; }
          .about-copy-right   { border-left: none !important; border-top: 1px solid var(--color-border) !important; }
          .about-contact-r    { border-left: none !important; border-top: 1px solid var(--color-border) !important; }
        }
      `}</style>

      <div className="page-max-wrap" style={{ paddingTop: 'var(--nav-height)', minHeight: '100dvh' }}>
        <RevealOnScroll />

        {/* ── HERO ── */}
        <section style={{
          minHeight: 'clamp(260px, 38dvh, 460px)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: 'clamp(48px, 8vw, 96px) var(--space-page) clamp(40px, 6vw, 56px)',
          borderBottom: '1px solid var(--color-border)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* 워터마크 */}
          <div aria-hidden style={{
            position: 'absolute', top: '50%', right: 'var(--space-page)',
            transform: 'translateY(-50%)',
            fontFamily: 'var(--font-english)',
            fontSize: 'clamp(72px, 13vw, 190px)',
            color: 'var(--color-border)', opacity: 0.5,
            zIndex: 0, pointerEvents: 'none', userSelect: 'none',
            lineHeight: 1, letterSpacing: '-0.02em',
          }}>STORY</div>

          <div style={{ position: 'relative', zIndex: 1, maxWidth: '560px' }}>
            <p style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              fontSize: '11px', fontWeight: 500, letterSpacing: '0.14em',
              color: 'var(--color-muted)', marginBottom: '20px', textTransform: 'uppercase',
            }}>
              <span style={{ display: 'block', width: '20px', height: '1px', background: 'var(--color-muted)' }} />
              최선화닷컴 이야기
            </p>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 900,
              fontSize: 'clamp(32px, 5.5vw, 76px)',
              lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '24px',
            }}>
              강연은 단순한<br />교육이 아닙니다.<br />
              <span style={{ color: 'var(--color-rust)', fontWeight: 400 }}>조직이 바뀌는 경험입니다.</span>
            </h1>
            <p style={{
              fontSize: '14px', fontWeight: 300,
              color: 'var(--color-subtle)', lineHeight: 1.9, maxWidth: '420px',
            }}>
              저희는 강사를 소개하는 것이 아니라,<br />
              조직의 필요에 맞는 강연을 설계합니다.
            </p>
          </div>
        </section>

        {/* ── 우리가 하는 일 ── */}
        <section className="reveal" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ padding: '28px var(--space-page) 22px', borderBottom: '1px solid var(--color-border)' }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 900,
              fontSize: 'clamp(24px, 3vw, 44px)', letterSpacing: '-0.03em', lineHeight: 1,
            }}>
              우리가 하는 일{' '}
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: '13px', color: 'var(--color-muted)', marginLeft: '8px' }}>What We Do</span>
            </h2>
          </div>
          <div className="about-copy-grid">
            <div className="reveal-left" style={{
              padding: 'clamp(32px, 4.5vw, 52px) var(--space-page)',
              borderRight: '1px solid var(--color-border)',
            }}>
              <p style={{ fontSize: '14px', fontWeight: 300, color: 'var(--color-subtle)', lineHeight: 2 }}>
                강연 기획사는 많습니다.<br />
                그런데 대부분은 강사 목록을 보여주고<br />
                선택을 고객에게 맡깁니다.
              </p>
            </div>
            <div className="about-copy-right reveal-right" style={{
              padding: 'clamp(32px, 4.5vw, 52px) var(--space-page)',
            }}>
              <p style={{ fontSize: '14px', fontWeight: 300, color: 'var(--color-subtle)', lineHeight: 2 }}>
                저희는 <strong style={{ color: 'var(--color-ink)', fontWeight: 600 }}>강연 목적부터 묻습니다.</strong><br />
                팀의 어떤 문제를 해결하고 싶은지,<br />
                어떤 변화를 원하는지 — 그 답을 듣고 나서 강사를 제안합니다.<br /><br />
                <strong style={{ color: 'var(--color-ink)', fontWeight: 600 }}>강연 후에도 함께합니다.</strong><br />
                변화가 있었는지, 다음엔 무엇이 필요한지 — 계속 곁에 있습니다.
              </p>
            </div>
          </div>
        </section>

        {/* ── 진행 프로세스 ── */}
        <section className="reveal" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ padding: '28px var(--space-page) 22px', borderBottom: '1px solid var(--color-border)' }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 900,
              fontSize: 'clamp(24px, 3vw, 44px)', letterSpacing: '-0.03em', lineHeight: 1,
            }}>
              진행 프로세스{' '}
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: '13px', color: 'var(--color-muted)', marginLeft: '8px' }}>How It Works</span>
            </h2>
          </div>
          <div className="about-process-list reveal-stagger">
            {PROCESS_STEPS.map(({ num, title, desc }) => (
              <div key={num} className="about-process-item">
                <div className="about-process-num">
                  <span style={{
                    fontFamily: 'var(--font-english)', fontSize: '11px', fontWeight: 700,
                    letterSpacing: '0.1em', color: 'var(--color-ochre)',
                  }}>{num}</span>
                </div>
                <div className="about-process-body">
                  <h3 style={{
                    fontFamily: 'var(--font-display)', fontWeight: 800,
                    fontSize: 'clamp(15px, 1.8vw, 20px)', letterSpacing: '-0.02em',
                    color: 'var(--color-ink)', marginBottom: '8px',
                  }}>{title}</h3>
                  <p style={{
                    fontSize: '13px', fontWeight: 300, color: 'var(--color-subtle)',
                    lineHeight: 1.85, whiteSpace: 'pre-line',
                  }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 우리의 가치 ── */}
        <section className="reveal" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ padding: '28px var(--space-page) 22px', borderBottom: '1px solid var(--color-border)' }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 900,
              fontSize: 'clamp(24px, 3vw, 44px)', letterSpacing: '-0.03em', lineHeight: 1,
            }}>
              우리의 가치{' '}
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: '13px', color: 'var(--color-muted)', marginLeft: '8px' }}>Our Values</span>
            </h2>
          </div>
          <div className="about-values-grid reveal-stagger">
            {VALUES.map(({ icon, title, desc }) => (
              <div key={title} className="about-value-item">
                <span style={{
                  fontSize: '8px', color: 'var(--color-rust)',
                  display: 'block', marginBottom: '14px',
                }}>{icon}</span>
                <h3 style={{
                  fontFamily: 'var(--font-display)', fontWeight: 800,
                  fontSize: 'clamp(16px, 2vw, 20px)', letterSpacing: '-0.02em',
                  color: 'var(--color-ink)', marginBottom: '10px',
                }}>{title}</h3>
                <p style={{
                  fontSize: '13px', fontWeight: 300, color: 'var(--color-subtle)',
                  lineHeight: 1.85, whiteSpace: 'pre-line',
                }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 연락처 + CTA ── */}
        <section className="reveal" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ padding: '28px var(--space-page) 22px', borderBottom: '1px solid var(--color-border)' }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 900,
              fontSize: 'clamp(24px, 3vw, 44px)', letterSpacing: '-0.03em', lineHeight: 1,
            }}>
              연락처{' '}
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: '13px', color: 'var(--color-muted)', marginLeft: '8px' }}>Contact</span>
            </h2>
          </div>
          <div className="about-contact-grid">
            <div style={{
              padding: 'clamp(28px, 4vw, 48px) var(--space-page)',
              borderRight: '1px solid var(--color-border)',
            }}>
              {[
                { label: '이메일', value: 'contact@choisunhwa.com', href: 'mailto:contact@choisunhwa.com' },
                { label: '웹사이트', value: 'choisunhwa.com', href: 'https://choisunhwa-dot-com.vercel.app' },
              ].map(({ label, value, href }, i, arr) => (
                <div key={label} style={{
                  display: 'flex', gap: '20px',
                  paddingBottom: i < arr.length - 1 ? '16px' : '0',
                  marginBottom: i < arr.length - 1 ? '16px' : '0',
                  borderBottom: i < arr.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}>
                  <span style={{
                    fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em',
                    textTransform: 'uppercase', color: 'var(--color-muted)',
                    width: '56px', flexShrink: 0, paddingTop: '2px',
                  }}>{label}</span>
                  <a href={href} className="contact-link"
                    style={{ fontSize: '13px', color: 'var(--color-ink)', fontWeight: 500 }}>
                    {value}
                  </a>
                </div>
              ))}
            </div>
            <div className="about-contact-r" style={{
              padding: 'clamp(28px, 4vw, 48px) var(--space-page)',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '24px',
            }}>
              <p style={{
                fontSize: '13px', fontWeight: 300, color: 'var(--color-subtle)',
                lineHeight: 1.9,
              }}>
                강사와 기업이 제대로 만나는 곳.<br />
                강연으로 조직을 설계합니다.
              </p>
              <Link
                href="/inquiry/lecture"
                className="about-cta"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em',
                  color: 'var(--color-bg)', background: 'var(--color-green)',
                  padding: '13px 26px', transition: 'background 0.2s',
                  alignSelf: 'flex-start',
                }}
              >
                강연 의뢰하기 →
              </Link>
            </div>
          </div>
        </section>

      </div>
    </>
  )
}
