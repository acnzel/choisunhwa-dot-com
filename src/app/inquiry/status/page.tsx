import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Inquiry } from '@/types'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '문의 현황 확인',
  description: '이메일 주소로 접수하신 문의의 진행 현황을 확인하세요.',
}

const INQUIRY_TYPE_LABEL: Record<string, string> = {
  lecture_plan: '강연기획 문의',
  recruitment:  '강사섭외 문의',
  speaker_register: '강사등록 문의',
}

const STATUS_META: Record<string, { label: string; color: string; bg: string; desc: string }> = {
  new:        { label: '접수 완료', color: 'var(--color-green)',  bg: 'rgba(43,66,56,0.08)', desc: '문의가 접수되었습니다. 곧 담당자가 확인합니다.' },
  confirmed:  { label: '확인 중',   color: 'var(--color-ochre)',  bg: 'rgba(196,147,63,0.10)', desc: '담당자가 내용을 검토하고 있습니다.' },
  processing: { label: '처리 중',   color: '#2563eb',             bg: 'rgba(37,99,235,0.08)', desc: '담당자가 연락을 드리거나 강사를 알아보는 중입니다.' },
  done:       { label: '완료',      color: 'var(--color-subtle)', bg: 'var(--color-surface)', desc: '처리가 완료된 문의입니다.' },
}

interface Props {
  searchParams: Promise<{ email?: string }>
}

