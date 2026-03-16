import type { Metadata } from 'next'
import Link from 'next/link'
import RevealOnScroll from '@/components/RevealOnScroll'

export const metadata: Metadata = {
  title: '회사소개',
  description: '최선화닷컴은 강연 기획의 새로운 기준을 만드는 전문 플랫폼입니다.',
}

const VALUES = [
  {
    label: '미션',
    content: '올바른 강사와 기업을 연결하여 교육의 실질적 성과를 만든다.',
  },
  {
    label: '비전',
    content: '대한민국 강연 기획의 새로운 기준이 되는 플랫폼',
  },
]

const WHY_ITEMS = [
  {
    num: '01',
    title: '검증된 강사진',
    desc: '이력과 현장 경험을 직접 확인한 강사만 등록됩니다. 검색이 아닌 검증입니다.',
  },
  {
    num: '02',
    title: '맞춤 기획',
    desc: '단순 소개가 아닙니다. 기업 목표를 분석하고 최적의 커리큘럼을 함께 설계합니다.',
  },
  {
    num: '03',
    title: '투명한 프로세스',
    desc: '의뢰부터 현장까지 담당자 한 명이 처음부터 끝까지 함께합니다.',
  },
  {
    num: '04',
    title: '사후 관리',
    desc: '강연 후 피드백과 성과 데이터로 다음 교육을 더 잘 만듭니다.',
  },
]

