'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { WIZARD_FIELDS, TOPICS_BY_FIELD, WIZARD_TARGETS, type WizardFieldId } from '@/constants/matching'

const TOTAL_STEPS = 3

// ── 선택 카드 컴포넌트 ──────────────────────────────────
function SelectCard({
  icon, label, selected, onClick, disabled,
}: {
  icon?: string; label: string; selected: boolean; onClick: () => void; disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
        gap: '8px', padding: '16px 20px',
        border: selected ? '2px solid var(--color-green)' : '1px solid var(--color-border)',
        background: selected ? 'rgba(43,66,56,0.06)' : 'var(--color-bg)',
        cursor: disabled && !selected ? 'not-allowed' : 'pointer',
        opacity: disabled && !selected ? 0.45 : 1,
        transition: 'border 0.15s, background 0.15s',
        textAlign: 'left', position: 'relative',
      }}
    >
      {selected && (
        <span style={{
          position: 'absolute', top: '10px', right: '12px',
          width: '18px', height: '18px', borderRadius: '50%',
          background: 'var(--color-green)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '10px', color: '#fff',
        }}>✓</span>
      )}
      {icon && <span style={{ fontSize: '22px', lineHeight: 1 }}>{icon}</span>}
      <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--color-ink)', lineHeight: 1.4 }}>
        {label}
      </span>
    </button>
  )
}