async function findInquiries(email: string): Promise<Inquiry[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('inquiries')
    .select('id, type, name, email, company, status, content, created_at')
    .eq('email', email.toLowerCase().trim())
    .order('created_at', { ascending: false })
    .limit(10)
  return (data as Inquiry[]) ?? []
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

export default async function InquiryStatusPage({ searchParams }: Props) {
  const { email = '' } = await searchParams
  const trimmedEmail   = email.trim()
  const inquiries      = trimmedEmail ? await findInquiries(trimmedEmail) : null

  return (
    <div style={{ minHeight: '100vh', paddingTop: 'var(--nav-height)', background: 'var(--color-bg)' }}>

      {/* ── 헤더 ── */}
      <div style={{ borderBottom: '1px solid var(--color-border)', padding: 'clamp(28px, 4vw, 44px) var(--space-page)' }}>
        <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '10px' }}>
          INQUIRY STATUS
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 900,
          fontSize: 'clamp(22px, 3vw, 36px)', letterSpacing: '-0.03em',
          color: 'var(--color-ink)', lineHeight: 1.2, marginBottom: '8px',
        }}>
          문의 현황 확인
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--color-subtle)', lineHeight: 1.7 }}>
          접수 시 입력하신 이메일 주소를 입력하면 진행 현황을 확인할 수 있습니다.
        </p>
      </div>

      {/* ── 검색 폼 ── */}
      <div style={{ padding: 'clamp(28px, 4vw, 44px) var(--space-page)', maxWidth: '600px' }}>
        <form method="GET" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="email"
            name="email"
            required
            defaultValue={trimmedEmail}
            placeholder="문의 시 입력한 이메일 주소"
            style={{
              flex: 1, minWidth: '200px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg)',
              padding: '12px 16px',
              fontSize: '13px', color: 'var(--color-ink)',
              outline: 'none',
              fontFamily: 'var(--font-body)',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '12px 24px',
              background: 'var(--color-green)',
              color: 'var(--color-bg)',
              fontSize: '12px', fontWeight: 700,
              letterSpacing: '0.08em',
              border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            조회하기
          </button>
        </form>
      </div>

      {/* ── 결과 ── */}
      {inquiries !== null && (
        <div style={{ padding: '0 var(--space-page) clamp(48px, 6vw, 80px)', maxWidth: '760px' }}>

          {inquiries.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: 'clamp(40px, 6vw, 64px) 0',
              border: '1px solid var(--color-border)',
            }}>
              <div style={{ fontSize: '36px', marginBottom: '14px' }}>📭</div>
              <p style={{
                fontFamily: 'var(--font-display)', fontWeight: 800,
                fontSize: '16px', letterSpacing: '-0.02em',
                color: 'var(--color-ink)', marginBottom: '8px',
              }}>
                해당 이메일로 접수된 문의가 없습니다.
              </p>
              <p style={{ fontSize: '12px', color: 'var(--color-muted)', lineHeight: 1.8, marginBottom: '24px' }}>
                이메일 주소가 정확한지 확인하거나, 새로 문의해주세요.
              </p>
              <Link
                href="/inquiry/lecture"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em',
                  color: 'var(--color-bg)', background: 'var(--color-green)',
                  padding: '11px 22px',
                }}
              >
                새 문의하기 →
              </Link>
            </div>
          ) : (
            <>
              <p style={{ fontSize: '12px', color: 'var(--color-muted)', marginBottom: '16px' }}>
                <strong style={{ color: 'var(--color-ink)' }}>{trimmedEmail}</strong> 으로 접수된 문의 {inquiries.length}건
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', border: '1px solid var(--color-border)' }}>
                {inquiries.map((inq) => {
                  const st = STATUS_META[inq.status] ?? STATUS_META.new
                  return (
                    <div
                      key={inq.id}
                      style={{
                        padding: 'clamp(18px, 2.5vw, 26px) clamp(16px, 3vw, 28px)',
                        background: 'var(--color-bg)',
                        borderBottom: '1px solid var(--color-border)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '10px', flexWrap: 'wrap' }}>
                        <div>
                          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
                            {INQUIRY_TYPE_LABEL[inq.type] ?? inq.type}
                          </span>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-ink)', marginTop: '4px' }}>
                            {inq.company ? `[${inq.company}] ` : ''}{inq.name}님
                          </p>
                          <p style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '2px' }}>
                            접수일: {inq.created_at ? formatDate(inq.created_at) : '—'}
                          </p>
                        </div>
                        <span style={{
                          fontSize: '11px', fontWeight: 700, padding: '4px 12px',
                          background: st.bg, color: st.color,
                          letterSpacing: '0.04em', flexShrink: 0,
                          alignSelf: 'flex-start',
                        }}>
                          {st.label}
                        </span>
                      </div>

                      {/* 진행 단계 표시 */}
                      <div style={{ display: 'flex', gap: '0', marginBottom: '10px', overflowX: 'auto' }}>
                        {(['new', 'confirmed', 'processing', 'done'] as const).map((step, i, arr) => {
                          const sMeta = STATUS_META[step]
                          const isActive  = inq.status === step
                          const isDone    = arr.indexOf(inq.status as typeof step) > i
                          return (
                            <div key={step} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                              <div style={{
                                flex: 1, textAlign: 'center',
                                padding: '6px 4px',
                                fontSize: '10px', fontWeight: isActive ? 700 : 400,
                                color: isActive ? sMeta.color : isDone ? 'var(--color-subtle)' : 'var(--color-border)',
                                borderBottom: isActive
                                  ? `2px solid ${sMeta.color}`
                                  : isDone ? '2px solid var(--color-subtle)'
                                  : '1px solid var(--color-border)',
                                whiteSpace: 'nowrap',
                              }}>
                                {sMeta.label}
                              </div>
                              {i < arr.length - 1 && (
                                <span style={{ fontSize: '10px', color: 'var(--color-border)', flexShrink: 0, padding: '0 2px' }}>›</span>
                              )}
                            </div>
                          )
                        })}
                      </div>

                      <p style={{ fontSize: '12px', color: 'var(--color-subtle)', lineHeight: 1.6 }}>
                        {st.desc}
                      </p>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* 문의하기 유도 */}
          {inquiries.length > 0 && (
            <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              <p style={{ fontSize: '12px', color: 'var(--color-muted)' }}>추가 문의가 필요하신가요?</p>
              <Link
                href="/inquiry/lecture"
                style={{
                  fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em',
                  color: 'var(--color-green)', textDecoration: 'underline', textUnderlineOffset: '3px',
                }}
              >
                새 문의하기 →
              </Link>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
