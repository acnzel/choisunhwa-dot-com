'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SPEAKER_FIELDS } from '@/constants'

type Step = 'form' | 'done'

const FEE_OPTIONS = [
  { value: '', label: '선택 안 함' },
  { value: 'under_500', label: '50만원 이하' },
  { value: '500_1000', label: '50~100만원' },
  { value: '1000_2000', label: '100~200만원' },
  { value: 'over_2000', label: '200만원 이상' },
]

export default function SpeakerApplyPage() {
  const [step, setStep] = useState<Step>('form')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [agreedPrivacy, setAgreedPrivacy] = useState(false)

  const [form, setForm] = useState({
    name: '', email: '', title: '', company: '',
    fields: [] as string[],
    bio_short: '', bio_full: '',
    lecture_topics: '', career: '', education: '',
    youtube_url: '', fee_range: '',
  })

  function setField(key: keyof typeof form, val: string) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function toggleField(f: string) {
    setForm(prev => ({
      ...prev,
      fields: prev.fields.includes(f)
        ? prev.fields.filter(x => x !== f)
        : prev.fields.length >= 3 ? prev.fields : [...prev.fields, f],
    }))
  }

  async function handleSubmit() {
    if (!agreedPrivacy) { setError('개인정보 수집 및 이용에 동의해주세요.'); return }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/speaker-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const j = await res.json()
        throw new Error(j.error || '제출 중 오류가 발생했습니다')
      }
      setStep('done')
    } catch (e) {
      setError(e instanceof Error ? e.message : '오류가 발생했습니다')
    } finally {
      setSaving(false)
    }
  }

  if (step === 'done') {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center', maxWidth: '480px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '28px', letterSpacing: '-0.02em', marginBottom: '12px', color: 'var(--color-ink)' }}>
            신청이 접수되었습니다
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--color-subtle)', lineHeight: 1.8, marginBottom: '32px' }}>
            검토 후 7일 이내로 연락드립니다.<br />
            최선화닷컴과 함께해 주셔서 감사합니다.
          </p>
          <Link href="/speakers" style={{
            display: 'inline-block', padding: '12px 28px',
            background: 'var(--color-green)', color: '#fff',
            borderRadius: '8px', fontSize: '14px', fontWeight: 600,
            textDecoration: 'none',
          }}>
            강사 라인업 보기 →
          </Link>
        </div>
      </div>
    )
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '11px 14px', fontSize: '14px',
    border: '1px solid #e5e7eb', borderRadius: '8px',
    background: '#fff', color: '#1a1a2e',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  }
  const lbl: React.CSSProperties = {
    display: 'block', fontSize: '12px', fontWeight: 600,
    color: '#374151', marginBottom: '6px', letterSpacing: '0.02em',
  }

  return (
    <main style={{ maxWidth: '640px', margin: '0 auto', padding: 'clamp(40px,6vw,80px) 20px' }}>
      {/* 헤더 */}
      <div style={{ marginBottom: '40px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-green)', marginBottom: '10px' }}>
          강사 등록 신청
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(26px,3vw,40px)', letterSpacing: '-0.03em', lineHeight: 1.1, color: 'var(--color-ink)', marginBottom: '12px' }}>
          최선화닷컴에<br />강사로 등록하세요
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-subtle)', lineHeight: 1.7 }}>
          신청서를 제출하시면 담당자가 검토 후 7일 이내 연락드립니다.
          승인되면 강사 라인업에 바로 노출됩니다.
        </p>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', marginBottom: '20px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '13px', color: '#dc2626' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* 기본 정보 */}
        <section>
          <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#6b7280', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '14px', paddingBottom: '8px', borderBottom: '1px solid #f3f4f6' }}>
            기본 정보
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={lbl}>이름 *</label>
              <input style={inp} placeholder="홍길동" value={form.name} onChange={e => setField('name', e.target.value)} />
            </div>
            <div>
              <label style={lbl}>직함 *</label>
              <input style={inp} placeholder="교수 / 대표 / 작가" value={form.title} onChange={e => setField('title', e.target.value)} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={lbl}>소속기관 *</label>
              <input style={inp} placeholder="현재 소속 회사/기관" value={form.company} onChange={e => setField('company', e.target.value)} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={lbl}>이메일 * (비공개, 관리자만 확인)</label>
              <input style={inp} type="email" placeholder="your@email.com" value={form.email} onChange={e => setField('email', e.target.value)} />
            </div>
          </div>
        </section>

        {/* 강연 분야 */}
        <section>
          <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#6b7280', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #f3f4f6' }}>
            강연 분야 * <span style={{ fontWeight: 400, color: '#9ca3af' }}>(최대 3개)</span>
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {SPEAKER_FIELDS.map(f => {
              const selected = form.fields.includes(f.value)
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => toggleField(f.value)}
                  style={{
                    padding: '6px 14px', fontSize: '12px', fontWeight: 600,
                    border: `1.5px solid ${selected ? 'var(--color-green)' : '#e5e7eb'}`,
                    borderRadius: '20px', cursor: 'pointer',
                    background: selected ? 'var(--color-green)' : '#fff',
                    color: selected ? '#fff' : '#374151',
                    transition: 'all 0.15s',
                  }}
                >
                  {f.label}
                </button>
              )
            })}
          </div>
        </section>

        {/* 강사 소개 */}
        <section>
          <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#6b7280', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '14px', paddingBottom: '8px', borderBottom: '1px solid #f3f4f6' }}>
            강사 소개
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={lbl}>한줄 소개 * <span style={{ fontWeight: 400, color: form.bio_short.length > 150 ? '#ef4444' : '#9ca3af' }}>({form.bio_short.length}/150자)</span></label>
              <textarea rows={2} style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }}
                placeholder="이 강사만이 줄 수 있는 가치를 한 문장으로"
                value={form.bio_short}
                onChange={e => setField('bio_short', e.target.value.slice(0, 150))}
              />
            </div>
            <div>
              <label style={lbl}>상세 소개 <span style={{ fontWeight: 400, color: '#9ca3af' }}>(선택)</span></label>
              <textarea rows={5} style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }}
                placeholder="강연 경력, 주요 성과, 강연 스타일 등을 자유롭게 작성해주세요"
                value={form.bio_full}
                onChange={e => setField('bio_full', e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* 강연 정보 */}
        <section>
          <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#6b7280', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '14px', paddingBottom: '8px', borderBottom: '1px solid #f3f4f6' }}>
            강연 정보 (선택)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={lbl}>대표 강연 주제</label>
              <textarea rows={3} style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }}
                placeholder="예) AI 시대의 리더십 / 세대를 이어주는 소통법 / 번아웃 예방과 회복"
                value={form.lecture_topics}
                onChange={e => setField('lecture_topics', e.target.value)}
              />
            </div>
            <div>
              <label style={lbl}>주요 경력</label>
              <textarea rows={3} style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }}
                placeholder="주요 경력 및 출강 기업을 작성해주세요"
                value={form.career}
                onChange={e => setField('career', e.target.value)}
              />
            </div>
            <div>
              <label style={lbl}>학력</label>
              <input style={inp} placeholder="최종 학력" value={form.education} onChange={e => setField('education', e.target.value)} />
            </div>
            <div>
              <label style={lbl}>유튜브 / SNS URL</label>
              <input style={inp} placeholder="https://youtube.com/@..." value={form.youtube_url} onChange={e => setField('youtube_url', e.target.value)} />
            </div>
            <div>
              <label style={lbl}>강연료 범위</label>
              <select style={{ ...inp, cursor: 'pointer' }} value={form.fee_range} onChange={e => setField('fee_range', e.target.value)}>
                {FEE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* 개인정보 동의 */}
        <section style={{ background: '#f9fafb', borderRadius: '10px', padding: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={agreedPrivacy}
              onChange={e => setAgreedPrivacy(e.target.checked)}
              style={{ width: '16px', height: '16px', marginTop: '2px', flexShrink: 0, cursor: 'pointer' }}
            />
            <span style={{ fontSize: '13px', color: '#374151', lineHeight: 1.7 }}>
              <strong>개인정보 수집 및 이용에 동의합니다.</strong><br />
              <span style={{ color: '#6b7280' }}>
                수집 항목: 이름, 이메일, 직함, 소속, 강연 정보<br />
                이용 목적: 강사 등록 심사 및 플랫폼 운영<br />
                보유 기간: 신청 완료 후 1년
              </span>
            </span>
          </label>
        </section>

        {/* 제출 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={saving}
          style={{
            width: '100%', padding: '16px', fontSize: '15px', fontWeight: 700,
            background: saving ? '#9ca3af' : 'var(--color-green)',
            color: '#fff', border: 'none', borderRadius: '10px',
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? '제출 중…' : '등록 신청하기 →'}
        </button>

        <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center' }}>
          신청 후 7일 이내 검토 결과를 이메일로 안내드립니다.
        </p>
      </div>
    </main>
  )
}
