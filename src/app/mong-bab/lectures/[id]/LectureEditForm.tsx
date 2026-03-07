'use client'

import { useActionState, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { Lecture, Speaker, LectureDuration } from '@/types'
import { SPEAKER_FIELDS, LECTURE_DURATIONS } from '@/constants'
import { upsertLecture, deleteLecture } from '@/app/actions/admin'

interface Props {
  lecture: Lecture & { speaker: Pick<Speaker, 'name'> | null }
  speakers: Pick<Speaker, 'id' | 'name'>[]
}

type ProgramItem = { time: string; content: string }
const initialState = { error: '' }

const ARTICLE_TYPES = [
  { value: 'lecture',      label: '강연 커리큘럼' },
  { value: 'editor_pick',  label: '에디터 픽' },
  { value: 'field_report', label: '현장 리포트' },
  { value: 'behind',       label: '비하인드' },
  { value: 'monthly',      label: '이달의 강연' },
]

export default function LectureEditForm({ lecture, speakers }: Props) {
  const router = useRouter()

  const contentJson = (lecture.content_json ?? {}) as Record<string, unknown>
  const [articleType, setArticleType] = useState<string>(
    (contentJson.article_type as string) ?? 'lecture'
  )
  const [body, setBody] = useState<string>((contentJson.body as string) ?? '')

  const [isVisible, setIsVisible] = useState(lecture.is_visible)
  const [fields, setFields]   = useState<string[]>(lecture.fields ?? [])
  const [goals, setGoals]     = useState((lecture.goals ?? []).join('\n'))
  const [effects, setEffects] = useState((lecture.effects ?? []).join('\n'))
  const [program, setProgram] = useState<ProgramItem[]>(
    (lecture.program as ProgramItem[]) ?? []
  )
  const [thumbnailUrl, setThumbnailUrl] = useState(lecture.thumbnail_url ?? '')
  const [uploading, setUploading]       = useState(false)
  const [uploadError, setUploadError]   = useState<string | null>(null)
  const [deleting, setDeleting]         = useState(false)

  // ── 썸네일 업로드 ──────────────────────────────────────
  async function handleThumbnailUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError(null)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('bucket', 'lectures')
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) { setUploadError(json.error ?? '업로드 실패'); return }
      setThumbnailUrl(json.data.url)
    } catch {
      setUploadError('업로드 중 오류 발생')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  // ── 커리큘럼 편집 ──────────────────────────────────────
  function addProgram()  { setProgram(p => [...p, { time: '', content: '' }]) }
  function removeProgram(i: number) { setProgram(p => p.filter((_, idx) => idx !== i)) }
  function updateProgram(i: number, key: keyof ProgramItem, value: string) {
    setProgram(p => p.map((item, idx) => idx === i ? { ...item, [key]: value } : item))
  }

  // ── 서버 액션 ──────────────────────────────────────────
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      formData.set('is_visible', String(isVisible))
      fields.forEach(f => formData.append('fields', f))
      formData.set('goals', goals)
      formData.set('effects', effects)
      formData.set('program_json', JSON.stringify(program))
      formData.set('thumbnail_url', thumbnailUrl)
      try {
        await upsertLecture(formData)
        return { error: '' }
      } catch (e) {
        if (e !== null && typeof e === 'object' && 'digest' in (e as object)) throw e
        return { error: e instanceof Error ? e.message : '저장 실패' }
      }
    },
    initialState
  )

  // ── 삭제 ──────────────────────────────────────────────
  async function handleDelete() {
    if (!confirm(`'${lecture.title}' 강연을 삭제하시겠습니까?`)) return
    setDeleting(true)
    const result = await deleteLecture(lecture.id)
    if (result.ok) {
      router.push('/mong-bab/lectures')
    } else {
      alert(result.error ?? '삭제 실패')
      setDeleting(false)
    }
  }

  function toggleField(value: string) {
    setFields(prev =>
      prev.includes(value) ? prev.filter(f => f !== value) : [...prev, value]
    )
  }

  const isLecture = articleType === 'lecture'

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="id" value={lecture.id} />
      <input type="hidden" name="article_type" value={articleType} />
      <input type="hidden" name="body" value={body} />

      {/* ── 기본 정보 ── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="text-base font-semibold text-[#1a1a2e]">기본 정보</h2>

        {/* 콘텐츠 타입 */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">콘텐츠 타입 *</label>
          <select
            value={articleType}
            onChange={(e) => setArticleType(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1a1a2e] bg-white"
          >
            {ARTICLE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* 강사 선택 (강연 커리큘럼만) */}
        {isLecture && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">강사 *</label>
            <select
              name="speaker_id"
              defaultValue={lecture.speaker_id}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1a1a2e] bg-white"
            >
              {speakers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* 강연명 */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">강연명 *</label>
          <input
            type="text"
            name="title"
            required
            defaultValue={lecture.title}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1a1a2e]"
          />
        </div>

        {/* 시간 + 공개 토글 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">강연 시간</label>
            <select
              name="duration"
              defaultValue={lecture.duration}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1a1a2e] bg-white"
            >
              {LECTURE_DURATIONS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end pb-0.5">
            <button
              type="button"
              onClick={() => setIsVisible(v => !v)}
              className="flex items-center gap-2"
            >
              <span className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isVisible ? 'bg-green-500' : 'bg-gray-200'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isVisible ? 'translate-x-6' : 'translate-x-1'}`} />
              </span>
              <span className="text-sm font-medium text-gray-700">
                {isVisible ? '🟢 공개' : '⚫️ 비공개'}
              </span>
            </button>
          </div>
        </div>

        {/* 대상 */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">강연 대상</label>
          <input
            type="text"
            name="target"
            defaultValue={lecture.target}
            placeholder="예: 전 직원, 리더급, 신입사원"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1a1a2e]"
          />
        </div>
      </section>

      {/* ── 썸네일 ── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
        <h2 className="text-base font-semibold text-[#1a1a2e]">썸네일 이미지</h2>
        {thumbnailUrl && (
          <div className="relative w-full max-w-xs aspect-video bg-gray-100 rounded-xl overflow-hidden">
            <Image src={thumbnailUrl} alt="썸네일" fill style={{ objectFit: 'cover' }} sizes="320px" />
          </div>
        )}
        <div className="flex items-center gap-3 flex-wrap">
          <label className="cursor-pointer text-xs font-medium text-[#1a1a2e] border border-[#1a1a2e] px-4 py-2 rounded-xl hover:bg-gray-50">
            {uploading ? '업로드 중...' : '이미지 선택'}
            <input type="file" accept="image/*" onChange={handleThumbnailUpload} className="hidden" disabled={uploading} />
          </label>
          {thumbnailUrl && (
            <button type="button" onClick={() => setThumbnailUrl('')} className="text-xs text-red-400 hover:text-red-600">
              이미지 제거
            </button>
          )}
          {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
        </div>
        <p className="text-xs text-gray-400">또는 URL 직접 입력:</p>
        <input
          type="text"
          value={thumbnailUrl}
          onChange={e => setThumbnailUrl(e.target.value)}
          placeholder="https://..."
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1a1a2e]"
        />
      </section>

      {/* ── 분야 ── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-[#1a1a2e] mb-3">강연 분야</h2>
        <div className="flex flex-wrap gap-2">
          {SPEAKER_FIELDS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => toggleField(f.value)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                fields.includes(f.value)
                  ? 'bg-[#1a1a2e] text-white border-[#1a1a2e]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── 강연 내용 ── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="text-base font-semibold text-[#1a1a2e]">{isLecture ? '강연 내용' : '콘텐츠 내용'}</h2>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            {isLecture ? '강연 요약' : '리드 문구 (선택)'}
          </label>
          <textarea
            name="summary"
            defaultValue={lecture.summary}
            rows={isLecture ? 5 : 3}
            placeholder={isLecture ? '강연의 핵심 내용을 요약해주세요' : '목록에서 표시될 짧은 소개 (선택사항)'}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1a1a2e] resize-none"
          />
        </div>

        {/* 본문 (에디토리얼 타입만) */}
        {!isLecture && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">본문</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={14}
              placeholder="매거진 본문을 입력하세요"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1a1a2e] resize-y"
            />
          </div>
        )}

        {isLecture && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">학습 목표 <span className="text-gray-400">(줄바꿈으로 구분)</span></label>
              <textarea
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                rows={3}
                placeholder={'목표 1\n목표 2\n목표 3'}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1a1a2e] resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">기대 효과 <span className="text-gray-400">(줄바꿈으로 구분)</span></label>
              <textarea
                value={effects}
                onChange={(e) => setEffects(e.target.value)}
                rows={3}
                placeholder={'효과 1\n효과 2\n효과 3'}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1a1a2e] resize-none"
              />
            </div>
          </>
        )}
      </section>

      {/* ── 강연 커리큘럼 (강연 커리큘럼 타입만) ── */}
      {isLecture && <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#1a1a2e]">강연 커리큘럼 <span className="text-xs text-gray-400 font-normal">(선택)</span></h2>
          <button
            type="button"
            onClick={addProgram}
            className="text-xs font-medium text-[#1a1a2e] border border-[#1a1a2e] px-3 py-1.5 rounded-lg hover:bg-gray-50"
          >
            + 항목 추가
          </button>
        </div>
        {program.length === 0 && (
          <p className="text-xs text-gray-400">등록된 커리큘럼이 없습니다.</p>
        )}
        {program.map((item, i) => (
          <div key={i} className="flex gap-2 items-start">
            <input
              type="text"
              value={item.time}
              onChange={e => updateProgram(i, 'time', e.target.value)}
              placeholder="09:00"
              className="w-20 shrink-0 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1a1a2e]"
            />
            <input
              type="text"
              value={item.content}
              onChange={e => updateProgram(i, 'content', e.target.value)}
              placeholder="강연 내용 또는 활동"
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1a1a2e]"
            />
            <button
              type="button"
              onClick={() => removeProgram(i)}
              className="mt-1 text-gray-300 hover:text-red-400 text-lg leading-none px-1"
            >×</button>
          </div>
        ))}
      </section>}

      {/* ── 에러 / 버튼 ── */}
      {state.error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-xl p-3">{state.error}</p>
      )}

      <div className="flex items-center gap-3 pb-8">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 py-2.5 bg-[#1a1a2e] text-white text-sm font-semibold rounded-xl hover:bg-[#16213e] disabled:opacity-50 transition-colors"
        >
          {pending ? '저장 중...' : '저장하기'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/mong-bab/lectures')}
          className="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
        >
          취소
        </button>
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
