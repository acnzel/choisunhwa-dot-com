'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Lecture, Speaker, LectureDuration } from '@/types'
import { SPEAKER_FIELDS, LECTURE_DURATIONS } from '@/constants'

interface Props {
  lecture: Lecture & { speaker: Pick<Speaker, 'name'> | null }
  speakers: Pick<Speaker, 'id' | 'name'>[]
}

export default function LectureEditForm({ lecture, speakers }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    speaker_id: lecture.speaker_id,
    title: lecture.title,
    fields: lecture.fields ?? [],
    duration: lecture.duration,
    target: lecture.target,
    summary: lecture.summary,
    goals: (lecture.goals ?? []).join('\n'),
    effects: (lecture.effects ?? []).join('\n'),
    thumbnail_url: lecture.thumbnail_url ?? '',
    is_visible: lecture.is_visible,
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
      thumbnail_url: form.thumbnail_url.trim() || null,
      is_visible: form.is_visible,
    }

    try {
      const res = await fetch(`/api/admin/lectures/${lecture.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? '저장 실패')
        return
      }

      router.push(`/mong-bab/lectures/${lecture.id}?saved=1`)
      router.refresh()
    } catch {
      setError('서버 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`'${lecture.title}' 강연을 삭제하시겠습니까?`)) return
    setDeleting(true)

    try {
      const res = await fetch(`/api/admin/lectures/${lecture.id}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/mong-bab/lectures')
      } else {
        const data = await res.json()
        setError(data.error ?? '삭제 실패')
        setDeleting(false)
      }
    } catch {
      setError('서버 오류가 발생했습니다')
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 기본 정보 */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="text-base font-semibold text-[#1a1a2e]">기본 정보</h2>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">강사 *</label>
          <select
            value={form.speaker_id}
            onChange={(e) => setForm((p) => ({ ...p, speaker_id: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1a1a2e] bg-white"
          >
            {speakers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">강연명 *</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1a1a2e]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">강연 시간</label>
            <select
              value={form.duration}
              onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value as LectureDuration }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1a1a2e] bg-white"
            >
              {LECTURE_DURATIONS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end pb-0.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, is_visible: !p.is_visible }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_visible ? 'bg-green-500' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.is_visible ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className="text-sm font-medium text-gray-700">
                {form.is_visible ? '🟢 공개' : '⚫️ 비공개'}
              </span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">썸네일 이미지 URL</label>
          <input
            type="url"
            value={form.thumbnail_url}
            onChange={(e) => setForm((p) => ({ ...p, thumbnail_url: e.target.value }))}
            placeholder="https://... (Supabase Storage URL)"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1a1a2e]"
          />
        </div>
      </section>

      {/* 분야 */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-[#1a1a2e] mb-3">강연 분야</h2>
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
      </section>

      {/* 내용 */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="text-base font-semibold text-[#1a1a2e]">강연 내용</h2>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">강연 대상</label>
          <input
            type="text"
            value={form.target}
            onChange={(e) => setForm((p) => ({ ...p, target: e.target.value }))}
            placeholder="예: 전 직원, 리더급, 신입사원"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1a1a2e]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">강연 요약</label>
          <textarea
            value={form.summary}
            onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))}
            rows={4}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1a1a2e] resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">학습 목표 (줄바꿈으로 구분)</label>
          <textarea
            value={form.goals}
            onChange={(e) => setForm((p) => ({ ...p, goals: e.target.value }))}
            rows={3}
            placeholder="목표 1&#10;목표 2"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1a1a2e] resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">기대 효과 (줄바꿈으로 구분)</label>
          <textarea
            value={form.effects}
            onChange={(e) => setForm((p) => ({ ...p, effects: e.target.value }))}
            rows={3}
            placeholder="효과 1&#10;효과 2"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1a1a2e] resize-none"
          />
        </div>
      </section>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-xl p-3">{error}</p>
      )}

      <div className="flex items-center gap-3 pb-8">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 bg-[#1a1a2e] text-white text-sm font-semibold rounded-xl hover:bg-[#16213e] disabled:opacity-50 transition-colors"
        >
          {loading ? '저장 중...' : '저장하기'}
        </button>
        <Link
          href="/mong-bab/lectures"
          className="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
        >
          취소
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="px-4 py-2.5 border border-red-200 text-red-500 text-sm font-medium rounded-xl hover:bg-red-50 disabled:opacity-50 transition-colors"
        >
          {deleting ? '삭제 중...' : '삭제'}
        </button>
      </div>
    </form>
  )
}
