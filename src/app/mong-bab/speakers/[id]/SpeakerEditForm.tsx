'use client'

import { useActionState, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { upsertSpeaker, deleteSpeaker } from '@/app/actions/admin'
import type { Speaker } from '@/types'
import { SPEAKER_FIELDS, FEE_RANGES } from '@/constants'
import { useRouter } from 'next/navigation'

interface Props {
  speaker: Speaker
}

type Career = { year: string; content: string }
type LectureHistory = { org_name: string; logo_url?: string }

const initialState = { error: '' }

export default function SpeakerEditForm({ speaker }: Props) {
  const router = useRouter()
  const [careers, setCareers] = useState<Career[]>(
    (speaker.careers as Career[]) ?? []
  )
  const [histories, setHistories] = useState<LectureHistory[]>(
    (speaker.lecture_histories as LectureHistory[]) ?? []
  )
  const [isVisible, setIsVisible] = useState(speaker.is_visible)
  const [deleting, setDeleting] = useState(false)
  const [photoUrl, setPhotoUrl] = useState(speaker.photo_url ?? '')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError(null)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('bucket', 'speakers')
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) { setUploadError(json.error ?? '업로드 실패'); return }
      setPhotoUrl(json.data.url)
    } catch {
      setUploadError('업로드 중 오류 발생')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

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

  async function handleDelete() {
    if (!confirm(`'${speaker.name}' 강사를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) return
    setDeleting(true)
    const result = await deleteSpeaker(speaker.id)
    if (result.ok) {
      router.push('/mong-bab/speakers')
    } else {
      alert('삭제 실패: ' + result.error)
      setDeleting(false)
    }
  }

  // Career 동적 추가/삭제
  function addCareer() { setCareers([...careers, { year: '', content: '' }]) }
  function removeCareer(i: number) { setCareers(careers.filter((_, idx) => idx !== i)) }
  function updateCareer(i: number, field: keyof Career, value: string) {
    setCareers(careers.map((c, idx) => idx === i ? { ...c, [field]: value } : c))
  }

  // History 동적 추가/삭제
  function addHistory() { setHistories([...histories, { org_name: '' }]) }
  function removeHistory(i: number) { setHistories(histories.filter((_, idx) => idx !== i)) }
  function updateHistory(i: number, field: keyof LectureHistory, value: string) {
    setHistories(histories.map((h, idx) => idx === i ? { ...h, [field]: value } : h))
  }

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="id" value={speaker.id} />
      <input type="hidden" name="is_visible" value={String(isVisible)} />

      {/* 기본 정보 */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="text-base font-semibold text-[#1a1a2e]">기본 정보</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">이름 *</label>
            <input
              type="text"
              name="name"
              required
              defaultValue={speaker.name}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a1a2e]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">직함</label>
            <input
              type="text"
              name="title"
              defaultValue={speaker.title}
              placeholder="예: 연세대학교 심리학과 교수"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a1a2e]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">소속</label>
            <input
              type="text"
              name="company"
              defaultValue={speaker.company}
              placeholder="예: 연세대학교"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a1a2e]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">강연료 범위</label>
            <select
              name="fee_range"
              defaultValue={speaker.fee_range ?? ''}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a1a2e] bg-white"
            >
              <option value="">선택 안함</option>
              {FEE_RANGES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">프로필 이미지</label>
          <div className="flex gap-3 items-start">
            {/* 미리보기 */}
            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
              {photoUrl ? (
                <Image src={photoUrl} alt={speaker.name} fill className="object-cover" sizes="64px" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-xl font-bold">
                  {speaker.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              {/* 파일 업로드 버튼 */}
              <label className={`inline-flex items-center gap-2 px-3 py-2 text-sm border rounded-lg cursor-pointer transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                {uploading ? '업로드 중...' : '이미지 업로드'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={uploading}
                  onChange={handlePhotoUpload}
                />
              </label>
              {/* URL 직접 입력 (fallback) */}
              <input
                type="hidden"
                name="photo_url"
                value={photoUrl}
              />
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="또는 URL 직접 입력..."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a1a2e]"
              />
              {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
              <p className="text-xs text-gray-400">JPG, PNG, WebP / 최대 2MB</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">노출 순서 (낮을수록 앞)</label>
            <input
              type="number"
              name="sort_order"
              defaultValue={speaker.sort_order}
              min={0}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a1a2e]"
            />
          </div>
          <div className="flex items-end pb-0.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <button
                type="button"
                onClick={() => setIsVisible(!isVisible)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isVisible ? 'bg-green-500' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isVisible ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className="text-sm font-medium text-gray-700">
                {isVisible ? '🟢 공개' : '⚫️ 비공개'}
              </span>
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
              <input
                type="checkbox"
                name="fields"
                value={value}
                defaultChecked={speaker.fields.includes(value)}
                className="accent-[#1a1a2e]"
              />
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
          <input
            type="text"
            name="bio_short"
            defaultValue={speaker.bio_short}
            maxLength={100}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a1a2e]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">상세 소개</label>
          <textarea
            name="bio_full"
            defaultValue={speaker.bio_full}
            rows={6}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a1a2e] resize-none"
          />
        </div>
      </section>

      {/* 약력 */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-[#1a1a2e]">약력</h2>
          <button
            type="button"
            onClick={addCareer}
            className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            + 추가
          </button>
        </div>
        <div className="space-y-2">
          {careers.map((c, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                placeholder="연도"
                value={c.year}
                onChange={(e) => updateCareer(i, 'year', e.target.value)}
                className="w-20 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a1a2e]"
              />
              <input
                type="text"
                placeholder="내용"
                value={c.content}
                onChange={(e) => updateCareer(i, 'content', e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a1a2e]"
              />
              <button
                type="button"
                onClick={() => removeCareer(i)}
                className="text-gray-300 hover:text-red-400 transition-colors px-1"
              >
                ✕
              </button>
            </div>
          ))}
          {careers.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-3">약력이 없습니다. + 추가를 눌러 추가하세요.</p>
          )}
        </div>
      </section>

      {/* 강연 이력 */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-[#1a1a2e]">주요 강연 이력</h2>
          <button
            type="button"
            onClick={addHistory}
            className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            + 추가
          </button>
        </div>
        <div className="space-y-2">
          {histories.map((h, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                placeholder="기관/기업명"
                value={h.org_name}
                onChange={(e) => updateHistory(i, 'org_name', e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a1a2e]"
              />
              <button
                type="button"
                onClick={() => removeHistory(i)}
                className="text-gray-300 hover:text-red-400 transition-colors px-1"
              >
                ✕
              </button>
            </div>
          ))}
          {histories.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-3">강연 이력이 없습니다.</p>
          )}
        </div>
      </section>

      {/* 미디어 */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="text-base font-semibold text-[#1a1a2e]">미디어 & 언론</h2>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">유튜브/영상 링크 (한 줄에 하나씩)</label>
          <textarea
            name="media_links"
            defaultValue={speaker.media_links.join('\n')}
            rows={3}
            placeholder="https://youtube.com/..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a1a2e] resize-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">뉴스/언론 링크 (한 줄에 하나씩)</label>
          <textarea
            name="news_links"
            defaultValue={speaker.news_links.join('\n')}
            rows={3}
            placeholder="https://news.com/..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a1a2e] resize-none"
          />
        </div>
      </section>

      {state.error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-xl p-3">{state.error}</p>
      )}

      {/* 버튼 */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 py-2.5 bg-[#1a1a2e] text-white text-sm font-semibold rounded-xl hover:bg-[#16213e] disabled:opacity-50 transition-colors"
        >
          {pending ? '저장 중...' : '저장하기'}
        </button>
        <Link
          href="/mong-bab/speakers"
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

      <div className="pb-8">
        <Link
          href={`/speakers/${speaker.id}`}
          target="_blank"
          className="text-xs text-gray-400 hover:text-[#1a1a2e] transition-colors"
        >
          → 공개 페이지에서 미리보기 ↗
        </Link>
      </div>
    </form>
  )
}