export default function AboutPage() {
  return (
    <>
      <style>{`
        .about-values-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border-left: 1px solid var(--color-border);
        }
        .about-value-item {
          padding: clamp(28px, 4vw, 52px) var(--space-page);
          border-right: 1px solid var(--color-border);
          border-bottom: 1px solid var(--color-border);
        }
        .about-why-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border-left: 1px solid var(--color-border);
        }
        .about-why-item {
          padding: clamp(28px, 4vw, 48px) var(--space-page);
          border-right: 1px solid var(--color-border);
          border-bottom: 1px solid var(--color-border);
          transition: background 0.15s;
        }
        .about-why-item:hover { background: var(--color-surface); }
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

        @media (max-width: 640px) {
          .about-values-grid,
          .about-why-grid    { grid-template-columns: 1fr; }
          .about-copy-grid   { grid-template-columns: 1fr; }
          .about-contact-grid { grid-template-columns: 1fr; }
          .about-copy-right  { border-left: none !important; border-top: 1px solid var(--color-border) !important; }
          .about-contact-r   { border-left: none !important; border-top: 1px solid var(--color-border) !important; }
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
          }}>ABOUT</div>

          <div style={{ position: 'relative', zIndex: 1, maxWidth: '560px' }}>
            <p style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              fontSize: '11px', fontWeight: 500, letterSpacing: '0.14em',
              color: 'var(--color-muted)', marginBottom: '20px', textTransform: 'uppercase',
            }}>
              <span style={{ display: 'block', width: '20px', height: '1px', background: 'var(--color-muted)' }} />
              회사 소개
            </p>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 900,
              fontSize: 'clamp(36px, 5.5vw, 80px)',
              lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '24px',
            }}>
              강연 기획의<br />
              <span style={{ color: 'var(--color-rust)', fontWeight: 400 }}>새로운 기준.</span>
            </h1>
            <p style={{
              fontSize: '14px', fontWeight: 300,
              color: 'var(--color-subtle)', lineHeight: 1.9, maxWidth: '400px',
            }}>
              최선화닷컴은 강사와 기업을 연결하는 것에서 나아가<br />
              강연 전 과정을 함께 설계합니다.
            </p>
          </div>
        </section>

        {/* ── 미션 / 비전 ── */}
        <section className="reveal" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="section-hd" style={{
            padding: '28px var(--space-page) 22px',
            borderBottom: '1px solid var(--color-border)',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 900,
              fontSize: 'clamp(24px, 3vw, 44px)', letterSpacing: '-0.03em', lineHeight: 1,
            }}>
              미션 & 비전{' '}
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: '13px', color: 'var(--color-muted)', marginLeft: '8px' }}>Mission & Vision</span>
            </h2>
          </div>
          <div className="about-values-grid">
            {VALUES.map(({ label, content }) => (
              <div key={label} className="about-value-item">
                <p style={{
                  fontSize: '9px', fontWeight: 700, letterSpacing: '0.16em',
                  textTransform: 'uppercase', color: 'var(--color-ochre)', marginBottom: '16px',
                }}>{label}</p>
                <p style={{
                  fontFamily: 'var(--font-display)', fontWeight: 800,
                  fontSize: 'clamp(16px, 2vw, 22px)', letterSpacing: '-0.02em', lineHeight: 1.4,
                  color: 'var(--color-ink)',
                }}>{content}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 왜 최선화닷컴인가 ── */}
        <section className="reveal" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="section-hd" style={{
            padding: '28px var(--space-page) 22px',
            borderBottom: '1px solid var(--color-border)',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 900,
              fontSize: 'clamp(24px, 3vw, 44px)', letterSpacing: '-0.03em', lineHeight: 1,
            }}>
              왜 최선화닷컴인가요?{' '}
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: '13px', color: 'var(--color-muted)', marginLeft: '8px' }}>Why us</span>
            </h2>
          </div>
          <div className="about-why-grid reveal-stagger">
            {WHY_ITEMS.map(({ num, title, desc }) => (
              <div key={num} className="about-why-item">
                <span style={{
                  fontFamily: 'var(--font-english)', fontSize: '11px', fontWeight: 700,
                  letterSpacing: '0.1em', color: 'var(--color-ochre)',
                  display: 'block', marginBottom: '14px',
                }}>{num}</span>
                <h3 style={{
                  fontFamily: 'var(--font-display)', fontWeight: 800,
                  fontSize: 'clamp(16px, 2vw, 20px)', letterSpacing: '-0.02em', lineHeight: 1.25,
                  color: 'var(--color-ink)', marginBottom: '10px',
                }}>{title}</h3>
                <p style={{ fontSize: '13px', fontWeight: 300, color: 'var(--color-subtle)', lineHeight: 1.85 }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 회사 소개 본문 (좌우 스플릿) ── */}
        <section className="reveal" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="about-copy-grid">
            <div className="reveal-left" style={{
              padding: 'clamp(36px, 5vw, 56px) var(--space-page)',
              borderRight: '1px solid var(--color-border)',
            }}>
              <p style={{ fontSize: '14px', fontWeight: 300, color: 'var(--color-subtle)', lineHeight: 2 }}>
                기업 교육의 효과는 강사의 역량과<br />
                강연 기획의 질에 달려 있습니다.<br /><br />
                최선화닷컴은{' '}
                <strong style={{ color: 'var(--color-ink)', fontWeight: 600 }}>단순한 강사 소개가 아닙니다.</strong><br />
                기업의 교육 목표를 분석하고, 최적의 강사와<br />
                커리큘럼을 함께 설계하는 강연 기획 전문 파트너입니다.
              </p>
            </div>
            <div className="about-copy-right reveal-right" style={{
              padding: 'clamp(36px, 5vw, 56px) var(--space-page)',
            }}>
              <p style={{ fontSize: '14px', fontWeight: 300, color: 'var(--color-subtle)', lineHeight: 2 }}>
                날카롭게 문제를 짚고,<br />
                <strong style={{ color: 'var(--color-ink)', fontWeight: 600 }}>최선의 해답을 찾습니다.</strong><br /><br />
                검증된 강사진, 투명한 프로세스,<br />
                사후 관리까지 — 최선화닷컴이 처음부터 끝까지 함께합니다.
              </p>
            </div>
          </div>
        </section>

        {/* ── 연락처 ── */}
        <section className="reveal" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="section-hd" style={{
            padding: '28px var(--space-page) 22px',
            borderBottom: '1px solid var(--color-border)',
          }}>
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
                  <a
                    href={href}
                    className="contact-link"
                    style={{ fontSize: '13px', color: 'var(--color-ink)', fontWeight: 500 }}
                  >
                    {value}
                  </a>
                </div>
              ))}
            </div>
            <div className="about-contact-r" style={{
              padding: 'clamp(28px, 4vw, 48px) var(--space-page)',
              display: 'flex', alignItems: 'flex-end',
            }}>
              <Link
                href="/inquiry/lecture"
                className="about-cta"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em',
                  color: 'var(--color-bg)', background: 'var(--color-green)',
                  padding: '13px 26px', transition: 'background 0.2s',
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
