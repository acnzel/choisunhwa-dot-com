'use client'

import { useActionState } from 'react'
import { submitSpeakerRegistration } from '@/app/actions/inquiry'
import { SPEAKER_FIELDS } from '@/constants'

const initialState = { error: '' }

export default function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      try {
        await submitSpeakerRegistration(formData)
        return { error: '' }
      } catch (e) {
        return { error: e instanceof Error ? e.message : '오류가 발생했습니다.' }
      }
    },
    initialState
  )

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">강사 이름 *</label>
          <input
            type="text"
            name="name"
            required
            placeholder="홍길동"
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a1a2e] bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">연락처 *</label>
          <input
            type="tel"
            name="phone"
            required
            placeholder="010-0000-0000"
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a1a2e] bg-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">이메일 *</label>
          <input
            type="email"
            name="email"
            required
            placeholder="example@email.com"
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a1a2e] bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">소속 / 직함 *</label>
          <input
            type="text"
            name="company"
            required
            placeholder="예: 삼성전자 부사장"
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a1a2e] bg-white"
          />
        </div>
      </div>

      {/* 주요 강연 분야 */}
      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 mb-2">
          주요 강연 분야 <span className="text-gray-400 font-normal">(최대 3개)</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {SPEAKER_FIELDS.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                name="fields"
                value={value}
                className="accent-[#1a1a2e]"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* 보유 강연 주제 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">보유 강연 주제 *</label>
        <textarea
          name="lecture_topics"
          required
          rows={3}
          placeholder="예: 리더십의 재정의, 조직문화 혁신, MZ세대와의 소통..."
          className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a1a2e] bg-white resize-none"
        />
      </div>

      {/* 주요 강연 이력 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          주요 강연 이력 <span className="text-gray-400 font-normal">(선택)</span>
        </label>
        <textarea
          name="lecture_history"
          rows={3}
          placeholder="예: 삼성전자 임원 특강 (2024), 현대차 리더십 워크샵 (2023)..."
          className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a1a2e] bg-white resize-none"
        />
      </div>

      {/* 개인정보 동의 */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" name="privacy_agree" required className="mt-0.5 accent-[#1a1a2e]" />
          <p className="text-xs text-gray-600 leading-relaxed">
            <strong className="text-gray-800">개인정보 수집 및 이용 동의 (필수)</strong>
            <br />
            수집 항목: 이름, 이메일, 연락처, 소속. 이용 목적: 강사 등록 검토 및 연락.
            보유 기간: 처리 완료 후 1년.
          </p>
        </label>
      </div>

      {state.error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-xl p-3">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-3 bg-[#1a1a2e] text-white text-sm font-semibold rounded-xl hover:bg-[#16213e] disabled:opacity-50 transition-colors"
      >
        {pending ? '제출 중...' : '강사 등록 문의하기'}
      </button>
    </form>
  )
}
