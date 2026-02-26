'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Speaker } from '@/types'
import { SPEAKER_FIELDS, LECTURE_DURATIONS } from '@/constants'

interface Props {
  speakers: Pick<Speaker, 'id' | 'name'>[]
}

export default function NewLectureForm({ speakers }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    speaker_id: '',
    title: '',
    fields: [] as string[],
    duration: '2h',
    target: '',
    summary: '',
    goals: '',
    effects: '',
    is_visible: false,
  })

  function toggleField(value: string) {
    setForm((prev) => ({
      ...prev,
      fields: prev.fields.includes(value)
        ? prev.fields.filter((f) => f !== value)
        : [...prev.fields, value],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.speaker_id) { setError('강사를 선택해주세요'); return }
    if (!form.title.trim()) { setError('강연명을 입력해주세요'); return }

    setLoading(true)
    setError(null)

    const payload = {
      speaker_id: form.speaker_id,
      title: form.title.trim(),
      fields: form.fields,
      duration: form.duration,
      target: form.target.trim(),
      summary: form.summary.trim(),
      goals: form.goals.split('\n').map((g) => g.trim()).filter(Boolean),
      effects: form.effects.split('\n').map((e) => e.trim()).filter(Boolean),
      is_visible: form.is_visible,
    }

    try {
      const res = await fetch('/api/admin/lectures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? '등록 실패')
        return
      }

      router.push('/mong-bab/lectures')
      router.refresh()
    } catch {
      setError('서버 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl p-6 border border-gray-100">
      {/* 강사 선택 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">강사 *</label>
        <select
          value={form.speaker_id}
          onChange={(e) => setForm((p) => ({ ...p, speaker_id: e.target.value }))}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
        >
          <option value="">강사를 선택하세요</option>
          {speakers.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* 강연명 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">강연명 *</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          placeholder="예: 인간의 행복은 어디서 오는가"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
        />
      </div>

      {/* 강연 분야 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">강연 분야</label>
        <div className="flex flex-wrap gap-2">
          {SPEAKER_FIELDS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => toggleField(f.value)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                form.fields.includes(f.value)
                  ? 'bg-[#1a1a2e] text-white border-[#1a1a2e]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 강연 시간 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">강연 시간</label>
        <select
          value={form.duration}
          onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
        >
          {LECTURE_DURATIONS.map((d) => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>
      </div>

      {/* 대상 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">강연 대상</label>
        <input
          type="text"
          value={form.target}
          onChange={(e) => setForm((p) => ({ ...p, target: e.target.value }))}
          placeholder="예: 전 직원, 리더급, 신입사원"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
        />
      </div>

      {/* 강연 요약 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">강연 요약</label>
        <textarea
          value={form.summary}
          onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))}
          rows={3}
          placeholder="강연 내용을 간략히 설명해주세요"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20 resize-none"
        />
      </div>

      {/* 학습 목표 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">학습 목표 (줄바꿈으로 구분)</label>
        <textarea
          value={form.goals}
          onChange={(e) => setForm((p) => ({ ...p, goals: e.target.value }))}
          rows={3}
          placeholder="목표 1&#10;목표 2&#10;목표 3"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20 resize-none"
        />
      </div>

      {/* 기대 효과 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">기대 효과 (줄바꿈으로 구분)</label>
        <textarea
          value={form.effects}
          onChange={(e) => setForm((p) => ({ ...p, effects: e.target.value }))}
          rows={3}
          placeholder="효과 1&#10;효과 2&#10;효과 3"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20 resize-none"
        />
      </div>

      {/* 공개 여부 */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setForm((p) => ({ ...p, is_visible: !p.is_visible }))}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            form.is_visible ? 'bg-[#1a1a2e]' : 'bg-gray-200'
          }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            form.is_visible ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
        <span className="text-sm text-gray-600">{form.is_visible ? '공개' : '비공개'}</span>
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-[#1a1a2e] text-white text-sm font-medium rounded-xl hover:bg-[#16213e] transition-colors disabled:opacity-50"
        >
          {loading ? '등록 중...' : '강연 등록'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
        >
          취소
        </button>
      </div>
    </form>
  )
}
