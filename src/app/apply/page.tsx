'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SPEAKER_FIELDS } from '@/constants'

// 강의료 범위 옵션
const FEE_OPTIONS = [
  { value: '',           label: '선택 안 함' },
  { value: 'under_100', label: '100만원 미만' },
  { value: '100_300',   label: '100만원 ~ 300만원' },
  { value: '300_500',   label: '300만원 ~ 500만원' },
  { value: 'over_500',  label: '500만원 이상' },
  { value: 'negotiable', label: '협의 가능' },
]

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function SpeakerApplyPage() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', title: '', company: '',
    fields: [] as string[],
    bio_short: '', bio_full: '', lecture_topics: '',
    career: '', education: '', youtube_url: '', fee_range: '',
  })
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))
  const toggleField = (f: string) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields.includes(f)
        ? prev.fields.filter(x => x !== f)
        : [...prev.fields, f],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) {
      setErrorMsg('이름과 이메일은 필수입니다.')
      return
    }
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/speaker-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? '오류가 발생했습니다')
      setStatus('success')
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : '오류가 발생했습니다')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div style={{
        paddingTop: 'var(--nav-height)', minHeight: '100dvh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 'var(--nav-height) var(--space-page) 80px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 48, marginBottom: 24 }}>✅</div>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 900,
          fontSize: 'clamp(24px, 3vw, 36px)', letterSpacing: '-0.03em',
          marginBottom: 16,
        }}>
          등록 신청이 완료되었습니다
        </h1>
        <p style={{ fontSize: 15, color: 'var(--color-subtle)', lineHeight: 1.8, marginBottom: 32 }}>
          담당자 검토 후 입력하신 이메일로 연락드리겠습니다.<br />
          보통 2~3 영업일 내에 회신 드립니다.
        </p>
        <Link href="/" style={{
          fontSize: 12, fontWeight: 700, letterSpacing: '0.08em',
          color: 'var(--color-bg)', background: 'var(--color-green)',
          padding: '12px 28px', textDecoration: 'none',
        }}>
          홈으로 →
        </Link>
      </div>
    )
  }

  return (
    <>
      <style>{`
        .apply-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .apply-field-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .apply-field-btn {
          font-size: 12px; font-weight: 500;
          padding: 6px 14px;
          border: 1px solid var(--color-border);
          background: var(--color-bg);
          color: var(--color-subtle);
          cursor: pointer;
          transition: all 0.15s;
        }
        .apply-field-btn.active {
          background: var(--color-green);
          border-color: var(--color-green);
          color: var(--color-bg);
        }
        .apply-input {
          width: 100%;
          padding: 11px 14px;
          border: 1px solid var(--color-border);
          background: var(--color-bg);
          font-family: var(--font-body);
          font-size: 14px;
          color: var(--color-ink);
          outline: none;
          transition: border-color 0.15s;
        }
        .apply-input:focus { border-color: var(--color-green); }
        .apply-label {
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--color-muted);
          display: block; margin-bottom: 6px;
        }
        .apply-required { color: var(--color-rust); margin-left: 2px; }
        .apply-submit {
          width: 100%;
          padding: 15px;
          background: var(--color-green);
          color: var(--color-bg);
          border: none;
          font-family: var(--font-body);
          font-size: 14px; font-weight: 700;
          letter-spacing: 0.06em;
          cursor: pointer;
          transition: background 0.2s;
        }
        .apply-submit:hover { background: var(--color-rust); }
        .apply-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        @media (max-width: 640px) {
          .apply-form-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="page-max-wrap" style={{ paddingTop: 'var(--nav-height)', minHeight: '100dvh' }}>
        {/* 헤더 */}
        <section style={{
          padding: 'clamp(40px, 6vw, 72px) var(--space-page) clamp(32px, 4vw, 48px)',
          borderBottom: '1px solid var(--color-border)',
        }}>
          <p style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.14em',
            color: 'var(--color-green)', textTransform: 'uppercase',
            marginBottom: 16,
          }}>
            강사 등록 신청
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: 'clamp(28px, 4vw, 52px)',
            letterSpacing: '-0.03em', lineHeight: 1.1,
            marginBottom: 16,
          }}>
            강사로 활동하고 싶으신가요?
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-subtle)', lineHeight: 1.8, maxWidth: 480 }}>
            아래 양식을 작성해 주시면 담당자가 검토 후 연락드립니다.<br />
            검토 완료 후 최선화닷컴 강사로 등재됩니다.
          </p>
        </section>

        {/* 폼 */}
        <section style={{ padding: 'clamp(32px, 4vw, 56px) var(--space-page)', maxWidth: 720 }}>
          <form onSubmit={handleSubmit}>

            {/* 기본 정보 */}
            <div style={{ marginBottom: 32 }}>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontWeight: 800,
                fontSize: 18, letterSpacing: '-0.02em',
                marginBottom: 20, paddingBottom: 12,
                borderBottom: '1px solid var(--color-border)',
              }}>기본 정보</h2>

              <div className="apply-form-grid">
                <div>
                  <label className="apply-label">이름 <span className="apply-required">*</span></label>
                  <input className="apply-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="홍길동" required />
                </div>
                <div>
                  <label className="apply-label">이메일 <span className="apply-required">*</span></label>
                  <input className="apply-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="your@email.com" required />
                </div>
                <div>
                  <label className="apply-label">연락처</label>
                  <input className="apply-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="010-0000-0000" />
                </div>
                <div>
                  <label className="apply-label">직함 / 직책</label>
                  <input className="apply-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="대표 / 교수 / 코치" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="apply-label">소속 기관 / 회사</label>
                  <input className="apply-input" value={form.company} onChange={e => set('company', e.target.value)} placeholder="소속 기관 또는 회사명" />
                </div>
              </div>
            </div>

            {/* 강의 분야 */}
            <div style={{ marginBottom: 32 }}>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontWeight: 800,
                fontSize: 18, letterSpacing: '-0.02em',
                marginBottom: 12, paddingBottom: 12,
                borderBottom: '1px solid var(--color-border)',
              }}>강의 분야 (복수 선택)</h2>
              <div className="apply-field-grid">
                {SPEAKER_FIELDS.map(f => (
                  <button
                    key={f.value}
                    type="button"
                    className={`apply-field-btn${form.fields.includes(f.value) ? ' active' : ''}`}
                    onClick={() => toggleField(f.value)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 소개 */}
            <div style={{ marginBottom: 32 }}>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontWeight: 800,
                fontSize: 18, letterSpacing: '-0.02em',
                marginBottom: 20, paddingBottom: 12,
                borderBottom: '1px solid var(--color-border)',
              }}>강사 소개</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label className="apply-label">한줄 소개 (80자 이내)</label>
                  <input className="apply-input" value={form.bio_short} onChange={e => set('bio_short', e.target.value)} maxLength={80} placeholder="강사님을 한 문장으로 소개해 주세요" />
                  <p style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 4 }}>{form.bio_short.length}/80</p>
                </div>
                <div>
                  <label className="apply-label">상세 소개</label>
                  <textarea className="apply-input" style={{ minHeight: 100, resize: 'vertical' }}
                    value={form.bio_full} onChange={e => set('bio_full', e.target.value)}
                    placeholder="강사님의 전문성, 경험, 강의 스타일 등을 자유롭게 작성해 주세요" />
                </div>
                <div>
                  <label className="apply-label">주요 강의 주제</label>
                  <textarea className="apply-input" style={{ minHeight: 80, resize: 'vertical' }}
                    value={form.lecture_topics} onChange={e => set('lecture_topics', e.target.value)}
                    placeholder="예) 리더십과 조직문화, MZ세대 소통법, 번아웃 극복..." />
                </div>
                <div>
                  <label className="apply-label">주요 경력</label>
                  <textarea className="apply-input" style={{ minHeight: 80, resize: 'vertical' }}
                    value={form.career} onChange={e => set('career', e.target.value)}
                    placeholder="주요 경력 사항을 입력해 주세요" />
                </div>
                <div>
                  <label className="apply-label">학력</label>
                  <input className="apply-input" value={form.education} onChange={e => set('education', e.target.value)} placeholder="최종 학력" />
                </div>
              </div>
            </div>

            {/* 미디어 & 강의료 */}
            <div style={{ marginBottom: 40 }}>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontWeight: 800,
                fontSize: 18, letterSpacing: '-0.02em',
                marginBottom: 20, paddingBottom: 12,
                borderBottom: '1px solid var(--color-border)',
              }}>미디어 & 강의료</h2>

              <div className="apply-form-grid">
                <div>
                  <label className="apply-label">유튜브 / 강의 영상 링크</label>
                  <input className="apply-input" value={form.youtube_url} onChange={e => set('youtube_url', e.target.value)} placeholder="https://youtube.com/..." />
                </div>
                <div>
                  <label className="apply-label">강의료 범위</label>
                  <select className="apply-input" style={{ appearance: 'auto' }}
                    value={form.fee_range} onChange={e => set('fee_range', e.target.value)}>
                    {FEE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* 오류 */}
            {errorMsg && (
              <div style={{
                padding: '12px 16px', marginBottom: 20,
                background: '#fff0f0', border: '1px solid #fca5a5',
                fontSize: 13, color: '#b91c1c',
              }}>
                {errorMsg}
              </div>
            )}

            {/* 제출 */}
            <button type="submit" className="apply-submit" disabled={status === 'loading'}>
              {status === 'loading' ? '신청 중...' : '강사 등록 신청하기 →'}
            </button>

            <p style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 16, lineHeight: 1.7 }}>
              제출하신 정보는 강사 등재 검토 목적으로만 사용되며,<br />
              담당자 검토 후 2~3 영업일 내 이메일로 연락드립니다.
            </p>
          </form>
        </section>
      </div>
    </>
  )
}
