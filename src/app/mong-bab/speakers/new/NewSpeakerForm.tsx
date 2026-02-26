'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { upsertSpeaker } from '@/app/actions/admin'
import { SPEAKER_FIELDS, FEE_RANGES } from '@/constants'

type Career = { year: string; content: string }
type LectureHistory = { org_name: string }

const initialState = { error: '' }

export default function NewSpeakerForm() {
  const [careers, setCareers] = useState<Career[]>([])
  const [histories, setHistories] = useState<LectureHistory[]>([])
  const [isVisible, setIsVisible] = useState(false)

  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      formData.set('careers_json', JSON.stringify(careers))
      formData.set('lecture_histories_json', JSON.stringify(histories))
      formData.set('is_visible', String(isVisible))
      try {
        await upsertSpeaker(formData)
        return { error: '' }
      } catch (e) {
        return { error: e instanceof Error ? e.message : '저장 실패' }
      }
    },
    initialState
  )

  return (
    <form action={formAction} className="space-y-8">
      {/* 기본 정보 */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="text-base font-semibold text-[#1a1a2e]">기본 정보</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">이름 *</label>
            <input type="text" name="name" required autoFocus
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a1a2e]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">직함</label>
            <input type="text" name="title" placeholder="예: 연세대학교 심리학과 교수"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a1a2e]" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">소속</label>
            <input type="text" name="company" placeholder="예: 연세대학교"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a1a2e]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">강연료 범위</label>
            <select name="fee_range" defaultValue=""
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a1a2e] bg-white">
              <option value="">선택 안함</option>
              {FEE_RANGES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">프로필 이미지 URL</label>
          <input type="url" name="photo_url" placeholder="https://... (Supabase Storage URL)"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a1a2e]" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">노출 순서</label>
            <input type="number" name="sort_order" defaultValue={0} min={0}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a1a2e]" />
          </div>
          <div className="flex items-end pb-0.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <button type="button" onClick={() => setIsVisible(!isVisible)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isVisible ? 'bg-green-500' : 'bg-gray-200'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isVisible ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className="text-sm font-medium text-gray-700">{isVisible ? '🟢 공개' : '⚫️ 비공개'}</span>
            </label>
          </div>
        </div>
      </section>

      {/* 분야 */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-[#1a1a2e] mb-3">강연 분야</h2>
        <div className="flex flex-wrap gap-2">
          {SPEAKER_FIELDS.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" name="fields" value={value} className="accent-[#1a1a2e]" />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* 소개 */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="text-base font-semibold text-[#1a1a2e]">소개</h2>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">한 줄 소개 (최대 100자)</label>
          <input type="text" name="bio_short" maxLength={100}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a1a2e]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">상세 소개</label>
          <textarea name="bio_full" rows={6}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a1a2e] resize-none" />
        </div>
      </section>

      {/* 약력 */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-[#1a1a2e]">약력</h2>
          <button type="button" onClick={() => setCareers([...careers, { year: '', content: '' }])}
            className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
            + 추가
          </button>
        </div>
        <div className="space-y-2">
          {careers.map((c, i) => (
            <div key={i} className="flex gap-2">
              <input type="text" placeholder="연도" value={c.year}
                onChange={(e) => setCareers(careers.map((x, idx) => idx === i ? { ...x, year: e.target.value } : x))}
                className="w-20 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a1a2e]" />
              <input type="text" placeholder="내용" value={c.content}
                onChange={(e) => setCareers(careers.map((x, idx) => idx === i ? { ...x, content: e.target.value } : x))}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a1a2e]" />
              <button type="button" onClick={() => setCareers(careers.filter((_, idx) => idx !== i))}
                className="text-gray-300 hover:text-red-400 px-1">✕</button>
            </div>
          ))}
          {careers.length === 0 && <p className="text-xs text-gray-400 text-center py-2">+ 추가로 약력을 입력하세요.</p>}
        </div>
      </section>

      {/* 출강 이력 */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-[#1a1a2e]">주요 출강 기업/기관</h2>
          <button type="button" onClick={() => setHistories([...histories, { org_name: '' }])}
            className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
            + 추가
          </button>
        </div>
        <div className="space-y-2">
          {histories.map((h, i) => (
            <div key={i} className="flex gap-2">
              <input type="text" placeholder="기관/기업명" value={h.org_name}
                onChange={(e) => setHistories(histories.map((x, idx) => idx === i ? { ...x, org_name: e.target.value } : x))}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a1a2e]" />
              <button type="button" onClick={() => setHistories(histories.filter((_, idx) => idx !== i))}
                className="text-gray-300 hover:text-red-400 px-1">✕</button>
            </div>
          ))}
        </div>
      </section>

      {/* 미디어 */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="text-base font-semibold text-[#1a1a2e]">미디어 & 언론</h2>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">유튜브/영상 링크 (줄바꿈으로 구분)</label>
          <textarea name="media_links" rows={3} placeholder="https://youtube.com/..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a1a2e] resize-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">뉴스/언론 링크 (줄바꿈으로 구분)</label>
          <textarea name="news_links" rows={2} placeholder="https://..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a1a2e] resize-none" />
        </div>
      </section>

      {state.error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-xl p-3">{state.error}</p>
      )}

      <div className="flex gap-3 pb-8">
        <button type="submit" disabled={pending}
          className="flex-1 py-2.5 bg-[#1a1a2e] text-white text-sm font-semibold rounded-xl hover:bg-[#16213e] disabled:opacity-50 transition-colors">
          {pending ? '저장 중...' : '강사 등록하기'}
        </button>
        <Link href="/mong-bab/speakers"
          className="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
          취소
        </Link>
      </div>
    </form>
  )
}
