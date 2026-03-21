'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
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
        border: selected ? '2px solid #2d3a25' : '1px solid #d0cdc6',
        background: selected ? '#eef1ea' : '#fff',
        cursor: disabled && !selected ? 'not-allowed' : 'pointer',
        opacity: disabled && !selected ? 0.45 : 1,
        transition: 'all 0.15s ease',
        textAlign: 'left', position: 'relative',
      }}
    >
      {selected && (
        <span style={{
          position: 'absolute', top: '10px', right: '12px',
          width: '18px', height: '18px', borderRadius: '50%',
          background: '#2d3a25',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '10px', color: '#fff',
        }}>✓</span>
      )}
      {icon && <span style={{ fontSize: '22px', lineHeight: 1 }}>{icon}</span>}
      <span style={{
        fontFamily: 'var(--font-body)', fontSize: '13px',
        fontWeight: selected ? 700 : 600,
        color: selected ? '#2d3a25' : 'var(--color-ink)',
        lineHeight: 1.4,
        transition: 'font-weight 0.15s',
      }}>
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
  const [navigating, setNavigating] = useState(false)

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
      // 결과 페이지로 — SSR 로딩 있으므로 navigating 상태 활성화
      setNavigating(true)
      const params = new URLSearchParams()
      // wizard id → 실제 DB fields 값(한글)으로 확장
      const dbFields = Array.from(new Set(
        selectedFields.flatMap((id) => WIZARD_FIELDS.find((f) => f.id === id)?.dbFields ?? [])
      ))
      if (dbFields.length) params.set('fields', dbFields.join(','))
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
        /* Step 1: 4열 (PC) / 2열 (모바일) */
        .select-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }
        /* Step 2/3: 유동 */
        .select-grid-fluid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 10px;
        }
        @media (max-width: 860px) {
          .select-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 600px) {
          .select-grid { grid-template-columns: repeat(2, 1fr); }
          .select-grid-fluid { grid-template-columns: 1fr 1fr; }
        }
        /* 카드 바로 아래 버튼 행 */
        .wizard-btn-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 28px;
        }
        /* 잘 모르겠어요 버튼 */
        .btn-skip-consult {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: var(--font-body);
          font-size: 12px; font-weight: 500;
          color: var(--color-subtle);
          text-decoration: none;
          padding: 10px 20px;
          border: 1px dashed var(--color-border);
          transition: color 0.15s, border-color 0.15s;
        }
        .btn-skip-consult:hover {
          color: var(--color-ink);
          border-color: var(--color-ink);
        }
        /* 버튼 스피너 */
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .btn-spinner {
          display: inline-block;
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        /* 결과 로딩 오버레이 */
        .matching-loading-overlay {
          position: fixed; inset: 0;
          background: rgba(247,243,238,0.88);
          backdrop-filter: blur(4px);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 20px; z-index: 100;
        }
        @keyframes pulse-dot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        .loading-dots {
          display: flex; gap: 8px;
        }
        .loading-dots span {
          width: 10px; height: 10px; border-radius: 50%;
          background: var(--color-green);
          animation: pulse-dot 1.2s ease-in-out infinite;
        }
        .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .loading-dots span:nth-child(3) { animation-delay: 0.4s; }
      `}</style>

      {/* ── 결과 로딩 오버레이 ── */}
      {navigating && (
        <div className="matching-loading-overlay">
          <div className="loading-dots">
            <span /><span /><span />
          </div>
          <p style={{
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: 'clamp(16px, 2.5vw, 22px)', letterSpacing: '-0.02em',
            color: 'var(--color-ink)',
          }}>
            조건에 맞는 강사를 찾고 있습니다…
          </p>
          <p style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
            잠시만 기다려주세요
          </p>
        </div>
      )}

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
          flex: 1, padding: 'clamp(28px, 4vw, 44px) var(--space-page) 48px',
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

            {/* Step 1: 목적 카드 14개 */}
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
              <div className="select-grid-fluid">
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
              <div className="select-grid-fluid">
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

            {/* ── 버튼 행: 카드 바로 아래, justify-content: space-between ── */}
            <div className="wizard-btn-row">
              {/* 왼쪽: step1 = 잘 모르겠어요 / step2~3 = 이전 */}
              {step === 1 ? (
                <Link href="/inquiry/lecture" className="btn-skip-consult">
                  잘 모르겠어요 →
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={goPrev}
                  style={{
                    fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 500,
                    color: 'var(--color-subtle)', background: 'none', border: 'none',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  ← 이전
                </button>
              )}

              {/* 오른쪽: 다음 / 강사 추천 */}
              <button
                type="button"
                onClick={goNext}
                disabled={!canNext || navigating}
                style={{
                  fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: '#fff',
                  background: canNext && !navigating ? '#2C6B5A' : '#DDD5C8',
                  border: 'none', padding: '12px 36px',
                  cursor: canNext && !navigating ? 'pointer' : 'not-allowed',
                  transition: 'background 0.2s',
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  pointerEvents: navigating ? 'none' : 'auto',
                  opacity: navigating ? 0.7 : 1,
                }}
              >
                {navigating && step === TOTAL_STEPS
                  ? <><span className="btn-spinner" />분석 중…</>
                  : step === TOTAL_STEPS ? '강사 추천 받기 →' : '다음 →'
                }
              </button>
            </div>
          </div>
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