// ── Wizard 본체 ──────────────────────────────────────────
function WizardContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const step = Math.min(Math.max(parseInt(searchParams.get('step') ?? '1', 10), 1), TOTAL_STEPS)

  const [selectedFields, setSelectedFields] = useState<WizardFieldId[]>([])
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [selectedTargets, setSelectedTargets] = useState<string[]>([])

  // step이 바뀔 때 다음 단계 선택값 초기화
  const prevStep = step

  // 현재 step의 동적 주제 목록 (Step 1 결과 기반)
  const availableTopics: string[] = Array.from(
    new Set(selectedFields.flatMap((f) => TOPICS_BY_FIELD[f] ?? []))
  )
  // 기타만 선택 또는 아무것도 안 선택했을 때 공통 옵션 추가
  if (availableTopics.length === 0) {
    availableTopics.push('어떤 주제든 괜찮아요 (전체 매칭)')
  }

  function goNext() {
    if (step < TOTAL_STEPS) {
      router.push(`/matching?step=${step + 1}`)
    } else {
      // 결과 페이지로
      const params = new URLSearchParams()
      if (selectedFields.length) params.set('fields', selectedFields.join(','))
      if (selectedTopics.length) params.set('topics', selectedTopics.join(','))
      if (selectedTargets.length) params.set('targets', selectedTargets.join(','))
      router.push(`/matching/result?${params.toString()}`)
    }
  }

  function goPrev() {
    if (step > 1) router.push(`/matching?step=${step - 1}`)
  }

  function toggleField(id: WizardFieldId) {
    setSelectedFields((prev) => {
      if (prev.includes(id)) return prev.filter((f) => f !== id)
      if (prev.length >= 2) return prev  // 최대 2개
      return [...prev, id]
    })
    setSelectedTopics([])  // 분야 바뀌면 주제 초기화
  }

  function toggleTopic(t: string) {
    setSelectedTopics((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : prev.length >= 2 ? prev : [...prev, t]
    )
  }

  function toggleTarget(id: string) {
    setSelectedTargets((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  // 다음 버튼 활성화 조건
  const canNext =
    (step === 1 && selectedFields.length > 0) ||
    (step === 2 && selectedTopics.length > 0) ||
    (step === 3 && selectedTargets.length > 0)

  const stepLabels = ['강연 분야', '강연 주제', '강연 대상']
  const stepQuestions = [
    '어떤 분야의 강연이 필요하신가요?',
    '이번 강연에서 가장 중요한 것은 무엇인가요?',
    '강연을 듣게 될 분들은 누구인가요?',
  ]

  return (
    <>
      <style>{`
        .wizard-slide {
          animation: wizardSlideIn 0.25s ease-out;
        }
        @keyframes wizardSlideIn {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .select-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 12px;
        }
        @media (max-width: 480px) {
          .select-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>

      <div style={{
        minHeight: '100vh', paddingTop: 'var(--nav-height)',
        background: 'var(--color-bg)',
        display: 'flex', flexDirection: 'column',
      }}>

        {/* ── 스텝 인디케이터 ── */}
        <div style={{
          borderBottom: '1px solid var(--color-border)',
          padding: '20px var(--space-page)',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => {
            const n = i + 1
            const done = n < step
            const active = n === step
            return (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 700,
                  background: done ? 'var(--color-green)' : active ? 'var(--color-ink)' : 'var(--color-surface)',
                  color: done || active ? 'var(--color-bg)' : 'var(--color-muted)',
                  border: done || active ? 'none' : '1px solid var(--color-border)',
                  transition: 'background 0.2s',
                  flexShrink: 0,
                }}>
                  {done ? '✓' : n}
                </div>
                <span style={{ fontSize: '11px', fontWeight: active ? 600 : 400, color: active ? 'var(--color-ink)' : 'var(--color-muted)' }}>
                  {stepLabels[i]}
                </span>
                {n < TOTAL_STEPS && (
                  <span style={{ fontSize: '12px', color: 'var(--color-border)', margin: '0 4px' }}>→</span>
                )}
              </div>
            )
          })}
          <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--color-muted)' }}>
            {step}/{TOTAL_STEPS}
          </span>
        </div>

        {/* ── 메인 콘텐츠 ── */}
        <div style={{
          flex: 1, padding: 'clamp(32px, 5vw, 56px) var(--space-page)',
          maxWidth: '760px', width: '100%', margin: '0 auto',
        }}>
          <div className="wizard-slide" key={step}>
            <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>
              STEP {step}
            </p>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 900,
              fontSize: 'clamp(22px, 3.5vw, 36px)', letterSpacing: '-0.03em',
              color: 'var(--color-ink)', marginBottom: '8px', lineHeight: 1.2,
            }}>
              {stepQuestions[step - 1]}
            </h1>
            {step < 3 && (
              <p style={{ fontSize: '12px', color: 'var(--color-muted)', marginBottom: '32px' }}>최대 2개 선택</p>
            )}
            {step === 3 && (
              <p style={{ fontSize: '12px', color: 'var(--color-muted)', marginBottom: '32px' }}>복수 선택 가능</p>
            )}

            {/* Step 1: 분야 선택 */}
            {step === 1 && (
              <div className="select-grid">
                {WIZARD_FIELDS.map((f) => (
                  <SelectCard
                    key={f.id}
                    icon={f.icon}
                    label={f.label}
                    selected={selectedFields.includes(f.id)}
                    disabled={selectedFields.length >= 2 && !selectedFields.includes(f.id)}
                    onClick={() => toggleField(f.id)}
                  />
                ))}
              </div>
            )}

            {/* Step 2: 주제 선택 (Step 1 기반 동적) */}
            {step === 2 && (
              <div className="select-grid">
                {availableTopics.map((t) => (
                  <SelectCard
                    key={t}
                    label={t}
                    selected={selectedTopics.includes(t)}
                    disabled={selectedTopics.length >= 2 && !selectedTopics.includes(t)}
                    onClick={() => toggleTopic(t)}
                  />
                ))}
              </div>
            )}

            {/* Step 3: 대상 선택 */}
            {step === 3 && (
              <div className="select-grid">
                {WIZARD_TARGETS.map((t) => (
                  <SelectCard
                    key={t.id}
                    label={t.label}
                    selected={selectedTargets.includes(t.id)}
                    onClick={() => toggleTarget(t.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── 하단 버튼 ── */}
        <div style={{
          borderTop: '1px solid var(--color-border)',
          padding: '20px var(--space-page)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'var(--color-bg)',
          position: 'sticky', bottom: 0,
        }}>
          {step > 1 ? (
            <button
              type="button"
              onClick={goPrev}
              style={{
                fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 500,
                color: 'var(--color-subtle)', background: 'none', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              ← 이전
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={goNext}
            disabled={!canNext}
            style={{
              fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700,
              letterSpacing: '0.06em',
              color: 'var(--color-bg)',
              background: canNext ? 'var(--color-green)' : 'var(--color-border)',
              border: 'none', padding: '12px 28px',
              cursor: canNext ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s',
            }}
          >
            {step === TOTAL_STEPS ? '강사 추천 받기 →' : '다음 →'}
          </button>
        </div>
      </div>
    </>
  )
}

export default function MatchingPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', paddingTop: 'var(--nav-height)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'var(--color-muted)', fontSize: '13px' }}>불러오는 중...</span>
      </div>
    }>
      <WizardContent />
    </Suspense>
  )
}
